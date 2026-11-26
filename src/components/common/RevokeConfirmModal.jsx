import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export default function RevokeConfirmModal({ nursery, isOpen, onClose, onConfirm }) {
  const { lang } = useLanguage();
  const [reason, setReason] = useState('Administrative Re-verification Required');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !nursery) return null;

  const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : (nursery.name || nursery.nurseryName || 'Nursery');
  const ownerName = nursery.ownerName || nursery.owner || 'Owner';
  const city = nursery.city || nursery.district || 'Maharashtra';

  const predefinedReasons = [
    {
      id: 're_verification',
      labelEn: 'Administrative Re-verification Required',
      labelMr: 'प्रशासकीय पुनर्पडताळणी आवश्यक'
    },
    {
      id: 'outdated_info',
      labelEn: 'Incomplete / Outdated Nursery Information',
      labelMr: 'अपूर्ण किंवा कालबाह्य झालेली रोपवाटिका माहिती'
    },
    {
      id: 'license_review',
      labelEn: 'License / Registration Under Review',
      labelMr: 'परवाना किंवा नोंदणी तपासणी सुरू'
    },
    {
      id: 'partner_request',
      labelEn: 'Partner Requested Temporary Unlisting',
      labelMr: 'रोपवाटिका चालकाच्या विनंतीनुसार'
    },
    {
      id: 'other',
      labelEn: 'Other Administrative Reason',
      labelMr: 'इतर प्रशासकीय कारण'
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
      console.error('Revoke approval error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-amber-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'मंजुरी रद्द करा (Revoke Approval)' : 'Revoke Nursery Approval'}
              </h3>
              <p className="text-xs text-amber-800 font-medium">
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
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {lang === 'mr'
                ? 'मंजुरी रद्द केल्यास ही रोपवाटिका ग्राहकांच्या मोबाईल ॲपवरून तात्काळ काढून टाकली जाईल आणि तिची स्थिती पुन्हा "प्रलंबित पुनरावलोकन" (Pending Review) मध्ये नोंदवली जाईल.'
                : 'Revoking approval will remove this nursery from the live customer mobile app and revert its status back to "Pending Review" until re-approved.'}
            </span>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {lang === 'mr' ? 'रद्द करण्याचे कारण निवडा' : 'Reason for Revoking Approval'}
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
                        ? 'border-amber-500 bg-amber-50/60 text-slate-900 font-medium ring-1 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="revokeReason"
                      value={text}
                      checked={isSelected}
                      onChange={() => setReason(text)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
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
              {lang === 'mr' ? 'अधिक शेरा / टिप्पणी (पर्यायी)' : 'Additional Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={lang === 'mr' ? 'उदा. कागदपत्रे पुन्हा जमा करण्याची सूचना दिली आहे...' : 'e.g. Requested partner to submit updated nursery license...'}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-slate-800 placeholder:text-slate-400"
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'mr' ? 'रद्द करत आहे...' : 'Revoking...'}</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'होय, मंजुरी रद्द करा' : 'Confirm Revoke Approval'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
