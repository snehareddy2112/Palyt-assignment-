import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Filter,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { StockItem } from '../domain/types';
import { useKitchen } from '../context/KitchenContext';
import { IngredientModal } from './IngredientModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const InventoryView: React.FC = () => {
  const {
    stock,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    getIngredientStockStatus,
    getIngredientDependentDishes,
    handleQuickAdjustStock,
  } = useKitchen();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;

    const status = getIngredientStockStatus(item);
    const dependentDishes = getIngredientDependentDishes(item.name);

    if (filterStatus === 'LOW_STOCK') {
      return status === 'LOW_STOCK' || status === 'OUT_OF_STOCK';
    }
    if (filterStatus === 'HEALTHY') {
      return status === 'HEALTHY';
    }
    if (filterStatus === 'UNUSED') {
      return dependentDishes.length === 0;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: StockItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Kitchen Inventory</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredStock.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">Manage your ingredients and par levels</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] active:scale-[0.98] rounded-xl transition-all shadow-md shadow-orange-500/25 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients (e.g. Paneer, Chicken, Rice)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'LOW_STOCK', 'HEALTHY', 'UNUSED'] as const).map((filter) => {
            const isActive = filterStatus === filter;
            const labels = {
              ALL: 'All',
              LOW_STOCK: 'Below Par',
              HEALTHY: 'Healthy',
              UNUSED: 'Unused',
            };
            return (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="flex-1 overflow-x-auto -mx-5 px-5">
        {filteredStock.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No ingredients match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search term or adjusting filter options</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3 pl-2 font-semibold">Ingredient</th>
                <th className="pb-3 font-semibold">Stock</th>
                <th className="pb-3 font-semibold">Par Level</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 pr-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.map((item) => {
                const status = getIngredientStockStatus(item);
                const dependentDishes = getIngredientDependentDishes(item.name);
                const isUsedInRecipes = dependentDishes.length > 0;
                const isBelowPar = item.qty < item.par;
                const isOutOfStock = item.qty <= 0;

                return (
                  <tr
                    key={item.name}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Ingredient Name */}
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{item.name}</span>
                        {isBelowPar && (
                          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" title="Stock below par!" />
                        )}
                        {isUsedInRecipes && (
                          <span
                            className="hidden lg:inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-500"
                            title={`Used in: ${dependentDishes.join(', ')}`}
                          >
                            {dependentDishes.length} recipe{dependentDishes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 font-mono font-bold text-xs sm:text-sm">
                      <span className={`${
                        isOutOfStock
                          ? 'text-[#FF4D6D]'
                          : isBelowPar
                          ? 'text-[#F59E0B]'
                          : 'text-[#10B981]'
                      }`}>
                        {item.qty} {item.unit}
                      </span>
                    </td>

                    {/* Par Level */}
                    <td className="py-3 font-mono text-xs text-slate-500">
                      {item.par} {item.unit}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      {status === 'OUT_OF_STOCK' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          Out of Stock
                        </span>
                      )}
                      {status === 'LOW_STOCK' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Below Par
                        </span>
                      )}
                      {status === 'HEALTHY' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick increment / decrement buttons */}
                        <button
                          onClick={() => handleQuickAdjustStock(item.name, item.unit === 'g' || item.unit === 'ml' ? 50 : 0.5)}
                          title={`Quick restock + ${item.unit === 'g' || item.unit === 'ml' ? '50' : '0.5'} ${item.unit}`}
                          className="p-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjustStock(item.name, -(item.unit === 'g' || item.unit === 'ml' ? 50 : 0.5))}
                          title={`Quick deduct - ${item.unit === 'g' || item.unit === 'ml' ? '50' : '0.5'} ${item.unit}`}
                          className="p-1 rounded bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer ml-1"
                          title="Edit ingredient quantity and par"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingName(item.name)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isUsedInRecipes
                              ? 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={isUsedInRecipes ? 'Used in recipes (Protected)' : 'Delete ingredient'}
                        >
                          {isUsedInRecipes ? <ShieldAlert className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <IngredientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialItem={editingItem}
      />

      <DeleteConfirmModal
        isOpen={!!deletingName}
        onClose={() => setDeletingName(null)}
        ingredientName={deletingName}
      />
    </div>
  );
};
