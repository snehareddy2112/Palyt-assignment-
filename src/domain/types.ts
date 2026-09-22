export type SupportedUnit = 'kg' | 'g' | 'l' | 'L' | 'ml' | 'count' | 'pcs';

export type UnitDimension = 'mass' | 'volume' | 'count';

export interface StockItem {
  id?: string;
  name: string;
  qty: number;
  unit: string;
  par: number;
}

export interface RecipeIngredient {
  name: string;
  qty: number;
  unit: string;
}

export interface Recipe {
  dish: string;
  price: number;
  ingredients: RecipeIngredient[];
}

export type StockStatus = 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface IngredientAvailability {
  name: string;
  requiredQty: number;
  requiredUnit: string;
  stockQty: number;
  stockUnit: string;
  stockPar: number;
  isAvailableAccordingToPar: boolean;
  hasEnoughPhysicalStock: boolean;
  reason?: string;
}

export interface DishAvailability {
  dish: string;
  price: number;
  isAvailable: boolean;
  ingredientsStatus: IngredientAvailability[];
  failingIngredients: string[];
}

export interface OrderDeduction {
  name: string;
  amountDeducted: number;
  unit: string;
  previousQty: number;
  newQty: number;
}

export interface OrderResult {
  success: boolean;
  message: string;
  dishName: string;
  updatedStock?: StockItem[];
  deductions?: OrderDeduction[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
