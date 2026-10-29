import React from 'react';
import { X, Phone, MessageSquare, MapPin, Calendar, Clock, Sprout, Building2, User, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function InquiryDetailsModal({ 
  inquiry, 
  isOpen, 
  onClose,
  onUpdateStatus 
}) {
  const { t, lang } = useLanguage();

  if (!isOpen || !inquiry) return null;

  const isWhatsApp = inquiry.inquiryType === 'WhatsApp';
  const cleanPhone = (inquiry.customerPhone || '').replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWhatsApp ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isWhatsApp ? <MessageSquare className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('inquiryDetailsTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('inquiryDetailsSubtitle')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Customer Profile Strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                {inquiry.customerName ? inquiry.customerName.charAt(0) : 'C'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{inquiry.customerName}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{inquiry.customerPhone}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
              {inquiry.customerCity}
            </span>
          </div>

          {/* Plant & Nursery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {t('thPlantName')}
              </span>
              <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-[#2E7D32] shrink-0" />
                {inquiry.plantName}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {t('thNursery')}
              </span>
              <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                {inquiry.nurseryName}
              </p>
            </div>
          </div>

          {/* Inquiry Meta & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {t('thInquiryType')}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isWhatsApp ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isWhatsApp ? <MessageSquare className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {inquiry.inquiryType}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {t('thDateTime')}
              </span>
              <span className="text-slate-700 font-medium text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {inquiry.timestamp}
              </span>
            </div>
          </div>

          {/* Notes */}
          {inquiry.notes && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                {t('inquiryNotes')}
              </span>
              <p className="text-amber-950 text-xs leading-relaxed">
                {inquiry.notes}
              </p>
            </div>
          )}

          {/* Status Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {t('inquiryStatus')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['New', 'Contacted', 'Converted'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus && onUpdateStatus(inquiry.id, st)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    inquiry.status === st
                      ? 'bg-[#1E5631] text-white border-[#1E5631] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'New' ? t('statusNew') : st === 'Contacted' ? t('statusContacted') : t('statusConverted')}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Contact Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            {cleanPhone && (
              <>
                <a
                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${inquiry.customerName}, regarding your inquiry for ${inquiry.plantName} on TreeBazzar...`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t('btnOpenWhatsApp')}
                </a>
                <a
                  href={`tel:${cleanPhone}`}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  {t('btnMakeCall')}
                </a>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
