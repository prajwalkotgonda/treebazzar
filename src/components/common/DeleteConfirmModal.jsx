import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName 
}) {
  const { t, lang } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  useBodyScrollLock(isOpen);


  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      if (onConfirm) await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete error in modal:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overscroll-contain">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {title || (lang === 'mr' ? 'हटवण्याची खात्री करा' : 'Confirm Delete')}
              </h3>
              <p className="text-xs text-rose-700 font-medium truncate max-w-[220px]">
                {itemName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {message || (lang === 'mr' 
                ? 'हे हटवल्यानंतर पुन्हा परत मिळवता येणार नाही. तुम्हाला नक्की हे हटवायचे आहे का?' 
                : 'This action cannot be undone. Are you sure you want to permanently delete this item?')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {t('btnCancel') || (lang === 'mr' ? 'रद्द करा' : 'Cancel')}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'mr' ? 'हटवत आहे...' : 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{t('btnConfirmDelete') || (lang === 'mr' ? 'होय, हटवा' : 'Yes, Delete')}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
