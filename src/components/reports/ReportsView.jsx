import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Download, Printer, Store, Sprout, ShoppingBag, 
  IndianRupee, Users, MessageSquare, CheckCircle2, TrendingUp, 
  Calendar, MapPin 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportsView({ 
  orders = [], 
  nurseries = [], 
  plants = [], 
  customers = [], 
  inquiries = [], 
  cities = [] 
}) {
  const { lang, t } = useLanguage();
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'month', 'week', 'today'

  // Summary Metrics Calculation
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === 'confirmed'), [orders]);
  const dispatchedOrders = useMemo(() => orders.filter(o => o.status === 'dispatched'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'cancelled'), [orders]);

  // Nursery Performance aggregation
  const nurseryPerformance = useMemo(() => {
    return nurseries.map(n => {
      const nurseryOrders = orders.filter(o => o.nurseryId === n.id || o.nurseryName === n.name);
      const rev = nurseryOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

      return {
        id: n.id,
        name: n.name,
        city: n.city,
        ordersCount: nurseryOrders.length,
        deliveredCount: nurseryOrders.filter(o => o.status === 'delivered').length,
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [nurseries, orders]);

  // Top In-Demand Plants aggregation
  const plantStats = useMemo(() => {
    return plants.map(p => {
      const plantOrders = orders.filter(o => 
        (o.plantName || '').toLowerCase().includes((p.nameEn || '').toLowerCase())
      );
      const plantInquiries = inquiries.filter(i => 
        (i.plantName || i.plantOrNursery || '').toLowerCase().includes((p.nameEn || '').toLowerCase())
      );
      const ordersQty = plantOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);

      return {
        id: p.id,
        nameEn: p.nameEn,
        nameMr: p.nameMr,
        category: p.category,
        nurseryName: p.nurseryName,
        priceMin: p.priceMin || p.price,
        ordersQty,
        inquiriesCount: plantInquiries.length
      };
    }).sort((a, b) => (b.ordersQty + b.inquiriesCount) - (a.ordersQty + a.inquiriesCount)).slice(0, 5);
  }, [plants, orders, inquiries]);

  // Functional CSV Export
  const handleExportCsv = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'City', 'Plant Variety', 'Quantity', 'Nursery', 'Total Amount', 'Status', 'Payment Method'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.date || ''}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerCity || ''}"`,
      `"${(o.plantName || '').replace(/"/g, '""')}"`,
      o.quantity || 1,
      `"${(o.nurseryName || '').replace(/"/g, '""')}"`,
      o.totalAmount || 0,
      `"${o.status || ''}"`,
      `"${o.paymentMethod || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TreeBazzar_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Strip & Export / Print Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1E5631]" />
            {lang === 'mr' ? 'व्यवसाय अहवाल' : 'Business Reports & Analytics'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'mr' ? 'स्थानिक रोपवाटिका विक्री, ऑर्डर्स आणि ग्राहक मागणीचा सोपा अहवाल' : 'Simple, beginner-friendly summary of nursery sales, popular plants, and orders.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Export to CSV Button */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-[#2E7D32]" />
            <span>{lang === 'mr' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>

          {/* Print Report Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'mr' ? 'अहवाल प्रिंट करा' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'एकूण विक्री' : 'Total Sales'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E5631] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight block">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {orders.filter(o => o.status !== 'cancelled').length} {lang === 'mr' ? 'यशस्वी ऑर्डर्स' : 'valid orders'}
          </p>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'डिलिव्हर केलेल्या ऑर्डर्स' : 'Delivered Orders'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight block">
            {deliveredOrders.length} / {orders.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            {orders.length > 0 ? `${Math.round((deliveredOrders.length / orders.length) * 100)}% completion rate` : '0%'}
          </p>
        </div>

        {/* Card 3: Nurseries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'स्थानिक रोपवाटिका' : 'Partner Nurseries'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E5631] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight block">
            {nurseries.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            {cities.map(c => c.nameEn).join(', ')}
          </p>
        </div>

        {/* Card 4: Customer Inquiries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'ग्राहक चौकशी' : 'Total Enquiries'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight block">
            {inquiries.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            WhatsApp & direct phone calls
          </p>
        </div>

      </div>

      {/* 2-Column Section: Orders Status Breakdown & Most In-Demand Plants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Orders Breakdown by Status (Clear progress bars, zero confusing charts!) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {lang === 'mr' ? 'ऑर्डर स्थिती वर्गीकरण' : 'Order Status Breakdown'}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {orders.length} {lang === 'mr' ? 'एकूण ऑर्डर्स' : 'total'}
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: lang === 'mr' ? 'पोहोचवले (Delivered)' : 'Delivered', count: deliveredOrders.length, color: 'bg-emerald-600', textColor: 'text-emerald-800' },
              { label: lang === 'mr' ? 'पाठवले (Dispatched)' : 'Dispatched', count: dispatchedOrders.length, color: 'bg-indigo-600', textColor: 'text-indigo-800' },
              { label: lang === 'mr' ? 'निश्चित (Confirmed)' : 'Confirmed', count: confirmedOrders.length, color: 'bg-blue-600', textColor: 'text-blue-800' },
              { label: lang === 'mr' ? 'प्रलंबित (Pending Approval)' : 'Pending Approval', count: pendingOrders.length, color: 'bg-amber-500', textColor: 'text-amber-800' },
              { label: lang === 'mr' ? 'रद्द (Cancelled)' : 'Cancelled', count: cancelledOrders.length, color: 'bg-rose-500', textColor: 'text-rose-800' }
            ].map(item => {
              const pct = orders.length > 0 ? Math.round((item.count / orders.length) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most In-Demand Plants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {lang === 'mr' ? 'सर्वाधिक मागणी असलेली रोपे' : 'Top In-Demand Plants'}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {lang === 'mr' ? 'ऑर्डर्स व चौकशीनुसार' : 'By orders & leads'}
            </span>
          </div>

          <div className="space-y-2.5">
            {plantStats.map((plant, index) => (
              <div key={plant.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#1E5631] font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{plant.nameEn}</p>
                    <p className="text-[11px] text-slate-500">{plant.category} • {plant.nurseryName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-800 block">
                    {plant.ordersQty} {lang === 'mr' ? 'रोपे' : 'sold'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {plant.inquiriesCount} {lang === 'mr' ? 'चौकशी' : 'inquiries'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Nursery Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {lang === 'mr' ? 'स्थानिक रोपवाटिका विक्री कामगिरी' : 'Local Nursery Sales Performance'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'mr' ? 'प्रत्येक रोपवाटिकेचे ऑर्डर्स व उलाढाल' : 'Completed orders and fulfilled revenue generated per nursery partner'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{lang === 'mr' ? 'रोपवाटिका' : 'Nursery Name'}</th>
                <th className="py-3 px-4">{lang === 'mr' ? 'शहर / Hub' : 'City Hub'}</th>
                <th className="py-3 px-4 text-center">{lang === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders'}</th>
                <th className="py-3 px-4 text-center">{lang === 'mr' ? 'पूर्ण ऑर्डर्स' : 'Delivered'}</th>
                <th className="py-3 px-4 text-right">{lang === 'mr' ? 'विक्री मूल्य (Revenue)' : 'Revenue Fulfilled'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nurseryPerformance.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {n.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#2E7D32]" />
                      {n.city}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {n.ordersCount}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-800">
                    {n.deliveredCount}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{n.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
