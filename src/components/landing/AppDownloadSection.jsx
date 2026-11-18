import React from 'react';
import { Smartphone, CheckCircle2, Star, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import GooglePlayButton, { GooglePlayIcon, TREEBAZZAR_PLAYSTORE_URL } from '../common/GooglePlayButton';

export default function AppDownloadSection() {
  const { lang } = useLanguage();

  const highlights = [
    {
      mr: 'एका क्लिकवर व्हॉट्सॲप व थेट कॉल',
      en: '1-Click Direct WhatsApp & Phone Calls'
    },
    {
      mr: '१००+ अधिकृत स्थानिक रोपवाटिका',
      en: '100+ Verified Local Regional Nurseries'
    },
    {
      mr: 'शून्य कमिशन, थेट नर्सरी मालकाशी संपर्क',
      en: 'Zero Commission / Direct Grower Deals'
    },
    {
      mr: 'नियमित नवीन झाडे व रोपांची उपलब्धता',
      en: 'Real-time Saplings & Plant Variety Stock'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-[#F8FAF9] relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-7 sm:p-12 lg:p-16 shadow-2xl shadow-emerald-950/20 border border-emerald-900/40">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Area (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                <GooglePlayIcon className="w-4 h-4" />
                <span>
                  {lang === 'mr' ? 'गुगल प्ले स्टोअरवर उपलब्ध' : 'Now Live on Google Play Store'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-4xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                {lang === 'mr' ? (
                  <>
                    ट्री बाजार ॲप डाउनलोड करा, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
                      रोपवाटिका आता तुमच्या खिशात!
                    </span>
                  </>
                ) : (
                  <>
                    Get the TreeBazzar App, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
                      Your Local Plant Nursery in Hand!
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {lang === 'mr' 
                  ? 'सांगली, मिरज, कोल्हापूर आणि कराडमधील सर्वोत्तम रोपवाटिका शोधण्यासाठी, थेट नर्सरी चालकांशी व्हॉट्सॲपवर बोलण्यासाठी आणि दर्जेदार रोपे घरपोच मिळवण्यासाठी आजच अधिकृत ॲन्ड्रॉइड ॲप इंस्टॉल करा.'
                  : 'Discover authentic plant varieties, directly connect with local growers via WhatsApp with zero middlemen, and track nursery updates on the go with our official Android app.'}
              </p>

              {/* Highlights Checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">
                      {lang === 'mr' ? item.mr : item.en}
                    </span>
                  </div>
                ))}
              </div>

              {/* Google Play Button & Trust Info */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <GooglePlayButton variant="badge" className="shadow-xl" />

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.8+</span>
                  <span className="text-slate-400">• Free on Android</span>
                </div>
              </div>

            </div>

            {/* Right Visual Card (5 Cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <a
                href={TREEBAZZAR_PLAYSTORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group block w-full max-w-sm rounded-2xl p-5 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border border-white/15 hover:border-emerald-400/50 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
              >
                {/* Glow pill */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E5631] to-[#2E7D32] flex items-center justify-center text-white shadow-md">
                      <GooglePlayIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">TreeBazzar</div>
                      <div className="text-[10px] text-emerald-300 font-medium">com.treebazzar.treebazzar</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Official App
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">{lang === 'mr' ? 'प्लॅटफॉर्म' : 'Platform'}</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      Android Google Play
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">{lang === 'mr' ? 'किंमत' : 'Price'}</span>
                    <span className="font-bold text-emerald-400">
                      {lang === 'mr' ? '१००% मोफत' : '100% Free'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">{lang === 'mr' ? 'कव्हरेज' : 'Coverage'}</span>
                    <span className="font-semibold text-white">
                      Sangli • Miraj • Kolhapur
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold group-hover:text-emerald-200 transition-colors">
                  <GooglePlayIcon className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'प्ले स्टोअर उघडण्यासाठी येथे क्लिक करा' : 'Tap to Open on Google Play'}</span>
                </div>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
