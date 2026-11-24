// Firebase Service for TreeBazzar Admin Dashboard
// Configured for project: treebazzar-f4780
// Full bidirectional real-time synchronization between Mobile App & Web Admin

export const firebaseConfig = {
  apiKey: "AIzaSyC3FcxbOPpRqIoknEvbLdv84s97EBrxw4o",
  authDomain: "treebazzar-f4780.firebaseapp.com",
  projectId: "treebazzar-f4780",
  storageBucket: "treebazzar-f4780.firebasestorage.app",
  messagingSenderId: "1044474752430",
  appId: "1:1044474752430:web:44bfa2e5d66691a979ec3f",
  measurementId: "G-82D6QJQ683"
};

// Singleton references
let firebaseModules = null;
let appInstance = null;
let dbInstance = null;
let analyticsInstance = null;
let initPromise = null;

/**
 * Remove any undefined properties recursively to prevent Firestore serialization errors
 */
export function sanitizePayload(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload).filter(item => item !== undefined);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = (value && typeof value === 'object' && !(value instanceof Date)) 
        ? sanitizePayload(value) 
        : value;
    }
  }
  return clean;
}

/**
 * Helper to calculate 3-Day Free Trial (with +3 +3 Admin Extension) and Subscription lifecycle for a nursery
 */
export function getNurseryTrialInfo(data) {
  if (!data) {
    return {
      isSubscribed: false,
      isTrialActive: false,
      isTrialExpired: false,
      daysLeft: 0,
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      trialDaysTotal: 3,
      trialExtensionsCount: 0
    };
  }

  const rawStatus = (data.status || '').toLowerCase();
  const subscriptionStatus = (data.subscriptionStatus || '').toLowerCase();
  const isSuspended = rawStatus === 'suspended' || Boolean(data.isSuspended);
  const isRejected = rawStatus === 'rejected';

  // Explicitly approved with paid/active subscription
  const isExplicitlySubscribed = (rawStatus === 'approved' && !isSuspended && !isRejected) &&
    (subscriptionStatus === 'active' || data.isSubscriptionApproved === true || data.paymentStatus === 'paid' || data.subscriptionPlan === 'paid_annual');

  // Registration / Trial start timestamp
  let createdTime;
  if (data.trialStartDate) {
    createdTime = new Date(data.trialStartDate).getTime();
  } else if (data.createdAt) {
    createdTime = new Date(data.createdAt).getTime();
  } else if (data.registrationDate) {
    createdTime = new Date(data.registrationDate).getTime();
  } else {
    const match = String(data.id || '').match(/(\d{13})/);
    createdTime = match ? parseInt(match[1], 10) : Date.now();
  }

  if (isNaN(createdTime) || createdTime <= 0) {
    createdTime = Date.now();
  }

  const trialDaysTotal = Number(data.trialDaysTotal) || 3;
  const trialExtensionsCount = Number(data.trialExtensionsCount) || (trialDaysTotal > 3 ? Math.floor((trialDaysTotal - 3) / 3) : 0);

  let trialEndTime;
  if (data.trialEndDate) {
    trialEndTime = new Date(data.trialEndDate).getTime();
  }
  if (!trialEndTime || isNaN(trialEndTime)) {
    trialEndTime = createdTime + trialDaysTotal * 24 * 60 * 60 * 1000;
  }

  const now = Date.now();
  const msLeft = trialEndTime - now;
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  const isTrialActive = !isExplicitlySubscribed && !isSuspended && !isRejected && msLeft > 0;
  const isTrialExpired = !isExplicitlySubscribed && msLeft <= 0;

  return {
    isSubscribed: isExplicitlySubscribed,
    isTrialActive,
    isTrialExpired,
    daysLeft,
    trialStartDate: new Date(createdTime).toISOString(),
    trialEndDate: new Date(trialEndTime).toISOString(),
    trialDaysTotal,
    trialExtensionsCount
  };
}

/**
 * Normalize Nursery data from either mobile app schema or web admin schema
 */
