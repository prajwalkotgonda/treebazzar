import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Search, Plus, Eye, Edit2, Trash2, Phone, 
  MapPin, Clock, MessageCircle, CheckCircle2, Check, X, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AddEnquiryModal from '../common/AddEnquiryModal';
import EditEnquiryModal from '../common/EditEnquiryModal';
import InquiryDetailsModal from '../common/InquiryDetailsModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

export default function EnquiriesView({ 
  inquiries = [], 
  nurseries = [], 
  plants = [], 
  cities = [], 
  onAddEnquiry, 
  onUpdateEnquiry, 
  onDeleteEnquiry, 
  onUpdateInquiryStatus, 
  searchQuery = '' 
}) {
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'New', 'Contacted', 'Converted'
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'WhatsApp', 'Call'
  const [localSearch, setLocalSearch] = useState('');

  // Modals state
  const [addEnquiryOpen, setAddEnquiryOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [viewingEnquiry, setViewingEnquiry] = useState(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState(null);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: inquiries.length,
      New: inquiries.filter(i => (i.status || 'New') === 'New').length,
      Contacted: inquiries.filter(i => i.status === 'Contacted').length,
      Converted: inquiries.filter(i => i.status === 'Converted').length,
    };
  }, [inquiries]);

  // Filtered enquiries
  const filteredInquiries = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return inquiries.filter(inq => {
      // 1. Status tab filter
      const status = inq.status || 'New';
      if (activeTab !== 'all' && status.toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }

      // 2. Type filter
      if (selectedType !== 'all') {
        const inqType = (inq.inquiryType || '').toLowerCase();
        if (!inqType.includes(selectedType.toLowerCase())) {
          return false;
        }
      }

      // 3. Search query
      if (q) {
        const name = (inq.customerName || '').toLowerCase();
        const city = (inq.customerCity || '').toLowerCase();
        const plant = (inq.plantName || inq.plantOrNursery || '').toLowerCase();
        const nursery = (inq.nurseryName || '').toLowerCase();
        const phone = (inq.customerPhone || '').toLowerCase();

        return name.includes(q) || city.includes(q) || plant.includes(q) || nursery.includes(q) || phone.includes(q);
      }

      return true;
    });
  }, [inquiries, activeTab, selectedType, localSearch, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Header Strip & Add Enquiry Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#1E5631]" />
            {lang === 'mr' ? 'ग्राहक चौकशी' : 'Customer Enquiries'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'mr' ? 'वेबसाइटवरून आलेली थेट व्हॉट्सॲप आणि फोन कॉल चौकशी' : 'Manage customer WhatsApp leads and phone call inquiries from local buyers.'}
          </p>
        </div>

        <button
          onClick={() => setAddEnquiryOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? '+ नवीन चौकशी नोंदवा' : '+ Add Enquiry'}</span>
        </button>
      </div>

      {/* Filter and Tab Strip */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: lang === 'mr' ? 'सर्व चौकशी' : 'All Enquiries', count: counts.all },
            { id: 'New', label: lang === 'mr' ? 'नवीन' : 'New Leads', count: counts.New, alert: counts.New > 0 },
            { id: 'Contacted', label: lang === 'mr' ? 'संपर्क केला' : 'Contacted', count: counts.Contacted },
            { id: 'Converted', label: lang === 'mr' ? 'यशस्वी' : 'Resolved', count: counts.Converted }
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

        {/* Type Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#2E7D32]"
          >
            <option value="all">{lang === 'mr' ? 'सर्व प्रकार' : 'All Channels'}</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Call">{lang === 'mr' ? 'फोन कॉल' : 'Phone Call'}</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'ग्राहक, वनस्पती शोधा...' : 'Search enquiries...'}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>
        </div>

      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredInquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{lang === 'mr' ? 'ग्राहक' : 'Customer'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'झाड / चौकशी विषय' : 'Inquired Plant'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'रोपवाटिका' : 'Nursery'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'माध्यम' : 'Channel'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'तारीख व वेळ' : 'Date & Time'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'mr' ? 'कृती (Actions)' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map(inq => {
                  const cleanPhone = inq.customerPhone?.replace(/\D/g, '');
                  const currentStatus = inq.status || 'New';
                  const isWhatsApp = (inq.inquiryType || '').toLowerCase().includes('whatsapp');

                  return (
                    <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {inq.customerName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#2E7D32]" />
                          <span>{inq.customerCity || 'Sangli'}</span>
                        </div>
                      </td>

                      {/* Plant / Subject */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">
                          {inq.plantName || inq.plantOrNursery || 'Plant Inquiry'}
                        </p>
                        {inq.notes && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {inq.notes}
                          </p>
                        )}
                      </td>

                      {/* Nursery */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {inq.nurseryName || 'Local Partner Nursery'}
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isWhatsApp ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isWhatsApp ? (
                            <>
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Date / Timestamp */}
                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {inq.timestamp || inq.date || 'Today'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {currentStatus === 'New' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'नवीन' : 'New'}</span>
                          </span>
                        )}
                        {currentStatus === 'Contacted' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Phone className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'संपर्क केला' : 'Contacted'}</span>
                          </span>
                        )}
                        {currentStatus === 'Converted' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'पूर्ण' : 'Resolved'}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Direct WhatsApp Action */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Quick Mark Contacted (if New) */}
                          {currentStatus === 'New' && (
                            <button
                              onClick={() => onUpdateInquiryStatus && onUpdateInquiryStatus(inq.id, 'Contacted')}
                              title={lang === 'mr' ? 'संपर्क केला म्हणून नोंदवा' : 'Mark Contacted'}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                            >
                              <span>{lang === 'mr' ? 'संपर्क' : 'Contacted'}</span>
                            </button>
                          )}

                          {/* Quick Mark Converted (if Contacted) */}
                          {currentStatus === 'Contacted' && (
                            <button
                              onClick={() => onUpdateInquiryStatus && onUpdateInquiryStatus(inq.id, 'Converted')}
                              title={lang === 'mr' ? 'ऑर्डर पूर्ण / प्रश्न मिटला' : 'Mark Resolved'}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                            >
                              <span>{lang === 'mr' ? 'पूर्ण' : 'Resolve'}</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => setViewingEnquiry(inq)}
                            title={t('btnViewDetails') || 'View Details'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Enquiry */}
                          <button
                            onClick={() => setEditingEnquiry(inq)}
                            title={t('btnEdit') || 'Edit'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1E5631] hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Enquiry */}
                          <button
                            onClick={() => setDeletingEnquiry(inq)}
                            title={t('btnDelete') || 'Delete'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {lang === 'mr' ? 'कोणतीही ग्राहक चौकशी सापडली नाही' : 'No customer enquiries found matching criteria'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'mr' ? 'नवीन चौकशी नोंदवण्यासाठी वरील बटणावर क्लिक करा.' : 'Click "+ Add Enquiry" above to log a phone call or lead.'}
            </p>
          </div>
        )}

      </div>

      {/* Modals */}
      {/* 1. Add Enquiry Modal */}
      {addEnquiryOpen && (
        <AddEnquiryModal
          isOpen={addEnquiryOpen}
          onClose={() => setAddEnquiryOpen(false)}
          onAddEnquiry={onAddEnquiry}
          nurseries={nurseries}
          plants={plants}
          cities={cities}
        />
      )}

      {/* 2. Edit Enquiry Modal */}
      {editingEnquiry && (
        <EditEnquiryModal
          isOpen={Boolean(editingEnquiry)}
          onClose={() => setEditingEnquiry(null)}
          inquiry={editingEnquiry}
          onUpdateEnquiry={onUpdateEnquiry}
        />
      )}

      {/* 3. Enquiry Details Modal */}
      {viewingEnquiry && (
        <InquiryDetailsModal
          inquiry={viewingEnquiry}
          isOpen={Boolean(viewingEnquiry)}
          onClose={() => setViewingEnquiry(null)}
          onUpdateStatus={onUpdateInquiryStatus}
        />
      )}

      {/* 4. Delete Confirm Modal */}
      {deletingEnquiry && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingEnquiry)}
          onClose={() => setDeletingEnquiry(null)}
          onConfirm={() => onDeleteEnquiry && onDeleteEnquiry(deletingEnquiry.id)}
          title={lang === 'mr' ? 'चौकशी हटवा' : 'Delete Enquiry'}
          itemName={`Enquiry from ${deletingEnquiry.customerName}`}
          message={lang === 'mr'
            ? `ही चौकशी नोंद कायमस्वरूपी काढून टाकली जाईल.`
            : `This enquiry log will be permanently deleted.`}
        />
      )}

    </div>
  );
}
