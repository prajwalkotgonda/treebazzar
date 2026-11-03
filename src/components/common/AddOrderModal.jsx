import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, User, Store, Sprout, Check, MapPin, IndianRupee } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AddOrderModal({ 
  isOpen, 
  onClose, 
  onAddOrder, 
  nurseries = [], 
  plants = [], 
  customers = [] 
}) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerCity: 'Sangli',
    nurseryId: '',
    plantName: '',
    quantity: 1,
    unitPrice: 0,
    paymentMethod: 'Cash on Delivery',
    status: 'pending',
    deliveryAddress: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (nurseries.length > 0 && !formData.nurseryId) {
      const firstNursery = nurseries[0];
      setFormData(prev => ({
        ...prev,
        nurseryId: firstNursery.id,
        customerCity: firstNursery.city || 'Sangli'
      }));
    }
  }, [nurseries, isOpen]);

  // When plant is selected, auto set unitPrice
  const handlePlantChange = (plantId) => {
    const selected = plants.find(p => p.id === plantId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        plantName: selected.nameEn || selected.name || '',
        nurseryId: selected.nurseryId || prev.nurseryId,
        unitPrice: selected.priceMin || selected.price || 100
      }));
    }
  };

  const handleCustomerSelect = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerCity: cust.city || prev.customerCity,
        deliveryAddress: cust.address || prev.deliveryAddress
      }));
    }
  };

  if (!isOpen) return null;

  const totalAmount = (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = lang === 'mr' ? 'ग्राहकाचे नाव आवश्यक आहे' : 'Customer name is required';
    }
    if (!formData.customerPhone.trim()) {
      errs.customerPhone = lang === 'mr' ? 'फोन नंबर आवश्यक आहे' : 'Phone number is required';
    }
    if (!formData.plantName.trim()) {
      errs.plantName = lang === 'mr' ? 'वनस्पतीचे नाव आवश्यक आहे' : 'Plant name is required';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      errs.quantity = lang === 'mr' ? 'योग्य संख्या टाका' : 'Valid quantity required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedNursery = nurseries.find(n => n.id === formData.nurseryId);
    const nurseryName = matchedNursery ? (matchedNursery.name || matchedNursery.nurseryName) : 'Local Partner Nursery';

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerCity: formData.customerCity,
      nurseryId: formData.nurseryId || (nurseries[0]?.id || 'nur-1'),
      nurseryName: nurseryName,
      plantName: formData.plantName.trim(),
      quantity: Number(formData.quantity) || 1,
      unitPrice: Number(formData.unitPrice) || 0,
      totalAmount: totalAmount,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      date: new Date().toISOString().split('T')[0],
      deliveryAddress: formData.deliveryAddress.trim() || `${formData.customerCity}, Maharashtra`,
      notes: formData.notes.trim()
    };

    onAddOrder(newOrder);
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
                {lang === 'mr' ? 'नवीन ऑर्डर तयार करा' : 'Create New Plant Order'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'mr' ? 'थेट किंवा फोन ऑर्डर नोंदवा' : 'Record direct plant purchase'}
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
          
          {/* Quick Select Existing Customer */}
          {customers.length > 0 && (
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <label className="block text-[11px] font-bold text-[#1E5631] mb-1">
                {lang === 'mr' ? 'नोंदणीकृत ग्राहक निवडा (ऐच्छिक)' : 'Quick Fill from Existing Customer (Optional)'}
              </label>
              <select
                onChange={e => handleCustomerSelect(e.target.value)}
                defaultValue=""
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-200 bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="">-- {lang === 'mr' ? 'नवीन ग्राहक लिहा किंवा यादीतून निवडा' : 'Select existing customer'} --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city}) - {c.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'ग्राहकाचे नाव *' : 'Customer Name *'}
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.customerName ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. Ramesh Patil"
              />
              {errors.customerName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'मोबाईल नंबर *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.customerPhone ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
                placeholder="e.g. 9822145678"
              />
              {errors.customerPhone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.customerPhone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'रोपवाटिका निवडा *' : 'Source Nursery *'}
              </label>
              <select
                value={formData.nurseryId}
                onChange={e => setFormData({ ...formData, nurseryId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                {nurseries.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'कॅटलॉगमधून झाड निवडा' : 'Select Plant from Catalog'}
              </label>
              <select
                onChange={e => handlePlantChange(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="">-- {lang === 'mr' ? 'झाड निवडा' : 'Pick plant sapling'} --</option>
                {plants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameEn} ({p.category}) - ₹{p.priceMin || p.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'mr' ? 'वनस्पतीचे नाव / प्रकार *' : 'Plant Variety Name *'}
            </label>
            <input
              type="text"
              value={formData.plantName}
              onChange={e => setFormData({ ...formData, plantName: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.plantName ? 'border-rose-500' : 'border-slate-200'} focus:outline-hidden focus:border-[#2E7D32]`}
              placeholder="e.g. Kesar Mango Grafted Sapling"
            />
            {errors.plantName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.plantName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'प्रमाण (Qty) *' : 'Quantity *'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'पेमेंट पद्धत' : 'Payment Method'}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="Cash on Delivery">Cash on Delivery (रोख)</option>
                <option value="UPI Transfer">UPI Transfer (PhonePe/GPay)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'mr' ? 'ऑर्डर स्थिती' : 'Initial Status'}
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="pending">{lang === 'mr' ? 'प्रलंबित मंजुरी' : 'Pending Approval'}</option>
                <option value="confirmed">{lang === 'mr' ? 'निश्चित (Confirmed)' : 'Confirmed'}</option>
                <option value="dispatched">{lang === 'mr' ? 'पाठवले (Dispatched)' : 'Dispatched'}</option>
                <option value="delivered">{lang === 'mr' ? 'पोहोचवले (Delivered)' : 'Delivered'}</option>
              </select>
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
              placeholder="e.g. Farm No. 12, Tasgaon Road, Sangli"
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
              <span>{lang === 'mr' ? 'ऑर्डर जोडा' : 'Add Order'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