export function normalizeNursery(data, id) {
  if (!data) return null;
  const docId = id || data.id || `nursery-${Date.now()}`;
  const name = data.name || data.nurseryName || data.nameEn || 'Unnamed Nursery';
  const nameMr = data.nameMr || data.nurseryNameMr || name;
  const ownerName = data.ownerName || data.owner || data.ownerNameEn || 'Nursery Owner';
  const city = data.city || data.district || data.cityEn || '';
  const district = data.district || city;
  const phone = data.phone || data.ownerPhone || '';
  const whatsapp = data.whatsapp || phone.replace(/\D/g, '') || '';
  const address = data.address || `${city}, Maharashtra`;
  const image = data.image || data.nurseryImages?.[0] || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80';
  
  let rawStatus = (data.status || 'pending').toLowerCase();
  if (rawStatus === 'active') rawStatus = 'approved';

  const isSuspended = rawStatus === 'suspended' || Boolean(data.isSuspended && rawStatus !== 'approved');
  const isRejected = rawStatus === 'rejected';
  const isRevoked = rawStatus === 'revoked';

  // Calculate 3-Day Free Trial Information (3+3+3 Model)
  const trialInfo = getNurseryTrialInfo(data);

  // Status mapping:
  // 1. Suspended or Rejected always takes precedence
  // 2. If approved / subscribed: 'approved'
  // 3. If within 3 days trial (or extended +3/+3): 'trial' (Active free trial, no admin block)
  // 4. If trial expired and not approved: 'pending' (Trial Expired, needs payment or Admin +3 days extension)
  let normalizedStatus;
  if (isSuspended) {
    normalizedStatus = 'suspended';
  } else if (isRejected) {
    normalizedStatus = 'rejected';
  } else if (isRevoked) {
    normalizedStatus = 'revoked';
  } else if (trialInfo.isSubscribed) {
    normalizedStatus = 'approved';
  } else if (trialInfo.isTrialActive) {
    normalizedStatus = 'trial';
  } else if (trialInfo.isTrialExpired) {
    normalizedStatus = 'pending';
  } else {
    normalizedStatus = rawStatus;
  }

  const isApproved = normalizedStatus === 'approved';
  const isTrialActive = normalizedStatus === 'trial';
  const isActive = (isApproved || isTrialActive) && !isSuspended && !isRejected;
  const verified = isApproved;
  const isVerified = isApproved;
  const rejectionReason = data.rejectionReason || data.rejectionNotes || '';
  const suspensionReason = data.suspensionReason || '';
  const revocationReason = data.revocationReason || '';
  const establishedYear = data.establishedYear || 2020;
  const totalPlants = Number(data.totalPlants) || 0;
  const facilities = data.facilities || data.specialties || ['Home Delivery', 'Grafted Varieties'];
  const specialties = facilities;
  const location = data.location || { 
    latitude: Number(data.latitude) || 16.85, 
    longitude: Number(data.longitude) || 74.58 
  };

  return {
    ...data,
    id: docId,
    name,
    nurseryName: name,
    nameMr,
    ownerName,
    owner: ownerName,
    city,
    district,
    phone,
    ownerPhone: phone,
    whatsapp,
    address,
    image,
    nurseryImages: data.nurseryImages || [image],
    status: normalizedStatus,
    rawStatus,
    verified,
    isVerified,
    isActive,
    isSuspended: isSuspended || isRejected,

    // 3-Day Free Trial (3+3+3 Model) & Subscription Lifecycle
    trialStartDate: trialInfo.trialStartDate,
    trialEndDate: trialInfo.trialEndDate,
    trialDaysTotal: trialInfo.trialDaysTotal,
    trialExtensionsCount: trialInfo.trialExtensionsCount,
    trialDaysLeft: trialInfo.daysLeft,
    isTrialActive: trialInfo.isTrialActive,
    isTrialExpired: trialInfo.isTrialExpired,
    isSubscribed: trialInfo.isSubscribed,
    subscriptionPlan: data.subscriptionPlan || (trialInfo.isSubscribed ? 'paid_annual' : 'free_trial_3d'),
    subscriptionStatus: trialInfo.isSubscribed ? 'active' : (trialInfo.isTrialActive ? 'trial' : 'pending_approval'),

    rejectionReason,
    rejectionNotes: rejectionReason,
    suspensionReason,
    revocationReason,
    establishedYear,
    totalPlants,
    facilities,
    specialties,
    businessType: data.businessType || data.category || 'nursery_plants_producer',
    location,
    createdAt: data.createdAt || trialInfo.trialStartDate,
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

/**
 * Normalize Plant data from either mobile app schema or web admin schema
 */
export function normalizePlant(data, id) {
  if (!data) return null;
  const docId = id || data.id || `plt-${Date.now()}`;
  const nameEn = data.nameEn || data.name || 'Plant Variety';
  const nameMr = data.nameMr || data.name || nameEn;
  const botanicalName = data.botanicalName || data.scientificName || '';
  const category = data.category || 'Fruit Trees';
  const categoryMr = data.categoryMr || category;
  const nurseryId = data.nurseryId || '';
  const nurseryName = data.nurseryName || data.nursery || '';
  const priceMin = Number(data.priceMin) || Number(data.price) || Number(data.varieties?.[0]?.price) || 150;
  const priceMax = Number(data.priceMax) || Number(data.price) || Number(data.varieties?.[0]?.price) || priceMin;
  const photoUrl = data.photoUrl || data.imageUrl || data.images?.[0] || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';
  const stockStatus = data.stockStatus || (data.isActive !== false ? 'in_stock' : 'out_of_stock');
  const isActive = stockStatus === 'in_stock' && data.isActive !== false;
  const unit = data.unit || 'Sapling';
  const unitMr = data.unitMr || (unit === 'Sapling' ? 'कलम रोप' : unit);
  const stockCount = Number(data.stockCount) || 200;
  const descriptionEn = data.descriptionEn || data.description || '';
  const descriptionMr = data.descriptionMr || descriptionEn;
  const varieties = data.varieties || [
    { varietyName: 'Standard Graft', price: priceMin, inStock: isActive }
  ];

  return {
    ...data,
    id: docId,
    name: nameEn,
    nameEn,
    nameMr,
    botanicalName,
    scientificName: botanicalName,
    category,
    categoryMr,
    nurseryId,
    nurseryName,
    priceMin,
    priceMax,
    price: priceMin,
    unit,
    unitMr,
    stockStatus,
    isActive,
    stockCount,
    photoUrl,
    imageUrl: photoUrl,
    images: data.images || [photoUrl],
    descriptionEn,
    descriptionMr,
    description: descriptionEn,
    varieties,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

/**
 * Normalize Lead / Inquiry data from mobile app or web
 */
export function normalizeLead(data, id) {
  if (!data) return null;
  const docId = id || data.id || `lead-${Date.now()}`;
  const customerName = data.customerName || data.name || 'Anonymous Customer';
  const customerPhone = data.customerPhone || data.phone || '';
  const city = data.city || data.customerCity || data.district || '';
  const plantName = data.plantName || data.plant || '';
  const nurseryName = data.nurseryName || data.nursery || '';
  const actionType = data.actionType || data.type || data.inquiryType || 'whatsapp';
  const status = data.status || 'new';
  const timestamp = data.timestamp || data.createdAt || new Date().toISOString();

  return {
    ...data,
    id: docId,
    customerName,
    customerPhone,
    phone: customerPhone,
    city,
    customerCity: city,
    plantName,
    plant: plantName,
    nurseryName,
    nursery: nurseryName,
    actionType,
    type: actionType,
    status,
    timestamp,
    createdAt: timestamp
  };
}

/**
 * Normalize Order data from mobile app or web admin schema
 */
export function normalizeOrder(data, id) {
  if (!data) return null;
  const docId = id || data.id || data.orderId || `ORD-${Date.now()}`;
  const customerName = data.customerName || data.userName || data.name || 'Customer';
  const customerPhone = data.customerPhone || data.phone || data.userPhone || '';
  const customerCity = data.customerCity || data.city || '';
  const nurseryId = data.nurseryId || '';
  const nurseryName = data.nurseryName || data.nursery || 'TreeBazzar Nursery';
  const plantName = data.plantName || data.plant || data.items?.[0]?.name || data.items?.[0]?.plantName || 'Plant Saplings';
  const quantity = Number(data.quantity) || Number(data.totalQuantity) || (data.items?.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)) || 1;
  const unitPrice = Number(data.unitPrice) || Number(data.price) || 100;
  const totalAmount = Number(data.totalAmount) || Number(data.amount) || Number(data.total) || (quantity * unitPrice);
  const paymentMethod = data.paymentMethod || data.paymentType || 'Cash on Delivery';
  const paymentStatus = data.paymentStatus || (paymentMethod === 'UPI Transfer' || paymentMethod === 'payu' || paymentMethod === 'razorpay' ? 'paid' : 'pending');
  const status = (data.status || data.orderStatus || 'pending').toLowerCase();
  const date = data.date || (data.createdAt ? String(data.createdAt).split('T')[0] : new Date().toISOString().split('T')[0]);
  const deliveryAddress = data.deliveryAddress || data.address || `${customerCity}, Maharashtra`;
  const notes = data.notes || data.instructions || '';
  const isApproved = status === 'confirmed' || status === 'delivered' || status === 'dispatched';
  const isConfirmed = isApproved;

  return {
    ...data,
    id: docId,
    orderId: docId,
    customerName,
    name: customerName,
    customerPhone,
    phone: customerPhone,
    customerCity,
    city: customerCity,
    nurseryId,
    nurseryName,
    plantName,
    quantity,
    unitPrice,
    totalAmount,
    amount: totalAmount,
    paymentMethod,
    paymentStatus,
    status,
    orderStatus: status,
    date,
    deliveryAddress,
    address: deliveryAddress,
    notes,
    isApproved,
    isConfirmed,
    confirmedAt: data.confirmedAt || data.approvedAt || (isApproved ? new Date().toISOString() : undefined),
    approvedAt: data.approvedAt || (isApproved ? new Date().toISOString() : undefined),
    dispatchedAt: data.dispatchedAt,
    deliveredAt: data.deliveredAt,
    cancelledAt: data.cancelledAt || data.rejectedAt,
    rejectionReason: data.rejectionReason || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

/**
 * Normalize Branch Advertisement data from Firestore or local creation
 */
export function normalizeAd(data, docId) {
  if (!data) return null;
  const id = docId || data.id || `ad-${Date.now()}`;
  const photo = data.photo || data.imageUrl || data.image || data.photoUrl || '';

  return {
    ...data,
    id,
    branchName: data.branchName || data.nurseryName || data.name || '',
    mobile: data.mobile || data.phone || data.contactNumber || '',
    photo,
    imageUrl: photo,
    image: photo,
    photoUrl: photo,
    title: data.title || '',
    description: data.description || '',
    badge: data.badge || 'Special Offer',
    status: data.status || 'active',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

/**
 * Convert JS object into Firestore REST API value format
 */
function toRestFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number') {
      if (Number.isInteger(v)) fields[k] = { integerValue: v.toString() };
      else fields[k] = { doubleValue: v };
    } else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { integerValue: item.toString() };
            if (typeof item === 'object') return { mapValue: { fields: toRestFields(item) } };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof v === 'object' && v !== null) {
      fields[k] = { mapValue: { fields: toRestFields(v) } };
    }
  }
  return fields;
}

/**
 * Convert Firestore REST API value back to plain JavaScript value
 */
export function fromRestValue(val) {
  if (val === null || val === undefined) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    const values = val.arrayValue?.values || [];
    return values.map(fromRestValue);
  }
  if ('mapValue' in val) {
    return fromRestFields(val.mapValue?.fields || {});
  }
  if ('nullValue' in val) return null;
  return null;
}

/**
 * Convert Firestore REST API fields object back to plain JavaScript object
 */
export function fromRestFields(fields = {}) {
  const obj = {};
  for (const [k, v] of Object.entries(fields)) {
    obj[k] = fromRestValue(v);
  }
  return obj;
}

/**
 * Fetch all documents in a collection directly from Firestore (SDK + REST fallback)
 */
export async function fetchCollectionFromFirestore(collectionName) {
  try {
    const fb = await getFirebase();
    if (fb && fb.db && fb.getDocs && fb.collection) {
      const snap = await fb.getDocs(fb.collection(fb.db, collectionName));
      return snap.docs.map(d => {
        const raw = { id: d.id, ...d.data() };
        if (collectionName === 'nurseries') return normalizeNursery(raw, d.id);
        if (collectionName === 'plants') return normalizePlant(raw, d.id);
        if (collectionName === 'leads') return normalizeLead(raw, d.id);
        if (collectionName === 'orders') return normalizeOrder(raw, d.id);
        if (collectionName === 'ads') return normalizeAd(raw, d.id);
        return raw;
      });
    }
  } catch (err) {
    console.warn(`Firestore getDocs failed for ${collectionName}, trying REST:`, err);
  }

  // REST API fallback
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(doc => {
      const id = doc.name.split('/').pop();
      const raw = { id, ...fromRestFields(doc.fields) };
      if (collectionName === 'nurseries') return normalizeNursery(raw, id);
      if (collectionName === 'plants') return normalizePlant(raw, id);
      if (collectionName === 'leads') return normalizeLead(raw, id);
      if (collectionName === 'orders') return normalizeOrder(raw, id);
      if (collectionName === 'ads') return normalizeAd(raw, id);
      return raw;
    });
  } catch (e) {
    console.warn(`REST fallback fetch failed for ${collectionName}:`, e);
    return [];
  }
}

/**
 * Fetch and sync all collections (nurseries, plants, leads, orders, ads) from Firestore
 */
export async function syncAllData() {
  const [nurseries, plants, leads, orders, ads] = await Promise.all([
    fetchCollectionFromFirestore('nurseries'),
    fetchCollectionFromFirestore('plants'),
    fetchCollectionFromFirestore('leads'),
    fetchCollectionFromFirestore('orders'),
    fetchCollectionFromFirestore('ads')
  ]);
  return { nurseries, plants, leads, orders, ads };
}

/**
 * REST API fallback to save document directly to Firestore
 */
async function saveDocumentViaRest(collectionName, docId, data) {
  if (typeof fetch === 'undefined') return false;
  try {
    const fields = toRestFields(sanitizePayload(data));
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return res.ok;
  } catch (e) {
    console.warn(`REST fallback save error for ${collectionName}/${docId}:`, e);
    return false;
  }
}

/**
 * REST API fallback to delete document directly from Firestore
 */
async function deleteDocumentViaRest(collectionName, docId) {
  if (typeof fetch === 'undefined') return false;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.warn(`REST fallback delete error for ${collectionName}/${docId}:`, e);
    return false;
  }
}

