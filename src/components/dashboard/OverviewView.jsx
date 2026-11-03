import React, { useMemo } from 'react';
import { 
  Store, Sprout, ShoppingBag, Users, MessageSquare, IndianRupee, 
  Plus, Check, X, ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, ExternalLink 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function OverviewView({ 
  nurseries = [], 
  plants = [], 
  orders = [], 
  customers = [], 
  inquiries = [], 
  cities = [],
  onNavigate, 
  onOpenAddPlant,
  onOpenAddOrder,
  onOpenAddNursery,
  onOpenAddCustomer,
  onApproveNursery,
  onRejectNursery,
  onApproveOrder,
  onRejectOrder
}) {
  const { t, lang } = useLanguage();

  // Metrics calculation
  const totalNurseries = nurseries.length;
  const pendingNurseries = useMemo(() => nurseries.filter(n => n.status === 'pending'), [nurseries]);
  const totalPlants = plants.length;
  const totalOrders = orders.length;
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const totalCustomers = customers.length;
  const totalInquiries = inquiries.length;

  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  // 6 Core Stat Cards
  const statCards = [
    {
      id: 'nurseries',
      title: lang === 'mr' ? 'एकूण रोपवाटिका' : 'Total Nurseries',
      value: totalNurseries,
      subtitle: lang === 'mr' ? 'नोंदणीकृत स्थानिक रोपवाटिका' : 'Registered partner nurseries',
      icon: Store,
      badge: pendingNurseries.length > 0 ? `${pendingNurseries.length} ${lang === 'mr' ? 'प्रलंबित' : 'Pending'}` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => onNavigate('nurseries')
    },
    {
      id: 'plants',
      title: lang === 'mr' ? 'वनस्पती प्रकार' : 'Plant Varieties',
      value: totalPlants,
      subtitle: lang === 'mr' ? 'कॅटलॉगमधील उपलब्ध रोपे' : 'Listed in catalog',
      icon: Sprout,
      badge: null,
      action: () => onNavigate('plants')
    },
    {
      id: 'orders',
      title: lang === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders',
      value: totalOrders,
      subtitle: lang === 'mr' ? 'ग्राहक व शेती खरेदी' : 'Customer & farm orders',
      icon: ShoppingBag,
      badge: pendingOrders.length > 0 ? `${pendingOrders.length} ${lang === 'mr' ? 'पडताळणी' : 'New'}` : null,
      badgeColor: 'bg-emerald-100 text-[#1E5631]',
      action: () => onNavigate('orders')
    },
    {
      id: 'customers',
      title: lang === 'mr' ? 'नोंदणीकृत ग्राहक' : 'Active Customers',
      value: totalCustomers,
      subtitle: lang === 'mr' ? 'शेतकरी व बागकाम खरेदीदार' : 'Plant buyers & farmers',
      icon: Users,
      badge: null,
      action: () => onNavigate('customers')
    },
    {
      id: 'inquiries',
      title: lang === 'mr' ? 'ग्राहक चौकशी' : 'Enquiries',
      value: totalInquiries,
      subtitle: lang === 'mr' ? 'व्हॉट्सॲप व थेट कॉल्स' : 'WhatsApp & phone leads',
      icon: MessageSquare,
      badge: null,
      action: () => onNavigate('inquiries')
    },
    {
      id: 'revenue',
      title: lang === 'mr' ? 'एकूण विक्री मूल्य' : 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtitle: lang === 'mr' ? 'यशस्वी ऑर्डर्सचे मूल्य' : 'All confirmed orders',
      icon: IndianRupee,
      badge: null,
      action: () => onNavigate('reports')
    }
  ];

  const hasUrgentAttention = pendingNurseries.length > 0 || pendingOrders.length > 0;

  return (
    <div className="space-y-6">
      
      {/* 6 Simple Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.action}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#2E7D32]/50 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E5631] group-hover:bg-[#1E5631] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>

              {card.badge && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}

              <p className="text-[11px] text-slate-400 mt-2 truncate font-medium">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Immediate Attention & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Immediate Attention Box (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {lang === 'mr' ? 'तातडीने लक्ष देण्याची गरज' : 'Immediate Attention Required'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {pendingNurseries.length + pendingOrders.length} {lang === 'mr' ? 'प्रलंबित बाबी' : 'items pending'}
            </span>
          </div>

          {hasUrgentAttention ? (
            <div className="space-y-3">
              {/* Pending Nurseries */}
              {pendingNurseries.map(nursery => (
                <div key={nursery.id} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-900">
                        {lang === 'mr' ? 'रोपवाटिका अर्ज' : 'Nursery Review'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{nursery.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {nursery.ownerName} • {nursery.city} • Phone: {nursery.phone}
                    </p>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => onApproveNursery && onApproveNursery(nursery.id)}
                      className="px-3 py-1.5 bg-[#1E5631] hover:bg-[#2E7D32] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'मंजूर करा' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => onRejectNursery && onRejectNursery(nursery.id, 'Incomplete details')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'नाकारा' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pending Orders */}
              {pendingOrders.map(order => (
                <div key={order.id} className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200 text-emerald-900">
                        {lang === 'mr' ? 'नवीन ऑर्डर' : 'New Order'} {order.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{order.customerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {order.plantName} ({order.quantity} plants) • Total: ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* 1-Click Order Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => onApproveOrder && onApproveOrder(order.id)}
                      className="px-3 py-1.5 bg-[#1E5631] hover:bg-[#2E7D32] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'ऑर्डर स्वीकारा' : 'Confirm'}</span>
                    </button>
                    <button
                      onClick={() => onRejectOrder && onRejectOrder(order.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'रद्द करा' : 'Cancel'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-[#2E7D32] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-700">
                {lang === 'mr' ? 'सर्व अर्ज व ऑर्डर्स अद्ययावत आहेत!' : 'All clear! No pending items needing review.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'mr' ? 'नवीन रोपवाटिका किंवा ऑर्डर्स आल्यावर इथे दिसतील.' : 'New nursery applications and customer orders will appear here for 1-click action.'}
              </p>
            </div>
          )}
        </div>

        {/* Quick Action Shortcuts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {lang === 'mr' ? 'जलद कृती' : 'Quick Actions'}
              </h3>
              <span className="text-[11px] text-slate-400">
                {lang === 'mr' ? 'शॉर्टकट्स' : 'Shortcuts'}
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={onOpenAddPlant}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] border border-emerald-200 text-xs font-bold transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-[#2E7D32]" />
                  <span>{lang === 'mr' ? 'नवीन वनस्पती जोडा' : 'Add New Plant'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                onClick={onOpenAddOrder}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-slate-600" />
                  <span>{lang === 'mr' ? 'नवीन ऑर्डर तयार करा' : 'Create Customer Order'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenAddNursery}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-slate-600" />
                  <span>{lang === 'mr' ? 'रोपवाटिका नोंदवा' : 'Register Nursery'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenAddCustomer}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-slate-600" />
                  <span>{lang === 'mr' ? 'ग्राहक जोडा' : 'Add New Customer'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Western Maharashtra Hub</span>
            <span className="font-semibold text-[#1E5631]">TreeBazzar Admin</span>
          </div>
        </div>

      </div>

      {/* Recent Activities Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {lang === 'mr' ? 'नुकतीच झालेली हालचाल' : 'Recent Platform Activity'}
          </h3>
          <span className="text-xs text-slate-400">
            {lang === 'mr' ? 'थेट नोंदी' : 'Live updates'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {orders.slice(0, 3).map((o, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1E5631] flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  Order {o.id}: {o.customerName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {o.plantName} ({o.quantity} plants) • ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {o.date} • {o.nurseryName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
