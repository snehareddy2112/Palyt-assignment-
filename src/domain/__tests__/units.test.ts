import { describe, it, expect } from 'vitest';
import {
  convertQuantity,
  toBaseUnit,
  fromBaseUnit,
  isSupportedUnit,
  getUnitDimension,
  roundToPrecision,
  formatQuantityWithUnit,
} from '../units';

describe('Unit Conversion and Normalization Layer', () => {
  describe('toBaseUnit', () => {
    it('correctly converts kilograms to grams (1 kg = 1000 g)', () => {
      expect(toBaseUnit(1, 'kg')).toBe(1000);
      expect(toBaseUnit(1.4, 'kg')).toBe(1400);
      expect(toBaseUnit(0.5, 'kg')).toBe(500);
    });

    it('correctly normalizes grams to base grams', () => {
      expect(toBaseUnit(300, 'g')).toBe(300);
      expect(toBaseUnit(15, 'g')).toBe(15);
    });

    it('correctly converts litres to millilitres (1 L = 1000 ml)', () => {
      expect(toBaseUnit(1, 'L')).toBe(1000);
      expect(toBaseUnit(0.8, 'l')).toBe(800);
      expect(toBaseUnit(2.5, 'litres')).toBe(2500);
    });

    it('correctly normalizes millilitres to base millilitres', () => {
      expect(toBaseUnit(800, 'ml')).toBe(800);
      expect(toBaseUnit(40, 'ml')).toBe(40);
    });

    it('throws on unsupported units', () => {
      expect(() => toBaseUnit(10, 'gallons')).toThrow(/Unsupported unit/);
      expect(() => toBaseUnit(5, 'xyz')).toThrow(/Unsupported unit/);
    });
  });

  describe('fromBaseUnit', () => {
    it('correctly converts base grams to kilograms', () => {
      expect(fromBaseUnit(1400, 'kg')).toBe(1.4);
      expect(fromBaseUnit(180, 'kg')).toBe(0.18);
    });

    it('correctly converts base millilitres to litres', () => {
      expect(fromBaseUnit(800, 'L')).toBe(0.8);
      expect(fromBaseUnit(2500, 'l')).toBe(2.5);
    });
  });

  describe('convertQuantity across units', () => {
    it('converts kg -> g', () => {
      expect(convertQuantity(1.4, 'kg', 'g')).toBe(1400);
      expect(convertQuantity(0.05, 'kg', 'g')).toBe(50);
    });

    it('converts g -> kg', () => {
      expect(convertQuantity(180, 'g', 'kg')).toBe(0.18);
      expect(convertQuantity(1000, 'g', 'kg')).toBe(1);
    });

    it('converts L -> ml', () => {
      expect(convertQuantity(0.8, 'L', 'ml')).toBe(800);
      expect(convertQuantity(1.5, 'l', 'ml')).toBe(1500);
    });

    it('converts ml -> L', () => {
      expect(convertQuantity(800, 'ml', 'L')).toBe(0.8);
      expect(convertQuantity(40, 'ml', 'L')).toBe(0.04);
    });

    it('handles identical source and target units', () => {
      expect(convertQuantity(500, 'g', 'g')).toBe(500);
      expect(convertQuantity(2.5, 'kg', 'kg')).toBe(2.5);
      expect(convertQuantity(900, 'ml', 'ml')).toBe(900);
    });

    it('throws error when attempting cross-dimension conversion (mass vs volume)', () => {
      expect(() => convertQuantity(100, 'g', 'ml')).toThrow(/Cannot convert across incompatible dimensions/);
      expect(() => convertQuantity(2, 'kg', 'L')).toThrow(/Cannot convert across incompatible dimensions/);
    });

    it('throws error for unsupported units', () => {
      expect(() => convertQuantity(10, 'foobar', 'kg')).toThrow(/Unsupported/);
      expect(() => convertQuantity(10, 'kg', 'foobar')).toThrow(/Unsupported/);
    });
  });

  describe('precision & formatting', () => {
    it('rounds floating point drift accurately (e.g. 1.4 - 0.18 = 1.22)', () => {
      const result = roundToPrecision(1.4 - 0.18, 3);
      expect(result).toBe(1.22);
    });

    it('formats quantity with unit cleanly', () => {
      expect(formatQuantityWithUnit(1.4, 'kg')).toBe('1.4 kg');
      expect(formatQuantityWithUnit(300, 'g')).toBe('300 g');
    });

    it('validates supported units correctly', () => {
      expect(isSupportedUnit('kg')).toBe(true);
      expect(isSupportedUnit('G')).toBe(true);
      expect(isSupportedUnit('ml')).toBe(true);
      expect(isSupportedUnit('count')).toBe(true);
      expect(isSupportedUnit('lbs')).toBe(false);
    });

    it('returns proper unit dimensions', () => {
      expect(getUnitDimension('kg')).toBe('mass');
      expect(getUnitDimension('g')).toBe('mass');
      expect(getUnitDimension('L')).toBe('volume');
      expect(getUnitDimension('ml')).toBe('volume');
      expect(getUnitDimension('count')).toBe('count');
      expect(getUnitDimension('invalid')).toBeNull();
    });
  });
});