/**
 * Dynamically loads Firebase Modular SDK from Google CDN with singleton caching
 */
export async function getFirebase() {
  if (firebaseModules && appInstance && dbInstance) {
    return { ...firebaseModules, app: appInstance, db: dbInstance, analytics: analyticsInstance };
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Check if already initialized in window by index.html
    if (typeof window !== 'undefined' && window.__TREEBAZZAR_FIREBASE__?.db) {
      const fb = window.__TREEBAZZAR_FIREBASE__;
      appInstance = fb.app;
      dbInstance = fb.db;
      analyticsInstance = fb.analytics;
      firebaseModules = fb;
      return fb;
    }

    try {
      const [appMod, firestoreMod, analyticsMod, storageMod] = await Promise.all([
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js'),
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js'),
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js').catch(() => null),
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js').catch(() => null),
      ]);

      appInstance = appMod.getApps().length > 0 ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      dbInstance = firestoreMod.getFirestore(appInstance);
      let storageInstance = null;
      if (storageMod) {
        try {
          storageInstance = storageMod.getStorage(appInstance);
        } catch (stErr) {}
      }

      if (analyticsMod && typeof window !== 'undefined') {
        try {
          const isSupported = await analyticsMod.isSupported();
          if (isSupported) {
            analyticsInstance = analyticsMod.getAnalytics(appInstance);
          }
        } catch (e) {
          // Analytics non-critical
        }
      }

      firebaseModules = {
        app: appInstance,
        db: dbInstance,
        storage: storageInstance,
        analytics: analyticsInstance,
        collection: firestoreMod.collection,
        doc: firestoreMod.doc,
        getDocs: firestoreMod.getDocs,
        setDoc: firestoreMod.setDoc,
        updateDoc: firestoreMod.updateDoc,
        deleteDoc: firestoreMod.deleteDoc,
        onSnapshot: firestoreMod.onSnapshot,
        query: firestoreMod.query,
        where: firestoreMod.where,
        orderBy: firestoreMod.orderBy,
        ref: storageMod?.ref,
        uploadBytes: storageMod?.uploadBytes,
        getDownloadURL: storageMod?.getDownloadURL,
        logEvent: analyticsMod?.logEvent
      };

      if (typeof window !== 'undefined') {
        window.__TREEBAZZAR_FIREBASE__ = firebaseModules;
      }

      return firebaseModules;
    } catch (err) {
      console.warn('Firebase SDK dynamic load fallback to REST API mode:', err);
      return null;
    }
  })();

  return initPromise;
}

