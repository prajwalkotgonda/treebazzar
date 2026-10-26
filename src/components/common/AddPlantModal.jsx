import React, { useState, useMemo } from 'react';
import { X, Sprout, Image, DollarSign, Tag, Check, AlertCircle, Building2, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PRESET_PLANT_PHOTOS, FALLBACK_PLANT_IMAGE } from '../../data/mockData';

export const DEFAULT_NURSERY_OPTIONS = [
  { id: 'nur-central-01', name: 'TreeBazzar Central Nursery', nameMr: 'ट्रीबाजार मध्यवर्ती रोपवाटिका', city: 'Sangli', district: 'Sangli', ownerPhone: '+91 98220 12345' },
  { id: 'nur-ganesh-02', name: 'Shree Ganesh Hi-Tech Nursery', nameMr: 'श्री गणेश हाय-टेक रोपवाटिका', city: 'Miraj', district: 'Sangli', ownerPhone: '+91 98220 54321' },
  { id: 'nur-krishna-03', name: 'Krishna Agro Nursery', nameMr: 'कृष्णा ॲग्रो रोपवाटिका', city: 'Kolhapur', district: 'Kolhapur', ownerPhone: '+91 98220 98765' },
  { id: 'nur-bhushan-04', name: 'Bhushan Hi-Tech Nursery', nameMr: 'भूषण हाय-टेक रोपवाटिका', city: 'Tasgaon', district: 'Sangli', ownerPhone: '+91 98220 67890' },
  { id: 'nur-sahyadri-05', name: 'Sahyadri Agri Nursery', nameMr: 'सह्याद्री ॲग्री रोपवाटिका', city: 'Pune', district: 'Pune', ownerPhone: '+91 98220 44556' }
];

