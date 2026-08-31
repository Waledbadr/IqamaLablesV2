import { jsPDF } from 'jspdf';
import { PageLayout, PrinterCalibration, StickerItem, StickerTemplate } from '../types';

export interface PDFExportOptions {
  template: StickerTemplate;
  pages: PageLayout[];
  calibration?: PrinterCalibration;
  showOutlines?: boolean;
  testMode?: boolean;
}

/**
 * Generates an ultra-precise, vector A4 PDF using jsPDF in physical millimeter units.
 */
export function generateStickersPDF(options: PDFExportOptions): jsPDF {
  const { template, pages, calibration, showOutlines = false } = options;

  const isLandscape = template.orientation === 'landscape';
  const rawPageWidth = isLandscape
    ? Math.max(template.paperWidth, template.paperHeight)
    : Math.min(template.paperWidth, template.paperHeight);
  const rawPageHeight = isLandscape
    ? Math.min(template.paperWidth, template.paperHeight)
    : Math.max(template.paperWidth, template.paperHeight);

  const cal = calibration || { scaleX: 1.0, scaleY: 1.0, offsetX: 0, offsetY: 0 };

  // Initialize jsPDF with exact mm format
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [rawPageWidth, rawPageHeight],
    compress: true,
  });

  const activePages = pages.length > 0 ? pages : [];

  activePages.forEach((page, pageIdx) => {
    if (pageIdx > 0) {
      doc.addPage([rawPageWidth, rawPageHeight], isLandscape ? 'landscape' : 'portrait');
    }

    // Only render assigned stickers in actual print output!
    // Used overlays, available empty borders, and editor guides MUST NOT be printed unless showOutlines is explicitly requested.
    page.stickers.forEach((sticker) => {
      if (sticker.status !== 'assigned' && !showOutlines) {
        return;
      }

      // Calculate calibrated coordinates
      // Calibrated position = (finalPos * scale) + calibrationOffset
      const calibratedX = (sticker.finalX * cal.scaleX) + cal.offsetX;
      const calibratedY = (sticker.finalY * cal.scaleY) + cal.offsetY;
      const calibratedW = sticker.width * cal.scaleX;
      const calibratedH = sticker.height * cal.scaleY;

      // Optional light cut guide border if requested
      if (showOutlines) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(calibratedX, calibratedY, calibratedW, calibratedH);
      }

      // Only print text if assigned
      if (sticker.status === 'assigned' && sticker.employeeNumber) {
        const textContent = `${template.prefix || ''}${sticker.employeeNumber}${template.suffix || ''}`;

        // Set font styling
        doc.setFontSize(template.fontSize || 16);
        
        // Font style
        if (template.fontWeight === 'bold' || template.fontWeight === '800' || template.fontWeight === '600') {
          doc.setFont('helvetica', template.italic ? 'bolditalic' : 'bold');
        } else {
          doc.setFont('helvetica', template.italic ? 'italic' : 'normal');
        }

        // Text color parsing (hex to rgb)
        const hex = (template.textColor || '#000000').replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        doc.setTextColor(r, g, b);

        // Alignment calculations in mm
        let textX = calibratedX + calibratedW / 2;
        let align: 'center' | 'left' | 'right' = 'center';

        if (template.textAlign === 'left') {
          textX = calibratedX + 2; // 2mm padding
          align = 'left';
        } else if (template.textAlign === 'right') {
          textX = calibratedX + calibratedW - 2;
          align = 'right';
        }

        let textY = calibratedY + calibratedH / 2;
        let baseline: 'middle' | 'top' | 'bottom' = 'middle';

        if (template.verticalAlign === 'top') {
          textY = calibratedY + 3;
          baseline = 'top';
        } else if (template.verticalAlign === 'bottom') {
          textY = calibratedY + calibratedH - 3;
          baseline = 'bottom';
        }

        // Render vector text
        doc.text(textContent, textX, textY, {
          align,
          baseline,
        });
      }
    });
  });

  return doc;
}

/**
 * Generates a dedicated Calibration Test Page PDF
 */
