import React, { useState } from 'react';
import { CheckCircle2, XCircle, ShoppingBag, AlertCircle, Utensils } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

// Verified, reliable high-definition imagery matching each specific Indian culinary dish
const DISH_CONFIG: Record<string, { image: string; tag: string; description: string; fallbackGradient: string }> = {
  'Paneer Butter Masala': {
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    tag: 'Classic Gravy',
    description: 'Fresh paneer cubes simmered in a velvety spiced tomato, cashew & butter makhani sauce.',
    fallbackGradient: 'from-amber-600 to-orange-700',
  },
  'Shahi Paneer Korma': {
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    tag: 'Royal Korma',
    description: 'Tender cottage cheese cooked in a rich, fragrant cashew nut, cream & ghee reduction.',
    fallbackGradient: 'from-amber-500 to-yellow-700',
  },
  'Chicken Biryani': {
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tag: 'Dum Special',
    description: 'Long-grain aged basmati rice layered with marinated chicken, saffron, mint & whole garam masala.',
    fallbackGradient: 'from-orange-600 to-red-700',
  },
  'Veg Pulao': {
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    tag: 'Garden Rice',
    description: 'Fragrant basmati rice tossed with fresh green peas, onions, mint and whole cumin.',
    fallbackGradient: 'from-emerald-600 to-teal-700',
  },
  'Jeera Rice': {
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    tag: 'Cumin Tempered',
    description: 'Steamed premium basmati rice tempered in pure desi ghee with roasted cumin seeds.',
    fallbackGradient: 'from-yellow-600 to-amber-700',
  },
  'Butter Naan': {
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    tag: 'Tandoor Bread',
    description: 'Traditional leavened clay-oven flatbread brushed with rich melted dairy butter.',
    fallbackGradient: 'from-amber-700 to-stone-800',
  },
};

interface MenuViewProps {
  isHighlighted?: boolean;
}

export const MenuView: React.FC<MenuViewProps> = ({ isHighlighted }) => {
  const { recipes, dishesAvailability, handlePlaceOrder } = useKitchen();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (dishName: string) => {
    setImageErrors((prev) => ({ ...prev, [dishName]: true }));
  };

  return (
    <div
      id="section-menu"
      className={`bg-slate-900/85 border rounded-2xl p-5 shadow-lg transition-all duration-300 flex flex-col h-full ${
        isHighlighted ? 'border-[#FF7A00] ring-2 ring-[#FF7A00]/20' : 'border-slate-800/90'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>Diner Menu</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">Real-time availability based on kitchen stock</p>
        </div>

        <div className="text-[11px] font-semibold text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
          Rule: All Ingredients ≥ Par
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
        {recipes.map((recipe) => {
          const availability = dishesAvailability.find((d) => d.dish === recipe.dish);
          const isAvailable = availability ? availability.isAvailable : false;
          const config = DISH_CONFIG[recipe.dish] || {
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            tag: 'Chef Special',
            description: 'Delicious authentic preparation made fresh with quality kitchen ingredients.',
            fallbackGradient: 'from-orange-600 to-amber-800',
          };

          const hasImageError = imageErrors[recipe.dish];

          return (
            <div
              key={recipe.dish}
              className={`border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
                isAvailable
                  ? 'bg-slate-950/70 border-slate-800 hover:border-[#FF7A00]/50 hover:shadow-md shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-80'
              }`}
            >
              {/* Dish Image Thumbnail */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                {!hasImageError ? (
                  <img
                    src={config.image}
                    alt={recipe.dish}
                    onError={() => handleImageError(recipe.dish)}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isAvailable ? 'group-hover:scale-105' : 'grayscale-[50%] contrast-75 brightness-75'
                    }`}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-tr ${config.fallbackGradient} flex items-center justify-center`}>
                    <Utensils className="w-10 h-10 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Price & Tag */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm border border-orange-500/20">
                      {config.tag}
                    </span>
                    <p className="text-sm font-extrabold drop-shadow-sm mt-0.5 text-white truncate">{recipe.dish}</p>
                  </div>
                  <span className="font-black text-sm font-mono text-slate-950 bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] px-2.5 py-0.5 rounded-lg shadow-sm shrink-0">
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
                <div>
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    {config.description}
                  </p>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Recipe Ingredients ({recipe.ingredients.length} items):
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
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{ing.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{ing.qty}{ing.unit}</span>
                          {isFailing && <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />}
                        </span>
                      );
                    })}
                  </div>

                  {/* Failing ingredients alert */}
                  {!isAvailable && availability && availability.failingIngredients.length > 0 && (
                    <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Below Par / Missing:</strong> {availability.failingIngredients.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Button */}
                <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2 mt-auto">
                  <span className="text-[10px] text-slate-400 font-medium">1 Portion</span>
                  <button
                    onClick={() => handlePlaceOrder(recipe.dish)}
                    disabled={!isAvailable}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      isAvailable
                        ? 'bg-gradient-to-r from-[#FF7A00] to-[#F59E0B] hover:brightness-110 text-slate-950 font-black shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed shadow-none'
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
