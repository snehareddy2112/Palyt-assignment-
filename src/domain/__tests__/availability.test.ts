import { describe, it, expect } from 'vitest';
import { checkDishAvailability } from '../recipe';
import { calculateStockStatus } from '../inventory';
import { StockItem, Recipe } from '../types';

describe('Availability Rule & Stock Status Logic', () => {
  const mockStock: StockItem[] = [
    { name: 'Paneer', qty: 1.4, unit: 'kg', par: 0.5 },      // Above par (1.4 >= 0.5) -> Valid
    { name: 'Tomatoes', qty: 6, unit: 'kg', par: 1.5 },       // Above par (6 >= 1.5) -> Valid
    { name: 'Onions', qty: 8, unit: 'kg', par: 2 },           // Above par (8 >= 2) -> Valid
    { name: 'Cream', qty: 900, unit: 'ml', par: 300 },        // Above par (900 >= 300) -> Valid
    { name: 'Butter', qty: 900, unit: 'g', par: 200 },        // Above par (900 >= 200) -> Valid
    { name: 'Cashews', qty: 300, unit: 'g', par: 250 },       // Above par (300 >= 250) -> Valid
    { name: 'Garam Masala', qty: 250, unit: 'g', par: 50 },   // Above par (250 >= 50) -> Valid
    { name: 'Chicken', qty: 0, unit: 'kg', par: 1 },          // Below par (0 < 1) -> Invalid
    { name: 'Basmati Rice', qty: 12, unit: 'kg', par: 3 },    // Above par (12 >= 3) -> Valid
    { name: 'Yoghurt', qty: 1.5, unit: 'kg', par: 0.5 },      // Above par (1.5 >= 0.5) -> Valid
    { name: 'Ghee', qty: 800, unit: 'ml', par: 200 },         // Above par (800 >= 200) -> Valid
    { name: 'Mint', qty: 60, unit: 'g', par: 40 },            // Above par (60 >= 40) -> Valid
    { name: 'Green Peas', qty: 30, unit: 'g', par: 10 },      // Above par (30 >= 10) -> Valid
  ];

  const paneerButterMasala: Recipe = {
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
  };

  const chickenBiryani: Recipe = {
    dish: 'Chicken Biryani',
    price: 420,
    ingredients: [
      { name: 'Chicken', qty: 250, unit: 'g' },
      { name: 'Basmati Rice', qty: 180, unit: 'g' },
      { name: 'Yoghurt', qty: 80, unit: 'g' },
      { name: 'Onions', qty: 120, unit: 'g' },
      { name: 'Ghee', qty: 30, unit: 'ml' },
      { name: 'Mint', qty: 8, unit: 'g' },
      { name: 'Garam Masala', qty: 8, unit: 'g' },
    ],
  };

  describe('calculateStockStatus', () => {
    it('returns HEALTHY when quantity is strictly greater than par', () => {
      expect(calculateStockStatus(1.4, 0.5)).toBe('HEALTHY');
    });

    it('returns HEALTHY when quantity is exactly equal to par', () => {
      expect(calculateStockStatus(0.5, 0.5)).toBe('HEALTHY');
    });

    it('returns LOW_STOCK when quantity is below par but greater than zero', () => {
      expect(calculateStockStatus(0.4, 0.5)).toBe('LOW_STOCK');
    });

    it('returns OUT_OF_STOCK when quantity is zero or negative', () => {
      expect(calculateStockStatus(0, 1.0)).toBe('OUT_OF_STOCK');
      expect(calculateStockStatus(-0.1, 1.0)).toBe('OUT_OF_STOCK');
    });
  });

  describe('checkDishAvailability', () => {
    it('marks dish AVAILABLE when all ingredients have quantity >= par and sufficient stock', () => {
      const result = checkDishAvailability(paneerButterMasala, mockStock);
      expect(result.isAvailable).toBe(true);
      expect(result.failingIngredients).toHaveLength(0);
    });

    it('marks dish UNAVAILABLE when even one ingredient is below par (Chicken in Chicken Biryani)', () => {
      const result = checkDishAvailability(chickenBiryani, mockStock);
      expect(result.isAvailable).toBe(false);
      expect(result.failingIngredients).toContain('Chicken');
    });

    it('marks dish UNAVAILABLE when an ingredient is exactly below par (e.g. Cashews stock drops from 300g to 240g with par 250g)', () => {
      const modifiedStock = mockStock.map((item) =>
        item.name === 'Cashews' ? { ...item, qty: 240 } : item
      );
      const result = checkDishAvailability(paneerButterMasala, modifiedStock);
      expect(result.isAvailable).toBe(false);
      expect(result.failingIngredients).toContain('Cashews');
    });

    it('marks dish AVAILABLE when ingredient is exactly at par (Cashews stock is exactly 250g with par 250g)', () => {
      const modifiedStock = mockStock.map((item) =>
        item.name === 'Cashews' ? { ...item, qty: 250 } : item
      );
      const result = checkDishAvailability(paneerButterMasala, modifiedStock);
      expect(result.isAvailable).toBe(true);
      expect(result.failingIngredients).toHaveLength(0);
    });

    it('marks dish UNAVAILABLE if an ingredient is completely missing from stock (Refined Flour)', () => {
      const butterNaan: Recipe = {
        dish: 'Butter Naan',
        price: 70,
        ingredients: [
          { name: 'Butter', qty: 12, unit: 'g' },
          { name: 'Refined Flour', qty: 90, unit: 'g' },
        ],
      };

      const result = checkDishAvailability(butterNaan, mockStock);
      expect(result.isAvailable).toBe(false);
      expect(result.failingIngredients).toContain('Refined Flour');
    });

    it('identifies multiple failing ingredients accurately', () => {
      const multiFailStock = mockStock.map((item) => {
        if (item.name === 'Paneer') return { ...item, qty: 0.2 }; // par 0.5
        if (item.name === 'Tomatoes') return { ...item, qty: 1.0 }; // par 1.5
        return item;
      });

      const result = checkDishAvailability(paneerButterMasala, multiFailStock);
      expect(result.isAvailable).toBe(false);
      expect(result.failingIngredients).toEqual(expect.arrayContaining(['Paneer', 'Tomatoes']));
      expect(result.failingIngredients).toHaveLength(2);
    });
  });

  describe('Raising par level reactivity', () => {
    it('causes a dish to become unavailable when par level is raised above current stock without any orders', () => {
      // Paneer is at 1.4 kg. If par is raised to 1.5 kg, Paneer Butter Masala must become unavailable!
      const raisedParStock = mockStock.map((item) =>
        item.name === 'Paneer' ? { ...item, par: 1.5 } : item
      );
      const result = checkDishAvailability(paneerButterMasala, raisedParStock);
      expect(result.isAvailable).toBe(false);
      expect(result.failingIngredients).toContain('Paneer');
    });
  });
});
