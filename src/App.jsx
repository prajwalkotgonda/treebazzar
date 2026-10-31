import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OverviewView from './components/dashboard/OverviewView';
import NurseryManagementView from './components/nurseries/NurseryManagementView';
import PlantCatalogView from './components/plants/PlantCatalogView';
import CustomerLeadsView from './components/leads/CustomerLeadsView';
import LoginPage from './components/auth/LoginPage';
import LandingPage from './components/landing/LandingPage';
import Toast from './components/common/Toast';
import { 
  INITIAL_NURSERIES, 
  INITIAL_PLANTS, 
  INITIAL_INQUIRIES 
} from './data/mockData';
import { Info } from 'lucide-react';

function DashboardContent({ 
  onLogout, 
  onViewWebsite,
  nurseries,
  setNurseries,
  plants,
  setPlants,
  inquiries,
  setInquiries,
  showToast
}) {
  const { t, lang } = useLanguage();

  // Navigation & View State
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'nurseries', 'plants', 'inquiries'
  const [nurseryInitialTab, setNurseryInitialTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & UI States
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);

  const pendingCount = nurseries.filter(n => n.status === 'pending').length;

  // ----------------------------------------------------
  // Nursery Actions
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
      title: t('toastApproved'),
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
      title: t('toastRejected'),
      message: `${targetNursery?.name || 'Nursery'} application was marked as rejected.`
    });
  };

  const handleAddNursery = (newNurseryData) => {
    const newEntry = {
      ...newNurseryData,
      id: `nursery-${Date.now()}`,
      status: 'pending',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    setNurseries(prev => [newEntry, ...prev]);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका जोडली' : 'Nursery Registered',
      message: `${newEntry.name} added to verification queue.`
    });
  };

  // ----------------------------------------------------
  // Plant Catalog Actions
  // ----------------------------------------------------
  const handleAddPlant = (newPlantData) => {
    const newEntry = {
      ...newPlantData,
      id: `plt-${Date.now()}`
    };

    setPlants(prev => [newEntry, ...prev]);

    showToast({
      type: 'success',
      title: t('toastPlantAdded'),
      message: `${newEntry.nameEn} cataloged successfully.`
    });
  };

  const handleUpdatePlant = (plantId, updatedData) => {
    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        return {
          ...p,
          ...updatedData
        };
      }
      return p;
    }));

    showToast({
      type: 'success',
      title: t('toastPlantUpdated'),
      message: `${updatedData.nameEn || 'Plant'} details updated.`
    });
  };

  const handleDeletePlant = (plantId) => {
    const targetPlant = plants.find(p => p.id === plantId);
    setPlants(prev => prev.filter(p => p.id !== plantId));

    showToast({
      type: 'info',
      title: t('toastPlantDeleted'),
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
      title: t('toastStockToggled'),
      message: `${plantName}: ${nextStatus === 'in_stock' ? t('stockIn') : t('stockOut')}`
    });
  };

  // ----------------------------------------------------
  // Customer Inquiry Actions
  // ----------------------------------------------------
  const handleUpdateInquiryStatus = (inquiryId, status) => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return { ...inq, status };
      }
      return inq;
    }));

    showToast({
      type: 'success',
      title: t('toastInquiryStatusUpdated'),
      message: `Lead status updated to ${status}.`
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
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingCount={pendingCount}
        leadsCount={inquiries.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header
          activeView={activeView}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          pendingCount={pendingCount}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={onLogout}
          onViewWebsite={onViewWebsite}
        />

        {/* Demo Data Disclaimer Banner */}
        <div className="bg-emerald-900/90 text-emerald-100 px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-emerald-950/20">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Info className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate">
              {t('demoDataNotice')}
            </span>
          </div>
        </div>

        {/* Dynamic Page Views based on Active Tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* 1. Dashboard Overview */}
          {activeView === 'dashboard' && (
            <OverviewView
              nurseries={nurseries}
              plants={plants}
              inquiries={inquiries}
              onNavigate={handleNavigate}
              onOpenAddPlant={() => setAddPlantModalOpen(true)}
            />
          )}

          {/* 2. Nursery Management */}
          {activeView === 'nurseries' && (
            <NurseryManagementView
              nurseries={nurseries}
              initialTab={nurseryInitialTab}
              onApprove={handleApproveNursery}
              onReject={handleRejectNursery}
              onAddNursery={handleAddNursery}
              searchQuery={searchQuery}
            />
          )}

          {/* 3. Plant Catalog */}
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

          {/* 4. Customer Inquiries */}
          {activeView === 'inquiries' && (
            <CustomerLeadsView
              inquiries={inquiries}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
              searchQuery={searchQuery}
            />
          )}

        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-400 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              TreeBazzar © {new Date().getFullYear()} • Local Nursery Discovery Platform
            </span>
            <span className="text-[11px] text-slate-400">
              Sangli • Miraj • Kolhapur • Karad
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
  const [currentView, setCurrentView] = useState('landing');
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

  const [inquiries, setInquiries] = useState(() => {
    try {
      const saved = localStorage.getItem('tb_inquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INQUIRIES;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tb_nurseries', JSON.stringify(nurseries));
    } catch (e) {}
  }, [nurseries]);

  useEffect(() => {
    try {
      localStorage.setItem('tb_plants', JSON.stringify(plants));
    } catch (e) {}
  }, [plants]);

  useEffect(() => {
    try {
      localStorage.setItem('tb_inquiries', JSON.stringify(inquiries));
    } catch (e) {}
  }, [inquiries]);

  const showToast = ({ type = 'success', title, message }) => {
    setToast({ type, title, message });
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
      message: lang === 'mr' 
        ? 'ट्री बाजार ॲडमिन पॅनेलमध्ये आपले स्वागत आहे.' 
        : `Signed in successfully as ${email}`
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('tb_admin_auth');
    sessionStorage.removeItem('tb_admin_auth');
    setIsAuthenticated(false);
    setCurrentView('landing');
    showToast({
      type: 'info',
      title: t('logoutSuccess'),
      message: lang === 'mr' 
        ? 'तुम्ही यशस्वीरित्या लॉगआउट झाला आहात.' 
        : 'You have been signed out safely.'
    });
  };

  // Nursery partner registration from public landing page (immediately visible & approved)
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
      title: lang === 'mr' ? 'रोपवाटिका यशस्वीरित्या जोडली गेली!' : 'Nursery Successfully Added!',
      message: lang === 'mr'
        ? `${newEntry.name} आता थेट स्थानिक रोपवाटिकांच्या यादीमध्ये दिसत आहे.`
        : `${newEntry.name} is now live in the local nurseries directory.`
    });

    // Smooth scroll to nurseries section so owner immediately sees their nursery
    setTimeout(() => {
      const elem = document.getElementById('nurseries');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Direct plant addition from public landing page (immediately visible in catalog)
  const handleAddPlantFromLanding = (newPlantData) => {
    const newEntry = {
      ...newPlantData,
      id: `plt-${Date.now()}`,
      isNew: true
    };
    setPlants(prev => [newEntry, ...prev]);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'नवीन वनस्पती कॅटलॉगमध्ये जोडली गेली!' : 'Plant Added to Catalog!',
      message: lang === 'mr'
        ? `${newEntry.nameMr || newEntry.nameEn} वनस्पती कॅटलॉगमध्ये थेट समाविष्ट झाली आहे.`
        : `${newEntry.nameEn} is now live in the plant catalog.`
    });

    // Smooth scroll to plants section so owner immediately sees their plant
    setTimeout(() => {
      const elem = document.getElementById('plants');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Customer contact lead logging (WhatsApp / Call click)
  const handleContactLead = (leadData) => {
    const newInquiry = {
      id: `inq-${Date.now()}`,
      customerName: leadData.customerName || 'Website Visitor',
      customerPhone: leadData.customerPhone || '+91 9822145678',
      customerCity: leadData.customerCity || 'Sangli',
      inquiryType: leadData.type || 'whatsapp',
      plantOrNursery: leadData.plantOrNursery || 'Plant Inquiry',
      notes: leadData.notes || 'Inquiry initiated from TreeBazzar public website',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'new'
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  return (
    <>
      {/* 1. Public Customer Landing Page */}
      {currentView === 'landing' && (
        <LandingPage
          nurseries={nurseries}
          plants={plants}
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

      {/* 3. Admin Dashboard */}
      {currentView === 'admin' && (
        isAuthenticated ? (
          <DashboardContent
            onLogout={handleLogout}
            onViewWebsite={() => setCurrentView('landing')}
            nurseries={nurseries}
            setNurseries={setNurseries}
            plants={plants}
            setPlants={setPlants}
            inquiries={inquiries}
            setInquiries={setInquiries}
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
