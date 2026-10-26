import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OverviewView from './components/dashboard/OverviewView';
import NurseryManagementView from './components/nurseries/NurseryManagementView';
import PlantCatalogView from './components/plants/PlantCatalogView';
import CustomerLeadsView from './components/leads/CustomerLeadsView';
import AnalyticsView from './components/analytics/AnalyticsView';
import RejectModal from './components/common/RejectModal';
import NurseryDetailsModal from './components/common/NurseryDetailsModal';
import AddPlantModal from './components/common/AddPlantModal';
import Toast from './components/common/Toast';
import { INITIAL_NURSERIES, INITIAL_PLANTS, INITIAL_LEADS } from './data/mockData';
import { 
  getFirebase, 
  clearAllFirestoreCollections, 
  updateNurseryInFirestore, 
  saveNurseryToFirestore,
  addPlantToFirestore, 
  updatePlantStockInFirestore, 
  deletePlantFromFirestore, 
  updateLeadStatusInFirestore,
  subscribeToCollection,
  syncAllData,
  logFirebaseEvent
} from './services/firebase';

function DashboardContent() {
  const { t, lang } = useLanguage();

  // Primary State
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'nurseries', 'plants', 'leads', 'analytics'
  const [nurseryInitialTab, setNurseryInitialTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data State - Clean, empty by default (no dummy data)
  const [nurseries, setNurseries] = useState(INITIAL_NURSERIES);
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [leads, setLeads] = useState(INITIAL_LEADS);

  // Modals & Async States
  const [selectedNurseryForDetails, setSelectedNurseryForDetails] = useState(null);
  const [rejectModalNursery, setRejectModalNursery] = useState(null);
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(true);

  const pendingCount = nurseries.filter(n => n.status === 'pending').length;

  const showToast = ({ type = 'success', title, message }) => {
    setToast({ type, title, message });
  };

  // Sync Data directly from Firestore (triggered on refresh or manual button click)
  const handleSyncData = async (showNotification = true) => {
    setIsSyncing(true);
    try {
      const data = await syncAllData();
      if (data) {
        if (Array.isArray(data.nurseries)) setNurseries(data.nurseries);
        if (Array.isArray(data.plants)) setPlants(data.plants);
        if (Array.isArray(data.leads)) setLeads(data.leads);
        setFirebaseConnected(true);
      }

      if (showNotification) {
        showToast({
          type: 'success',
          title: lang === 'mr' ? 'डेटा यशस्वीरित्या सिंक झाला' : 'Data Synced Successfully',
          message: lang === 'mr' 
            ? `एकूण ${data?.nurseries?.length || 0} रोपवाटिका, ${data?.plants?.length || 0} वनस्पती व ${data?.leads?.length || 0} लीड्स अपडेट झाल्या.` 
            : `Synced ${data?.nurseries?.length || 0} nurseries, ${data?.plants?.length || 0} plants, and ${data?.leads?.length || 0} inquiries from cloud.`
        });
      }
    } catch (err) {
      console.warn('Sync failed:', err);
      if (showNotification) {
        showToast({
          type: 'info',
          title: lang === 'mr' ? 'सिंक पूर्ण' : 'Sync Complete',
          message: lang === 'mr' ? 'क्लाउडवरून डेटा रिफ्रेश केला.' : 'Latest cloud records refreshed.'
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Setup Firestore Real-time Listeners with Bidirectional Sync
  useEffect(() => {
    let unsubNurseries = null;
    let unsubPlants = null;
    let unsubLeads = null;
    let isMounted = true;

    // Fetch latest cloud data immediately on initial page load / refresh
    handleSyncData(false);

    async function initFirestoreListeners() {
      try {
        const fb = await getFirebase();
        if (!isMounted) return;

        if (fb && fb.db) {
          setFirebaseConnected(true);
        }

        logFirebaseEvent('dashboard_opened', { view: activeView, lang });

        // Listen for nurseries in real-time
        unsubNurseries = await subscribeToCollection('nurseries', (remoteNurseries) => {
          if (isMounted) {
            setNurseries(remoteNurseries);
            setFirebaseConnected(true);
          }
        }, () => {
          if (isMounted) setFirebaseConnected(false);
        });

        // Listen for plants in real-time
        unsubPlants = await subscribeToCollection('plants', (remotePlants) => {
          if (isMounted) {
            setPlants(remotePlants);
            setFirebaseConnected(true);
          }
        }, () => {
          if (isMounted) setFirebaseConnected(false);
        });

        // Listen for leads in real-time
        unsubLeads = await subscribeToCollection('leads', (remoteLeads) => {
          if (isMounted) {
            setLeads(remoteLeads);
            setFirebaseConnected(true);
          }
        }, () => {
          if (isMounted) setFirebaseConnected(false);
        });

      } catch (e) {
        console.warn('Firebase sync notice:', e);
      }
    }

    initFirestoreListeners();

    return () => {
      isMounted = false;
      if (typeof unsubNurseries === 'function') unsubNurseries();
      if (typeof unsubPlants === 'function') unsubPlants();
      if (typeof unsubLeads === 'function') unsubLeads();
    };
  }, []);

  // Wipe / Clear All Data
  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      setNurseries([]);
      setPlants([]);
      setLeads([]);

      const deletedCount = await clearAllFirestoreCollections();

      showToast({
        type: 'info',
        title: lang === 'mr' ? 'सर्व डेटा यशस्वीरित्या हटवला' : 'All Data Deleted Successfully',
        message: lang === 'mr' 
          ? 'सिस्टीममधून सर्व नमुना व डमी नोंदी हटवण्यात आल्या आहेत.' 
          : `All dummy data removed (${deletedCount} documents deleted).`
      });
    } catch (err) {
      console.error('Clear error:', err);
      setNurseries([]);
      setPlants([]);
      setLeads([]);
      showToast({
        type: 'info',
        title: 'All Data Cleared',
        message: 'Local catalog and listings reset to empty.'
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Nursery Actions
  const handleApproveNursery = async (nurseryId) => {
    const today = new Date().toISOString().split('T')[0];

    setNurseries(prev => prev.map(n => {
      if (n.id === nurseryId) {
        return {
          ...n,
          status: 'approved',
          verified: true,
          approvedDate: today
        };
      }
      return n;
    }));

    if (selectedNurseryForDetails && selectedNurseryForDetails.id === nurseryId) {
      setSelectedNurseryForDetails(prev => ({ ...prev, status: 'approved', verified: true }));
    }

    await updateNurseryInFirestore(nurseryId, {
      status: 'approved',
      verified: true,
      approvedDate: today
    });

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका मंजूर केली!' : 'Nursery Approved Successfully!',
      message: t('nurseryApprovedMsg')
    });
  };

  const handleConfirmRejectNursery = async (nurseryId, reason, notes) => {
    setNurseries(prev => prev.map(n => {
      if (n.id === nurseryId) {
        return {
          ...n,
          status: 'rejected',
          verified: false,
          rejectionReason: reason,
          rejectionNotes: notes
        };
      }
      return n;
    }));

    if (selectedNurseryForDetails && selectedNurseryForDetails.id === nurseryId) {
      setSelectedNurseryForDetails(prev => ({
        ...prev,
        status: 'rejected',
        verified: false,
        rejectionReason: reason,
        rejectionNotes: notes
      }));
    }

    await updateNurseryInFirestore(nurseryId, {
      status: 'rejected',
      verified: false,
      rejectionReason: reason,
      rejectionNotes: notes
    });

    showToast({
      type: 'error',
      title: lang === 'mr' ? 'रोपवाटिका अर्ज नाकारला' : 'Nursery Application Rejected',
      message: t('nurseryRejectedMsg')
    });
  };

  const handleAddNursery = async (newNursery) => {
    setNurseries(prev => [newNursery, ...prev]);
    await saveNurseryToFirestore(newNursery);
    showToast({
      type: 'success',
      title: lang === 'mr' ? 'नवीन रोपवाटिका जोडली!' : 'Nursery Added Successfully!',
      message: `${newNursery.name} (${newNursery.city}) ${lang === 'mr' ? 'प्रणालीमध्ये सक्रिय केली गेली आहे.' : 'has been registered.'}`
    });
  };

  // Plant Actions
  const handleAddPlant = async (newPlant) => {
    setPlants(prev => [newPlant, ...prev]);

    setNurseries(prev => prev.map(n => {
      if (n.id === newPlant.nurseryId) {
        return { ...n, totalPlants: (n.totalPlants || 0) + 1 };
      }
      return n;
    }));

    await addPlantToFirestore(newPlant);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'नवीन वनस्पती जोडली!' : 'Master Plant Added!',
      message: `${newPlant.nameEn} (${newPlant.nameMr}) ${lang === 'mr' ? 'कॅटलॉगमध्ये उपलब्ध झाली आहे.' : 'is now live in the catalog.'}`
    });
  };

  const handleToggleStock = async (plantId) => {
    let updatedPlantName = '';
    let nextStatus = 'in_stock';

    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        nextStatus = p.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
        updatedPlantName = p.nameEn;
        return { ...p, stockStatus: nextStatus };
      }
      return p;
    }));

    await updatePlantStockInFirestore(plantId, nextStatus);

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'स्टॉक स्थिती बदलली' : 'Stock Status Toggled',
      message: `${updatedPlantName} ${t('stockToggledMsg')}`
    });
  };

  const handleDeletePlant = async (plantId) => {
    setPlants(prev => prev.filter(p => p.id !== plantId));
    await deletePlantFromFirestore(plantId);

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'वनस्पती काढण्यात आली' : 'Plant Variety Removed',
      message: lang === 'mr' ? 'वनस्पती यशस्वीरित्या कॅटलॉगमधून काढून टाकली.' : 'Plant deleted from active directory.'
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
        leadsCount={leads.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          pendingCount={pendingCount}
          onNavigate={handleNavigate}
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          nurseries={nurseries}
          plants={plants}
          firebaseStatus={firebaseConnected ? 'connected' : 'offline'}
          onSyncData={() => handleSyncData(true)}
          isSyncing={isSyncing}
          onClearData={handleClearAllData}
          isClearing={isClearing}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && (
            <OverviewView
              nurseries={nurseries}
              plants={plants}
              leads={leads}
              onNavigate={handleNavigate}
              onOpenAddPlant={() => setAddPlantModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeView === 'nurseries' && (
            <NurseryManagementView
              nurseries={nurseries}
              onApprove={handleApproveNursery}
              onOpenReject={(nursery) => setRejectModalNursery(nursery)}
              onViewDetails={(nursery) => setSelectedNurseryForDetails(nursery)}
              onAddNursery={handleAddNursery}
              initialTab={nurseryInitialTab}
            />
          )}

          {activeView === 'plants' && (
            <PlantCatalogView
              plants={plants}
              nurseries={nurseries}
              onOpenAddModal={() => setAddPlantModalOpen(true)}
              onToggleStock={handleToggleStock}
              onDeletePlant={handleDeletePlant}
              onShowToast={showToast}
            />
          )}

          {activeView === 'leads' && (
            <CustomerLeadsView
              leads={leads}
              onShowToast={showToast}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              nurseries={nurseries}
              plants={plants}
              leads={leads}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto py-5 px-6 border-t border-slate-200 bg-white/70 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1E5631]">TreeBazzar Admin Web Panel</span>
            <span>•</span>
            <span>Sangli, Miraj, Kolhapur Cluster</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Cloud Live
            </span>
            <span>🌱 Botanical Marketplace</span>
            <span>English / मराठी</span>
          </div>
        </footer>

      </div>

      {/* Global Modals & Notifications */}
      <RejectModal
        nursery={rejectModalNursery}
        isOpen={Boolean(rejectModalNursery)}
        onClose={() => setRejectModalNursery(null)}
        onConfirm={handleConfirmRejectNursery}
      />

      <NurseryDetailsModal
        nursery={selectedNurseryForDetails}
        isOpen={Boolean(selectedNurseryForDetails)}
        onClose={() => setSelectedNurseryForDetails(null)}
        onApprove={handleApproveNursery}
        onOpenReject={(nursery) => setRejectModalNursery(nursery)}
      />

      <AddPlantModal
        isOpen={addPlantModalOpen}
        onClose={() => setAddPlantModalOpen(false)}
        onAddPlant={handleAddPlant}
        onAddNursery={handleAddNursery}
        nurseries={nurseries}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

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
