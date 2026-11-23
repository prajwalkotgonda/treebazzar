import React, { useState, useMemo } from 'react';
import { 
  Store, Sprout, ShoppingBag, Users, MessageSquare, IndianRupee, 
  Plus, Check, X, ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, ExternalLink, Loader2, CalendarPlus, LayoutGrid, ChevronRight,
  Megaphone, Phone, Building2, Trash2, Power, MessageCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_TYPES } from '../../data/businessTypes';

export default function OverviewView({ 
  nurseries = [], 
  plants = [], 
  orders = [], 
  customers = [], 
  inquiries = [], 
  cities = [],
  ads = [],
  onNavigate, 
  onOpenAddPlant,
  onOpenAddOrder,
  onOpenAddNursery,
  onOpenAddCustomer,
  onOpenCreateAd,
  onToggleAdStatus,
  onDeleteAd,
  onApproveNursery,
  onRejectNursery,
  onExtendTrial,
  onApproveOrder,
  onRejectOrder
}) {
  const { t, lang } = useLanguage();
  const [processingId, setProcessingId] = useState(null);

  const handleActionWithFeedback = async (id, actionFn, ...args) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      if (actionFn) await actionFn(id, ...args);
    } finally {
      setProcessingId(null);
    }
  };

  // Metrics calculation
  const totalNurseries = nurseries.length;
  const pendingNurseries = useMemo(() => {
    return nurseries.filter(n => 
      !n.isSuspended && 
      n.status !== 'approved' && 
      n.status !== 'rejected' && 
      (n.isTrialExpired || n.status === 'pending' || n.status === 'revoked') &&
      !n.isTrialActive
    );
  }, [nurseries]);
  const activeTrialNurseries = useMemo(() => {
    return nurseries.filter(n => n.isTrialActive && !n.isSuspended && n.status !== 'rejected');
  }, [nurseries]);
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

  // Nursery counts per 7 business types
  const businessTypeCounts = useMemo(() => {
    const map = {};
    BUSINESS_TYPES.forEach(bt => {
      map[bt.id] = 0;
    });
    nurseries.forEach(n => {
      const type = n.businessType || 'nursery_plants_producer';
      if (map[type] !== undefined) {
        map[type]++;
      } else {
        map['nursery_plants_producer'] = (map['nursery_plants_producer'] || 0) + 1;
      }
    });
    return map;
  }, [nurseries]);

  // 6 Core Stat Cards
  const statCards = [
    {
      id: 'nurseries',
      title: lang === 'mr' ? 'एकूण रोपवाटिका' : 'Total Nurseries',
      value: totalNurseries,
      subtitle: lang === 'mr' ? 'नोंदणीकृत स्थानिक रोपवाटिका' : 'Registered partner nurseries',
      icon: Store,
      badge: pendingNurseries.length > 0 
        ? `${pendingNurseries.length} ${lang === 'mr' ? 'सबस्क्रिप्शन प्रलंबित' : 'Pending'}` 
        : (activeTrialNurseries.length > 0 ? `${activeTrialNurseries.length} ${lang === 'mr' ? 'ट्रायल सुरू' : 'In Trial'}` : null),
      badgeColor: pendingNurseries.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800',
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
      
      {/* Top Action Banner with Create Ad Button */}
      <div className="bg-gradient-to-r from-[#1E5631] via-[#246b3c] to-[#2E7D32] rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-emerald-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white ring-1 ring-white/20 shrink-0">
            <Megaphone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {lang === 'mr' ? 'शाखा जाहिरात व ऑफर्स' : 'Branch Ads & Promotions'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                {ads.filter(a => a.status === 'active').length} {lang === 'mr' ? 'सक्रिय जाहिराती' : 'Active Ads'}
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              {lang === 'mr' 
                ? 'शाखेचे नाव, मोबाईल क्र., फोटो व माहिती जोडून नवीन जाहिरात तयार करा' 
                : 'Create ad with branch name, mobile no, photo and description'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateAd}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#1E5631] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{lang === 'mr' ? '+ जाहिरात तयार करा (Create Ad)' : '+ Create New Ad'}</span>
        </button>
      </div>

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
                <div key={nursery.id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>
                          {nursery.isTrialExpired 
                            ? (lang === 'mr' ? '३ दिवस संपले' : 'Trial Expired') 
                            : (lang === 'mr' ? 'प्रलंबित' : 'Pending')}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-slate-900">{nursery.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                      <span className="font-medium text-slate-700">{nursery.ownerName || nursery.owner}</span>
                      <span className="text-slate-300">•</span>
                      <span>{nursery.city}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-slate-500">{nursery.phone}</span>
                    </p>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {/* +3 Days Free Extension */}
                    {onExtendTrial && (Number(nursery.trialExtensionsCount) || 0) < 2 && (
                      <button
                        onClick={() => handleActionWithFeedback(nursery.id, onExtendTrial)}
                        disabled={processingId === nursery.id}
                        title={lang === 'mr' ? '३ दिवस मोफत वाढवा (+३ दिवस)' : 'Extend +3 Days Free Trial'}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>{lang === 'mr' ? `+३ दिवस (${(nursery.trialExtensionsCount || 0)}/२)` : `+3 Days (${(nursery.trialExtensionsCount || 0)}/2)`}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleActionWithFeedback(nursery.id, onApproveNursery)}
                      disabled={processingId === nursery.id}
                      className="px-3 py-1.5 bg-[#1E5631] hover:bg-[#2E7D32] disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow transition-all cursor-pointer active:scale-95"
                    >
                      {processingId === nursery.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>
                        {processingId === nursery.id 
                          ? (lang === 'mr' ? 'मंजूर करत आहे...' : 'Approving...') 
                          : (lang === 'mr' ? 'मंजूर करा' : 'Approve')}
                      </span>
                    </button>
                    <button
                      onClick={() => handleActionWithFeedback(nursery.id, onRejectNursery, 'Incomplete details')}
                      disabled={processingId === nursery.id}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
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
                      onClick={() => handleActionWithFeedback(order.id, onApproveOrder)}
                      disabled={processingId === order.id}
                      className="px-3 py-1.5 bg-[#1E5631] hover:bg-[#2E7D32] disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {processingId === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {processingId === order.id 
                          ? (lang === 'mr' ? 'स्वीकारत आहे...' : 'Confirming...') 
                          : (lang === 'mr' ? 'ऑर्डर स्वीकारा' : 'Confirm')}
                      </span>
                    </button>
                    <button
                      onClick={() => handleActionWithFeedback(order.id, onRejectOrder)}
                      disabled={processingId === order.id}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
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

        {/* All 7 Business Types Filter Card (Replaces Quick Actions) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E5631] flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'mr' ? 'सर्व ७ व्यवसाय प्रकार' : 'All 7 Business Types'}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('nurseries', 'all', 'all')}
                className="text-[11px] font-bold text-[#1E5631] hover:text-[#2E7D32] flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>{lang === 'mr' ? 'थेट स्टॉक आणि दर' : 'Direct Stock & Rates'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 7 Business Types List */}
            <div className="space-y-2">
              {BUSINESS_TYPES.map(bt => {
                const IconComponent = bt.icon;
                const count = businessTypeCounts[bt.id] || 0;
                const title = lang === 'mr' ? bt.titleMr : bt.titleEn;
                const subtitle = lang === 'mr' ? bt.subtitleMr : bt.subtitleEn;

                return (
                  <button
                    key={bt.id}
                    onClick={() => onNavigate('nurseries', 'all', bt.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-white hover:bg-emerald-50/40 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs active:scale-98"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      {/* Number Badge & Icon Container */}
                      <div className="relative shrink-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bt.iconBg} shadow-2xs`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-black flex items-center justify-center ring-1 ring-white">
                          {bt.num}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E5631] transition-colors truncate">
                            {title}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-[260px]">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Count & Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 transition-colors">
                        {count}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-emerald-50 group-hover:bg-[#1E5631] text-[#1E5631] group-hover:text-white flex items-center justify-center transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{lang === 'mr' ? 'वर्गवारीनुसार फिल्टर करा' : 'Click to filter nurseries'}</span>
            <span className="font-semibold text-[#1E5631]">TreeBazzar Network</span>
          </div>
        </div>

      </div>

      {/* Branch Advertisements Showcase on Dashboard */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 mb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E5631] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {lang === 'mr' ? 'शाखा जाहिराती फलक (Branch Ads)' : 'Branch Advertisements Board'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'mr' 
                  ? 'शाखेचे नाव, मोबाईल क्र., फोटो आणि माहितीनुसार प्रसिद्ध केलेल्या जाहिराती' 
                  : 'Published ads with branch name, phone, photo & details'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('ads')}
              className="text-xs font-bold text-[#1E5631] hover:text-[#2E7D32] flex items-center gap-1 transition-colors cursor-pointer group"
            >
              <span>{lang === 'mr' ? 'सर्व जाहिराती पहा' : 'View All Ads'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              type="button"
              onClick={onOpenCreateAd}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'नवीन जाहिरात जोडा' : 'Add Ad'}</span>
            </button>
          </div>
        </div>

        {ads && ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.slice(0, 3).map((ad) => {
              const cleanPhone = (ad.mobile || '').replace(/\D/g, '');
              const isActive = ad.status === 'active';
              return (
                <div 
                  key={ad.id}
                  className="rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img 
                      src={ad.photo} 
                      alt={ad.title || ad.branchName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {ad.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500 text-white shadow-xs">
                        {ad.badge}
                      </span>
                    )}
                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {isActive ? (lang === 'mr' ? 'सक्रिय' : 'Active') : (lang === 'mr' ? 'बंद' : 'Paused')}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      {/* Branch Name */}
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#1E5631] uppercase tracking-wider mb-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ad.branchName}</span>
                      </div>

                      {/* Title */}
                      {ad.title && (
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 mb-1">
                          {ad.title}
                        </h4>
                      )}

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ad.description}
                      </p>
                    </div>

                    {/* Mobile & Quick Actions */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#1E5631]" />
                          <span>{lang === 'mr' ? 'मोबाईल:' : 'Mobile:'}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900">+91 {ad.mobile}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-[#1E5631]" />
                          <span>{lang === 'mr' ? 'कॉल' : 'Call'}</span>
                        </a>
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`नमस्कार, मी TreeBazzar वरील तुमची जाहिरात (${ad.branchName}) पाहिली.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E5631] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                        >
                          <MessageCircle className="w-3 h-3 text-[#2E7D32]" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => onToggleAdStatus && onToggleAdStatus(ad.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer ${
                          isActive 
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? (lang === 'mr' ? 'थांबवा' : 'Pause') : (lang === 'mr' ? 'सुरू करा' : 'Activate')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(lang === 'mr' ? 'ही जाहिरात हटवायची आहे का?' : 'Delete this ad?')) {
                            onDeleteAd && onDeleteAd(ad.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title={lang === 'mr' ? 'हटवा' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Megaphone className="w-7 h-7 text-[#1E5631] mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-slate-700">
              {lang === 'mr' ? 'अद्याप कोणतीही जाहिरात तयार केलेली नाही' : 'No advertisements created yet'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
              {lang === 'mr' 
                ? 'शाखेचे नाव, मोबाईल क्र., फोटो व माहिती भरून नवीन जाहिरात तयार करा.' 
                : 'Create your first ad with branch name, mobile no, photo and description.'}
            </p>
            <button
              type="button"
              onClick={onOpenCreateAd}
              className="px-4 py-2 bg-[#1E5631] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? '+ जाहिरात तयार करा' : '+ Create Ad'}</span>
            </button>
          </div>
        )}
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
