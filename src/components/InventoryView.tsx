import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { StockItem } from '../domain/types';
import { useKitchen } from '../context/KitchenContext';
import { IngredientModal } from './IngredientModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface InventoryViewProps {
  isHighlighted?: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ isHighlighted }) => {
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
    <div
      id="section-inventory"
      className={`bg-slate-900/85 border rounded-2xl p-5 shadow-lg transition-all duration-300 flex flex-col h-full ${
        isHighlighted ? 'border-[#FF7A00] ring-2 ring-[#FF7A00]/20' : 'border-slate-800/90'
      }`}
    >
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>Kitchen Inventory</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {filteredStock.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">Manage ingredients and safety par thresholds</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:brightness-110 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer shrink-0"
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
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/40 focus:border-[#FF7A00] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
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
                    ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
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
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No ingredients match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search term or adjusting filter options</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3 pl-2 font-semibold">Ingredient</th>
                <th className="pb-3 font-semibold">Stock</th>
                <th className="pb-3 font-semibold">Par Level</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 pr-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStock.map((item) => {
                const status = getIngredientStockStatus(item);
                const dependentDishes = getIngredientDependentDishes(item.name);
                const isUsedInRecipes = dependentDishes.length > 0;
                const isBelowPar = item.qty < item.par;
                const isOutOfStock = item.qty <= 0;

                return (
                  <tr
                    key={item.name}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{item.name}</span>
                        {isBelowPar && (
                          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" title="Stock below par!" />
                        )}
                        {isUsedInRecipes && (
                          <span
                            className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/60"
                            title={`Used in: ${dependentDishes.join(', ')}`}
                          >
                            {dependentDishes.length} recipe{dependentDishes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 font-mono font-black text-xs sm:text-sm">
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

                    <td className="py-3 font-mono text-xs text-slate-400">
                      {item.par} {item.unit}
                    </td>

                    <td className="py-3">
                      {status === 'OUT_OF_STOCK' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Out of Stock
                        </span>
                      )}
                      {status === 'LOW_STOCK' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Below Par
                        </span>
                      )}
                      {status === 'HEALTHY' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleQuickAdjustStock(item.name, item.unit === 'g' || item.unit === 'ml' ? 50 : 0.5)}
                          title={`Quick restock + ${item.unit === 'g' || item.unit === 'ml' ? '50' : '0.5'} ${item.unit}`}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjustStock(item.name, -(item.unit === 'g' || item.unit === 'ml' ? 50 : 0.5))}
                          title={`Quick deduct - ${item.unit === 'g' || item.unit === 'ml' ? '50' : '0.5'} ${item.unit}`}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer ml-1"
                          title="Edit ingredient quantity and par"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingName(item.name)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isUsedInRecipes
                              ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-950/20'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
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
