import React from 'react';
import { 
  Settings, User, MapPin, RefreshCw, ShieldCheck, Database, 
  Sparkles, CheckCircle2, Sliders, Globe, Bell
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsView({ onResetDemoData }) {
  const { t, lang, toggleLanguage } = useLanguage();

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#1E5631]" />
          {t('settingsTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] text-white font-bold flex items-center justify-center text-base shadow-sm">
            AS
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Admin Sangli
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            </h3>
            <p className="text-xs text-slate-400">
              {t('adminRole')} • TreeBazzar Central
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {t('adminEmail')}
            </span>
            <p className="font-semibold text-slate-800">admin@treebazzar.com</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {t('adminHub')}
            </span>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
              Sangli & Western MH Hub
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {t('langIndicator')}
            </span>
            <button
              onClick={toggleLanguage}
              className="font-bold text-[#1E5631] hover:text-[#2E7D32] flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'English (Click to मराठी)' : 'मराठी (Click to English)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t('dataManagementTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('dataManagementDesc')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {t('resetDemoData')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'mr' 
                ? 'नमुना रोपवाटिका, वनस्पती आणि ग्राहक चौकशी सुरुवातीच्या स्थितीमध्ये पूर्ववत करा.' 
                : 'Restore original sample nurseries, plants, and customer inquiries to their initial state.'}
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm(lang === 'mr' ? 'तुम्हाला सर्व नमुना डेटा पूर्ववत करायचा आहे का?' : 'Reset demo nurseries, plants and leads to initial sample data?')) {
                onResetDemoData();
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('btnResetData')}</span>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#2E7D32]" />
          {t('systemInfoTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              {t('systemEnvironment')}
            </span>
            <span className="font-semibold text-slate-800">
              {t('systemEnvironmentVal')}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              {t('systemVersion')}
            </span>
            <span className="font-semibold text-slate-800">
              {t('systemVersionVal')}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
