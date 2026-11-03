import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, IndianRupee } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EditOrderModal({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateOrder 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    plantName: '',
    quantity: 1,
    unitPrice: 0,
    status: 'pending',
    paymentMethod: 'Cash on Delivery',
    deliveryAddress: '',
    notes: ''
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        plantName: order.plantName || '',
        quantity: order.quantity || 1,
        unitPrice: order.unitPrice || 0,
        status: order.status || 'pending',
        paymentMethod: order.paymentMethod || 'Cash on Delivery',
        deliveryAddress: order.deliveryAddress || '',
        notes: order.notes || ''
      });
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const totalAmount = (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updated = {
      ...order,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      plantName: formData.plantName.trim(),
      quantity: Number(formData.quantity) || 1,
      unitPrice: Number(formData.unitPrice) || 0,
      totalAmount: totalAmount,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      deliveryAddress: formData.deliveryAddress.trim(),
      notes: formData.notes.trim()
    };

    onUpdateOrder(order.id, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'ऑर्डर संपादित करा' : 'Edit Order Details'}
              </h3>
              <p className="text-xs text-slate-500">
                {order.id} • {order.customerName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'ग्राहकाचे नाव' : 'Customer Name'}
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'फोन नंबर' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'ऑर्डर स्थिती' : 'Order Status'}
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="pending">{lang === 'mr' ? 'प्रलंबित मंजुरी (Pending)' : 'Pending Approval'}</option>
                <option value="confirmed">{lang === 'mr' ? 'निश्चित (Confirmed)' : 'Confirmed'}</option>
                <option value="dispatched">{lang === 'mr' ? 'पाठवले (Dispatched)' : 'Dispatched'}</option>
                <option value="delivered">{lang === 'mr' ? 'पोहोचवले (Delivered)' : 'Delivered'}</option>
                <option value="cancelled">{lang === 'mr' ? 'रद्द (Cancelled)' : 'Cancelled'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'पेमेंट पद्धत' : 'Payment Method'}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="UPI Transfer">UPI Transfer</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'प्रमाण (Qty)' : 'Quantity'}
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'दर (प्रति रोप ₹)' : 'Rate (per plant ₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'एकूण रक्कम' : 'Total Amount'}
              </label>
              <div className="px-3 py-2 text-xs font-black text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'डिलिव्हरी पत्ता' : 'Delivery Address'}
            </label>
            <input
              type="text"
              value={formData.deliveryAddress}
              onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'टीप / शेरा' : 'Notes / Remarks'}
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              {t('btnCancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{t('btnSave') || 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
