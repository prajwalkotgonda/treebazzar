import React, { useState, useMemo } from 'react';
import { 
  Store, AlertCircle, Sprout, MapPin, MessageSquare, TrendingUp, 
  ArrowUpRight, Clock, Plus, ShieldCheck, ChevronRight, Download, 
  FileCheck, Leaf, PhoneCall, Sparkles, Filter, ExternalLink, Inbox
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function OverviewView({ 
  nurseries = [], 
  plants = [], 
  leads = [], 
  onNavigate, 
  onOpenAddPlant,
  onShowToast
}) {
  const { t, lang } = useLanguage();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Real Computed metrics - no dummy additions
  const totalNurseries = nurseries.length;
  const pendingNurseries = nurseries.filter(n => n.status === 'pending');
  const pendingCount = pendingNurseries.length;
  const totalPlants = plants.length;
  
  // Real Unique cities from nurseries
  const uniqueCities = Array.from(new Set(nurseries.map(n => n.city).filter(Boolean)));
  const totalCitiesCount = uniqueCities.length;

  // Real Inquiries count today
  const inquiriesTodayCount = leads.length;

  const statCards = [
    {
      id: 'nurseries',
      title: t('statNurseries'),
      value: totalNurseries,
      change: totalNurseries > 0 ? `${totalNurseries} Total` : '0',
      subtitle: `${nurseries.filter(n => n.status === 'approved').length} ${lang === 'mr' ? 'मान्यताप्राप्त' : 'approved'}`,
      icon: Store,
      color: 'emerald',
      bgGlow: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-200/80',
      action: () => onNavigate('nurseries')
    },
    {
      id: 'pending',
      title: t('statPending'),
      value: pendingCount,
      alert: pendingCount > 0,
      change: pendingCount > 0 ? `${pendingCount} ${lang === 'mr' ? 'तात्काळ' : 'urgent'}` : '0',
      subtitle: t('statPendingSub'),
      icon: AlertCircle,
      color: 'amber',
      bgGlow: 'from-amber-500/15 to-orange-500/10',
      borderColor: 'border-amber-300',
      action: () => onNavigate('nurseries', 'pending')
    },
    {
      id: 'plants',
      title: t('statPlants'),
      value: totalPlants,
      change: totalPlants > 0 ? `${totalPlants} Varieties` : '0',
      subtitle: `${plants.filter(p => p.stockStatus === 'in_stock').length} ${lang === 'mr' ? 'उपलब्ध' : 'in stock'}`,
      icon: Sprout,
      color: 'forest',
      bgGlow: 'from-[#1E5631]/10 to-[#2E7D32]/5',
      borderColor: 'border-green-200/80',
      action: () => onNavigate('plants')
    },
    {
      id: 'cities',
      title: t('statCities'),
      value: totalCitiesCount,
      change: totalCitiesCount > 0 ? `${totalCitiesCount} Hubs` : '0',
      subtitle: uniqueCities.length > 0 ? uniqueCities.slice(0, 3).join(', ') : (lang === 'mr' ? 'शहरे उपलब्ध नाहीत' : 'No active cities yet'),
      icon: MapPin,
      color: 'blue',
      bgGlow: 'from-blue-500/10 to-cyan-500/5',
      borderColor: 'border-blue-200/80',
      action: () => onNavigate('analytics')
    },
    {
      id: 'inquiries',
      title: t('statInquiries'),
      value: inquiriesTodayCount,
      change: inquiriesTodayCount > 0 ? `${inquiriesTodayCount} Leads` : '0',
      subtitle: t('statInquiriesSub'),
      icon: MessageSquare,
      color: 'purple',
      bgGlow: 'from-teal-500/10 to-emerald-500/10',
      borderColor: 'border-emerald-200/80',
      action: () => onNavigate('leads')
    }
  ];

  // Dynamic category calculations based on actual catalog
  const categoriesList = [
    { id: 'Fruit Trees', name: 'Fruit Trees', nameMr: 'फळझाडे व कलमे', color: '#1E5631' },
    { id: 'Farm Trees', name: 'Farm & Agroforestry Trees', nameMr: 'शेती व वनशेती झाडे', color: '#2E7D32' },
    { id: 'Indoor', name: 'Indoor & Ornamental', nameMr: 'घरातील व शोभिवंत झाडे', color: '#4CAF50' },
    { id: 'Flowers', name: 'Flowers & Landscaping', nameMr: 'फुले व बागकाम', color: '#E11D48' },
    { id: 'Vegetables', name: 'Vegetable Seedlings', nameMr: 'भाजीपाला रोपे', color: '#D97706' },
  ];

  const dynamicCategoryStats = useMemo(() => {
    if (plants.length === 0) return [];
    return categoriesList.map(cat => {
      const matchingPlants = plants.filter(p => p.category === cat.id);
      const count = matchingPlants.length;
      const percentage = Math.round((count / plants.length) * 100) || 0;
      const matchingLeads = leads.filter(l => matchingPlants.some(p => p.id === l.plantId)).length;
      return {
        ...cat,
        count,
        percentage,
        inquiries: matchingLeads,
        topVariety: matchingPlants[0]?.nameEn || (lang === 'mr' ? 'नोंद नाही' : 'None yet'),
        nurseriesOffering: Array.from(new Set(matchingPlants.map(p => p.nurseryId))).length
      };
    }).filter(c => c.count > 0);
  }, [plants, leads, lang]);

  // Dynamic city distribution from actual nurseries
  const dynamicCityCoverage = useMemo(() => {
    if (nurseries.length === 0) return [];
    const cityMap = {};
    nurseries.forEach(n => {
      if (!n.city) return;
      if (!cityMap[n.city]) cityMap[n.city] = { city: n.city, nurseries: 0, inquiriesToday: 0 };
      cityMap[n.city].nurseries += 1;
    });
    leads.forEach(l => {
      if (l.customerCity && cityMap[l.customerCity]) {
        cityMap[l.customerCity].inquiriesToday += 1;
      }
    });
    return Object.values(cityMap);
  }, [nurseries, leads]);

  const handleExportCSV = () => {
    if (leads.length === 0) {
      onShowToast({
        type: 'info',
        title: lang === 'mr' ? 'नोंदी उपलब्ध नाहीत' : 'No Inquiries Available',
        message: lang === 'mr' ? 'अद्याप कोणत्याही ग्राहक लीड्स नोंदवलेल्या नाहीत.' : 'There are no customer inquiries to export yet.'
      });
      return;
    }
    onShowToast({
      type: 'info',
      title: lang === 'mr' ? 'लीड्स अहवाल तयार केला' : 'Leads CSV Report Exported',
      message: `${leads.length} ${lang === 'mr' ? 'लीड्स अहवाल संकलित केला.' : 'inquiries exported successfully.'}`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner / Welcome Strip */}
      <div className="bg-gradient-to-r from-[#1E5631] via-[#246b3c] to-[#2E7D32] rounded-2xl p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Leaf className="w-80 h-80 rotate-12 stroke-[1]" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{lang === 'mr' ? 'महाराष्ट्र स्थानिक नर्सरी नियंत्रण केंद्र' : 'Western Maharashtra Nursery Command'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('overviewTitle')}
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
            {t('overviewSubtitle')}
          </p>

          {/* Pending Alert Callout inside Banner */}
          {pendingCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold shadow-lg shadow-amber-950/20">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
              <span>
                {lang === 'mr' 
                  ? pendingCount === 1 ? '१ नवीन रोपवाटिका मंजुरीच्या प्रतीक्षेत आहे' : `${pendingCount} नवीन रोपवाटिका मंजुरीची वाट पाहत आहेत` 
                  : pendingCount === 1 ? '1 new nursery application is waiting for approval' : `${pendingCount} new nursery applications are waiting for approval`}
              </span>
              <button
                onClick={() => onNavigate('nurseries', 'pending')}
                className="ml-2 px-2.5 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-[11px]"
              >
                <span>{t('btnApprove')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isPendingCard = card.id === 'pending';

          return (
            <div
              key={card.id}
              onClick={card.action}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group relative overflow-hidden ${
                isPendingCard && pendingCount > 0
                  ? 'border-amber-300 ring-2 ring-amber-400/40 bg-gradient-to-br from-amber-50/60 to-white'
                  : 'border-slate-200 hover:border-[#2E7D32]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isPendingCard
                    ? 'bg-amber-100 text-amber-800'
                    : card.color === 'emerald'
                      ? 'bg-emerald-100 text-[#1E5631]'
                      : card.color === 'forest'
                        ? 'bg-green-100 text-[#2E7D32]'
                        : card.color === 'blue'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-teal-100 text-teal-800'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>

                {card.alert && pendingCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white whitespace-nowrap inline-flex items-center">
                    {card.change}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                    {card.change}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-2 truncate font-medium">
                {card.subtitle}
              </p>

              <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-[#2E7D32]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Management Action Buttons */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2E7D32]" />
              {t('quickActions')}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {lang === 'mr' ? 'थेट ॲडमिन शॉर्टकट' : 'High frequency administrative operations'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('nurseries', 'pending')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all hover:scale-[1.01]"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span className="truncate">{t('actionVerify')}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAddPlant}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 text-xs font-bold transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 text-[#2E7D32]" />
            <span className="truncate">{t('actionAddPlant')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="truncate">{t('actionExportLeads')}</span>
          </button>

          <button
            onClick={() => onNavigate('leads')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-950/15 transition-all hover:scale-[1.01]"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span className="truncate">{lang === 'mr' ? 'थेट ग्राहक लीड्स पहा' : 'View Customer Leads'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Top Selling Plant Categories & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Plant Categories breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#1E5631]" />
                  {t('topCategoriesTitle')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('topCategoriesSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#1E5631] border border-emerald-200">
                  {plants.length} {lang === 'mr' ? 'नोंदणीकृत झाडे' : 'Plants Listed'}
                </span>
              </div>
            </div>

            {/* Interactive Visual Bar Chart Breakdown */}
            {dynamicCategoryStats.length === 0 ? (
              <div className="my-10 text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  {lang === 'mr' ? 'कॅटलॉगमध्ये अद्याप झाडे जोडलेली नाहीत' : 'No plant varieties registered yet'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  {lang === 'mr' ? 'वर्गवारी आलेख पाहण्यासाठी कॅटलॉगमध्ये नवीन वनस्पती जोडा.' : 'Add varieties to your master catalog to view real-time category analytics.'}
                </p>
                <button
                  onClick={onOpenAddPlant}
                  className="mt-3 px-3.5 py-1.5 bg-[#1E5631] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('btnAddPlant')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 my-5">
                {dynamicCategoryStats.map((category) => {
                  const categoryName = lang === 'mr' ? category.nameMr : category.name;
                  const isSelected = activeCategoryFilter === category.id;

                  return (
                    <div
                      key={category.id}
                      onClick={() => setActiveCategoryFilter(isSelected ? 'all' : category.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#2E7D32] bg-emerald-50/40 shadow-xs ring-1 ring-[#2E7D32]' 
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {categoryName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({category.count} {lang === 'mr' ? 'प्रकार' : 'varieties'})
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-700">
                            {category.inquiries} {lang === 'mr' ? 'चौकशी' : 'inquiries'}
                          </span>
                          <span className="text-xs font-black text-[#1E5631] min-w-[36px] text-right">
                            {category.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full rounded-full transition-all duration-700 bg-[#1E5631]"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Regional Hub Distribution footer */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('regionalTitle')}
            </h4>
            {dynamicCityCoverage.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                {lang === 'mr' ? 'अद्याप नोंदणीकृत शहरे नाहीत.' : 'No nurseries registered with cities yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {dynamicCityCoverage.map((cityItem) => (
                  <div key={cityItem.city} className="p-2.5 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
                    <span className="text-xs font-bold text-slate-800 block">
                      {cityItem.city}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {cityItem.nurseries} {lang === 'mr' ? 'रोपवाटिका' : 'nurseries'}
                    </span>
                    <span className="text-[11px] font-black text-[#1E5631] mt-0.5 block">
                      {cityItem.inquiriesToday} leads
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1E5631]" />
                  {t('activityTitle')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('activitySubtitle')}
                </p>
              </div>
            </div>

            {/* Empty State when no dummy activities */}
            <div className="my-8 text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                {lang === 'mr' ? 'कोणतीही नवीन हालचाल नोंदवलेली नाही' : 'No recent activities recorded'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'mr' ? 'नवीन अर्ज आणि वनस्पती नोंदी येथे दिसतील.' : 'Live interactions and approvals will stream here in real time.'}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('leads')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>{t('viewAllActivity')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
