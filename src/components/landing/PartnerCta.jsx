import React from 'react';
import { Store, ArrowRight, CheckCircle2, Leaf, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function PartnerCta({ onOpenRegisterNursery }) {
  const { lang, t } = useLanguage();

  const benefits = [
    lang === 'mr' ? 'मोफत रोपवाटिका नोंदणी' : '100% Free Listing',
    lang === 'mr' ? 'थेट ग्राहकांचे व्हॉट्सॲप मेसेज' : 'Direct Customer Leads on WhatsApp',
    lang === 'mr' ? 'सांगली, मिरज व कोल्हापूरमध्ये प्रसिद्धी' : 'Promote in Sangli, Miraj & Kolhapur',
    lang === 'mr' ? 'शून्य कमिशन' : 'Zero Brokerage / Keep 100% Revenue'
  ];

  return (
    <section id="join" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#1E5631] via-[#246b3c] to-[#2E7D32] text-white p-8 sm:p-12 lg:p-16 shadow-2xl shadow-emerald-950/20">
          
          {/* Background Leaf Silhouette */}
          <div className="absolute right-0 top-0 w-96 h-96 opacity-10 pointer-events-none -translate-y-1/4 translate-x-1/4">
            <Leaf className="w-full h-full text-white rotate-45 stroke-[1.5]" />
          </div>

          <div className="relative z-10 max-w-3xl">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/15">
              <Store className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'रोपवाटिका चालकांसाठी' : 'For Nursery Owners'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-4">
              {t('ctaTitle')}
            </h2>

            <p className="text-xs sm:text-base text-emerald-100 mb-8 max-w-2xl leading-relaxed">
              {t('ctaSubtitle')}
            </p>

            {/* Bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">{b}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenRegisterNursery}
                className="py-3 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-[#1E5631] font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Store className="w-4 h-4 text-[#2E7D32]" />
                <span>{t('ctaButton')}</span>
                <ArrowRight className="w-4 h-4 text-[#1E5631]" />
              </button>

              <span className="text-xs text-emerald-200 font-medium">
                {lang === 'mr' ? 'नोंदणीनंतर ॲडमिनद्वारे २४ तासांत पडताळणी' : 'Admin verification within 24 hours'}
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
