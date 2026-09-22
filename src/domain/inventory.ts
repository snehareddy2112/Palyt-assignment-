import { StockItem, StockStatus, ValidationResult } from './types';
import { isSupportedUnit, roundToPrecision } from './units';

/**
 * Normalizes an ingredient name for case-insensitive matching.
 */
export function normalizeIngredientName(name: string): string {
  if (!name) return '';
  return name.trim().toLowerCase();
}

/**
 * Finds an ingredient in stock by name (case-insensitive).
 */
export function findIngredientByName(stock: StockItem[], name: string): StockItem | undefined {
  const norm = normalizeIngredientName(name);
  return stock.find((item) => normalizeIngredientName(item.name) === norm);
}

/**
 * Determines the stock health status based on par level and quantity.
 */
export function calculateStockStatus(qty: number, par: number): StockStatus {
  if (qty <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (qty < par) {
    return 'LOW_STOCK';
  }
  return 'HEALTHY';
}

/**
 * Validates stock input when adding or editing an ingredient.
 * Prevents nonsensical entries:
 * - Empty name
 * - Duplicate name (excluding originalName if editing)
 * - Negative quantity
 * - Negative par level
 * - Invalid or unsupported unit
 * - Malformed numbers
 */
export function validateIngredientInput(
  input: {
    name?: string;
    qty?: number | string;
    unit?: string;
    par?: number | string;
  },
  existingStock: StockItem[],
  originalName?: string
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Name validation
  const name = (input.name || '').trim();
  if (!name) {
    errors.name = 'Ingredient name is required and cannot be blank.';
  } else {
    const norm = normalizeIngredientName(name);
    const origNorm = originalName ? normalizeIngredientName(originalName) : null;
    const isDuplicate = existingStock.some(
      (item) => normalizeIngredientName(item.name) === norm && normalizeIngredientName(item.name) !== origNorm
    );
    if (isDuplicate) {
      errors.name = `An ingredient named "${name}" already exists in stock.`;
    }
  }

  // 2. Quantity validation
  if (input.qty === undefined || input.qty === null || input.qty === '') {
    errors.qty = 'Quantity is required.';
  } else {
    const numQty = typeof input.qty === 'string' ? parseFloat(input.qty) : input.qty;
    if (isNaN(numQty)) {
      errors.qty = 'Quantity must be a valid number.';
    } else if (numQty < 0) {
      errors.qty = 'Quantity cannot be negative.';
    }
  }

  // 3. Par level validation
  if (input.par === undefined || input.par === null || input.par === '') {
    errors.par = 'Par level is required.';
  } else {
    const numPar = typeof input.par === 'string' ? parseFloat(input.par) : input.par;
    if (isNaN(numPar)) {
      errors.par = 'Par level must be a valid number.';
    } else if (numPar < 0) {
      errors.par = 'Par level cannot be negative.';
    }
  }

  // 4. Unit validation
  const unit = (input.unit || '').trim();
  if (!unit) {
    errors.unit = 'Unit is required.';
  } else if (!isSupportedUnit(unit)) {
    errors.unit = `Invalid unit "${unit}". Supported units: kg, g, L, ml, count, pcs.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Pure function to add a stock item.
 */
export function addStockItem(stock: StockItem[], newItem: StockItem): StockItem[] {
  const validation = validateIngredientInput(newItem, stock);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  return [
    ...stock,
    {
      name: newItem.name.trim(),
      qty: roundToPrecision(Number(newItem.qty), 3),
      unit: newItem.unit.trim(),
      par: roundToPrecision(Number(newItem.par), 3),
    },
  ];
}

/**
 * Pure function to update a stock item.
 */
export function updateStockItem(
  stock: StockItem[],
  targetName: string,
  updates: Partial<StockItem>
): StockItem[] {
  const existing = findIngredientByName(stock, targetName);
  if (!existing) {
    throw new Error(`Ingredient "${targetName}" not found in stock.`);
  }

  const merged: StockItem = {
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    qty: updates.qty !== undefined ? roundToPrecision(Number(updates.qty), 3) : existing.qty,
    unit: updates.unit !== undefined ? updates.unit.trim() : existing.unit,
    par: updates.par !== undefined ? roundToPrecision(Number(updates.par), 3) : existing.par,
  };

  const validation = validateIngredientInput(merged, stock, targetName);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const targetNorm = normalizeIngredientName(targetName);
  return stock.map((item) => (normalizeIngredientName(item.name) === targetNorm ? merged : item));
}

/**
 * Pure function to remove a stock item by name.
 */
export function removeStockItem(stock: StockItem[], name: string): StockItem[] {
  const targetNorm = normalizeIngredientName(name);
  return stock.filter((item) => normalizeIngredientName(item.name) !== targetNorm);
}
