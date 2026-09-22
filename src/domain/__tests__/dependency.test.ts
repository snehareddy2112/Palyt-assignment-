import { describe, it, expect } from 'vitest';
import { getDependentRecipes, canDeleteIngredient } from '../recipe';
import { Recipe } from '../types';

describe('Ingredient Dependency & Deletion Policy', () => {
  const sampleRecipes: Recipe[] = [
    {
      dish: 'Paneer Butter Masala',
      price: 320,
      ingredients: [
        { name: 'Paneer', qty: 180, unit: 'g' },
        { name: 'Tomatoes', qty: 150, unit: 'g' },
        { name: 'Cashews', qty: 15, unit: 'g' },
      ],
    },
    {
      dish: 'Shahi Paneer Korma',
      price: 360,
      ingredients: [
        { name: 'Paneer', qty: 100, unit: 'g' },
        { name: 'Cashews', qty: 40, unit: 'g' },
      ],
    },
  ];

  it('correctly identifies all dependent recipes for an ingredient (Cashews)', () => {
    const dependentDishes = getDependentRecipes('Cashews', sampleRecipes);
    expect(dependentDishes).toEqual(['Paneer Butter Masala', 'Shahi Paneer Korma']);
  });

  it('performs case-insensitive lookup of dependencies (cashews vs Cashews)', () => {
    const dependentDishes = getDependentRecipes('cashews', sampleRecipes);
    expect(dependentDishes).toEqual(['Paneer Butter Masala', 'Shahi Paneer Korma']);
  });

  it('returns empty array for unused ingredient (Bay Leaves)', () => {
    const dependentDishes = getDependentRecipes('Bay Leaves', sampleRecipes);
    expect(dependentDishes).toEqual([]);
  });

  it('blocks deletion of an ingredient referenced by recipes with clear explanation', () => {
    const check = canDeleteIngredient('Cashews', sampleRecipes);
    expect(check.canDelete).toBe(false);
    expect(check.dependentDishes).toHaveLength(2);
    expect(check.reason).toContain('Cannot delete "Cashews" because it is required by 2 menu dishes: Paneer Butter Masala, Shahi Paneer Korma');
  });

  it('blocks deletion of Paneer which is used in 2 recipes', () => {
    const check = canDeleteIngredient('Paneer', sampleRecipes);
    expect(check.canDelete).toBe(false);
    expect(check.dependentDishes).toEqual(['Paneer Butter Masala', 'Shahi Paneer Korma']);
  });

  it('allows deletion of unused ingredients (Bay Leaves, Saffron)', () => {
    const checkBayLeaves = canDeleteIngredient('Bay Leaves', sampleRecipes);
    expect(checkBayLeaves.canDelete).toBe(true);
    expect(checkBayLeaves.dependentDishes).toHaveLength(0);

    const checkSaffron = canDeleteIngredient('Saffron', sampleRecipes);
    expect(checkSaffron.canDelete).toBe(true);
    expect(checkSaffron.dependentDishes).toHaveLength(0);
  });
});
