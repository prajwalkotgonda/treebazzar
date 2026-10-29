import React, { useState } from 'react';
import { 
  Leaf, Mail, Lock, Eye, EyeOff, LogIn, Sparkles, 
  Languages, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginPage({ onLogin }) {
  const { lang, toggleLanguage, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setError(lang === 'mr' ? 'कृपया ईमेल किंवा युझरनेम टाका' : 'Please enter your email address');
      return;
    }
    if (!cleanPass) {
      setError(lang === 'mr' ? 'कृपया पासवर्ड टाका' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    // Verify credentials (accepts admin@treebazzar.com or admin, with password admin123)
    setTimeout(() => {
      if ((cleanEmail === 'admin@treebazzar.com' || cleanEmail === 'admin') && cleanPass === 'admin123') {
        onLogin({ email: cleanEmail, rememberMe });
      } else {
        setError(t('invalidCreds'));
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail('admin@treebazzar.com');
    setPassword('admin123');
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      onLogin({ email: 'admin@treebazzar.com', rememberMe: true });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#2E7D32]/20 selection:text-[#1E5631] relative overflow-hidden">
      
      {/* Subtle Botanical Leaf Silhouette Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none -translate-y-1/3 translate-x-1/3">
        <Leaf className="w-full h-full text-[#1E5631] rotate-45 stroke-[1]" />
      </div>
      <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5 pointer-events-none translate-y-1/3 -translate-x-1/3">
        <Leaf className="w-full h-full text-[#1E5631] -rotate-45 stroke-[1]" />
      </div>

      {/* Top Bar with Language Toggle */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] flex items-center justify-center text-white shadow-xs">
            <Leaf className="w-4 h-4 fill-white/20 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">
            TreeBazzar
          </span>
        </div>

        {/* Seamless Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={lang === 'en' ? 'मराठी मध्ये बदला' : 'Switch to English'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#1E5631] border border-slate-200 shadow-xs font-bold text-xs transition-all cursor-pointer"
        >
          <Languages className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-[11px]">
            {lang === 'en' ? 'EN | मराठी' : 'मराठी | EN'}
          </span>
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 border border-slate-200/90 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1E5631] via-[#246b3c] to-[#2E7D32] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/20">
              <Leaf className="w-7 h-7 fill-white/20 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E5631]/10 text-[#1E5631] text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('brandName')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {t('loginPrompt')}
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="admin@treebazzar.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('passwordLabel')}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Default: admin123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#1E5631] focus:ring-[#2E7D32] w-4 h-4"
                />
                <span className="text-[11px] font-medium">{t('rememberMe')}</span>
              </label>

              <span className="text-[11px] text-[#2E7D32] font-semibold">
                Sangli Hub
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-emerald-950/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? (lang === 'mr' ? 'पडताळणी करत आहे...' : 'Signing In...') : t('signInBtn')}</span>
            </button>

          </form>

          {/* Quick Demo Helper */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/90 text-[#1E5631] border border-emerald-200/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{t('demoLoginBtn')}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
              Email: admin@treebazzar.com | Pass: admin123
            </p>
          </div>

        </div>
      </div>

      {/* Regional Footer */}
      <div className="w-full max-w-5xl mx-auto text-center z-10">
        <p className="text-[11px] text-slate-400">
          TreeBazzar • Sangli • Miraj • Kolhapur • Karad Regional Nursery Hub
        </p>
      </div>

    </div>
  );
}
