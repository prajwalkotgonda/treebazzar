import React from 'react';
import { ShieldCheck, BadgePercent, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WhyTreeBazzar() {
  const { lang, t } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t('why1Title'),
      desc: t('why1Desc'),
      color: 'bg-emerald-100/80 text-[#1E5631]'
    },
    {
      icon: BadgePercent,
      title: t('why2Title'),
      desc: t('why2Desc'),
      color: 'bg-amber-100/80 text-amber-900'
    },
    {
      icon: MessageSquare,
      title: t('why3Title'),
      desc: t('why3Desc'),
      color: 'bg-teal-100/80 text-teal-900'
    }
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20 bg-[#F8FAF9] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E5631] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{t('landingNavHowItWorks')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('whyTitle')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {t('whySubtitle')}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#1E5631]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>{lang === 'mr' ? 'हमीपूर्वक स्थानिक सेवा' : 'Verified Local Assurance'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
