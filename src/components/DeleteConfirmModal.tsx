import React from 'react';
import { X, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientName: string | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, ingredientName }) => {
  const { handleDeleteIngredient, checkCanDelete } = useKitchen();

  if (!isOpen || !ingredientName) return null;

  const check = checkCanDelete(ingredientName);
  const isBlocked = !check.canDelete;

  const onConfirm = () => {
    if (isBlocked) return;
    handleDeleteIngredient(ingredientName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isBlocked ? 'bg-amber-500/20 text-[#F59E0B] border border-amber-500/30' : 'bg-rose-500/20 text-[#FF4D6D] border border-rose-500/30'
          }`}>
            {isBlocked ? <ShieldAlert className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isBlocked ? 'Cannot Delete Ingredient' : 'Confirm Deletion'}
            </h3>
            <p className="text-xs text-slate-400 font-mono font-medium">{ingredientName}</p>
          </div>
        </div>

        {isBlocked ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <p className="font-bold text-amber-300 mb-1">Recipe Dependency Protection Active</p>
              <p>
                Deleting <strong className="text-white font-bold">"{ingredientName}"</strong> is disallowed because it is actively required by the following menu recipes:
              </p>
              <ul className="mt-2.5 space-y-1 list-disc list-inside text-amber-100 font-semibold">
                {check.dependentDishes.map((dish, i) => (
                  <li key={i}>{dish}</li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-amber-300/80 font-medium">
                To remove this ingredient, first modify or remove the dishes that require it from the menu to maintain recipe integrity.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-bold">"{ingredientName}"</strong> from kitchen stock?
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Safety check passed: No active recipes depend on this ingredient.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#FF4D6D] hover:bg-[#E63956] rounded-xl transition-colors shadow-md shadow-rose-500/25 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Ingredient</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
