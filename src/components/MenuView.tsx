import React from 'react';
import { CheckCircle, XCircle, ShoppingCart, AlertCircle } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export const MenuView: React.FC = () => {
  const { recipes, dishesAvailability, handlePlaceOrder } = useKitchen();

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Diner Menu & Live Availability</span>
          </h2>
          <p className="text-xs text-slate-400">Order dishes to test live atomic stock deductions</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Rule: Available when all ingredients ≥ Par</span>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto pr-1">
        {recipes.map((recipe) => {
          const availability = dishesAvailability.find((d) => d.dish === recipe.dish);
          const isAvailable = availability ? availability.isAvailable : false;

          return (
            <div
              key={recipe.dish}
              className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 relative group ${
                isAvailable
                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700 shadow-md'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-85'
              }`}
            >
              {/* Dish Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{recipe.dish}</h3>
                    <p className="text-xs font-semibold text-amber-400 font-mono mt-0.5">₹{recipe.price}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        AVAILABLE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3 h-3" />
                        UNAVAILABLE
                      </span>
                    )}
                  </div>
                </div>

                {/* Recipe Ingredients Summary */}
                <div className="my-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Recipe Breakdown ({recipe.ingredients.length} items):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredients.map((ing) => {
                      const ingStatus = availability?.ingredientsStatus.find((s) => s.name === ing.name);
                      const isFailing = !ingStatus?.isAvailableAccordingToPar || !ingStatus?.hasEnoughPhysicalStock;

                      return (
                        <span
                          key={ing.name}
                          title={ingStatus?.reason || `Stock is sufficient (${ingStatus?.stockQty} ${ingStatus?.stockUnit})`}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            isFailing
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{ing.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{ing.qty}{ing.unit}</span>
                          {isFailing && <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Failing reason alert if unavailable */}
                {!isAvailable && availability && availability.failingIngredients.length > 0 && (
                  <div className="mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Missing/Low Stock:</strong> {availability.failingIngredients.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Button */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">1 portion prep</span>
                <button
                  onClick={() => handlePlaceOrder(recipe.dish)}
                  disabled={!isAvailable}
                  className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md cursor-pointer ${
                    isAvailable
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isAvailable ? 'Order Dish' : 'Unavailable'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