/**
 * Log analytics event safely
 */
export async function logFirebaseEvent(eventName, params = {}) {
  try {
    const fb = await getFirebase();
    if (fb && fb.analytics && fb.logEvent) {
      fb.logEvent(fb.analytics, eventName, params);
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Real-time listener for a collection with automatic normalization
 */
export async function subscribeToCollection(collectionName, onDataReceived, onError) {
  try {
    const fb = await getFirebase();
    if (fb && fb.db && fb.onSnapshot) {
      const colRef = fb.collection(fb.db, collectionName);
      return fb.onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(d => {
          const raw = { id: d.id, ...d.data() };
          if (collectionName === 'nurseries') return normalizeNursery(raw, d.id);
          if (collectionName === 'plants') return normalizePlant(raw, d.id);
          if (collectionName === 'leads') return normalizeLead(raw, d.id);
          if (collectionName === 'orders') return normalizeOrder(raw, d.id);
          if (collectionName === 'ads') return normalizeAd(raw, d.id);
          return raw;
        });
        onDataReceived(items);
      }, (err) => {
        console.warn(`Firestore onSnapshot warning for ${collectionName}:`, err.message);
        if (onError) onError(err);
      });
    }
  } catch (err) {
    console.warn(`subscribeToCollection error for ${collectionName}:`, err);
  }
  return () => {};
}

/**
 * Add or update plant in Firestore with bidirectional mobile-app compatibility
 */
export async function addPlantToFirestore(plant) {
  const norm = normalizePlant(plant);
  const payload = sanitizePayload({
    ...norm,
    name: norm.nameEn,
    nameEn: norm.nameEn,
    nameMr: norm.nameMr,
    botanicalName: norm.botanicalName,
    category: norm.category,
    categoryMr: norm.categoryMr,
    nurseryId: norm.nurseryId,
    nurseryName: norm.nurseryName,
    priceMin: norm.priceMin,
    priceMax: norm.priceMax,
    price: norm.priceMin,
    unit: norm.unit,
    unitMr: norm.unitMr,
    stockStatus: norm.stockStatus,
    isActive: norm.stockStatus === 'in_stock',
    stockCount: norm.stockCount,
    photoUrl: norm.photoUrl,
    images: [norm.photoUrl],
    descriptionEn: norm.descriptionEn,
    descriptionMr: norm.descriptionMr,
    description: norm.descriptionEn,
    varieties: [
      { varietyName: norm.unit || 'Standard Sapling', price: norm.priceMin, inStock: norm.stockStatus === 'in_stock' }
    ],
    updatedAt: new Date().toISOString(),
    createdAt: norm.createdAt || new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'plants', norm.id), payload, { merge: true });
      logFirebaseEvent('plant_added', { plantId: norm.id, category: norm.category });
      return true;
    } catch (err) {
      console.warn('Firestore setDoc plant failed, using REST fallback:', err);
    }
  }

  return await saveDocumentViaRest('plants', norm.id, payload);
}

