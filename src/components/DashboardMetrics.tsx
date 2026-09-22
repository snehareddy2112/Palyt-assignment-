import React from 'react';
import { Package, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export const DashboardMetrics: React.FC = () => {
  const { stock, dishesAvailability } = useKitchen();

  const totalIngredients = stock.length;
  const lowStockCount = stock.filter((i) => i.qty < i.par).length;
  const availableDishesCount = dishesAvailability.filter((d) => d.isAvailable).length;
  const totalDishes = dishesAvailability.length;
  const readinessPercent = Math.round((availableDishesCount / (totalDishes || 1)) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Ingredients */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ingredients</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-white">{totalIngredients}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
              +2 active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Items */}
      <div className={`bg-slate-900/80 border rounded-2xl p-4 shadow-sm transition-all flex items-center gap-3.5 ${
        lowStockCount > 0 ? 'border-amber-500/30 bg-amber-950/15 ring-1 ring-amber-500/20' : 'border-slate-800/90'
      }`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          lowStockCount > 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50 border border-slate-700/50'
        }`}>
          <AlertCircle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-[#FF4D6D]' : 'text-slate-400'}`} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`text-2xl font-black ${lowStockCount > 0 ? 'text-[#FF4D6D]' : 'text-white'}`}>
              {lowStockCount}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              lowStockCount > 0 ? 'text-[#FF4D6D] bg-rose-500/10 border border-rose-500/20' : 'text-slate-400 bg-slate-800'
            }`}>
              {lowStockCount > 0 ? 'Needs attention' : 'Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Available Dishes */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Dishes</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-white">{availableDishesCount} / {totalDishes}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
              {readinessPercent}% ready
            </span>
          </div>
        </div>
      </div>

      {/* 4. Menu Readiness */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menu Readiness</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-white">{readinessPercent}%</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
              {readinessPercent >= 80 ? 'Looking good!' : 'Check stock'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
