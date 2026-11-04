import React, { useState } from 'react';
import { 
  X, Store, MapPin, Phone, MessageSquare, Check, User, ShieldCheck, 
  CreditCard, Loader2, AlertCircle, CheckCircle2, Sparkles, Lock 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_NURSERY_IMAGE } from '../../data/mockData';
import { initiateRazorpayCheckout } from '../../services/razorpay';

export default function AddNurseryModal({ isOpen, onClose, onAddNursery, cities = [] }) {
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    nameMr: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    city: cities[0]?.nameEn || 'Sangli',
    address: '',
    status: 'approved',
    specialties: ['Grafted Fruit Trees', 'Indoor Plants'],
    establishedYear: new Date().getFullYear()
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'offline'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
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

  const buildNurseryObject = (paymentInfo = null) => {
    return {
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
      status: 'approved',
      verified: true,
      isNew: true,
      isSuspended: false,
      establishedYear: Number(formData.establishedYear) || 2024,
      totalPlants: 0,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
      nurseryImages: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'],
      facilities: formData.specialties,
      specialties: formData.specialties,
      location: { latitude: 16.85, longitude: 74.58 },
      paymentStatus: paymentInfo ? 'paid' : (paymentMethod === 'razorpay' ? 'paid' : 'pending_offline'),
      paymentAmount: paymentInfo ? paymentInfo.amount : (paymentMethod === 'razorpay' ? 100 : 0),
      paymentMethod: paymentMethod,
      razorpayPaymentId: paymentInfo?.paymentId || null,
      razorpayOrderId: paymentInfo?.orderId || null,
      paymentVerifiedAt: paymentInfo?.verifiedAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // If Razorpay Online Payment selected: trigger checkout flow
    if (paymentMethod === 'razorpay') {
      setIsProcessingPayment(true);
      setPaymentError(null);

      await initiateRazorpayCheckout({
        amountInRupees: 100, // ₹100 fee requested by user
        nurseryName: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        description: 'TreeBazzar Nursery Registration Fee (₹100)',
        onSuccess: (paymentResult) => {
          setIsProcessingPayment(false);
          setPaymentSuccessData(paymentResult);

          const newNursery = buildNurseryObject(paymentResult);
          onAddNursery(newNursery);

          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onError: (err) => {
          setIsProcessingPayment(false);
          setPaymentError(err.message || (lang === 'mr' ? 'पेमेंट अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.' : 'Payment failed. Please try again.'));
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
          setPaymentError(lang === 'mr' ? 'पेमेंट रद्द केले. तुम्ही पुन्हा प्रयत्न करू शकता.' : 'Payment was dismissed. You can retry anytime.');
        }
      });
      return;
    }

    // Direct registration (offline / admin override)
    const newNursery = buildNurseryObject(null);
    onAddNursery(newNursery);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E5631] to-[#2E7D32] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'mr' ? 'नवीन रोपवाटिका नोंदणी' : 'Register New Nursery'}
              </h3>
              <p className="text-xs text-emerald-100">
                {lang === 'mr' ? 'ट्रीबाझार अधिकृत रोपवाटिका नोंदणी (शुल्क: ₹१००)' : 'Official TreeBazzar Nursery Partner Onboarding (Fee: ₹100)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingPayment}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          
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
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Ramesh Patil"
                className={`w-full text-xs p-3 rounded-xl border ${errors.ownerName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-[#2E7D32]`}
              />
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
                {cities && cities.length > 0 ? (
                  cities.map(c => (
                    <option key={c.id || c.nameEn} value={c.nameEn}>
                      {c.nameEn} {c.nameMr ? `(${c.nameMr})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Sangli">Sangli (सांगली)</option>
                    <option value="Miraj">Miraj (मिरज)</option>
                    <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                    <option value="Karad">Karad (कराड)</option>
                  </>
                )}
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

          {/* ============================================================== */}
          {/* RAZORPAY ₹100 REGISTRATION PAYMENT SECTION                     */}
          {/* ============================================================== */}
          <div className="pt-2">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-4 border border-emerald-200/80 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                        {lang === 'mr' ? 'नोंदणी व लिस्टिंग फी' : 'Registration & Listing Fee'}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Razorpay Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {lang === 'mr' 
                        ? '1-वर्ष अधिकृत रोपवाटिका पडताळणी, थेट ग्राहक WhatsApp लीड्स व कॅटलॉग'
                        : '1-Year verified partner listing, direct WhatsApp leads & digital catalog'}
                    </p>
                  </div>
                </div>

                {/* ₹100 Price Badge */}
                <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
                  <div className="text-lg font-black text-[#1E5631] leading-none">
                    ₹100
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    One-time
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* 1. Razorpay Option (Selected by default) */}
                <label 
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#2E7D32] bg-white ring-2 ring-[#2E7D32]/20 font-bold text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-[#1E5631] w-3.5 h-3.5"
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{lang === 'mr' ? 'Razorpay ऑनलाइन पेमेंट' : 'Pay ₹100 via Razorpay'}</span>
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    </div>
                    <span className="text-[10px] font-normal text-slate-500 block truncate">
                      UPI, GPay, PhonePe, Cards, Netbanking
                    </span>
                  </div>
                </label>

                {/* 2. Offline / Admin Direct Option */}
                <label 
                  onClick={() => setPaymentMethod('offline')}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'offline'
                      ? 'border-[#2E7D32] bg-white ring-2 ring-[#2E7D32]/20 font-bold text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="offline"
                    checked={paymentMethod === 'offline'}
                    onChange={() => setPaymentMethod('offline')}
                    className="accent-[#1E5631] w-3.5 h-3.5"
                  />
                  <div className="truncate">
                    <span>{lang === 'mr' ? 'थेट नोंदणी (नंतर भरा / रोख)' : 'Register without Online Pay'}</span>
                    <span className="text-[10px] font-normal text-slate-500 block truncate">
                      Admin / Offline cash verification
                    </span>
                  </div>
                </label>
              </div>

              {/* Secure checkout info pill */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-bit Secure Razorpay Checkout</span>
                </span>
                <span className="font-semibold text-emerald-700">
                  Instant Verification
                </span>
              </div>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Success Confirmation */}
            {paymentSuccessData && (
              <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {lang === 'mr' 
                    ? `पेमेंट यशस्वी! (आयडी: ${paymentSuccessData.paymentId}) - रोपवाटिका नोंदणी झाली.` 
                    : `Payment verified! (ID: ${paymentSuccessData.paymentId}) - Nursery saved.`}
                </span>
              </div>
            )}
          </div>

          {/* Submit & Cancel Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessingPayment}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-50"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>

            {paymentMethod === 'razorpay' ? (
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E5631] via-[#2E7D32] to-[#1E5631] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>{lang === 'mr' ? 'रेझरपे कनेक्ट होत आहे...' : 'Opening Razorpay...'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-emerald-300" />
                    <span>{lang === 'mr' ? '₹१०० भरा आणि नोंदणी करा (Razorpay)' : 'Pay ₹100 & Register (Razorpay)'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'mr' ? 'रोपवाटिका जोडा (थेट)' : 'Save Nursery (Direct)'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
