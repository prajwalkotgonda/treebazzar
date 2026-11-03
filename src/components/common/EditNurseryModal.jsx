import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Phone, User, Check, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EditNurseryModal({ 
  isOpen, 
  onClose, 
  nursery, 
  onUpdateNursery, 
  cities = [] 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    nameMr: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    city: 'Sangli',
    address: '',
    status: 'approved',
    specialtiesStr: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (nursery) {
      setFormData({
        name: nursery.name || nursery.nurseryName || '',
        nameMr: nursery.nameMr || '',
        ownerName: nursery.ownerName || nursery.owner || '',
        phone: (nursery.phone || '').replace('+91 ', ''),
        whatsapp: (nursery.whatsapp || '').replace('+91 ', ''),
        city: nursery.city || (cities[0]?.nameEn || 'Sangli'),
        address: nursery.address || '',
        status: nursery.status || 'approved',
        specialtiesStr: Array.isArray(nursery.specialties) 
          ? nursery.specialties.join(', ') 
          : (nursery.specialties || '')
      });
      setErrors({});
    }
  }, [nursery, cities]);

  if (!isOpen || !nursery) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = lang === 'mr' ? 'रोपवाटिकेचे नाव आवश्यक आहे' : 'Nursery name is required';
    }
    if (!formData.ownerName.trim()) {
      errs.ownerName = lang === 'mr' ? 'मालकाचे नाव आवश्यक आहे' : 'Owner name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = lang === 'mr' ? 'फोन नंबर आवश्यक आहे' : 'Phone number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const specialtiesList = formData.specialtiesStr
      ? formData.specialtiesStr.split(',').map(s => s.trim()).filter(Boolean)
      : (nursery.specialties || []);

    const updated = {
      ...nursery,
      name: formData.name.trim(),
      nurseryName: formData.name.trim(),
      nameMr: formData.nameMr.trim() || formData.name.trim(),
      ownerName: formData.ownerName.trim(),
      owner: formData.ownerName.trim(),
      phone: formData.phone.trim().startsWith('+91') ? formData.phone.trim() : `+91 ${formData.phone.trim()}`,
      whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
      city: formData.city,
      district: formData.city,
      address: formData.address.trim() || `${formData.city}, Maharashtra`,
      status: formData.status,
      specialties: specialtiesList,
      facilities: specialtiesList,
      updatedAt: new Date().toISOString()
    };

    onUpdateNursery(nursery.id, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'रोपवाटिका संपादित करा' : 'Edit Nursery Details'}
              </h3>
              <p className="text-xs text-slate-500">
                {nursery.name}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'रोपवाटिकेचे नाव (इंग्रजी) *' : 'Nursery Name (English) *'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.name ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. Green Valley Farm"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'रोपवाटिकेचे नाव (मराठी)' : 'Nursery Name (Marathi)'}
              </label>
              <input
                type="text"
                value={formData.nameMr}
                onChange={e => setFormData({ ...formData, nameMr: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
                placeholder="उदा. ग्रीन व्हॅली रोपवाटिका"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'मालकाचे नाव *' : 'Owner Name *'}
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.ownerName ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. Ramesh Patil"
              />
              {errors.ownerName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'शहर / Hub *' : 'City / Hub *'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'फोन नंबर *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. 9822145678"
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'स्थिती (Status)' : 'Approval Status'}
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="approved">{lang === 'mr' ? 'मंजूर (Approved)' : 'Approved'}</option>
                <option value="pending">{lang === 'mr' ? 'प्रलंबित (Pending)' : 'Pending'}</option>
                <option value="rejected">{lang === 'mr' ? 'नाकारलेले (Rejected)' : 'Rejected'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'संपूर्ण पत्ता' : 'Full Address'}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              placeholder="e.g. Near Market Yard, Kupwad Road, Sangli"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'खास वैशिष्ट्ये (स्वल्पविरामाने वेगळे करा)' : 'Specialties (comma separated)'}
            </label>
            <input
              type="text"
              value={formData.specialtiesStr}
              onChange={e => setFormData({ ...formData, specialtiesStr: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              placeholder="e.g. Grafted Mango, Tissue Bamboo, Desi Rose"
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
