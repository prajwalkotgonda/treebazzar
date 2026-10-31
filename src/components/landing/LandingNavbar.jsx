import React, { useState } from 'react';
import { 
  Leaf, Languages, ShieldCheck, Menu, X, ArrowRight, Store, Sprout, Plus 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LandingNavbar({ onOpenLogin, onOpenRegisterNursery, onOpenAddPlant }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#nurseries', label: t('landingNavNurseries') },
    { href: '#plants', label: t('landingNavPlants') },
    { href: '#categories', label: t('landingNavCategories') },
    { href: '#how-it-works', label: t('landingNavHowItWorks') }
  ];

  const handleScrollTo = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                {t('brandName')}
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              </span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase hidden sm:block -mt-0.5">
                Sangli • Miraj • Kolhapur
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-xs font-bold text-slate-600 hover:text-[#1E5631] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              title={lang === 'en' ? 'मराठी मध्ये बदला' : 'Switch to English'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200/80 font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="text-[11px]">
                {lang === 'en' ? 'EN | मराठी' : 'मराठी | EN'}
              </span>
            </button>

            {/* Nursery Partner Register CTA */}
            {onOpenRegisterNursery && (
              <button
                type="button"
                onClick={onOpenRegisterNursery}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1E5631] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'रोपवाटिका जोडा' : 'Add Nursery'}</span>
              </button>
            )}

            {/* Add Plant CTA */}
            {onOpenAddPlant && (
              <button
                type="button"
                onClick={onOpenAddPlant}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'वनस्पती जोडा' : 'Add Plant'}</span>
              </button>
            )}

            {/* Admin Portal Button */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-xs transition-all hover:shadow-md hover:shadow-emerald-950/15 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('landingNavAdmin')}</span>
            </button>
          </div>

          {/* Mobile Actions: Language + Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg bg-emerald-50 text-[#1E5631] border border-emerald-200 text-xs font-bold"
            >
              {lang === 'en' ? 'मराठी' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200/90 bg-white px-4 pt-3 pb-5 space-y-2.5 animate-in fade-in duration-200">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#1E5631]"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {onOpenRegisterNursery && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegisterNursery();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-[#1E5631] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'रोपवाटिका नोंदणी करा' : 'Register Your Nursery'}</span>
              </button>
            )}

            {onOpenAddPlant && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAddPlant();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'वनस्पती जोडा (Add Plant)' : 'Add Plant Variety'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#1E5631] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{t('landingNavAdmin')}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
