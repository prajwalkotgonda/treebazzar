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
 * Normalize Nursery data from either mobile app schema or web admin schema
 */
export function normalizeNursery(data, id) {
  if (!data) return null;
  const docId = id || data.id || `nursery-${Date.now()}`;
  const name = data.name || data.nurseryName || 'Unnamed Nursery';
  const nameMr = data.nameMr || name;
  const ownerName = data.ownerName || data.owner || 'Nursery Owner';
  const city = data.city || data.district || 'Sangli';
  const district = data.district || city;
  const phone = data.phone || data.ownerPhone || '';
  const whatsapp = data.whatsapp || phone.replace(/\D/g, '') || '';
  const address = data.address || `${city}, Maharashtra`;
  const image = data.image || data.nurseryImages?.[0] || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80';
  const status = data.status || 'pending';
  const verified = status === 'approved' || Boolean(data.verified);
  const establishedYear = data.establishedYear || 2020;
  const totalPlants = Number(data.totalPlants) || 0;
  const facilities = data.facilities || data.specialties || ['Home Delivery', 'Grafted Varieties'];
  const specialties = facilities;
  const location = data.location || { latitude: 16.85, longitude: 74.58 };

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
    status,
    verified,
    establishedYear,
    totalPlants,
    facilities,
    specialties,
    location,
    createdAt: data.createdAt || new Date().toISOString(),
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
  const nameMr = data.nameMr || nameEn;
  const botanicalName = data.botanicalName || 'Botanical var. sp.';
  const category = data.category || 'Fruit Trees';
  const categoryMr = data.categoryMr || category;
  const nurseryId = data.nurseryId || 'nur-01';
  const nurseryName = data.nurseryName || 'Master Nursery';
  const priceMin = Number(data.priceMin) || Number(data.price) || 150;
  const priceMax = Number(data.priceMax) || Number(data.price) || priceMin;
  const photoUrl = data.photoUrl || data.images?.[0] || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';
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
  const city = data.city || data.customerCity || data.district || 'Sangli';
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
      return raw;
    });
  } catch (e) {
    console.warn(`REST fallback fetch failed for ${collectionName}:`, e);
    return [];
  }
}

/**
 * Fetch and sync all collections (nurseries, plants, leads) from Firestore
 */
export async function syncAllData() {
  const [nurseries, plants, leads] = await Promise.all([
    fetchCollectionFromFirestore('nurseries'),
    fetchCollectionFromFirestore('plants'),
    fetchCollectionFromFirestore('leads')
  ]);
  return { nurseries, plants, leads };
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
      const [appMod, firestoreMod, analyticsMod] = await Promise.all([
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js'),
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js'),
        import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js').catch(() => null),
      ]);

      appInstance = appMod.getApps().length > 0 ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      dbInstance = firestoreMod.getFirestore(appInstance);

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
    verified: norm.status === 'approved',
    isSuspended: norm.status === 'rejected',
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
 * Update nursery status (Approve, Reject, Notes) in Firestore
 */
export async function updateNurseryInFirestore(nurseryId, updates) {
  const payload = sanitizePayload({
    ...updates,
    status: updates.status,
    verified: updates.status === 'approved',
    isSuspended: updates.status === 'rejected',
    approvedAt: updates.status === 'approved' ? (updates.approvedDate || new Date().toISOString()) : undefined,
    rejectedAt: updates.status === 'rejected' ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString()
  });

  const fb = await getFirebase();
  if (fb && fb.db && fb.setDoc) {
    try {
      await fb.setDoc(fb.doc(fb.db, 'nurseries', nurseryId), payload, { merge: true });
      logFirebaseEvent('nursery_status_updated', { nurseryId, status: updates.status });
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
 * Delete all dummy data from Firestore collections
 */
export async function clearAllFirestoreCollections() {
  const fb = await getFirebase();
  let deletedCount = 0;
  const collectionsToClear = ['nurseries', 'plants', 'leads'];

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
