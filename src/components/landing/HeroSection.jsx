import React from 'react';
import { 
  Search, MapPin, Leaf, CheckCircle2, PhoneCall, Sparkles, Store, Sprout, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection({ 
  searchQuery, 
  onSearchChange, 
  selectedCity, 
  onCityChange,
  totalNurseries = 0,
  totalPlants = 0,
  onSearchSubmit
}) {
  const { lang, t } = useLanguage();

  const cities = [
    { value: 'all', label: t('heroAllCities') },
    { value: 'Sangli', label: t('heroCitySangli') },
    { value: 'Miraj', label: t('heroCityMiraj') },
    { value: 'Kolhapur', label: t('heroCityKolhapur') },
    { value: 'Karad', label: t('heroCityKarad') }
  ];

  const popularTags = [
    { en: 'Kesar Mango', mr: 'केशर आंबा' },
    { en: 'Tissue Teak (Sagwan)', mr: 'सागवान' },
    { en: 'Areca Palm', mr: 'अरेका पाम' },
    { en: 'Desi Rose', mr: 'देशी गुलाब' },
    { en: 'Guava (Peru)', mr: 'सरदार पेरू' }
  ];

  const handleTagClick = (tag) => {
    const val = lang === 'mr' ? tag.mr : tag.en;
    onSearchChange(val);
    const plantsElem = document.getElementById('plants');
    if (plantsElem) plantsElem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
    const plantsElem = document.getElementById('plants');
    if (plantsElem) plantsElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-[#F8FAF9] pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-emerald-950/5">
      
      {/* Background Subtle Leaf Motifs */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-5 pointer-events-none -translate-y-1/4 translate-x-1/4">
        <Leaf className="w-full h-full text-[#1E5631] rotate-45 stroke-[1]" />
      </div>
      <div className="absolute bottom-0 left-0 w-72 h-72 opacity-5 pointer-events-none translate-y-1/4 -translate-x-1/4">
        <Leaf className="w-full h-full text-[#1E5631] -rotate-45 stroke-[1]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Regional Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#1E5631] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            <span className="text-[11px] font-black tracking-wide uppercase">
              {t('heroBadge')}
            </span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            {t('heroTitleLine1')}{' '}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1E5631] to-[#2E7D32] mt-1 sm:mt-2">
              {t('heroTitleLine2')}
            </span>
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto mb-6">
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xl shadow-emerald-950/8 border border-slate-200/90 flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            {/* City Selector */}
            <div className="relative sm:w-48 shrink-0 flex items-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 px-2">
              <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mr-2" />
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              >
                {cities.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center px-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder={t('heroSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
              />
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl sm:rounded-2xl bg-[#1E5631] hover:bg-[#2E7D32] active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-emerald-950/15 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{t('heroSearchBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Popular Search Tags */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {t('heroPopularTags')}
            </span>
            {popularTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#1E5631] border border-slate-200/90 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              >
                {lang === 'mr' ? tag.mr : tag.en}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Trust & Metrics Badges */}
        <div className="max-w-4xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-[#1E5631] shrink-0">
              <Store className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {totalNurseries > 0 ? `${totalNurseries}+` : '20+'}
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                {t('heroStatNurseries')}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-[#1E5631] shrink-0">
              <Sprout className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {totalPlants > 0 ? `${totalPlants}+` : '150+'}
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                {t('heroStatPlants')}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-[#1E5631] shrink-0">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                4 Hubs
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Sangli, Miraj, Kolhapur, Karad
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-[#1E5631] shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                100% Direct
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Zero Commission WhatsApp & Calls
              </p>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
