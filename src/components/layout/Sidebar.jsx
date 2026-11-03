import React from 'react';
import { 
  LayoutDashboard, Store, Sprout, ShoppingBag, Users, 
  MessageSquare, BarChart3, Leaf, ChevronRight, MapPin, X, Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ 
  activeView, 
  onSelectView, 
  pendingCount = 0,
  pendingOrdersCount = 0,
  leadsCount = 0,
  isOpen, 
  onClose,
  cities = [],
  onViewWebsite
}) {
  const { t, lang } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t('navDashboard') || 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'nurseries',
      label: t('navNurseries') || 'Nursery Management',
      icon: Store,
      badge: pendingCount > 0 ? {
        text: `${pendingCount}`,
        color: 'bg-amber-500 text-white'
      } : null,
    },
    {
      id: 'plants',
      label: t('navPlants') || 'Plant Management',
      icon: Sprout,
      badge: null,
    },
    {
      id: 'orders',
      label: t('navOrders') || 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? {
        text: `${pendingOrdersCount}`,
        color: 'bg-emerald-600 text-white'
      } : null,
    },
    {
      id: 'customers',
      label: t('navCustomers') || 'Customers',
      icon: Users,
      badge: null,
    },
    {
      id: 'inquiries',
      label: t('navInquiries') || 'Enquiries',
      icon: MessageSquare,
      badge: leadsCount > 0 ? {
        text: `${leadsCount}`,
        color: 'bg-teal-600 text-white'
      } : null,
    },
    {
      id: 'reports',
      label: t('navReports') || 'Reports',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleNavClick = (id) => {
    onSelectView(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Top Logo and Navigation */}
        <div className="overflow-y-auto flex-1">
          {/* Logo Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E5631] via-[#246b3c] to-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
                <Leaf className="w-5 h-5 fill-white/20 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {lang === 'mr' ? 'ट्री बाजार' : 'TreeBazzar'}
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1E5631]/10 text-[#1E5631] uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {lang === 'mr' ? 'स्थानिक रोपवाटिका ॲडमिन' : 'Simple Nursery Admin'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Hub Cities Badge */}
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-100/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
              <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[170px]" title={cities.map(c => (lang === 'mr' && c.nameMr ? c.nameMr : c.nameEn)).join(' • ')}>
                {cities.length > 0 
                  ? cities.slice(0, 3).map(c => (lang === 'mr' && c.nameMr ? c.nameMr : c.nameEn)).join(' • ') + (cities.length > 3 ? '...' : '')
                  : (lang === 'mr' ? 'सांगली • मिरज • कोल्हापूर' : 'Sangli • Miraj • Kolhapur')}
              </span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* 7 Core Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('mainMenu') || 'Main Menu'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#1E5631] text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2 text-left">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-[#2E7D32]'
                    }`} />
                    <span className="truncate block">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className={`shrink-0 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-xs ${item.badge.color}`}>
                      {item.badge.text}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-white/60 translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                    }`} />
                  )}
                </button>
              );
            })}

            {/* Optional Hub Cities View */}
            <div className="pt-2 border-t border-slate-100 mt-2">
              <button
                onClick={() => handleNavClick('cities')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeView === 'cities'
                    ? 'bg-[#1E5631] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('navCities') || 'Cities & Hubs'}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {cities.length}
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Section: View Public Website */}
        {onViewWebsite && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onViewWebsite}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Globe className="w-4 h-4 text-[#2E7D32]" />
              <span>{lang === 'mr' ? 'पब्लिक वेबसाइट पहा' : 'View Public Website'}</span>
            </button>
          </div>
        )}

      </aside>
    </>
  );
}
