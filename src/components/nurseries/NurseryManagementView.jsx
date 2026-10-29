import React, { useState, useMemo } from 'react';
import { 
  Store, Search, CheckCircle2, XCircle, AlertCircle, Eye, 
  Plus, Phone, MapPin, Calendar, Check, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import NurseryDetailsModal from '../common/NurseryDetailsModal';
import RejectModal from '../common/RejectModal';
import AddNurseryModal from '../common/AddNurseryModal';

export default function NurseryManagementView({ 
  nurseries = [], 
  initialTab = 'all',
  onApprove, 
  onReject,
  onAddNursery,
  searchQuery = ''
}) {
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab); // 'all', 'pending', 'approved', 'rejected'
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  // Modals state
  const [detailsNursery, setDetailsNursery] = useState(null);
  const [rejectingNursery, setRejectingNursery] = useState(null);
  const [addNurseryOpen, setAddNurseryOpen] = useState(false);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: nurseries.length,
      pending: nurseries.filter(n => n.status === 'pending').length,
      approved: nurseries.filter(n => n.status === 'approved').length,
      rejected: nurseries.filter(n => n.status === 'rejected').length
    };
  }, [nurseries]);

  // Unique cities list
  const cities = useMemo(() => {
    return Array.from(new Set(nurseries.map(n => n.city).filter(Boolean)));
  }, [nurseries]);

  // Filtered nurseries
  const filteredNurseries = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return nurseries.filter(n => {
      // 1. Tab filter
      if (activeTab !== 'all' && n.status !== activeTab) {
        return false;
      }

      // 2. City filter
      if (selectedCity !== 'all' && n.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Search query (by nursery name, owner name, or city)
      if (q) {
        const nameEn = (n.name || '').toLowerCase();
        const nameMr = (n.nameMr || '').toLowerCase();
        const owner = (n.ownerName || n.owner || '').toLowerCase();
        const city = (n.city || '').toLowerCase();
        const phone = (n.phone || '').toLowerCase();

        return nameEn.includes(q) || nameMr.includes(q) || owner.includes(q) || city.includes(q) || phone.includes(q);
      }

      return true;
    });
  }, [nurseries, activeTab, selectedCity, localSearch, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Header Strip & Add Nursery */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-[#1E5631]" />
            {t('nurseryMgmtTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('nurseryMgmtSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setAddNurseryOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btnAddNursery')}</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Tabs: All, Pending, Approved, Rejected (Section 5 Requirement) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: t('tabAll'), count: counts.all },
              { id: 'pending', label: t('tabPending'), count: counts.pending, alert: counts.pending > 0 },
              { id: 'approved', label: t('tabApproved'), count: counts.approved },
              { id: 'rejected', label: t('tabRejected'), count: counts.rejected }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1E5631] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.alert
                      ? 'bg-amber-100 text-amber-800 font-black'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search by Nursery Name, Owner, City & City Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchNurseryPlaceholder')}
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>

            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32] bg-white text-slate-700"
            >
              <option value="all">{t('allCities')}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Nursery Table (Section 5 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('thNurseryName')}</th>
                <th className="py-3 px-4">{t('thOwnerName')}</th>
                <th className="py-3 px-4">{t('thCity')}</th>
                <th className="py-3 px-4">{t('thPhone')}</th>
                <th className="py-3 px-4">{t('thRegDate')}</th>
                <th className="py-3 px-4">{t('thStatus')}</th>
                <th className="py-3 px-4 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNurseries.length > 0 ? (
                filteredNurseries.map(n => {
                  const isApproved = n.status === 'approved';
                  const isPending = n.status === 'pending';
                  const isRejected = n.status === 'rejected';

                  return (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nursery Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {lang === 'mr' && n.nameMr ? n.nameMr : n.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {n.licenseNumber || `MH-${n.city?.toUpperCase()}-REG`}
                        </div>
                      </td>

                      {/* Owner Name */}
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {n.ownerName || n.owner}
                      </td>

                      {/* City */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-[#2E7D32]" />
                          {n.city}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {n.phone || n.ownerPhone}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {n.registrationDate || '2026-10-15'}
                      </td>

                      {/* Approval Status Badge */}
                      <td className="py-3 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('statusApproved')}
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            <AlertCircle className="w-3 h-3" />
                            {t('statusPending')}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" />
                            {t('statusRejected')}
                          </span>
                        )}
                      </td>

                      {/* Actions: Approve, Reject, View Details */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          
                          {/* Approve Button */}
                          {n.status !== 'approved' && (
                            <button
                              onClick={() => onApprove(n.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs flex items-center gap-1"
                              title={t('btnApprove')}
                            >
                              <Check className="w-3 h-3" />
                              <span>{t('btnApprove')}</span>
                            </button>
                          )}

                          {/* Reject Button */}
                          {n.status !== 'rejected' && (
                            <button
                              onClick={() => setRejectingNursery(n)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors flex items-center gap-1"
                              title={t('btnReject')}
                            >
                              <X className="w-3 h-3" />
                              <span>{t('btnReject')}</span>
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => setDetailsNursery(n)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                            title={t('btnViewDetails')}
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>{t('btnViewDetails')}</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold">{t('noResultsFound')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('noResultsDesc')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nursery Details Modal */}
      {detailsNursery && (
        <NurseryDetailsModal
          nursery={detailsNursery}
          isOpen={Boolean(detailsNursery)}
          onClose={() => setDetailsNursery(null)}
          onApprove={(id) => {
            onApprove(id);
            setDetailsNursery(null);
          }}
          onOpenReject={(n) => {
            setDetailsNursery(null);
            setRejectingNursery(n);
          }}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectingNursery && (
        <RejectModal
          nursery={rejectingNursery}
          isOpen={Boolean(rejectingNursery)}
          onClose={() => setRejectingNursery(null)}
          onConfirm={(id, reason) => {
            onReject(id, reason);
            setRejectingNursery(null);
          }}
        />
      )}

      {/* Add Nursery Modal */}
      {addNurseryOpen && (
        <AddNurseryModal
          isOpen={addNurseryOpen}
          onClose={() => setAddNurseryOpen(false)}
          onAddNursery={onAddNursery}
        />
      )}

    </div>
  );
}