/**
 * Update plant stock in Firestore (toggles isActive & varieties.inStock for mobile app)
 */
export async function updatePlantStockInFirestore(plantId, stockStatus) {
  const isActive = stockStatus === 'in_stock';
  const payload = sanitizePayload({
    stockStatus,
    isActive,
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'plants', plantId), payload, { merge: true });
      logFirebaseEvent('plant_stock_toggled', { plantId, stockStatus });
      return true;
    } catch (err) {
      console.warn('Firestore stock update failed, using REST fallback:', err);
    }
  }

  return await saveDocumentViaRest('plants', plantId, payload);
}

/**
 * Delete plant from Firestore
 */
export async function deletePlantFromFirestore(plantId) {
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'plants', plantId));
      logFirebaseEvent('plant_deleted', { plantId });
      return true;
    } catch (err) {
      console.warn('Firestore deletePlant failed, using REST fallback:', err);
    }
  }

  return await deleteDocumentViaRest('plants', plantId);
}

/**
 * Save or update Nursery in Firestore with mobile-app compatibility
 */
export async function saveNurseryToFirestore(nursery) {
  const norm = normalizeNursery(nursery);
  const isApproved = norm.status === 'approved';
  const isTrialActive = Boolean(norm.isTrialActive);
  const isSuspended = norm.status === 'suspended' || norm.status === 'rejected' || Boolean(norm.isSuspended);

  const payload = sanitizePayload({
    ...norm,
    nurseryName: norm.name,
    name: norm.name,
    ownerName: norm.ownerName,
    owner: norm.ownerName,
    district: norm.city,
    city: norm.city,
    phone: norm.phone,
    ownerPhone: norm.phone,
    whatsapp: norm.whatsapp,
    address: norm.address,
    nurseryImages: norm.nurseryImages,
    image: norm.image,
    status: norm.status,
    verified: isApproved,
    isVerified: isApproved,
    isActive: !isSuspended && (isApproved || isTrialActive),
    isSuspended: isSuspended,
    trialStartDate: norm.trialStartDate,
    trialEndDate: norm.trialEndDate,
    trialDaysTotal: norm.trialDaysTotal || 3,
    trialExtensionsCount: norm.trialExtensionsCount || 0,
    trialDaysLeft: norm.trialDaysLeft,
    isTrialActive: isTrialActive,
    isTrialExpired: Boolean(norm.isTrialExpired),
    isSubscribed: Boolean(norm.isSubscribed),
    subscriptionPlan: norm.subscriptionPlan || (isApproved ? 'paid_annual' : 'free_trial'),
    subscriptionStatus: norm.subscriptionStatus || (isApproved ? 'active' : (isTrialActive ? 'trial' : 'expired')),
    isSubscriptionApproved: Boolean(norm.isSubscriptionApproved),
    facilities: norm.facilities,
    specialties: norm.facilities,
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'nurseries', norm.id), payload, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveNursery failed, using REST fallback:', err);
    }
  }

  return await saveDocumentViaRest('nurseries', norm.id, payload);
}

