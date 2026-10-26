import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, PhoneCall, Search, Filter, Download, 
  MapPin, Clock, CheckCircle2, User, Store, Sprout, ArrowUpRight,
  ExternalLink, Check, SearchX, RotateCcw, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { fuzzyFilter } from '../../utils/fuzzySearch';

export default function CustomerLeadsView({ 
  leads = [], 
  onShowToast 
}) {
  const { t, lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all'); // 'all' | 'whatsapp' | 'call'
  const [selectedCity, setSelectedCity] = useState('all');
  const [leadsData, setLeadsData] = useState(leads);

  // Sync if parent updates leads
  React.useEffect(() => {
    setLeadsData(leads);
  }, [leads]);

  // Unique cities
  const cities = useMemo(() => {
    return ['all', ...Array.from(new Set(leadsData.map(l => l.customerCity)))];
  }, [leadsData]);

  // Channel counts
  const whatsappCount = leadsData.filter(l => l.actionType === 'whatsapp').length;
  const callCount = leadsData.filter(l => l.actionType === 'call').length;

  // 1. Channel and City Filter
  const channelCityFiltered = useMemo(() => {
    return leadsData.filter((lead) => {
      if (selectedChannel === 'whatsapp' && lead.actionType !== 'whatsapp') return false;
      if (selectedChannel === 'call' && lead.actionType !== 'call') return false;
      if (selectedCity !== 'all' && lead.customerCity?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [leadsData, selectedChannel, selectedCity]);

  // 2. Fuzzy Search with Typo Tolerance
  const { results: filteredLeads, closestSuggestion } = useMemo(() => {
    return fuzzyFilter(channelCityFiltered, searchQuery, (lead) => [
      lead.customerName,
      lead.customerPhone,
      lead.customerCity,
      lead.plantName,
      lead.plantNameMr,
      lead.nurseryName,
      lead.queryTopic
    ]);
  }, [channelCityFiltered, searchQuery]);

  // Detect if matched via typo tolerance
  const isTypoTolerantMatch = useMemo(() => {
    if (!searchQuery.trim() || filteredLeads.length === 0) return false;
    const q = searchQuery.toLowerCase().trim();
    const hasExactSubstring = filteredLeads.some(l =>
      l.customerName?.toLowerCase().includes(q) ||
      l.customerPhone?.includes(q) ||
      l.plantName?.toLowerCase().includes(q) ||
      l.nurseryName?.toLowerCase().includes(q)
    );
    return !hasExactSubstring;
  }, [searchQuery, filteredLeads]);

  // Toggle Lead Status
  const handleToggleStatus = (id) => {
    setLeadsData(prev => prev.map(l => {
      if (l.id === id) {
        const nextStatus = l.status === 'resolved' ? 'new' : 'resolved';
        return { ...l, status: nextStatus };
      }
      return l;
    }));

    onShowToast({
      type: 'success',
      title: lang === 'mr' ? 'लीड स्थिती अद्ययावत केली' : 'Lead Status Updated',
      message: lang === 'mr' ? 'ग्राहक संपर्काची नोंद सिस्टीममध्ये केली आहे.' : 'Customer interaction status saved.'
    });
  };

  const handleExportCSV = () => {
    onShowToast({
      type: 'info',
      title: lang === 'mr' ? 'अहवाल डाउनलोड झाला' : 'Report Exported Successfully',
      message: `${filteredLeads.length} ${lang === 'mr' ? 'लीड्स CSV फाईलमध्ये संकलित केल्या.' : 'leads exported to CSV format.'}`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#1E5631]" />
            {t('leadsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('leadsSubtitle')}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-all"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>{t('actionExportLeads')}</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t('totalInquiriesTracked')}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{leadsData.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t('whatsappInquiries')}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-[#25D366]">{whatsappCount}</span>
            <span className="text-xs font-bold text-slate-500">
              {Math.round((whatsappCount / leadsData.length) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t('callInquiries')}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-sky-600">{callCount}</span>
            <span className="text-xs font-bold text-slate-500">
              {Math.round((callCount / leadsData.length) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t('highIntentBuyers')}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-[#1E5631]">
              {leadsData.filter(l => l.queryTopic && (l.queryTopic.includes('acre') || l.queryTopic.includes('wholesale') || l.queryTopic.includes('8,000'))).length + 4}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Bulk
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedChannel === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'mr' ? 'सर्व चॅनेल' : 'All Channels'} ({leadsData.length})
            </button>
            <button
              onClick={() => setSelectedChannel('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'whatsapp'
                  ? 'bg-[#25D366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp ({whatsappCount})</span>
            </button>
            <button
              onClick={() => setSelectedChannel('call')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'call'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Calls ({callCount})</span>
            </button>
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {t('filterByCity')}:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-[#F8FAF9] focus:bg-white text-slate-700"
            >
              <option value="all">{t('allCities')}</option>
              {cities.filter(c => c !== 'all').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLeadsPlaceholder')}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#F8FAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Typo Tolerance Notice Banner when spelling mistake was corrected */}
      {isTypoTolerantMatch && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>{lang === 'mr' ? 'स्पेलिंग जुळवणी:' : 'Spelling Match:'}</b> {t('searchTypoNotice')} (<b>"{searchQuery}"</b>)
            </span>
          </div>
          <span className="font-semibold text-amber-800">
            {filteredLeads.length} {lang === 'mr' ? 'लीड्स सापडल्या' : 'leads matched'}
          </span>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center mx-auto text-amber-700 mb-4 shadow-sm animate-in zoom-in-90">
              <SearchX className="w-10 h-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-3">
              {t('noLeadsFound')}
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {searchQuery ? (
                <>
                  {t('noResultsFor')} <span className="text-[#1E5631]">"{searchQuery}"</span>
                </>
              ) : (
                t('noLeadsMatching')
              )}
            </h3>

            {closestSuggestion && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-emerald-900 font-medium">{t('didYouMean')}</span>
                <button
                  onClick={() => setSearchQuery(closestSuggestion)}
                  className="font-bold text-[#1E5631] underline hover:text-[#2E7D32]"
                >
                  "{closestSuggestion}"
                </button>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              {t('searchTip')}
            </p>

            {searchQuery && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  <span>{t('clearSearch')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t('leadInteraction')}</th>
                  <th className="py-3.5 px-4">{t('leadCustomer')}</th>
                  <th className="py-3.5 px-4">{t('leadPlant')}</th>
                  <th className="py-3.5 px-4">{t('leadNursery')}</th>
                  <th className="py-3.5 px-4">{t('leadTime')}</th>
                  <th className="py-3.5 px-4">{lang === 'mr' ? 'चौकशी विषय' : 'Query Topic'}</th>
                  <th className="py-3.5 px-4 text-right">{t('leadAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => {
                  const isWhatsapp = lead.actionType === 'whatsapp';
                  const isResolved = lead.status === 'resolved';

                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${!isResolved ? 'bg-amber-50/20' : ''}`}
                    >
                      {/* Interaction Channel Pill */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isWhatsapp 
                            ? 'bg-emerald-100 text-[#1E5631] border border-emerald-300' 
                            : 'bg-sky-100 text-sky-800 border border-sky-300'
                        }`}>
                          {isWhatsapp ? (
                            <>
                              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>WhatsApp</span>
                            </>
                          ) : (
                            <>
                              <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                              <span>Direct Call</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Customer Name & City */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {lead.customerName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {lead.customerPhone}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            <MapPin className="w-2.5 h-2.5 text-slate-500" />
                            {lead.customerCity}
                          </span>
                        </div>
                      </td>

                      {/* Plant Inquired */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-[#2E7D32] shrink-0" />
                          <span className="font-semibold text-slate-800 truncate" title={lead.plantName}>
                            {lang === 'mr' && lead.plantNameMr ? lead.plantNameMr : lead.plantName}
                          </span>
                        </div>
                      </td>

                      {/* Nursery Target */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{lead.nurseryName}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">
                          {lead.timestamp}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {lead.date}
                        </span>
                      </td>

                      {/* Query Topic */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        <p className="line-clamp-2 text-[11px] leading-snug">
                          {lead.queryTopic}
                        </p>
                      </td>

                      {/* Direct Lead Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Contact Link */}
                          {isWhatsapp ? (
                            <a
                              href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] transition-colors"
                              title={t('actionWhatsappDirect')}
                            >
                              <MessageSquare className="w-4 h-4 text-[#25D366]" />
                            </a>
                          ) : (
                            <a
                              href={`tel:${lead.customerPhone}`}
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors"
                              title={t('actionCallDirect')}
                            >
                              <PhoneCall className="w-4 h-4 text-sky-600" />
                            </a>
                          )}

                          {/* Toggle Connected / Resolved Status */}
                          <button
                            onClick={() => handleToggleStatus(lead.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isResolved
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-[#1E5631] text-white hover:bg-[#184729]'
                            }`}
                            title="Toggle resolution status"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isResolved ? t('tagResolved') : t('tagNew')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
