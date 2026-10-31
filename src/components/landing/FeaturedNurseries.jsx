import React from 'react';
import { 
  Store, MapPin, Phone, MessageSquare, ShieldCheck, 
  ExternalLink, CheckCircle2, Calendar, Sprout, ArrowRight, Sparkles, Plus 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_NURSERY_IMAGE } from '../../data/mockData';

export default function FeaturedNurseries({ 
  nurseries = [], 
  selectedCity, 
  onCityChange, 
  onSelectNursery,
  onContactLead,
  onOpenRegisterNursery
}) {
  const { lang, t } = useLanguage();

  const cities = ['all', 'Sangli', 'Miraj', 'Kolhapur', 'Karad'];

  // Show all active and newly registered nurseries
  const displayNurseries = nurseries
    .filter(n => n.status !== 'rejected')
    .filter(n => selectedCity === 'all' || !selectedCity || n.city?.toLowerCase() === selectedCity.toLowerCase());

  const handleWhatsApp = (e, nursery) => {
    e.stopPropagation();
    const phone = (nursery.whatsapp || nursery.phone || '9822145678').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : nursery.name;
    const msg = encodeURIComponent(
      lang === 'mr' 
        ? `नमस्कार ${nurseryName}, मी ट्री बाजार (TreeBazzar) वर आपली रोपवाटिका पाहिली. मला उपलब्ध झाडांविषयी माहिती हवी आहे.`
        : `Hello ${nurseryName}, I found your nursery on TreeBazzar. I would like to inquire about your available plant varieties and saplings.`
    );
    
    if (onContactLead) {
      onContactLead({
        customerName: 'Website Visitor',
        customerPhone: '+91 98XXXXXX',
        customerCity: selectedCity !== 'all' ? selectedCity : 'Sangli',
        type: 'whatsapp',
        plantOrNursery: nurseryName,
        notes: `Direct inquiry from TreeBazzar landing page to ${nurseryName}`
      });
    }

    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleCall = (e, nursery) => {
    e.stopPropagation();
    const phone = (nursery.phone || '9822145678').replace(/\D/g, '');
    const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : nursery.name;

    if (onContactLead) {
      onContactLead({
        customerName: 'Website Visitor',
        customerPhone: '+91 98XXXXXX',
        customerCity: selectedCity !== 'all' ? selectedCity : 'Sangli',
        type: 'call',
        plantOrNursery: nurseryName,
        notes: `Direct phone call lead from TreeBazzar landing page to ${nurseryName}`
      });
    }

    window.location.href = `tel:+91${phone}`;
  };

  return (
    <section id="nurseries" className="py-14 sm:py-20 bg-[#F8FAF9] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E5631] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{t('landingNavNurseries')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('nurseriesTitle')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              {t('nurseriesSubtitle')}
            </p>
          </div>

          {/* City Filter Pills & Add Nursery Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => onCityChange(city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#1E5631] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {city === 'all' 
                    ? t('heroAllCities') 
                    : city}
                </button>
              ))}
            </div>

            {onOpenRegisterNursery && (
              <button
                type="button"
                onClick={onOpenRegisterNursery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'रोपवाटिका जोडा' : 'Add Nursery'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Nurseries Grid */}
        {displayNurseries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNurseries.map((nursery) => {
              const displayName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : nursery.name;
              const owner = nursery.ownerName || nursery.owner || 'Grower';
              const imgUrl = nursery.image || FALLBACK_NURSERY_IMAGE;

              return (
                <div
                  key={nursery.id}
                  onClick={() => onSelectNursery && onSelectNursery(nursery)}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-950/10 transition-all flex flex-col group cursor-pointer relative"
                >
                  {/* Nursery Image & Badges */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = FALLBACK_NURSERY_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Verified or New Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {nursery.isNew && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-md animate-pulse">
                          {lang === 'mr' ? 'नवीन' : 'NEW'}
                        </span>
                      )}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E5631]/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{t('nurseryVerifiedBadge')}</span>
                      </div>
                    </div>

                    {/* City Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold shadow-xs">
                      <MapPin className="w-3 h-3 text-[#2E7D32]" />
                      <span>{nursery.city || 'Sangli'}</span>
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base sm:text-lg font-black leading-tight drop-shadow-xs">
                        {displayName}
                      </h3>
                      <p className="text-[11px] text-emerald-100 font-medium">
                        {owner} • {t('nurseryEst')} {nursery.establishedYear || '2015'}
                      </p>
                    </div>
                  </div>

                  {/* Nursery Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Address preview */}
                      <p className="text-xs text-slate-500 line-clamp-1 mb-3 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{nursery.address || `${nursery.city}, Maharashtra`}</span>
                      </p>

                      {/* Specialties tags */}
                      {nursery.specialties && nursery.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {nursery.specialties.slice(0, 3).map((spec, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[#1E5631] text-[10px] font-bold border border-emerald-100"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: WhatsApp & Call */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleWhatsApp(e, nursery)}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'व्हॉट्सॲप' : 'WhatsApp'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCall(e, nursery)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
                        <span>{lang === 'mr' ? 'कॉल करा' : 'Call'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
            <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {lang === 'mr' ? 'या शहरात कोणतीही रोपवाटिका आढळली नाही' : 'No nurseries found for selected filter'}
            </p>
            <button
              onClick={() => onCityChange('all')}
              className="mt-3 text-xs font-bold text-[#1E5631] underline cursor-pointer"
            >
              {lang === 'mr' ? 'सर्व शहरे पहा' : 'View all cities'}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
