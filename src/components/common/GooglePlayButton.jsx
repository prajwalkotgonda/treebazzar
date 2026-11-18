import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TREEBAZZAR_PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.treebazzar.treebazzar';

export function GooglePlayIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path 
        d="M3.609 1.814L13.793 12 3.61 22.186A2.25 2.25 0 0 1 3 20.602V3.398c0-.62.223-1.205.609-1.584z" 
        fill="#00D2FF"
      />
      <path 
        d="M17.207 8.586L13.793 12l3.414 3.414 3.902-2.23a1.5 1.5 0 0 0 0-2.598l-3.902-2.23z" 
        fill="#FFCE00"
      />
      <path 
        d="M13.793 12L3.61 1.814c.487-.278 1.063-.391 1.64-.314l11.957 6.836L13.793 12z" 
        fill="#00F076"
      />
      <path 
        d="M13.793 12l3.414 3.414-11.957 6.836c-.577.077-1.153-.036-1.64-.314L13.793 12z" 
        fill="#FF3A44"
      />
    </svg>
  );
}

export default function GooglePlayButton({ 
  variant = 'badge', // 'badge', 'navbar', 'pill', 'hero'
  className = '',
  targetUrl = TREEBAZZAR_PLAYSTORE_URL
}) {
  const { lang } = useLanguage();

  // Official store badge style (Black card, white text, Google Play branding)
  if (variant === 'badge') {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Download TreeBazzar on Google Play Store"
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950 hover:bg-black text-white border border-slate-700 hover:border-emerald-500 shadow-md hover:shadow-lg transition-all group active:scale-95 cursor-pointer ${className}`}
      >
        <GooglePlayIcon className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
        <div className="text-left leading-tight">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
            {lang === 'mr' ? 'गुगल प्ले वर उपलब्ध' : 'GET IT ON'}
          </span>
          <span className="block text-sm font-black tracking-wide text-white group-hover:text-emerald-400 transition-colors">
            Google Play
          </span>
        </div>
      </a>
    );
  }

  // Navbar sleek compact button
  if (variant === 'navbar') {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="TreeBazzar App on Google Play"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs hover:shadow-md border border-slate-800 hover:border-emerald-500/60 transition-all active:scale-95 cursor-pointer group ${className}`}
      >
        <GooglePlayIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="tracking-tight">
          {lang === 'mr' ? 'गुगल प्ले' : 'Google Play'}
        </span>
      </a>
    );
  }

  // Pill badge (used in Hero / Top announcement banners)
  if (variant === 'pill') {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-emerald-50 text-slate-800 hover:text-[#1E5631] border border-emerald-200/90 shadow-2xs hover:shadow-sm font-bold text-xs transition-all active:scale-95 cursor-pointer group ${className}`}
      >
        <GooglePlayIcon className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold">
          {lang === 'mr' ? 'प्ले स्टोअरवर ॲप मिळवा' : 'Get App on Google Play'}
        </span>
        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#2E7D32] transition-colors" />
      </a>
    );
  }

  // Hero large CTA button
  if (variant === 'hero') {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:border-emerald-500/60 border border-slate-800 transition-all active:scale-95 cursor-pointer group ${className}`}
      >
        <GooglePlayIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
        <span>{lang === 'mr' ? 'गुगल प्ले वरून ॲप डाउनलोड करा' : 'Download on Google Play'}</span>
        <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
      </a>
    );
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <GooglePlayIcon />
    </a>
  );
}
