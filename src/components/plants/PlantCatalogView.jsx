import React, { useState, useMemo } from 'react';
import { 
  Sprout, Search, Plus, Edit2, Trash2, Tag, Check, X, 
  ExternalLink, Building2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PLANT_CATEGORIES, FALLBACK_PLANT_IMAGE } from '../../data/mockData';
import AddPlantModal from '../common/AddPlantModal';
import EditPlantModal from '../common/EditPlantModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

export default function PlantCatalogView({ 
  plants = [], 
  nurseries = [],
  onAddPlant,
  onUpdatePlant,
  onDeletePlant,
  onToggleStock,
  onOpenAddModal,
  isAddModalOpen,
  onCloseAddModal,
  searchQuery = ''
}) {
  const { t, lang } = useLanguage();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all'); // 'all', 'in_stock', 'out_of_stock'

  // Edit & Delete Modal State
  const [editingPlant, setEditingPlant] = useState(null);
  const [deletingPlant, setDeletingPlant] = useState(null);

  // Filter plants based on search, category, and stock
  const filteredPlants = useMemo(() => {
    const q = (localSearch || searchQuery).toLowerCase().trim();

    return plants.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (selectedStock !== 'all' && p.stockStatus !== selectedStock) {
        return false;
      }

      // Search by name (English or Marathi), botanical name, nursery
      if (q) {
        const nameEn = (p.nameEn || p.name || '').toLowerCase();
        const nameMr = (p.nameMr || '').toLowerCase();
        const bot = (p.botanicalName || '').toLowerCase();
        const nursery = (p.nurseryName || '').toLowerCase();

        return nameEn.includes(q) || nameMr.includes(q) || bot.includes(q) || nursery.includes(q);
      }

      return true;
    });
  }, [plants, selectedCategory, selectedStock, localSearch, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Title & Add Plant Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#1E5631]" />
            {t('plantCatalogTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('plantCatalogSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btnAddNewPlant')}</span>
        </button>
      </div>

      {/* Filter Toolbar (Section 6 Requirement) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchPlantPlaceholder')}
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32]"
          />
        </div>

        {/* Category & Stock Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32] bg-white text-slate-700"
          >
            <option value="all">{t('filterAllCategories')}</option>
            {PLANT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {lang === 'mr' ? (
                  cat === 'Fruit Trees' ? t('catFruitTrees') :
                  cat === 'Indoor Plants' ? t('catIndoorPlants') :
                  cat === 'Flowering Plants' ? t('catFloweringPlants') :
                  cat === 'Farm Trees' ? t('catFarmTrees') : t('catVegetables')
                ) : cat}
              </option>
            ))}
          </select>

          {/* Stock Dropdown */}
          <select
            value={selectedStock}
            onChange={e => setSelectedStock(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2E7D32] bg-white text-slate-700"
          >
            <option value="all">{t('filterAllStock')}</option>
            <option value="in_stock">{t('filterInStock')}</option>
            <option value="out_of_stock">{t('filterOutOfStock')}</option>
          </select>

          {(selectedCategory !== 'all' || selectedStock !== 'all' || localSearch) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStock('all');
                setLocalSearch('');
              }}
              className="text-xs text-rose-600 font-semibold px-2 py-1 hover:underline cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          )}

        </div>

      </div>

      {/* Plants Table (Section 6 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('thPhoto')}</th>
                <th className="py-3 px-4">{t('thPlantName')}</th>
                <th className="py-3 px-4">{t('thCategory')}</th>
                <th className="py-3 px-4">{t('thNursery')}</th>
                <th className="py-3 px-4">{t('thPrice')}</th>
                <th className="py-3 px-4">{t('thStock')}</th>
                <th className="py-3 px-4 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlants.length > 0 ? (
                filteredPlants.map(plant => {
                  const isInStock = plant.stockStatus === 'in_stock';

                  return (
                    <tr key={plant.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Photo */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={plant.photoUrl || FALLBACK_PLANT_IMAGE}
                            alt={plant.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = FALLBACK_PLANT_IMAGE; }}
                          />
                        </div>
                      </td>

                      {/* English & Marathi Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {plant.nameEn}
                        </div>
                        <div className="font-medium text-slate-600 text-[11px] mt-0.5">
                          {plant.nameMr}
                        </div>
                        {plant.botanicalName && (
                          <div className="text-[10px] text-slate-400 italic">
                            {plant.botanicalName}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          <Tag className="w-3 h-3 text-[#2E7D32]" />
                          {lang === 'mr' ? (
                            plant.category === 'Fruit Trees' ? t('catFruitTrees') :
                            plant.category === 'Indoor Plants' ? t('catIndoorPlants') :
                            plant.category === 'Flowering Plants' ? t('catFloweringPlants') :
                            plant.category === 'Farm Trees' ? t('catFarmTrees') : t('catVegetables')
                          ) : plant.category}
                        </span>
                      </td>

                      {/* Nursery Name */}
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{plant.nurseryName}</span>
                        </div>
                      </td>

                      {/* Price Range */}
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        ₹{plant.priceMin} - ₹{plant.priceMax}
                      </td>

                      {/* Stock Status Badge & Quick Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleStock(plant.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            isInStock 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                          title={t('toggleStock')}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                          {isInStock ? t('stockIn') : t('stockOut')}
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          
                          {/* Edit Action Button */}
                          <button
                            onClick={() => setEditingPlant(plant)}
                            className="p-1.5 text-slate-600 hover:text-[#1E5631] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={t('btnEdit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Action Button */}
                          <button
                            onClick={() => setDeletingPlant(plant)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                            title={t('btnDelete') || 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Sprout className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold">{t('noResultsFound')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('noResultsDesc')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plant Modal */}
      {isAddModalOpen && (
        <AddPlantModal
          isOpen={isAddModalOpen}
          onClose={onCloseAddModal}
          onAddPlant={onAddPlant}
          nurseries={nurseries}
        />
      )}

      {/* Edit Plant Modal */}
      {editingPlant && (
        <EditPlantModal
          plant={editingPlant}
          isOpen={Boolean(editingPlant)}
          onClose={() => setEditingPlant(null)}
          onUpdatePlant={onUpdatePlant}
          nurseries={nurseries}
        />
      )}

      {/* Delete Plant Modal */}
      {deletingPlant && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingPlant)}
          onClose={() => setDeletingPlant(null)}
          onConfirm={() => onDeletePlant && onDeletePlant(deletingPlant.id)}
          title={lang === 'mr' ? 'वनस्पती हटवा' : 'Delete Plant from Catalog'}
          itemName={deletingPlant.nameEn || deletingPlant.name}
          message={lang === 'mr'
            ? `"${deletingPlant.nameMr || deletingPlant.nameEn}" ही वनस्पती कॅटलॉगमधून कायमस्वरूपी काढून टाकली जाईल.`
            : `"${deletingPlant.nameEn}" will be permanently removed from the catalog.`}
        />
      )}

    </div>
  );
}
