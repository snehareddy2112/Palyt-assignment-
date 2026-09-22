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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Ingredients</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-slate-900">{totalIngredients}</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
              +2 active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Items */}
      <div className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5 ${
        lowStockCount > 0 ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
      }`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          lowStockCount > 0 ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50 border border-slate-100'
        }`}>
          <AlertCircle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-[#FF4D6D]' : 'text-slate-400'}`} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Low Stock Items</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-[#FF4D6D]' : 'text-slate-900'}`}>
              {lowStockCount}
            </span>
            <span className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
              lowStockCount > 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-50'
            }`}>
              {lowStockCount > 0 ? 'Needs attention' : 'Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Available Dishes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available Dishes</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-slate-900">{availableDishesCount} / {totalDishes}</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
              {readinessPercent}% available
            </span>
          </div>
        </div>
      </div>

      {/* 4. Menu Readiness */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Menu Readiness</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-slate-900">{readinessPercent}%</span>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
              {readinessPercent >= 80 ? 'Looking good!' : 'Attention required'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
