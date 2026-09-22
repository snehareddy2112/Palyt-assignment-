import { StockItem, Recipe, OrderResult, OrderDeduction } from './types';
import { findIngredientByName, normalizeIngredientName } from './inventory';
import { convertQuantity, formatQuantityWithUnit, roundToPrecision } from './units';

/**
 * Atomically places an order for a dish, deducting the required ingredients from stock.
 *
 * Guarantees:
 * 1. Atomicity: All deductions are computed and validated upfront. If ANY ingredient is missing
 *    or has insufficient physical stock, zero deductions are made and a descriptive error is returned.
 * 2. Cross-Unit Accuracy: Converts recipe units (e.g. g, ml) into the ingredient's native storage unit (e.g. kg, L).
 * 3. Immutability: Returns a new stock array without mutating the original state.
 */
export function placeOrder(
  stock: StockItem[],
  recipes: Recipe[],
  dishName: string,
  portionCount: number = 1
): OrderResult {
  if (portionCount <= 0 || !Number.isInteger(portionCount)) {
    return {
      success: false,
      message: 'Portion count must be a positive integer.',
      dishName,
    };
  }

  // 1. Resolve Recipe
  const recipe = recipes.find(
    (r) => normalizeIngredientName(r.dish) === normalizeIngredientName(dishName)
  );

  if (!recipe) {
    return {
      success: false,
      message: `Dish "${dishName}" was not found in the menu recipes.`,
      dishName,
    };
  }

  // 2. Validate all ingredients and prepare atomic deductions
  const deductions: OrderDeduction[] = [];
  const updatedStockMap = new Map<string, StockItem>();

  // Clone current stock into map for lookup and update
  for (const item of stock) {
    updatedStockMap.set(normalizeIngredientName(item.name), { ...item });
  }

  for (const req of recipe.ingredients) {
    const stockItem = updatedStockMap.get(normalizeIngredientName(req.name));

    if (!stockItem) {
      return {
        success: false,
        message: `Cannot fulfill order: Required ingredient "${req.name}" is missing from kitchen inventory.`,
        dishName: recipe.dish,
      };
    }

    const totalRequiredRecipeQty = req.qty * portionCount;

    let deductionInStockUnit: number;
    try {
      deductionInStockUnit = convertQuantity(totalRequiredRecipeQty, req.unit, stockItem.unit);
    } catch (err: any) {
      return {
        success: false,
        message: `Cannot fulfill order: Unit conversion error for "${req.name}": ${err.message}`,
        dishName: recipe.dish,
      };
    }

    // Physical stock sufficiency check
    if (stockItem.qty < deductionInStockUnit) {
      const neededFormatted = formatQuantityWithUnit(deductionInStockUnit, stockItem.unit);
      const availableFormatted = formatQuantityWithUnit(stockItem.qty, stockItem.unit);
      return {
        success: false,
        message: `Insufficient stock for "${stockItem.name}". Needed: ${neededFormatted}, Available: ${availableFormatted}.`,
        dishName: recipe.dish,
      };
    }

    const newQty = roundToPrecision(stockItem.qty - deductionInStockUnit, 3);

    // Record deduction
    deductions.push({
      name: stockItem.name,
      amountDeducted: roundToPrecision(deductionInStockUnit, 3),
      unit: stockItem.unit,
      previousQty: stockItem.qty,
      newQty,
    });

    // Update map
    updatedStockMap.set(normalizeIngredientName(stockItem.name), {
      ...stockItem,
      qty: newQty,
    });
  }

  // 3. Assemble updated stock preserving original ordering
  const updatedStock: StockItem[] = stock.map((origItem) => {
    const updated = updatedStockMap.get(normalizeIngredientName(origItem.name));
    return updated || origItem;
  });

  return {
    success: true,
    message: `Successfully prepared ${portionCount}x "${recipe.dish}". Inventory updated.`,
    dishName: recipe.dish,
    updatedStock,
    deductions,
  };
}
