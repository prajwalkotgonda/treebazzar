import React, { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Branding
    brandName: 'TreeBazzar',
    brandTagline: 'Local Nursery Marketplace',
    adminBadge: 'Sangli Hub Admin',
    adminRole: 'Super Admin',
    demoDataNotice: 'Demo Mode: Local sample data is active. Changes are stored in browser state.',
    resetDemoData: 'Reset Demo Data',
    demoDataResetMsg: 'Sample nurseries, plants, and inquiries reset to default.',

    // Navigation (Sidebar)
    navDashboard: 'Dashboard',
    navNurseries: 'Nursery Management',
    navPlants: 'Plant Catalog',
    navInquiries: 'Customer Inquiries',
    navSettings: 'Settings',
    navLogout: 'Logout',
    mainMenu: 'Main Menu',

    // Header
    searchPlaceholder: 'Search nurseries, plants, inquiries, cities...',
    notifications: 'Notifications',
    pendingAlertNotice: 'nurseries are waiting for admin verification',
    viewAllAlerts: 'Review Pending Applications',
    switchLanguage: 'मराठी मध्ये बदला',
    langIndicator: 'English',
    noPendingNotice: 'All nursery applications are up to date.',

    // Dashboard Overview
    overviewTitle: 'Dashboard Overview',
    overviewSubtitle: 'Monitor local nursery onboarding, plant listings, and incoming customer inquiries across Western Maharashtra.',
    statNurseries: 'Total Nurseries',
    statPending: 'Pending Approvals',
    statPlants: 'Total Plants',
    statCities: 'Active Cities',
    statInquiries: "Today's Customer Inquiries",
    statNurseriesSub: 'Registered local nurseries',
    statPendingSub: 'Requires admin review',
    statPlantsSub: 'Live listed varieties',
    statCitiesSub: 'Sangli, Miraj, Kolhapur & Karad',
    statInquiriesSub: 'WhatsApp & Call inquiries',
    popularCategoriesTitle: 'Popular Plant Categories',
    popularCategoriesSubtitle: 'Demand breakdown based on customer leads and active catalog listings',
    recentActivityTitle: 'Recent Activities',
    recentActivitySubtitle: 'Latest registrations, plant uploads, and customer requests',
    pendingApprovalsBoxTitle: 'Pending Nursery Approvals',
    pendingApprovalsBoxSub: 'New partner applications needing verification',
    noPendingApprovals: 'No pending approvals at this time. All nurseries verified!',
    quickActionsTitle: 'Quick Actions',
    actionAddPlant: 'Add Plant',
    actionReviewNurseries: 'Review Nurseries',
    actionViewInquiries: 'View Inquiries',

    // Nursery Management
    nurseryMgmtTitle: 'Nursery Management',
    nurseryMgmtSubtitle: 'Review incoming partner applications, verify legitimacy, and manage registered local nurseries.',
    tabAll: 'All Nurseries',
    tabPending: 'Pending',
    tabApproved: 'Approved',
    tabRejected: 'Rejected',
    searchNurseryPlaceholder: 'Search by nursery name, owner name, or city...',
    thNurseryName: 'Nursery Name',
    thOwnerName: 'Owner Name',
    thCity: 'City',
    thPhone: 'Phone Number',
    thRegDate: 'Registration Date',
    thStatus: 'Approval Status',
    thActions: 'Actions',
    btnApprove: 'Approve',
    btnReject: 'Reject',
    btnViewDetails: 'View Details',
    btnAddNursery: 'Add Nursery',
    statusApproved: 'Approved',
    statusPending: 'Pending',
    statusRejected: 'Rejected',
    establishedYear: 'Est. Year',
    gpsCoordinates: 'GPS Coordinates',
    licenseNo: 'License / Registration',
    specialties: 'Specialties',
    facilities: 'Facilities',
    fullAddress: 'Full Address',
    whatsappContact: 'WhatsApp',
    callContact: 'Call Phone',

    // Reject Modal
    rejectModalTitle: 'Reject Nursery Application',
    rejectModalDesc: 'Please provide a transparent reason for withholding approval for this nursery application.',
    rejectReasonLabel: 'Primary Rejection Reason',
    rejectReasonPlaceholder: '-- Select a reason --',
    reasonIncompleteAddress: 'Incomplete or unverified physical address / GPS location',
    reasonInvalidLicense: 'Invalid or missing nursery registration / Udyam proof',
    reasonDuplicateListing: 'Duplicate listing or existing registered profile',
    reasonQualityConcerns: 'Plant stock quality or authenticity verification failed',
    reasonCustom: 'Other specific compliance issue',
    rejectNotesLabel: 'Additional Notes / Explanation',
    rejectNotesPlaceholder: 'Enter any helpful guidance for the nursery owner...',
    btnConfirmReject: 'Confirm Rejection',
    btnCancel: 'Cancel',

    // Nursery Details Modal
    nurseryDetailsTitle: 'Nursery Partner Details',
    nurseryDetailsSubtitle: 'Comprehensive profile, contact credentials, and verification status',

    // Plant Catalog
    plantCatalogTitle: 'Plant Catalog',
    plantCatalogSubtitle: 'Browse and manage high quality saplings, indoor plants, and agricultural seedlings.',
    searchPlantPlaceholder: 'Search plants by English or Marathi name, nursery...',
    filterAllCategories: 'All Categories',
    filterAllStock: 'All Stock Status',
    filterInStock: 'In Stock',
    filterOutOfStock: 'Out of Stock',
    thPhoto: 'Photo',
    thPlantName: 'Plant Name',
    thCategory: 'Category',
    thNursery: 'Nursery Name',
    thPrice: 'Price Range',
    thStock: 'Stock Status',
    stockIn: 'In Stock',
    stockOut: 'Out of Stock',
    toggleStock: 'Toggle Stock',
    btnAddNewPlant: 'Add New Plant',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    editPlantTitle: 'Edit Plant Variety',
    addPlantTitle: 'Add New Master Plant',
    addPlantSubtitle: 'Catalog a new sapling, tree variety, or seedling with pricing and nursery linkage.',
    labelPlantNameEn: 'Plant Name (English)',
    labelPlantNameMr: 'Plant Name (मराठी)',
    labelBotanicalName: 'Botanical / Variety Name',
    labelCategory: 'Plant Category',
    labelNursery: 'Associated Nursery',
    labelPriceMin: 'Min Price (₹)',
    labelPriceMax: 'Max Price (₹)',
    labelStockStatus: 'Initial Stock Status',
    labelPhotoUrl: 'Photo URL',
    labelDescriptionEn: 'Description (English)',
    labelDescriptionMr: 'वर्णन (मराठी)',
    btnSavePlant: 'Save Plant Variety',
    btnUpdatePlant: 'Update Plant',
    deleteConfirmTitle: 'Delete Plant Variety?',
    deleteConfirmMsg: 'Are you sure you want to remove this plant from the catalog? This action cannot be undone.',

    // Customer Inquiries
    inquiriesTitle: 'Customer Inquiries',
    inquiriesSubtitle: 'Real-time record of customer WhatsApp clicks, phone call requests, and plant leads.',
    searchInquiriesPlaceholder: 'Search by customer name, city, or plant...',
    filterAllTypes: 'All Types',
    filterWhatsApp: 'WhatsApp Only',
    filterCall: 'Call Only',
    thCustomerName: 'Customer Name',
    thInquiryType: 'Inquiry Type',
    thDateTime: 'Date & Time',
    thPlantOrNursery: 'Plant / Nursery',
    inquiryDetailsTitle: 'Customer Inquiry Details',
    inquiryDetailsSubtitle: 'Detailed buyer lead information and quick connect options',
    customerCity: 'Customer City',
    inquiryNotes: 'Inquiry Notes & Requirements',
    inquiryStatus: 'Lead Status',
    statusNew: 'New Lead',
    statusContacted: 'Contacted',
    statusConverted: 'Converted',
    btnOpenWhatsApp: 'Chat on WhatsApp',
    btnMakeCall: 'Make Phone Call',

    // Settings
    settingsTitle: 'Admin Settings',
    settingsSubtitle: 'Manage dashboard configuration, regional marketplace parameters, and data state.',
    adminProfileTitle: 'Administrator Profile',
    adminName: 'Admin Name',
    adminEmail: 'Email Address',
    adminHub: 'Operational Hub',
    systemInfoTitle: 'System & Architecture',
    systemEnvironment: 'Running Mode',
    systemEnvironmentVal: 'React 18 Local State (Standalone)',
    systemVersion: 'Dashboard Version',
    systemVersionVal: 'v3.0 Botanical Pure React',
    dataManagementTitle: 'Sample Data Management',
    dataManagementDesc: 'TreeBazzar currently runs in demo mode using realistic sample data for Sangli, Miraj, and Kolhapur.',
    btnResetData: 'Reset Demo Data to Defaults',

    // Logout Modal
    logoutModalTitle: 'Log Out of TreeBazzar?',
    logoutModalDesc: 'Are you sure you want to log out of the admin panel? You can easily log back in at any time.',
    btnLogoutConfirm: 'Yes, Log Out',
    loggedOutNotice: 'You have been logged out. Click to re-enter demo admin dashboard.',
    btnReLogin: 'Re-enter Admin Dashboard',

    // Empty States & Feedback
    noResultsFound: 'No results found',
    noResultsDesc: 'Try adjusting your search terms or clearing selected filters.',
    clearFilters: 'Clear Filters',
    toastApproved: 'Nursery Approved Successfully',
    toastRejected: 'Nursery Application Rejected',
    toastPlantAdded: 'New Plant Added to Catalog',
    toastPlantUpdated: 'Plant Variety Updated',
    toastPlantDeleted: 'Plant Removed from Catalog',
    toastStockToggled: 'Stock Status Updated',
    toastInquiryStatusUpdated: 'Inquiry Status Updated',
    toastDemoReset: 'Demo Data Restored',

    // Categories
    catFruitTrees: 'Fruit Trees',
    catIndoorPlants: 'Indoor Plants',
    catFloweringPlants: 'Flowering Plants',
    catFarmTrees: 'Farm Trees',
    catVegetables: 'Vegetables'
  },

  mr: {
    // Branding
    brandName: 'ट्री बाजार',
    brandTagline: 'स्थानिक रोपवाटिका बाजारपेठ',
    adminBadge: 'सांगली हब ॲडमिन',
    adminRole: 'सुपर ॲडमिन',
    demoDataNotice: 'डेमो मोड: स्थानिक नमुना डेटा सक्रिय आहे. बदल ब्राउझर मेमरीमध्ये साठवले जातात.',
    resetDemoData: 'नमुना डेटा रीसेट करा',
    demoDataResetMsg: 'रोपवाटिका, झाडे आणि ग्राहक चौकशी डेटा पूर्ववत केला.',

    // Navigation (Sidebar)
    navDashboard: 'डॅशबोर्ड',
    navNurseries: 'रोपवाटिका व्यवस्थापन',
    navPlants: 'वनस्पती कॅटलॉग',
    navInquiries: 'ग्राहक चौकशी',
    navSettings: 'सेटिंग्ज',
    navLogout: 'लॉगआउट',
    mainMenu: 'मुख्य मेनू',

    // Header
    searchPlaceholder: 'रोपवाटिका, वनस्पती, ग्राहक, शहरे शोधा...',
    notifications: 'सूचना',
    pendingAlertNotice: 'नवीन रोपवाटिका ॲडमिन मंजुरीच्या प्रतीक्षेत आहेत',
    viewAllAlerts: 'प्रलंबित अर्ज तपासा',
    switchLanguage: 'Switch to English',
    langIndicator: 'मराठी (MR)',
    noPendingNotice: 'सर्व रोपवाटिका अर्ज तपासलेले आहेत.',

    // Dashboard Overview
    overviewTitle: 'डॅशबोर्ड विहंगावलोकन',
    overviewSubtitle: 'पश्चिम महाराष्ट्रातील स्थानिक रोपवाटिका नोंदणी, वनस्पती कॅटलॉग आणि ग्राहक चौकशीचे थेट निरीक्षण करा.',
    statNurseries: 'एकूण रोपवाटिका',
    statPending: 'प्रलंबित अर्ज',
    statPlants: 'एकूण वनस्पती',
    statCities: 'सक्रिय शहरे',
    statInquiries: 'आजच्या ग्राहक चौकशी',
    statNurseriesSub: 'नोंदणीकृत स्थानिक रोपवाटिका',
    statPendingSub: 'तातडीने मंजुरी आवश्यक',
    statPlantsSub: 'कॅटलॉगमधील उपलब्ध प्रकार',
    statCitiesSub: 'सांगली, मिरज, कोल्हापूर व कराड',
    statInquiriesSub: 'व्हॉट्सॲप व थेट कॉल्स',
    popularCategoriesTitle: 'लोकप्रिय वनस्पती श्रेणी',
    popularCategoriesSubtitle: 'ग्राहक मागणी व सक्रिय स्टॉकनुसार श्रेणींची वर्गवारी',
    recentActivityTitle: 'नुकत्याच झालेल्या ॲक्टिव्हिटी',
    recentActivitySubtitle: 'नवीन नोंदणी, वनस्पती अपलोड आणि ग्राहकांच्या चौकशी',
    pendingApprovalsBoxTitle: 'मंजुरीसाठी प्रलंबित रोपवाटिका',
    pendingApprovalsBoxSub: 'पडताळणी आवश्यक असलेले नवीन अर्ज',
    noPendingApprovals: 'सध्या कोणतेही अर्ज प्रलंबित नाहीत. सर्व रोपवाटिका मंजूर आहेत!',
    quickActionsTitle: 'जलद कृती',
    actionAddPlant: 'वनस्पती जोडा',
    actionReviewNurseries: 'रोपवाटिका तपासा',
    actionViewInquiries: 'चौकशी पहा',

    // Nursery Management
    nurseryMgmtTitle: 'रोपवाटिका व्यवस्थापन',
    nurseryMgmtSubtitle: 'नवीन रोपवाटिकांची पडताळणी करा, अर्ज मंजूर किंवा नामंजूर करा आणि नोंदणीकृत उत्पादक व्यवस्थापित करा.',
    tabAll: 'सर्व रोपवाटिका',
    tabPending: 'प्रलंबित',
    tabApproved: 'मंजूर',
    tabRejected: 'नाकारलेले',
    searchNurseryPlaceholder: 'नाव, मालकाचे नाव किंवा शहरावरून शोधा...',
    thNurseryName: 'रोपवाटिकेचे नाव',
    thOwnerName: 'मालकाचे नाव',
    thCity: 'शहर',
    thPhone: 'फोन नंबर',
    thRegDate: 'नोंदणी तारीख',
    thStatus: 'मंजुरी स्थिती',
    thActions: 'कृती',
    btnApprove: 'मंजूर करा',
    btnReject: 'नाकारा',
    btnViewDetails: 'तपशील पहा',
    btnAddNursery: 'नवीन रोपवाटिका जोडा',
    statusApproved: 'मंजूर',
    statusPending: 'प्रलंबित',
    statusRejected: 'नाकारले',
    establishedYear: 'स्थापना वर्ष',
    gpsCoordinates: 'GPS लोकेशन',
    licenseNo: 'नोंदणी / उद्योग आधार',
    specialties: 'खास वैशिष्ट्ये',
    facilities: 'उपलब्ध सेवा',
    fullAddress: 'पूर्ण पत्ता',
    whatsappContact: 'व्हॉट्सॲप',
    callContact: 'थेट फोन करा',

    // Reject Modal
    rejectModalTitle: 'रोपवाटिका अर्ज नाकारा',
    rejectModalDesc: 'कृपया या रोपवाटिकेचा अर्ज नाकारण्याचे स्पष्ट व पारदर्शक कारण निवडा.',
    rejectReasonLabel: 'नाकारण्याचे मुख्य कारण',
    rejectReasonPlaceholder: '-- कारण निवडा --',
    reasonIncompleteAddress: 'अपूर्ण किंवा चुकीचा पत्ता / GPS लोकेशन पडताळणी अयशस्वी',
    reasonInvalidLicense: 'अवैध किंवा कालबाह्य झालेला नर्सरी परवाना / उद्योग आधार',
    reasonDuplicateListing: 'आधीच अस्तित्वात असलेली प्रोफाइल किंवा डुप्लिकेट नोंदणी',
    reasonQualityConcerns: 'झाडांच्या दर्जाची किंवा अस्सलतेची खात्री न पटणे',
    reasonCustom: 'इतर प्रशासकीय त्रुटी',
    rejectNotesLabel: 'अधिक माहिती / शेरा',
    rejectNotesPlaceholder: 'रोपवाटिका चालकास सुधारणेसाठी उपयुक्त सूचना लिहा...',
    btnConfirmReject: 'अर्ज नाकारण्याची पुष्टी करा',
    btnCancel: 'रद्द करा',

    // Nursery Details Modal
    nurseryDetailsTitle: 'रोपवाटिका संपूर्ण तपशील',
    nurseryDetailsSubtitle: 'सविस्तर प्रोफाइल, संपर्क माहिती आणि पडताळणी स्थिती',

    // Plant Catalog
    plantCatalogTitle: 'वनस्पती कॅटलॉग',
    plantCatalogSubtitle: 'दर्जेदार फळझाडे, इनडोअर रोपे आणि शेतीसाठीच्या झाडांची यादी व्यवस्थापित करा.',
    searchPlantPlaceholder: 'मराठी किंवा इंग्रजी नाव, रोपवाटिकेवरून शोधा...',
    filterAllCategories: 'सर्व श्रेणी',
    filterAllStock: 'सर्व स्टॉक स्थिती',
    filterInStock: 'स्टॉक उपलब्ध',
    filterOutOfStock: 'स्टॉक संपला',
    thPhoto: 'फोटो',
    thPlantName: 'वनस्पतीचे नाव',
    thCategory: 'श्रेणी',
    thNursery: 'रोपवाटिका',
    thPrice: 'किंमत श्रेणी',
    thStock: 'स्टॉक स्थिती',
    stockIn: 'उपलब्ध',
    stockOut: 'स्टॉक संपला',
    toggleStock: 'स्टॉक बदला',
    btnAddNewPlant: 'नवीन वनस्पती जोडा',
    btnEdit: 'बदला',
    btnDelete: 'काढा',
    editPlantTitle: 'वनस्पती माहिती संपादन करा',
    addPlantTitle: 'नवीन वनस्पती प्रकार जोडा',
    addPlantSubtitle: 'कॅटलॉगमध्ये नवीन रोप, झाड किंवा बियाणे दर आणि रोपवाटिकेसह जोडा.',
    labelPlantNameEn: 'नाव (इंग्रजी)',
    labelPlantNameMr: 'नाव (मराठी)',
    labelBotanicalName: 'बॉटनिकल / शास्त्रीय नाव',
    labelCategory: 'वनस्पती श्रेणी',
    labelNursery: 'संबंधित रोपवाटिका',
    labelPriceMin: 'किमान दर (₹)',
    labelPriceMax: 'कमाल दर (₹)',
    labelStockStatus: 'सुरुवातीची स्टॉक स्थिती',
    labelPhotoUrl: 'फोटो लिंक (URL)',
    labelDescriptionEn: 'माहिती (इंग्रजी)',
    labelDescriptionMr: 'माहिती (मराठी)',
    btnSavePlant: 'वनस्पती जतन करा',
    btnUpdatePlant: 'बदल जतन करा',
    deleteConfirmTitle: 'वनस्पती काढून टाकायची का?',
    deleteConfirmMsg: 'तुम्हाला खात्री आहे का की ही वनस्पती कॅटलॉगमधून काढून टाकायची आहे?',

    // Customer Inquiries
    inquiriesTitle: 'ग्राहक चौकशी व लीड्स',
    inquiriesSubtitle: 'ग्राहकांनी मोबाईल ॲपवरून केलेले फोन कॉल्स आणि व्हॉट्सॲप क्लिक्सचा थेट अहवाल.',
    searchInquiriesPlaceholder: 'ग्राहकाचे नाव, शहर किंवा वनस्पती शोधा...',
    filterAllTypes: 'सर्व प्रकार',
    filterWhatsApp: 'फक्त व्हॉट्सॲप',
    filterCall: 'फक्त फोन कॉल्स',
    thCustomerName: 'ग्राहकाचे नाव',
    thInquiryType: 'चौकशी माध्यम',
    thDateTime: 'दिनांक व वेळ',
    thPlantOrNursery: 'वनस्पती / रोपवाटिका',
    inquiryDetailsTitle: 'ग्राहक चौकशी तपशील',
    inquiryDetailsSubtitle: 'ग्राहकाची मागणी आणि त्वरित संपर्क साधण्याचे पर्याय',
    customerCity: 'ग्राहकाचे शहर',
    inquiryNotes: 'चौकशीबाबत माहिती व गरज',
    inquiryStatus: 'लीड स्थिती',
    statusNew: 'नवीन लीड',
    statusContacted: 'संपर्क झाला',
    statusConverted: 'ऑर्डर निश्चित',
    btnOpenWhatsApp: 'व्हॉट्सॲपवर चॅट करा',
    btnMakeCall: 'थेट फोन लावा',

    // Settings
    settingsTitle: 'ॲडमिन सेटिंग्ज',
    settingsSubtitle: 'डॅशबोर्ड सेटिंग्ज, प्रादेशिक बाजारपेठ माहिती आणि डेटा व्यवस्थापन.',
    adminProfileTitle: 'प्रशासक प्रोफाइल',
    adminName: 'ॲडमिनचे नाव',
    adminEmail: 'ईमेल पत्ता',
    adminHub: 'मुख्य कार्यक्षेत्र',
    systemInfoTitle: 'सिस्टीम माहिती',
    systemEnvironment: 'कार्यप्रणाली',
    systemEnvironmentVal: 'React 18 स्थानिक स्टेट (Standalone)',
    systemVersion: 'डॅशबोर्ड आवृत्ती',
    systemVersionVal: 'v3.0 बॉटनिकल प्युअर रिॲक्ट',
    dataManagementTitle: 'नमुना डेटा नियंत्रण',
    dataManagementDesc: 'ट्री बाजार सध्या सांगली, मिरज व कोल्हापूरसाठीच्या प्रात्यक्षिक नमुना डेटावर कार्यरत आहे.',
    btnResetData: 'नमुना डेटा पूर्ववत करा (Reset)',

    // Logout Modal
    logoutModalTitle: 'ट्री बाजारमधून बाहेर पडायचे का?',
    logoutModalDesc: 'तुम्हाला खात्री आहे का की तुम्ही ॲडमिन पॅनेलमधून लॉगआउट करू इच्छिता?',
    btnLogoutConfirm: 'होय, लॉगआउट करा',
    loggedOutNotice: 'तुम्ही लॉगआउट झाले आहात. डॅशबोर्डमध्ये पुन्हा प्रवेश करण्यासाठी खाली क्लिक करा.',
    btnReLogin: 'डॅशबोर्ड उघडा',

    // Empty States & Feedback
    noResultsFound: 'काहीही आढळले नाही',
    noResultsDesc: 'कृपया स्पेलिंग तपासा किंवा निवडलेले फिल्टर्स काढून पुन्हा प्रयत्न करा.',
    clearFilters: 'फिल्टर्स काढा',
    toastApproved: 'रोपवाटिका यशस्वीरित्या मंजूर केली',
    toastRejected: 'रोपवाटिका अर्ज नाकारण्यात आला',
    toastPlantAdded: 'नवीन वनस्पती कॅटलॉगमध्ये समाविष्ट केली',
    toastPlantUpdated: 'वनस्पती माहिती अद्ययावत केली',
    toastPlantDeleted: 'वनस्पती कॅटलॉगमधून काढून टाकली',
    toastStockToggled: 'स्टॉक स्थिती बदलली',
    toastInquiryStatusUpdated: 'चौकशी स्थिती अद्ययावत केली',
    toastDemoReset: 'नमुना डेटा पूर्ववत केला',

    // Categories
    catFruitTrees: 'फळझाडे',
    catIndoorPlants: 'इनडोअर रोपे',
    catFloweringPlants: 'फुलझाडे',
    catFarmTrees: 'शेती झाडे',
    catVegetables: 'भाजीपाला'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'mr' : 'en'));
  };

  const t = (key) => {
    if (translations[lang] && translations[lang][key] !== undefined) {
      return translations[lang][key];
    }
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return key;
  };

  const value = useMemo(() => ({
    lang,
    setLang,
    toggleLanguage,
    t
  }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
