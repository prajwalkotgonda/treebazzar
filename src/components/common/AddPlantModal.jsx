import React, { useState, useEffect } from 'react';
import { X, Sprout, Image, DollarSign, Building2, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PLANT_CATEGORIES, FALLBACK_PLANT_IMAGE } from '../../data/mockData';

export default function AddPlantModal({ 
  isOpen, 
  onClose, 
  onAddPlant, 
  nurseries = [] 
}) {
  const { t, lang } = useLanguage();

  const [formData, setFormData] = useState({
    nameEn: '',
    nameMr: '',
    botanicalName: '',
    category: 'Fruit Trees',
    nurseryId: nurseries[0]?.id || '',
    nurseryName: nurseries[0]?.name || '',
    priceMin: '',
    priceMax: '',
    stockStatus: 'in_stock',
    photoUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    descriptionEn: '',
    descriptionMr: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && (!formData.nurseryId || !nurseries.find(n => n.id === formData.nurseryId))) {
      if (nurseries.length > 0) {
        setFormData(prev => ({
          ...prev,
          nurseryId: nurseries[0].id,
          nurseryName: nurseries[0].name
        }));
      }
    }
  }, [isOpen, nurseries]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.nameEn.trim()) {
      errs.nameEn = lang === 'mr' ? 'इंग्रजी नाव आवश्यक आहे' : 'English name is required';
    }
    if (!formData.nameMr.trim()) {
      errs.nameMr = lang === 'mr' ? 'मराठी नाव आवश्यक आहे' : 'Marathi name is required';
    }
    if (!formData.priceMin || Number(formData.priceMin) <= 0) {
      errs.priceMin = lang === 'mr' ? 'वैध किमान किंमत टाका' : 'Enter a valid minimum price';
    }
    if (!formData.priceMax || Number(formData.priceMax) <= 0) {
      errs.priceMax = lang === 'mr' ? 'वैध कमाल किंमत टाका' : 'Enter a valid maximum price';
    }
    if (Number(formData.priceMin) > Number(formData.priceMax)) {
      errs.priceMax = lang === 'mr' ? 'कमाल किंमत किमान पेक्षा जास्त असावी' : 'Max price must be greater than or equal to Min price';
    }
    if (!formData.nurseryId) {
      errs.nursery = lang === 'mr' ? 'रोपवाटिका निवडा' : 'Please select an associated nursery';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNurseryChange = (e) => {
    const selectedId = e.target.value;
    const selectedNursery = nurseries.find(n => n.id === selectedId);
    setFormData(prev => ({
      ...prev,
      nurseryId: selectedId,
      nurseryName: selectedNursery ? selectedNursery.name : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onAddPlant({
      ...formData,
      priceMin: Number(formData.priceMin),
      priceMax: Number(formData.priceMax),
      photoUrl: formData.photoUrl.trim() || FALLBACK_PLANT_IMAGE,
      isNew: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E5631] flex items-center justify-center border border-emerald-100">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {t('addPlantTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('addPlantSubtitle')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelPlantNameEn')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kesar Mango Grafted Sapling"
                value={formData.nameEn}
                onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden transition-all ${
                  errors.nameEn ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#2E7D32]'
                }`}
              />
              {errors.nameEn && <p className="text-[11px] text-rose-500 mt-1">{errors.nameEn}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelPlantNameMr')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. केसर आंबा कलम रोपे"
                value={formData.nameMr}
                onChange={e => setFormData({ ...formData, nameMr: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden transition-all ${
                  errors.nameMr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#2E7D32]'
                }`}
              />
              {errors.nameMr && <p className="text-[11px] text-rose-500 mt-1">{errors.nameMr}</p>}
            </div>
          </div>

          {/* Botanical Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelBotanicalName')}
              </label>
              <input
                type="text"
                placeholder="e.g. Mangifera indica"
                value={formData.botanicalName}
                onChange={e => setFormData({ ...formData, botanicalName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelCategory')}
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-hidden bg-white appearance-none"
                >
                  {PLANT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Nursery Linkage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('labelNursery')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.nurseryId}
                onChange={handleNurseryChange}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden bg-white appearance-none ${
                  errors.nursery ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#2E7D32]'
                }`}
              >
                {nurseries.length > 0 ? (
                  nurseries.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.city})
                    </option>
                  ))
                ) : (
                  <option value="">No registered nurseries</option>
                )}
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.nursery && <p className="text-[11px] text-rose-500 mt-1">{errors.nursery}</p>}
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelPriceMin')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="80"
                  value={formData.priceMin}
                  onChange={e => setFormData({ ...formData, priceMin: e.target.value })}
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    errors.priceMin ? 'border-rose-400' : 'border-slate-200 focus:border-[#2E7D32]'
                  }`}
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              </div>
              {errors.priceMin && <p className="text-[11px] text-rose-500 mt-1">{errors.priceMin}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelPriceMax')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="120"
                  value={formData.priceMax}
                  onChange={e => setFormData({ ...formData, priceMax: e.target.value })}
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border focus:outline-hidden ${
                    errors.priceMax ? 'border-rose-400' : 'border-slate-200 focus:border-[#2E7D32]'
                  }`}
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              </div>
              {errors.priceMax && <p className="text-[11px] text-rose-500 mt-1">{errors.priceMax}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelStockStatus')}
              </label>
              <select
                value={formData.stockStatus}
                onChange={e => setFormData({ ...formData, stockStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-hidden bg-white"
              >
                <option value="in_stock">{t('stockIn')}</option>
                <option value="out_of_stock">{t('stockOut')}</option>
              </select>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('labelPhotoUrl')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-hidden"
              />
              <div className="w-9 h-9 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                <img 
                  src={formData.photoUrl || FALLBACK_PLANT_IMAGE} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = FALLBACK_PLANT_IMAGE; }}
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelDescriptionEn')}
              </label>
              <textarea
                rows="2"
                placeholder="Short description of variety, fruiting time, etc."
                value={formData.descriptionEn}
                onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('labelDescriptionMr')}
              </label>
              <textarea
                rows="2"
                placeholder="झाडाचे वैशिष्ट्य, फळधारणेची वेळ व माहिती..."
                value={formData.descriptionMr}
                onChange={e => setFormData({ ...formData, descriptionMr: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#1E5631] hover:bg-[#2E7D32] rounded-xl shadow-sm transition-all"
            >
              {t('btnSavePlant')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
