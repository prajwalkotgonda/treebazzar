import React, { useState } from 'react';
import { 
  Megaphone, Plus, Search, Building2, Phone, Calendar, 
  Trash2, Power, MessageCircle, ExternalLink, Sparkles, 
  CheckCircle2, AlertCircle, Tag, Eye, Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdsManagementView({
  ads = [],
  onOpenCreateAd,
  onToggleAdStatus,
  onDeleteAd
}) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'paused'
  const [selectedAdForPreview, setSelectedAdForPreview] = useState(null);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      (ad.branchName && ad.branchName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ad.mobile && ad.mobile.includes(searchQuery)) ||
      (ad.description && ad.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ad.title && ad.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && ad.status === 'active') ||
      (filterStatus === 'paused' && ad.status === 'paused');

    return matchesSearch && matchesStatus;
  });

  const activeCount = ads.filter(a => a.status === 'active').length;
  const pausedCount = ads.filter(a => a.status === 'paused').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1E5631] via-[#246b3c] to-[#2E7D32] rounded-2xl p-5 sm:p-6 text-white shadow-md shadow-emerald-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white ring-1 ring-white/20 shrink-0">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {lang === 'mr' ? 'शाखा जाहिराती आणि ऑफर्स व्यवस्थापन' : 'Branch Ads & Promotions Management'}
            </h2>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              {lang === 'mr' 
                ? 'शाखेचे नाव, मोबाईल क्र., फोटो आणि माहितीनुसार जाहिराती तयार व व्यवस्थापित करा' 
                : 'Create and manage branch advertisements with phone, photo and description'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateAd}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#1E5631] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{lang === 'mr' ? '+ नवीन जाहिरात तयार करा' : '+ Create New Ad'}</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'mr' ? 'शाखेचे नाव, मोबाईल नंबर किंवा माहिती शोधा...' : 'Search by branch, mobile or description...'}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-[#2E7D32]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#1E5631] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'mr' ? 'सर्व' : 'All'} ({ads.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {lang === 'mr' ? 'सक्रिय' : 'Active'} ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('paused')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'paused'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'mr' ? 'बंद' : 'Paused'} ({pausedCount})
          </button>
        </div>
      </div>

      {/* Ads Grid */}
      {filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map((ad) => {
            const cleanPhone = (ad.mobile || '').replace(/\D/g, '');
            const isActive = ad.status === 'active';

            return (
              <div 
                key={ad.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Photo & Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={ad.photo} 
                    alt={ad.title || ad.branchName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  {/* Offer Badge (Top Left) */}
                  {ad.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md">
                      {ad.badge}
                    </span>
                  )}

                  {/* Status Badge (Top Right) */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                    <span>{isActive ? (lang === 'mr' ? 'सक्रिय' : 'Active') : (lang === 'mr' ? 'बंद' : 'Paused')}</span>
                  </span>

                  {/* Quick Photo View overlay button */}
                  <button
                    type="button"
                    onClick={() => setSelectedAdForPreview(ad)}
                    className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{lang === 'mr' ? 'मोठा फोटो पहा' : 'View Photo'}</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Branch Name (शाखेचे नाव) */}
                    <div className="flex items-center gap-1.5 text-[#1E5631] font-black text-xs uppercase tracking-wider mb-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{ad.branchName}</span>
                    </div>

                    {/* Ad Title */}
                    {ad.title && (
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 mb-1">
                        {ad.title}
                      </h4>
                    )}

                    {/* Description (माहिती व तपशील) */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>

                  {/* Mobile No & Direct Contact Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#1E5631]" />
                        <span>{lang === 'mr' ? 'मोबाईल:' : 'Mobile:'}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">+91 {ad.mobile}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Call Button */}
                      <a
                        href={`tel:${cleanPhone}`}
                        className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
                        <span>{lang === 'mr' ? 'कॉल करा' : 'Call'}</span>
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`नमस्कार, मी TreeBazzar वरील तुमची जाहिरात (${ad.branchName}) पाहिली.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Card Bottom: Status Toggle & Delete */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => onToggleAdStatus && onToggleAdStatus(ad.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{isActive ? (lang === 'mr' ? 'जाहिरात थांबवा' : 'Pause Ad') : (lang === 'mr' ? 'सुरू करा' : 'Activate Ad')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(lang === 'mr' ? 'ही जाहिरात नक्की हटवायची आहे का?' : 'Are you sure you want to delete this ad?')) {
                          onDeleteAd && onDeleteAd(ad.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={lang === 'mr' ? 'जाहिरात हटवा' : 'Delete Ad'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1E5631] flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {lang === 'mr' ? 'कोणतीही जाहिरात सापडली नाही' : 'No advertisements found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {lang === 'mr' 
              ? 'तुमच्या शाखेचे नाव, मोबाईल नंबर, फोटो आणि माहिती जोडून नवीन जाहिरात प्रसिद्ध करा.' 
              : 'Create an ad with branch name, mobile no, photo and description to reach customers.'}
          </p>
          <button
            type="button"
            onClick={onOpenCreateAd}
            className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'mr' ? 'नवीन जाहिरात तयार करा' : 'Create New Ad'}</span>
          </button>
        </div>
      )}

      {/* Lightbox / Image Preview Modal */}
      {selectedAdForPreview && (
        <div 
          onClick={() => setSelectedAdForPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-800"
          >
            <div className="relative">
              <img 
                src={selectedAdForPreview.photo} 
                alt={selectedAdForPreview.title || selectedAdForPreview.branchName}
                className="w-full max-h-[60vh] object-contain bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setSelectedAdForPreview(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 hidden" />
                <span className="text-sm font-bold px-1">✕</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E5631]">
                <Building2 className="w-4 h-4" />
                <span>{selectedAdForPreview.branchName}</span>
              </div>
              {selectedAdForPreview.title && (
                <h4 className="text-sm font-black text-slate-900">{selectedAdForPreview.title}</h4>
              )}
              <p className="text-xs text-slate-600">{selectedAdForPreview.description}</p>
              <div className="pt-2 text-xs font-mono font-bold text-slate-800 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
                <span>+91 {selectedAdForPreview.mobile}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
