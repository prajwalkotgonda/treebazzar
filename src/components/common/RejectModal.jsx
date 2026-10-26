import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, FileWarning } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function RejectModal({ nursery, isOpen, onClose, onConfirm }) {
  const { t, lang } = useLanguage();
  const [reason, setReason] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !nursery) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      setError(lang === 'mr' ? 'कृपया नाकारण्याचे कारण निवडा' : 'Please select a rejection reason');
      return;
    }
    setError('');
    onConfirm(nursery.id, reason, customNotes);
    setReason('');
    setCustomNotes('');
    onClose();
  };

  const predefinedReasons = [
    { key: 'reasonIncompleteAddress', label: t('reasonIncompleteAddress') },
    { key: 'reasonInvalidLicense', label: t('reasonInvalidLicense') },
    { key: 'reasonDuplicateListing', label: t('reasonDuplicateListing') },
    { key: 'reasonQualityConcerns', label: t('reasonQualityConcerns') },
    { key: 'reasonOther', label: t('reasonOther') },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{t('rejectModalTitle')}</h3>
              <p className="text-xs text-rose-700 font-medium">{nursery.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {t('rejectModalDesc')}
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {t('rejectReasonLabel')} <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    reason === item.label
                      ? 'border-rose-500 bg-rose-50/50 text-slate-900 font-medium ring-1 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={item.label}
                    checked={reason === item.label}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setError('');
                    }}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-2 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {t('rejectNotesLabel')}
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={t('rejectNotesPlaceholder')}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              <FileWarning className="w-4 h-4" />
              {t('btnConfirmReject')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
