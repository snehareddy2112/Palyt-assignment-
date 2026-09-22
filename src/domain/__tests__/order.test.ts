import { describe, it, expect } from 'vitest';
import { placeOrder } from '../order';
import { checkDishAvailability } from '../recipe';
import { StockItem, Recipe } from '../types';

describe('Order Placement & Atomic Stock Deduction', () => {
  const initialStock: StockItem[] = [
    { name: 'Paneer', qty: 1.4, unit: 'kg', par: 0.5 },
    { name: 'Tomatoes', qty: 6, unit: 'kg', par: 1.5 },
    { name: 'Onions', qty: 8, unit: 'kg', par: 2 },
    { name: 'Cream', qty: 900, unit: 'ml', par: 300 },
    { name: 'Butter', qty: 900, unit: 'g', par: 200 },
    { name: 'Cashews', qty: 300, unit: 'g', par: 250 },
    { name: 'Garam Masala', qty: 250, unit: 'g', par: 50 },
    { name: 'Chicken', qty: 0, unit: 'kg', par: 1 },
  ];

  const recipes: Recipe[] = [
    {
      dish: 'Paneer Butter Masala',
      price: 320,
      ingredients: [
        { name: 'Paneer', qty: 180, unit: 'g' },
        { name: 'Tomatoes', qty: 150, unit: 'g' },
        { name: 'Onions', qty: 80, unit: 'g' },
        { name: 'Cream', qty: 40, unit: 'ml' },
        { name: 'Butter', qty: 30, unit: 'g' },
        { name: 'Cashews', qty: 15, unit: 'g' },
        { name: 'Garam Masala', qty: 5, unit: 'g' },
      ],
    },
    {
      dish: 'Shahi Paneer Korma',
      price: 360,
      ingredients: [
        { name: 'Paneer', qty: 100, unit: 'g' },
        { name: 'Cashews', qty: 40, unit: 'g' },
        { name: 'Cream', qty: 60, unit: 'ml' },
        { name: 'Onions', qty: 90, unit: 'g' },
        { name: 'Garam Masala', qty: 6, unit: 'g' },
      ],
    },
    {
      dish: 'Chicken Biryani',
      price: 420,
      ingredients: [
        { name: 'Chicken', qty: 250, unit: 'g' },
      ],
    },
  ];

  it('successfully orders Paneer Butter Masala and deducts ingredients with proper unit conversion', () => {
    const result = placeOrder(initialStock, recipes, 'Paneer Butter Masala');

    expect(result.success).toBe(true);
    expect(result.updatedStock).toBeDefined();

    const stockMap = new Map(result.updatedStock!.map((item) => [item.name, item]));

    // Paneer: 1.4 kg - 180 g (0.18 kg) = 1.22 kg
    expect(stockMap.get('Paneer')?.qty).toBe(1.22);
    expect(stockMap.get('Paneer')?.unit).toBe('kg');

    // Tomatoes: 6 kg - 150 g (0.15 kg) = 5.85 kg
    expect(stockMap.get('Tomatoes')?.qty).toBe(5.85);

    // Onions: 8 kg - 80 g (0.08 kg) = 7.92 kg
    expect(stockMap.get('Onions')?.qty).toBe(7.92);

    // Cream: 900 ml - 40 ml = 860 ml
    expect(stockMap.get('Cream')?.qty).toBe(860);

    // Butter: 900 g - 30 g = 870 g
    expect(stockMap.get('Butter')?.qty).toBe(870);

    // Cashews: 300 g - 15 g = 285 g
    expect(stockMap.get('Cashews')?.qty).toBe(285);

    // Garam Masala: 250 g - 5 g = 245 g
    expect(stockMap.get('Garam Masala')?.qty).toBe(245);
  });

  it('causes menu availability to dynamically recalculate and take dishes off the menu when an ingredient drops below par', () => {
    // Initial: Cashews = 300g, par = 250g. Paneer Butter Masala uses 15g cashews per order.
    // Order 1: 300 -> 285g (>= 250 par -> Available)
    // Order 2: 285 -> 270g (>= 250 par -> Available)
    // Order 3: 270 -> 255g (>= 250 par -> Available)
    // Order 4: 255 -> 240g (< 250 par -> UNAVAILABLE!)
    let currentStock = initialStock;
    const pbmRecipe = recipes[0];

    // Check before any orders: Available
    expect(checkDishAvailability(pbmRecipe, currentStock).isAvailable).toBe(true);

    // Run 3 orders
    for (let i = 0; i < 3; i++) {
      const res = placeOrder(currentStock, recipes, 'Paneer Butter Masala');
      expect(res.success).toBe(true);
      currentStock = res.updatedStock!;
      expect(checkDishAvailability(pbmRecipe, currentStock).isAvailable).toBe(true);
    }

    const cashewsAfter3 = currentStock.find((i) => i.name === 'Cashews');
    expect(cashewsAfter3?.qty).toBe(255);

    // 4th order drops Cashews to 240g (< 250 par)
    const res4 = placeOrder(currentStock, recipes, 'Paneer Butter Masala');
    expect(res4.success).toBe(true);
    currentStock = res4.updatedStock!;

    const cashewsAfter4 = currentStock.find((i) => i.name === 'Cashews');
    expect(cashewsAfter4?.qty).toBe(240);

    // Now Paneer Butter Masala AND Shahi Paneer Korma (both use Cashews) MUST be UNAVAILABLE!
    const pbmAvailability = checkDishAvailability(recipes[0], currentStock);
    const spkAvailability = checkDishAvailability(recipes[1], currentStock);

    expect(pbmAvailability.isAvailable).toBe(false);
    expect(pbmAvailability.failingIngredients).toContain('Cashews');

    expect(spkAvailability.isAvailable).toBe(false);
    expect(spkAvailability.failingIngredients).toContain('Cashews');
  });

  it('atomically fails and rolls back without modifying ANY stock if an ingredient has insufficient physical stock', () => {
    // Chicken is 0 kg. Ordering Chicken Biryani must fail cleanly.
    const result = placeOrder(initialStock, recipes, 'Chicken Biryani');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Insufficient stock|missing/i);
    expect(result.updatedStock).toBeUndefined();
  });

  it('rejects an unknown dish name cleanly', () => {
    const result = placeOrder(initialStock, recipes, 'Non Existent Curry');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/i);
    expect(result.updatedStock).toBeUndefined();
  });
});
