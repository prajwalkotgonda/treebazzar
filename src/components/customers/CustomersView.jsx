import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Eye, Edit2, Trash2, MapPin, 
  Phone, Mail, MessageCircle, IndianRupee, ShoppingBag
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AddCustomerModal from '../common/AddCustomerModal';
import EditCustomerModal from '../common/EditCustomerModal';
import CustomerDetailsModal from '../common/CustomerDetailsModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

export default function CustomersView({ 
  customers = [], 
  orders = [], 
  cities = [], 
  onAddCustomer, 
  onEditCustomer, 
  onDeleteCustomer, 
  searchQuery = '' 
}) {
  const { lang, t } = useLanguage();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  // Modals state
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return customers.filter(customer => {
      // 1. City filter
      if (selectedCity !== 'all' && customer.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 2. Search query
      if (q) {
        const name = (customer.name || '').toLowerCase();
        const phone = (customer.phone || '').toLowerCase();
        const email = (customer.email || '').toLowerCase();
        const city = (customer.city || '').toLowerCase();

        return name.includes(q) || phone.includes(q) || email.includes(q) || city.includes(q);
      }

      return true;
    });
  }, [customers, selectedCity, localSearch, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Header Strip & Add Customer Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1E5631]" />
            {t('customersTitle') || 'Customers Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('customersSubtitle') || 'Direct directory of farmers, garden owners, and nursery buyers.'}
          </p>
        </div>

        <button
          onClick={() => setAddCustomerOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? '+ नवीन ग्राहक जोडा' : '+ Add Customer'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Total Customers Count Pill */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#1E5631] border border-emerald-100">
            {filteredCustomers.length} {lang === 'mr' ? 'ग्राहक' : 'Customers'}
          </span>
          <span className="text-slate-400 font-normal hidden md:inline">
            {lang === 'mr' ? 'थेट व्हॉट्सॲप चॅट किंवा कॉल उपलब्ध' : 'Direct WhatsApp & Phone access'}
          </span>
        </div>

        {/* City Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#2E7D32]"
          >
            <option value="all">{lang === 'mr' ? 'सर्व शहरे' : 'All Cities'}</option>
            {cities.map(c => (
              <option key={c.id || c.nameEn} value={c.nameEn}>
                {lang === 'mr' && c.nameMr ? `${c.nameEn} (${c.nameMr})` : c.nameEn}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'नाव, फोन, शहर शोधा...' : 'Search customer...'}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>
        </div>

      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('thCustomerName') || 'Customer Name'}</th>
                  <th className="py-3 px-4">{t('thCity') || 'City / Region'}</th>
                  <th className="py-3 px-4">{t('thPhone') || 'Contact Phone'}</th>
                  <th className="py-3 px-4 text-center">{t('thTotalOrders') || 'Orders'}</th>
                  <th className="py-3 px-4 text-right">{t('thTotalSpent') || 'Total Spent'}</th>
                  <th className="py-3 px-4">{t('thJoinedDate') || 'Member Since'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'mr' ? 'कृती (Actions)' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(customer => {
                  const cleanPhone = customer.phone?.replace(/\D/g, '');
                  // Count orders for this customer from current orders list
                  const customerOrdersCount = orders.filter(
                    o => o.customerName?.toLowerCase() === customer.name?.toLowerCase() ||
                         o.customerPhone?.replace(/\D/g, '') === cleanPhone
                  ).length || customer.totalOrders || 0;

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Notes */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1E5631] flex items-center justify-center font-bold text-xs shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {customer.name}
                            </p>
                            {customer.notes && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {customer.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2E7D32]" />
                          {customer.city}
                        </span>
                      </td>

                      {/* Phone & Direct WhatsApp */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700 font-medium">{customer.phone}</span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="WhatsApp Message"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Total Orders */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {customerOrdersCount}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-slate-900">
                          ₹{Number(customer.totalSpent || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {customer.joinedDate || '2026-08-12'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Customer Details & Order History */}
                          <button
                            onClick={() => setViewingCustomer(customer)}
                            title={t('btnViewDetails') || 'View Details'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Customer */}
                          <button
                            onClick={() => setEditingCustomer(customer)}
                            title={t('btnEdit') || 'Edit'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1E5631] hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Customer */}
                          <button
                            onClick={() => setDeletingCustomer(customer)}
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
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {lang === 'mr' ? 'कोणतेही ग्राहक सापडले नाहीत' : 'No customers found'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'mr' ? 'नवीन ग्राहक जोडण्यासाठी वरील बटणावर क्लिक करा.' : 'Click "+ Add Customer" above to register a buyer profile.'}
            </p>
          </div>
        )}

      </div>

      {/* Modals */}
      {/* 1. Add Customer Modal */}
      {addCustomerOpen && (
        <AddCustomerModal
          isOpen={addCustomerOpen}
          onClose={() => setAddCustomerOpen(false)}
          onAddCustomer={onAddCustomer}
          cities={cities}
        />
      )}

      {/* 2. Edit Customer Modal */}
      {editingCustomer && (
        <EditCustomerModal
          isOpen={Boolean(editingCustomer)}
          onClose={() => setEditingCustomer(null)}
          customer={editingCustomer}
          onUpdateCustomer={onEditCustomer}
          cities={cities}
        />
      )}

      {/* 3. Customer Details & History Modal */}
      {viewingCustomer && (
        <CustomerDetailsModal
          isOpen={Boolean(viewingCustomer)}
          onClose={() => setViewingCustomer(null)}
          customer={viewingCustomer}
          orders={orders}
        />
      )}

      {/* 4. Delete Confirm Modal */}
      {deletingCustomer && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingCustomer)}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={() => onDeleteCustomer && onDeleteCustomer(deletingCustomer.id)}
          title={lang === 'mr' ? 'ग्राहक हटवा' : 'Delete Customer'}
          itemName={deletingCustomer.name}
          message={lang === 'mr'
            ? `"${deletingCustomer.name}" यांची माहिती कायमस्वरूपी हटवली जाईल. तुम्हाला खात्री आहे का?`
            : `Customer "${deletingCustomer.name}" will be permanently removed.`}
        />
      )}

    </div>
  );
}
