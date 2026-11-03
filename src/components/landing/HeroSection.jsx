import React from 'react';
import { 
  Search, MapPin, Leaf, CheckCircle2, PhoneCall, Sparkles, Store, Sprout, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import heroBg from '../../assets/landing-bg.jpg';

export default function HeroSection({ 
  searchQuery, 
  onSearchChange, 
  selectedCity, 
  onCityChange,
  totalNurseries = 0,
  totalPlants = 0,
  onSearchSubmit,
  cities = []
}) {
  const { lang, t } = useLanguage();

  const cityOptions = [
    { value: 'all', label: t('heroAllCities') },
    ...(cities.length > 0
      ? cities.map(c => ({
          value: c.nameEn,
          label: lang === 'mr' && c.nameMr ? c.nameMr : c.nameEn
        }))
      : [
          { value: 'Sangli', label: t('heroCitySangli') },
          { value: 'Miraj', label: t('heroCityMiraj') },
          { value: 'Kolhapur', label: t('heroCityKolhapur') },
          { value: 'Karad', label: t('heroCityKarad') }
        ])
  ];

  const hubsCount = cities.length > 0 ? cities.length : 4;
  const hubsNames = cities.length > 0
    ? cities.map(c => (lang === 'mr' && c.nameMr ? c.nameMr : c.nameEn)).join(', ')
    : 'Sangli, Miraj, Kolhapur, Karad';

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
    <section className="relative overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-28 lg:pb-32">
      
      {/* Botanical Background Image with Luminous Overlay */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img 
          src={heroBg} 
          alt="TreeBazzar Botanical Nursery Background" 
          className="w-full h-full object-cover object-center sm:object-bottom"
        />
        {/* Soft, vibrant gradient overlay for crisp typography and contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/55 to-[#F8FAF9]/95 backdrop-blur-[0.5px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Regional Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/90 text-[#1E5631] shadow-2xs">
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
          <p className="mt-4 text-xs sm:text-sm text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto mb-6">
          <form 
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xl shadow-emerald-950/10 border border-white/90 flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            {/* City Selector */}
            <div className="relative sm:w-48 shrink-0 flex items-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 px-2">
              <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mr-2" />
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              >
                {cityOptions.map(c => (
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
          
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 flex items-center justify-center text-[#1E5631] shrink-0">
              <Store className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {totalNurseries > 0 ? `${totalNurseries}+` : '20+'}
              </div>
              <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                {t('heroStatNurseries')}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 flex items-center justify-center text-[#1E5631] shrink-0">
              <Sprout className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                {totalPlants > 0 ? `${totalPlants}+` : '150+'}
              </div>
              <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                {t('heroStatPlants')}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 flex items-center justify-center text-[#1E5631] shrink-0">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-black text-slate-900 leading-tight">
                {hubsCount} {lang === 'mr' ? 'हब्स' : 'Hubs'}
              </div>
              <p className="text-[10px] text-slate-600 font-semibold leading-tight line-clamp-1 truncate" title={hubsNames}>
                {hubsNames}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 flex items-center justify-center text-[#1E5631] shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-tight">
                100% Direct
              </div>
              <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                Zero Commission WhatsApp & Calls
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Multi-Layer Botanical Wave Divider Transition */}
      <div className="absolute -bottom-px left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          className="relative block w-full h-12 sm:h-16 lg:h-20"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Layer 1: Subtle Botanical Emerald Wave */}
          <path
            d="M0,35 C360,90 720,10 1080,65 C1260,90 1380,45 1440,30 L1440,120 L0,120 Z"
            fill="#10B981"
            fillOpacity="0.18"
          />
          {/* Layer 2: Frosted Mint Wave */}
          <path
            d="M0,60 C240,15 600,80 960,35 C1200,65 1350,30 1440,50 L1440,120 L0,120 Z"
            fill="#ECFDF5"
            fillOpacity="0.75"
          />
          {/* Layer 3: Pure White Wave merging into Category Cards section */}
          <path
            d="M0,82 C320,40 640,100 1020,52 C1240,28 1380,75 1440,65 L1440,120 L0,120 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

    </section>
  );
}
