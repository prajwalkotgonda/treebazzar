import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose, type, title, message }) {
  const finalType = type || toast?.type || 'success';
  const finalTitle = title || toast?.title || '';
  const finalMessage = message || toast?.message || '';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose, finalTitle]);

  if (!toast && !title) return null;

  const isSuccess = finalType === 'success';
  const isError = finalType === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5">
      <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
        isSuccess 
          ? 'bg-[#1E5631]/95 text-white border-emerald-500/50' 
          : isError 
            ? 'bg-rose-900/95 text-white border-rose-500/50' 
            : 'bg-slate-900/95 text-white border-slate-700'
      }`}>
        <div className="p-1 rounded-lg bg-white/10 shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
          {isError && <AlertTriangle className="w-5 h-5 text-rose-300" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-300" />}
        </div>
        
        <div className="flex-1 pr-2">
          <p className="text-xs font-bold">{finalTitle}</p>
          {finalMessage && (
            <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">{finalMessage}</p>
          )}
        </div>

        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
