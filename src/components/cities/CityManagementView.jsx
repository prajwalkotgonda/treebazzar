import React, { useState } from 'react';
import { 
  MapPin, Plus, Edit2, Trash2, Store, AlertTriangle, 
  Check, X, Search, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CityManagementView({ 
  cities = [], 
  nurseries = [], 
  onAddCity, 
  onEditCity, 
  onDeleteCity 
}) {
  const { t, lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [deletingCity, setDeletingCity] = useState(null);

  // Form states
  const [cityNameEn, setCityNameEn] = useState('');
  const [cityNameMr, setCityNameMr] = useState('');
  const [formError, setFormError] = useState('');

  // Open Add Modal
  const handleOpenAdd = () => {
    setCityNameEn('');
    setCityNameMr('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (city) => {
    setCityNameEn(city.nameEn);
    setCityNameMr(city.nameMr || '');
    setFormError('');
    setEditingCity(city);
  };

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const cleanEn = cityNameEn.trim();
    const cleanMr = cityNameMr.trim();

    if (!cleanEn) {
      setFormError(lang === 'mr' ? 'कृपया शहराचे इंग्रजी नाव टाका' : 'Please enter English city name');
      return;
    }

    // Check duplicate
    const exists = cities.some(c => c.nameEn.toLowerCase() === cleanEn.toLowerCase());
    if (exists) {
      setFormError(lang === 'mr' ? 'हे शहर आधीच अस्तित्वात आहे' : 'This city already exists');
      return;
    }

    if (onAddCity) {
      onAddCity({
        nameEn: cleanEn,
        nameMr: cleanMr || cleanEn
      });
    }

    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCity) return;

    const cleanEn = cityNameEn.trim();
    const cleanMr = cityNameMr.trim();

    if (!cleanEn) {
      setFormError(lang === 'mr' ? 'कृपया शहराचे इंग्रजी नाव टाका' : 'Please enter English city name');
      return;
    }

    // Check duplicate with another city
    const exists = cities.some(c => c.id !== editingCity.id && c.nameEn.toLowerCase() === cleanEn.toLowerCase());
    if (exists) {
      setFormError(lang === 'mr' ? 'या नावाचे शहर आधीच अस्तित्वात आहे' : 'Another city with this name already exists');
      return;
    }

    if (onEditCity) {
      onEditCity(editingCity.id, {
        nameEn: cleanEn,
        nameMr: cleanMr || cleanEn
      });
    }

    setEditingCity(null);
  };

  // Submit Delete
  const handleConfirmDelete = () => {
    if (!deletingCity) return;
    if (onDeleteCity) {
      onDeleteCity(deletingCity.id);
    }
    setDeletingCity(null);
  };

  // Filter cities by search query
  const filteredCities = cities.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (c.nameEn || '').toLowerCase().includes(q) || (c.nameMr || '').toLowerCase().includes(q);
  });

  // Calculate nursery counts per city
  const getNurseryCount = (cityNameEn) => {
    return nurseries.filter(n => (n.city || '').toLowerCase() === cityNameEn.toLowerCase()).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#1E5631]">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'mr' ? 'शहरे व प्रादेशिक हब व्यवस्थापन' : 'Cities & Regional Hubs'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            {lang === 'mr' 
              ? 'येथे नवीन शहरे जोडा, नावे सुधारा किंवा हटवा. हे बदल थेट लँडिंग पेजवरील सर्च ड्रॉपडाउन आणि फिल्टर्समध्ये लगेच अपडेट होतील.' 
              : 'Manage active city hubs. Any added, edited, or deleted cities will instantly reflect on the front landing page search dropdown and filters.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? 'नवीन शहर जोडा' : 'Add New City'}</span>
        </button>
      </div>

      {/* Search & Overview Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={lang === 'mr' ? 'शहर शोधा (उदा. सांगली, सातारा...)' : 'Search city by name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2E7D32] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold self-end sm:self-center">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            {lang === 'mr' ? `एकूण शहरे: ${cities.length}` : `Total Cities: ${cities.length}`}
          </span>
        </div>
      </div>

      {/* Cities Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">#</th>
                  <th className="py-3.5 px-4 sm:px-6">{lang === 'mr' ? 'शहर (इंग्रजी)' : 'City (English)'}</th>
                  <th className="py-3.5 px-4 sm:px-6">{lang === 'mr' ? 'शहर (मराठी)' : 'City (Marathi)'}</th>
                  <th className="py-3.5 px-4 sm:px-6">{lang === 'mr' ? 'सक्रिय रोपवाटिका' : 'Active Nurseries'}</th>
                  <th className="py-3.5 px-4 sm:px-6">{lang === 'mr' ? 'स्थिती' : 'Status'}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">{lang === 'mr' ? 'कृती' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCities.map((city, idx) => {
                  const count = getNurseryCount(city.nameEn);
                  return (
                    <tr key={city.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                          <span>{city.nameEn}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                        {city.nameMr || '—'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#1E5631] font-bold text-[11px] border border-emerald-200/70">
                          <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
                          <span>{count} {lang === 'mr' ? 'रोपवाटिका' : 'Nurseries'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {lang === 'mr' ? 'सक्रिय हब' : 'Active Hub'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(city)}
                            className="p-1.5 text-slate-500 hover:text-[#1E5631] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'mr' ? 'संपादित करा' : 'Edit City'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCity(city)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'mr' ? 'हटवा' : 'Delete City'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-slate-600">
              {lang === 'mr' ? 'कोणतेही शहर आढळले नाही' : 'No cities found'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {searchQuery 
                ? (lang === 'mr' ? 'दुसरा शोध शब्द वापरून पहा.' : 'Try a different search query.') 
                : (lang === 'mr' ? 'नवीन शहर जोडण्यासाठी वर दिलेल्या बटणावर क्लिक करा.' : 'Click "Add New City" button above to get started.')}
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ADD CITY MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#1E5631]">
                  <Plus className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {lang === 'mr' ? 'नवीन शहर जोडा' : 'Add New City'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'mr' ? 'शहराचे नाव (इंग्रजी) *' : 'City Name (English) *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Satara, Pune, Solapur"
                  value={cityNameEn}
                  onChange={(e) => setCityNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2E7D32]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'mr' ? 'शहराचे नाव (मराठी)' : 'City Name (Marathi)'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. सातारा, पुणे, सोलापूर"
                  value={cityNameMr}
                  onChange={(e) => setCityNameMr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2E7D32]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {lang === 'mr' ? 'शहर जोडा' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT CITY MODAL */}
      {/* ============================================================== */}
      {editingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#1E5631]">
                  <Edit2 className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {lang === 'mr' ? 'शहर संपादित करा' : 'Edit City'}
                </h3>
              </div>
              <button
                onClick={() => setEditingCity(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'mr' ? 'शहराचे नाव (इंग्रजी) *' : 'City Name (English) *'}
                </label>
                <input
                  type="text"
                  value={cityNameEn}
                  onChange={(e) => setCityNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2E7D32]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'mr' ? 'शहराचे नाव (मराठी)' : 'City Name (Marathi)'}
                </label>
                <input
                  type="text"
                  value={cityNameMr}
                  onChange={(e) => setCityNameMr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2E7D32]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCity(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {lang === 'mr' ? 'बदल सेव्ह करा' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deletingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {lang === 'mr' ? 'शहर हटवायचे आहे का?' : 'Delete City Hub?'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {deletingCity.nameEn} ({deletingCity.nameMr || deletingCity.nameEn})
                </p>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'mr' 
                  ? `तुम्ही खात्रीने "${deletingCity.nameMr || deletingCity.nameEn}" हे शहर हटवू इच्छिता का? हे शहर लँडिंग पेजवरील सर्च ड्रॉपडाउन आणि फिल्टर्समधून देखील काढून टाकले जाईल.` 
                  : `Are you sure you want to remove "${deletingCity.nameEn}"? It will also be removed from the front page search dropdown and filters.`}
              </p>

              {getNurseryCount(deletingCity.nameEn) > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    {lang === 'mr' 
                      ? `सूचना: या शहरामध्ये ${getNurseryCount(deletingCity.nameEn)} सक्रिय रोपवाटिका नोंदणीकृत आहेत.` 
                      : `Warning: ${getNurseryCount(deletingCity.nameEn)} nurseries are currently registered under this city.`}
                  </span>
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCity(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {lang === 'mr' ? 'होय, शहर हटवा' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
