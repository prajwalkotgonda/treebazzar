import React from 'react';
import { 
  LayoutDashboard, Store, Sprout, MessageSquare, BarChart3, 
  Settings, ChevronRight, Leaf, ShieldAlert, Sparkles, MapPin, 
  ExternalLink, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ 
  activeView, 
  onSelectView, 
  pendingCount = 0,
  leadsCount = 0,
  isOpen, 
  onClose 
}) {
  const { t, lang } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'nurseries',
      label: t('navNurseries'),
      icon: Store,
      badge: pendingCount > 0 ? {
        text: `${pendingCount} ${lang === 'mr' ? 'प्रलंबित' : 'Pending'}`,
        color: 'bg-rose-500 text-white'
      } : null,
    },
    {
      id: 'plants',
      label: t('navPlants'),
      icon: Sprout,
      badge: null,
    },
    {
      id: 'leads',
      label: t('navLeads'),
      icon: MessageSquare,
      badge: leadsCount > 0 ? {
        text: 'Live',
        color: 'bg-emerald-600 text-white'
      } : null,
    },
    {
      id: 'analytics',
      label: t('navAnalytics'),
      icon: BarChart3,
      badge: null,
    },
  ];

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
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Top Logo and Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E5631] via-[#246b3c] to-[#2E7D32] flex items-center justify-center text-white shadow-lg shadow-emerald-950/20">
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
                  {lang === 'mr' ? 'रोपवाटिका बाजारपेठ व शोध मंच' : 'Nursery & Plant Marketplace'}
                </p>
              </div>
            </div>
          </div>

          {/* Hub Location Badge */}
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-[#F8FAF9] border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="font-semibold text-slate-800 text-[11px]">
                {lang === 'mr' ? 'सांगली • मिरज • कोल्हापूर' : 'Sangli • Miraj • Kolhapur'}
              </span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'mr' ? 'व्यवस्थापन मेनू' : 'Main Navigation'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#1E5631] text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2 text-left">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-[#2E7D32]'
                    }`} />
                    <span className="truncate block">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight whitespace-nowrap shadow-xs ${item.badge.color}`}>
                      {item.badge.text}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white/60 translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                    }`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          
          {/* Botanical Marketplace Status Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-[#1E5631] mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
                {t('liveMarketplace')}
              </span>
              <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {lang === 'mr' 
                ? 'स्थानिक शेतकरी व ग्राहकांसाठी रोपे शोध पोर्टल सक्रिय आहे.' 
                : 'Local plant discovery portal active for Western Maharashtra nurseries.'}
            </p>
          </div>

          {/* Super Admin User Strip */}
          <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium">Sangli Super Admin</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">TreeBazzar</span>
          </div>

        </div>

      </aside>
    </>
  );
}
