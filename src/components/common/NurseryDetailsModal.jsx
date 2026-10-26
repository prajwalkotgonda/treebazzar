import React from 'react';
import { 
  X, Phone, MessageSquare, MapPin, Calendar, Award, CheckCircle2, 
  AlertCircle, XCircle, ExternalLink, ShieldCheck, Sprout, Building, Compass 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FALLBACK_NURSERY_IMAGE } from '../../data/mockData';

export default function NurseryDetailsModal({ 
  nursery, 
  isOpen, 
  onClose, 
  onApprove, 
  onOpenReject 
}) {
  const { t, lang } = useLanguage();

  if (!isOpen || !nursery) return null;

  const isApproved = nursery.status === 'approved';
  const isPending = nursery.status === 'pending';
  const isRejected = nursery.status === 'rejected';

  const nurseryName = lang === 'mr' && nursery.nameMr ? nursery.nameMr : (nursery.name || nursery.nurseryName || 'Nursery');
  const specialties = lang === 'mr' && nursery.specialtiesMr ? nursery.specialtiesMr : (nursery.specialties || nursery.facilities || []);
  const city = nursery.city || nursery.district || 'Maharashtra';
  const ownerName = nursery.ownerName || nursery.owner || 'Owner';
  const phone = nursery.ownerPhone || nursery.phone || '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Banner with Nursery Image and Status Badge */}
        <div className="relative h-44 bg-slate-800 overflow-hidden">
          <img 
            src={nursery.image || FALLBACK_NURSERY_IMAGE} 
            alt={nursery.name} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_NURSERY_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-emerald-200 border border-white/20">
                  {city} Hub
                </span>
                {nursery.establishedYear && (
                  <span className="text-xs text-slate-300 font-medium">
                    {t('establishedYear')} {nursery.establishedYear}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {nurseryName}
              </h2>
            </div>

            {/* Status Pill */}
            <div>
              {isApproved && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('statusApproved')}
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  {t('statusPending')}
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                  <XCircle className="w-4 h-4" />
                  {t('statusRejected')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Rejection notice banner if status is rejected */}
          {isRejected && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                <XCircle className="w-4 h-4" />
                <span>{lang === 'mr' ? 'अर्जावर ॲडमिन शेरा / कारण' : 'Rejection Reason & Admin Log'}</span>
              </div>
              <p className="text-xs font-semibold text-rose-800 mt-1">
                {nursery.rejectionReason || t('reasonQualityConcerns')}
              </p>
              {nursery.rejectionNotes && (
                <p className="text-xs text-rose-700 mt-1.5 bg-white/70 p-2.5 rounded-lg border border-rose-200">
                  {nursery.rejectionNotes}
                </p>
              )}
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('managedPlants')}
              </span>
              <span className="text-xl font-extrabold text-[#1E5631]">
                {nursery.totalPlants || 24}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('ratingScore')}
              </span>
              <span className="text-xl font-extrabold text-amber-600">
                ★ {nursery.rating || '4.8'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('licenseNumber')}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-1" title={nursery.licenseNo}>
                {nursery.licenseNo || 'Verified'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('joinedDate')}
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-1">
                {nursery.appliedDate}
              </span>
            </div>
          </div>

          {/* Contact Information & Direct Action Buttons */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#1E5631]" />
              {t('contactInfo')}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{ownerName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{nursery.email || `${phone}@treebazzar.in`}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-sm transition-all hover:bg-slate-50"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
                  <span>{phone || 'Call'}</span>
                </a>
                <a
                  href={`https://wa.me/${(nursery.whatsapp || phone)?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('chatWhatsapp')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Location & GPS Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {t('addressDetails')}
            </h4>
            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-slate-200">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {nursery.address}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Compass className="w-4 h-4 text-[#2E7D32]" />
                  <span>{t('gpsLocation')}: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">{nursery.gpsCoords}</code></span>
                </div>
                <a
                  href={nursery.googleMapsUrl || `https://maps.google.com/?q=${nursery.gpsCoords}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1E5631] hover:text-[#2E7D32] hover:underline"
                >
                  <span>{t('viewOnMap')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Specialties & Crops */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#1E5631]" />
              {t('specialtiesTitle')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {specialties && specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#1E5631] text-xs font-semibold border border-emerald-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          {nursery.description && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic">
              "{nursery.description}"
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-bold text-slate-700 transition-colors"
          >
            {t('closeModal')}
          </button>

          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReject(nursery);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
                >
                  {t('btnReject')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApprove(nursery.id);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {t('btnApprove')}
                </button>
              </>
            )}

            {isApproved && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReject(nursery);
                }}
                className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                {lang === 'mr' ? 'निलंबित / रद्द करा' : 'Suspend / Revoke Approval'}
              </button>
            )}

            {isRejected && (
              <button
                type="button"
                onClick={() => {
                  onApprove(nursery.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-sm transition-all"
              >
                {lang === 'mr' ? 'पुन्हा मंजूर करा (Re-Approve)' : 'Re-Approve Partner'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
