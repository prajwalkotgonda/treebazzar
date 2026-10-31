import React from 'react';
import { Apple, Home, Flower2, Trees, Carrot, ArrowRight, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CategoryCards({ selectedCategory, onSelectCategory, plants = [] }) {
  const { lang, t } = useLanguage();

  const categories = [
    {
      id: 'Fruit Trees',
      nameEn: 'Fruit Trees',
      nameMr: 'फळझाडे',
      descEn: 'Kesar Mango, Guava, Chiku, Lemon, Pomegranate',
      descMr: 'केशर आंबा, सरदार पेरू, चिकू, लिंबू, डाळिंब',
      icon: Apple,
      color: 'bg-amber-50 text-amber-800 border-amber-200/80 group-hover:border-amber-300'
    },
    {
      id: 'Indoor Plants',
      nameEn: 'Indoor Plants',
      nameMr: 'इनडोअर रोपे',
      descEn: 'Areca Palm, Snake Plant, Money Plant, ZZ Plant',
      descMr: 'अरेका पाम, स्नेक प्लांट, मनी प्लांट, सजावटी रोपे',
      icon: Home,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 group-hover:border-emerald-300'
    },
    {
      id: 'Flowering Plants',
      nameEn: 'Flowering Plants',
      nameMr: 'फुलझाडे',
      descEn: 'Desi Rose, Mogra, Hibiscus, Bougainvillea',
      descMr: 'देशी गुलाब, मोगरा, जास्वंद, बोगनवेली, शेवंती',
      icon: Flower2,
      color: 'bg-rose-50 text-rose-800 border-rose-200/80 group-hover:border-rose-300'
    },
    {
      id: 'Farm Trees',
      nameEn: 'Farm & Timber Trees',
      nameMr: 'शेती व इमारती झाडे',
      descEn: 'Tissue Teak (Sagwan), Bamboo, Mahogany, Neem',
      descMr: 'टिश्यू कल्चर सागवान, बांबू, महोगनी, लिंब',
      icon: Trees,
      color: 'bg-teal-50 text-teal-800 border-teal-200/80 group-hover:border-teal-300'
    },
    {
      id: 'Vegetables',
      nameEn: 'Vegetable Seedlings',
      nameMr: 'भाजीपाला व रोपे',
      descEn: 'Tomato, Chilli, Brinjal, Curry leaf seedlings',
      descMr: 'टोमॅटो, मिरची, वांगी, कढीपत्ता, सेंद्रिय रोपे',
      icon: Carrot,
      color: 'bg-orange-50 text-orange-800 border-orange-200/80 group-hover:border-orange-300'
    }
  ];

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId === selectedCategory ? 'all' : catId);
    const plantsElem = document.getElementById('plants');
    if (plantsElem) plantsElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categories" className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E5631] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{t('landingNavCategories')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('categoriesTitle')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {t('categoriesSubtitle')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = plants.filter(p => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`group text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-lg shadow-emerald-950/20 ring-2 ring-[#2E7D32]' 
                    : 'bg-[#F8FAF9] hover:bg-white border-slate-200 hover:border-[#2E7D32]/40 hover:shadow-md hover:shadow-emerald-950/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-white/10 text-white border-white/20' : cat.color
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {count} {lang === 'mr' ? 'प्रकार' : 'types'}
                  </span>
                </div>

                <h3 className={`text-sm font-bold tracking-tight mb-1 ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}>
                  {lang === 'mr' ? cat.nameMr : cat.nameEn}
                </h3>
                <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                  isSelected ? 'text-emerald-100' : 'text-slate-500'
                }`}>
                  {lang === 'mr' ? cat.descMr : cat.descEn}
                </p>

                <div className={`mt-3 flex items-center gap-1 text-[11px] font-bold ${
                  isSelected ? 'text-emerald-300' : 'text-[#2E7D32] opacity-0 group-hover:opacity-100 transition-opacity'
                }`}>
                  <span>{lang === 'mr' ? 'झाडे पहा' : 'View Plants'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
