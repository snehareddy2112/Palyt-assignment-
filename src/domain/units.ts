import { SupportedUnit, UnitDimension } from './types';

/**
 * Normalized unit definitions and conversion factors to base units.
 * Base units:
 * - mass: grams ('g')
 * - volume: millilitres ('ml')
 * - count: items ('count')
 */
export const UNIT_CONFIG: Record<string, { dimension: UnitDimension; toBase: number; canonical: string }> = {
  g: { dimension: 'mass', toBase: 1, canonical: 'g' },
  gram: { dimension: 'mass', toBase: 1, canonical: 'g' },
  grams: { dimension: 'mass', toBase: 1, canonical: 'g' },
  kg: { dimension: 'mass', toBase: 1000, canonical: 'kg' },
  kilogram: { dimension: 'mass', toBase: 1000, canonical: 'kg' },
  kilograms: { dimension: 'mass', toBase: 1000, canonical: 'kg' },
  ml: { dimension: 'volume', toBase: 1, canonical: 'ml' },
  millilitre: { dimension: 'volume', toBase: 1, canonical: 'ml' },
  millilitres: { dimension: 'volume', toBase: 1, canonical: 'ml' },
  l: { dimension: 'volume', toBase: 1000, canonical: 'l' },
  litre: { dimension: 'volume', toBase: 1000, canonical: 'l' },
  litres: { dimension: 'volume', toBase: 1000, canonical: 'l' },
  count: { dimension: 'count', toBase: 1, canonical: 'count' },
  pcs: { dimension: 'count', toBase: 1, canonical: 'pcs' },
  piece: { dimension: 'count', toBase: 1, canonical: 'count' },
  pieces: { dimension: 'count', toBase: 1, canonical: 'count' },
};

/**
 * Normalizes a unit string to lower-case trimmed.
 */
export function normalizeUnit(rawUnit: string): string {
  if (!rawUnit) return '';
  return rawUnit.trim().toLowerCase();
}

/**
 * Checks if a unit is supported.
 */
export function isSupportedUnit(rawUnit: string): boolean {
  const norm = normalizeUnit(rawUnit);
  return norm in UNIT_CONFIG;
}

/**
 * Gets the dimension (mass, volume, count) for a unit.
 */
export function getUnitDimension(rawUnit: string): UnitDimension | null {
  const norm = normalizeUnit(rawUnit);
  return UNIT_CONFIG[norm]?.dimension ?? null;
}

/**
 * Converts a quantity from its source unit to the dimension's base unit (grams or ml).
 */
export function toBaseUnit(qty: number, unit: string): number {
  const norm = normalizeUnit(unit);
  const config = UNIT_CONFIG[norm];
  if (!config) {
    throw new Error(`Unsupported unit: "${unit}". Supported units are kg, g, L, ml, count.`);
  }
  return roundToPrecision(qty * config.toBase, 6);
}

/**
 * Converts a quantity from the dimension's base unit to a target unit.
 */
export function fromBaseUnit(baseQty: number, targetUnit: string): number {
  const norm = normalizeUnit(targetUnit);
  const config = UNIT_CONFIG[norm];
  if (!config) {
    throw new Error(`Unsupported unit: "${targetUnit}". Supported units are kg, g, L, ml, count.`);
  }
  return roundToPrecision(baseQty / config.toBase, 4);
}

/**
 * Converts a quantity from one unit to another within the same dimension.
 * Throws an error if units belong to different dimensions.
 */
export function convertQuantity(qty: number, fromUnit: string, toUnit: string): number {
  const normFrom = normalizeUnit(fromUnit);
  const normTo = normalizeUnit(toUnit);

  if (normFrom === normTo) {
    return roundToPrecision(qty, 4);
  }

  const fromConfig = UNIT_CONFIG[normFrom];
  const toConfig = UNIT_CONFIG[normTo];

  if (!fromConfig) {
    throw new Error(`Unsupported source unit: "${fromUnit}"`);
  }
  if (!toConfig) {
    throw new Error(`Unsupported target unit: "${toUnit}"`);
  }
  if (fromConfig.dimension !== toConfig.dimension) {
    throw new Error(
      `Cannot convert across incompatible dimensions: "${fromUnit}" (${fromConfig.dimension}) and "${toUnit}" (${toConfig.dimension})`
    );
  }

  const baseVal = qty * fromConfig.toBase;
  return roundToPrecision(baseVal / toConfig.toBase, 4);
}

/**
 * Clean floating point arithmetic helper.
 */
export function roundToPrecision(val: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Formats a quantity and unit cleanly for display (e.g. 1.4 kg, 300 g).
 */
export function formatQuantityWithUnit(qty: number, unit: string): string {
  const rounded = roundToPrecision(qty, 3);
  return `${rounded} ${unit}`;
}
