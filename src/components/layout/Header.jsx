import React, { useState, useMemo } from 'react';
import { 
  Search, Bell, Languages, Menu, X, CheckCircle, ShieldCheck, 
  Sparkles, ExternalLink, ChevronDown, Sprout, Store, ArrowRight,
  Cloud, Database, RefreshCw, Trash2, CheckCircle2, SearchX
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { fuzzyFilter } from '../../utils/fuzzySearch';

export default function Header({ 
  onToggleSidebar, 
  pendingCount = 0, 
  onNavigate, 
  activeView,
  searchQuery,
  onSearchChange,
  nurseries = [],
  plants = [],
  firebaseStatus = 'connected',
  onSyncData,
  isSyncing = false,
  onClearData,
  isClearing = false
}) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Fuzzy search with typo tolerance across nurseries and plants
  const { results: matchedNurseries } = useMemo(() => {
    if (!searchQuery?.trim() || searchQuery.trim().length <= 1) return { results: [] };
    return fuzzyFilter(nurseries, searchQuery, (n) => [
      n.name, 
      n.nameMr, 
      n.ownerName, 
      n.city,
      ...(n.specialties || []),
      ...(n.specialtiesMr || [])
    ]);
  }, [nurseries, searchQuery]);

  const { results: matchedPlants } = useMemo(() => {
    if (!searchQuery?.trim() || searchQuery.trim().length <= 1) return { results: [] };
    return fuzzyFilter(plants, searchQuery, (p) => [
      p.nameEn, 
      p.nameMr, 
      p.botanicalName, 
      p.category, 
      p.categoryMr, 
      p.nurseryName
    ]);
  }, [plants, searchQuery]);

  // Combine suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery?.trim() || searchQuery.trim().length <= 1) return [];
    return [
      ...matchedNurseries.slice(0, 3).map(n => ({ 
        type: 'nursery', 
        title: lang === 'mr' && n.nameMr ? n.nameMr : n.name, 
        subtitle: `${n.city || ''} • ${n.status || ''}`, 
        id: n.id 
      })),
      ...matchedPlants.slice(0, 4).map(p => ({ 
        type: 'plant', 
        title: lang === 'mr' && p.nameMr ? p.nameMr : p.nameEn, 
        subtitle: `${p.category || ''} • ₹${p.priceMin}-${p.priceMax}`, 
        id: p.id 
      }))
    ];
  }, [matchedNurseries, matchedPlants, searchQuery, lang]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar with Typo Tolerance */}
          <div className="relative w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-9 py-2 bg-[#F8FAF9] hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all placeholder:text-slate-400 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Autocomplete Suggestions or "Not Found" Dropdown */}
            {showSearchDropdown && searchQuery?.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                {filteredSuggestions.length > 0 ? (
                  <>
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'mr' ? 'शोध परिणाम (स्पेलिंग जुळवणी)' : 'Matches (with typo tolerance)'}</span>
                      <span className="text-emerald-700 font-bold">{filteredSuggestions.length}</span>
                    </div>

                    {filteredSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          if (item.type === 'nursery') {
                            onNavigate('nurseries');
                          } else {
                            onNavigate('plants');
                          }
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${item.type === 'nursery' ? 'bg-emerald-50 text-emerald-800' : 'bg-green-50 text-green-800'}`}>
                            {item.type === 'nursery' ? <Store className="w-3.5 h-3.5" /> : <Sprout className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 truncate max-w-xs group-hover:text-[#1E5631] transition-colors">{item.title}</p>
                            <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2E7D32] transition-colors" />
                      </button>
                    ))}
                  </>
                ) : (
                  /* "NOT FOUND" STATE IN HEADER DROPDOWN */
                  <div className="px-4 py-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-2">
                      <SearchX className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {t('productNotFound')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      {lang === 'mr' 
                        ? `"${searchQuery}" शी जुळणारे कोणतेही उत्पादन किंवा रोपवाटिका सापडली नाही.`
                        : `No products or nurseries found matching "${searchQuery}".`}
                    </p>
                    <button
                      onClick={() => {
                        onSearchChange('');
                        setShowSearchDropdown(false);
                      }}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all"
                    >
                      {t('clearSearch')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Firebase Cloud Pill, Language Toggle, Notifications, Admin Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Refresh & Sync Live Data Button */}
          <button
            onClick={onSyncData}
            disabled={isSyncing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200/90 text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer group"
            title={t('refreshTooltip')}
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2E7D32] transition-transform ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
            <span className="text-[11px] sm:text-xs">
              {isSyncing ? t('syncing') : t('refresh')}
            </span>
          </button>

          {/* Seamless Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title={lang === 'en' ? 'मराठी मध्ये बदला' : 'Switch to English'}
            className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200/80 shadow-xs font-bold text-xs transition-all active:scale-95 group"
          >
            <Languages className="w-4 h-4 text-[#2E7D32] group-hover:rotate-12 transition-transform" />
            <div className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                lang === 'en' ? 'bg-[#1E5631] text-white shadow-xs' : 'text-slate-600'
              }`}>
                EN
              </span>
              <span className="text-slate-300 font-normal">|</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                lang === 'mr' ? 'bg-[#1E5631] text-white shadow-xs' : 'text-slate-600'
              }`}>
                मराठी
              </span>
            </div>
          </button>

          {/* Pending Alerts Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-soft-pulse shadow-sm">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t('notifications')}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                    {pendingCount} {lang === 'mr' ? 'प्रलंबित' : 'Pending'}
                  </span>
                </div>

                <div className="py-2 px-3">
                  {pendingCount > 0 ? (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                      <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                        {pendingCount} {t('pendingAlertNotice')}
                      </p>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('nurseries');
                        }}
                        className="mt-2.5 w-full py-1.5 px-3 bg-[#1E5631] hover:bg-[#184729] text-white rounded-lg text-xs font-bold shadow-sm transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>{t('viewAllAlerts')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      {lang === 'mr' ? 'सर्व पडताळणी अद्ययावत आहेत' : 'No pending notifications'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          </div>

      </div>
    </header>
  );
}
