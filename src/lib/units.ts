import { Language } from '../types';

export type MeasurementUnit = 'mm' | 'cm' | 'in';

/**
 * Convert millimeters to target measurement unit
 */
export function mmToUnit(mm: number, unit: MeasurementUnit): number {
  if (isNaN(mm)) return 0;
  if (unit === 'cm') {
    return Number((mm / 10).toFixed(3));
  }
  if (unit === 'in') {
    return Number((mm / 25.4).toFixed(3));
  }
  return Number(mm.toFixed(2));
}

/**
 * Convert value from target measurement unit back to millimeters
 */
export function unitToMm(val: number, unit: MeasurementUnit): number {
  if (isNaN(val)) return 0;
  if (unit === 'cm') {
    return Number((val * 10).toFixed(2));
  }
  if (unit === 'in') {
    return Number((val * 25.4).toFixed(2));
  }
  return Number(val.toFixed(2));
}

/**
 * Returns localized unit label
 */
export function getUnitLabel(unit: MeasurementUnit, language: Language = 'ar'): string {
  if (language === 'ar') {
    switch (unit) {
      case 'mm':
        return 'مم';
      case 'cm':
        return 'سم';
      case 'in':
        return 'بوصة';
    }
  }
  return unit;
}

/**
 * Returns full descriptive label for the unit
 */
export function getUnitFullLabel(unit: MeasurementUnit, language: Language = 'ar'): string {
  if (language === 'ar') {
    switch (unit) {
      case 'mm':
        return 'مليمتر (مم)';
      case 'cm':
        return 'سنتيمتر (سم)';
      case 'in':
        return 'بوصة (إنش)';
    }
  }
  switch (unit) {
    case 'mm':
      return 'Millimeter (mm)';
    case 'cm':
      return 'Centimeter (cm)';
    case 'in':
      return 'Inch (in)';
  }
}

/**
 * Format a millimeter dimension into a clean string with the active unit and localized label
 */
export function formatUnitValue(mm: number, unit: MeasurementUnit, language: Language = 'ar'): string {
  const converted = mmToUnit(mm, unit);
  // Strip unnecessary trailing zeros e.g. 21.00 -> 21
  const cleanNum = Number(converted.toFixed(2));
  const label = getUnitLabel(unit, language);
  return `${cleanNum} ${label}`;
}

/**
 * Formats width and height in current unit with label e.g. "21 × 29.7 سم" or "210 × 297 مم"
 */
export function formatDimensions(wMm: number, hMm: number, unit: MeasurementUnit, language: Language = 'ar'): string {
  const w = Number(mmToUnit(wMm, unit).toFixed(2));
  const h = Number(mmToUnit(hMm, unit).toFixed(2));
  const label = getUnitLabel(unit, language);
  return `${w} × ${h} ${label}`;
}

/**
 * Formats standard paper size label e.g. "A4 (21×29.7 سم)"
 */
export function getStandardPaperLabel(name: 'A4' | 'A5' | 'Letter', unit: MeasurementUnit, language: Language = 'ar'): string {
  if (name === 'A4') {
    return `A4 (${formatDimensions(210, 297, unit, language)})`;
  }
  if (name === 'A5') {
    return `A5 (${formatDimensions(148, 210, unit, language)})`;
  }
  if (name === 'Letter') {
    return `Letter (${formatDimensions(216, 279, unit, language)})`;
  }
  return name;
}

/**
 * Appropriate numeric step size for inputs in the given unit
 */
export function getUnitStep(unit: MeasurementUnit): number {
  switch (unit) {
    case 'mm':
      return 0.5;
    case 'cm':
      return 0.05;
    case 'in':
      return 0.01;
  }
}

