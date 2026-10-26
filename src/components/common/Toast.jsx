import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-subtle">
      <div className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all ${
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
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</p>
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