/**
 * Update nursery status (Approve, Reject, Revoke, Suspend, Unsuspend, Notes) in Firestore
 */
export async function updateNurseryInFirestore(nurseryId, updates) {
  let status = (updates.status || 'pending').toLowerCase();
  if (status === 'active') status = 'approved';

  const isApproved = status === 'approved' && !updates.isSuspended;
  const isSuspended = status === 'suspended' || Boolean(updates.isSuspended && status !== 'approved');
  const isRejected = status === 'rejected';
  const isRevoked = status === 'revoked';

  const normalizedStatus = isSuspended ? 'suspended' : (isApproved ? 'approved' : (isRejected ? 'rejected' : (isRevoked ? 'revoked' : 'pending')));

  const payload = sanitizePayload({
    ...updates,
    status: normalizedStatus,
    verified: isApproved,
    isVerified: isApproved,
    isActive: isApproved,
    isSuspended: isSuspended || isRejected,
    // Subscription & Trial details
    isSubscribed: isApproved ? true : (updates.isSubscribed !== undefined ? updates.isSubscribed : undefined),
    isSubscriptionApproved: isApproved ? true : (updates.isSubscriptionApproved !== undefined ? updates.isSubscriptionApproved : undefined),
    subscriptionStatus: isApproved ? 'active' : (isSuspended ? 'suspended' : (isRevoked ? 'revoked' : (isRejected ? 'rejected' : (updates.subscriptionStatus || 'expired')))),
    subscriptionPlan: updates.subscriptionPlan || (isApproved ? 'paid_annual' : undefined),
    isTrialActive: isApproved ? false : (updates.isTrialActive !== undefined ? updates.isTrialActive : undefined),
    rejectionReason: isRejected ? (updates.rejectionReason || 'Information verification failed') : (updates.rejectionReason || ''),
    rejectionNotes: isRejected ? (updates.rejectionNotes || updates.rejectionReason || 'Information verification failed') : (updates.rejectionNotes || ''),
    suspensionReason: isSuspended ? (updates.suspensionReason || 'Account suspended by administrator') : (updates.suspensionReason || ''),
    revocationReason: isRevoked ? (updates.revocationReason || 'Approval revoked by administrator') : (updates.revocationReason || ''),
    approvedAt: isApproved ? (updates.approvedDate || updates.approvedAt || new Date().toISOString()) : (isSuspended || isRejected || isRevoked ? null : updates.approvedAt),
    approvedBy: isApproved ? (updates.approvedBy || 'admin') : undefined,
    suspendedAt: isSuspended ? (updates.suspendedAt || new Date().toISOString()) : (isApproved ? null : updates.suspendedAt),
    suspendedBy: isSuspended ? (updates.suspendedBy || 'admin') : undefined,
    revokedAt: isRevoked ? (updates.revokedAt || new Date().toISOString()) : (isApproved ? null : updates.revokedAt),
    revokedBy: isRevoked ? (updates.revokedBy || 'admin') : undefined,
    rejectedAt: isRejected ? (updates.rejectedAt || new Date().toISOString()) : (isApproved ? null : updates.rejectedAt),
    rejectedBy: isRejected ? (updates.rejectedBy || 'admin') : undefined,
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'nurseries', nurseryId), payload, { merge: true });
      logFirebaseEvent('nursery_status_updated', { nurseryId, status: normalizedStatus });
      return true;
    } catch (err) {
      console.warn('Firestore updateNursery failed, using REST fallback:', err);
    }
  }

  return await saveDocumentViaRest('nurseries', nurseryId, payload);
}

