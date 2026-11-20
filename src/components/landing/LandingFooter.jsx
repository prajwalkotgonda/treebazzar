import React from 'react';
import { Leaf, MapPin, Mail, Phone, Heart, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import GooglePlayButton from '../common/GooglePlayButton';

export default function LandingFooter({ onOpenLogin, cities = [] }) {
  const { lang, t } = useLanguage();

  const handleScrollTo = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 fill-white/20 stroke-[2.2]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {t('brandName')}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-5">
              {lang === 'mr' 
                ? 'संपूर्ण भारतातील स्थानिक शेतकरी, बागकाम प्रेमी आणि रोपवाटिका चालकांना जोडणारा अग्रगण्य हरित मंच.'
                : 'India\'s premier local plant nursery discovery marketplace connecting farmers, home gardeners, and verified nurseries across All India.'}
            </p>

            {/* Google Play Store Official App Download Badge */}
            <div>
              <GooglePlayButton variant="badge" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footerQuickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#nurseries" onClick={(e) => handleScrollTo(e, '#nurseries')} className="hover:text-emerald-400 transition-colors">
                  {t('landingNavNurseries')}
                </a>
              </li>
              <li>
                <a href="#plants" onClick={(e) => handleScrollTo(e, '#plants')} className="hover:text-emerald-400 transition-colors">
                  {t('landingNavPlants')}
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => handleScrollTo(e, '#categories')} className="hover:text-emerald-400 transition-colors">
                  {t('landingNavCategories')}
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleScrollTo(e, '#how-it-works')} className="hover:text-emerald-400 transition-colors">
                  {t('landingNavHowItWorks')}
                </a>
              </li>
              <li>
                <a href="#join" onClick={(e) => handleScrollTo(e, '#join')} className="hover:text-emerald-400 transition-colors">
                  {lang === 'mr' ? 'रोपवाटिका नोंदणी' : 'Nursery Partnership'}
                </a>
              </li>
            </ul>
          </div>

          {/* Admin & Support / Contact Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footerContact')}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] text-slate-300">
                  House No. 21, Balaji Nagar,<br />
                  Near Law College, Ghulewadi,<br />
                  Taluka Sangamner, District Ahilyanagar,<br />
                  Maharashtra - 422605, India.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="mailto:TreeBazzar@gmail.com" className="hover:text-emerald-300 transition-colors">
                  TreeBazzar@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="https://www.treebazzar.com" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition-colors">
                  www.treebazzar.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:+919405947273" className="hover:text-emerald-300 transition-colors font-semibold">
                  +91 94059 47273
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} TreeBazzar. {t('footerRights')}
          </p>
          <p className="flex items-center gap-1">
            <span>Built with care for green Maharashtra</span>
            <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
