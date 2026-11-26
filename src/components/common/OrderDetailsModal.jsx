import React from 'react';
import { 
  X, Printer, ShoppingBag, MapPin, Phone, Calendar, User, Store, 
  IndianRupee, CheckCircle2, Clock, Sprout, Tag, ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export default function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order,
  plants = []
}) {
  const { lang, t } = useLanguage();

  useBodyScrollLock(isOpen);
  if (!isOpen || !order) return null;

  // Match plant details
  const matchedPlant = plants.find(p => 
    p.id === order.plantId || 
    (order.plantName && p.nameEn && order.plantName.toLowerCase().trim() === p.nameEn.toLowerCase().trim()) ||
    (order.plantName && p.nameEn && order.plantName.toLowerCase().includes(p.nameEn.toLowerCase())) ||
    (order.plantName && p.nameMr && order.plantName.includes(p.nameMr))
  );

  const plantImg = order.plantImage || matchedPlant?.photoUrl || matchedPlant?.image;
  const plantCategory = order.plantCategory || matchedPlant?.category;
  const plantCategoryMr = order.plantCategoryMr || matchedPlant?.categoryMr;
  const plantNameMr = order.plantNameMr || matchedPlant?.nameMr;
  const botanicalName = order.botanicalName || matchedPlant?.botanicalName;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Confirmed (निश्चित)</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">Dispatched (पाठवले)</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-teal-100 text-teal-800">Delivered (पोहोचवले)</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">Cancelled (रद्द)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">Pending Approval (प्रलंबित)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overscroll-contain">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 print:m-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5631] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'mr' ? 'ऑर्डर पावती / तपशील' : 'Order Receipt & Invoice'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {order.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#2E7D32]" />
              <span>{lang === 'mr' ? 'प्रिंट पावती' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 bg-white">
          
          {/* Top Brand & Order Metadata */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">TreeBazzar</h2>
              <p className="text-xs text-slate-500">Local Nursery Discovery & Plant Ordering</p>
              <p className="text-xs text-[#2E7D32] font-semibold mt-0.5">All India Nursery Marketplace</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
              <span className="text-base font-black text-slate-800 font-mono">{order.id}</span>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
          </div>

          {/* Customer & Nursery Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                {lang === 'mr' ? 'ग्राहक माहिती' : 'Customer Details'}
              </span>
              <p className="font-bold text-slate-800 text-sm">{order.customerName}</p>
              <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {order.customerPhone}
              </p>
              <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {order.deliveryAddress || (order.customerCity ? `${order.customerCity}, Maharashtra` : 'Maharashtra')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                {lang === 'mr' ? 'रोपवाटिका पुरवठादार' : 'Source Nursery'}
              </span>
              <p className="font-bold text-slate-800 text-sm">{order.nurseryName}</p>
              <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                {order.date}
              </p>
              <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                <span>Payment:</span>
                <span className="font-semibold text-slate-700">{order.paymentMethod || 'Cash on Delivery'}</span>
              </p>
            </div>
          </div>

          {/* Items Table with Full Plant Details */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">{lang === 'mr' ? 'ऑर्डर केलेले रोप / तपशील (Plant Details)' : 'Item / Plant Variety'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'mr' ? 'नग संख्या' : 'Qty'}</th>
                  <th className="py-2.5 px-3 text-right">{lang === 'mr' ? 'प्रति रोप दर' : 'Rate'}</th>
                  <th className="py-2.5 px-3.5 text-right">{lang === 'mr' ? 'एकूण रक्कम' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-3">
                      {/* Plant Image / Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center">
                        {plantImg ? (
                          <img 
                            src={plantImg} 
                            alt={order.plantName} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Sprout className="w-6 h-6 text-[#2E7D32]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">
                          {order.plantName}
                        </p>
                        {plantNameMr && (
                          <p className="text-xs text-emerald-800 font-semibold">
                            {plantNameMr}
                          </p>
                        )}
                        {botanicalName && (
                          <p className="text-[11px] text-slate-400 italic">
                            {botanicalName}
                          </p>
                        )}
                        {plantCategory && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#1E5631] border border-emerald-200/80">
                            {lang === 'mr' && plantCategoryMr ? plantCategoryMr : plantCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-black text-slate-800 text-sm">
                    {order.quantity} {lang === 'mr' ? 'रोपे' : 'plants'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700 font-semibold font-mono">
                    ₹{order.unitPrice || matchedPlant?.priceMin || Math.round((order.totalAmount || 0) / (order.quantity || 1))}
                  </td>
                  <td className="py-3 px-3.5 text-right font-black text-slate-900 text-sm font-mono">
                    ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-50/70 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="3" className="py-2.5 px-3.5 text-right text-slate-700 text-xs">
                    {lang === 'mr' ? 'एकूण रक्कम (Grand Total):' : 'Grand Total:'}
                  </td>
                  <td className="py-2.5 px-3.5 text-right text-[#1E5631] text-sm font-black font-mono">
                    ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Plant Quality Guarantee Strip */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
              <span className="text-slate-700 font-medium">
                {lang === 'mr' 
                  ? 'खात्रीशीर व निरोगी कलमे / रोपे (१००% अस्सल नर्सरी व्हरायटी)' 
                  : 'Certified Healthy Saplings • 100% Authentic Nursery Variety'}
              </span>
            </div>
            <span className="font-bold text-[#1E5631] text-[11px]">
              {order.nurseryName}
            </span>
          </div>

          {order.notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
              <span className="font-bold">{lang === 'mr' ? 'शेरा / सूचना:' : 'Notes:'}</span> {order.notes}
            </div>
          )}

          {/* Footer Close */}
          <div className="flex justify-end pt-2 print:hidden">
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
