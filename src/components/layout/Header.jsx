import React, { useState } from 'react';
import { 
  Search, Bell, Languages, Menu, X, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Header({ 
  activeView,
  onToggleSidebar, 
  pendingCount = 0, 
  onNavigate, 
  searchQuery,
  onSearchChange
}) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive current page title dynamically
  const pageTitle = {
    dashboard: t('navDashboard'),
    nurseries: t('navNurseries'),
    plants: t('navPlants'),
    inquiries: t('navInquiries')
  }[activeView] || t('navDashboard');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        
        {/* Left Section: Mobile Menu Button & Current Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] hidden sm:inline-block" />
              {pageTitle}
            </h2>
            <p className="text-[11px] text-slate-400 hidden md:block">
              TreeBazzar • {t('adminBadge')}
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Language Toggle, Notifications, Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* English / Marathi Language Switcher */}
          <button
            onClick={toggleLanguage}
            title={lang === 'en' ? 'मराठी मध्ये बदला' : 'Switch to English'}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200/80 font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Languages className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-[11px]">
              {lang === 'en' ? 'EN | मराठी' : 'मराठी | EN'}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t('notifications')}
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                      {pendingCount} {lang === 'mr' ? 'प्रलंबित' : 'Pending'}
                    </span>
                  )}
                </div>

                <div className="p-3">
                  {pendingCount > 0 ? (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl">
                      <p className="text-xs font-bold text-amber-900 mb-2">
                        {pendingCount} {t('pendingAlertNotice')}
                      </p>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('nurseries', 'pending');
                        }}
                        className="w-full py-1.5 px-3 bg-[#1E5631] hover:bg-[#2E7D32] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{t('viewAllAlerts')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-center py-3 text-xs text-slate-400">
                      {t('noPendingNotice')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Avatar & Name */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              AS
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 leading-tight">Admin Sangli</span>
                <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
              </div>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {t('adminRole')}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Search Bar Row (When on small screens) */}
      <div className="mt-2.5 sm:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2E7D32]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </header>
  );
}