/**
 * Save customer inquiry / lead to Firestore
 */
export async function addLeadToFirestore(lead) {
  const norm = normalizeLead(lead);
  const payload = sanitizePayload({
    ...norm,
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'leads', norm.id), payload, { merge: true });
      return true;
    } catch (err) {}
  }

  return await saveDocumentViaRest('leads', norm.id, payload);
}

/**
 * Update lead status in Firestore
 */
export async function updateLeadStatusInFirestore(leadId, status) {
  const payload = sanitizePayload({
    status,
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'leads', leadId), payload, { merge: true });
      return true;
    } catch (err) {}
  }

  return await saveDocumentViaRest('leads', leadId, payload);
}

/**
 * Delete customer lead / inquiry from Firestore
 */
export async function deleteLeadFromFirestore(leadId) {
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'leads', leadId));
      return true;
    } catch (err) {}
  }
  return await deleteDocumentViaRest('leads', leadId);
}

/**
 * Delete nursery from Firestore (Modular SDK + direct REST fallback)
 */
export async function deleteNurseryFromFirestore(nurseryId) {
  let sdkDeleted = false;
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'nurseries', nurseryId));
      logFirebaseEvent('nursery_deleted', { nurseryId });
      sdkDeleted = true;
    } catch (err) {
      console.warn('Firestore deleteNursery SDK error, trying REST fallback:', err);
    }
  }

  // Direct REST API DELETE request to ensure Firestore document is deleted on Google Cloud backend
  const restDeleted = await deleteDocumentViaRest('nurseries', nurseryId);
  return sdkDeleted || restDeleted;
}

/**
 * Save Order to Firestore with full mobile app field synchronization
 */
export async function saveOrderToFirestore(order) {
  const norm = normalizeOrder(order);
  const isApproved = norm.status === 'confirmed' || norm.status === 'dispatched' || norm.status === 'delivered';
  const isCancelled = norm.status === 'cancelled';

  const payload = sanitizePayload({
    ...norm,
    status: norm.status,
    orderStatus: norm.status,
    isApproved: isApproved,
    isConfirmed: isApproved,
    confirmedAt: norm.status === 'confirmed' ? (norm.confirmedAt || new Date().toISOString()) : norm.confirmedAt,
    approvedAt: norm.status === 'confirmed' ? (norm.approvedAt || new Date().toISOString()) : norm.approvedAt,
    dispatchedAt: norm.status === 'dispatched' ? (norm.dispatchedAt || new Date().toISOString()) : norm.dispatchedAt,
    deliveredAt: norm.status === 'delivered' ? (norm.deliveredAt || new Date().toISOString()) : norm.deliveredAt,
    cancelledAt: isCancelled ? (norm.cancelledAt || new Date().toISOString()) : norm.cancelledAt,
    rejectionReason: norm.rejectionReason || '',
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'orders', norm.id), payload, { merge: true });
      logFirebaseEvent('order_status_updated', { orderId: norm.id, status: norm.status });
      return true;
    } catch (err) {
      console.warn('Firestore setDoc failed for order, trying REST:', err);
    }
  }
  return await saveDocumentViaRest('orders', norm.id, payload);
}

/**
 * Delete Order from Firestore
 */
export async function deleteOrderFromFirestore(orderId) {
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'orders', orderId));
      return true;
    } catch (err) {}
  }
  return await deleteDocumentViaRest('orders', orderId);
}

/**
 * Save Customer to Firestore
 */
export async function saveCustomerToFirestore(customer) {
  const payload = sanitizePayload({
    ...customer,
    updatedAt: new Date().toISOString()
  });
  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'customers', customer.id), payload, { merge: true });
      return true;
    } catch (err) {}
  }
  return await saveDocumentViaRest('customers', customer.id, payload);
}

/**
 * Delete Customer from Firestore
 */
export async function deleteCustomerFromFirestore(customerId) {
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'customers', customerId));
      return true;
    } catch (err) {}
  }
  return await deleteDocumentViaRest('customers', customerId);
}

/**
 * Save City Hub to Firestore
 */
