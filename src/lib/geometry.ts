import { GeometryCalculation, StickerItem, StickerTemplate } from '../types';

export const MM_TO_PX_RATIO = 96 / 25.4; // ~3.779527559 px per mm at 96 DPI

/**
 * Calculates page dimensions and grid layout metrics from template
 */
export function calculateGeometry(template: StickerTemplate): GeometryCalculation {
  const isLandscape = template.orientation === 'landscape';
  const pageWidth = isLandscape
    ? Math.max(template.paperWidth, template.paperHeight)
    : Math.min(template.paperWidth, template.paperHeight);
  const pageHeight = isLandscape
    ? Math.min(template.paperWidth, template.paperHeight)
    : Math.max(template.paperWidth, template.paperHeight);

  const availableWidth = pageWidth - (template.marginLeft + template.marginRight);
  const availableHeight = pageHeight - (template.marginTop + template.marginBottom);

  const errors: string[] = [];
  const warnings: string[] = [];

  if (template.stickerWidth <= 0 || template.stickerHeight <= 0) {
    errors.push('أبعاد الاستيكر يجب أن تكون أكبر من الصفر');
  }

  if (availableWidth <= 0) {
    errors.push('الهوامش الأفقية أكبر من عرض الصفحة');
  }

  if (availableHeight <= 0) {
    errors.push('الهوامش الرأسية أكبر من ارتفاع الصفحة');
  }

  let calculatedColumns = 0;
  let calculatedRows = 0;

  if (errors.length === 0) {
    const colStep = template.stickerWidth + template.horizontalGap;
    const rowStep = template.stickerHeight + template.verticalGap;

    if (colStep > 0 && availableWidth >= template.stickerWidth) {
      calculatedColumns = Math.floor((availableWidth + template.horizontalGap + 0.0001) / colStep);
    }

    if (rowStep > 0 && availableHeight >= template.stickerHeight) {
      calculatedRows = Math.floor((availableHeight + template.verticalGap + 0.0001) / rowStep);
    }
  }

  // Use explicit template columns/rows if valid, or fallback to auto-calculated
  const columns = template.columns > 0 ? template.columns : calculatedColumns;
  const rows = template.rows > 0 ? template.rows : calculatedRows;
  const totalStickers = Math.max(0, columns * rows);

  const gridWidth = columns > 0 ? (columns * template.stickerWidth + (columns - 1) * template.horizontalGap) : 0;
  const gridHeight = rows > 0 ? (rows * template.stickerHeight + (rows - 1) * template.verticalGap) : 0;

  if (gridWidth > availableWidth + 0.01) {
    warnings.push(`الاستيكرات تتجاوز عرض الصفحة بمقدار ${(gridWidth - availableWidth).toFixed(1)} مم`);
  }

  if (gridHeight > availableHeight + 0.01) {
    warnings.push(`الاستيكرات تتجاوز ارتفاع الصفحة بمقدار ${(gridHeight - availableHeight).toFixed(1)} مم`);
  }

  return {
    pageWidth,
    pageHeight,
    columns,
    rows,
    totalStickers,
    availableWidth: Math.max(0, availableWidth),
    availableHeight: Math.max(0, availableHeight),
    gridWidth,
    gridHeight,
    isValid: errors.length === 0 && columns > 0 && rows > 0,
    errors,
    warnings,
  };
}

/**
 * Generate blank sticker geometry items for a given page
 */
export function generateBaseStickers(
  template: StickerTemplate,
  pageIndex: number = 0,
  individualOffsets: Record<number, { x: number; y: number }> = {}
): StickerItem[] {
  const geo = calculateGeometry(template);
  if (!geo.isValid) return [];

  const isRtl = template.flowDirection === 'rtl';
  const stickers: StickerItem[] = [];
  let index = 0;

  for (let r = 0; r < geo.rows; r++) {
    for (let c = 0; c < geo.columns; c++) {
      const physicalCol = isRtl ? geo.columns - 1 - c : c;
      const baseX = template.marginLeft + physicalCol * (template.stickerWidth + template.horizontalGap);
      const baseY = template.marginTop + r * (template.stickerHeight + template.verticalGap);
      const offset = individualOffsets[index] || { x: 0, y: 0 };

      const finalX = Number((baseX + template.globalOffsetX + offset.x).toFixed(2));
      const finalY = Number((baseY + template.globalOffsetY + offset.y).toFixed(2));

      stickers.push({
        index,
        displayIndex: index + 1,
        globalIndex: pageIndex * geo.totalStickers + index,
        pageIndex,
        row: r,
        col: physicalCol,
        baseX: Number(baseX.toFixed(2)),
        baseY: Number(baseY.toFixed(2)),
        width: template.stickerWidth,
        height: template.stickerHeight,
        offsetX: Number(offset.x.toFixed(2)),
        offsetY: Number(offset.y.toFixed(2)),
        finalX,
        finalY,
        status: 'available',
        isCustomMoved: offset.x !== 0 || offset.y !== 0,
      });

      index++;
    }
  }

  return stickers;
}

/**
 * Converts millimeter value to screen pixels at given zoom scale
 */
export function mmToPx(mm: number, zoomScale: number = 1): number {
  return mm * MM_TO_PX_RATIO * zoomScale;
}

/**
 * Converts screen pixel delta into millimeter delta at given zoom scale
 */
export function pxDeltaToMm(px: number, zoomScale: number = 1): number {
  if (zoomScale <= 0) return 0;
  return px / (MM_TO_PX_RATIO * zoomScale);
}
