import React from 'react';
import { CheckCircle2, XCircle, ShoppingBag, AlertCircle } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

// High quality food photos for realistic restaurant menu experience
const DISH_IMAGES: Record<string, { image: string; tag: string }> = {
  'Paneer Butter Masala': {
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    tag: 'Rich & creamy classic',
  },
  'Shahi Paneer Korma': {
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    tag: 'Royal cashew gravy',
  },
  'Chicken Biryani': {
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    tag: 'Aromatic & flavorful',
  },
  'Veg Pulao': {
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    tag: 'Fragrant garden blend',
  },
  'Jeera Rice': {
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    tag: 'Cumin tempered rice',
  },
  'Butter Naan': {
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    tag: 'Tandoor baked bread',
  },
};

export const MenuView: React.FC = () => {
  const { recipes, dishesAvailability, handlePlaceOrder } = useKitchen();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Diner Menu</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">Real-time availability based on kitchen stock</p>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Rule: All Ingredients ≥ Par
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
        {recipes.map((recipe) => {
          const availability = dishesAvailability.find((d) => d.dish === recipe.dish);
          const isAvailable = availability ? availability.isAvailable : false;
          const meta = DISH_IMAGES[recipe.dish] || {
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
            tag: 'Kitchen Special',
          };

          return (
            <div
              key={recipe.dish}
              className={`border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
                isAvailable
                  ? 'bg-white border-slate-200 hover:border-[#6366F1]/40 hover:shadow-md shadow-sm'
                  : 'bg-slate-50/60 border-slate-200/80 opacity-90'
              }`}
            >
              {/* Dish Image Thumbnail */}
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={meta.image}
                  alt={recipe.dish}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isAvailable ? 'group-hover:scale-105' : 'grayscale-[40%] contrast-75'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Price & Tag on image */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {meta.tag}
                    </span>
                    <p className="text-sm font-bold drop-shadow-sm mt-0.5">{recipe.dish}</p>
                  </div>
                  <span className="font-extrabold text-sm font-mono text-white bg-[#FF7A00] px-2 py-0.5 rounded-lg shadow-sm">
                    ₹{recipe.price}
                  </span>
                </div>

                {/* Availability Badge */}
                <div className="absolute top-2.5 right-2.5">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-md">
                      <XCircle className="w-3 h-3" />
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                {/* Ingredients summary */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Recipe Breakdown ({recipe.ingredients.length} items):
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {recipe.ingredients.map((ing) => {
                      const ingStatus = availability?.ingredientsStatus.find((s) => s.name === ing.name);
                      const isFailing = !ingStatus?.isAvailableAccordingToPar || !ingStatus?.hasEnoughPhysicalStock;

                      return (
                        <span
                          key={ing.name}
                          title={ingStatus?.reason || `Stock is sufficient (${ingStatus?.stockQty} ${ingStatus?.stockUnit})`}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                            isFailing
                              ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{ing.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{ing.qty}{ing.unit}</span>
                          {isFailing && <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />}
                        </span>
                      );
                    })}
                  </div>

                  {/* Unavailable warning callout */}
                  {!isAvailable && availability && availability.failingIngredients.length > 0 && (
                    <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[11px] flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Below Par:</strong> {availability.failingIngredients.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <span className="text-[10px] text-slate-400 font-medium">1 Portion</span>
                  <button
                    onClick={() => handlePlaceOrder(recipe.dish)}
                    disabled={!isAvailable}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      isAvailable
                        ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isAvailable ? 'Order Dish' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
