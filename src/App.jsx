import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OverviewView from './components/dashboard/OverviewView';
import NurseryManagementView from './components/nurseries/NurseryManagementView';
import PlantCatalogView from './components/plants/PlantCatalogView';
import OrdersView from './components/orders/OrdersView';
import CustomersView from './components/customers/CustomersView';
import EnquiriesView from './components/enquiries/EnquiriesView';
import ReportsView from './components/reports/ReportsView';
import CityManagementView from './components/cities/CityManagementView';
import LoginPage from './components/auth/LoginPage';
import LandingPage from './components/landing/LandingPage';
import Toast from './components/common/Toast';
import AddPlantModal from './components/common/AddPlantModal';
import AddOrderModal from './components/common/AddOrderModal';
import AddNurseryModal from './components/common/AddNurseryModal';
import AddCustomerModal from './components/common/AddCustomerModal';
import { 
  INITIAL_NURSERIES, 
  INITIAL_PLANTS, 
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_INQUIRIES,
  INITIAL_CITIES 
} from './data/mockData';
import { Info, RotateCcw } from 'lucide-react';

function DashboardContent({ 
  onLogout, 
  onViewWebsite,
  nurseries,
  setNurseries,
  plants,
  setPlants,
  orders,
  setOrders,
  customers,
  setCustomers,
  inquiries,
  setInquiries,
  cities = [],
  onAddCity,
  onEditCity,
  onDeleteCity,
  onResetDemoData,
  showToast
}) {
  const { t, lang } = useLanguage();

  // Navigation & View State (Default to 'dashboard')
  const [activeView, setActiveView] = useState('dashboard');
  const [nurseryInitialTab, setNurseryInitialTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Action Modal States
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [addOrderModalOpen, setAddOrderModalOpen] = useState(false);
  const [addNurseryModalOpen, setAddNurseryModalOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

  // Status Badges Counts
  const pendingNurseriesCount = nurseries.filter(n => n.status === 'pending').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const newEnquiriesCount = inquiries.filter(i => (i.status || 'New') === 'New').length;

  // ----------------------------------------------------
  // Nursery CRUD Actions
  // ----------------------------------------------------
  const handleApproveNursery = (nurseryId) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    setNurseries(prev => prev.map(n => {
      if (n.id === nurseryId) {
        return {
          ...n,
          status: 'approved',
          rejectionReason: '',
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका मंजूर केली' : 'Nursery Approved',
      message: `${targetNursery?.name || 'Nursery'} has been approved and activated.`
    });
  };

  const handleRejectNursery = (nurseryId, reason) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    setNurseries(prev => prev.map(n => {
      if (n.id === nurseryId) {
        return {
          ...n,
          status: 'rejected',
          rejectionReason: reason,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));

    showToast({
      type: 'error',
      title: lang === 'mr' ? 'रोपवाटिका नाकारली' : 'Nursery Rejected',
      message: `${targetNursery?.name || 'Nursery'} application was marked as rejected.`
    });
  };

  const handleAddNursery = (newNurseryData) => {
    const newEntry = {
      ...newNurseryData,
      id: `nursery-${Date.now()}`,
      status: 'approved',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    setNurseries(prev => [newEntry, ...prev]);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका जोडली' : 'Nursery Registered',
      message: `${newEntry.name} registered and activated successfully.`
    });
  };

  const handleUpdateNursery = (nurseryId, updatedData) => {
    setNurseries(prev => prev.map(n => n.id === nurseryId ? { ...n, ...updatedData } : n));
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका अपडेट केली' : 'Nursery Updated',
      message: `${updatedData.name || 'Nursery'} details updated.`
    });
  };

  const handleDeleteNursery = (nurseryId) => {
    const target = nurseries.find(n => n.id === nurseryId);
    setNurseries(prev => prev.filter(n => n.id !== nurseryId));
    showToast({
      type: 'info',
      title: lang === 'mr' ? 'रोपवाटिका हटवली' : 'Nursery Deleted',
      message: `${target?.name || 'Nursery'} was removed.`
    });
  };

  // ----------------------------------------------------
  // Plant CRUD Actions
  // ----------------------------------------------------
  const handleAddPlant = (newPlantData) => {
    const newEntry = {
      ...newPlantData,
      id: `plt-${Date.now()}`
    };

    setPlants(prev => [newEntry, ...prev]);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'वनस्पती जोडली' : 'Plant Added',
      message: `${newEntry.nameEn || 'Plant'} cataloged successfully.`
    });
  };

  const handleUpdatePlant = (plantId, updatedData) => {
    setPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...updatedData } : p));

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'वनस्पती अपडेट केली' : 'Plant Updated',
      message: `${updatedData.nameEn || 'Plant'} details updated.`
    });
  };

  const handleDeletePlant = (plantId) => {
    const targetPlant = plants.find(p => p.id === plantId);
    setPlants(prev => prev.filter(p => p.id !== plantId));

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'वनस्पती हटवली' : 'Plant Deleted',
      message: `${targetPlant?.nameEn || 'Plant'} removed from catalog.`
    });
  };

  const handleToggleStock = (plantId) => {
    let nextStatus = 'in_stock';
    let plantName = '';

    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        nextStatus = p.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
        plantName = p.nameEn;
        return { ...p, stockStatus: nextStatus };
      }
      return p;
    }));

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'स्टॉक स्थिती बदलली' : 'Stock Status Changed',
      message: `${plantName}: ${nextStatus === 'in_stock' ? (lang === 'mr' ? 'उपलब्ध (In Stock)' : 'In Stock') : (lang === 'mr' ? 'संपले (Out of Stock)' : 'Out of Stock')}`
    });
  };

  // ----------------------------------------------------
  // Orders CRUD Actions
  // ----------------------------------------------------
  const handleAddOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);

    // Also auto-add customer if not existing
    if (newOrder.customerName && newOrder.customerPhone) {
      setCustomers(prev => {
        const cleanPhone = newOrder.customerPhone.replace(/\D/g, '');
        const exists = prev.some(c => c.phone?.replace(/\D/g, '') === cleanPhone);
        if (!exists) {
          const newCust = {
            id: `CUST-${Date.now().toString().slice(-4)}`,
            name: newOrder.customerName,
            phone: newOrder.customerPhone,
            city: newOrder.customerCity || 'Sangli',
            address: newOrder.deliveryAddress || '',
            totalOrders: 1,
            totalSpent: newOrder.totalAmount || 0,
            joinedDate: new Date().toISOString().split('T')[0],
            notes: 'Created via order placement'
          };
          return [newCust, ...prev];
        }
        return prev;
      });
    }

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ऑर्डर नोंदवली' : 'Order Created',
      message: `Order #${newOrder.id} for ${newOrder.customerName} recorded successfully.`
    });
  };

  const handleUpdateOrder = (orderId, updatedData) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedData } : o));
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ऑर्डर अपडेट केली' : 'Order Updated',
      message: `Order #${orderId} details updated.`
    });
  };

  const handleDeleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast({
      type: 'info',
      title: lang === 'mr' ? 'ऑर्डर हटवली' : 'Order Deleted',
      message: `Order #${orderId} removed.`
    });
  };

  const handleApproveOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ऑर्डर निश्चित केली' : 'Order Confirmed',
      message: `Order #${orderId} marked as Confirmed.`
    });
  };

  const handleRejectOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    showToast({
      type: 'info',
      title: lang === 'mr' ? 'ऑर्डर रद्द केली' : 'Order Cancelled',
      message: `Order #${orderId} marked as Cancelled.`
    });
  };

  // ----------------------------------------------------
  // Customers CRUD Actions
  // ----------------------------------------------------
  const handleAddCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ग्राहक नोंदवला' : 'Customer Registered',
      message: `${newCustomer.name} added to customer directory.`
    });
  };

  const handleEditCustomer = (customerId, updatedData) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updatedData } : c));
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ग्राहक अपडेट केला' : 'Customer Updated',
      message: `${updatedData.name} details saved.`
    });
  };

  const handleDeleteCustomer = (customerId) => {
    const target = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    showToast({
      type: 'info',
      title: lang === 'mr' ? 'ग्राहक हटवला' : 'Customer Removed',
      message: `${target?.name || 'Customer'} was removed.`
    });
  };

  // ----------------------------------------------------
  // Customer Inquiry Actions
  // ----------------------------------------------------
  const handleAddEnquiry = (newEnquiry) => {
    setInquiries(prev => [newEnquiry, ...prev]);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'चौकशी नोंदवली' : 'Enquiry Logged',
      message: `New inquiry from ${newEnquiry.customerName} recorded.`
    });
  };

  const handleEditEnquiry = (inquiryId, updatedData) => {
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, ...updatedData } : i));
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'चौकशी अपडेट केली' : 'Enquiry Updated',
      message: `Enquiry details updated.`
    });
  };

  const handleDeleteEnquiry = (inquiryId) => {
    setInquiries(prev => prev.filter(i => i.id !== inquiryId));
    showToast({
      type: 'info',
      title: lang === 'mr' ? 'चौकशी हटवली' : 'Enquiry Deleted',
      message: `Enquiry removed.`
    });
  };

  const handleUpdateInquiryStatus = (inquiryId, status) => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return { ...inq, status };
      }
      return inq;
    }));

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'चौकशी स्थिती बदलली' : 'Status Updated',
      message: `Enquiry status marked as ${status}.`
    });
  };

  // Navigation Helper
  const handleNavigate = (view, subTab = 'all') => {
    setActiveView(view);
    if (view === 'nurseries' && subTab) {
      setNurseryInitialTab(subTab);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans selection:bg-[#2E7D32]/20 selection:text-[#1E5631]">
      
      {/* 7-Menu Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingCount={pendingNurseriesCount}
        pendingOrdersCount={pendingOrdersCount}
        leadsCount={newEnquiriesCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        cities={cities}
        onViewWebsite={onViewWebsite}
      />

      {/* Main Admin Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header
          activeView={activeView}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          pendingCount={pendingNurseriesCount + pendingOrdersCount}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={onLogout}
          onViewWebsite={onViewWebsite}
        />

        {/* Demo Mode & Quick Reset Strip */}
        <div className="bg-emerald-950 text-emerald-100 px-4 py-1.5 text-[11px] font-medium border-b border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2 truncate">
              <Info className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">
                {lang === 'mr' 
                  ? 'डेमो मोड: पश्चिम महाराष्ट्र (सांगली, मिरज, कोल्हापूर, कराड) लाइव्ह नमुना डेटा.' 
                  : 'Demo Mode: Live local nursery data across Western Maharashtra (Sangli, Miraj, Kolhapur, Karad).'}
              </span>
            </div>

            {onResetDemoData && (
              <button
                onClick={onResetDemoData}
                className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold cursor-pointer transition-colors"
                title="Reset sample data"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'mr' ? 'रीसेट डेटा' : 'Reset Demo'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Page Views based on Active Tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* 1. Dashboard Overview */}
          {activeView === 'dashboard' && (
            <OverviewView
              nurseries={nurseries}
              plants={plants}
              orders={orders}
              customers={customers}
              inquiries={inquiries}
              cities={cities}
              onNavigate={handleNavigate}
              onOpenAddPlant={() => setAddPlantModalOpen(true)}
              onOpenAddOrder={() => setAddOrderModalOpen(true)}
              onOpenAddNursery={() => setAddNurseryModalOpen(true)}
              onOpenAddCustomer={() => setAddCustomerModalOpen(true)}
              onApproveNursery={handleApproveNursery}
              onRejectNursery={handleRejectNursery}
              onApproveOrder={handleApproveOrder}
              onRejectOrder={handleRejectOrder}
            />
          )}

          {/* 2. Nursery Management */}
          {activeView === 'nurseries' && (
            <NurseryManagementView
              nurseries={nurseries}
              cities={cities}
              initialTab={nurseryInitialTab}
              onApprove={handleApproveNursery}
              onReject={handleRejectNursery}
              onAddNursery={handleAddNursery}
              onUpdateNursery={handleUpdateNursery}
              onDeleteNursery={handleDeleteNursery}
              searchQuery={searchQuery}
            />
          )}

          {/* 3. Plant Catalog / Plant Management */}
          {activeView === 'plants' && (
            <PlantCatalogView
              plants={plants}
              nurseries={nurseries}
              onAddPlant={handleAddPlant}
              onUpdatePlant={handleUpdatePlant}
              onDeletePlant={handleDeletePlant}
              onToggleStock={handleToggleStock}
              onOpenAddModal={() => setAddPlantModalOpen(true)}
              isAddModalOpen={addPlantModalOpen}
              onCloseAddModal={() => setAddPlantModalOpen(false)}
              searchQuery={searchQuery}
            />
          )}

          {/* 4. Orders Management */}
          {activeView === 'orders' && (
            <OrdersView
              orders={orders}
              nurseries={nurseries}
              plants={plants}
              customers={customers}
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
              onApproveOrder={handleApproveOrder}
              onRejectOrder={handleRejectOrder}
              searchQuery={searchQuery}
            />
          )}

          {/* 5. Customers Management */}
          {activeView === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              cities={cities}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              searchQuery={searchQuery}
            />
          )}

          {/* 6. Enquiries */}
          {activeView === 'inquiries' && (
            <EnquiriesView
              inquiries={inquiries}
              nurseries={nurseries}
              plants={plants}
              cities={cities}
              onAddEnquiry={handleAddEnquiry}
              onUpdateEnquiry={handleEditEnquiry}
              onDeleteEnquiry={handleDeleteEnquiry}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
              searchQuery={searchQuery}
            />
          )}

          {/* 7. Reports */}
          {activeView === 'reports' && (
            <ReportsView
              orders={orders}
              nurseries={nurseries}
              plants={plants}
              customers={customers}
              inquiries={inquiries}
              cities={cities}
            />
          )}

          {/* Optional: City Hubs Management */}
          {activeView === 'cities' && (
            <CityManagementView
              cities={cities}
              nurseries={nurseries}
              onAddCity={onAddCity}
              onEditCity={onEditCity}
              onDeleteCity={onDeleteCity}
            />
          )}

        </main>

        {/* Global Quick Modals triggered from Dashboard */}
        {addPlantModalOpen && (
          <AddPlantModal
            isOpen={addPlantModalOpen}
            onClose={() => setAddPlantModalOpen(false)}
            onAddPlant={handleAddPlant}
            nurseries={nurseries}
          />
        )}

        {addOrderModalOpen && (
          <AddOrderModal
            isOpen={addOrderModalOpen}
            onClose={() => setAddOrderModalOpen(false)}
            onAddOrder={handleAddOrder}
            nurseries={nurseries}
            plants={plants}
            customers={customers}
          />
        )}

        {addNurseryModalOpen && (
          <AddNurseryModal
            isOpen={addNurseryModalOpen}
            onClose={() => setAddNurseryModalOpen(false)}
            onAddNursery={handleAddNursery}
            cities={cities}
          />
        )}

        {addCustomerModalOpen && (
          <AddCustomerModal
            isOpen={addCustomerModalOpen}
            onClose={() => setAddCustomerModalOpen(false)}
            onAddCustomer={handleAddCustomer}
            cities={cities}
          />
        )}

        {/* Minimal Clean Footer */}
        <footer className="border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-400 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              TreeBazzar Admin • Simple & Clean Nursery Marketplace
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {cities.map(c => lang === 'mr' && c.nameMr ? c.nameMr : c.nameEn).join(' • ')}
            </span>
          </div>
        </footer>

      </div>

    </div>
  );
}

function AppRoot() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tb_admin_auth') === 'true' || 
           sessionStorage.getItem('tb_admin_auth') === 'true';
  });

  // Current view navigation: 'landing' (default) | 'login' | 'admin'
  const [currentView, setCurrentView] = useState(() => {
    const isAuth = localStorage.getItem('tb_admin_auth') === 'true' || 
                   sessionStorage.getItem('tb_admin_auth') === 'true';
    return isAuth ? 'admin' : 'landing';
  });
  const [toast, setToast] = useState(null);
  const { lang, t } = useLanguage();

  // Shared Data State with LocalStorage Persistence
  const [nurseries, setNurseries] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_nurseries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NURSERIES;
  });

  const [plants, setPlants] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_plants');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLANTS;
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_customers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [inquiries, setInquiries] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_inquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INQUIRIES;
  });

  const [cities, setCities] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_cities');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CITIES;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('tb_nurseries', JSON.stringify(nurseries)); } catch (e) {}
  }, [nurseries]);

  useEffect(() => {
    try { localStorage.setItem('tb_plants', JSON.stringify(plants)); } catch (e) {}
  }, [plants]);

  useEffect(() => {
    try { localStorage.setItem('tb_orders', JSON.stringify(orders)); } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem('tb_customers', JSON.stringify(customers)); } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try { localStorage.setItem('tb_inquiries', JSON.stringify(inquiries)); } catch (e) {}
  }, [inquiries]);

  useEffect(() => {
    try { localStorage.setItem('tb_cities', JSON.stringify(cities)); } catch (e) {}
  }, [cities]);

  const showToast = ({ type = 'success', title, message }) => {
    setToast({ type, title, message });
  };

  const handleResetDemoData = () => {
    setNurseries(INITIAL_NURSERIES);
    setPlants(INITIAL_PLANTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setInquiries(INITIAL_INQUIRIES);
    setCities(INITIAL_CITIES);

    localStorage.removeItem('tb_nurseries');
    localStorage.removeItem('tb_plants');
    localStorage.removeItem('tb_orders');
    localStorage.removeItem('tb_customers');
    localStorage.removeItem('tb_inquiries');
    localStorage.removeItem('tb_cities');

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'डेटा रीसेट केला' : 'Demo Data Reset',
      message: lang === 'mr' ? 'सर्व नमुना डेटा पूर्ववत केला गेला.' : 'Original demo data restored.'
    });
  };

  const handleLogin = ({ email, rememberMe }) => {
    if (rememberMe) {
      localStorage.setItem('tb_admin_auth', 'true');
    } else {
      sessionStorage.setItem('tb_admin_auth', 'true');
    }
    setIsAuthenticated(true);
    setCurrentView('admin');
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'स्वागत आहे!' : 'Welcome Back!',
      message: `Signed in successfully as ${email}`
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('tb_admin_auth');
    sessionStorage.removeItem('tb_admin_auth');
    setIsAuthenticated(false);
    setCurrentView('landing');
    showToast({
      type: 'info',
      title: t('logoutSuccess') || 'Logged Out',
      message: lang === 'mr' ? 'तुम्ही सुरक्षितपणे बाहेर पडला आहात.' : 'You have been signed out safely.'
    });
  };

  // Nursery partner registration from public landing page
  const handlePartnerAddNursery = (newNurseryData) => {
    const newEntry = {
      ...newNurseryData,
      id: `nursery-${Date.now()}`,
      status: 'approved',
      verified: true,
      isNew: true,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setNurseries(prev => [newEntry, ...prev]);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका जोडली गेली!' : 'Nursery Successfully Added!',
      message: `${newEntry.name} is now live in the local nurseries directory.`
    });
  };

  const handleAddPlantFromLanding = (newPlantData) => {
    const newEntry = {
      ...newPlantData,
      id: `plt-${Date.now()}`,
      isNew: true
    };
    setPlants(prev => [newEntry, ...prev]);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'वनस्पती जोडली गेली!' : 'Plant Added to Catalog!',
      message: `${newEntry.nameEn} is now live in the catalog.`
    });
  };

  const handleContactLead = (leadData) => {
    const newInquiry = {
      id: `inq-${Date.now()}`,
      customerName: leadData.customerName || 'Website Visitor',
      customerPhone: leadData.customerPhone || '+91 9822145678',
      customerCity: leadData.customerCity || (cities[0]?.nameEn || 'Sangli'),
      inquiryType: leadData.type || 'WhatsApp',
      plantName: leadData.plantOrNursery || 'Plant Inquiry',
      plantOrNursery: leadData.plantOrNursery || 'Plant Inquiry',
      notes: leadData.notes || 'Inquiry initiated from TreeBazzar public website',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const handleAddCity = (cityData) => {
    const newCity = {
      ...cityData,
      id: `city-${Date.now()}`
    };
    setCities(prev => [...prev, newCity]);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'नवीन शहर जोडले!' : 'City Added!',
      message: `"${newCity.nameEn}" added to active hubs.`
    });
  };

  const handleEditCity = (cityId, updatedData) => {
    setCities(prev => prev.map(c => c.id === cityId ? { ...c, ...updatedData } : c));
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'शहर अपडेट केले' : 'City Updated',
      message: 'City details updated successfully.'
    });
  };

  const handleDeleteCity = (cityId) => {
    const target = cities.find(c => c.id === cityId);
    setCities(prev => prev.filter(c => c.id !== cityId));
    showToast({
      type: 'info',
      title: lang === 'mr' ? 'शहर हटवले' : 'City Removed',
      message: `"${target?.nameEn || 'City'}" removed from active hubs.`
    });
  };

  return (
    <>
      {/* 1. Public Customer Landing Page */}
      {currentView === 'landing' && (
        <LandingPage
          nurseries={nurseries}
          plants={plants}
          cities={cities}
          onOpenLogin={() => {
            if (isAuthenticated) {
              setCurrentView('admin');
            } else {
              setCurrentView('login');
            }
          }}
          onAddNursery={handlePartnerAddNursery}
          onAddPlant={handleAddPlantFromLanding}
          onContactLead={handleContactLead}
        />
      )}

      {/* 2. Admin Login Page */}
      {currentView === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onBackToLanding={() => setCurrentView('landing')}
        />
      )}

      {/* 3. Redesigned Admin Dashboard */}
      {currentView === 'admin' && (
        isAuthenticated ? (
          <DashboardContent
            onLogout={handleLogout}
            onViewWebsite={() => setCurrentView('landing')}
            nurseries={nurseries}
            setNurseries={setNurseries}
            plants={plants}
            setPlants={setPlants}
            orders={orders}
            setOrders={setOrders}
            customers={customers}
            setCustomers={setCustomers}
            inquiries={inquiries}
            setInquiries={setInquiries}
            cities={cities}
            onAddCity={handleAddCity}
            onEditCity={handleEditCity}
            onDeleteCity={handleDeleteCity}
            onResetDemoData={handleResetDemoData}
            showToast={showToast}
          />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )
      )}

      {/* Global Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppRoot />
    </LanguageProvider>
  );
}
