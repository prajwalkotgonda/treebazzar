import React, { useState } from 'react';
import { X, MessageSquare, Check, Phone, User, Store } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AddEnquiryModal({ 
  isOpen, 
  onClose, 
  onAddEnquiry, 
  nurseries = [], 
  plants = [], 
  cities = [] 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerCity: cities[0]?.nameEn || 'Sangli',
    plantName: '',
    nurseryName: '',
    inquiryType: 'WhatsApp',
    notes: '',
    status: 'New'
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = lang === 'mr' ? 'ग्राहकाचे नाव आवश्यक आहे' : 'Customer name is required';
    }
    if (!formData.customerPhone.trim()) {
      errs.customerPhone = lang === 'mr' ? 'फोन नंबर आवश्यक आहे' : 'Phone number is required';
    }
    if (!formData.plantName.trim()) {
      errs.plantName = lang === 'mr' ? 'झाडाचे किंवा विषयाचे नाव आवश्यक आहे' : 'Plant or inquiry topic is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newEnquiry = {
      id: `inq-${Date.now().toString().slice(-4)}`,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerCity: formData.customerCity,
      plantName: formData.plantName.trim(),
      nurseryName: formData.nurseryName.trim() || (nurseries[0]?.name || 'Bhushan Hi-Tech Nursery'),
      inquiryType: formData.inquiryType,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: formData.status,
      notes: formData.notes.trim()
    };

    onAddEnquiry(newEnquiry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'नवीन चौकशी नोंदवा' : 'Record New Customer Enquiry'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'mr' ? 'थेट व्हॉट्सॲप किंवा फोन कॉल नोंद' : 'WhatsApp lead or phone call log'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'ग्राहकाचे नाव *' : 'Customer Name *'}
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.customerName ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. Ramesh Patil"
              />
              {errors.customerName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'फोन नंबर *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.customerPhone ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. 9822145678"
              />
              {errors.customerPhone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.customerPhone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'शहर निवडा' : 'Customer City'}
              </label>
              <select
                value={formData.customerCity}
                onChange={e => setFormData({ ...formData, customerCity: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                {cities.map(c => (
                  <option key={c.id || c.nameEn} value={c.nameEn}>
                    {lang === 'mr' && c.nameMr ? `${c.nameEn} (${c.nameMr})` : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'चौकशी प्रकार' : 'Inquiry Source'}
              </label>
              <select
                value={formData.inquiryType}
                onChange={e => setFormData({ ...formData, inquiryType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Call">Phone Call</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'झाडाचे किंवा विषयाचे नाव *' : 'Plant / Inquiry Subject *'}
            </label>
            <input
              type="text"
              value={formData.plantName}
              onChange={e => setFormData({ ...formData, plantName: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.plantName ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
              placeholder="e.g. Kesar Mango Grafts inquiry for 100 plants"
            />
            {errors.plantName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.plantName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'रोपवाटिका' : 'Associated Nursery'}
            </label>
            <select
              value={formData.nurseryName}
              onChange={e => setFormData({ ...formData, nurseryName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
            >
              <option value="">-- {lang === 'mr' ? 'रोपवाटिका निवडा' : 'Select Nursery'} --</option>
              {nurseries.map(n => (
                <option key={n.id} value={n.name}>
                  {n.name} ({n.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'तपशील / शेरा' : 'Enquiry Notes'}
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              placeholder="e.g. Customer asked for wholesale discount and farm delivery"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              {t('btnCancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'mr' ? 'चौकशी जोडा' : 'Add Enquiry'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
