import React, { useState, useMemo } from 'react';
import { 
  BarChart3, MapPin, TrendingUp, Users, Sprout, Store, 
  ArrowUpRight, Award, Compass, PieChart, Sparkles, Inbox 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AnalyticsView({ nurseries = [], plants = [], leads = [] }) {
  const { t, lang } = useLanguage();

  // Dynamic city coverage derived from actual registered nurseries
  const dynamicCityList = useMemo(() => {
    if (nurseries.length === 0) return [];
    const cityMap = {};
    nurseries.forEach(n => {
      if (!n.city) return;
      if (!cityMap[n.city]) {
        cityMap[n.city] = { city: n.city, nurseries: 0, inquiriesToday: 0 };
      }
      cityMap[n.city].nurseries += 1;
    });

    leads.forEach(l => {
      if (l.customerCity && cityMap[l.customerCity]) {
        cityMap[l.customerCity].inquiriesToday += 1;
      }
    });

    const totalNurs = nurseries.length || 1;
    return Object.values(cityMap).map(c => ({
      ...c,
      share: Math.round((c.nurseries / totalNurs) * 100),
      hubStatus: c.nurseries > 3 ? 'Primary Hub' : 'Active Center'
    }));
  }, [nurseries, leads]);

  const [selectedCityName, setSelectedCityName] = useState(null);

  const activeSelectedCity = dynamicCityList.find(c => c.city === selectedCityName) || dynamicCityList[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#1E5631]" />
          {t('navAnalytics')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {lang === 'mr' 
            ? 'नोंदणीकृत रोपवाटिका घनता आणि ग्राहक मागणीचे थेट विश्लेषण.'
            : 'Regional nursery density, demand distribution, and seasonal category performance across active hubs.'}
        </p>
      </div>

      {dynamicCityList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            {lang === 'mr' ? 'अद्याप कोणतेही शहर किंवा रोपवाटिका नोंदणीकृत नाही' : 'No Regional Nurseries Registered Yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {lang === 'mr' ? 'नवीन रोपवाटिकांची नोंदणी झाल्यानंतर शहरांचे विश्लेषण येथे दिसेल.' : 'When partner nurseries join the marketplace, city-level analytics will automatically populate here.'}
          </p>
        </div>
      ) : (
        <>
          {/* City Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {dynamicCityList.map((c) => {
              const isSelected = activeSelectedCity?.city === c.city;

              return (
                <div
                  key={c.city}
                  onClick={() => setSelectedCityName(c.city)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-b from-emerald-50/80 to-white border-[#1E5631] ring-2 ring-[#2E7D32]/40 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                      {c.city}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E5631]/10 text-[#1E5631]">
                      {c.share}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>{lang === 'mr' ? 'रोपवाटिका:' : 'Nurseries:'}</span>
                      <b className="text-slate-800">{c.nurseries}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'mr' ? 'आजचे लीड्स:' : 'Today Leads:'}</span>
                      <b className="text-[#1E5631]">{c.inquiriesToday}</b>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Role:</span>
                      <span className="font-semibold text-slate-600">{c.hubStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected City Focus Detail */}
          {activeSelectedCity && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {activeSelectedCity.city} Nursery Hub Profile
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#1E5631]">
                      {activeSelectedCity.hubStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'mr' 
                      ? 'या क्षेत्रातील अग्रगण्य रोपवाटिका, कलमे आणि शेतकरी चौकशी कल.' 
                      : 'Local grower coverage, soil cluster adaptability, and buyer demand velocity.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">{lang === 'mr' ? 'एकूण बाजार वाटा:' : 'Market Demand Share:'}</span>
                  <span className="text-lg font-black text-[#1E5631]">{activeSelectedCity.share}%</span>
                </div>
              </div>

              {/* Detailed stats for this city */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-xl bg-[#F8FAF9] border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#1E5631]" />
                    {lang === 'mr' ? 'नोंदणीकृत रोपवाटिका' : 'Associated Nurseries in'} {activeSelectedCity.city}
                  </h4>
                  <div className="space-y-2 mt-3">
                    {nurseries.filter(n => n.city?.toLowerCase() === activeSelectedCity.city.toLowerCase()).map(n => (
                      <div key={n.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                        <span className="font-semibold text-slate-800">{n.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {n.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF9] border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    {lang === 'mr' ? 'हब माहिती' : 'Hub Overview'}
                  </h4>
                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed mt-3">
                    <p>
                      <b>{activeSelectedCity.city}</b> has {activeSelectedCity.nurseries} active partner nurseries connected to the platform.
                    </p>
                    <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
                      Total customer inquiries recorded: {activeSelectedCity.inquiriesToday}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
