import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EditEnquiryModal({ 
  isOpen, 
  onClose, 
  inquiry, 
  onUpdateEnquiry 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerCity: '',
    plantName: '',
    status: 'New',
    notes: ''
  });

  useEffect(() => {
    if (inquiry) {
      setFormData({
        customerName: inquiry.customerName || '',
        customerPhone: inquiry.customerPhone || '',
        customerCity: inquiry.customerCity || '',
        plantName: inquiry.plantName || inquiry.plantOrNursery || '',
        status: inquiry.status || 'New',
        notes: inquiry.notes || ''
      });
    }
  }, [inquiry]);

  if (!isOpen || !inquiry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const updated = {
      ...inquiry,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerCity: formData.customerCity.trim(),
      plantName: formData.plantName.trim(),
      status: formData.status,
      notes: formData.notes.trim()
    };

    onUpdateEnquiry(inquiry.id, updated);
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
                {lang === 'mr' ? 'चौकशी संपादित करा' : 'Edit Customer Enquiry'}
              </h3>
              <p className="text-xs text-slate-500">
                {inquiry.customerName}
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
                {lang === 'mr' ? 'ग्राहकाचे नाव' : 'Customer Name'}
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'फोन नंबर' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'स्थिती (Status)' : 'Enquiry Status'}
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="New">{lang === 'mr' ? 'नवीन (New)' : 'New'}</option>
                <option value="Contacted">{lang === 'mr' ? 'संपर्क केला (Contacted)' : 'Contacted'}</option>
                <option value="Converted">{lang === 'mr' ? 'ऑर्डर पूर्ण (Converted/Resolved)' : 'Converted / Resolved'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'शहर' : 'City'}
              </label>
              <input
                type="text"
                value={formData.customerCity}
                onChange={e => setFormData({ ...formData, customerCity: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'झाड / चौकशी विषय' : 'Inquired Plant / Subject'}
            </label>
            <input
              type="text"
              value={formData.plantName}
              onChange={e => setFormData({ ...formData, plantName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'तपशील / संभाषण शेरा' : 'Enquiry Notes / Call Summary'}
            </label>
            <textarea
              rows="3"
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
