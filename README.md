# TreeBazzar Admin Dashboard Web Application 🌿
> **Local Nursery Marketplace & Plant Discovery Platform**  
> Serving Sangli, Miraj, Kolhapur & Western Maharashtra Horticultural Hubs

---

## 🚀 Live Development Server
The application is running and accessible at:
- **Local URL:** `http://localhost:3000/`

To start the dev server anytime:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

---

## 🧹 Clean State (No Dummy Data)
All dummy data has been removed:
- **Nurseries**: `0` (Clean list, ready for real registrations)
- **Plants Catalog**: `0` (Empty master catalog, ready for genuine variety additions)
- **Customer Leads**: `0` (Ready to record live WhatsApp clicks and calls)
- **Analytics & City Charts**: 100% dynamically computed from real data entries
- **Firebase Firestore**: Real-time synchronization with project `treebazzar-f4780`. Includes a **"Clear / Delete All Data"** button in the header popover to purge any remote documents if needed.

---

## 🔥 Firebase Cloud Integration (`treebazzar-f4780`)
Your Firebase project credentials have been configured:
- **Project ID:** `treebazzar-f4780`
- **Auth Domain:** `treebazzar-f4780.firebaseapp.com`
- **Storage Bucket:** `treebazzar-f4780.firebasestorage.app`
- **Measurement ID:** `G-82D6QJQ683`
- **App ID:** `1:1044474752430:web:44bfa2e5d66691a979ec3f`

### Cloud Services Activated:
1. **Firebase App & Modular SDK**: Initialized at startup via Google's official CDN modules.
2. **Google Analytics (`getAnalytics`)**: Tracks dashboard events, view changes, and administrative actions.
3. **Cloud Firestore Real-time Sync**:
   - `nurseries` collection: Real-time partner status (`approved`, `pending`, `rejected`), contact info, and licensing.
   - `plants` collection: Variety catalogs, stock status, and price ranges.
   - `leads` collection: Customer call and WhatsApp inquiries.

---

## 🎨 Tech Stack & Botanical Design
- **React 18+ (Pure JavaScript / `.jsx`)**: No TypeScript. Built using functional components and hooks (`useState`, `useEffect`, `useMemo`, `useContext`).
- **Tailwind CSS**: Custom botanical styling:
  - **Dark Green Primary:** `#1E5631`
  - **Accent Green:** `#2E7D32`
  - **Soft Background:** `#F8FAF9`
  - **Glassmorphism panels, pill badges, and soft animated alert badges**
- **Lucide React**: Clean modern SVG icons for botanical, agricultural, and administrative workflows.

---

## 📑 Core Modules & Views

### 1. Dashboard Overview (`OverviewView.jsx`)
- **5 Stat Summary Cards**: Total Nurseries, Pending Approvals, Total Plants Listed, Active Cities Coverage, Today's Customer Inquiries (all derived dynamically).
- **Quick Action Bar**: "Review Pending Nurseries", "Add Master Plant Variety", "Export Daily Leads CSV", and "View Customer Leads".
- **Dynamic Category Chart**: Real-time breakdown based on actual plants added to the catalog.
- **Real-Time Activity Stream**: Live event feed.
- **Regional Hub Distribution**: Real city distribution based on registered nurseries.

### 2. Nursery Approval & Management (`NurseryManagementView.jsx`)
- Filter Tabs: `All`, `Pending Approval`, `Approved & Active`, `Rejected / On-Hold`.
- Search & City filter.
- Actions: **Approve**, **Reject** (with reason modal), **View Details** (dossier modal with GPS link, phone, and WhatsApp).

### 3. Plants & Variety Catalog (`PlantCatalogView.jsx`)
- Table columns: Photo, Plant Name (Bilingual), Category, Source Nursery, Price Range (₹), Stock Status, Actions.
- Direct stock toggle in table and "Add New Master Plant" modal form.

### 4. Customer Leads & Inquiries (`CustomerLeadsView.jsx`)
- Live record of WhatsApp clicks and direct call inquiries with timestamps and cities.
- Quick direct action buttons to chat on WhatsApp or call customer.
- Export daily leads to CSV.

### 5. Top Navigation & Bilingual Localization (`LanguageContext.jsx`)
- **One-Click Language Switcher (English ↔ मराठी)**: Seamlessly toggles the entire dashboard UI.
- **Global Search Bar**: Autocomplete suggestions across nurseries and plants.
- **Firebase Status Indicator**: Real-time project status and cloud database controller.
