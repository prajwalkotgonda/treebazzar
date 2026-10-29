import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OverviewView from './components/dashboard/OverviewView';
import NurseryManagementView from './components/nurseries/NurseryManagementView';
import PlantCatalogView from './components/plants/PlantCatalogView';
import CustomerLeadsView from './components/leads/CustomerLeadsView';
import LoginPage from './components/auth/LoginPage';
import Toast from './components/common/Toast';
import { 
  INITIAL_NURSERIES, 
  INITIAL_PLANTS, 
  INITIAL_INQUIRIES 
} from './data/mockData';
import { Info } from 'lucide-react';

function DashboardContent({ onLogout }) {
  const { t, lang } = useLanguage();

  // Navigation & View State
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'nurseries', 'plants', 'inquiries'
  const [nurseryInitialTab, setNurseryInitialTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Data State (Initialized with realistic local sample data)
  const [nurseries, setNurseries] = useState(INITIAL_NURSERIES);
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);

  // Modals & UI States
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const pendingCount = nurseries.filter(n => n.status === 'pending').length;

  const showToast = ({ type = 'success', title, message }) => {
    setToast({ type, title, message });
  };

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

      {/* Global Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}

function AppRoot() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tb_admin_auth') === 'true' || 
           sessionStorage.getItem('tb_admin_auth') === 'true';
  });
  const [authToast, setAuthToast] = useState(null);
  const { lang, t } = useLanguage();

  const handleLogin = ({ email, rememberMe }) => {
    if (rememberMe) {
      localStorage.setItem('tb_admin_auth', 'true');
    } else {
      sessionStorage.setItem('tb_admin_auth', 'true');
    }
    setIsAuthenticated(true);
    setAuthToast({
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
    setAuthToast({
      type: 'info',
      title: t('logoutSuccess'),
      message: lang === 'mr' 
        ? 'तुम्ही यशस्वीरित्या लॉगआउट झाला आहात.' 
        : 'You have been signed out safely.'
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        {authToast && (
          <Toast
            type={authToast.type}
            title={authToast.title}
            message={authToast.message}
            onClose={() => setAuthToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <DashboardContent onLogout={handleLogout} />
      {authToast && (
        <Toast
          type={authToast.type}
          title={authToast.title}
          message={authToast.message}
          onClose={() => setAuthToast(null)}
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
