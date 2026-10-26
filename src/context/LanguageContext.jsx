import React, { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // App Branding
    brandName: 'TreeBazzar',
    brandTagline: 'Local Nursery Marketplace & Plant Discovery',
    adminBadge: 'Sangli & Western MH Hub',
    adminRole: 'Super Admin',
    
    // Navigation
    navDashboard: 'Dashboard Overview',
    navNurseries: 'Nursery Approvals & Directory',
    navPlants: 'Plants & Variety Catalog',
    navLeads: 'Customer Leads & Inquiries',
    navAnalytics: 'City & Sales Analytics',
    navSettings: 'Admin Settings',

    // Header
    searchPlaceholder: 'Search nurseries, plants, or cities (Sangli, Miraj, Kolhapur)...',
    notifications: 'Notifications',
    pendingAlertNotice: 'nurseries are waiting for admin verification',
    viewAllAlerts: 'Review Pending Applications',
    switchLanguage: 'मराठी मध्ये बदला',
    langIndicator: 'English',
    liveMarketplace: 'Live Marketplace',
    activeNurseriesOnline: 'Nurseries Connected',
    syncData: 'Sync Data',
    syncing: 'Syncing...',
    refresh: 'Refresh',
    refreshTooltip: 'Refresh & sync data with Firestore Cloud',
    syncSuccess: 'Data Synced Successfully',
    syncSuccessMsg: 'Latest nurseries, plants, and leads loaded from cloud.',

    // Dashboard Overview
    overviewTitle: 'Marketplace Operations Dashboard',
    overviewSubtitle: 'Monitor local nursery onboarding, plant catalogs, and regional customer leads across Maharashtra.',
    statNurseries: 'Total Nurseries',
    statPending: 'Pending Approvals',
    statPendingSub: 'Requires urgent admin review',
    statPlants: 'Total Plants Listed',
    statCities: 'Active Cities Coverage',
    statCitiesSub: 'Sangli, Miraj, Kolhapur & Karad',
    statInquiries: "Today's Customer Inquiries",
    statInquiriesSub: 'WhatsApp & Direct Call Leads',
    vsLastMonth: 'vs last month',
    quickActions: 'Quick Management Actions',
    actionVerify: 'Review Pending Nurseries',
    actionAddPlant: 'Add Master Plant Variety',
    actionExportLeads: 'Export Daily Leads CSV',
    actionBroadcast: 'Broadcast Nursery Update',

    // Top Selling Categories
    topCategoriesTitle: 'Top Selling & Discovered Plant Categories',
    topCategoriesSubtitle: 'Live demand trends based on customer WhatsApp clicks and call requests',
    shareOfDemand: 'Demand Share',
    inquiriesThisMonth: 'inquiries this month',

    // Activity Timeline
    activityTitle: 'Real-time Marketplace Activity',
    activitySubtitle: 'Recent verification actions, customer inquiries, and plant uploads',
    viewAllActivity: 'View All Activities',

    // Regional Coverage
    regionalTitle: 'Regional Hub Distribution',
    regionalSubtitle: 'Nurseries and customer demand spread across local city clusters',

    // Nursery Management
    nurseryMgmtTitle: 'Nursery Approval & Directory Management',
    nurseryMgmtSubtitle: 'Review incoming partner applications, verify nursery legitimacy, and manage established growers.',
    tabAll: 'All Nurseries',
    tabPending: 'Pending Approvals',
    tabApproved: 'Approved & Active',
    tabRejected: 'Rejected / On-Hold',
    searchNurseryPlaceholder: 'Search by nursery name, owner name, mobile, or city...',
    filterByCity: 'Filter by City',
    allCities: 'All Cities',
    nurseryTableOwner: 'Owner & Contact',
    nurseryTableLocation: 'City & Address',
    nurseryTableSpecialties: 'Specialties',
    nurseryTablePlants: 'Plants',
    nurseryTableStatus: 'Verification Status',
    nurseryTableActions: 'Actions',
    btnApprove: 'Approve',
    btnReject: 'Reject',
    btnViewDetails: 'View Details',
    statusApproved: 'Approved',
    statusPending: 'Pending Review',
    statusRejected: 'Rejected',
    establishedYear: 'Est.',
    gpsLocation: 'GPS Coords',
    viewOnMap: 'View on Maps',
    licenseNumber: 'License / Udyam',
    verifiedPartner: 'Verified Partner',

    // Reject Modal
    rejectModalTitle: 'Reject Nursery Application',
    rejectModalDesc: 'Please provide a transparent reason for rejecting or withholding approval for this nursery. This notification will be logged and communicated to the applicant.',
    rejectReasonLabel: 'Select Primary Reason',
    rejectReasonPlaceholder: '-- Choose a reason --',
    reasonIncompleteAddress: 'Incomplete or unverified physical address / GPS location',
    reasonInvalidLicense: 'Invalid or missing nursery registration / Udyam proof',
    reasonDuplicateListing: 'Duplicate listing or existing registered profile',
    reasonQualityConcerns: 'Plant stock quality or authenticity verification failed',
    reasonOther: 'Other custom reason',
    rejectNotesLabel: 'Additional Administrator Feedback / Instructions',
    rejectNotesPlaceholder: 'Explain what documents or corrections the nursery owner must provide to resubmit...',
    btnCancel: 'Cancel',
    btnConfirmReject: 'Confirm Rejection',

    // Nursery Details Modal
    nurseryDetailsTitle: 'Nursery Profile & Verification Dossier',
    contactInfo: 'Contact Information',
    phoneCall: 'Phone Call',
    chatWhatsapp: 'WhatsApp Chat',
    addressDetails: 'Physical Nursery Address',
    specialtiesTitle: 'Core Plant Specialties & Crops',
    inventorySummary: 'Live Catalog Summary',
    managedPlants: 'Listed Varieties',
    ratingScore: 'Customer Trust Score',
    joinedDate: 'Registered Date',
    closeModal: 'Close',

    // Plants Catalog
    catalogTitle: 'Plant & Variety Master Catalog',
    catalogSubtitle: 'Manage master botanical varieties, local nursery inventories, prices, and seasonal stock availability.',
    searchPlantPlaceholder: 'Search by English, Marathi, or botanical name...',
    filterCategory: 'All Categories',
    filterStock: 'Stock Status',
    allStock: 'All Stock Levels',
    stockInStock: 'In Stock',
    stockOutOfStock: 'Out of Stock',
    stockLowStock: 'Low Stock (< 20)',
    btnAddPlant: 'Add New Master Plant',
    tablePhoto: 'Photo',
    tablePlantName: 'Plant Variety Name',
    tableCategory: 'Category',
    tableNursery: 'Source Nursery',
    tablePrice: 'Price Range (₹)',
    tableStock: 'Stock Status',
    tableActions: 'Actions',
    toggleStock: 'Toggle Stock',
    perUnit: 'per plant/sapling',

    // Add Plant Modal
    addPlantTitle: 'Add New Master Plant Variety',
    addPlantSubtitle: 'Register a certified plant variety to make it discoverable across regional nurseries.',
    plantNameEn: 'Plant Name (English)',
    plantNameMr: 'Plant Name (मराठी - Marathi)',
    botanicalName: 'Botanical / Scientific Name',
    plantCategory: 'Plant Category',
    minPrice: 'Min Price (₹)',
    maxPrice: 'Max Price (₹)',
    unitType: 'Unit Type (e.g., Sapling, Bag, Grafted)',
    selectNursery: 'Associated Nursery',
    initialStock: 'Initial Stock Status',
    photoUrlLabel: 'Plant Image URL (or choose from botanical presets)',
    presetPhotos: 'Quick Select Botanical Photos',
    descEn: 'Variety Description (English)',
    descMr: 'Variety Description (मराठी)',
    btnSubmitPlant: 'Save & Publish Plant',

    // Customer Leads & Inquiries
    leadsTitle: 'Customer Leads & Direct Inquiries',
    leadsSubtitle: 'Live record of farmers, gardeners, and wholesale buyers clicking "WhatsApp" and "Call Nursery" across Sangli, Miraj, and Kolhapur.',
    totalInquiriesTracked: 'Total Inquiries Tracked',
    whatsappInquiries: 'WhatsApp Inquiries',
    callInquiries: 'Direct Phone Calls',
    highIntentBuyers: 'Commercial / Farm Tree Inquiries',
    searchLeadsPlaceholder: 'Search leads by customer name, phone, plant, or nursery...',
    leadInteraction: 'Interaction Channel',
    leadCustomer: 'Customer Profile',
    leadPlant: 'Inquired Plant',
    leadNursery: 'Target Nursery',
    leadTime: 'Timestamp',
    leadAction: 'Action',
    actionWhatsappDirect: 'Chat with Buyer',
    actionCallDirect: 'Call Customer',
    tagResolved: 'Connected',
    tagNew: 'New Lead',
    tagFollowup: 'Pending Callback',

    // Categories
    catFruit: 'Fruit Trees',
    catIndoor: 'Indoor & Ornamental',
    catFlowers: 'Flowers & Garden',
    catFarm: 'Farm & Agroforestry Trees',
    catVegetables: 'Vegetable Seedlings',

    // Common & Toasts
    statusUpdated: 'Status updated successfully',
    plantAddedSuccess: 'Plant variety added to catalog successfully',
    nurseryApprovedMsg: 'Nursery has been verified & approved on TreeBazzar marketplace!',
    nurseryRejectedMsg: 'Nursery application rejected with feedback logged.',
    stockToggledMsg: 'Stock status updated for plant variety.',
    exportStartedMsg: 'Exporting customer inquiries CSV report...',
    refreshData: 'Refresh Data',
    totalRecords: 'Showing records',

    // Search & Not Found Messages
    productNotFound: 'Product Not Found',
    noResultsFor: 'No products found matching',
    searchTypoNotice: 'Showing closest matches with spelling corrections',
    didYouMean: 'Did you mean:',
    searchTip: 'Try checking for spelling mistakes, using simpler keywords, or clearing filters.',
    clearSearch: 'Clear Search',
    allProductsCount: 'Total Products in Catalog',
    noNurseriesFound: 'No Nurseries Found',
    noNurseriesMatching: 'No nurseries match your search query',
    noLeadsFound: 'No Leads Found',
    noLeadsMatching: 'No customer inquiries match your search query',
  },

  mr: {
    // App Branding
    brandName: 'ट्री बाजार (TreeBazzar)',
    brandTagline: 'स्थानिक रोपवाटिका बाजारपेठ व वनस्पती शोध मंच',
    adminBadge: 'सांगली व पश्चिम महाराष्ट्र हब',
    adminRole: 'सुपर ॲडमिन',

    // Navigation
    navDashboard: 'डॅशबोर्ड विहंगावलोकन',
    navNurseries: 'रोपवाटिका मान्यता व यादी',
    navPlants: 'रोपवाटिका वनस्पती कॅटलॉग',
    navLeads: 'ग्राहक लीड्स व थेट चौकशी',
    navAnalytics: 'शहर व विक्री विश्लेषण',
    navSettings: 'ॲडमिन सेटिंग्ज',

    // Header
    searchPlaceholder: 'रोपवाटिका, वनस्पती किंवा शहर शोधा (सांगली, मिरज, कोल्हापूर)...',
    notifications: 'सूचना',
    pendingAlertNotice: 'नवीन रोपवाटिका ॲडमिन मंजुरीच्या प्रतीक्षेत आहेत',
    viewAllAlerts: 'प्रलंबित अर्ज तपासा',
    switchLanguage: 'Switch to English',
    langIndicator: 'मराठी (MR)',
    liveMarketplace: 'थेट बाजारपेठ',
    activeNurseriesOnline: 'रोपवाटिका जोडल्या आहेत',
    syncData: 'डेटा सिंक करा',
    syncing: 'सिंक होत आहे...',
    refresh: 'रिफ्रेश',
    refreshTooltip: 'क्लाउडवरून थेट डेटा रिफ्रेश आणि सिंक करा',
    syncSuccess: 'डेटा यशस्वीरित्या सिंक झाला',
    syncSuccessMsg: 'सर्व रोपवाटिका, वनस्पती आणि ग्राहक नोंदी क्लाउडवरून अपडेट झाल्या.',

    // Dashboard Overview
    overviewTitle: 'बाजारपेठ व्यवस्थापन डॅशबोर्ड',
    overviewSubtitle: 'महाराष्ट्रातील स्थानिक रोपवाटिका नोंदणी, वनस्पती कॅटलॉग आणि प्रादेशिक ग्राहक चौकशीचे थेट निरीक्षण करा.',
    statNurseries: 'एकूण नोंदणीकृत रोपवाटिका',
    statPending: 'मंजुरी प्रलंबित रोपवाटिका',
    statPendingSub: 'तातडीने ॲडमिन पडताळणी आवश्यक',
    statPlants: 'कॅटलॉग मधील एकूण झाडे',
    statCities: 'सक्रिय शहरे कव्हरेज',
    statCitiesSub: 'सांगली, मिरज, कोल्हापूर व कराड',
    statInquiries: 'आजच्या ग्राहक चौकशी',
    statInquiriesSub: 'व्हॉट्सॲप व थेट फोन कॉल्स',
    vsLastMonth: 'मागील महिन्यापेक्षा वाढ',
    quickActions: 'जलद व्यवस्थापन कृती',
    actionVerify: 'प्रलंबित रोपवाटिका तपासा',
    actionAddPlant: 'नवीन वनस्पती प्रकार जोडा',
    actionExportLeads: 'आजच्या लीड्स CSV डाउनलोड करा',
    actionBroadcast: 'रोपवाटिकांना संदेश पाठवा',

    // Top Selling Categories
    topCategoriesTitle: 'सर्वाधिक विक्री व मागणी असलेले वनस्पती प्रकार',
    topCategoriesSubtitle: 'ग्राहकांच्या व्हॉट्सॲप क्लिक्स आणि थेट फोन मागणीवर आधारित लाइव्ह ट्रेंड्स',
    shareOfDemand: 'मागणी वाटा',
    inquiriesThisMonth: 'या महिन्यातील चौकशी',

    // Activity Timeline
    activityTitle: 'थेट बाजारपेठ हालचाली (Timeline)',
    activitySubtitle: 'अलीकडील पडताळणी, ग्राहक चौकशी आणि नवीन वनस्पती नोंदी',
    viewAllActivity: 'सर्व हालचाली पहा',

    // Regional Coverage
    regionalTitle: 'प्रादेशिक शहर वितरण',
    regionalSubtitle: 'सांगली, मिरज, कोल्हापूर परिसरातील रोपवाटिका व ग्राहक मागणी',

    // Nursery Management
    nurseryMgmtTitle: 'रोपवाटिका मंजुरी व व्यवस्थापन',
    nurseryMgmtSubtitle: 'नवीन भागीदार रोपवाटिकांचे अर्ज तपासा, अधिकृत कागदपत्रे पडताळा आणि सक्रिय रोपवाटिकांचे नियमन करा.',
    tabAll: 'सर्व रोपवाटिका',
    tabPending: 'मंजुरी प्रलंबित',
    tabApproved: 'मान्यताप्राप्त व सक्रिय',
    tabRejected: 'नाकारलेले / स्थगित',
    searchNurseryPlaceholder: 'नाव, मालकाचे नाव, मोबाइल किंवा शहराने शोधा...',
    filterByCity: 'शहरांनुसार फिल्टर करा',
    allCities: 'सर्व शहरे',
    nurseryTableOwner: 'मालक व संपर्क',
    nurseryTableLocation: 'शहर व पत्ता',
    nurseryTableSpecialties: 'वैशिष्ट्ये / रोपे प्रकार',
    nurseryTablePlants: 'एकूण झाडे',
    nurseryTableStatus: 'पडताळणी स्थिती',
    nurseryTableActions: 'कृती',
    btnApprove: 'मंजूर करा',
    btnReject: 'नाकारा',
    btnViewDetails: 'तपशील पहा',
    statusApproved: 'मान्यताप्राप्त (Approved)',
    statusPending: 'पडताळणी प्रलंबित',
    statusRejected: 'नाकारले (Rejected)',
    establishedYear: 'स्थापना',
    gpsLocation: 'जीपीएस स्थान',
    viewOnMap: 'गुगल मॅपवर पहा',
    licenseNumber: 'परवाना / उद्यम नोंदणी',
    verifiedPartner: 'प्रमाणित रोपवाटिका',

    // Reject Modal
    rejectModalTitle: 'रोपवाटिका अर्ज नाकारा',
    rejectModalDesc: 'कृपया रोपवाटिका अर्ज नाकारण्याचे स्पष्ट कारण नमूद करा. हे कारण सिस्टीममध्ये नोंदवले जाईल आणि अर्जदारास कळवले जाईल.',
    rejectReasonLabel: 'प्रमुख कारण निवडा',
    rejectReasonPlaceholder: '-- कारण निवडा --',
    reasonIncompleteAddress: 'अपूर्ण किंवा अपडताळलेला पत्ता / जीपीएस लोकेशन',
    reasonInvalidLicense: 'अवैध किंवा उपलब्ध नसलेला परवाना / उद्यम पुरावा',
    reasonDuplicateListing: 'आधीच नोंदणीकृत असलेली किंवा बनावट नोंद',
    reasonQualityConcerns: 'झाडांच्या दर्जाची खात्री पटली नाही',
    reasonOther: 'इतर विशेष कारण',
    rejectNotesLabel: 'ॲडमिन शेरा / आवश्यक सूचना',
    rejectNotesPlaceholder: 'पुन्हा अर्ज करण्यासाठी रोपवाटिका मालकाने काय पूर्तता करावी ते येथे लिहा...',
    btnCancel: 'रद्द करा',
    btnConfirmReject: 'नाकारण्याची पुष्टी करा',

    // Nursery Details Modal
    nurseryDetailsTitle: 'रोपवाटिका प्रोफाइल व पडताळणी माहिती',
    contactInfo: 'संपर्क माहिती',
    phoneCall: 'थेट फोन करा',
    chatWhatsapp: 'व्हॉट्सॲपवर संपर्क',
    addressDetails: 'रोपवाटिकेचा प्रत्यक्ष पत्ता',
    specialtiesTitle: 'प्रमुख वनस्पती व कलमे',
    inventorySummary: 'कॅटलॉग माहिती',
    managedPlants: 'नोंदणीकृत झाडे',
    ratingScore: 'ग्राहक विश्वास रेटिंग',
    joinedDate: 'नोंदणी तारीख',
    closeModal: 'बंद करा',

    // Plants Catalog
    catalogTitle: 'वनस्पती व रोपे मास्टर कॅटलॉग',
    catalogSubtitle: 'प्रमाणित वनस्पती प्रकार, स्थानिक रोपवाटिकांचे साठे, दर आणि हंगामी उपलब्धता व्यवस्थापित करा.',
    searchPlantPlaceholder: 'मराठी, इंग्रजी किंवा वनस्पती शास्त्रीय नावाने शोधा...',
    filterCategory: 'सर्व प्रकार',
    filterStock: 'स्टॉक स्थिती',
    allStock: 'सर्व स्टॉक स्तर',
    stockInStock: 'स्टॉकमध्ये उपलब्ध',
    stockOutOfStock: 'स्टॉक संपला (Out of Stock)',
    stockLowStock: 'कमी साठा (< २०)',
    btnAddPlant: 'नवीन वनस्पती जोडा',
    tablePhoto: 'छायाचित्र',
    tablePlantName: 'वनस्पतीचे नाव',
    tableCategory: 'प्रकार',
    tableNursery: 'पुरवठादार रोपवाटिका',
    tablePrice: 'किंमत श्रेणी (₹)',
    tableStock: 'स्टॉक स्थिती',
    tableActions: 'कृती',
    toggleStock: 'स्टॉक बदला',
    perUnit: 'प्रति रोप / कलम',

    // Add Plant Modal
    addPlantTitle: 'नवीन वनस्पती मास्टर प्रकार नोंदणी',
    addPlantSubtitle: 'स्थानिक रोपवाटिकांमध्ये उपलब्ध करण्यासाठी प्रमाणित वनस्पती प्रकार नोंदवा.',
    plantNameEn: 'वनस्पतीचे नाव (इंग्रजी)',
    plantNameMr: 'वनस्पतीचे नाव (मराठी)',
    botanicalName: 'शास्त्रीय (Botanical) नाव',
    plantCategory: 'वनस्पती प्रकार / वर्गवारी',
    minPrice: 'किमान दर (₹)',
    maxPrice: 'कमाल दर (₹)',
    unitType: 'युनिट (उदा. कलम रोप, पिशवी रोप, कलमी झाड)',
    selectNursery: 'संबंधित रोपवाटिका',
    initialStock: 'सुरुवातीचा स्टॉक',
    photoUrlLabel: 'वनस्पती फोटो URL (किंवा खालील पर्यायांमधून निवडा)',
    presetPhotos: 'नमुना छायाचित्रे निवडा',
    descEn: 'वर्णन (इंग्रजी)',
    descMr: 'वर्णन (मराठी)',
    btnSubmitPlant: 'जतन करा व प्रसिद्ध करा',

    // Customer Leads & Inquiries
    leadsTitle: 'ग्राहक लीड्स व थेट संपर्क',
    leadsSubtitle: 'सांगली, मिरज, कोल्हापूर परिसरातील शेतकरी व ग्राहकांनी रोपवाटिकांना केलेले व्हॉट्सॲप व थेट कॉल्स.',
    totalInquiriesTracked: 'एकूण नोंदवलेली ग्राहक चौकशी',
    whatsappInquiries: 'व्हॉट्सॲप क्लिक चौकशी',
    callInquiries: 'थेट फोन कॉल्स',
    highIntentBuyers: 'शेती / वनशेती झाडे चौकशी',
    searchLeadsPlaceholder: 'ग्राहक नाव, मोबाइल, वनस्पती किंवा रोपवाटिकेने शोधा...',
    leadInteraction: 'संपर्क माध्यम',
    leadCustomer: 'ग्राहक माहिती',
    leadPlant: 'विचारलेली वनस्पती',
    leadNursery: 'संबंधित रोपवाटिका',
    leadTime: 'वेळ व तारीख',
    leadAction: 'कृती',
    actionWhatsappDirect: 'ग्राहकाशी बोला',
    actionCallDirect: 'थेट फोन करा',
    tagResolved: 'संपर्क झाला',
    tagNew: 'नवीन लीड',
    tagFollowup: 'पुन्हा संपर्क करणे',

    // Categories
    catFruit: 'फळझाडे व कलमे (Fruit Trees)',
    catIndoor: 'घरातील व शोभिवंत झाडे (Indoor)',
    catFlowers: 'फुले व बागकाम (Flowers)',
    catFarm: 'शेती व वनशेती झाडे (Farm Trees)',
    catVegetables: 'भाजीपाला रोपे (Vegetables)',

    // Common & Toasts
    statusUpdated: 'स्थिती यशस्वीपणे अद्ययावत केली',
    plantAddedSuccess: 'नवीन वनस्पती कॅटलॉगमध्ये जोडली गेली!',
    nurseryApprovedMsg: 'रोपवाटिकेस ट्री बाजार मंचावर अधिकृत मान्यता दिली गेली!',
    nurseryRejectedMsg: 'रोपवाटिका अर्ज नाकारण्यात आला व कारण नोंदवले गेले.',
    stockToggledMsg: 'वनस्पतीची स्टॉक स्थिती बदलली गेली.',
    exportStartedMsg: 'ग्राहक चौकशी अहवाल CSV डाऊनलोड सुरू झाली आहे...',
    refreshData: 'माहिती रिफ्रेश करा',
    totalRecords: 'नोंदी दर्शवत आहे',

    // Search & Not Found Messages
    productNotFound: 'उत्पादन आढळले नाही (Product Not Found)',
    noResultsFor: 'या नावाचे कोणतेही उत्पादन आढळले नाही:',
    searchTypoNotice: 'स्पेलिंग मिस्टेक दुरुस्त करून जवळचे पर्याय दाखवत आहे',
    didYouMean: 'तुम्हाला हे शोधायचे होते का:',
    searchTip: 'कृपया स्पेलिंग तपासा, सोपा शब्द वापरा किंवा शोध फिल्टर काढा.',
    clearSearch: 'शोध फिल्टर काढा (Clear Search)',
    allProductsCount: 'कॅटलॉगमधील एकूण उत्पादने',
    noNurseriesFound: 'रोपवाटिका आढळली नाही (Not Found)',
    noNurseriesMatching: 'या शोधशब्दाशी जुळणारी रोपवाटिका उपलब्ध नाही',
    noLeadsFound: 'ग्राहक चौकशी आढळली नाही (Not Found)',
    noLeadsMatching: 'या शोधशब्दाशी जुळणारी ग्राहक लीड उपलब्ध नाही',
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
    return translations.en[key] || key;
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
