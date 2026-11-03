import React from 'react';
import { X, Users, Phone, Mail, MapPin, Calendar, ShoppingBag, IndianRupee, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CustomerDetailsModal({ 
  isOpen, 
  onClose, 
  customer, 
  orders = [] 
}) {
  const { lang, t } = useLanguage();

  if (!isOpen || !customer) return null;

  // Filter orders made by this customer
  const customerOrders = orders.filter(
    o => o.customerName?.toLowerCase() === customer.name?.toLowerCase() ||
         o.customerPhone?.replace(/\D/g, '') === customer.phone?.replace(/\D/g, '')
  );

  const cleanPhone = customer.phone?.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {customer.name}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'mr' ? 'ग्राहक प्रोफाइल व खरेदी इतिहास' : 'Customer Profile & Order History'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders'}
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {customerOrders.length > 0 ? customerOrders.length : customer.totalOrders || 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-[#1E5631] uppercase tracking-wider block">
                {lang === 'mr' ? 'एकूण खरेदी' : 'Total Spent'}
              </span>
              <span className="text-xl font-black text-emerald-900 mt-1 block">
                ₹{Number(customer.totalSpent || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === 'mr' ? 'नोंदणी तारीख' : 'Member Since'}
              </span>
              <span className="text-xs font-bold text-slate-700 mt-2 block">
                {customer.joinedDate || '2026-08-12'}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">{lang === 'mr' ? 'फोन नंबर:' : 'Phone:'}</span>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>{customer.phone}</span>
                {cleanPhone && (
                  <a
                    href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {customer.email && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Email:</span>
                <span className="text-slate-800">{customer.email}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">{lang === 'mr' ? 'शहर / हब:' : 'City / Hub:'}</span>
              <span className="text-slate-800 font-semibold">{customer.city}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="font-bold text-slate-500 shrink-0">{lang === 'mr' ? 'पत्ता:' : 'Address:'}</span>
              <span className="text-slate-800 text-right">{customer.address || `${customer.city}, Maharashtra`}</span>
            </div>

            {customer.notes && (
              <div className="pt-2 border-t border-slate-200/60 mt-2">
                <span className="font-bold text-slate-500 block mb-0.5">{lang === 'mr' ? 'टीप:' : 'Notes:'}</span>
                <p className="text-slate-700 italic">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Orders History List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{lang === 'mr' ? 'ऑर्डर इतिहास' : 'Recent Orders'} ({customerOrders.length})</span>
            </h4>

            {customerOrders.length > 0 ? (
              <div className="space-y-2">
                {customerOrders.map(order => (
                  <div key={order.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-[#2E7D32]/50 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{order.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{order.date}</span>
                      </div>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {order.plantName} <span className="text-slate-400">({order.quantity} plants)</span>
                      </p>
                      <p className="text-[11px] text-slate-500">{order.nurseryName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mt-1 ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl">
                {lang === 'mr' ? 'अद्याप थेट ऑर्डर्स नोंदवलेल्या नाहीत.' : 'No direct orders found for this customer.'}
              </p>
            )}
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {lang === 'mr' ? 'बंद करा' : 'Close'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
