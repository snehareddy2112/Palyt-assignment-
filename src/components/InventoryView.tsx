import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ShieldAlert, Filter, ChevronUp, ChevronDown } from 'lucide-react';
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
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Kitchen Inventory</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
              {filteredStock.length} / {stock.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">Manage real-time stock balances and par levels</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients (e.g. Paneer, Chicken, Rice)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
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
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3 pl-2 font-medium">Ingredient</th>
                <th className="pb-3 font-medium">Stock / Par</th>
                <th className="pb-3 font-medium hidden md:table-cell">Usage in Menu</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 pr-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredStock.map((item) => {
                const status = getIngredientStockStatus(item);
                const dependentDishes = getIngredientDependentDishes(item.name);
                const isUsedInRecipes = dependentDishes.length > 0;
                const parRatio = item.par > 0 ? (item.qty / item.par) : 1;
                const fillPercent = Math.min(100, Math.round(parRatio * 100));

                const isBelowPar = item.qty < item.par;
                const isOutOfStock = item.qty <= 0;

                return (
                  <tr
                    key={item.name}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{item.name}</span>
                        {isBelowPar && (
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Stock is below par!" />
                        )}
                      </div>
                    </td>

                    {/* Stock & Par */}
                    <td className="py-3">
                      <div className="flex flex-col gap-1 max-w-[160px]">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            isOutOfStock ? 'text-rose-400' : isBelowPar ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.qty} {item.unit}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Par: {item.par} {item.unit}
                          </span>
                        </div>
                        {/* Progress bar vs par */}
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/60">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isBelowPar
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.max(5, Math.min(100, fillPercent))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Usage in Menu */}
                    <td className="py-3 hidden md:table-cell">
                      {isUsedInRecipes ? (
                        <div className="flex items-center gap-1 text-slate-300" title={dependentDishes.join(', ')}>
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[11px] font-medium">
                            {dependentDishes.length} dish{dependentDishes.length > 1 ? 'es' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-500 font-normal">
                          Unused (Safe to delete)
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      {status === 'OUT_OF_STOCK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          OUT OF STOCK
                        </span>
                      )}
                      {status === 'LOW_STOCK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          BELOW PAR
                        </span>
                      )}
                      {status === 'HEALTHY' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          HEALTHY
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick adjust buttons */}
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

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
                          title="Edit ingredient quantity and par"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingName(item.name)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isUsedInRecipes
                              ? 'bg-slate-900 text-slate-500 hover:text-amber-400 hover:bg-amber-950/20'
                              : 'bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
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
