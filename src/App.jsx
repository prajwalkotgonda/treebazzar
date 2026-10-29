import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OverviewView from './components/dashboard/OverviewView';
import NurseryManagementView from './components/nurseries/NurseryManagementView';
import PlantCatalogView from './components/plants/PlantCatalogView';
import CustomerLeadsView from './components/leads/CustomerLeadsView';
import SettingsView from './components/settings/SettingsView';
import LogoutModal from './components/common/LogoutModal';
import Toast from './components/common/Toast';
import { 
  INITIAL_NURSERIES, 
  INITIAL_PLANTS, 
  INITIAL_INQUIRIES 
} from './data/mockData';
import { Info, LogIn } from 'lucide-react';

function DashboardContent() {
  const { t, lang } = useLanguage();

  // Navigation & View State
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'nurseries', 'plants', 'inquiries', 'settings'
  const [nurseryInitialTab, setNurseryInitialTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Data State (Initialized with realistic local sample data)
  const [nurseries, setNurseries] = useState(INITIAL_NURSERIES);
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);

  // Modals & UI States
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
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

  // ----------------------------------------------------
  // Demo Data Reset Action
  // ----------------------------------------------------
  const handleResetDemoData = () => {
    setNurseries(INITIAL_NURSERIES);
    setPlants(INITIAL_PLANTS);
    setInquiries(INITIAL_INQUIRIES);

    showToast({
      type: 'success',
      title: t('toastDemoReset'),
      message: t('demoDataResetMsg')
    });
  };

  // Navigation Helper
  const handleNavigate = (view, subTab = 'all') => {
    setActiveView(view);
    if (view === 'nurseries' && subTab) {
      setNurseryInitialTab(subTab);
    }
  };

  // If user simulated logout
  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1E5631] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            TreeBazzar Admin
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {t('loggedOutNotice')}
          </p>
          <button
            onClick={() => setIsLoggedOut(false)}
            className="w-full py-2.5 px-4 bg-[#1E5631] hover:bg-[#2E7D32] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {t('btnReLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans selection:bg-[#2E7D32]/20 selection:text-[#1E5631]">
      
      {/* Sidebar Navigation (Section 3 Requirement) */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingCount={pendingCount}
        leadsCount={inquiries.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />

      {/* Main App Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        
        {/* Top Header (Section 9 Requirement) */}
        <Header
          activeView={activeView}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          pendingCount={pendingCount}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Demo Data Disclaimer Banner (Section 10 Requirement) */}
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

          {/* 5. Settings */}
          {activeView === 'settings' && (
            <SettingsView
              onResetDemoData={handleResetDemoData}
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

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => setIsLoggedOut(true)}
      />

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

export default function App() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}
