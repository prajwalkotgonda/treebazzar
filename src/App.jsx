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
import { 
  syncAllData,
  subscribeToCollection,
  saveNurseryToFirestore,
  updateNurseryInFirestore,
  deleteNurseryFromFirestore,
  addPlantToFirestore,
  updatePlantStockInFirestore,
  deletePlantFromFirestore,
  addLeadToFirestore,
  updateLeadStatusInFirestore,
  deleteLeadFromFirestore,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  saveCustomerToFirestore,
  deleteCustomerFromFirestore,
  saveCityToFirestore,
  deleteCityFromFirestore,
  clearAllFirestoreCollections
} from './services/firebase';

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
  // Nursery CRUD Actions (Synchronized with Firestore & Mobile App)
  // ----------------------------------------------------
  const handleApproveNursery = async (nurseryId) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    const nurseryName = targetNursery?.name || targetNursery?.nurseryName || (lang === 'mr' ? 'रोपवाटिका' : 'Nursery');

    const updatedNursery = {
      ...(targetNursery || {}),
      id: nurseryId,
      status: 'approved',
      verified: true,
      isVerified: true,
      isActive: true,
      isSuspended: false,
      rejectionReason: '',
      rejectionNotes: '',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Optimistic UI update in Admin
    setNurseries(prev => prev.map(n => n.id === nurseryId ? updatedNursery : n));

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'मंजूर करत आहे...' : 'Processing Approval...',
      message: lang === 'mr' ? `${nurseryName} ॲप आणि डेटाबेसमध्ये सिंक करत आहे.` : `Syncing ${nurseryName} with mobile app...`
    });

    try {
      // 2. Commit update to Firestore for real-time mobile app reflection
      await updateNurseryInFirestore(nurseryId, {
        status: 'approved',
        verified: true,
        isVerified: true,
        isActive: true,
        isSuspended: false,
        rejectionReason: '',
        rejectionNotes: '',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 3. Confirm success
      showToast({
        type: 'success',
        title: lang === 'mr' ? 'रोपवाटिका मंजूर झाली (App Synced)!' : 'Nursery Approved & Live in App!',
        message: lang === 'mr' 
          ? `"${nurseryName}" यशस्वीरित्या मंजूर झाली असून ॲपमध्ये ग्राहकांना लगेच दिसेल.` 
          : `"${nurseryName}" is now verified and live in the customer mobile app.`
      });
    } catch (err) {
      console.error('Nursery approval sync error:', err);
    }
  };

  const handleRejectNursery = async (nurseryId, reason) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    const nurseryName = targetNursery?.name || targetNursery?.nurseryName || (lang === 'mr' ? 'रोपवाटिका' : 'Nursery');
    const cleanReason = reason || (lang === 'mr' ? 'माहिती पडताळणी अयशस्वी' : 'Information verification failed');

    const updatedNursery = {
      ...(targetNursery || {}),
      id: nurseryId,
      status: 'rejected',
      verified: false,
      isVerified: false,
      isActive: false,
      isSuspended: true,
      rejectionReason: cleanReason,
      rejectionNotes: cleanReason,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNurseries(prev => prev.map(n => n.id === nurseryId ? updatedNursery : n));

    try {
      await updateNurseryInFirestore(nurseryId, {
        status: 'rejected',
        verified: false,
        isVerified: false,
        isActive: false,
        isSuspended: true,
        rejectionReason: cleanReason,
        rejectionNotes: cleanReason,
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: lang === 'mr' ? 'रोपवाटिका नाकारली (App Synced)' : 'Nursery Rejected & Synced',
        message: lang === 'mr' 
          ? `"${nurseryName}" चा अर्ज नाकारला असून ॲपमध्ये कारण दाखवले जाईल.` 
          : `"${nurseryName}" rejected. Reason synced to mobile app.`
      });
    } catch (err) {
      console.error('Nursery rejection sync error:', err);
    }
  };

  const handleRevokeNursery = async (nurseryId, reason) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    const nurseryName = targetNursery?.name || targetNursery?.nurseryName || (lang === 'mr' ? 'रोपवाटिका' : 'Nursery');
    const cleanReason = reason || (lang === 'mr' ? 'प्रशासकीय पुनर्पडताळणी आवश्यक' : 'Administrative re-verification required');

    const updatedNursery = {
      ...(targetNursery || {}),
      id: nurseryId,
      status: 'pending',
      verified: false,
      isVerified: false,
      isActive: false,
      isSuspended: false,
      revocationReason: cleanReason,
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNurseries(prev => prev.map(n => n.id === nurseryId ? updatedNursery : n));

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'मंजुरी रद्द करत आहे...' : 'Revoking Approval...',
      message: lang === 'mr' ? `"${nurseryName}" ची स्थिती प्रलंबित केली जात आहे.` : `Reverting "${nurseryName}" to pending review...`
    });

    try {
      await updateNurseryInFirestore(nurseryId, {
        status: 'pending',
        verified: false,
        isVerified: false,
        isActive: false,
        isSuspended: false,
        revocationReason: cleanReason,
        revokedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      showToast({
        type: 'success',
        title: lang === 'mr' ? 'मंजुरी रद्द केली (App Synced)' : 'Approval Revoked & Synced',
        message: lang === 'mr' 
          ? `"${nurseryName}" ची मंजुरी रद्द झाली असून अर्ज पुन्हा प्रलंबित पुनरावलोकनात हलवला आहे.` 
          : `"${nurseryName}" approval revoked. Removed from mobile app and moved to pending.`
      });
    } catch (err) {
      console.error('Nursery revoke sync error:', err);
      showToast({
        type: 'error',
        title: lang === 'mr' ? 'त्रुटी आढळली' : 'Error',
        message: lang === 'mr' ? 'डेटाबेसमध्ये बदल सेव्ह करताना अडचण आली.' : 'Failed to update nursery status in database.'
      });
    }
  };

  const handleSuspendNursery = async (nurseryId, reason) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    const nurseryName = targetNursery?.name || targetNursery?.nurseryName || (lang === 'mr' ? 'रोपवाटिका' : 'Nursery');
    const cleanReason = reason || (lang === 'mr' ? 'नियम आणि अटींचे उल्लंघन' : 'Policy violation or administrative suspension');

    const updatedNursery = {
      ...(targetNursery || {}),
      id: nurseryId,
      status: 'suspended',
      verified: false,
      isVerified: false,
      isActive: false,
      isSuspended: true,
      suspensionReason: cleanReason,
      suspendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNurseries(prev => prev.map(n => n.id === nurseryId ? updatedNursery : n));

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'खाते निलंबित करत आहे...' : 'Suspending Account...',
      message: lang === 'mr' ? `"${nurseryName}" चे खाते डेटाबेसमध्ये निलंबित केले जात आहे.` : `Suspending "${nurseryName}" in database...`
    });

    try {
      await updateNurseryInFirestore(nurseryId, {
        status: 'suspended',
        verified: false,
        isVerified: false,
        isActive: false,
        isSuspended: true,
        suspensionReason: cleanReason,
        suspendedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: lang === 'mr' ? 'खाते निलंबित केले (App Synced)' : 'Nursery Suspended & Deactivated',
        message: lang === 'mr' 
          ? `"${nurseryName}" चे खाते यशस्वीरीत्या निलंबित केले असून ॲपमधील झाडे लपवली आहेत.` 
          : `"${nurseryName}" is now suspended. Listings hidden from customer mobile app.`
      });
    } catch (err) {
      console.error('Nursery suspend sync error:', err);
      showToast({
        type: 'error',
        title: lang === 'mr' ? 'त्रुटी आढळली' : 'Error',
        message: lang === 'mr' ? 'डेटाबेसमध्ये बदल सेव्ह करताना अडचण आली.' : 'Failed to update nursery status in database.'
      });
    }
  };

  const handleUnsuspendNursery = async (nurseryId) => {
    const targetNursery = nurseries.find(n => n.id === nurseryId);
    const nurseryName = targetNursery?.name || targetNursery?.nurseryName || (lang === 'mr' ? 'रोपवाटिका' : 'Nursery');

    const updatedNursery = {
      ...(targetNursery || {}),
      id: nurseryId,
      status: 'approved',
      verified: true,
      isVerified: true,
      isActive: true,
      isSuspended: false,
      suspensionReason: '',
      unsuspendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNurseries(prev => prev.map(n => n.id === nurseryId ? updatedNursery : n));

    try {
      await updateNurseryInFirestore(nurseryId, {
        status: 'approved',
        verified: true,
        isVerified: true,
        isActive: true,
        isSuspended: false,
        suspensionReason: '',
        unsuspendedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      showToast({
        type: 'success',
        title: lang === 'mr' ? 'निलंबन मागे घेतले (खाते सक्रिय)!' : 'Nursery Reactivated & Live!',
        message: lang === 'mr' 
          ? `"${nurseryName}" चे निलंबन मागे घेतले असून रोपवाटिका पुन्हा ॲपमध्ये सक्रिय झाली आहे.` 
          : `"${nurseryName}" has been reactivated and is now live in the mobile app.`
      });
    } catch (err) {
      console.error('Nursery unsuspend sync error:', err);
      showToast({
        type: 'error',
        title: lang === 'mr' ? 'त्रुटी आढळली' : 'Error',
        message: lang === 'mr' ? 'डेटाबेसमध्ये बदल सेव्ह करताना अडचण आली.' : 'Failed to reactivate nursery in database.'
      });
    }
  };

  const handleAddNursery = (newNurseryData) => {
    const newEntry = {
      ...newNurseryData,
      id: `nursery-${Date.now()}`,
      status: 'approved',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    setNurseries(prev => [newEntry, ...prev]);
    saveNurseryToFirestore(newEntry).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका जोडली' : 'Nursery Registered',
      message: `${newEntry.name} registered and activated successfully.`
    });
  };

  const handleUpdateNursery = (nurseryId, updatedData) => {
    setNurseries(prev => prev.map(n => n.id === nurseryId ? { ...n, ...updatedData } : n));
    const target = nurseries.find(n => n.id === nurseryId);
    saveNurseryToFirestore({ ...(target || {}), ...updatedData, id: nurseryId }).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'रोपवाटिका अपडेट केली' : 'Nursery Updated',
      message: `${updatedData.name || 'Nursery'} details updated.`
    });
  };

  const handleDeleteNursery = async (nurseryId) => {
    const target = nurseries.find(n => n.id === nurseryId);
    const nurseryName = target?.name || target?.nurseryName || (lang === 'mr' ? 'रोपवाटिका' : 'Nursery');

    // 1. Optimistic removal from React state
    setNurseries(prev => prev.filter(n => n.id !== nurseryId));
    setPlants(prev => prev.filter(p => p.nurseryId !== nurseryId && p.nurseryName !== nurseryName));

    // 2. Synchronous update to localStorage so page refresh immediately reflects deletion
    try {
      const savedNurseries = localStorage.getItem('tb_nurseries');
      if (savedNurseries) {
        const list = JSON.parse(savedNurseries);
        localStorage.setItem('tb_nurseries', JSON.stringify(list.filter(n => n.id !== nurseryId)));
      }
      const savedPlants = localStorage.getItem('tb_plants');
      if (savedPlants) {
        const list = JSON.parse(savedPlants);
        localStorage.setItem('tb_plants', JSON.stringify(list.filter(p => p.nurseryId !== nurseryId && p.nurseryName !== nurseryName)));
      }
    } catch (e) {}

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'हटवत आहे...' : 'Deleting...',
      message: lang === 'mr' ? `"${nurseryName}" डेटाबेस आणि ॲपमधून हटवत आहे...` : `Removing "${nurseryName}" from database and mobile app...`
    });

    try {
      // 3. Delete nursery document from Firestore (Modular SDK + direct REST fallback)
      await deleteNurseryFromFirestore(nurseryId);

      // 4. Cascade delete: delete all plants belonging to this nursery from Firestore
      const linkedPlants = plants.filter(p => p.nurseryId === nurseryId || p.nurseryName === nurseryName);
      for (const plant of linkedPlants) {
        await deletePlantFromFirestore(plant.id).catch(console.warn);
      }

      showToast({
        type: 'success',
        title: lang === 'mr' ? 'रोपवाटिका पूर्णपणे हटवली (App & Database)!' : 'Nursery Deleted from App & Database!',
        message: lang === 'mr' 
          ? `"${nurseryName}" डेटाबेस आणि मोबाईल ॲपमधून कायमस्वरूपी हटवली गेली आहे.` 
          : `"${nurseryName}" and its plant listings have been deleted from database and mobile app.`
      });
    } catch (err) {
      console.error('Failed to delete nursery from Firestore:', err);
      showToast({
        type: 'error',
        title: lang === 'mr' ? 'त्रुटी आढळली' : 'Error',
        message: lang === 'mr' ? 'डेटाबेसमधून रोपवाटिका हटवताना त्रुटी आली.' : 'Failed to delete nursery from database.'
      });
    }
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
    addPlantToFirestore(newEntry).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'वनस्पती जोडली' : 'Plant Added',
      message: `${newEntry.nameEn || 'Plant'} cataloged successfully.`
    });
  };

  const handleUpdatePlant = (plantId, updatedData) => {
    setPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...updatedData } : p));
    const target = plants.find(p => p.id === plantId);
    addPlantToFirestore({ ...(target || {}), ...updatedData, id: plantId }).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'वनस्पती अपडेट केली' : 'Plant Updated',
      message: `${updatedData.nameEn || 'Plant'} details updated.`
    });
  };

  const handleDeletePlant = (plantId) => {
    const targetPlant = plants.find(p => p.id === plantId);
    setPlants(prev => prev.filter(p => p.id !== plantId));
    deletePlantFromFirestore(plantId).catch(console.warn);

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

    updatePlantStockInFirestore(plantId, nextStatus).catch(console.warn);

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
    saveOrderToFirestore(newOrder).catch(console.warn);

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
          saveCustomerToFirestore(newCust).catch(console.warn);
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

  const handleUpdateOrder = async (orderId, updatedData) => {
    const target = orders.find(o => o.id === orderId);
    const merged = {
      ...(target || {}),
      ...updatedData,
      id: orderId,
      orderStatus: updatedData.status || target?.status || 'pending',
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => prev.map(o => o.id === orderId ? merged : o));

    try {
      await saveOrderToFirestore(merged);
      showToast({
        type: 'success',
        title: lang === 'mr' ? 'ऑर्डर अपडेट झाली (App Synced)' : 'Order Updated & Synced',
        message: lang === 'mr' ? `ऑर्डर #${orderId} चे स्टेटस ॲपमध्ये अपडेट झाले.` : `Order #${orderId} synced to mobile app.`
      });
    } catch (err) {
      console.error('Order update sync error:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await deleteOrderFromFirestore(orderId);
      showToast({
        type: 'info',
        title: lang === 'mr' ? 'ऑर्डर हटवली' : 'Order Deleted',
        message: `Order #${orderId} removed from database.`
      });
    } catch (err) {
      console.error('Order delete error:', err);
    }
  };

  const handleApproveOrder = async (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const updatedOrder = {
      ...(targetOrder || {}),
      id: orderId,
      status: 'confirmed',
      orderStatus: 'confirmed',
      isConfirmed: true,
      isApproved: true,
      confirmedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    showToast({
      type: 'info',
      title: lang === 'mr' ? 'ऑर्डर स्वीकारत आहे...' : 'Processing Order Approval...',
      message: lang === 'mr' ? `ऑर्डर #${orderId} ग्राहकाच्या ॲपमध्ये सिंक करत आहे.` : `Syncing order #${orderId} with mobile app...`
    });

    try {
      await saveOrderToFirestore(updatedOrder);

      showToast({
        type: 'success',
        title: lang === 'mr' ? 'ऑर्डर निश्चित झाली (App Synced)!' : 'Order Confirmed & Live in App!',
        message: lang === 'mr' 
          ? `ऑर्डर #${orderId} मंजूर झाली असून ग्राहकाच्या मोबाईल ॲपमध्ये 'Confirmed' दिसेल.` 
          : `Order #${orderId} approved and visible as Confirmed in customer app.`
      });
    } catch (err) {
      console.error('Order approve error:', err);
    }
  };

  const handleRejectOrder = async (orderId, reason) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const updatedOrder = {
      ...(targetOrder || {}),
      id: orderId,
      status: 'cancelled',
      orderStatus: 'cancelled',
      isCancelled: true,
      cancelledAt: new Date().toISOString(),
      rejectionReason: reason || (lang === 'mr' ? 'ऑर्डर रद्द केली' : 'Order cancelled by admin'),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    try {
      await saveOrderToFirestore(updatedOrder);

      showToast({
        type: 'info',
        title: lang === 'mr' ? 'ऑर्डर रद्द केली (App Synced)' : 'Order Cancelled & Synced',
        message: lang === 'mr' 
          ? `ऑर्डर #${orderId} रद्द केली असून ॲपमध्ये Cancelled दिसेल.` 
          : `Order #${orderId} marked Cancelled in customer app.`
      });
    } catch (err) {
      console.error('Order cancel error:', err);
    }
  };

  // ----------------------------------------------------
  // Customers CRUD Actions
  // ----------------------------------------------------
  const handleAddCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    saveCustomerToFirestore(newCustomer).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ग्राहक नोंदवला' : 'Customer Registered',
      message: `${newCustomer.name} added to customer directory.`
    });
  };

  const handleEditCustomer = (customerId, updatedData) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updatedData } : c));
    const target = customers.find(c => c.id === customerId);
    saveCustomerToFirestore({ ...(target || {}), ...updatedData, id: customerId }).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'ग्राहक अपडेट केला' : 'Customer Updated',
      message: `${updatedData.name} details saved.`
    });
  };

  const handleDeleteCustomer = (customerId) => {
    const target = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    deleteCustomerFromFirestore(customerId).catch(console.warn);

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
    addLeadToFirestore(newEnquiry).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'चौकशी नोंदवली' : 'Enquiry Logged',
      message: `New inquiry from ${newEnquiry.customerName} recorded.`
    });
  };

  const handleEditEnquiry = (inquiryId, updatedData) => {
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, ...updatedData } : i));
    const target = inquiries.find(i => i.id === inquiryId);
    addLeadToFirestore({ ...(target || {}), ...updatedData, id: inquiryId }).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'चौकशी अपडेट केली' : 'Enquiry Updated',
      message: `Enquiry details updated.`
    });
  };

  const handleDeleteEnquiry = (inquiryId) => {
    setInquiries(prev => prev.filter(i => i.id !== inquiryId));
    deleteLeadFromFirestore(inquiryId).catch(console.warn);

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
    updateLeadStatusInFirestore(inquiryId, status).catch(console.warn);

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
              onRevoke={handleRevokeNursery}
              onSuspend={handleSuspendNursery}
              onUnsuspend={handleUnsuspendNursery}
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
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || hash === '#login' || search.includes('admin') || path.endsWith('/admin') || path.endsWith('/login')) {
        return isAuth ? 'admin' : 'login';
      }
    }
    return isAuth ? 'admin' : 'landing';
  });
  const [toast, setToast] = useState(null);
  const { lang, t } = useLanguage();

  // URL hash/query routing and secret shortcut (Ctrl+Shift+A) for admin access
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || hash === '#login' || search.includes('admin') || path.endsWith('/admin') || path.endsWith('/login')) {
        setCurrentView(isAuthenticated ? 'admin' : 'login');
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentView(prev => prev === 'landing' ? (isAuthenticated ? 'admin' : 'login') : 'landing');
      }
    };

    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated]);

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

  // Live Firebase Synchronisation with mobile app & Firestore
  useEffect(() => {
    let isSubscribed = true;

    // 1. Initial sync from Firestore for nurseries, plants, leads, and orders
    syncAllData().then(({ nurseries: fbNurseries, plants: fbPlants, leads: fbLeads, orders: fbOrders }) => {
      if (!isSubscribed) return;
      if (fbNurseries && fbNurseries.length > 0) {
        setNurseries(fbNurseries);
      }
      if (fbPlants && fbPlants.length > 0) {
        setPlants(fbPlants);
      }
      if (fbLeads && fbLeads.length > 0) {
        setInquiries(fbLeads);
      }
      if (fbOrders && fbOrders.length > 0) {
        setOrders(fbOrders);
      }
    }).catch(err => console.warn('Initial Firestore sync error:', err));

    // 2. Real-time subscriptions for nurseries, plants, leads, and orders
    let unsubNurseries = () => {};
    let unsubPlants = () => {};
    let unsubLeads = () => {};
    let unsubOrders = () => {};

    subscribeToCollection('nurseries', (data) => {
      if (isSubscribed && data && data.length > 0) {
        setNurseries(data);
      }
    }).then(unsub => { if (unsub) unsubNurseries = unsub; }).catch(console.warn);

    subscribeToCollection('plants', (data) => {
      if (isSubscribed && data && data.length > 0) {
        setPlants(data);
      }
    }).then(unsub => { if (unsub) unsubPlants = unsub; }).catch(console.warn);

    subscribeToCollection('leads', (data) => {
      if (isSubscribed && data && data.length > 0) {
        setInquiries(data);
      }
    }).then(unsub => { if (unsub) unsubLeads = unsub; }).catch(console.warn);

    subscribeToCollection('orders', (data) => {
      if (isSubscribed && data && data.length > 0) {
        setOrders(data);
      }
    }).then(unsub => { if (unsub) unsubOrders = unsub; }).catch(console.warn);

    return () => {
      isSubscribed = false;
      try { unsubNurseries(); } catch (e) {}
      try { unsubPlants(); } catch (e) {}
      try { unsubLeads(); } catch (e) {}
      try { unsubOrders(); } catch (e) {}
    };
  }, []);

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
    saveNurseryToFirestore(newEntry).catch(console.warn);

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
    addPlantToFirestore(newEntry).catch(console.warn);

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
    addLeadToFirestore(newInquiry).catch(console.warn);
  };

  const handleAddCity = (cityData) => {
    const newCity = {
      ...cityData,
      id: `city-${Date.now()}`
    };
    setCities(prev => [...prev, newCity]);
    saveCityToFirestore(newCity).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'नवीन शहर जोडले!' : 'City Added!',
      message: `"${newCity.nameEn}" added to active hubs.`
    });
  };

  const handleEditCity = (cityId, updatedData) => {
    setCities(prev => prev.map(c => c.id === cityId ? { ...c, ...updatedData } : c));
    const target = cities.find(c => c.id === cityId);
    saveCityToFirestore({ ...(target || {}), ...updatedData, id: cityId }).catch(console.warn);

    showToast({
      type: 'success',
      title: lang === 'mr' ? 'शहर अपडेट केले' : 'City Updated',
      message: 'City details updated successfully.'
    });
  };

  const handleDeleteCity = (cityId) => {
    const target = cities.find(c => c.id === cityId);
    setCities(prev => prev.filter(c => c.id !== cityId));
    deleteCityFromFirestore(cityId).catch(console.warn);

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
