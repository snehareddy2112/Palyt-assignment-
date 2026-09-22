import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import initialStockData from '../data/stock.json';
import initialRecipesData from '../data/recipes.json';
import { StockItem, Recipe, DishAvailability, OrderResult, StockStatus } from '../domain/types';
import { addStockItem, updateStockItem, removeStockItem, calculateStockStatus } from '../domain/inventory';
import { getDishesAvailability, canDeleteIngredient, getDependentRecipes } from '../domain/recipe';
import { placeOrder } from '../domain/order';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  deductions?: Array<{ name: string; amountDeducted: number; unit: string; previousQty: number; newQty: number }>;
}

interface KitchenContextType {
  stock: StockItem[];
  recipes: Recipe[];
  dishesAvailability: DishAvailability[];
  toasts: ToastMessage[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: 'ALL' | 'LOW_STOCK' | 'HEALTHY' | 'UNUSED';
  setFilterStatus: (filter: 'ALL' | 'LOW_STOCK' | 'HEALTHY' | 'UNUSED') => void;
  // Actions
  handleAddIngredient: (item: StockItem) => { success: boolean; error?: string };
  handleUpdateIngredient: (targetName: string, updates: Partial<StockItem>) => { success: boolean; error?: string };
  handleDeleteIngredient: (targetName: string) => { success: boolean; error?: string };
  handlePlaceOrder: (dishName: string) => OrderResult;
  handleQuickAdjustStock: (ingredientName: string, delta: number) => void;
  handleResetData: () => void;
  dismissToast: (id: string) => void;
  // Helper queries
  getIngredientStockStatus: (item: StockItem) => StockStatus;
  getIngredientDependentDishes: (ingredientName: string) => string[];
  checkCanDelete: (ingredientName: string) => { canDelete: boolean; dependentDishes: string[]; reason?: string };
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('palyt_stock');
    return saved ? JSON.parse(saved) : (initialStockData as StockItem[]);
  });

  const [recipes] = useState<Recipe[]>(initialRecipesData as Recipe[]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOW_STOCK' | 'HEALTHY' | 'UNUSED'>('ALL');

  useEffect(() => {
    localStorage.setItem('palyt_stock', JSON.stringify(stock));
  }, [stock]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Derive menu dish availability reactively from current stock
  const dishesAvailability = useMemo(() => {
    return getDishesAvailability(recipes, stock);
  }, [recipes, stock]);

  const handleAddIngredient = (item: StockItem) => {
    try {
      const updated = addStockItem(stock, item);
      setStock(updated);
      addToast({
        type: 'success',
        title: 'Ingredient Added',
        message: `"${item.name}" (${item.qty} ${item.unit}) was added to inventory.`,
      });
      return { success: true };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Add',
        message: err.message,
      });
      return { success: false, error: err.message };
    }
  };

  const handleUpdateIngredient = (targetName: string, updates: Partial<StockItem>) => {
    try {
      const updated = updateStockItem(stock, targetName, updates);
      setStock(updated);
      addToast({
        type: 'success',
        title: 'Ingredient Updated',
        message: `Updated stock specifications for "${updates.name || targetName}".`,
      });
      return { success: true };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Update',
        message: err.message,
      });
      return { success: false, error: err.message };
    }
  };

  const handleDeleteIngredient = (targetName: string) => {
    const check = canDeleteIngredient(targetName, recipes);
    if (!check.canDelete) {
      addToast({
        type: 'error',
        title: 'Deletion Blocked',
        message: check.reason || 'This ingredient is used in active recipes and cannot be deleted.',
      });
      return { success: false, error: check.reason };
    }

    try {
      const updated = removeStockItem(stock, targetName);
      setStock(updated);
      addToast({
        type: 'info',
        title: 'Ingredient Deleted',
        message: `"${targetName}" was safely removed from inventory.`,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const handlePlaceOrder = (dishName: string): OrderResult => {
    const result = placeOrder(stock, recipes, dishName);
    if (result.success && result.updatedStock) {
      setStock(result.updatedStock);
      addToast({
        type: 'success',
        title: `Order Placed: ${dishName}`,
        message: result.message,
        deductions: result.deductions,
      });
    } else {
      addToast({
        type: 'error',
        title: `Order Failed: ${dishName}`,
        message: result.message,
      });
    }
    return result;
  };

  const handleQuickAdjustStock = (ingredientName: string, delta: number) => {
    const item = stock.find((i) => i.name.toLowerCase() === ingredientName.toLowerCase());
    if (!item) return;
    const newQty = Math.max(0, Math.round((item.qty + delta) * 1000) / 1000);
    handleUpdateIngredient(item.name, { qty: newQty });
  };

  const handleResetData = () => {
    setStock(initialStockData as StockItem[]);
    localStorage.removeItem('palyt_stock');
    addToast({
      type: 'info',
      title: 'Reset Completed',
      message: 'Stock has been reset to original assignment JSON values.',
    });
  };

  const getIngredientStockStatus = (item: StockItem) => {
    return calculateStockStatus(item.qty, item.par);
  };

  const getIngredientDependentDishes = (name: string) => {
    return getDependentRecipes(name, recipes);
  };

  const checkCanDelete = (name: string) => {
    return canDeleteIngredient(name, recipes);
  };

  return (
    <KitchenContext.Provider
      value={{
        stock,
        recipes,
        dishesAvailability,
        toasts,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        handleAddIngredient,
        handleUpdateIngredient,
        handleDeleteIngredient,
        handlePlaceOrder,
        handleQuickAdjustStock,
        handleResetData,
        dismissToast,
        getIngredientStockStatus,
        getIngredientDependentDishes,
        checkCanDelete,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};
