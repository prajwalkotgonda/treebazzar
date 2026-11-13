import React, { useState, useMemo } from 'react';
import { 
  Store, Search, CheckCircle2, XCircle, AlertCircle, Eye, 
  Plus, Phone, MapPin, Calendar, Check, X, Edit2, Trash2, ShieldAlert, Loader2,
  RotateCcw, Ban
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import NurseryDetailsModal from '../common/NurseryDetailsModal';
import RejectModal from '../common/RejectModal';
import AddNurseryModal from '../common/AddNurseryModal';
import EditNurseryModal from '../common/EditNurseryModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import RevokeConfirmModal from '../common/RevokeConfirmModal';
import SuspendConfirmModal from '../common/SuspendConfirmModal';

export default function NurseryManagementView({ 
  nurseries = [], 
  cities: citiesProp = [],
  initialTab = 'all',
  onApprove, 
  onReject,
  onRevoke,
  onSuspend,
  onUnsuspend,
  onAddNursery,
  onUpdateNursery,
  onDeleteNursery,
  searchQuery = ''
}) {
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab); // 'all', 'pending', 'approved', 'suspended', 'rejected'
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  // Modals state
  const [detailsNursery, setDetailsNursery] = useState(null);
  const [rejectingNursery, setRejectingNursery] = useState(null);
  const [revokingNursery, setRevokingNursery] = useState(null);
  const [suspendingNursery, setSuspendingNursery] = useState(null);
  const [addNurseryOpen, setAddNurseryOpen] = useState(false);
  const [editingNursery, setEditingNursery] = useState(null);
  const [deletingNursery, setDeletingNursery] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleApproveWithFeedback = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      if (onApprove) await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnsuspendWithFeedback = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      if (onUnsuspend) await onUnsuspend(id);
    } finally {
      setProcessingId(null);
    }
  };

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: nurseries.length,
      pending: nurseries.filter(n => (n.status === 'pending' || n.status === 'revoked') && !n.isSuspended).length,
      approved: nurseries.filter(n => n.status === 'approved' && !n.isSuspended).length,
      suspended: nurseries.filter(n => n.status === 'suspended' || (n.isSuspended && n.status !== 'rejected')).length,
      rejected: nurseries.filter(n => n.status === 'rejected').length
    };
  }, [nurseries]);

  // Available cities list
  const availableCities = useMemo(() => {
    if (citiesProp && citiesProp.length > 0) {
      return citiesProp.map(c => ({
        value: c.nameEn,
        label: lang === 'mr' && c.nameMr ? `${c.nameEn} (${c.nameMr})` : c.nameEn
      }));
    }
    const unique = Array.from(new Set(nurseries.map(n => n.city).filter(Boolean)));
    return unique.map(c => ({ value: c, label: c }));
  }, [citiesProp, nurseries, lang]);

  // Filtered nurseries
  const filteredNurseries = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return nurseries.filter(n => {
      // 1. Tab filter
      if (activeTab === 'pending') {
        if ((n.status !== 'pending' && n.status !== 'revoked') || n.isSuspended) return false;
      } else if (activeTab === 'approved') {
        if (n.status !== 'approved' || n.isSuspended) return false;
      } else if (activeTab === 'suspended') {
        if (n.status !== 'suspended' && !(n.isSuspended && n.status !== 'rejected')) return false;
      } else if (activeTab === 'rejected') {
        if (n.status !== 'rejected') return false;
      }

      // 2. City filter
      if (selectedCity !== 'all' && n.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Search query (by nursery name, owner name, city, phone)
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
            {t('nurseryMgmtTitle') || 'Nursery Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'mr' ? 'स्थानिक रोपवाटिकांची नोंदणी, पडताळणी आणि व्यवस्थापन' : 'Review local partner nurseries, approve applications, and manage profiles.'}
          </p>
        </div>

        <button
          onClick={() => setAddNurseryOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? '+ नवीन रोपवाटिका जोडा' : '+ Add Nursery'}</span>
        </button>
      </div>

      {/* Filter and Tab Strip */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: lang === 'mr' ? 'सर्व रोपवाटिका' : 'All Nurseries', count: counts.all },
            { id: 'pending', label: lang === 'mr' ? 'प्रलंबित अर्ज' : 'Pending Review', count: counts.pending, alert: counts.pending > 0 },
            { id: 'approved', label: lang === 'mr' ? 'मंजूर' : 'Approved', count: counts.approved },
            { id: 'suspended', label: lang === 'mr' ? 'निलंबित' : 'Suspended', count: counts.suspended },
            { id: 'rejected', label: lang === 'mr' ? 'नाकारलेले' : 'Rejected', count: counts.rejected }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#1E5631] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : tab.alert 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* City Filter & Search Bar */}
        <div className="flex items-center gap-2">
          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#2E7D32]"
          >
            <option value="all">{lang === 'mr' ? 'सर्व शहरे' : 'All Cities'}</option>
            {availableCities.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Local Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'नाव, शहर शोधा...' : 'Search nursery...'}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>
        </div>

      </div>

      {/* Nurseries Table & Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredNurseries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{lang === 'mr' ? 'रोपवाटिका व मालक' : 'Nursery & Owner'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'शहर / Hub' : 'City / Region'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'संपर्क नंबर' : 'Contact Phone'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'नोंदणी तारीख' : 'Reg. Date'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'mr' ? 'कृती (Actions)' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNurseries.map(nursery => (
                  <tr key={nursery.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Nursery & Owner Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1E5631] flex items-center justify-center font-bold text-xs shrink-0">
                          {nursery.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {nursery.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {nursery.ownerName || nursery.owner}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#2E7D32]" />
                        {nursery.city}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {nursery.phone}
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {nursery.registrationDate || '2026-10-15'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {nursery.status === 'approved' && !nursery.isSuspended && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'मंजूर' : 'Approved'}</span>
                        </span>
                      )}
                      {(nursery.status === 'suspended' || (nursery.isSuspended && nursery.status !== 'rejected')) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <Ban className="w-3 h-3 text-rose-600" />
                          <span>{lang === 'mr' ? 'निलंबित' : 'Suspended'}</span>
                        </span>
                      )}
                      {nursery.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'प्रलंबित' : 'Pending'}</span>
                        </span>
                      )}
                      {nursery.status === 'revoked' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <RotateCcw className="w-3 h-3 text-amber-600" />
                          <span>{lang === 'mr' ? 'रद्द (प्रलंबित)' : 'Revoked'}</span>
                        </span>
                      )}
                      {nursery.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          <XCircle className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'नाकारलेले' : 'Rejected'}</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Pending Nursery Actions: Approve & Reject */}
                        {nursery.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveWithFeedback(nursery.id)}
                              disabled={processingId === nursery.id}
                              title={lang === 'mr' ? 'मंजूर करा' : 'Approve'}
                              className="px-2.5 py-1 bg-[#1E5631] hover:bg-[#2E7D32] disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
                            >
                              {processingId === nursery.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>
                                {processingId === nursery.id 
                                  ? (lang === 'mr' ? 'मंजूर होत आहे...' : 'Approving...') 
                                  : (lang === 'mr' ? 'मंजूर' : 'Approve')}
                              </span>
                            </button>

                            <button
                              onClick={() => setRejectingNursery(nursery)}
                              title={lang === 'mr' ? 'नाकारा' : 'Reject'}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <X className="w-3 h-3" />
                              <span>{lang === 'mr' ? 'नाकारा' : 'Reject'}</span>
                            </button>
                          </>
                        )}

                        {/* Approved Nursery Actions: Revoke Approval & Suspend */}
                        {nursery.status === 'approved' && !nursery.isSuspended && (
                          <>
                            <button
                              onClick={() => setRevokingNursery(nursery)}
                              title={lang === 'mr' ? 'मंजुरी रद्द करा' : 'Revoke Approval'}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              <span>{lang === 'mr' ? 'रद्द' : 'Revoke'}</span>
                            </button>

                            <button
                              onClick={() => setSuspendingNursery(nursery)}
                              title={lang === 'mr' ? 'खाते निलंबित करा' : 'Suspend Nursery'}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                            >
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>{lang === 'mr' ? 'निलंबित' : 'Suspend'}</span>
                            </button>
                          </>
                        )}

                        {/* Suspended Nursery Action: Unsuspend / Reactivate */}
                        {(nursery.status === 'suspended' || (nursery.isSuspended && nursery.status !== 'rejected')) && (
                          <button
                            onClick={() => handleUnsuspendWithFeedback(nursery.id)}
                            disabled={processingId === nursery.id}
                            title={lang === 'mr' ? 'निलंबन मागे घ्या (सक्रिय करा)' : 'Unsuspend / Re-Activate'}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                          >
                            {processingId === nursery.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-[#1E5631]" />
                            )}
                            <span>{lang === 'mr' ? 'सक्रिय करा' : 'Unsuspend'}</span>
                          </button>
                        )}

                        {/* Rejected or Revoked Nursery Action: Re-Approve */}
                        {(nursery.status === 'rejected' || nursery.status === 'revoked') && (
                          <button
                            onClick={() => handleApproveWithFeedback(nursery.id)}
                            disabled={processingId === nursery.id}
                            title={lang === 'mr' ? 'पुन्हा मंजूर करा' : 'Re-Approve'}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                          >
                            {processingId === nursery.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>{lang === 'mr' ? 'पुन्हा मंजूर' : 'Re-Approve'}</span>
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => setDetailsNursery(nursery)}
                          title={lang === 'mr' ? 'तपशील पहा' : 'View Details'}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingNursery(nursery)}
                          title={lang === 'mr' ? 'संपादित करा' : 'Edit'}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1E5631] hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingNursery(nursery)}
                          title={lang === 'mr' ? 'हटवा' : 'Delete'}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {lang === 'mr' ? 'कोणतीही रोपवाटिका सापडली नाही' : 'No nurseries found matching filters'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'mr' ? 'फिल्टर्स किंवा शोध शब्द बदलून पहा.' : 'Try adjusting your search terms or filter selection.'}
            </p>
          </div>
        )}

      </div>

      {/* All Functional Modals */}
      {/* 1. Add Nursery Modal */}
      <AddNurseryModal
        isOpen={addNurseryOpen}
        onClose={() => setAddNurseryOpen(false)}
        onAddNursery={onAddNursery}
        cities={citiesProp}
      />

      {/* 2. Edit Nursery Modal */}
      {editingNursery && (
        <EditNurseryModal
          isOpen={Boolean(editingNursery)}
          onClose={() => setEditingNursery(null)}
          nursery={editingNursery}
          onUpdateNursery={onUpdateNursery}
          cities={citiesProp}
        />
      )}

      {/* 3. Delete Confirm Modal */}
      {deletingNursery && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingNursery)}
          onClose={() => setDeletingNursery(null)}
          onConfirm={() => onDeleteNursery && onDeleteNursery(deletingNursery.id)}
          title={lang === 'mr' ? 'रोपवाटिका हटवा' : 'Delete Nursery'}
          itemName={deletingNursery.name}
          message={lang === 'mr' 
            ? `"${deletingNursery.name}" ही रोपवाटिका कायमस्वरूपी हटवली जाईल. तुम्हाला खात्री आहे का?`
            : `"${deletingNursery.name}" and its listed varieties will be removed. Are you sure?`}
        />
      )}

      {/* 4. Details Modal */}
      {detailsNursery && (
        <NurseryDetailsModal
          nursery={detailsNursery}
          isOpen={Boolean(detailsNursery)}
          onClose={() => setDetailsNursery(null)}
          onApprove={async (id) => {
            if (onApprove) await onApprove(id);
            setDetailsNursery(null);
          }}
          onOpenReject={(n) => {
            setRejectingNursery(n);
            setDetailsNursery(null);
          }}
          onOpenRevoke={(n) => {
            setRevokingNursery(n);
            setDetailsNursery(null);
          }}
          onOpenSuspend={(n) => {
            setSuspendingNursery(n);
            setDetailsNursery(null);
          }}
          onUnsuspend={async (id) => {
            if (onUnsuspend) await onUnsuspend(id);
            setDetailsNursery(null);
          }}
        />
      )}

      {/* 5. Reject Modal */}
      {rejectingNursery && (
        <RejectModal
          nursery={rejectingNursery}
          isOpen={Boolean(rejectingNursery)}
          onClose={() => setRejectingNursery(null)}
          onConfirm={async (id, reason, notes) => {
            if (onReject) await onReject(id, notes ? `${reason}: ${notes}` : reason);
            setRejectingNursery(null);
          }}
        />
      )}

      {/* 6. Revoke Approval Modal */}
      {revokingNursery && (
        <RevokeConfirmModal
          nursery={revokingNursery}
          isOpen={Boolean(revokingNursery)}
          onClose={() => setRevokingNursery(null)}
          onConfirm={async (id, reason) => {
            if (onRevoke) await onRevoke(id, reason);
            setRevokingNursery(null);
          }}
        />
      )}

      {/* 7. Suspend Account Modal */}
      {suspendingNursery && (
        <SuspendConfirmModal
          nursery={suspendingNursery}
          isOpen={Boolean(suspendingNursery)}
          onClose={() => setSuspendingNursery(null)}
          onConfirm={async (id, reason) => {
            if (onSuspend) await onSuspend(id, reason);
            setSuspendingNursery(null);
          }}
        />
      )}

    </div>
  );
}
