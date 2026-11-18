import React, { useState } from 'react';
import { 
  X, Phone, MessageSquare, MapPin, Calendar, Award, CheckCircle2, 
  AlertCircle, XCircle, ExternalLink, ShieldCheck, Sprout, Building, Compass,
  CreditCard, Loader2, Ban, RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_NURSERY_IMAGE } from '../../data/mockData';
import { initiatePayUCheckout, simulatePayUTestPayment } from '../../services/payu';

export default function NurseryDetailsModal({ 
  nursery, 
  isOpen, 
  onClose, 
  onApprove, 
  onOpenReject,
  onOpenRevoke,
  onOpenSuspend,
  onUnsuspend
}) {
  const { t, lang } = useLanguage();
  const [payingFee, setPayingFee] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  if (!isOpen || !nursery) return null;

  const isSuspended = nursery.status === 'suspended' || Boolean(nursery.isSuspended && nursery.status !== 'approved');
  const isApproved = nursery.status === 'approved' && !isSuspended;
  const isTrialActive = Boolean(nursery.isTrialActive) && !isSuspended && !isApproved && nursery.status !== 'rejected';
  const isTrialExpired = Boolean(nursery.isTrialExpired) && !isApproved;
  const isPending = (nursery.status === 'pending' || nursery.status === 'revoked' || isTrialExpired) && !isSuspended && !isApproved;
  const isRejected = nursery.status === 'rejected';

  const isPaid = nursery.paymentStatus === 'paid' || Boolean(nursery.payuPaymentId || nursery.razorpayPaymentId);

  const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : (nursery.name || nursery.nurseryName || 'Nursery');
  const specialties = lang === 'mr' && nursery.specialtiesMr ? nursery.specialtiesMr : (nursery.specialties || nursery.facilities || []);
  const city = nursery.city || nursery.district || 'Maharashtra';
  const ownerName = nursery.ownerName || nursery.owner || 'Owner';
  const phone = nursery.ownerPhone || nursery.phone || '';

  const handlePayFee = async () => {
    setPayingFee(true);
    setPaymentMsg(null);

    await initiatePayUCheckout({
      amountInRupees: 100,
      nurseryName: nursery.name || nursery.nurseryName,
      ownerName: nursery.ownerName || nursery.owner,
      phone: nursery.ownerPhone || nursery.phone,
      description: `Registration Fee for ${nurseryName}`,
      onSuccess: (res) => {
        setPayingFee(false);
        nursery.paymentStatus = 'paid';
        nursery.payuPaymentId = res.paymentId;
        nursery.payuTxnId = res.txnid || res.orderId;
        setPaymentMsg({ type: 'success', text: `PayU Payment verified! ID: ${res.paymentId}` });
      },
      onError: (err) => {
        setPayingFee(false);
        const isRate = String(err?.message || '').toLowerCase().includes('too many requests') || String(err?.message || '').includes('60 seconds');
        if (isRate) {
          setPaymentMsg({ 
            type: 'error', 
            text: lang === 'mr' 
              ? 'PayU चाचणी सर्व्हर दरमर्यादा (Rate limit: 60s): १ मिनिटानंतर पुन्हा प्रयत्न करा किंवा खालील चाचणी बटनाने पडताळणी पूर्ण करा.' 
              : 'PayU test rate limit (60s). Retry in 1 min or use instant test verification.' 
          });
        } else {
          setPaymentMsg({ type: 'error', text: err.message || 'Payment failed' });
        }
      },
      onDismiss: () => {
        setPayingFee(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Top Banner with Nursery Image and Status Badge */}
        <div className="relative h-44 bg-slate-800 overflow-hidden">
          <img 
            src={nursery.image || FALLBACK_NURSERY_IMAGE} 
            alt={nursery.name} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_NURSERY_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-emerald-200 border border-white/20">
                  {city} Hub
                </span>
                {nursery.establishedYear && (
                  <span className="text-xs text-slate-300 font-medium">
                    {t('establishedYear')} {nursery.establishedYear}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {nurseryName}
              </h2>
            </div>

            {/* Status Pill */}
            <div>
              {isApproved && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'mr' ? 'सबस्क्राइब / मंजूर' : 'Subscribed'}
                </span>
              )}
              {isTrialActive && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  {lang === 'mr' ? `फ्री ट्रायल (${nursery.trialDaysLeft ?? 6} दिवस बाकी)` : `Free Trial (${nursery.trialDaysLeft ?? 6}d left)`}
                </span>
              )}
              {isSuspended && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                  <Ban className="w-4 h-4" />
                  {lang === 'mr' ? 'खाते निलंबित' : 'Suspended'}
                </span>
              )}
              {!isTrialActive && isPending && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  {nursery.status === 'revoked' 
                    ? (lang === 'mr' ? 'रद्द (प्रलंबित)' : 'Revoked (Pending)') 
                    : (isTrialExpired ? (lang === 'mr' ? '६ दिवस संपले' : 'Trial Expired') : t('statusPending'))}
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                  <XCircle className="w-4 h-4" />
                  {t('statusRejected')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Suspension notice banner if status is suspended */}
          {isSuspended && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>{lang === 'mr' ? 'खाते निलंबन शेरा व माहिती' : 'Partner Account Suspended'}</span>
              </div>
              <p className="text-xs font-semibold text-rose-800 mt-1">
                {nursery.suspensionReason || (lang === 'mr' ? 'प्रशासकीय कारणास्तव हे खाते तात्पुरते निलंबित करण्यात आले आहे.' : 'This account has been temporarily suspended by the administrator.')}
              </p>
              {nursery.suspendedAt && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {lang === 'mr' ? 'निलंबन तारीख/वेळ: ' : 'Suspended On: '}{new Date(nursery.suspendedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Rejection notice banner if status is rejected */}
          {isRejected && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                <XCircle className="w-4 h-4" />
                <span>{lang === 'mr' ? 'अर्जावर ॲडमिन शेरा / कारण' : 'Rejection Reason & Admin Log'}</span>
              </div>
              <p className="text-xs font-semibold text-rose-800 mt-1">
                {nursery.rejectionReason || t('reasonQualityConcerns')}
              </p>
              {nursery.rejectionNotes && (
                <p className="text-xs text-rose-700 mt-1.5 bg-white/70 p-2.5 rounded-lg border border-rose-200">
                  {nursery.rejectionNotes}
                </p>
              )}
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('managedPlants')}
              </span>
              <span className="text-xl font-extrabold text-[#1E5631]">
                {nursery.totalPlants || 24}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('ratingScore')}
              </span>
              <span className="text-xl font-extrabold text-amber-600">
                ★ {nursery.rating || '4.8'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('licenseNumber')}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-1" title={nursery.licenseNo}>
                {nursery.licenseNo || 'Verified'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('joinedDate')}
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-1">
                {nursery.appliedDate || nursery.registrationDate || '2024'}
              </span>
            </div>
          </div>

          {/* PayU Registration Payment Status Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isPaid 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">
                    {lang === 'mr' ? 'नोंदणी शुल्क (Registration Fee)' : 'Registration Fee Status'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isPaid ? 'PAID ₹100' : 'UNPAID ₹100'}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isPaid 
                    ? `Verified via PayU • ID: ${nursery.payuPaymentId || nursery.razorpayPaymentId || 'Verified'}`
                    : (lang === 'mr' ? 'नोंदणी शुल्क भरले नसल्यास आता PayU द्वारे भरू शकता.' : 'One-time registration fee can be settled via PayU.')}
                </p>
              </div>
            </div>

            {!isPaid && (
              <button
                type="button"
                onClick={handlePayFee}
                disabled={payingFee}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {payingFee ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Connecting PayU...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{lang === 'mr' ? '₹१०० भरा (PayU)' : 'Pay ₹100 (PayU)'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {paymentMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold border space-y-2 ${
              paymentMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <div className="leading-relaxed">{paymentMsg.text}</div>
              {paymentMsg.type === 'error' && (
                <button
                  type="button"
                  onClick={() => {
                    const sim = simulatePayUTestPayment({
                      amountInRupees: 100,
                      nurseryName: nursery.name || nursery.nurseryName,
                      ownerName: nursery.ownerName || nursery.owner
                    });
                    nursery.paymentStatus = 'paid';
                    nursery.payuPaymentId = sim.paymentId;
                    nursery.payuTxnId = sim.txnid;
                    setPaymentMsg({ type: 'success', text: `PayU Test Verified! ID: ${sim.paymentId}` });
                  }}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all active:scale-95 inline-block"
                >
                  {lang === 'mr' ? '⚡ चाचणी पडताळणीने फी पूर्ण करा' : '⚡ Complete via Test Verification'}
                </button>
              )}
            </div>
          )}

          {/* Contact Information & Direct Action Buttons */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#1E5631]" />
              {t('contactInfo')}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{ownerName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{nursery.email || `${phone}@treebazzar.in`}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-sm transition-all hover:bg-slate-50"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
                  <span>{phone || 'Call'}</span>
                </a>
                <a
                  href={`https://wa.me/${(nursery.whatsapp || phone)?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('chatWhatsapp')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Location & GPS Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {t('addressDetails')}
            </h4>
            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-slate-200">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {nursery.address}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Compass className="w-4 h-4 text-[#2E7D32]" />
                  <span>{t('gpsLocation')}: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">{nursery.gpsCoords || '16.85, 74.58'}</code></span>
                </div>
                <a
                  href={nursery.googleMapsUrl || `https://maps.google.com/?q=${nursery.gpsCoords || '16.85,74.58'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1E5631] hover:text-[#2E7D32] hover:underline"
                >
                  <span>{t('viewOnMap')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 6-Day Free Trial & Subscription Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1E5631]" />
              {lang === 'mr' ? 'सबस्क्रिप्शन व ६-दिवस मोफत ट्रायल स्थिती' : 'Subscription & 6-Day Free Trial'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'mr' ? 'प्लॅन' : 'Plan'}</span>
                <span className="font-bold text-slate-800">{isApproved ? (lang === 'mr' ? 'वार्षिक पार्टनर' : 'Paid Annual') : (lang === 'mr' ? '६ दिवस फ्री ट्रायल' : '6-Day Trial')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'mr' ? 'ट्रायल सुरू' : 'Trial Start'}</span>
                <span className="font-bold text-slate-800">{nursery.trialStartDate ? new Date(nursery.trialStartDate).toLocaleDateString() : (nursery.registrationDate || 'Recently')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'mr' ? 'ट्रायल समाप्ती' : 'Trial Ends'}</span>
                <span className="font-bold text-slate-800">{nursery.trialEndDate ? new Date(nursery.trialEndDate).toLocaleDateString() : 'After 6 Days'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'mr' ? 'स्थिती' : 'Status'}</span>
                <span className={`font-bold ${isApproved ? 'text-emerald-700' : (isTrialActive ? 'text-blue-700' : 'text-amber-700')}`}>
                  {isApproved 
                    ? (lang === 'mr' ? 'सक्रिय सबस्क्राइबर' : 'Active Subscribed') 
                    : (isTrialActive 
                        ? (lang === 'mr' ? `${nursery.trialDaysLeft ?? 6} दिवस बाकी` : `${nursery.trialDaysLeft ?? 6}d Left`) 
                        : (lang === 'mr' ? 'मंजुरी प्रलंबित' : 'Pending Approval'))}
                </span>
              </div>
            </div>
          </div>

          {/* Specialties & Crops */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#1E5631]" />
              {t('specialtiesTitle')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {specialties && specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#1E5631] text-xs font-semibold border border-emerald-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          {nursery.description && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic">
              "{nursery.description}"
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-bold text-slate-700 transition-colors"
          >
            {t('closeModal')}
          </button>

          <div className="flex items-center gap-2">
            {(isPending || isTrialActive) && (
              <>
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={() => {
                    onClose();
                    onOpenReject(nursery);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {t('btnReject')}
                </button>
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={async () => {
                    if (isApproving) return;
                    setIsApproving(true);
                    try {
                      if (onApprove) await onApprove(nursery.id);
                      onClose();
                    } finally {
                      setIsApproving(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>{lang === 'mr' ? 'मंजूर होत आहे...' : 'Approving...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{lang === 'mr' ? 'सबस्क्रिप्शन मंजूर करा' : 'Approve Subscription'}</span>
                    </>
                  )}
                </button>
              </>
            )}

            {isApproved && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenRevoke) onOpenRevoke(nursery);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'mr' ? 'मंजुरी रद्द करा (Revoke)' : 'Revoke Approval'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenSuspend) onOpenSuspend(nursery);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                  <span>{lang === 'mr' ? 'खाते निलंबित करा (Suspend)' : 'Suspend Account'}</span>
                </button>
              </>
            )}

            {isSuspended && (
              <button
                type="button"
                disabled={isApproving}
                onClick={async () => {
                  if (isApproving) return;
                  setIsApproving(true);
                  try {
                    if (onUnsuspend) await onUnsuspend(nursery.id);
                    onClose();
                  } finally {
                    setIsApproving(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer active:scale-95"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'mr' ? 'सक्रिय करत आहे...' : 'Reactivating...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'mr' ? 'निलंबन मागे घ्या (सक्रिय करा)' : 'Unsuspend / Re-Activate'}</span>
                  </>
                )}
              </button>
            )}

            {isRejected && (
              <button
                type="button"
                disabled={isApproving}
                onClick={async () => {
                  if (isApproving) return;
                  setIsApproving(true);
                  try {
                    if (onApprove) await onApprove(nursery.id);
                    onClose();
                  } finally {
                    setIsApproving(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                    <span>{lang === 'mr' ? 'मंजूर होत आहे...' : 'Approving...'}</span>
                  </>
                ) : (
                  <span>{lang === 'mr' ? 'पुन्हा मंजूर करा (Re-Approve)' : 'Re-Approve Partner'}</span>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