export async function saveCityToFirestore(city) {
  const payload = sanitizePayload({
    ...city,
    updatedAt: new Date().toISOString()
  });
  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'cities', city.id), payload, { merge: true });
      return true;
    } catch (err) {}
  }
  return await saveDocumentViaRest('cities', city.id, payload);
}

/**
 * Delete City Hub from Firestore
 */
export async function deleteCityFromFirestore(cityId) {
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'cities', cityId));
      return true;
    } catch (err) {}
  }
  return await deleteDocumentViaRest('cities', cityId);
}

/**
 * Upload an image (File, Blob, or base64 dataUrl) to Firebase Storage (Blaze Plan)
 * Bucket: treebazzar-f4780.firebasestorage.app
 * Returns a permanent, publicly readable download URL
 */
export async function uploadImageToFirebaseStorage(fileOrDataUrl, pathPrefix = 'ads') {
  if (!fileOrDataUrl) return '';

  // Already a remote URL
  if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
    return fileOrDataUrl;
  }

  let blob = null;
  let contentType = 'image/jpeg';
  let ext = 'jpg';

  try {
    if (fileOrDataUrl instanceof Blob || (typeof File !== 'undefined' && fileOrDataUrl instanceof File)) {
      blob = fileOrDataUrl;
      contentType = fileOrDataUrl.type || 'image/jpeg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';
    } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      const match = fileOrDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        console.warn('Invalid data URL supplied to uploadImageToFirebaseStorage');
        return fileOrDataUrl;
      }
      contentType = match[1] || 'image/jpeg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';

      const byteCharacters = atob(match[2]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: contentType });
    } else {
      return fileOrDataUrl;
    }

    const filename = `${pathPrefix}/ad_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const bucket = firebaseConfig.storageBucket || 'treebazzar-f4780.firebasestorage.app';

    // 1. Direct Firebase Storage REST Upload (Fast, open CORS, works everywhere)
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(filename)}&key=${firebaseConfig.apiKey}`;
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType
      },
      body: blob
    });

    if (res.ok) {
      const data = await res.json();
      const token = data.downloadTokens || (data.metadata && data.metadata.firebaseStorageDownloadTokens) || '';
      const publicUrl = token
        ? `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`
        : `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filename)}?alt=media`;
      console.log('🌲 Firebase Storage: Ad photo uploaded successfully:', publicUrl);
      return publicUrl;
    } else {
      const errText = await res.text();
      console.warn('Firebase Storage upload REST response not OK:', res.status, errText);
    }
  } catch (err) {
    console.warn('Firebase Storage upload error:', err);
  }

  // Fallback: return input if upload failed
  return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
}

/**
 * Save Advertisement to Firestore (stores Firebase Storage photo URL)
 */
export async function saveAdToFirestore(ad) {
  let photo = ad.photo || ad.imageUrl || ad.image || ad.photoUrl || '';

  // If photo is still a base64 data URL, upload to Firebase Storage first
  if (photo && photo.startsWith('data:')) {
    try {
      const storageUrl = await uploadImageToFirebaseStorage(photo, 'ads');
      if (storageUrl && storageUrl.startsWith('http')) {
        photo = storageUrl;
      }
    } catch (upErr) {
      console.warn('Auto upload to storage failed during saveAdToFirestore:', upErr);
    }
  }

  const normalized = normalizeAd({
    ...ad,
    photo,
    imageUrl: photo,
    image: photo,
    photoUrl: photo,
    updatedAt: new Date().toISOString()
  }, ad.id);

  const payload = sanitizePayload(normalized);
  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'ads', normalized.id), payload, { merge: true });
      return true;
    } catch (err) {
      console.warn('setDoc failed for ad, attempting REST:', err);
    }
  }
  return await saveDocumentViaRest('ads', normalized.id, payload);
}

/**
 * Delete Advertisement from Firestore
 */
export async function deleteAdFromFirestore(adId) {
  const fb = await getFirebase();
  if (fb && fb.db && fb.deleteDoc) {
    try {
      await fb.deleteDoc(fb.doc(fb.db, 'ads', adId));
      return true;
    } catch (err) {}
  }
  return await deleteDocumentViaRest('ads', adId);
}


/**
 * Delete all dummy data from Firestore collections
 */
export async function clearAllFirestoreCollections() {
  const fb = await getFirebase();
  let deletedCount = 0;
  const collectionsToClear = ['nurseries', 'plants', 'leads', 'orders', 'customers'];

  if (fb && fb.db && fb.getDocs && fb.deleteDoc) {
    for (const colName of collectionsToClear) {
      try {
        const snap = await fb.getDocs(fb.collection(fb.db, colName));
        for (const d of snap.docs) {
          await fb.deleteDoc(fb.doc(fb.db, colName, d.id));
          deletedCount++;
        }
      } catch (e) {
        console.warn(`Error clearing collection ${colName}:`, e);
      }
    }
  }

  logFirebaseEvent('database_cleared', { deletedCount });
  return deletedCount;
}
