import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { StockItem } from '../domain/types';
import { validateIngredientInput } from '../domain/inventory';
import { useKitchen } from '../context/KitchenContext';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: StockItem | null;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({ isOpen, onClose, initialItem }) => {
  const { stock, handleAddIngredient, handleUpdateIngredient } = useKitchen();

  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('kg');
  const [par, setPar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialItem;

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setQty(initialItem.qty.toString());
      setUnit(initialItem.unit);
      setPar(initialItem.par.toString());
      setErrors({});
    } else {
      setName('');
      setQty('');
      setUnit('kg');
      setPar('');
      setErrors({});
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inputData = {
      name,
      qty,
      unit,
      par,
    };

    const validation = validateIngredientInput(
      inputData,
      stock,
      isEditing ? initialItem?.name : undefined
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const payload: StockItem = {
      name: name.trim(),
      qty: parseFloat(qty),
      unit: unit.trim(),
      par: parseFloat(par),
    };

    let res;
    if (isEditing && initialItem) {
      res = handleUpdateIngredient(initialItem.name, payload);
    } else {
      res = handleAddIngredient(payload);
    }

    if (res.success) {
      onClose();
    } else if (res.error) {
      setErrors({ form: res.error });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-slate-900 mb-1">
          {isEditing ? `Edit "${initialItem?.name}"` : 'Add New Ingredient'}
        </h3>
        <p className="text-xs text-slate-400 mb-5 font-medium">
          {isEditing
            ? 'Adjust inventory quantity, unit of measure, or minimum par buffer.'
            : 'Register a new stock ingredient into the kitchen inventory database.'}
        </p>

        {errors.form && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ingredient Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Cardamom, Refined Flour, Paneer"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 transition-all ${
                errors.name ? 'border-rose-400' : 'border-slate-200 focus:border-[#FF7A00]'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Quantity</label>
              <input
                type="number"
                step="any"
                min="0"
                value={qty}
                onChange={(e) => {
                  setQty(e.target.value);
                  if (errors.qty) setErrors((prev) => ({ ...prev, qty: '' }));
                }}
                placeholder="e.g. 1.4 or 300"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 transition-all ${
                  errors.qty ? 'border-rose-400' : 'border-slate-200 focus:border-[#FF7A00]'
                }`}
              />
              {errors.qty && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.qty}</p>}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Storage Unit</label>
              <select
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all cursor-pointer"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="g">g (Grams)</option>
                <option value="ml">ml (Millilitres)</option>
                <option value="l">L (Litres)</option>
                <option value="count">count / pcs</option>
              </select>
              {errors.unit && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.unit}</p>}
            </div>
          </div>

          {/* Par Level */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Minimum Par Level</label>
              <span className="text-[11px] text-slate-400 font-medium">Safety trigger buffer</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={par}
                onChange={(e) => {
                  setPar(e.target.value);
                  if (errors.par) setErrors((prev) => ({ ...prev, par: '' }));
                }}
                placeholder="e.g. 0.5 or 250"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 transition-all ${
                  errors.par ? 'border-rose-400' : 'border-slate-200 focus:border-[#FF7A00]'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">{unit}</span>
            </div>
            {errors.par && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.par}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] rounded-xl transition-all shadow-md shadow-orange-500/25 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
