import React, { useState, useMemo } from 'react';
import { 
  Sprout, MessageSquare, Check, X, Tag, Store, Search, Filter, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_PLANT_IMAGE } from '../../data/mockData';

export default function FeaturedPlants({ 
  plants = [], 
  nurseries = [], 
  selectedCategory = 'all', 
  onSelectCategory,
  searchQuery = '', 
  selectedCity = 'all',
  onContactLead
}) {
  const { lang, t } = useLanguage();
  const [stockOnly, setStockOnly] = useState(false);

  const categories = [
    { id: 'all', label: t('categoryAll') },
    { id: 'Fruit Trees', label: t('catFruitTrees') },
    { id: 'Indoor Plants', label: t('catIndoorPlants') },
    { id: 'Flowering Plants', label: t('catFloweringPlants') },
    { id: 'Farm Trees', label: t('catFarmTrees') },
    { id: 'Vegetables', label: t('catVegetables') }
  ];

  // Helper map nursery ID to nursery details
  const nurseryMap = useMemo(() => {
    const map = {};
    nurseries.forEach(n => {
      map[n.id] = n;
      map[n.name] = n;
    });
    return map;
  }, [nurseries]);

  // Filtered plant list
  const filteredPlants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return plants.filter(plant => {
      // Category filter
      if (selectedCategory !== 'all' && plant.category !== selectedCategory) {
        return false;
      }

      // Stock filter
      if (stockOnly && plant.stockStatus === 'out_of_stock') {
        return false;
      }

      // Only show plants from nurseries that are active (paid subscribed or auto-approved active trial)
      const linkedNursery = nurseryMap[plant.nurseryId] || nurseryMap[plant.nurseryName];
      if (linkedNursery) {
        if (linkedNursery.isSuspended || linkedNursery.status === 'suspended' || linkedNursery.status === 'rejected' || linkedNursery.status === 'revoked') {
          return false;
        }
        if (linkedNursery.isTrialExpired) {
          return false;
        }
        const isEligible = Boolean(
          linkedNursery.isTrialActive ||
          linkedNursery.autoApproved ||
          ((linkedNursery.isSubscribed === true || linkedNursery.subscriptionStatus === 'active' || linkedNursery.subscriptionPlan === 'paid_annual' || linkedNursery.paymentStatus === 'paid') &&
            linkedNursery.status === 'approved')
        );
        if (!isEligible) {
          return false;
        }
      }

      // City filter based on nursery
      if (selectedCity !== 'all' && linkedNursery) {
        if (linkedNursery.city?.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // Keyword query filter
      if (q) {
        // 1. Generic plant search keywords -> user typed "plant", "plants", "झाड", "झाडे", "रोप", "रोपे", "वनस्पती", "प्लांट" -> match all plants
        const genericPlantKeywords = ['plant', 'plants', 'tree', 'trees', 'झाड', 'झाडे', 'रोप', 'रोपे', 'वनस्पती', 'प्लांट', 'कलम', 'रोपांची'];
        if (genericPlantKeywords.some(k => q.includes(k) || k.includes(q))) {
          return true;
        }

        // 2. Generic nursery keywords -> user typed "nursery", "नर्सरी", "रोपवाटिका" -> show all plants from nurseries
        const genericNurseryKeywords = ['nursery', 'nurseries', 'नर्सरी', 'रोपवाटिका', 'रोपवाटिकांची'];
        if (genericNurseryKeywords.some(k => q.includes(k) || k.includes(q))) {
          return true;
        }

        const nameEn = (plant.nameEn || plant.name || '').toLowerCase();
        const nameMr = (plant.nameMr || '').toLowerCase();
        const botanical = (plant.botanicalName || '').toLowerCase();
        const category = (plant.category || '').toLowerCase();
        const categoryMr = (plant.categoryMr || '').toLowerCase();
        const descEn = (plant.descriptionEn || plant.description || '').toLowerCase();
        const descMr = (plant.descriptionMr || '').toLowerCase();
        const nurseryName = (plant.nurseryName || linkedNursery?.name || '').toLowerCase();
        const nurseryNameMr = (linkedNursery?.nameMr || '').toLowerCase();
        const city = (linkedNursery?.city || '').toLowerCase();

        return (
          nameEn.includes(q) ||
          nameMr.includes(q) ||
          botanical.includes(q) ||
          category.includes(q) ||
          categoryMr.includes(q) ||
          descEn.includes(q) ||
          descMr.includes(q) ||
          nurseryName.includes(q) ||
          nurseryNameMr.includes(q) ||
          city.includes(q)
        );
      }

      return true;
    });
  }, [plants, selectedCategory, stockOnly, selectedCity, searchQuery, nurseryMap]);

  const handleWhatsAppInquiry = (e, plant) => {
    e.stopPropagation();
    const linkedNursery = nurseryMap[plant.nurseryId] || nurseryMap[plant.nurseryName];
    const phone = (linkedNursery?.whatsapp || linkedNursery?.phone || '9822145678').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const plantName = lang === 'mr' && plant.nameMr ? plant.nameMr : (plant.nameEn || plant.name);
    const nurseryName = linkedNursery?.name || plant.nurseryName || 'TreeBazzar Nursery';

    const msg = encodeURIComponent(
      lang === 'mr'
        ? `नमस्कार ${nurseryName}, मी ट्री बाजार (TreeBazzar) वर आपले '${plantName}' (किंमत ₹${plant.priceMin} - ₹${plant.priceMax}) पाहिले. मला याच्या उपलब्धतेबद्दल आणि खरेदीबद्दल माहिती हवी आहे.`
        : `Hello ${nurseryName}, I found your listing for '${plantName}' (₹${plant.priceMin} - ₹${plant.priceMax}) on TreeBazzar. Please let me know its availability and delivery options.`
    );

    if (onContactLead) {
      onContactLead({
        customerName: 'Website Visitor',
        customerPhone: '+91 98XXXXXX',
        customerCity: linkedNursery?.city || (selectedCity !== 'all' ? selectedCity : ''),
        type: 'whatsapp',
        plantOrNursery: `${plantName} (${nurseryName})`,
        notes: `Customer WhatsApp inquiry on plant: ${plantName} - ₹${plant.priceMin}-₹${plant.priceMax}`
      });
    }

    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <section id="plants" className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E5631] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{t('landingNavPlants')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('plantsTitle')}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {t('plantsSubtitle')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-8 bg-[#F8FAF9] p-3 rounded-2xl border border-slate-200/80">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1E5631] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Actions: In Stock Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
            {/* In Stock Only Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-semibold shrink-0">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#1E5631] focus:ring-[#2E7D32] w-4 h-4 cursor-pointer"
              />
              <span>{lang === 'mr' ? 'फक्त उपलब्ध झाडे (In Stock)' : 'In Stock Only'}</span>
            </label>
          </div>

        </div>

        {/* Search Results Indicator Bar */}
        {searchQuery && (
          <div className="mb-6 p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
              <span className="text-xs font-bold text-[#1E5631]">
                {lang === 'mr' 
                  ? `"${searchQuery}" साठी ${filteredPlants.length} वनस्पती / रोपे उपलब्ध`
                  : `Found ${filteredPlants.length} plants matching "${searchQuery}"`}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {lang === 'mr' ? 'थेट व्हॉट्सॲपवर माहिती विचारा' : 'Direct WhatsApp inquiry to nursery'}
            </span>
          </div>
        )}

        {/* Plants Grid */}
        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredPlants.map((plant) => {
              const plantName = lang === 'mr' && plant.nameMr ? plant.nameMr : (plant.nameEn || plant.name);
              const subName = lang === 'mr' ? plant.nameEn : (plant.botanicalName || plant.nameMr);
              const linkedNursery = nurseryMap[plant.nurseryId] || nurseryMap[plant.nurseryName];
              const nurseryName = linkedNursery?.name || plant.nurseryName || 'Local Nursery';
              const nurseryCity = linkedNursery?.city || '';
              const isInStock = plant.stockStatus !== 'out_of_stock';
              const imgUrl = plant.photoUrl || plant.image || FALLBACK_PLANT_IMAGE;

              return (
                <div
                  key={plant.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:shadow-emerald-950/8 transition-all flex flex-col group relative"
                >
                  {/* Plant Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={plantName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = FALLBACK_PLANT_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Stock Status & New Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {plant.isNew && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-md animate-pulse">
                          {lang === 'mr' ? 'नवीन' : 'NEW'}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 ${
                        isInStock 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-amber-600 text-white'
                      }`}>
                        {isInStock ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {isInStock ? t('plantInStock') : t('plantOutOfStock')}
                      </span>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-white/95 text-slate-700 text-[10px] font-bold shadow-xs">
                        {plant.category}
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-2.5 left-2.5 text-white">
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs">
                        ₹{plant.priceMin} - ₹{plant.priceMax}
                      </span>
                    </div>
                  </div>

                  {/* Plant Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1E5631] transition-colors leading-tight">
                        {plantName}
                      </h3>
                      {subName && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                          {subName}
                        </p>
                      )}

                      {/* Nursery & Location Linkage */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]" title={nurseryName}>
                          {nurseryName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {nurseryCity}
                        </span>
                      </div>
                    </div>

                    {/* Inquire on WhatsApp Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWhatsAppInquiry(e, plant)}
                      className="mt-3.5 w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-[#1E5631] text-[#1E5631] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200/80 hover:border-[#1E5631] transition-all cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#2E7D32] group-hover:text-white" />
                      <span>{t('plantInquireWhatsApp')}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#F8FAF9] rounded-3xl p-10 text-center border border-slate-200">
            <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {searchQuery
                ? (lang === 'mr' ? `"${searchQuery}" नावाशी जुळणारी झाडे आढळली नाहीत` : `No plants found matching "${searchQuery}"`)
                : (lang === 'mr' ? 'कोणतीही झाडे आढळली नाहीत' : 'No plants match your search or filters')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? (lang === 'mr' ? 'वर दिलेली रोपवाटिका यादी पहा किंवा दुसरा शोध शब्द वापरा.' : 'Check the nurseries section above or try another search term.')
                : (lang === 'mr' ? 'कृपया दुसरा शब्द किंवा श्रेणी निवडून प्रयत्न करा' : 'Try searching another variety or selecting all categories')}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
