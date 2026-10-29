import React from 'react';
import { X, LogOut, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
        
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          {t('logoutModalTitle')}
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          {t('logoutModalDesc')}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('btnCancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
          >
            {t('btnLogoutConfirm')}
          </button>
        </div>

      </div>
    </div>
  );
}
