import { describe, it, expect } from 'vitest';
import { validateIngredientInput, addStockItem, updateStockItem, removeStockItem } from '../inventory';
import { StockItem } from '../types';

describe('Inventory Input Validation and CRUD Reducers', () => {
  const initialStock: StockItem[] = [
    { name: 'Paneer', qty: 1.4, unit: 'kg', par: 0.5 },
    { name: 'Chicken', qty: 0, unit: 'kg', par: 1 },
    { name: 'Cashews', qty: 300, unit: 'g', par: 250 },
  ];

  describe('validateIngredientInput', () => {
    it('accepts valid ingredient inputs', () => {
      const res = validateIngredientInput(
        { name: 'Cardamom', qty: 50, unit: 'g', par: 10 },
        initialStock
      );
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });

    it('rejects empty or whitespace ingredient names', () => {
      const res = validateIngredientInput(
        { name: '   ', qty: 50, unit: 'g', par: 10 },
        initialStock
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toMatch(/name is required/i);
    });

    it('rejects duplicate ingredient names (case-insensitive)', () => {
      const res = validateIngredientInput(
        { name: 'paneer', qty: 2, unit: 'kg', par: 1 },
        initialStock
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toMatch(/already exists/i);
    });

    it('allows keeping the same name when editing an existing item', () => {
      const res = validateIngredientInput(
        { name: 'Paneer', qty: 2.5, unit: 'kg', par: 1.0 },
        initialStock,
        'Paneer'
      );
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });

    it('rejects negative quantities', () => {
      const res = validateIngredientInput(
        { name: 'Salt', qty: -5, unit: 'g', par: 10 },
        initialStock
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.qty).toMatch(/cannot be negative/i);
    });

    it('rejects negative par levels', () => {
      const res = validateIngredientInput(
        { name: 'Salt', qty: 50, unit: 'g', par: -2 },
        initialStock
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.par).toMatch(/cannot be negative/i);
    });

    it('rejects malformed numbers (NaN)', () => {
      const res = validateIngredientInput(
        { name: 'Salt', qty: 'abc', unit: 'g', par: 'xyz' },
        initialStock
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.qty).toMatch(/valid number/i);
      expect(res.errors.par).toMatch(/valid number/i);
    });

    it('rejects invalid or unsupported units', () => {
      const res = validateIngredientInput(
        { name: 'Salt', qty: 50, unit: 'pounds', par: 10 },
        initialStock
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.unit).toMatch(/invalid unit/i);
    });
  });

  describe('CRUD operations', () => {
    it('adds a new ingredient to stock', () => {
      const updated = addStockItem(initialStock, {
        name: 'Refined Flour',
        qty: 5,
        unit: 'kg',
        par: 2,
      });
      expect(updated).toHaveLength(4);
      expect(updated[3].name).toBe('Refined Flour');
    });

    it('updates quantity and par level of existing ingredient', () => {
      const updated = updateStockItem(initialStock, 'Paneer', {
        qty: 3.5,
        par: 1.2,
      });
      const item = updated.find((i) => i.name === 'Paneer');
      expect(item?.qty).toBe(3.5);
      expect(item?.par).toBe(1.2);
    });

    it('removes an ingredient from stock', () => {
      const updated = removeStockItem(initialStock, 'Chicken');
      expect(updated).toHaveLength(2);
      expect(updated.find((i) => i.name === 'Chicken')).toBeUndefined();
    });
  });
});
