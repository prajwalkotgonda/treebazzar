import React, { useState, useMemo } from 'react';
import { 
  Store, Search, Filter, CheckCircle2, XCircle, AlertCircle, 
  MapPin, Phone, MessageSquare, ExternalLink, Eye, Check, X, 
  ShieldCheck, Calendar, Sprout, LayoutGrid, ListFilter, Award, Building,
  SearchX, RotateCcw, Sparkles, Plus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_NURSERY_IMAGE } from '../../data/mockData';
import { fuzzyFilter } from '../../utils/fuzzySearch';
import AddNurseryModal from '../common/AddNurseryModal';

export default function NurseryManagementView({ 
  nurseries = [], 
  onApprove, 
  onOpenReject, 
  onViewDetails,
  onAddNursery,
  initialTab = 'all'
}) {
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab); // 'all', 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isAddNurseryOpen, setIsAddNurseryOpen] = useState(false);

  // Extract unique cities
  const cities = useMemo(() => {
    return ['all', ...Array.from(new Set(nurseries.map(n => n.city || n.district).filter(Boolean)))];
  }, [nurseries]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: nurseries.length,
      pending: nurseries.filter(n => n.status === 'pending').length,
      approved: nurseries.filter(n => n.status === 'approved').length,
      rejected: nurseries.filter(n => n.status === 'rejected').length,
    };
  }, [nurseries]);

  // 1. Tab and City Filter
  const tabCityFiltered = useMemo(() => {
    return nurseries.filter(n => {
      if (activeTab === 'pending' && n.status !== 'pending') return false;
      if (activeTab === 'approved' && n.status !== 'approved') return false;
      if (activeTab === 'rejected' && n.status !== 'rejected') return false;
      const nCity = (n.city || n.district || '').toLowerCase();
      if (selectedCity !== 'all' && nCity !== selectedCity.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [nurseries, activeTab, selectedCity]);

  // 2. Fuzzy Search with Typo Tolerance
  const { results: filteredNurseries, closestSuggestion } = useMemo(() => {
    return fuzzyFilter(tabCityFiltered, searchQuery, (n) => [
      n.name || n.nurseryName,
      n.nameMr,
      n.ownerName || n.owner,
      n.city || n.district,
      n.ownerPhone || n.phone,
      n.address,
      ...(n.specialties || n.facilities || []),
      ...(n.specialtiesMr || [])
    ]);
  }, [tabCityFiltered, searchQuery]);

  // Detect if matched via typo tolerance
  const isTypoTolerantMatch = useMemo(() => {
    if (!searchQuery.trim() || filteredNurseries.length === 0) return false;
    const q = searchQuery.toLowerCase().trim();
    const hasExactSubstring = filteredNurseries.some(n => 
      n.name?.toLowerCase().includes(q) ||
      n.nameMr?.includes(q) ||
      n.ownerName?.toLowerCase().includes(q) ||
      n.city?.toLowerCase().includes(q)
    );
    return !hasExactSubstring;
  }, [searchQuery, filteredNurseries]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-[#1E5631]" />
            {t('nurseryMgmtTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('nurseryMgmtSubtitle')}
          </p>
        </div>

        {/* Actions & View Toggle */}
        <div className="flex items-center gap-3">
          {/* Add Nursery Quick Button */}
          <button
            onClick={() => setIsAddNurseryOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'mr' ? 'नवीन रोपवाटिका जोडा' : 'Add Nursery'}</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-[#1E5631] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'mr' ? 'कार्ड' : 'Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-[#1E5631] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'mr' ? 'तक्ता' : 'Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Tab: All */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[#1E5631] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{t('tabAll')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {counts.all}
            </span>
          </button>

          {/* Tab: Pending */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
            }`}
          >
            <AlertCircle className={`w-3.5 h-3.5 ${activeTab === 'pending' ? 'text-slate-950' : 'text-amber-500'}`} />
            <span>{t('tabPending')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'pending' ? 'bg-slate-950 text-amber-300' : 'bg-rose-500 text-white animate-soft-pulse'
            }`}>
              {counts.pending}
            </span>
          </button>

          {/* Tab: Approved */}
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-[#1E5631]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'approved' ? 'text-emerald-300' : 'text-emerald-600'}`} />
            <span>{t('tabApproved')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'approved' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {counts.approved}
            </span>
          </button>

          {/* Tab: Rejected */}
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <XCircle className={`w-3.5 h-3.5 ${activeTab === 'rejected' ? 'text-white' : 'text-rose-500'}`} />
            <span>{t('tabRejected')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {counts.rejected}
            </span>
          </button>
        </div>

        {/* Quick counter */}
        <span className="text-xs text-slate-400 font-medium px-2">
          {t('totalRecords')}: <b className="text-slate-700">{filteredNurseries.length}</b>
        </span>
      </div>

      {/* Search & City Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchNurseryPlaceholder')}
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

        {/* City Filter Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#F8FAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all text-slate-700 capitalize"
          >
            <option value="all">{t('allCities')} ({cities.length - 1})</option>
            {cities.filter(c => c !== 'all').map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
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
            {filteredNurseries.length} {lang === 'mr' ? 'रोपवाटिका सापडल्या' : 'nurseries matched'}
          </span>
        </div>
      )}

      {/* Nursery Listing (Grid or Table) */}
      {filteredNurseries.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center mx-auto text-amber-700 mb-4 shadow-sm animate-in zoom-in-90">
            <SearchX className="w-10 h-10" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-3">
            {t('noNurseriesFound')}
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {searchQuery ? (
              <>
                {t('noResultsFor')} <span className="text-[#1E5631]">"{searchQuery}"</span>
              </>
            ) : (
              lang === 'mr' ? 'कोणतीही रोपवाटिका आढळली नाही' : 'No nurseries matched your filters'
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>{t('clearSearch')}</span>
              </button>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('all');
                setActiveTab('all');
              }}
              className="px-4 py-2.5 bg-[#1E5631] text-white rounded-xl text-xs font-bold hover:bg-[#184729] transition-all"
            >
              {lang === 'mr' ? 'सर्व फिल्टर रीसेट करा' : 'Reset All Filters'}
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNurseries.map((nursery) => {
            const isApproved = nursery.status === 'approved';
            const isPending = nursery.status === 'pending';
            const isRejected = nursery.status === 'rejected';

            const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : (nursery.name || nursery.nurseryName || 'Nursery');
            const specialties = lang === 'mr' && nursery.specialtiesMr ? nursery.specialtiesMr : (nursery.specialties || nursery.facilities || []);

            return (
              <div
                key={nursery.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
                  isPending 
                    ? 'border-amber-300 ring-2 ring-amber-400/30' 
                    : isRejected
                      ? 'border-rose-200 bg-rose-50/10'
                      : 'border-slate-200 hover:border-[#2E7D32]/50'
                }`}
              >
                {/* Card Top: Photo & Status */}
                <div className="relative h-40 bg-slate-800">
                  <img
                    src={nursery.image || FALLBACK_NURSERY_IMAGE}
                    alt={nursery.name}
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_NURSERY_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                  
                  {/* City Chip */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md flex items-center gap-1 border border-white/20">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {nursery.city || nursery.district || 'Maharashtra'}
                  </span>

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3">
                    {isApproved && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('statusApproved')}
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1 animate-soft-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('statusPending')}
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {t('statusRejected')}
                      </span>
                    )}
                  </div>

                  {/* Title and Rating on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div className="pr-2">
                      <h3 className="font-extrabold text-base leading-tight text-white line-clamp-1 drop-shadow-sm">
                        {nurseryName}
                      </h3>
                      <p className="text-[11px] text-emerald-200 font-medium">
                        {nursery.ownerName || nursery.owner}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-md text-amber-300 font-bold text-xs shrink-0">
                      ★ {nursery.rating || '4.8'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3.5 flex-1">
                  
                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">
                      {nursery.address || `${nursery.city || nursery.district || 'Maharashtra'}`}
                    </span>
                  </div>

                  {/* Contact Chips */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${nursery.ownerPhone || nursery.phone}`}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                      title={nursery.ownerPhone || nursery.phone}
                    >
                      <Phone className="w-3 h-3 text-[#1E5631]" />
                      <span className="truncate">{nursery.ownerPhone || nursery.phone || 'Phone'}</span>
                    </a>
                    <a
                      href={`https://wa.me/${nursery.whatsapp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 text-[#1E5631] transition-colors"
                      title={t('chatWhatsapp')}
                    >
                      <MessageSquare className="w-4 h-4 text-[#2E7D32]" />
                    </a>
                  </div>

                  {/* Specialties Tags */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {t('specialtiesTitle')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {specialties && specialties.slice(0, 3).map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[#1E5631] text-[11px] font-semibold truncate max-w-[170px]"
                        >
                          {spec}
                        </span>
                      ))}
                      {specialties && specialties.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                          +{specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rejection Note if Rejected */}
                  {isRejected && nursery.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                      <span className="font-bold block">{lang === 'mr' ? 'नाकारण्याचे कारण:' : 'Rejection Reason:'}</span>
                      {nursery.rejectionReason}
                    </div>
                  )}

                </div>

                {/* Card Action Buttons */}
                <div className="p-3.5 bg-[#F8FAF9] border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewDetails(nursery)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('btnViewDetails')}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Approve Action */}
                    {!isApproved && (
                      <button
                        onClick={() => onApprove(nursery.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1E5631] hover:bg-[#184729] text-white shadow-sm flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{t('btnApprove')}</span>
                      </button>
                    )}

                    {/* Reject Action */}
                    {!isRejected && (
                      <button
                        onClick={() => onOpenReject(nursery)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t('btnReject')}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{lang === 'mr' ? 'रोपवाटिका नाव' : 'Nursery Name'}</th>
                  <th className="py-3.5 px-4">{t('nurseryTableOwner')}</th>
                  <th className="py-3.5 px-4">{t('nurseryTableLocation')}</th>
                  <th className="py-3.5 px-4">{t('nurseryTableSpecialties')}</th>
                  <th className="py-3.5 px-4">{t('nurseryTableStatus')}</th>
                  <th className="py-3.5 px-4 text-right">{t('nurseryTableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredNurseries.map((nursery) => {
                  const isApproved = nursery.status === 'approved';
                  const isPending = nursery.status === 'pending';
                  const isRejected = nursery.status === 'rejected';

                  const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : (nursery.name || nursery.nurseryName || 'Nursery');
                  const specialties = lang === 'mr' && nursery.specialtiesMr ? nursery.specialtiesMr : (nursery.specialties || nursery.facilities || []);

                  return (
                    <tr 
                      key={nursery.id} 
                      className={`hover:bg-slate-50 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}
                    >
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={nursery.image || nursery.nurseryImages?.[0] || FALLBACK_NURSERY_IMAGE}
                            alt={nursery.name || nursery.nurseryName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_NURSERY_IMAGE;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{nurseryName}</p>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Est. {nursery.establishedYear || 2020}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner & Contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{nursery.ownerName || nursery.owner}</p>
                        <p className="text-[11px] text-slate-500">{nursery.ownerPhone || nursery.phone}</p>
                      </td>

                      {/* City & Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                          {nursery.city || nursery.district || 'Maharashtra'}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate" title={nursery.address}>
                          {nursery.address}
                        </p>
                      </td>

                      {/* Specialties */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {specialties && specialties.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t('statusApproved')}
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 animate-soft-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            {t('statusPending')}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            {t('statusRejected')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDetails(nursery)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title={t('btnViewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isApproved && (
                            <button
                              onClick={() => onApprove(nursery.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold"
                            >
                              {t('btnApprove')}
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => onOpenReject(nursery)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200"
                            >
                              {t('btnReject')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Nursery Modal */}
      <AddNurseryModal
        isOpen={isAddNurseryOpen}
        onClose={() => setIsAddNurseryOpen(false)}
        onAddNursery={(newNursery) => {
          if (onAddNursery) onAddNursery(newNursery);
        }}
      />

    </div>
  );
}
