import React from 'react';
import { Megaphone, Building2, Phone, MessageCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BranchAdsSection({ ads = [] }) {
  const { lang } = useLanguage();
  const activeAds = ads.filter(a => a.status === 'active');

  if (activeAds.length === 0) return null;

  return (
    <section className="py-8 bg-gradient-to-b from-emerald-50/50 to-white border-b border-emerald-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E5631] text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
              <Megaphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {lang === 'mr' ? 'शाखा जाहिराती आणि विशेष ऑफर्स' : 'Branch Announcements & Special Offers'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                  {lang === 'mr' ? 'खास ऑफर' : 'Offers'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'mr' 
                  ? 'स्थानिक रोपवाटिकांच्या विशेष शाखा जाहिराती व थेट संपर्क' 
                  : 'Latest offers from verified local nursery branches'}
              </p>
            </div>
          </div>
        </div>

        {/* Ads Cards Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeAds.map(ad => {
            const cleanPhone = (ad.mobile || '').replace(/\D/g, '');
            return (
              <div 
                key={ad.id}
                className="bg-white rounded-2xl border border-emerald-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={ad.photo} 
                    alt={ad.title || ad.branchName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {ad.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md">
                      {ad.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5 text-xs font-black drop-shadow-md">
                      <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="truncate">{ad.branchName}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {ad.title && (
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 mb-1">
                        {ad.title}
                      </h4>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>

                  {/* Contact Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="text-slate-400 text-[11px]">{lang === 'mr' ? 'शाखा संपर्क:' : 'Branch Contact:'}</span>
                      <span className="font-mono text-slate-900">+91 {ad.mobile}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
                        <span>{lang === 'mr' ? 'थेट कॉल करा' : 'Call'}</span>
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`नमस्कार, मी TreeBazzar वरील तुमची जाहिरात (${ad.branchName}) पाहिली.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
