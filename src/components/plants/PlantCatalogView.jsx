import React, { useState, useMemo } from 'react';
import { 
  Sprout, Search, Filter, Plus, CheckCircle2, AlertTriangle, 
  Trash2, RefreshCw, Eye, Tag, Store, DollarSign, X, Check,
  Leaf, Info, SearchX, Sparkles, RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { fuzzyFilter } from '../../utils/fuzzySearch';

export default function PlantCatalogView({ 
  plants = [], 
  nurseries = [], 
  onOpenAddModal, 
  onToggleStock, 
  onDeletePlant,
  onShowToast
}) {
  const { t, lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [selectedNursery, setSelectedNursery] = useState('all');
  const [inspectingPlant, setInspectingPlant] = useState(null);

  const categories = [
    { id: 'all', labelEn: 'All Categories', labelMr: 'सर्व प्रकार' },
    { id: 'Fruit Trees', labelEn: 'Fruit Trees', labelMr: 'फळझाडे' },
    { id: 'Indoor', labelEn: 'Indoor Plants', labelMr: 'घरातील झाडे' },
    { id: 'Flowers', labelEn: 'Flowers & Garden', labelMr: 'फुलझाडे' },
    { id: 'Farm Trees', labelEn: 'Farm & Forestry Trees', labelMr: 'शेती झाडे' },
    { id: 'Vegetables', labelEn: 'Vegetables', labelMr: 'भाजीपाला' },
  ];

  // 1. First apply Category, Stock, and Nursery dropdown filters
  const categoryFilteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      // Category filter
      if (selectedCategory !== 'all' && plant.category !== selectedCategory) {
        return false;
      }
      // Stock status filter
      if (selectedStock === 'in_stock' && plant.stockStatus !== 'in_stock') return false;
      if (selectedStock === 'out_of_stock' && plant.stockStatus !== 'out_of_stock') return false;

      // Nursery filter
      if (selectedNursery !== 'all' && plant.nurseryId !== selectedNursery) return false;

      return true;
    });
  }, [plants, selectedCategory, selectedStock, selectedNursery]);

  // 2. Apply Fuzzy Search with Typo Tolerance
  const { results: filteredPlants, closestSuggestion } = useMemo(() => {
    return fuzzyFilter(categoryFilteredPlants, searchQuery, (plant) => [
      plant.nameEn,
      plant.nameMr,
      plant.botanicalName,
      plant.category,
      plant.categoryMr,
      plant.nurseryName,
      plant.descriptionEn,
      plant.descriptionMr
    ]);
  }, [categoryFilteredPlants, searchQuery]);

  // Detect if any items were matched via typo tolerance (not strict substring)
  const isTypoTolerantMatch = useMemo(() => {
    if (!searchQuery.trim() || filteredPlants.length === 0) return false;
    const q = searchQuery.toLowerCase().trim();
    // If none of the matched plants strictly contain the substring, it was a typo-tolerant match!
    const hasExactSubstring = filteredPlants.some(p => 
      p.nameEn?.toLowerCase().includes(q) ||
      p.nameMr?.includes(q) ||
      p.botanicalName?.toLowerCase().includes(q)
    );
    return !hasExactSubstring;
  }, [searchQuery, filteredPlants]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStock('all');
    setSelectedNursery('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Add Plant Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#1E5631]" />
            {t('catalogTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('catalogSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>{t('btnAddPlant')}</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all' 
            ? plants.length 
            : plants.filter(p => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#1E5631] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{lang === 'mr' ? cat.labelMr : cat.labelEn}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Stock Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search with Typo Tolerance Indicator */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlantPlaceholder')}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#F8FAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stock Filter */}
        <div className="relative">
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#F8FAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all text-slate-700"
          >
            <option value="all">{t('allStock')}</option>
            <option value="in_stock">{t('stockInStock')}</option>
            <option value="out_of_stock">{t('stockOutOfStock')}</option>
          </select>
        </div>

        {/* Source Nursery Filter */}
        <div className="relative">
          <select
            value={selectedNursery}
            onChange={(e) => setSelectedNursery(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#F8FAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all text-slate-700"
          >
            <option value="all">{lang === 'mr' ? 'सर्व रोपवाटिका' : 'All Nurseries'}</option>
            {nurseries.map((n) => (
              <option key={n.id} value={n.id}>
                {lang === 'mr' && n.nameMr ? n.nameMr : (n.name || n.nurseryName || 'Nursery')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Typo Tolerance Notice Banner when spelling mistake was corrected */}
      {isTypoTolerantMatch && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>{lang === 'mr' ? 'स्पेलिंग जुळवणी:' : 'Spelling Match:'}</b> {t('searchTypoNotice')} (<b>"{searchQuery}"</b>)
            </span>
          </div>
          <span className="font-semibold text-amber-800">
            {filteredPlants.length} {lang === 'mr' ? 'झाडे सापडली' : 'plants matched'}
          </span>
        </div>
      )}

      {/* Master Plant Table or "Not Found" State */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredPlants.length === 0 ? (
          /* PRODUCT NOT FOUND BANNER & EMPTY STATE */
          <div className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center mx-auto text-amber-700 mb-4 shadow-sm animate-in zoom-in-90">
              <SearchX className="w-10 h-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-3">
              {t('productNotFound')}
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {searchQuery ? (
                <>
                  {t('noResultsFor')} <span className="text-[#1E5631]">"{searchQuery}"</span>
                </>
              ) : (
                lang === 'mr' ? 'कोणतीही वनस्पती उपलब्ध नाही' : 'No plants match the selected criteria'
              )}
            </h3>

            {/* Did you mean suggestion if available */}
            {closestSuggestion && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-emerald-900 font-medium">{t('didYouMean')}</span>
                <button
                  onClick={() => setSearchQuery(closestSuggestion)}
                  className="font-bold text-[#1E5631] underline hover:text-[#2E7D32]"
                >
                  "{closestSuggestion}"
                </button>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              {t('searchTip')}
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  <span>{t('clearSearch')}</span>
                </button>
              )}

              {(selectedCategory !== 'all' || selectedStock !== 'all' || selectedNursery !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  {lang === 'mr' ? 'सर्व फिल्टर काढा' : 'Clear All Filters'}
                </button>
              )}

              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#184729] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>{t('btnAddPlant')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* TABLE WITH RESULTS */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t('tablePhoto')}</th>
                  <th className="py-3.5 px-4">{t('tablePlantName')}</th>
                  <th className="py-3.5 px-4">{t('tableCategory')}</th>
                  <th className="py-3.5 px-4">{t('tableNursery')}</th>
                  <th className="py-3.5 px-4">{t('tablePrice')}</th>
                  <th className="py-3.5 px-4">{t('tableStock')}</th>
                  <th className="py-3.5 px-4 text-right">{t('tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPlants.map((plant) => {
                  const isInStock = plant.stockStatus === 'in_stock';
                  const plantNamePrimary = lang === 'mr' && plant.nameMr ? plant.nameMr : plant.nameEn;
                  const plantNameSecondary = lang === 'mr' && plant.nameMr ? plant.nameEn : plant.nameMr;

                  return (
                    <tr 
                      key={plant.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${!isInStock ? 'bg-slate-50/40 opacity-80' : ''}`}
                    >
                      {/* Photo */}
                      <td className="py-3.5 px-4">
                        <div 
                          className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-xs group cursor-pointer bg-slate-100"
                          onClick={() => setInspectingPlant(plant)}
                        >
                          <img
                            src={plant.photoUrl || plant.images?.[0] || 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'}
                            alt={plant.nameEn || plant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {!isInStock && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                              <span className="text-[8px] font-black uppercase text-white tracking-tighter">
                                {lang === 'mr' ? 'संपला' : 'Out'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Plant Name (Bilingual) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-col">
                          <button
                            onClick={() => setInspectingPlant(plant)}
                            className="text-left font-bold text-slate-900 text-sm hover:text-[#1E5631] transition-colors"
                          >
                            {plantNamePrimary}
                          </button>
                          {plantNameSecondary && (
                            <span className="text-xs text-slate-500 font-medium">
                              {plantNameSecondary}
                            </span>
                          )}
                          {plant.botanicalName && (
                            <span className="text-[11px] text-emerald-700/80 italic font-serif mt-0.5">
                              {plant.botanicalName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          plant.category === 'Fruit Trees' ? 'bg-emerald-50 text-[#1E5631] border-emerald-200' :
                          plant.category === 'Indoor' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                          plant.category === 'Flowers' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          plant.category === 'Farm Trees' ? 'bg-green-50 text-green-900 border-green-300' :
                          'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {lang === 'mr' ? plant.categoryMr || plant.category : plant.category}
                        </span>
                      </td>

                      {/* Nursery Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-[160px] truncate" title={plant.nurseryName}>
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{plant.nurseryName || 'Local Nursery'}</span>
                        </div>
                      </td>

                      {/* Price Range */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-slate-900">
                          ₹{plant.priceMin ?? plant.price ?? 100} - ₹{plant.priceMax ?? plant.price ?? 150}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {plant.unit || t('perUnit')}
                        </span>
                      </td>

                      {/* Stock Status Pill & Quick Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleStock(plant.id)}
                          title={t('toggleStock')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                            isInStock
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-[#1E5631] border border-emerald-300/80'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300/80'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{isInStock ? t('stockInStock') : t('stockOutOfStock')}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Info */}
                          <button
                            onClick={() => setInspectingPlant(plant)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="View description & specs"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {/* Quick Toggle Stock */}
                          <button
                            onClick={() => onToggleStock(plant.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title={t('toggleStock')}
                          >
                            <RefreshCw className="w-4 h-4 text-[#2E7D32]" />
                          </button>

                          {/* Delete Variety */}
                          <button
                            onClick={() => onDeletePlant(plant.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Remove from catalog"
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
        )}
      </div>

      {/* Quick Plant Details Modal */}
      {inspectingPlant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative h-48 bg-slate-900">
              <img 
                src={inspectingPlant.photoUrl || 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'} 
                alt={inspectingPlant.nameEn} 
                className="w-full h-full object-cover" 
              />
              <button
                onClick={() => setInspectingPlant(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5631] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {inspectingPlant.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {lang === 'mr' && inspectingPlant.nameMr ? inspectingPlant.nameMr : inspectingPlant.nameEn}
                </h3>
                {inspectingPlant.botanicalName && (
                  <p className="text-xs text-slate-500 font-serif italic">
                    {inspectingPlant.botanicalName}
                  </p>
                )}
              </div>

              <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('tableNursery')}:</span>
                  <span className="font-bold text-slate-800">{inspectingPlant.nurseryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('tablePrice')}:</span>
                  <span className="font-black text-[#1E5631]">₹{inspectingPlant.priceMin} - ₹{inspectingPlant.priceMax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('unitType')}:</span>
                  <span className="font-semibold text-slate-700">{inspectingPlant.unit}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">
                  {lang === 'mr' ? 'वर्णन' : 'Description'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'mr' && inspectingPlant.descriptionMr ? inspectingPlant.descriptionMr : inspectingPlant.descriptionEn}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => onToggleStock(inspectingPlant.id)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
                >
                  {t('toggleStock')}
                </button>
                <button
                  onClick={() => setInspectingPlant(null)}
                  className="px-4 py-2 rounded-xl bg-[#1E5631] text-white text-xs font-bold hover:bg-[#184729] transition-colors"
                >
                  {t('closeModal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
