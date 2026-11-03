import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, Plus, Eye, Edit2, Trash2, Check, X, 
  MapPin, Phone, Calendar, IndianRupee, Truck, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AddOrderModal from '../common/AddOrderModal';
import EditOrderModal from '../common/EditOrderModal';
import OrderDetailsModal from '../common/OrderDetailsModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

export default function OrdersView({ 
  orders = [], 
  nurseries = [], 
  plants = [], 
  customers = [],
  onAddOrder, 
  onUpdateOrder, 
  onDeleteOrder, 
  onApproveOrder, 
  onRejectOrder, 
  searchQuery = '' 
}) {
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'
  const [localSearch, setLocalSearch] = useState('');
  const [selectedNursery, setSelectedNursery] = useState('all');

  // Modal states
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      dispatched: orders.filter(o => o.status === 'dispatched').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return orders.filter(order => {
      // 1. Tab filter
      if (activeTab !== 'all' && order.status !== activeTab) {
        return false;
      }

      // 2. Nursery filter
      if (selectedNursery !== 'all' && order.nurseryId !== selectedNursery) {
        return false;
      }

      // 3. Search query
      if (q) {
        const id = (order.id || '').toLowerCase();
        const cust = (order.customerName || '').toLowerCase();
        const phone = (order.customerPhone || '').toLowerCase();
        const plant = (order.plantName || '').toLowerCase();
        const nursery = (order.nurseryName || '').toLowerCase();

        return id.includes(q) || cust.includes(q) || phone.includes(q) || plant.includes(q) || nursery.includes(q);
      }

      return true;
    });
  }, [orders, activeTab, selectedNursery, localSearch, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Header Strip & Add Order Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#1E5631]" />
            {t('ordersTitle') || 'Orders Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('ordersSubtitle') || 'Track customer plant sapling orders, update statuses, and generate receipts.'}
          </p>
        </div>

        <button
          onClick={() => setAddOrderOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? '+ नवीन ऑर्डर जोडा' : '+ Add Order'}</span>
        </button>
      </div>

      {/* Filter and Tab Strip */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: lang === 'mr' ? 'सर्व ऑर्डर्स' : 'All Orders', count: counts.all },
            { id: 'pending', label: lang === 'mr' ? 'प्रलंबित मंजुरी' : 'Pending', count: counts.pending, alert: counts.pending > 0 },
            { id: 'confirmed', label: lang === 'mr' ? 'निश्चित' : 'Confirmed', count: counts.confirmed },
            { id: 'dispatched', label: lang === 'mr' ? 'पाठवले' : 'Dispatched', count: counts.dispatched },
            { id: 'delivered', label: lang === 'mr' ? 'पोहोचवले' : 'Delivered', count: counts.delivered },
            { id: 'cancelled', label: lang === 'mr' ? 'रद्द' : 'Cancelled', count: counts.cancelled }
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

        {/* Nursery Dropdown & Search Input */}
        <div className="flex items-center gap-2">
          <select
            value={selectedNursery}
            onChange={e => setSelectedNursery(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#2E7D32]"
          >
            <option value="all">{lang === 'mr' ? 'सर्व रोपवाटिका' : 'All Nurseries'}</option>
            {nurseries.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'ऑर्डर, ग्राहक शोधा...' : 'Search order...'}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('thOrderId') || 'Order ID'}</th>
                  <th className="py-3 px-4">{t('thCustomer') || 'Customer'}</th>
                  <th className="py-3 px-4">{t('thPlantItem') || 'Plant / Variety'}</th>
                  <th className="py-3 px-4">{t('thNursery') || 'Nursery'}</th>
                  <th className="py-3 px-4 text-right">{t('thTotal') || 'Amount'}</th>
                  <th className="py-3 px-4">{t('thStatus') || 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'mr' ? 'कृती (Actions)' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Order ID & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {order.date}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {order.customerPhone}
                      </p>
                    </td>

                    {/* Plant Variety & Qty */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">
                        {order.plantName}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {order.quantity} {lang === 'mr' ? 'रोपे' : 'plants'}
                      </span>
                    </td>

                    {/* Nursery */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="truncate block max-w-[160px]" title={order.nurseryName}>
                        {order.nurseryName}
                      </span>
                    </td>

                    {/* Total Amount & Payment */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-slate-900 block">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {order.paymentMethod || 'Cash'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {order.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'निश्चित' : 'Confirmed'}</span>
                        </span>
                      )}
                      {order.status === 'dispatched' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          <Truck className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'पाठवले' : 'Dispatched'}</span>
                        </span>
                      )}
                      {order.status === 'delivered' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'पोहोचवले' : 'Delivered'}</span>
                        </span>
                      )}
                      {order.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'प्रलंबित' : 'Pending'}</span>
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <X className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'रद्द' : 'Cancelled'}</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick Approve/Confirm (if pending) */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => onApproveOrder && onApproveOrder(order.id)}
                            title={lang === 'mr' ? 'स्वीकारा (Confirm)' : 'Confirm Order'}
                            className="px-2.5 py-1 bg-[#1E5631] hover:bg-[#2E7D32] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'स्वीकारा' : 'Confirm'}</span>
                          </button>
                        )}

                        {/* Quick Dispatch (if confirmed) */}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateOrder && onUpdateOrder(order.id, { ...order, status: 'dispatched' })}
                            title={lang === 'mr' ? 'पाठवले म्हणून चिन्हांकित करा' : 'Mark Dispatched'}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          >
                            <Truck className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'पाठवा' : 'Dispatch'}</span>
                          </button>
                        )}

                        {/* Quick Delivered (if dispatched) */}
                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => onUpdateOrder && onUpdateOrder(order.id, { ...order, status: 'delivered' })}
                            title={lang === 'mr' ? 'पोहोचवले म्हणून चिन्हांकित करा' : 'Mark Delivered'}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          >
                            <Check className="w-3 h-3" />
                            <span>{lang === 'mr' ? 'पोहोचले' : 'Delivered'}</span>
                          </button>
                        )}

                        {/* View Receipt / Invoice */}
                        <button
                          onClick={() => setViewingOrder(order)}
                          title={t('btnViewReceipt') || 'View Receipt'}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Order */}
                        <button
                          onClick={() => setEditingOrder(order)}
                          title={t('btnEdit') || 'Edit'}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1E5631] hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => setDeletingOrder(order)}
                          title={t('btnDelete') || 'Delete'}
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
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {lang === 'mr' ? 'कोणत्याही ऑर्डर्स सापडल्या नाहीत' : 'No plant orders found matching criteria'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'mr' ? 'नवीन ऑर्डर तयार करण्यासाठी वर दिलेल्या बटणावर क्लिक करा.' : 'Click "+ Add Order" above to record a new purchase.'}
            </p>
          </div>
        )}

      </div>

      {/* Modals */}
      {/* 1. Add Order Modal */}
      {addOrderOpen && (
        <AddOrderModal
          isOpen={addOrderOpen}
          onClose={() => setAddOrderOpen(false)}
          onAddOrder={onAddOrder}
          nurseries={nurseries}
          plants={plants}
          customers={customers}
        />
      )}

      {/* 2. Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          isOpen={Boolean(editingOrder)}
          onClose={() => setEditingOrder(null)}
          order={editingOrder}
          onUpdateOrder={onUpdateOrder}
        />
      )}

      {/* 3. Order Details / Receipt Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          isOpen={Boolean(viewingOrder)}
          onClose={() => setViewingOrder(null)}
          order={viewingOrder}
        />
      )}

      {/* 4. Delete Confirm Modal */}
      {deletingOrder && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingOrder)}
          onClose={() => setDeletingOrder(null)}
          onConfirm={() => onDeleteOrder && onDeleteOrder(deletingOrder.id)}
          title={lang === 'mr' ? 'ऑर्डर हटवा' : 'Delete Order'}
          itemName={`Order #${deletingOrder.id} (${deletingOrder.customerName})`}
          message={lang === 'mr'
            ? `ही ऑर्डर कायमस्वरूपी हटवली जाईल. तुम्हाला नक्की हटवायची आहे का?`
            : `Order #${deletingOrder.id} will be permanently removed.`}
        />
      )}

    </div>
  );
}
