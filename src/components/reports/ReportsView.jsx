import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Download, Printer, Store, 
  IndianRupee, MessageSquare, CheckCircle2, 
  Leaf, ShieldCheck, Sprout, Phone, MapPin, 
  Clock, Search, MessageCircle, AlertCircle, 
  Check, X, FileSpreadsheet
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
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all'); // 'all', 'New', 'Contacted', 'Converted'

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

  // Filter inquiries by date range and search/status
  const filteredInquiries = useMemo(() => {
    let list = inquiries;
    if (dateFilter !== 'all') {
      const now = new Date();
      list = list.filter(i => {
        const dateStr = i.date || i.timestamp;
        if (!dateStr) return true;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return true;
        if (dateFilter === 'today') return d.toDateString() === now.toDateString();
        if (dateFilter === 'week') {
          const diffDays = (now - d) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }
        if (dateFilter === 'month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    if (inquiryStatusFilter !== 'all') {
      list = list.filter(i => (i.status || 'New').toLowerCase() === inquiryStatusFilter.toLowerCase());
    }

    if (inquirySearch.trim()) {
      const q = inquirySearch.toLowerCase().trim();
      list = list.filter(i => 
        (i.plantName || '').toLowerCase().includes(q) ||
        (i.plantOrNursery || '').toLowerCase().includes(q) ||
        (i.customerName || '').toLowerCase().includes(q) ||
        (i.customerPhone || '').toLowerCase().includes(q) ||
        (i.customerCity || '').toLowerCase().includes(q) ||
        (i.nurseryName || '').toLowerCase().includes(q) ||
        (i.notes || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [inquiries, dateFilter, inquiryStatusFilter, inquirySearch]);

  const inquiryCounts = useMemo(() => {
    return {
      total: inquiries.length,
      filtered: filteredInquiries.length,
      new: inquiries.filter(i => (i.status || 'New').toLowerCase() === 'new').length,
      contacted: inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted').length,
      converted: inquiries.filter(i => (i.status || '').toLowerCase() === 'converted').length,
      whatsapp: inquiries.filter(i => (i.inquiryType || '').toLowerCase() === 'whatsapp').length,
      call: inquiries.filter(i => (i.inquiryType || '').toLowerCase() === 'call').length,
    };
  }, [inquiries, filteredInquiries]);

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

  // Functional Inquiries CSV Export
  const handleExportInquiriesCsv = () => {
    const headers = ['Inquiry ID', 'Date & Time', 'Plant Name', 'Plant Category', 'Customer Name', 'Phone', 'City', 'Target Nursery', 'Inquiry Mode', 'Customer Notes', 'Status'];
    const rows = filteredInquiries.map(i => {
      const matched = plants.find(p => 
        (i.plantName && p.nameEn && i.plantName.toLowerCase().includes(p.nameEn.toLowerCase())) ||
        (i.plantName && p.nameMr && i.plantName.includes(p.nameMr))
      );
      return [
        `"${i.id || ''}"`,
        `"${i.timestamp || i.date || ''}"`,
        `"${(i.plantName || i.plantOrNursery || '').replace(/"/g, '""')}"`,
        `"${matched?.category || ''}"`,
        `"${(i.customerName || '').replace(/"/g, '""')}"`,
        `"${i.customerPhone || ''}"`,
        `"${i.customerCity || ''}"`,
        `"${(i.nurseryName || '').replace(/"/g, '""')}"`,
        `"${i.inquiryType || 'WhatsApp'}"`,
        `"${(i.notes || '').replace(/"/g, '""')}"`,
        `"${i.status || 'New'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TreeBazzar_Plant_Inquiries_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
          SECTION 2: Detailed Plant Inquiries Report (वनस्पती चौकशी संपूर्ण तपशील अहवाल)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print:border-slate-300 print:shadow-none print-avoid-break">
        
        {/* Table Header Strip & Inquiries Search/Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 to-white flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-white print:p-2">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {lang === 'mr' ? 'वनस्पती ग्राहक चौकशी संपूर्ण तपशील अहवाल' : 'Plant Inquiries & Customer Demand Detailed Report'}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1E5631]">
                    {filteredInquiries.length} {lang === 'mr' ? 'नोंदी' : 'records'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'mr' 
                    ? 'ग्राहकांकडून आलेल्या सर्व रोपांच्या चौकशी, मागणी, थेट संपर्क आणि पाठपुरावा सद्यस्थिती' 
                    : 'Complete audit log of customer plant inquiries, varieties requested, direct contacts, and status'}
                </p>
              </div>
            </div>
          </div>

          {/* Search, Filter & CSV Export Controls (Screen Only) */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={lang === 'mr' ? 'रोप, ग्राहक किंवा फोन शोधा...' : 'Search plant, customer, phone...'}
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2E7D32]"
              />
              {inquirySearch && (
                <button
                  onClick={() => setInquirySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              {[
                { id: 'all', label: lang === 'mr' ? 'सर्व' : 'All' },
                { id: 'New', label: lang === 'mr' ? 'नवीन' : 'New' },
                { id: 'Contacted', label: lang === 'mr' ? 'संपर्क केला' : 'Contacted' },
                { id: 'Converted', label: lang === 'mr' ? 'ऑर्डर झाली' : 'Converted' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setInquiryStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    inquiryStatusFilter.toLowerCase() === tab.id.toLowerCase()
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inquiries CSV Export Button */}
            <button
              onClick={handleExportInquiriesCsv}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Download Plant Inquiries Spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="hidden sm:inline">{lang === 'mr' ? 'चौकशी CSV' : 'Export Inquiries CSV'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip inside the section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50/70 border-b border-slate-100 text-xs print:bg-slate-100">
          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'mr' ? 'एकूण चौकशी' : 'Total Inquiries'}</span>
            <p className="text-base font-black text-slate-900">{inquiryCounts.total}</p>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">WhatsApp</span>
            <p className="text-base font-black text-emerald-800">{inquiryCounts.whatsapp}</p>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-[10px] font-bold text-blue-600 uppercase">{lang === 'mr' ? 'फोन कॉल्स' : 'Direct Calls'}</span>
            <p className="text-base font-black text-blue-800">{inquiryCounts.call}</p>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-[10px] font-bold text-purple-600 uppercase">{lang === 'mr' ? 'ऑर्डर रूपांतरित' : 'Converted Leads'}</span>
            <p className="text-base font-black text-purple-800">{inquiryCounts.converted}</p>
          </div>
        </div>

        {/* Detailed Inquiries Table */}
        <div className="overflow-x-auto">
          {filteredInquiries.length > 0 ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-3.5 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">{lang === 'mr' ? 'तारीख व वेळ' : 'Date & Time'}</th>
                  <th className="py-2.5 px-3">{lang === 'mr' ? 'रोपाचे नाव व वर्गवारी (Plant Variety)' : 'Plant Variety & Category'}</th>
                  <th className="py-2.5 px-3">{lang === 'mr' ? 'ग्राहक व संपर्क क्रमांक' : 'Customer & Phone'}</th>
                  <th className="py-2.5 px-3">{lang === 'mr' ? 'शहर / ठिकाण' : 'City Hub'}</th>
                  <th className="py-2.5 px-3">{lang === 'mr' ? 'रोपवाटिका पुरवठादार' : 'Nursery Partner'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'mr' ? 'माध्यम' : 'Channel'}</th>
                  <th className="py-2.5 px-3">{lang === 'mr' ? 'चौकशी संदेश / आवश्यकता' : 'Customer Message / Requirement'}</th>
                  <th className="py-2.5 px-3.5 text-center">{lang === 'mr' ? 'सद्यस्थिती' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {filteredInquiries.map((inq, idx) => {
                  const matchedPlant = plants.find(p => 
                    (inq.plantName && p.nameEn && inq.plantName.toLowerCase().includes(p.nameEn.toLowerCase())) ||
                    (inq.plantName && p.nameMr && inq.plantName.includes(p.nameMr))
                  );
                  const plantImg = matchedPlant?.photoUrl || matchedPlant?.image;
                  const plantName = inq.plantName || inq.plantOrNursery || 'Plant Variety';
                  const isWhatsApp = (inq.inquiryType || '').toLowerCase() === 'whatsapp';
                  const isCall = (inq.inquiryType || '').toLowerCase() === 'call';

                  return (
                    <tr key={inq.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0 print:hidden" />
                          <span className="font-mono text-[11px]">
                            {inq.timestamp || inq.date || 'Recent'}
                          </span>
                        </div>
                      </td>

                      {/* Plant Variety & Category */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-[180px]">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center">
                            {plantImg ? (
                              <img 
                                src={plantImg} 
                                alt={plantName} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <Sprout className="w-4 h-4 text-[#2E7D32]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-snug">
                              {plantName}
                            </p>
                            {matchedPlant?.nameMr && lang === 'mr' && (
                              <p className="text-[10px] text-emerald-800 font-semibold leading-tight">
                                {matchedPlant.nameMr}
                              </p>
                            )}
                            {matchedPlant?.category && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-[#1E5631] border border-emerald-200/60">
                                {lang === 'mr' && matchedPlant.categoryMr ? matchedPlant.categoryMr : matchedPlant.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3 px-3 min-w-[150px]">
                        <p className="font-bold text-slate-900 leading-tight">
                          {inq.customerName || (lang === 'mr' ? 'ग्राहक' : 'Customer')}
                        </p>
                        {inq.customerPhone ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a 
                              href={`tel:${inq.customerPhone}`}
                              className="font-mono text-[11px] text-slate-600 hover:text-[#1E5631] font-semibold flex items-center gap-1"
                            >
                              <Phone className="w-2.5 h-2.5 text-slate-400 print:hidden" />
                              <span>{inq.customerPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/91${inq.customerPhone.replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Message on WhatsApp"
                              className="p-0.5 text-emerald-600 hover:text-emerald-700 print:hidden"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* City Hub */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                          <MapPin className="w-3 h-3 text-[#2E7D32] print:hidden" />
                          <span>{inq.customerCity || (cities[0]?.nameEn || 'All India')}</span>
                        </span>
                      </td>

                      {/* Target Nursery */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block truncate max-w-[150px]" title={inq.nurseryName}>
                          {inq.nurseryName || (lang === 'mr' ? 'स्थानिक रोपवाटिका' : 'Local Nursery')}
                        </span>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isWhatsApp ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </span>
                        ) : isCall ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            <span>{inq.inquiryType || 'Web Form'}</span>
                          </span>
                        )}
                      </td>

                      {/* Message / Requirements */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={inq.notes}>
                          {inq.notes || (lang === 'mr' ? 'थेट रोपांची मागणी व चौकशी.' : 'Direct plant inquiry and pricing query.')}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {(inq.status || 'New').toLowerCase() === 'converted' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'ऑर्डर झाली' : 'Converted'}</span>
                          </span>
                        ) : (inq.status || '').toLowerCase() === 'contacted' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Phone className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'संपर्क केला' : 'Contacted'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'नवीन' : 'New'}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">
                {lang === 'mr' ? 'या कालावधीत कोणतीही वनस्पती चौकशी सापडली नाही' : 'No plant inquiries found for this period'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'mr' ? 'वेबसाईटवरून ग्राहकांनी रोपांची मागणी केल्यावर येथे सर्व तपशील दिसतील.' : 'Customer plant leads submitted from the website will automatically display here.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          SECTION 2: Official Report Verification & Sign-off Block (Print only / Document footer)
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
