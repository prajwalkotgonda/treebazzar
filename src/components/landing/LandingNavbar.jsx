import React, { useState } from 'react';
import { 
  Leaf, Languages, Menu, X, ArrowRight, Store, Sprout, LayoutGrid, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import GooglePlayButton, { GooglePlayIcon, TREEBAZZAR_PLAYSTORE_URL } from '../common/GooglePlayButton';

export default function LandingNavbar({ onOpenLogin, onOpenRegisterNursery }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#nurseries', label: t('landingNavNurseries'), icon: Store },
    { href: '#plants', label: t('landingNavPlants'), icon: Sprout },
    { href: '#categories', label: t('landingNavCategories'), icon: LayoutGrid },
    { href: '#how-it-works', label: t('landingNavHowItWorks'), icon: HelpCircle }
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
          <a href="#" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                {t('brandName')}
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              </span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase hidden sm:block -mt-0.5">
                All India
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links (Each in separate box pill) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50/90 hover:bg-emerald-50 hover:text-[#1E5631] border border-slate-200/90 hover:border-emerald-300 shadow-2xs transition-all whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              title={lang === 'en' ? 'मराठी मध्ये बदला' : 'Switch to English'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200/80 font-bold text-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Languages className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="text-[11px]">
                {lang === 'en' ? 'EN | मराठी' : 'मराठी | EN'}
              </span>
            </button>

            {/* Google Play Store App Download Button */}
            <GooglePlayButton variant="navbar" />

            {/* Nursery Partner Register CTA */}
            {onOpenRegisterNursery && (
              <button
                type="button"
                onClick={onOpenRegisterNursery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1E5631] hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer whitespace-nowrap"
              >
                <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'रोपवाटिका जोडा' : 'Add Nursery'}</span>
              </button>
            )}
          </div>

          {/* Mobile Actions: Language + Play Store + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={TREEBAZZAR_PLAYSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="TreeBazzar App on Google Play"
              className="p-1.5 rounded-lg bg-slate-900 text-white flex items-center justify-center border border-slate-700 active:scale-95 shadow-2xs"
            >
              <GooglePlayIcon className="w-4 h-4" />
            </a>
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
        <div className="md:hidden border-t border-slate-200/90 bg-white px-4 pt-3 pb-5 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#1E5631] hover:border-emerald-300 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Icon className="w-4 h-4 text-[#2E7D32] shrink-0" />
                  <span className="truncate">{link.label}</span>
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <GooglePlayButton variant="badge" className="w-full justify-center" />

            {onOpenRegisterNursery && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegisterNursery();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#1E5631] text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Store className="w-4 h-4 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'रोपवाटिका नोंदणी करा' : 'Register Your Nursery'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
