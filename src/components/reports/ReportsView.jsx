import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Download, Printer, Store, Sprout, ShoppingBag, 
  IndianRupee, Users, MessageSquare, CheckCircle2, TrendingUp, 
  Calendar, MapPin, Leaf, ShieldCheck, Clock, FileText, Check, Award
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

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;
    const now = new Date();
    const filtered = orders.filter(o => {
      if (!o.date) return false;
      const orderDate = new Date(o.date);
      if (isNaN(orderDate.getTime())) return true;
      if (dateFilter === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (dateFilter === 'month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
    return filtered.length > 0 ? filtered : orders; // Graceful fallback
  }, [orders, dateFilter]);

  // Summary Metrics Calculation
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const deliveredOrders = useMemo(() => filteredOrders.filter(o => o.status === 'delivered'), [filteredOrders]);
  const pendingOrders = useMemo(() => filteredOrders.filter(o => o.status === 'pending'), [filteredOrders]);
  const confirmedOrders = useMemo(() => filteredOrders.filter(o => o.status === 'confirmed'), [filteredOrders]);
  const dispatchedOrders = useMemo(() => filteredOrders.filter(o => o.status === 'dispatched'), [filteredOrders]);
  const cancelledOrders = useMemo(() => filteredOrders.filter(o => o.status === 'cancelled'), [filteredOrders]);

  const completionRate = useMemo(() => {
    return filteredOrders.length > 0 ? Math.round((deliveredOrders.length / filteredOrders.length) * 100) : 0;
  }, [filteredOrders, deliveredOrders]);

  // Nursery Performance aggregation
  const nurseryPerformance = useMemo(() => {
    return nurseries.map(n => {
      const nurseryOrders = filteredOrders.filter(o => o.nurseryId === n.id || o.nurseryName === n.name);
      const rev = nurseryOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const delivered = nurseryOrders.filter(o => o.status === 'delivered').length;
      const fulfillmentPct = nurseryOrders.length > 0 ? Math.round((delivered / nurseryOrders.length) * 100) : 100;

      return {
        id: n.id,
        name: n.name,
        city: n.city || 'Sangli',
        ordersCount: nurseryOrders.length,
        deliveredCount: delivered,
        fulfillmentPct,
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue || b.ordersCount - a.ordersCount);
  }, [nurseries, filteredOrders]);

  // Top In-Demand Plants aggregation
  const plantStats = useMemo(() => {
    return plants.map(p => {
      const plantOrders = filteredOrders.filter(o => 
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
        category: p.category || 'Plant',
        nurseryName: p.nurseryName || 'Local Nursery',
        priceMin: p.priceMin || p.price || 50,
        ordersQty,
        inquiriesCount: plantInquiries.length
      };
    }).sort((a, b) => (b.ordersQty + b.inquiriesCount) - (a.ordersQty + a.inquiriesCount)).slice(0, 5);
  }, [plants, filteredOrders, inquiries]);

  // Order Status Breakdown Data Table
  const statusSummary = useMemo(() => {
    const list = [
      { 
        id: 'delivered', 
        label: lang === 'mr' ? 'पोहोचवले (Delivered)' : 'Delivered', 
        count: deliveredOrders.length,
        amount: deliveredOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
        dotColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      },
      { 
        id: 'dispatched', 
        label: lang === 'mr' ? 'मार्गस्थ (Dispatched)' : 'Dispatched', 
        count: dispatchedOrders.length,
        amount: dispatchedOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
        dotColor: 'bg-indigo-500',
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
      },
      { 
        id: 'confirmed', 
        label: lang === 'mr' ? 'निश्चित (Confirmed)' : 'Confirmed', 
        count: confirmedOrders.length,
        amount: confirmedOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
        dotColor: 'bg-blue-500',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200'
      },
      { 
        id: 'pending', 
        label: lang === 'mr' ? 'प्रलंबित (Pending)' : 'Pending Approval', 
        count: pendingOrders.length,
        amount: pendingOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
        dotColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
      },
      { 
        id: 'cancelled', 
        label: lang === 'mr' ? 'रद्द (Cancelled)' : 'Cancelled', 
        count: cancelledOrders.length,
        amount: cancelledOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
        dotColor: 'bg-rose-500',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200'
      }
    ];

    return list.map(item => ({
      ...item,
      pct: filteredOrders.length > 0 ? Math.round((item.count / filteredOrders.length) * 100) : 0
    }));
  }, [filteredOrders, deliveredOrders, dispatchedOrders, confirmedOrders, pendingOrders, cancelledOrders, lang]);

  // Functional CSV Export
  const handleExportCsv = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'City', 'Plant Variety', 'Quantity', 'Nursery', 'Total Amount (INR)', 'Status', 'Payment Method'];
    const rows = filteredOrders.map(o => [
      `"${o.id || ''}"`,
      `"${o.date || ''}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerCity || ''}"`,
      `"${(o.plantName || '').replace(/"/g, '""')}"`,
      o.quantity || 1,
      `"${(o.nurseryName || '').replace(/"/g, '""')}"`,
      o.totalAmount || 0,
      `"${o.status || ''}"`,
      `"${o.paymentMethod || 'COD'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TreeBazzar_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = ' '; // Clears document title so browser does not print URL or title in header
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Generation timestamp
  const reportTimestamp = useMemo(() => {
    const now = new Date();
    return now.toLocaleString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, [lang]);

  const reportId = useMemo(() => {
    const d = new Date();
    return `TB-REP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className="space-y-6 print:space-y-4 print:text-slate-900">
      
      {/* =========================================================================
          SCREEN-ONLY: Top Toolbar & Filter Bar
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E5631] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {lang === 'mr' ? 'व्यवसाय व विक्री अहवाल' : 'Business Reports & Analytics'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            {lang === 'mr' 
              ? 'स्थानिक रोपवाटिका, ऑर्डर्स आणि महसुलाचा सोपा व अधिकृत अहवाल' 
              : 'Official operational summary of local nursery sales, customer leads, and fulfilled orders.'}
          </p>
        </div>

        {/* Date Filter Pills + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-end">
          {/* Period Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: lang === 'mr' ? 'सर्व' : 'All Time' },
              { id: 'month', label: lang === 'mr' ? 'चालू महिना' : 'This Month' },
              { id: 'week', label: lang === 'mr' ? 'चालू आठवडा' : 'This Week' },
              { id: 'today', label: lang === 'mr' ? 'आज' : 'Today' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dateFilter === tab.id 
                    ? 'bg-white text-slate-900 font-bold shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-4 h-4 text-[#2E7D32]" />
            <span>{lang === 'mr' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'mr' ? 'अहवाल प्रिंट करा / PDF' : 'Print / PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINT & OFFICIAL LETTERHEAD: Appears at the very top of printed document
          ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs print:border-b-2 print:border-slate-800 print:rounded-none print:shadow-none print:p-0 print:pb-4 print-avoid-break">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Brand Letterhead */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] text-white flex items-center justify-center font-black shadow-md print:bg-[#1E5631] print:text-white shrink-0">
              <Leaf className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  TreeBazzar
                </h1>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E5631] border border-emerald-300 print:border-slate-400">
                  {lang === 'mr' ? 'अधिकृत अहवाल' : 'Official Report'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {lang === 'mr' 
                  ? 'संपूर्ण भारत वनस्पती बाजारपेठ' 
                  : 'All India Botanical Marketplace'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'mr' 
                  ? 'संपूर्ण भारत रोपवाटिका नेटवर्क' 
                  : 'All India Nursery Network'}
              </p>
            </div>
          </div>

          {/* Report Meta Card */}
          <div className="sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 print:bg-transparent print:p-0 print:border-0 text-xs space-y-0.5">
            <div className="font-mono text-[11px] text-slate-500 font-bold">
              {lang === 'mr' ? 'अहवाल क्र.:' : 'Report ID:'} <span className="text-slate-900 font-black">{reportId}</span>
            </div>
            <div className="text-[11px] text-slate-600">
              {lang === 'mr' ? 'तयार तारीख:' : 'Generated on:'} <span className="font-semibold text-slate-800">{reportTimestamp}</span>
            </div>
            <div className="text-[11px] text-slate-600">
              {lang === 'mr' ? 'कालावधी:' : 'Period:'} <span className="font-bold text-[#1E5631]">
                {dateFilter === 'all' && (lang === 'mr' ? 'सर्व नोंदी (All Time)' : 'All Time Records')}
                {dateFilter === 'month' && (lang === 'mr' ? 'चालू महिना' : 'Current Month')}
                {dateFilter === 'week' && (lang === 'mr' ? 'चालू आठवडा (७ दिवस)' : 'Last 7 Days')}
                {dateFilter === 'today' && (lang === 'mr' ? 'आजच्या नोंदी' : 'Today')}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-0.5">
              {lang === 'mr' ? 'अधिकृत व्यवस्थापक:' : 'Issued by:'} <span className="font-bold text-slate-700">Super Admin (TreeBazzar)</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 1: Executive KPI Summary (4 Clean Cards)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:gap-2.5 print-avoid-break">
        
        {/* KPI 1: Revenue */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'एकूण विक्री (महसूल)' : 'Total Revenue'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E5631] flex items-center justify-center print:hidden">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
            {filteredOrders.filter(o => o.status !== 'cancelled').length} {lang === 'mr' ? 'यशस्वी ऑर्डर्स' : 'valid orders'}
          </p>
        </div>

        {/* KPI 2: Completed Orders */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'पूर्ण ऑर्डर्स' : 'Delivered Orders'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center print:hidden">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
            {deliveredOrders.length} <span className="text-xs text-slate-500 font-semibold">/ {filteredOrders.length}</span>
          </span>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
            {completionRate}% {lang === 'mr' ? 'पूर्तता दर' : 'completion rate'}
          </p>
        </div>

        {/* KPI 3: Nurseries */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'नोंदणीकृत रोपवाटिका' : 'Partner Nurseries'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E5631] flex items-center justify-center print:hidden">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
            {nurseries.length}
          </span>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5 truncate">
            {cities.length > 0 ? cities.map(c => c.nameEn).join(', ') : 'All India'}
          </p>
        </div>

        {/* KPI 4: Customer Inquiries */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'mr' ? 'ग्राहक चौकशी (Leads)' : 'Customer Enquiries'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center print:hidden">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
            {inquiries.length}
          </span>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
            {lang === 'mr' ? 'WhatsApp व थेट संपर्क' : 'WhatsApp & Direct Leads'}
          </p>
        </div>

      </div>

      {/* =========================================================================
          SECTION 2: Order Status Breakdown (Clean Table instead of floating lines)
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border-slate-300 print:shadow-none print-avoid-break">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:bg-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1E5631]" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              {lang === 'mr' ? 'ऑर्डर स्थिती व उलाढाल वर्गीकरण' : 'Order Status & Revenue Breakdown'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {filteredOrders.length} {lang === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 print:border-slate-300">
              <tr>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'स्थिती (Order Status)' : 'Order Status'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'ऑर्डर्स संख्या' : 'Orders Count'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'टक्केवारी प्रमाण' : 'Share (%)'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'mr' ? 'एकूण रक्कम' : 'Total Value (₹)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {statusSummary.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                      <span>{item.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                    {item.count}
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <span>{item.pct}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block print:hidden">
                        <div className={`h-full ${item.dotColor}`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-black text-slate-900 font-mono">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 print:border-slate-300">
              <tr>
                <td className="py-2.5 px-4 text-slate-900 font-black">{lang === 'mr' ? 'एकूण (Total)' : 'Total'}</td>
                <td className="py-2.5 px-4 text-center text-slate-900 font-black">{filteredOrders.length}</td>
                <td className="py-2.5 px-4 text-center text-slate-700">100%</td>
                <td className="py-2.5 px-4 text-right text-slate-900 font-black font-mono">₹{totalRevenue.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: Local Nursery Sales Performance Table
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border-slate-300 print:shadow-none print-avoid-break">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:bg-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#1E5631]" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                {lang === 'mr' ? 'स्थानिक रोपवाटिका विक्री व कामगिरी' : 'Local Nursery Sales Performance'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'mr' ? 'प्रत्येक भागीदार रोपवाटिकेचे ऑर्डर्स, पूर्तता आणि उलाढाल' : 'Orders, deliveries, and verified sales revenue fulfilled per partner nursery'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {nurseryPerformance.length} {lang === 'mr' ? 'रोपवाटिका' : 'partners'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 print:border-slate-300">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'रोपवाटिका नाव' : 'Nursery Name'}</th>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'शहर / Hub' : 'City Hub'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'पूर्ण ऑर्डर्स' : 'Delivered'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'पूर्तता दर' : 'Fulfillment %'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'mr' ? 'विक्री महसूल' : 'Revenue Fulfilled'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {nurseryPerformance.map((n, idx) => (
                <tr key={n.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {n.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#2E7D32] print:hidden" />
                      <span>{n.city}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-800 font-mono">
                    {n.ordersCount}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-emerald-800 font-mono">
                    {n.deliveredCount}
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-slate-700">
                    {n.fulfillmentPct}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-black text-slate-900 font-mono">
                    ₹{n.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: Top In-Demand Plants
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border-slate-300 print:shadow-none print-avoid-break">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:bg-slate-100">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#1E5631]" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              {lang === 'mr' ? 'सर्वाधिक मागणी असलेली रोपे (Top In-Demand Plants)' : 'Top In-Demand Plant Varieties'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {lang === 'mr' ? 'ऑर्डर्स व चौकशीनुसार' : 'Ranked by customer orders & leads'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 print:border-slate-300">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'रोपाचे नाव' : 'Plant Variety'}</th>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'वर्गवारी' : 'Category'}</th>
                <th className="py-2.5 px-4">{lang === 'mr' ? 'रोपवाटिका' : 'Nursery Partner'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'विक्री नग' : 'Units Sold'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'mr' ? 'ग्राहक चौकशी' : 'Leads Received'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {plantStats.map((plant, idx) => (
                <tr key={plant.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 text-center font-bold text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {lang === 'mr' && plant.nameMr ? `${plant.nameEn} (${plant.nameMr})` : plant.nameEn}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {plant.category}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {plant.nurseryName}
                  </td>
                  <td className="py-2.5 px-4 text-center font-black text-emerald-800 font-mono">
                    {plant.ordersQty}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-700 font-mono">
                    {plant.inquiriesCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: Official Report Verification & Sign-off Block (Print only / Document footer)
          ========================================================================= */}
      <div className="pt-4 border-t-2 border-slate-300 print:block print-avoid-break">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          
          {/* Left: Disclaimer & System Note */}
          <div className="text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E5631]" />
              <span>{lang === 'mr' ? 'अधिकृत डिजिटल प्रणाली अहवाल' : 'System-Verified Digital Report'}</span>
            </div>
            <p className="leading-relaxed">
              {lang === 'mr' 
                ? 'टीप: हा व्यवसाय अहवाल TreeBazzar ॲडमिन प्लॅटफॉर्मद्वारे स्वयंचलित जनरेट झाला आहे. सर्व ऑर्डर्स आणि महसूल आकडेवारी अधिकृत डिजिटल डेटाबेसमधून पडताळलेली आहे.' 
                : 'Note: This executive performance report is digitally compiled from active TreeBazzar database records. All nursery listings, customer leads, and order transactions are platform-verified.'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              TreeBazzar Botanical Platform • TreeBazzar@gmail.com
            </p>
          </div>

          {/* Right: Signature & Seal Placeholder */}
          <div className="sm:text-right space-y-2">
            <div className="h-10 border-b border-dashed border-slate-400 w-48 sm:ml-auto print:border-slate-800" />
            <div className="text-xs font-black text-slate-900">
              {lang === 'mr' ? 'अधिकृत स्वाक्षरी व शिक्का' : 'Authorized Signatory & Seal'}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Super Admin • TreeBazzar Operations (All India)
            </div>
          </div>

        </div>

        {/* Print Confidentiality Strip */}
        <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
          {lang === 'mr' 
            ? 'गोपनीय व्यवसाय अहवाल • केवळ अंतर्गत वापरासाठी • TreeBazzar © २०२६' 
            : 'Confidential Business Document • For Internal Management Use Only • TreeBazzar © 2026'}
        </div>
      </div>

    </div>
  );
}
