import React from 'react';
import { PackageCheck, AlertTriangle, Utensils, Layers } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export const DashboardMetrics: React.FC = () => {
  const { stock, dishesAvailability } = useKitchen();

  const totalIngredients = stock.length;
  const lowStockCount = stock.filter((i) => i.qty < i.par).length;
  const availableDishesCount = dishesAvailability.filter((d) => d.isAvailable).length;
  const totalDishes = dishesAvailability.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
      {/* Total Inventory */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Ingredients</p>
          <p className="text-xl font-bold text-white mt-0.5">{totalIngredients}</p>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className={`border rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm transition-colors ${
        lowStockCount > 0
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-slate-900/70 border-slate-800/80'
      }`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          lowStockCount > 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800 border border-slate-700'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Below Par Level</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-xl font-bold ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">items critical</span>
          </div>
        </div>
      </div>

      {/* Menu Availability */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <PackageCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Available Dishes</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-emerald-400">{availableDishesCount}</span>
            <span className="text-[11px] text-slate-400 font-normal">of {totalDishes} active</span>
          </div>
        </div>
      </div>

      {/* Menu Health */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <Utensils className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Menu Readiness</p>
          <p className="text-xl font-bold text-white mt-0.5">
            {Math.round((availableDishesCount / (totalDishes || 1)) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};
