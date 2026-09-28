export type PageOrientation = 'portrait' | 'landscape';
export type PaperSize = 'A4' | 'Letter' | 'Custom';
export type StickerState = 'available' | 'used' | 'assigned';
export type TextAlign = 'center' | 'left' | 'right';
export type VerticalAlign = 'middle' | 'top' | 'bottom';
export type FontWeight = 'normal' | '500' | '600' | 'bold' | '800';
export type MeasurementUnit = 'mm' | 'cm' | 'in';

export type DimensionHighlightKey =
  | 'paperWidth'
  | 'paperHeight'
  | 'marginTop'
  | 'marginBottom'
  | 'marginLeft'
  | 'marginRight'
  | 'stickerWidth'
  | 'stickerHeight'
  | 'horizontalGap'
  | 'verticalGap'
  | 'columns'
  | 'rows'
  | 'globalOffsetX'
  | 'globalOffsetY';

export interface StickerTemplate {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  isPreset?: boolean;
  paperWidth: number; // mm
  paperHeight: number; // mm
  orientation: PageOrientation;
  columns: number;
  rows: number;
  stickerWidth: number; // mm
  stickerHeight: number; // mm
  marginTop: number; // mm
  marginBottom: number; // mm
  marginLeft: number; // mm
  marginRight: number; // mm
  horizontalGap: number; // mm
  verticalGap: number; // mm
  fontFamily: string;
  fontSize: number; // pt
  fontWeight: FontWeight;
  italic: boolean;
  textColor: string;
  backgroundColor: string;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  prefix: string;
  suffix: string;
  logoUrl?: string;
  logoHeightMm?: number;
  globalOffsetX: number; // mm
  globalOffsetY: number; // mm
  cornerRadiusMm?: number;
  flowDirection?: 'rtl' | 'ltr'; // 'rtl' = from right to left, 'ltr' = from left to right
}

export interface StickerItem {
  index: number; // 0-based index on this page (0 to totalStickers - 1)
  displayIndex: number; // 1-based index (1 to totalStickers)
  globalIndex: number; // global index across dataset
  pageIndex: number; // 0-based page
  row: number; // 0-based row
  col: number; // 0-based column
  baseX: number; // mm
  baseY: number; // mm
  width: number; // mm
  height: number; // mm
  offsetX: number; // mm
  offsetY: number; // mm
  finalX: number; // mm: baseX + globalOffsetX + offsetX
  finalY: number; // mm: baseY + globalOffsetY + offsetY
  status: StickerState;
  employeeNumber?: string;
  employeeName?: string;
  isCustomMoved: boolean;
}

export interface PrinterCalibration {
  scaleX: number; // Multiplier, default 1.0 (e.g. 1.002)
  scaleY: number; // Multiplier, default 1.0
  offsetX: number; // mm, default 0
  offsetY: number; // mm, default 0
}

export interface PrintJob {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  template: StickerTemplate;
  employeeNumbers: string[];
  startPosition: number; // 1-based index on Page 1 (e.g., 6)
  usedStickersByPage: Record<number, number[]>; // pageIndex -> array of used sticker indices
  individualOffsetsByPage: Record<number, Record<number, { x: number; y: number }>>; // pageIndex -> stickerIndex -> {x, y}
  manualAssignmentsByPage: Record<number, Record<number, string>>; // pageIndex -> stickerIndex -> employeeNumber
  calibration: PrinterCalibration;
}

export interface PageLayout {
  pageIndex: number;
  stickers: StickerItem[];
  totalAvailable: number;
  totalUsed: number;
  totalAssigned: number;
}

export interface GeometryCalculation {
  pageWidth: number;
  pageHeight: number;
  columns: number;
  rows: number;
  totalStickers: number;
  availableWidth: number;
  availableHeight: number;
  gridWidth: number;
  gridHeight: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EmployeeDataValidation {
  total: number;
  valid: number;
  invalid: number;
  duplicates: string[];
  duplicateCount: number;
  list: string[];
}

export type StepSize = 0.1 | 0.5 | 1.0;
export type Language = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark';
