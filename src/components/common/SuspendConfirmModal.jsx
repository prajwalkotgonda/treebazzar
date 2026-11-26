import React, { useState } from 'react';
import { X, Ban, AlertOctagon, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export default function SuspendConfirmModal({ nursery, isOpen, onClose, onConfirm }) {
  const { lang } = useLanguage();
  const [reason, setReason] = useState('Policy Violation / Terms of Service');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useBodyScrollLock(isOpen);
  if (!isOpen || !nursery) return null;

  const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : (nursery.name || nursery.nurseryName || 'Nursery');
  const ownerName = nursery.ownerName || nursery.owner || 'Owner';
  const city = nursery.city || nursery.district || 'Maharashtra';

  const predefinedReasons = [
    {
      id: 'policy_violation',
      labelEn: 'Policy Violation / Terms of Service',
      labelMr: 'नियम आणि अटींचे उल्लंघन'
    },
    {
      id: 'customer_complaints',
      labelEn: 'Multiple Customer Complaints / Quality Issues',
      labelMr: 'ग्राहकांच्या तक्रारी / झाडांच्या दर्जाबाबत त्रुटी'
    },
    {
      id: 'temporary_closure',
      labelEn: 'Temporary Nursery Closure / Seasonal Break',
      labelMr: 'रोपवाटिका तात्पुरती बंद / हंगामी सुट्टी'
    },
    {
      id: 'payment_dispute',
      labelEn: 'Payment / License / Legal Dispute',
      labelMr: 'पेमेंट किंवा परवाना वाद'
    },
    {
      id: 'fraud_suspicion',
      labelEn: 'Suspicious / Fraudulent Activity Detected',
      labelMr: 'संशयास्पद किंवा फसवणूक करणारी हालचाल'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullReason = customNotes.trim() ? `${reason} - ${customNotes.trim()}` : reason;
      if (onConfirm) {
        await onConfirm(nursery.id, fullReason);
      }
      setCustomNotes('');
      onClose();
    } catch (err) {
      console.error('Suspend nursery error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overscroll-contain">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'खाते निलंबित करा (Suspend Account)' : 'Suspend Nursery Partner'}
              </h3>
              <p className="text-xs text-rose-800 font-medium">
                {nurseryName} • {city} ({ownerName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs leading-relaxed">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              {lang === 'mr'
                ? 'खाते निलंबित केल्यास या रोपवाटिकेचे ॲपमधील सर्व रोपांचे प्रदर्शन तात्पुरते बंद होईल, रोपवाटिका अकार्यक्षम होईल आणि नवीन ऑर्डर्स स्वीकारणे बंद केले जाईल. प्रशासक नंतर केव्हाही हे निलंबन मागे घेऊन खाते पुन्हा सक्रिय करू शकतात.'
                : 'Suspending will immediately deactivate this nursery, hide all of their plant listings from the customer mobile app, and block new orders. The administrator can unsuspend and reactivate the partner at any time.'}
            </span>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {lang === 'mr' ? 'निलंबनाचे कारण निवडा' : 'Reason for Suspension'}
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((item) => {
                const text = lang === 'mr' ? item.labelMr : item.labelEn;
                const isSelected = reason === text || reason === item.labelEn;
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 text-slate-900 font-medium ring-1 ring-rose-400'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="suspendReason"
                      value={text}
                      checked={isSelected}
                      onChange={() => setReason(text)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {lang === 'mr' ? 'अधिक शेरा / टिप्पणी (पर्यायी)' : 'Additional Notes / Instructions (Optional)'}
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={lang === 'mr' ? 'उदा. ग्राहकांच्या तक्रारीची चौकशी पूर्ण होईपर्यंत निलंबन...' : 'e.g. Suspended pending resolution of quality complaints...'}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {lang === 'mr' ? 'रद्द करा (मागे फिरा)' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'mr' ? 'निलंबित करत आहे...' : 'Suspending...'}</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'होय, खाते निलंबित करा' : 'Confirm Suspend Account'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