export default function AddPlantModal({ 
  isOpen, 
  onClose, 
  onAddPlant, 
  onAddNursery,
  nurseries = [] 
}) {
  const { t, lang } = useLanguage();

  const initialNurseryId = useMemo(() => {
    if (nurseries && nurseries.length > 0) {
      return nurseries[0].id;
    }
    return DEFAULT_NURSERY_OPTIONS[0].id;
  }, [nurseries]);

  const [formData, setFormData] = useState({
    nameEn: '',
    nameMr: '',
    botanicalName: '',
    category: 'Fruit Trees',
    nurseryId: initialNurseryId,
    customNurseryName: '',
    customNurseryCity: 'Sangli',
    priceMin: '',
    priceMax: '',
    unit: 'Grafted Sapling',
    stockStatus: 'in_stock',
    stockCount: 500,
    photoUrl: PRESET_PLANT_PHOTOS[0].url,
    descriptionEn: '',
    descriptionMr: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const categories = [
    { value: 'Fruit Trees', labelEn: 'Fruit Trees', labelMr: 'फळझाडे व कलमे' },
    { value: 'Indoor', labelEn: 'Indoor & Ornamental', labelMr: 'घरातील व शोभिवंत झाडे' },
    { value: 'Flowers', labelEn: 'Flowers & Landscaping', labelMr: 'फुले व बागकाम' },
    { value: 'Farm Trees', labelEn: 'Farm & Agroforestry Trees', labelMr: 'शेती व वनशेती झाडे' },
    { value: 'Vegetables', labelEn: 'Vegetable Seedlings', labelMr: 'भाजीपाला रोपे' },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.nameEn.trim()) errs.nameEn = lang === 'mr' ? 'इंग्रजी नाव आवश्यक आहे' : 'English name is required';
    if (!formData.nameMr.trim()) errs.nameMr = lang === 'mr' ? 'मराठी नाव आवश्यक आहे' : 'Marathi name is required';
    if (!formData.priceMin) errs.priceMin = lang === 'mr' ? 'किमान किंमत आवश्यक आहे' : 'Min price is required';
    if (!formData.priceMax) errs.priceMax = lang === 'mr' ? 'कमाल किंमत आवश्यक आहे' : 'Max price is required';
    if (Number(formData.priceMin) > Number(formData.priceMax)) {
      errs.priceMax = lang === 'mr' ? 'कमाल किंमत किमान पेक्षा जास्त असावी' : 'Max price must be >= Min price';
    }
    if (formData.nurseryId === 'CUSTOM' && !formData.customNurseryName.trim()) {
      errs.nursery = lang === 'mr' ? 'कृपया रोपवाटिकेचे नाव टाका' : 'Please enter nursery name';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let finalNurseryId = formData.nurseryId;
    let resolvedNurseryName = 'TreeBazzar Master Nursery';

    if (formData.nurseryId === 'CUSTOM') {
      const cName = formData.customNurseryName.trim();
      const cCity = formData.customNurseryCity.trim() || 'Sangli';
      finalNurseryId = `nur-${Date.now()}`;
      resolvedNurseryName = cName;

      if (onAddNursery) {
        onAddNursery({
          id: finalNurseryId,
          name: cName,
          nurseryName: cName,
          nameMr: cName,
          city: cCity,
          district: cCity,
          phone: '+91 98220 00000',
          ownerPhone: '+91 98220 00000',
          ownerName: 'Admin Registered',
          owner: 'Admin Registered',
          status: 'approved',
          verified: true,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      const found = (nurseries || []).find(n => n.id === formData.nurseryId) 
        || DEFAULT_NURSERY_OPTIONS.find(n => n.id === formData.nurseryId)
        || DEFAULT_NURSERY_OPTIONS[0];

      finalNurseryId = found.id;
      resolvedNurseryName = lang === 'mr' && found.nameMr 
        ? found.nameMr 
        : (found.name || found.nurseryName || 'TreeBazzar Nursery');
    }

    const chosenPhoto = formData.photoUrl || PRESET_PLANT_PHOTOS[0].url;
    const isCurrentlyInStock = formData.stockStatus === 'in_stock';
    const minP = Number(formData.priceMin) || 100;
    const maxP = Number(formData.priceMax) || minP;

    const newPlant = {
      id: `plt-${Date.now()}`,
      name: formData.nameEn,
      nameEn: formData.nameEn,
      nameMr: formData.nameMr,
      botanicalName: formData.botanicalName || 'Botanical var. sp.',
      category: formData.category,
      categoryMr: categories.find(c => c.value === formData.category)?.labelMr || formData.category,
      nurseryId: finalNurseryId,
      nurseryName: resolvedNurseryName,
      price: minP,
      priceMin: minP,
      priceMax: maxP,
      unit: formData.unit || 'Sapling',
      unitMr: lang === 'mr' ? 'कलम रोप' : 'Sapling',
      stockStatus: formData.stockStatus,
      isActive: isCurrentlyInStock,
      stockCount: Number(formData.stockCount) || 200,
      photoUrl: chosenPhoto,
      images: [chosenPhoto],
      description: formData.descriptionEn || 'High-yielding acclimatized variety.',
      descriptionEn: formData.descriptionEn || 'High-yielding acclimatized variety.',
      descriptionMr: formData.descriptionMr || 'उत्कृष्ट दर्जेदार प्रमाणित वनस्पती.',
      varieties: [
        {
          varietyName: formData.unit || 'Standard Graft',
          price: minP,
          inStock: isCurrentlyInStock
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddPlant(newPlant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E5631] to-[#2E7D32] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t('addPlantTitle')}</h3>
              <p className="text-xs text-emerald-100">{t('addPlantSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Bilingual Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('plantNameEn')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Kesar Mango Graft"
                className={`w-full text-xs p-3 rounded-xl border ${errors.nameEn ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
              />
              {errors.nameEn && <p className="text-[11px] text-rose-600 mt-1">{errors.nameEn}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('plantNameMr')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameMr}
                onChange={(e) => setFormData({ ...formData, nameMr: e.target.value })}
                placeholder="उदा. कलमी केसर आंबा"
                className={`w-full text-xs p-3 rounded-xl border ${errors.nameMr ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
              />
              {errors.nameMr && <p className="text-[11px] text-rose-600 mt-1">{errors.nameMr}</p>}
            </div>
          </div>

          {/* Botanical Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('botanicalName')}
              </label>
              <input
                type="text"
                value={formData.botanicalName}
                onChange={(e) => setFormData({ ...formData, botanicalName: e.target.value })}
                placeholder="e.g. Mangifera indica"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('plantCategory')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {lang === 'mr' ? c.labelMr : c.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Associated Nursery & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                <span>{t('selectNursery')} <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-emerald-700 font-semibold lowercase">
                  {lang === 'mr' ? '(रोपवाटिका निवडा)' : '(Select nursery)'}
                </span>
              </label>
              <select
                value={formData.nurseryId}
                onChange={(e) => setFormData({ ...formData, nurseryId: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] font-medium text-slate-800"
              >
                {/* Registered Nurseries if available */}
                {nurseries && nurseries.length > 0 && (
                  <optgroup label={lang === 'mr' ? '🌟 नोंदणीकृत रोपवाटिका (Registered)' : '🌟 Registered Nurseries'}>
                    {nurseries.map((n) => (
                      <option key={n.id} value={n.id}>
                        {lang === 'mr' && n.nameMr ? n.nameMr : (n.name || n.nurseryName || 'Nursery')} ({n.city || n.district || 'Maharashtra'})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Default Trusted Hub Nurseries */}
                <optgroup label={lang === 'mr' ? '🌿 प्रमाणित प्रादेशिक रोपवाटिका (Hubs)' : '🌿 Regional Nursery Hubs'}>
                  {DEFAULT_NURSERY_OPTIONS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {lang === 'mr' ? n.nameMr : n.name} ({n.city})
                    </option>
                  ))}
                </optgroup>

                {/* Custom Nursery Entry */}
                <optgroup label={lang === 'mr' ? '➕ नवीन रोपवाटिका पर्याय' : '➕ Add Custom Nursery'}>
                  <option value="CUSTOM">
                    {lang === 'mr' ? '+ थेट नवीन रोपवाटिकेचे नाव टाका (Type Custom Nursery)' : '+ Enter Custom Nursery Name'}
                  </option>
                </optgroup>
              </select>

              {/* Slide-down fields when "CUSTOM" nursery is chosen */}
              {formData.nurseryId === 'CUSTOM' && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      {lang === 'mr' ? 'रोपवाटिकेचे नाव' : 'New Nursery Name'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customNurseryName}
                      onChange={(e) => setFormData({ ...formData, customNurseryName: e.target.value })}
                      placeholder="e.g. Omkar Hi-Tech Nursery"
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      {lang === 'mr' ? 'शहर / तालुका' : 'City / Location'}
                    </label>
                    <input
                      type="text"
                      value={formData.customNurseryCity}
                      onChange={(e) => setFormData({ ...formData, customNurseryCity: e.target.value })}
                      placeholder="e.g. Sangli"
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>
              )}
              {errors.nursery && <p className="text-[11px] text-rose-600 mt-1">{errors.nursery}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('unitType')}
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. Grafted Sapling, 8-inch Pot"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* Price Range & Initial Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('minPrice')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.priceMin}
                  onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                  placeholder="50"
                  className={`w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border ${errors.priceMin ? 'border-rose-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
                />
              </div>
              {errors.priceMin && <p className="text-[11px] text-rose-600 mt-1">{errors.priceMin}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('maxPrice')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  placeholder="120"
                  className={`w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border ${errors.priceMax ? 'border-rose-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
                />
              </div>
              {errors.priceMax && <p className="text-[11px] text-rose-600 mt-1">{errors.priceMax}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('initialStock')}
              </label>
              <select
                value={formData.stockStatus}
                onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="in_stock">{t('stockInStock')}</option>
                <option value="out_of_stock">{t('stockOutOfStock')}</option>
              </select>
            </div>
          </div>

          {/* Photo URL & Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t('photoUrlLabel')}
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PLANT_IMAGE;
                    }}
                  />
                ) : (
                  <Image className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://..."
                className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            {/* Botanical Presets */}
            <div className="bg-[#F8FAF9] p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {t('presetPhotos')}:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {PRESET_PLANT_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: preset.url })}
                    className={`relative rounded-lg overflow-hidden border-2 aspect-square group transition-all ${
                      formData.photoUrl === preset.url ? 'border-[#1E5631] ring-2 ring-[#2E7D32]' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.label} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_PLANT_IMAGE;
                      }}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] p-0.5 truncate text-center block leading-tight">
                      {lang === 'mr' && preset.labelMr ? preset.labelMr : preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('descEn')}
              </label>
              <textarea
                rows={2}
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="High-yielding grafted variety suited for local soil..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('descMr')}
              </label>
              <textarea
                rows={2}
                value={formData.descriptionMr}
                onChange={(e) => setFormData({ ...formData, descriptionMr: e.target.value })}
                placeholder="पश्चिम महाराष्ट्राच्या हवामानासाठी योग्य व निरोगी रोपे..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              {t('btnSubmitPlant')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