export function generateCalibrationTestPDF(template: StickerTemplate, calibration?: PrinterCalibration): jsPDF {
  const isLandscape = template.orientation === 'landscape';
  const rawPageWidth = isLandscape
    ? Math.max(template.paperWidth, template.paperHeight)
    : Math.min(template.paperWidth, template.paperHeight);
  const rawPageHeight = isLandscape
    ? Math.min(template.paperWidth, template.paperHeight)
    : Math.max(template.paperWidth, template.paperHeight);

  const cal = calibration || { scaleX: 1.0, scaleY: 1.0, offsetX: 0, offsetY: 0 };

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [rawPageWidth, rawPageHeight],
  });

  // 1. Outer A4 reference border (10mm from edges)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, rawPageWidth - 20, rawPageHeight - 20);

  // 2. Title & Instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('StickerPrint - Printer Calibration Test Page (A4)', rawPageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Measure the test lines with a physical ruler. If 100mm measures different, adjust Scale X / Scale Y in settings.', rawPageWidth / 2, 23, { align: 'center' });

  // 3. Exact 100 mm Horizontal Calibration Ruler
  const rulerStartX = 25;
  const rulerStartY = 35;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(rulerStartX, rulerStartY, rulerStartX + 100, rulerStartY);

  // Tick marks every 10mm
  for (let i = 0; i <= 10; i++) {
    const tickX = rulerStartX + i * 10;
    const tickH = i === 0 || i === 5 || i === 10 ? 5 : 3;
    doc.line(tickX, rulerStartY - tickH, tickX, rulerStartY + tickH);
    doc.setFontSize(7);
    doc.text(`${i * 10}`, tickX, rulerStartY + 8, { align: 'center' });
  }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('100.0 mm Target Width', rulerStartX + 50, rulerStartY - 7, { align: 'center' });

  // 4. Exact 100 mm Vertical Calibration Ruler
  const vRulerStartX = 20;
  const vRulerStartY = 50;
  doc.setLineWidth(0.5);
  doc.line(vRulerStartX, vRulerStartY, vRulerStartX, vRulerStartY + 100);

  for (let i = 0; i <= 10; i++) {
    const tickY = vRulerStartY + i * 10;
    const tickW = i === 0 || i === 5 || i === 10 ? 5 : 3;
    doc.line(vRulerStartX - tickW, tickY, vRulerStartX + tickW, tickY);
    doc.setFontSize(7);
    doc.text(`${i * 10}`, vRulerStartX + 7, tickY + 1);
  }
  doc.text('100.0 mm Target Height', vRulerStartX + 10, vRulerStartY + 50);

  // 5. Center alignment crosshair
  const midX = rawPageWidth / 2;
  const midY = rawPageHeight / 2;
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.3);
  doc.line(midX - 15, midY, midX + 15, midY);
  doc.line(midX, midY - 15, midX, midY + 15);
  doc.circle(midX, midY, 5);
  doc.setFontSize(7);
  doc.setTextColor(220, 38, 38);
  doc.text('Center (منتصف الصفحة)', midX, midY + 9, { align: 'center' });

  // 6. Test Sticker Grid Outlines with Numbers
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.2);

  const startGridX = template.marginLeft;
  const startGridY = template.marginTop;
  const maxTestRows = Math.min(template.rows, 5);
  const maxTestCols = Math.min(template.columns, 4);

  for (let r = 0; r < maxTestRows; r++) {
    for (let c = 0; c < maxTestCols; c++) {
      const sX = (startGridX + c * (template.stickerWidth + template.horizontalGap) + template.globalOffsetX + cal.offsetX) * cal.scaleX;
      const sY = (startGridY + r * (template.stickerHeight + template.verticalGap) + template.globalOffsetY + cal.offsetY) * cal.scaleY;
      const sW = template.stickerWidth * cal.scaleX;
      const sH = template.stickerHeight * cal.scaleY;

      doc.rect(sX, sY, sW, sH);
      doc.setFontSize(7);
      doc.setTextColor(59, 130, 246);
      doc.text(`R${r + 1}C${c + 1} (${template.stickerWidth}x${template.stickerHeight})`, sX + sW / 2, sY + sH / 2, {
        align: 'center',
        baseline: 'middle',
      });
    }
  }

  return doc;
}
