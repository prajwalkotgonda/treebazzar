import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Phone, Search, Eye, MapPin, Clock, 
  ExternalLink, User, Sprout, Building2, CheckCircle2, Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import InquiryDetailsModal from '../common/InquiryDetailsModal';

export default function CustomerLeadsView({ 
  inquiries = [], 
  onUpdateInquiryStatus,
  searchQuery = ''
}) {
  const { t, lang } = useLanguage();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'WhatsApp', 'Call'
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return inquiries.filter(inq => {
      // Type filter
      if (selectedType !== 'all' && inq.inquiryType !== selectedType) {
        return false;
      }

      // Search by name, city, plant name, or nursery
      if (q) {
        const name = (inq.customerName || '').toLowerCase();
        const city = (inq.customerCity || '').toLowerCase();
        const plant = (inq.plantName || '').toLowerCase();
        const nursery = (inq.nurseryName || '').toLowerCase();
        const phone = (inq.customerPhone || '').toLowerCase();

        return name.includes(q) || city.includes(q) || plant.includes(q) || nursery.includes(q) || phone.includes(q);
      }

      return true;
    });
  }, [inquiries, selectedType, localSearch, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#1E5631]" />
          {t('inquiriesTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('inquiriesSubtitle')}
        </p>
      </div>

      {/* Filter and Search Bar (Section 7 Requirement) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchInquiriesPlaceholder')}
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
          />
        </div>

        {/* Filter by Type: All, WhatsApp, Call */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32] bg-white text-slate-700"
          >
            <option value="all">{t('filterAllTypes')}</option>
            <option value="WhatsApp">{t('filterWhatsApp')}</option>
            <option value="Call">{t('filterCall')}</option>
          </select>

          {(selectedType !== 'all' || localSearch) && (
            <button
              onClick={() => {
                setSelectedType('all');
                setLocalSearch('');
              }}
              className="text-xs text-rose-600 font-semibold px-2 py-1 hover:underline cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>

      </div>

      {/* Customer Inquiries Table (Section 7 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('thCustomerName')}</th>
                <th className="py-3 px-4">{t('thPhone')}</th>
                <th className="py-3 px-4">{t('thCity')}</th>
                <th className="py-3 px-4">{t('thPlantOrNursery')}</th>
                <th className="py-3 px-4">{t('thInquiryType')}</th>
                <th className="py-3 px-4">{t('thDateTime')}</th>
                <th className="py-3 px-4 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map(inq => {
                  const isWhatsApp = inq.inquiryType === 'WhatsApp';

                  return (
                    <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Customer Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {inq.customerName}
                        </div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-0.5 ${
                          inq.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                          inq.status === 'Contacted' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inq.status}
                        </span>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {inq.customerPhone}
                      </td>

                      {/* City */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-[#2E7D32]" />
                          {inq.customerCity}
                        </span>
                      </td>

                      {/* Plant or Nursery */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {inq.plantName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {inq.nurseryName}
                        </div>
                      </td>

                      {/* Inquiry Type: Call or WhatsApp */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isWhatsApp ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isWhatsApp ? <MessageSquare className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                          {inq.inquiryType}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          {inq.timestamp}
                        </span>
                      </td>

                      {/* Actions: View Details */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>{t('btnViewDetails')}</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold">{t('noResultsFound')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('noResultsDesc')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          onUpdateStatus={(id, status) => {
            if (onUpdateInquiryStatus) onUpdateInquiryStatus(id, status);
            setSelectedInquiry(prev => prev ? { ...prev, status } : null);
          }}
        />
      )}

    </div>
  );
}
