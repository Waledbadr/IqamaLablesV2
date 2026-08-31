import React from 'react';
import { usePrintStore } from '../store/usePrintStore';

export const PrintPortal: React.FC = () => {
  const { template, calibration, getAssignmentResult } = usePrintStore();
  const assignment = getAssignmentResult();

  const isLandscape = template.orientation === 'landscape';
  const rawPageWidth = isLandscape
    ? Math.max(template.paperWidth, template.paperHeight)
    : Math.min(template.paperWidth, template.paperHeight);
  const rawPageHeight = isLandscape
    ? Math.min(template.paperWidth, template.paperHeight)
    : Math.max(template.paperWidth, template.paperHeight);

  const cal = calibration || { scaleX: 1.0, scaleY: 1.0, offsetX: 0, offsetY: 0 };

  return (
    <div id="print-portal" className="hidden print:block">
      <style>{`
        @page {
          size: ${rawPageWidth}mm ${rawPageHeight}mm ${isLandscape ? 'landscape' : 'portrait'};
          margin: 0mm;
        }
      `}</style>

      {assignment.pages.map((page, pageIdx) => (
        <div
          key={page.pageIndex}
          className={`relative overflow-hidden bg-white ${pageIdx < assignment.pages.length - 1 ? 'print-page-break' : ''}`}
          style={{
            width: `${rawPageWidth}mm`,
            height: `${rawPageHeight}mm`,
            position: 'relative',
          }}
        >
          {page.stickers.map((sticker) => {
            if (sticker.status !== 'assigned' || !sticker.employeeNumber) {
              return null;
            }

            const calibratedX = sticker.finalX * cal.scaleX + cal.offsetX;
            const calibratedY = sticker.finalY * cal.scaleY + cal.offsetY;
            const calibratedW = sticker.width * cal.scaleX;
            const calibratedH = sticker.height * cal.scaleY;

            return (
              <div
                key={sticker.index}
                style={{
                  position: 'absolute',
                  left: `${calibratedX}mm`,
                  top: `${calibratedY}mm`,
                  width: `${calibratedW}mm`,
                  height: `${calibratedH}mm`,
                  fontFamily: template.fontFamily || 'Cairo, sans-serif',
                  fontSize: `${template.fontSize || 16}pt`,
                  fontWeight: template.fontWeight || 'bold',
                  fontStyle: template.italic ? 'italic' : 'normal',
                  color: template.textColor || '#000000',
                  textAlign: template.textAlign || 'center',
                  display: 'flex',
                  alignItems:
                    template.verticalAlign === 'top'
                      ? 'flex-start'
                      : template.verticalAlign === 'bottom'
                      ? 'flex-end'
                      : 'center',
                  justifyContent:
                    template.textAlign === 'left'
                      ? 'flex-start'
                      : template.textAlign === 'right'
                      ? 'flex-end'
                      : 'center',
                  padding: '1mm 2mm',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  lineHeight: '1.2',
                }}
              >
                <span>
                  {template.prefix}
                  {sticker.employeeNumber}
                  {template.suffix}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
