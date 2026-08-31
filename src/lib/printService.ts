import { PageLayout, PrinterCalibration, StickerTemplate } from '../types';

export interface PrintOptions {
  template: StickerTemplate;
  pages: PageLayout[];
  calibration?: PrinterCalibration;
}

/**
 * Triggers physical printing in the browser with guaranteed vector precision
 * and iframe-safe printing fallback.
 */
export function triggerBrowserPrint(options?: PrintOptions) {
  // If no options provided or direct window print is safe, trigger print
  if (!options || !options.pages || options.pages.length === 0) {
    window.print();
    return;
  }

  const { template, pages, calibration } = options;
  const isLandscape = template.orientation === 'landscape';
  const rawPageWidth = isLandscape
    ? Math.max(template.paperWidth, template.paperHeight)
    : Math.min(template.paperWidth, template.paperHeight);
  const rawPageHeight = isLandscape
    ? Math.min(template.paperWidth, template.paperHeight)
    : Math.max(template.paperWidth, template.paperHeight);

  const cal = calibration || { scaleX: 1.0, scaleY: 1.0, offsetX: 0, offsetY: 0 };

  // Construct self-contained print HTML document
  let pagesHtml = '';

  pages.forEach((page, pageIdx) => {
    let stickersHtml = '';

    page.stickers.forEach((sticker) => {
      if (sticker.status !== 'assigned' || !sticker.employeeNumber) {
        return;
      }

      const calibratedX = sticker.finalX * cal.scaleX + cal.offsetX;
      const calibratedY = sticker.finalY * cal.scaleY + cal.offsetY;
      const calibratedW = sticker.width * cal.scaleX;
      const calibratedH = sticker.height * cal.scaleY;

      const alignH =
        template.textAlign === 'left'
          ? 'flex-start'
          : template.textAlign === 'right'
          ? 'flex-end'
          : 'center';

      const alignV =
        template.verticalAlign === 'top'
          ? 'flex-start'
          : template.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'center';

      stickersHtml += `
        <div style="
          position: absolute;
          left: ${calibratedX}mm;
          top: ${calibratedY}mm;
          width: ${calibratedW}mm;
          height: ${calibratedH}mm;
          font-family: ${template.fontFamily || 'Cairo, sans-serif'};
          font-size: ${template.fontSize || 16}pt;
          font-weight: ${template.fontWeight || 'bold'};
          font-style: ${template.italic ? 'italic' : 'normal'};
          color: ${template.textColor || '#000000'};
          display: flex;
          align-items: ${alignV};
          justify-content: ${alignH};
          text-align: ${template.textAlign || 'center'};
          padding: 1mm 2mm;
          box-sizing: border-box;
          overflow: hidden;
          line-height: 1.2;
        ">
          <span>${template.prefix || ''}${sticker.employeeNumber}${template.suffix || ''}</span>
        </div>
      `;
    });

    const isLast = pageIdx === pages.length - 1;
    pagesHtml += `
      <div class="print-page ${!isLast ? 'page-break' : ''}" style="
        width: ${rawPageWidth}mm;
        height: ${rawPageHeight}mm;
        position: relative;
        overflow: hidden;
        background: #ffffff;
        page-break-after: ${!isLast ? 'always' : 'auto'};
        break-after: ${!isLast ? 'page' : 'auto'};
      ">
        ${stickersHtml}
      </div>
    `;
  });

  const fullHtml = `<!DOCTYPE html>
<html dir="${document.documentElement.dir || 'rtl'}" lang="${document.documentElement.lang || 'ar'}">
<head>
  <meta charset="utf-8">
  <title>طباعة الاستيكرات</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Tajawal:wght@400;700;800&family=Almarai:wght@400;700;800&family=Amiri:wght@400;700&family=Alexandria:wght@400;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${rawPageWidth}mm ${rawPageHeight}mm ${isLandscape ? 'landscape' : 'portrait'};
      margin: 0mm;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-page {
      position: relative;
      margin: 0 auto;
      background: #ffffff;
    }
    .page-break {
      page-break-after: always !important;
      break-after: page !important;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  // Use hidden iframe method for clean isolation and perfect printing
  let printIframe = document.getElementById('sticker-print-iframe') as HTMLIFrameElement;
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'sticker-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.style.visibility = 'hidden';
    document.body.appendChild(printIframe);
  }

  const doc = printIframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(fullHtml);
    doc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print()', err);
        window.print();
      }
    }, 400);
  } else {
    window.print();
  }
}
