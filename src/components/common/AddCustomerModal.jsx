import React, { useState } from 'react';
import { X, Users, Check, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export default function AddCustomerModal({ 
  isOpen, 
  onClose, 
  onAddCustomer, 
  cities = [] 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: cities[0]?.nameEn || '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useBodyScrollLock(isOpen);


  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = lang === 'mr' ? 'ग्राहकाचे नाव आवश्यक आहे' : 'Customer name is required';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = lang === 'mr' ? 'फोन नंबर आवश्यक आहे' : 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = lang === 'mr' ? 'मोबाईल नंबर फक्त १० अंकी असावा' : 'Mobile number must be exactly 10 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newCustomer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city,
      address: formData.address.trim() || `${formData.city}, Maharashtra`,
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      notes: formData.notes.trim()
    };

    onAddCustomer(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overscroll-contain">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'नवीन ग्राहक नोंदवा' : 'Register New Customer'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'mr' ? 'शेतकरी किंवा खरेदीदार तपशील जोडा' : 'Add buyer or farmer profile'}
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
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'ग्राहकाचे नाव *' : 'Customer Name *'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.name ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
              placeholder={lang === 'mr' ? 'उदा. ज्ञानेश्वर पाटील' : 'e.g. Ramesh Patil'}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'मोबाईल नंबर *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                maxLength={10}
                inputMode="numeric"
                onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. 9822145678 (10 digits)"
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'शहर / तालुका / जिल्हा *' : 'City / Region *'}
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder={lang === 'mr' ? 'उदा. संगमनेर, अहिल्यानगर...' : 'e.g. Sangamner, Pune...'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'ईमेल (ऐच्छिक)' : 'Email Address (Optional)'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              placeholder="e.g. rahul@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'पत्ता' : 'Delivery / Farm Address'}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              placeholder={lang === 'mr' ? 'उदा. मु. पो. संगमनेर, जि. अहिल्यानगर' : 'e.g. Near Bus Stand, Sangamner'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'टीप / ग्राहक माहिती' : 'Notes / Buyer Profile'}
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              placeholder={lang === 'mr' ? 'उदा. नियमित खरेदीदार, शेतकरी' : 'e.g. Regular buyer, farmer'}
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
              <span>{lang === 'mr' ? 'ग्राहक जोडा' : 'Add Customer'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
