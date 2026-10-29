import React, { useMemo } from 'react';
import { 
  Store, AlertCircle, Sprout, MapPin, MessageSquare, Plus, 
  ShieldCheck, ArrowRight, Clock, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PLANT_CATEGORIES, RECENT_ACTIVITIES } from '../../data/mockData';

export default function OverviewView({ 
  nurseries = [], 
  plants = [], 
  inquiries = [], 
  onNavigate, 
  onOpenAddPlant 
}) {
  const { t, lang } = useLanguage();

  // Metrics
  const totalNurseries = nurseries.length;
  const pendingNurseries = nurseries.filter(n => n.status === 'pending');
  const pendingCount = pendingNurseries.length;
  const totalPlants = plants.length;

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(nurseries.map(n => n.city).filter(Boolean)));
  }, [nurseries]);

  const inquiriesCount = inquiries.length;

  // Category counts and distribution
  const categoryStats = useMemo(() => {
    return PLANT_CATEGORIES.map(cat => {
      const count = plants.filter(p => p.category === cat).length;
      const percentage = totalPlants > 0 ? Math.round((count / totalPlants) * 100) : 0;
      return { category: cat, count, percentage };
    });
  }, [plants, totalPlants]);

  const statCards = [
    {
      id: 'nurseries',
      title: t('statNurseries'),
      value: totalNurseries,
      subtitle: t('statNurseriesSub'),
      icon: Store,
      color: 'bg-emerald-100 text-[#1E5631]',
      action: () => onNavigate('nurseries')
    },
    {
      id: 'pending',
      title: t('statPending'),
      value: pendingCount,
      subtitle: t('statPendingSub'),
      icon: AlertCircle,
      color: pendingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
      isAlert: pendingCount > 0,
      action: () => onNavigate('nurseries', 'pending')
    },
    {
      id: 'plants',
      title: t('statPlants'),
      value: totalPlants,
      subtitle: t('statPlantsSub'),
      icon: Sprout,
      color: 'bg-green-100 text-[#2E7D32]',
      action: () => onNavigate('plants')
    },
    {
      id: 'cities',
      title: t('statCities'),
      value: uniqueCities.length,
      subtitle: uniqueCities.length > 0 ? uniqueCities.join(', ') : t('statCitiesSub'),
      icon: MapPin,
      color: 'bg-blue-100 text-blue-800',
      action: () => onNavigate('nurseries')
    },
    {
      id: 'inquiries',
      title: t('statInquiries'),
      value: inquiriesCount,
      subtitle: t('statInquiriesSub'),
      icon: MessageSquare,
      color: 'bg-teal-100 text-teal-800',
      action: () => onNavigate('inquiries')
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 5 Summary Cards (Section 4 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.action}
              className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                card.isAlert 
                  ? 'border-amber-300 ring-2 ring-amber-400/30' 
                  : 'border-slate-200 hover:border-[#2E7D32]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
                {card.isAlert && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {lang === 'mr' ? 'पडताळणी आवश्यक' : 'Review Needed'}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2 truncate font-medium">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons (Section 4 Requirement) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('quickActionsTitle')}
          </h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {lang === 'mr' ? 'जलद ॲडमिन शॉर्टकट्स' : 'Direct management shortcuts'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onOpenAddPlant}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#2E7D32]" />
            <span>{t('actionAddPlant')}</span>
          </button>

          <button
            onClick={() => onNavigate('nurseries', 'pending')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>{t('actionReviewNurseries')}</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('inquiries')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span>{t('actionViewInquiries')}</span>
            {inquiriesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                {inquiriesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Middle Section: Pending Approvals & Popular Plant Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Nursery Approvals (Section 4 Requirement) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('pendingApprovalsBoxTitle')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('pendingApprovalsBoxSub')}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {pendingCount}
              </span>
            </div>

            {pendingNurseries.length > 0 ? (
              <div className="space-y-3">
                {pendingNurseries.slice(0, 3).map(n => (
                  <div 
                    key={n.id}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {lang === 'mr' && n.nameMr ? n.nameMr : n.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {n.ownerName} • {n.city} • {n.phone}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('nurseries', 'pending')}
                      className="px-3 py-1.5 rounded-lg bg-[#1E5631] text-white text-xs font-bold hover:bg-[#2E7D32] transition-colors shrink-0"
                    >
                      {t('btnApprove')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p>{t('noPendingApprovals')}</p>
              </div>
            )}
          </div>

          {pendingNurseries.length > 0 && (
            <button
              onClick={() => onNavigate('nurseries', 'pending')}
              className="mt-4 text-xs font-bold text-[#1E5631] hover:text-[#2E7D32] flex items-center gap-1 justify-center py-2"
            >
              <span>{t('viewAllAlerts')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Popular Plant Categories with simple bar chart (Section 4 Requirement) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {t('popularCategoriesTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('popularCategoriesSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {categoryStats.map(stat => (
              <div key={stat.category}>
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700">
                    {lang === 'mr' ? (
                      stat.category === 'Fruit Trees' ? t('catFruitTrees') :
                      stat.category === 'Indoor Plants' ? t('catIndoorPlants') :
                      stat.category === 'Flowering Plants' ? t('catFloweringPlants') :
                      stat.category === 'Farm Trees' ? t('catFarmTrees') : t('catVegetables')
                    ) : stat.category}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {stat.count} {lang === 'mr' ? 'रोपे' : 'plants'} ({stat.percentage}%)
                  </span>
                </div>
                
                {/* Visual Bar Chart Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1E5631] to-[#2E7D32] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stat.percentage, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Activities Timeline (Section 4 Requirement) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t('recentActivityTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('recentActivitySubtitle')}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lang === 'mr' ? 'थेट अपडेट्स' : 'Live Timeline'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RECENT_ACTIVITIES.map((act) => (
            <div key={act.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-800">
                  {lang === 'mr' ? act.titleMr : act.title}
                </span>
                <span className="text-slate-400 text-[10px]">{act.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                {lang === 'mr' ? act.descMr : act.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
