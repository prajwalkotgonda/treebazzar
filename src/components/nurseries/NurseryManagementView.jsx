import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, Search, CheckCircle2, XCircle, AlertCircle, Eye, 
  Plus, Phone, MapPin, Calendar, Check, X, Edit2, Trash2, ShieldAlert, Loader2,
  RotateCcw, Ban, Clock, CalendarPlus, LayoutGrid, ChevronRight, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_TYPES, getBusinessType } from '../../data/businessTypes';
import NurseryDetailsModal from '../common/NurseryDetailsModal';
import RejectModal from '../common/RejectModal';
import AddNurseryModal from '../common/AddNurseryModal';
import EditNurseryModal from '../common/EditNurseryModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import RevokeConfirmModal from '../common/RevokeConfirmModal';
import SuspendConfirmModal from '../common/SuspendConfirmModal';

export default function NurseryManagementView({ 
  nurseries = [], 
  cities: citiesProp = [],
  plants = [],
  initialTab = 'all',
  initialBusinessType = 'all',
  onApprove, 
  onReject,
  onRevoke,
  onSuspend,
  onUnsuspend,
  onExtendTrial,
  onAddNursery,
  onUpdateNursery,
  onDeleteNursery,
  searchQuery = ''
}) {
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab); // 'all', 'pending', 'approved', 'suspended', 'rejected'
  const [selectedBusinessType, setSelectedBusinessType] = useState(initialBusinessType || 'all');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialBusinessType) setSelectedBusinessType(initialBusinessType);
  }, [initialBusinessType]);

  // Modals state
  const [detailsNursery, setDetailsNursery] = useState(null);
  const [rejectingNursery, setRejectingNursery] = useState(null);
  const [revokingNursery, setRevokingNursery] = useState(null);
  const [suspendingNursery, setSuspendingNursery] = useState(null);
  const [addNurseryOpen, setAddNurseryOpen] = useState(false);
  const [editingNursery, setEditingNursery] = useState(null);
  const [deletingNursery, setDeletingNursery] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleApproveWithFeedback = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      if (onApprove) await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnsuspendWithFeedback = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      if (onUnsuspend) await onUnsuspend(id);
    } finally {
      setProcessingId(null);
    }
  };

  // Tab counts
  const counts = useMemo(() => {
    const trialCount = nurseries.filter(n => n.isTrialActive && !n.isSuspended && n.status !== 'rejected').length;
    const expiredCount = nurseries.filter(n => 
      !n.isSuspended && 
      n.status !== 'rejected' && 
      n.status !== 'approved' && 
      (n.isTrialExpired || (n.status === 'pending' && !n.isTrialActive))
    ).length;
    const pendingCount = nurseries.filter(n => 
      !n.isSuspended && 
      n.status !== 'approved' && 
      n.status !== 'rejected' && 
      (n.isTrialExpired || n.status === 'pending' || n.status === 'revoked') &&
      !n.isTrialActive
    ).length;
    const approvedCount = nurseries.filter(n => n.status === 'approved' && !n.isSuspended).length;
    const suspendedCount = nurseries.filter(n => n.status === 'suspended' || (n.isSuspended && n.status !== 'rejected')).length;
    const rejectedCount = nurseries.filter(n => n.status === 'rejected').length;

    return {
      all: nurseries.length,
      trial: trialCount,
      expired: expiredCount,
      pending: pendingCount,
      approved: approvedCount,
      suspended: suspendedCount,
      rejected: rejectedCount
    };
  }, [nurseries]);

  // Nurseries with expired free trial (shown prominently at top)
  const expiredNurseries = useMemo(() => {
    return nurseries.filter(n => 
      !n.isSuspended && 
      n.status !== 'rejected' && 
      n.status !== 'approved' && 
      (n.isTrialExpired || (n.status === 'pending' && !n.isTrialActive))
    );
  }, [nurseries]);

  // Counts per 7 business types
  const businessTypeCounts = useMemo(() => {
    const map = { all: nurseries.length };
    BUSINESS_TYPES.forEach(bt => {
      map[bt.id] = 0;
    });
    nurseries.forEach(n => {
      const type = n.businessType || 'nursery_plants_producer';
      if (map[type] !== undefined) {
        map[type]++;
      } else {
        map['nursery_plants_producer'] = (map['nursery_plants_producer'] || 0) + 1;
      }
    });
    return map;
  }, [nurseries]);

  // Available cities dynamically extracted from actual nurseries + cities added in City Management
  const availableCities = useMemo(() => {
    const map = new Map();

    // 1. Cities added via City Management
    (citiesProp || []).forEach(c => {
      const nameEn = (c.nameEn || c.name || '').trim();
      const nameMr = (c.nameMr || '').trim();
      if (nameEn) {
        map.set(nameEn.toLowerCase(), {
          value: nameEn,
          label: lang === 'mr' && nameMr ? nameMr : nameEn,
          nameEn,
          nameMr
        });
      }
    });

    // 2. Cities from registered nurseries
    (nurseries || []).forEach(n => {
      const city = (n.city || '').trim();
      const cityMr = (n.cityMr || '').trim();
      if (city && !map.has(city.toLowerCase())) {
        map.set(city.toLowerCase(), {
          value: city,
          label: lang === 'mr' && cityMr ? cityMr : city,
          nameEn: city,
          nameMr: cityMr
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [nurseries, citiesProp, lang]);

  // Filtered nurseries (by status tab, city, and universal search matching nursery, product/plant, or city)
  const filteredNurseries = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return nurseries.filter(n => {
      // 1. Tab filter
      if (activeTab === 'trial') {
        if (!n.isTrialActive || n.isSuspended || n.status === 'rejected') return false;
      } else if (activeTab === 'expired') {
        if (n.isSuspended || n.status === 'rejected' || n.status === 'approved') return false;
        if (!n.isTrialExpired && n.status !== 'pending') return false;
      } else if (activeTab === 'pending') {
        if (n.isSuspended || n.status === 'approved' || n.status === 'rejected') return false;
        if (n.isTrialActive) return false;
        if (!(n.isTrialExpired || n.status === 'pending' || n.status === 'revoked')) return false;
      } else if (activeTab === 'approved') {
        if (n.status !== 'approved' || n.isSuspended) return false;
      } else if (activeTab === 'suspended') {
        if (n.status !== 'suspended' && !(n.isSuspended && n.status !== 'rejected')) return false;
      } else if (activeTab === 'rejected') {
        if (n.status !== 'rejected') return false;
      }

      // 2. Business Type Classification Filter (7 Types)
      if (selectedBusinessType !== 'all') {
        const nType = (n.businessType || 'nursery_plants_producer').toLowerCase();
        if (nType !== selectedBusinessType.toLowerCase()) return false;
      }

      // 3. City Dropdown Filter
      if (selectedCity !== 'all') {
        const sel = selectedCity.toLowerCase();
        const nCity = (n.city || '').toLowerCase();
        const nCityMr = (n.cityMr || '').toLowerCase();
        const nDist = (n.district || '').toLowerCase();

        const matchedCityObj = (citiesProp || []).find(c => 
          (c.nameEn || c.name || '').toLowerCase() === sel ||
          (c.nameMr || '').toLowerCase() === sel
        );
        const cEn = (matchedCityObj?.nameEn || matchedCityObj?.name || '').toLowerCase();
        const cMr = (matchedCityObj?.nameMr || '').toLowerCase();

        const matchesCity = nCity === sel || nCityMr === sel ||
          (cEn && (nCity === cEn || nDist === cEn)) ||
          (cMr && (nCity === cMr || nCityMr === cMr || nDist === cMr));

        if (!matchesCity) return false;
      }

      // 3. Search query: Match Nursery Name, Owner, Phone, City, OR any Product/Plant sold by nursery
      if (q) {
        // Generic nursery keyword search -> matches all nurseries in current tab/city
        const genericNurseryKeywords = ['nursery', 'nurseries', 'नर्सरी', 'रोपवाटिका', 'रोपवाटिकांची'];
        if (genericNurseryKeywords.some(k => q === k || q.includes(k))) {
          n._matchingProduct = null;
          return true;
        }

        // A) Direct nursery attributes (Name, Owner, City, District, Address, Phone)
        const nameEn = (n.name || n.nurseryName || '').toLowerCase();
        const nameMr = (n.nameMr || n.nurseryNameMr || '').toLowerCase();
        const owner = (n.ownerName || n.owner || '').toLowerCase();
        const city = (n.city || '').toLowerCase();
        const cityMr = (n.cityMr || '').toLowerCase();
        const district = (n.district || '').toLowerCase();
        const address = (n.address || '').toLowerCase();
        const phone = (n.phone || '').toLowerCase();
        const whatsapp = (n.whatsapp || '').toLowerCase();

        if (
          nameEn.includes(q) ||
          nameMr.includes(q) ||
          owner.includes(q) ||
          city.includes(q) ||
          cityMr.includes(q) ||
          district.includes(q) ||
          address.includes(q) ||
          phone.includes(q) ||
          whatsapp.includes(q)
        ) {
          n._matchingProduct = null;
          return true;
        }

        // B) City match via cities collection (handles Marathi & English city searches)
        const matchingCityObj = (citiesProp || []).find(c => {
          const cEn = (c.nameEn || c.name || '').toLowerCase();
          const cMr = (c.nameMr || '').toLowerCase();
          return cEn.includes(q) || cMr.includes(q) || q.includes(cEn) || (cMr && q.includes(cMr));
        });
        if (matchingCityObj) {
          const cEn = (matchingCityObj.nameEn || matchingCityObj.name || '').toLowerCase();
          const cMr = (matchingCityObj.nameMr || '').toLowerCase();
          if (
            city === cEn || 
            city === cMr || 
            cityMr === cMr || 
            district === cEn || 
            address.includes(cEn) || 
            (cMr && address.includes(cMr))
          ) {
            n._matchingProduct = null;
            return true;
          }
        }

        // C) Specialties / Plant products list of this nursery
        const specialties = Array.isArray(n.specialties) ? n.specialties : [];
        const matchedSpecialty = specialties.find(s => s.toLowerCase().includes(q));
        if (matchedSpecialty) {
          n._matchingProduct = matchedSpecialty;
          return true;
        }

        const facilities = Array.isArray(n.facilities) ? n.facilities : [];
        const matchedFacility = facilities.find(f => f.toLowerCase().includes(q));
        if (matchedFacility) {
          n._matchingProduct = matchedFacility;
          return true;
        }

        // D) Product / Plant varieties associated with this nursery
        if (plants && plants.length > 0) {
          const nurseryPlants = plants.filter(p => 
            p.nurseryId === n.id || 
            (p.nurseryName && (
              p.nurseryName.toLowerCase() === nameEn || 
              (nameMr && p.nurseryName.toLowerCase() === nameMr)
            ))
          );

          const matchedPlant = nurseryPlants.find(p => {
            const pEn = (p.nameEn || p.name || '').toLowerCase();
            const pMr = (p.nameMr || '').toLowerCase();
            const pBot = (p.botanicalName || '').toLowerCase();
            const pCat = (p.category || '').toLowerCase();
            const pCatMr = (p.categoryMr || '').toLowerCase();
            const pDesc = (p.descriptionEn || p.description || '').toLowerCase();
            const pDescMr = (p.descriptionMr || '').toLowerCase();
            return pEn.includes(q) || pMr.includes(q) || pBot.includes(q) || pCat.includes(q) || pCatMr.includes(q) || pDesc.includes(q) || pDescMr.includes(q);
          });

          if (matchedPlant) {
            n._matchingProduct = lang === 'mr' && matchedPlant.nameMr ? matchedPlant.nameMr : (matchedPlant.nameEn || matchedPlant.name);
            return true;
          }
        }

        return false;
      }

      n._matchingProduct = null;
      return true;
    }).sort((a, b) => {
      // Prioritize nurseries with expired free trial at the very top as requested
      const aExpired = !a.isSuspended && a.status !== 'rejected' && a.status !== 'approved' && (a.isTrialExpired || (a.status === 'pending' && !a.isTrialActive));
      const bExpired = !b.isSuspended && b.status !== 'rejected' && b.status !== 'approved' && (b.isTrialExpired || (b.status === 'pending' && !b.isTrialActive));
      if (aExpired && !bExpired) return -1;
      if (!aExpired && bExpired) return 1;
      return 0;
    });
  }, [nurseries, activeTab, selectedBusinessType, selectedCity, localSearch, searchQuery, plants, citiesProp, lang]);

  return (
    <div className="space-y-5">
      
      {/* Header Strip & Add Nursery */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-[#1E5631]" />
            {t('nurseryMgmtTitle') || 'Nursery Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'mr' ? 'स्थानिक रोपवाटिकांची नोंदणी, पडताळणी आणि व्यवस्थापन' : 'Review local partner nurseries, approve applications, and manage profiles.'}
          </p>
        </div>

        <button
          onClick={() => setAddNurseryOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? '+ नवीन रोपवाटिका जोडा' : '+ Add Nursery'}</span>
        </button>
      </div>

      {/* 7 Business Types Classification Filters Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1E5631] flex items-center justify-center">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {lang === 'mr' ? 'व्यवसाय वर्गवारी (७ प्रकार)' : 'All 7 Business Types'}
            </h3>
            {selectedBusinessType !== 'all' && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E5631]">
                {getBusinessType(selectedBusinessType)?.[lang === 'mr' ? 'titleMr' : 'titleEn']}
              </span>
            )}
          </div>
          {selectedBusinessType !== 'all' && (
            <button
              onClick={() => setSelectedBusinessType('all')}
              className="text-[11px] font-bold text-[#1E5631] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{lang === 'mr' ? 'सर्व दाखवा (Reset)' : 'Show All Types'}</span>
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 7 Business Types Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedBusinessType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedBusinessType === 'all'
                ? 'bg-[#1E5631] text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <span>{lang === 'mr' ? 'सर्व ७ व्यवसाय' : 'All 7 Types'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              selectedBusinessType === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {nurseries.length}
            </span>
          </button>

          {BUSINESS_TYPES.map(bt => {
            const count = businessTypeCounts[bt.id] || 0;
            const isSelected = selectedBusinessType === bt.id;
            const title = lang === 'mr' ? bt.titleMr : bt.titleEn;

            return (
              <button
                key={bt.id}
                onClick={() => setSelectedBusinessType(bt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#1E5631] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
                title={lang === 'mr' ? bt.subtitleMr : bt.subtitleEn}
              >
                <span>{bt.emoji}</span>
                <span>{title}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expired Free Trial Priority Alert Section */}
      {expiredNurseries.length > 0 && (
        <div className="bg-linear-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300/80 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                    <span>{lang === 'mr' ? '⚠️ फ्री ट्रायल संपलेल्या रोपवाटिका (मुदत संपली आहे)' : '⚠️ Free Trial Expired Nurseries'}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse">
                    {expiredNurseries.length}
                  </span>
                </div>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  {lang === 'mr' 
                    ? 'या रोपवाटिकांचा मोफत ट्रायल संपला आहे. सबस्क्रिप्शन प्लॅन मंजूर करा किंवा +३ दिवस मुदतवाढ द्या.' 
                    : 'Free trial has ended for these nurseries. Approve their paid subscription or grant a +3 days extension.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'expired' ? 'all' : 'expired')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs ${
                activeTab === 'expired'
                  ? 'bg-rose-700 text-white'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
              }`}
            >
              <span>{activeTab === 'expired' ? (lang === 'mr' ? 'सर्व दाखवा' : 'Show All') : (lang === 'mr' ? 'फिल्टर करा (याच पाहा)' : 'Filter Expired Only')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Cards for Expired Nurseries at Top */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {expiredNurseries.slice(0, 6).map(n => (
              <div key={n.id} className="bg-white rounded-xl p-3 border border-rose-200/90 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {lang === 'mr' && n.nameMr ? n.nameMr : (n.name || n.nurseryName)}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {n.ownerName || n.owner} • {n.city || '-'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      <Clock className="w-3 h-3 text-rose-600" />
                      {lang === 'mr' ? 'फ्री ट्रायल संपले' : 'Trial Expired'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {n.phone || n.contactPhone}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApproveWithFeedback(n.id)}
                    disabled={processingId === n.id}
                    title={lang === 'mr' ? 'सबस्क्रिप्शन प्लॅन मंजूर करा' : 'Approve Plan'}
                    className="px-2.5 py-1 bg-[#1E5631] hover:bg-[#2E7D32] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>{lang === 'mr' ? 'मंजूर' : 'Approve'}</span>
                  </button>
                  {(Number(n.trialExtensionsCount) || 0) < 2 && (
                    <button
                      onClick={() => onExtendTrial && onExtendTrial(n.id)}
                      disabled={processingId === n.id}
                      title={lang === 'mr' ? '३ दिवस मोफत वाढवा' : 'Extend +3 Days'}
                      className="px-2 py-0.8 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <CalendarPlus className="w-3 h-3 text-blue-600" />
                      <span>{lang === 'mr' ? '+३ दिवस' : '+3 Days'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Tab Strip */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: lang === 'mr' ? 'सर्व रोपवाटिका' : 'All Nurseries', count: counts.all },
            { id: 'trial', label: lang === 'mr' ? '⏱️ फ्री ट्रायल (ऑटो-मंजूर)' : '⏱️ Free Trial (Auto-Approved)', count: counts.trial },
            { id: 'expired', label: lang === 'mr' ? '⚠️ फ्री ट्रायल संपलेले' : '⚠️ Free Trial Expired', count: counts.expired, alert: counts.expired > 0 },
            { id: 'approved', label: lang === 'mr' ? 'मंजूर (Paid Plan)' : 'Approved (Paid Plan)', count: counts.approved },
            { id: 'suspended', label: lang === 'mr' ? 'निलंबित' : 'Suspended', count: counts.suspended },
            { id: 'rejected', label: lang === 'mr' ? 'नाकारलेले' : 'Rejected', count: counts.rejected }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#1E5631] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : tab.alert 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* City Filter & Search Bar */}
        <div className="flex items-center gap-2">
          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#2E7D32]"
          >
            <option value="all">{lang === 'mr' ? 'सर्व शहरे' : 'All Cities'}</option>
            {availableCities.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Local Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'नर्सरी, प्रॉडक्ट किंवा शहर शोधा...' : 'Search nursery, product, city...'}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={lang === 'mr' ? 'शोध पुसा' : 'Clear'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Search & City Active Filter Feedback Bar */}
      {(localSearch || searchQuery || selectedCity !== 'all') && (
        <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            <span className="text-xs font-bold text-[#1E5631]">
              {lang === 'mr'
                ? `${localSearch || searchQuery ? `"${localSearch || searchQuery}" शोध` : ''} ${selectedCity !== 'all' ? `(शहर: ${selectedCity})` : ''} नुसार ${filteredNurseries.length} रोपवाटिका सापडल्या`
                : `Found ${filteredNurseries.length} nurseries ${localSearch || searchQuery ? `matching "${localSearch || searchQuery}"` : ''} ${selectedCity !== 'all' ? `in ${selectedCity}` : ''}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setLocalSearch(''); setSelectedCity('all'); }}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            {lang === 'mr' ? 'फिल्टर्स रीसेट करा' : 'Reset filters'}
          </button>
        </div>
      )}

      {/* Nurseries Table & Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredNurseries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{lang === 'mr' ? 'रोपवाटिका व मालक' : 'Nursery & Owner'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'शहर / Hub' : 'City / Region'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'संपर्क नंबर' : 'Contact Phone'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'नोंदणी तारीख' : 'Reg. Date'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'mr' ? 'कृती (Actions)' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNurseries.map(nursery => {
                  const isNurseryExpired = !nursery.isSuspended && nursery.status !== 'rejected' && nursery.status !== 'approved' && (nursery.isTrialExpired || (nursery.status === 'pending' && !nursery.isTrialActive));

                  return (
                  <tr 
                    key={nursery.id} 
                    className={`transition-colors ${
                      isNurseryExpired 
                        ? 'bg-rose-50/50 hover:bg-rose-50/80 border-l-4 border-l-rose-500' 
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    
                    {/* Nursery & Owner Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isNurseryExpired ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-[#1E5631]'
                        }`}>
                          {(nursery.name || nursery.nurseryName || 'N').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {nursery.name || nursery.nurseryName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {nursery.ownerName || nursery.owner}
                          </p>
                          {/* Business Type Badge */}
                          {(() => {
                            const bt = getBusinessType(nursery.businessType);
                            return (
                              <div className="mt-1 flex items-center gap-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${bt.badgeClass}`}>
                                  <span>{bt.emoji}</span>
                                  <span>{lang === 'mr' ? bt.shortTitleMr : bt.shortTitleEn}</span>
                                </span>
                              </div>
                            );
                          })()}
                          {nursery._matchingProduct && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-[#1E5631] text-[10px] font-bold border border-emerald-200 shadow-2xs">
                                🌱 {lang === 'mr' ? 'उपलब्ध प्रॉडक्ट:' : 'Product:'} {nursery._matchingProduct}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <div className="inline-flex items-center gap-1.5 max-w-[140px] truncate" title={nursery.city}>
                        <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                        <span className="truncate">{nursery.city || '-'}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {nursery.phone}
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {nursery.registrationDate || '2026-10-15'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {nursery.status === 'approved' && !nursery.isSuspended && (
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#1E5631] border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-[#2E7D32] shrink-0" />
                            <span>{lang === 'mr' ? 'सक्रिय (मंजूर)' : 'Active (Approved)'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold pl-1">
                            {lang === 'mr' ? 'सबस्क्रिप्शन वैध' : 'Subscribed'}
                          </span>
                        </div>
                      )}

                      {/* Active Free Trial: Clearly displays Auto-Approved and days remaining */}
                      {nursery.isTrialActive && !nursery.isSuspended && nursery.status !== 'rejected' && (
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#1E5631] border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-[#2E7D32] shrink-0" />
                            <span>{lang === 'mr' ? '✓ ऑटो-मंजूर (ट्रायल)' : '✓ Auto-Approved (Trial)'}</span>
                          </span>
                          <span className="text-[10px] text-blue-700 font-semibold pl-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                            <span>
                              {lang === 'mr' 
                                ? `${nursery.trialDaysLeft !== undefined ? nursery.trialDaysLeft : 3} दिवस बाकी` 
                                : `${nursery.trialDaysLeft !== undefined ? nursery.trialDaysLeft : 3}d left`}
                            </span>
                            {(nursery.trialExtensionsCount || 0) > 0 && (
                              <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 rounded">
                                +{(nursery.trialExtensionsCount || 0) * 3}d
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Expired Free Trial / Pending Subscription */}
                      {isNurseryExpired && (
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{lang === 'mr' ? '⚠️ फ्री ट्रायल संपले आहे' : '⚠️ Free Trial Expired'}</span>
                          </span>
                          <span className="text-[10px] text-rose-700 font-bold pl-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{lang === 'mr' ? 'प्लॅन मंजूर करा / मुदतवाढ द्या' : 'Approve Plan / Extend'}</span>
                          </span>
                        </div>
                      )}

                      {(nursery.status === 'suspended' || (nursery.isSuspended && nursery.status !== 'rejected')) && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                          <Ban className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{lang === 'mr' ? 'निलंबित' : 'Suspended'}</span>
                        </span>
                      )}

                      {nursery.status === 'revoked' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                          <RotateCcw className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{lang === 'mr' ? 'रद्द (प्रलंबित)' : 'Revoked'}</span>
                        </span>
                      )}

                      {nursery.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                          <XCircle className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{lang === 'mr' ? 'नाकारलेले' : 'Rejected'}</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* 1. Trial Expired Actions: Approve Subscription, +3 Days Extension, & Reject */}
                        {isNurseryExpired && (
                          <div className="flex items-center gap-1.5">
                            {/* Option to extend +3 days free trial */}
                            {(Number(nursery.trialExtensionsCount) || 0) < 2 ? (
                              <button
                                onClick={() => onExtendTrial && onExtendTrial(nursery.id)}
                                disabled={processingId === nursery.id}
                                title={lang === 'mr' ? '३ दिवस मोफत वाढवा (+३ दिवस)' : 'Extend +3 Days Free Trial'}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow"
                              >
                                <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                                <span>{lang === 'mr' ? `+३ दिवस वाढवा (${(nursery.trialExtensionsCount || 0)}/२)` : `+3 Days (${(nursery.trialExtensionsCount || 0)}/2)`}</span>
                              </button>
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-200" title={lang === 'mr' ? 'कमाल मर्यादा पूर्ण (९ दिवस मोफत दिले)' : 'Max 9 days trial reached'}>
                                {lang === 'mr' ? 'मर्यादा पूर्ण' : 'Max Trial'}
                              </span>
                            )}

                            <button
                              onClick={() => handleApproveWithFeedback(nursery.id)}
                              disabled={processingId === nursery.id}
                              title={lang === 'mr' ? 'सबस्क्रिप्शन प्लॅन मंजूर करा' : 'Approve Subscription'}
                              className="px-3 py-1.5 bg-[#1E5631] hover:bg-[#2E7D32] disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs hover:shadow"
                            >
                              {processingId === nursery.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              )}
                              <span>
                                {processingId === nursery.id 
                                  ? (lang === 'mr' ? 'मंजूर होत आहे...' : 'Approving...') 
                                  : (lang === 'mr' ? '✓ प्लॅन मंजूर करा' : 'Approve Plan')}
                              </span>
                            </button>

                            <button
                              onClick={() => setRejectingNursery(nursery)}
                              title={lang === 'mr' ? 'नाकारा' : 'Reject'}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <X className="w-3.5 h-3.5 text-rose-600" />
                              <span>{lang === 'mr' ? 'नाकारा' : 'Reject'}</span>
                            </button>
                          </div>
                        )}

                        {/* Active Free Trial Nursery Action: Already Auto-Approved; Can extend +3 Days or upgrade to paid */}
                        {nursery.isTrialActive && !nursery.isSuspended && nursery.status !== 'rejected' && (
                          <div className="flex items-center gap-1.5">
                            {(Number(nursery.trialExtensionsCount) || 0) < 2 ? (
                              <button
                                onClick={() => onExtendTrial && onExtendTrial(nursery.id)}
                                disabled={processingId === nursery.id}
                                title={lang === 'mr' ? '३ दिवस मोफत वाढवा (+३ दिवस)' : 'Extend +3 Days Free Trial'}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              >
                                <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                                <span>{lang === 'mr' ? `+३ दिवस वाढवा (${(nursery.trialExtensionsCount || 0)}/२)` : `+3 Days (${(nursery.trialExtensionsCount || 0)}/2)`}</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleApproveWithFeedback(nursery.id)}
                              disabled={processingId === nursery.id}
                              title={lang === 'mr' ? 'पेड सबस्क्रिप्शन प्लॅन मंजूर करा' : 'Approve Paid Plan'}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-[#1E5631] border border-slate-300 hover:border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                            >
                              {processingId === nursery.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>{lang === 'mr' ? 'प्लॅन मंजूर' : 'Approve Plan'}</span>
                            </button>
                          </div>
                        )}

                        {/* Approved Nursery Actions: Revoke Approval & Suspend */}
                        {nursery.status === 'approved' && !nursery.isSuspended && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setRevokingNursery(nursery)}
                              title={lang === 'mr' ? 'मंजुरी रद्द करा' : 'Revoke Approval'}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                              <span>{lang === 'mr' ? 'रद्द' : 'Revoke'}</span>
                            </button>

                            <button
                              onClick={() => setSuspendingNursery(nursery)}
                              title={lang === 'mr' ? 'खाते निलंबित करा' : 'Suspend Nursery'}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>{lang === 'mr' ? 'निलंबित' : 'Suspend'}</span>
                            </button>
                          </div>
                        )}

                        {/* Suspended Nursery Action: Unsuspend / Reactivate */}
                        {(nursery.status === 'suspended' || (nursery.isSuspended && nursery.status !== 'rejected')) && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUnsuspendWithFeedback(nursery.id)}
                              disabled={processingId === nursery.id}
                              title={lang === 'mr' ? 'निलंबन मागे घ्या (सक्रिय करा)' : 'Unsuspend / Re-Activate'}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                            >
                              {processingId === nursery.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5631]" />
                              )}
                              <span>{lang === 'mr' ? 'सक्रिय करा' : 'Unsuspend'}</span>
                            </button>
                          </div>
                        )}

                        {/* Rejected or Revoked Nursery Action: Re-Approve */}
                        {(nursery.status === 'rejected' || nursery.status === 'revoked') && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveWithFeedback(nursery.id)}
                              disabled={processingId === nursery.id}
                              title={lang === 'mr' ? 'पुन्हा मंजूर करा' : 'Re-Approve'}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                            >
                              {processingId === nursery.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>{lang === 'mr' ? 'पुन्हा मंजूर' : 'Re-Approve'}</span>
                            </button>
                          </div>
                        )}

                        {/* Divider separating decisions from utility tools */}
                        <div className="h-5 w-px bg-slate-200 mx-0.5" />

                        {/* 2. Utility Actions Pod (View, Edit, Delete) */}
                        <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
                          {/* View Details */}
                          <button
                            onClick={() => setDetailsNursery(nursery)}
                            title={lang === 'mr' ? 'तपशील पहा' : 'View Details'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => setEditingNursery(nursery)}
                            title={lang === 'mr' ? 'संपादित करा' : 'Edit'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E5631] hover:bg-white transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingNursery(nursery)}
                            title={lang === 'mr' ? 'हटवा' : 'Delete'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </td>

                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {lang === 'mr' ? 'कोणतीही रोपवाटिका सापडली नाही' : 'No nurseries found matching filters'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'mr' ? 'फिल्टर्स किंवा शोध शब्द बदलून पहा.' : 'Try adjusting your search terms or filter selection.'}
            </p>
          </div>
        )}

      </div>

      {/* All Functional Modals */}
      {/* 1. Add Nursery Modal */}
      <AddNurseryModal
        isOpen={addNurseryOpen}
        onClose={() => setAddNurseryOpen(false)}
        onAddNursery={onAddNursery}
        cities={citiesProp}
      />

      {/* 2. Edit Nursery Modal */}
      {editingNursery && (
        <EditNurseryModal
          isOpen={Boolean(editingNursery)}
          onClose={() => setEditingNursery(null)}
          nursery={editingNursery}
          onUpdateNursery={onUpdateNursery}
          cities={citiesProp}
        />
      )}

      {/* 3. Delete Confirm Modal */}
      {deletingNursery && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingNursery)}
          onClose={() => setDeletingNursery(null)}
          onConfirm={async () => {
            if (onDeleteNursery) await onDeleteNursery(deletingNursery.id);
            setDeletingNursery(null);
          }}
          title={lang === 'mr' ? 'रोपवाटिका कायमची हटवा' : 'Permanently Delete Nursery'}
          itemName={deletingNursery.name}
          message={lang === 'mr' 
            ? `"${deletingNursery.name}" ही रोपवाटिका आणि तिची सर्व नोंदवलेली झाडे मोबाईल ॲप व डेटाबेसमधून कायमस्वरूपी हटवली जातील. तुम्हाला नक्की ही हटवायची आहे का?`
            : `"${deletingNursery.name}" and all its listed plants will be permanently deleted from the database and mobile app. Are you sure?`}
        />
      )}

      {/* 4. Details Modal */}
      {detailsNursery && (
        <NurseryDetailsModal
          nursery={detailsNursery}
          isOpen={Boolean(detailsNursery)}
          onClose={() => setDetailsNursery(null)}
          onApprove={async (id) => {
            if (onApprove) await onApprove(id);
            setDetailsNursery(null);
          }}
          onExtendTrial={async (id) => {
            if (onExtendTrial) await onExtendTrial(id);
            setDetailsNursery(null);
          }}
          onOpenReject={(n) => {
            setRejectingNursery(n);
            setDetailsNursery(null);
          }}
          onOpenRevoke={(n) => {
            setRevokingNursery(n);
            setDetailsNursery(null);
          }}
          onOpenSuspend={(n) => {
            setSuspendingNursery(n);
            setDetailsNursery(null);
          }}
          onUnsuspend={async (id) => {
            if (onUnsuspend) await onUnsuspend(id);
            setDetailsNursery(null);
          }}
        />
      )}

      {/* 5. Reject Modal */}
      {rejectingNursery && (
        <RejectModal
          nursery={rejectingNursery}
          isOpen={Boolean(rejectingNursery)}
          onClose={() => setRejectingNursery(null)}
          onConfirm={async (id, reason, notes) => {
            if (onReject) await onReject(id, notes ? `${reason}: ${notes}` : reason);
            setRejectingNursery(null);
          }}
        />
      )}

      {/* 6. Revoke Approval Modal */}
      {revokingNursery && (
        <RevokeConfirmModal
          nursery={revokingNursery}
          isOpen={Boolean(revokingNursery)}
          onClose={() => setRevokingNursery(null)}
          onConfirm={async (id, reason) => {
            if (onRevoke) await onRevoke(id, reason);
            setRevokingNursery(null);
          }}
        />
      )}

      {/* 7. Suspend Account Modal */}
      {suspendingNursery && (
        <SuspendConfirmModal
          nursery={suspendingNursery}
          isOpen={Boolean(suspendingNursery)}
          onClose={() => setSuspendingNursery(null)}
          onConfirm={async (id, reason) => {
            if (onSuspend) await onSuspend(id, reason);
            setSuspendingNursery(null);
          }}
        />
      )}

    </div>
  );
}
