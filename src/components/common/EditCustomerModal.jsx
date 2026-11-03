import React, { useState, useEffect } from 'react';
import { X, Users, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EditCustomerModal({ 
  isOpen, 
  onClose, 
  customer, 
  onUpdateCustomer, 
  cities = [] 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Sangli',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        city: customer.city || (cities[0]?.nameEn || 'Sangli'),
        address: customer.address || '',
        notes: customer.notes || ''
      });
    }
  }, [customer, cities]);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const updated = {
      ...customer,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city,
      address: formData.address.trim(),
      notes: formData.notes.trim()
    };

    onUpdateCustomer(customer.id, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'ग्राहक संपादित करा' : 'Edit Customer'}
              </h3>
              <p className="text-xs text-slate-500">
                {customer.name}
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
              {lang === 'mr' ? 'ग्राहकाचे नाव' : 'Customer Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'फोन नंबर' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'शहर' : 'City'}
              </label>
              <select
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                {cities.map(c => (
                  <option key={c.id || c.nameEn} value={c.nameEn}>
                    {lang === 'mr' && c.nameMr ? `${c.nameEn} (${c.nameMr})` : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'ईमेल' : 'Email Address'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'पत्ता' : 'Address'}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'टीप' : 'Notes'}
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
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
              <span>{t('btnSave') || 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
