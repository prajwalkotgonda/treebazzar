import React, { useState } from 'react';
import { X, Store, MapPin, Phone, MessageSquare, Check, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_NURSERY_IMAGE } from '../../data/mockData';

export default function AddNurseryModal({ isOpen, onClose, onAddNursery }) {
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    nameMr: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    city: 'Sangli',
    address: '',
    status: 'approved',
    specialties: ['Grafted Fruit Trees', 'Indoor Plants'],
    establishedYear: new Date().getFullYear()
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = lang === 'mr' ? 'रोपवाटिकेचे नाव आवश्यक आहे' : 'Nursery name is required';
    }
    if (!formData.ownerName.trim()) {
      errs.ownerName = lang === 'mr' ? 'मालकाचे नाव आवश्यक आहे' : 'Owner name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = lang === 'mr' ? 'मोबाईल नंबर आवश्यक आहे' : 'Phone number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newNursery = {
      id: `nur-${Date.now()}`,
      name: formData.name.trim(),
      nurseryName: formData.name.trim(),
      nameMr: formData.nameMr.trim() || formData.name.trim(),
      ownerName: formData.ownerName.trim(),
      owner: formData.ownerName.trim(),
      phone: formData.phone.trim().startsWith('+91') ? formData.phone.trim() : `+91 ${formData.phone.trim()}`,
      ownerPhone: formData.phone.trim().startsWith('+91') ? formData.phone.trim() : `+91 ${formData.phone.trim()}`,
      whatsapp: formData.whatsapp.trim() || formData.phone.replace(/\D/g, ''),
      city: formData.city.trim() || 'Sangli',
      district: formData.city.trim() || 'Sangli',
      address: formData.address.trim() || `${formData.city}, Maharashtra`,
      status: formData.status,
      verified: formData.status === 'approved',
      isSuspended: false,
      establishedYear: Number(formData.establishedYear) || 2020,
      totalPlants: 0,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
      nurseryImages: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'],
      facilities: formData.specialties,
      specialties: formData.specialties,
      location: { latitude: 16.85, longitude: 74.58 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddNursery(newNursery);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E5631] to-[#2E7D32] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'mr' ? 'नवीन रोपवाटिका जोडा' : 'Add New Nursery'}
              </h3>
              <p className="text-xs text-emerald-100">
                {lang === 'mr' ? 'प्रणालीमध्ये अधिकृत रोपवाटिका नोंदणी करा' : 'Register an official nursery in the directory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Nursery Name English & Marathi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {lang === 'mr' ? 'रोपवाटिकेचे नाव (English)' : 'Nursery Name (English)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Shree Ganesh Hi-Tech Nursery"
                className={`w-full text-xs p-3 rounded-xl border ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {lang === 'mr' ? 'रोपवाटिकेचे नाव (मराठी)' : 'Nursery Name (मराठी)'}
              </label>
              <input
                type="text"
                value={formData.nameMr}
                onChange={(e) => setFormData({ ...formData, nameMr: e.target.value })}
                placeholder="उदा. श्री गणेश हाय-टेक रोपवाटिका"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* Owner Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {lang === 'mr' ? 'मालकाचे नाव' : 'Owner / Manager Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                  className={`w-full text-xs p-3 rounded-xl border ${errors.ownerName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
                />
              </div>
              {errors.ownerName && <p className="text-[11px] text-rose-500 mt-1">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {lang === 'mr' ? 'मोबाईल नंबर' : 'Contact Phone'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9822012345"
                className={`w-full text-xs p-3 rounded-xl border ${errors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* City / District & Approval Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {lang === 'mr' ? 'शहर किंवा जिल्हा' : 'City / District'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="Sangli">Sangli (सांगली)</option>
                <option value="Miraj">Miraj (मिरज)</option>
                <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                <option value="Tasgaon">Tasgaon (तासगाव)</option>
                <option value="Satara">Satara (सातारा)</option>
                <option value="Pune">Pune (पुणे)</option>
                <option value="Solapur">Solapur (सोलापूर)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {lang === 'mr' ? 'स्थिती (Status)' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="approved">{lang === 'mr' ? 'मंजूर (Approved - Live)' : 'Approved (Live in App)'}</option>
                <option value="pending">{lang === 'mr' ? 'प्रलंबित (Pending Review)' : 'Pending Review'}</option>
              </select>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {lang === 'mr' ? 'संपूर्ण पत्ता' : 'Full Address'}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Near Market Yard, Kupwad Road, Sangli"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Submit & Cancel */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'mr' ? 'रोपवाटिका सेव्ह करा' : 'Save Nursery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
