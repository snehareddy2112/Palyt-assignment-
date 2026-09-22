import { StockItem, Recipe, DishAvailability, IngredientAvailability } from './types';
import { findIngredientByName, normalizeIngredientName } from './inventory';
import { convertQuantity, toBaseUnit } from './units';

/**
 * Checks which recipes depend on a given ingredient name.
 */
export function getDependentRecipes(ingredientName: string, recipes: Recipe[]): string[] {
  const normTarget = normalizeIngredientName(ingredientName);
  return recipes
    .filter((recipe) =>
      recipe.ingredients.some((ing) => normalizeIngredientName(ing.name) === normTarget)
    )
    .map((recipe) => recipe.dish);
}

/**
 * Evaluates whether an ingredient can be deleted from stock.
 * Policy:
 * - If used by any recipe: BLOCKED to prevent broken recipes and corrupted domain state.
 * - If not used by any recipe: ALLOWED.
 */
export function canDeleteIngredient(
  ingredientName: string,
  recipes: Recipe[]
): { canDelete: boolean; dependentDishes: string[]; reason?: string } {
  const dependentDishes = getDependentRecipes(ingredientName, recipes);
  if (dependentDishes.length > 0) {
    return {
      canDelete: false,
      dependentDishes,
      reason: `Cannot delete "${ingredientName}" because it is required by ${dependentDishes.length} menu dish${
        dependentDishes.length > 1 ? 'es' : ''
      }: ${dependentDishes.join(', ')}.`,
    };
  }

  return {
    canDelete: true,
    dependentDishes: [],
  };
}

/**
 * Checks the availability of a single dish against current stock.
 * Exact rule:
 * A dish is unavailable when ANY ingredient it uses has fallen BELOW its par level (qty < par).
 * Additionally, if an ingredient is completely missing from stock, or has insufficient physical stock to cook 1 portion,
 * the dish is marked unavailable with an explicit reason.
 */
export function checkDishAvailability(dish: Recipe, stock: StockItem[]): DishAvailability {
  const failingIngredients: string[] = [];
  const ingredientsStatus: IngredientAvailability[] = [];

  for (const req of dish.ingredients) {
    const stockItem = findIngredientByName(stock, req.name);

    if (!stockItem) {
      // Missing from stock entirely
      failingIngredients.push(req.name);
      ingredientsStatus.push({
        name: req.name,
        requiredQty: req.qty,
        requiredUnit: req.unit,
        stockQty: 0,
        stockUnit: req.unit,
        stockPar: 0,
        isAvailableAccordingToPar: false,
        hasEnoughPhysicalStock: false,
        reason: `Not found in inventory (requires ${req.qty} ${req.unit})`,
      });
      continue;
    }

    // Convert stock qty and par to the recipe's unit to compare physical sufficiency safely
    let stockInRecipeUnits: number;
    let parInRecipeUnits: number;
    try {
      stockInRecipeUnits = convertQuantity(stockItem.qty, stockItem.unit, req.unit);
      parInRecipeUnits = convertQuantity(stockItem.par, stockItem.unit, req.unit);
    } catch {
      // Incompatible unit dimensions
      failingIngredients.push(req.name);
      ingredientsStatus.push({
        name: req.name,
        requiredQty: req.qty,
        requiredUnit: req.unit,
        stockQty: stockItem.qty,
        stockUnit: stockItem.unit,
        stockPar: stockItem.par,
        isAvailableAccordingToPar: false,
        hasEnoughPhysicalStock: false,
        reason: `Unit mismatch between recipe (${req.unit}) and stock (${stockItem.unit})`,
      });
      continue;
    }

    // Availability Rule: quantity >= par
    const isAboveOrAtPar = stockItem.qty >= stockItem.par;
    // Physical sufficiency check: has enough to cook at least 1 portion
    const hasEnoughPhysical = stockInRecipeUnits >= req.qty;

    const isSatisfied = isAboveOrAtPar && hasEnoughPhysical;

    let reason: string | undefined;
    if (!isAboveOrAtPar) {
      reason = `Stock (${stockItem.qty} ${stockItem.unit}) is below par (${stockItem.par} ${stockItem.unit})`;
    } else if (!hasEnoughPhysical) {
      reason = `Stock (${stockItem.qty} ${stockItem.unit}) is less than required portion (${req.qty} ${req.unit})`;
    }

    if (!isSatisfied) {
      failingIngredients.push(req.name);
    }

    ingredientsStatus.push({
      name: req.name,
      requiredQty: req.qty,
      requiredUnit: req.unit,
      stockQty: stockItem.qty,
      stockUnit: stockItem.unit,
      stockPar: stockItem.par,
      isAvailableAccordingToPar: isAboveOrAtPar,
      hasEnoughPhysicalStock: hasEnoughPhysical,
      reason,
    });
  }

  const isAvailable = failingIngredients.length === 0;

  return {
    dish: dish.dish,
    price: dish.price,
    isAvailable,
    ingredientsStatus,
    failingIngredients,
  };
}

/**
 * Batch evaluates all dishes in the menu against current stock.
 */
export function getDishesAvailability(recipes: Recipe[], stock: StockItem[]): DishAvailability[] {
  return recipes.map((recipe) => checkDishAvailability(recipe, stock));
}
