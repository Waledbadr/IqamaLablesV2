import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { generateStickersPDF } from '../../lib/pdfGenerator';
import { triggerBrowserPrint } from '../../lib/printService';
import {
  Printer,
  FileDown,
  X,
  AlertCircle,
  Eye,
  CheckCircle,
  Layers,
} from 'lucide-react';

export const PrintPreviewModal: React.FC = () => {
  const {
    isPrintPreviewOpen,
    setPrintPreviewOpen,
    template,
    calibration,
    getAssignmentResult,
  } = usePrintStore();

  const [showOutlines, setShowOutlines] = useState(false);
  const assignment = getAssignmentResult();

  if (!isPrintPreviewOpen) return null;

  const isLandscape = template.orientation === 'landscape';
  const rawPageWidth = isLandscape
    ? Math.max(template.paperWidth, template.paperHeight)
    : Math.min(template.paperWidth, template.paperHeight);
  const rawPageHeight = isLandscape
    ? Math.min(template.paperWidth, template.paperHeight)
    : Math.max(template.paperWidth, template.paperHeight);

  const handleNativePrint = () => {
    triggerBrowserPrint({
      template,
      pages: assignment.pages,
      calibration,
    });
  };

  const handleExportPDF = () => {
    const doc = generateStickersPDF({
      template,
      pages: assignment.pages,
      calibration,
      showOutlines,
    });
    const safeName = (template.name || 'stickers').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
    doc.save(`StickerPrint_${safeName}_${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                معاينة الطباعة النهائية (Print Preview)
              </h2>
              <p className="text-[11px] text-stone-500">
                يظهر هنا فقط ما ستتم طباعته على الورق الفعلي بدقة المتجهات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintPreviewOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions Alert Banner */}
        <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>تنبيه هام لدقة الطباعة:</strong> في نافذة الطباعة اختر حجم الورق <strong>A4</strong>، والمقياس <strong>100%</strong> (أو Actual Size)، وعطّل خيار Fit to Page والهوامش = <strong>بلا هوامش (None)</strong>.
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold">
            <input
              type="checkbox"
              checked={showOutlines}
              onChange={(e) => setShowOutlines(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>حدود إرشادية خفيفة</span>
          </label>
        </div>

        {/* Modal Body: Scrollable Sheet Previews */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100 dark:bg-stone-950 flex flex-col items-center gap-6">
          {assignment.pages.map((page, idx) => (
            <div key={page.pageIndex} className="flex flex-col items-center gap-2">
              <div className="text-xs font-mono font-semibold text-stone-500">
                صفحة {idx + 1} من {assignment.pages.length} ({page.totalAssigned} استيكر مطبوع)
              </div>

              {/* Exact Proportion Sheet */}
              <div
                className="bg-white shadow-xl border border-stone-300 relative overflow-hidden"
                style={{
                  width: `${rawPageWidth * 2.5}px`,
                  height: `${rawPageHeight * 2.5}px`,
                }}
              >
                {page.stickers.map((sticker) => {
                  if (sticker.status !== 'assigned' && !showOutlines) {
                    return null;
                  }

                  const sLeft = sticker.finalX * 2.5;
                  const sTop = sticker.finalY * 2.5;
                  const sWidth = sticker.width * 2.5;
                  const sHeight = sticker.height * 2.5;

                  return (
                    <div
                      key={sticker.index}
                      className={`absolute flex overflow-hidden p-1 ${
                        showOutlines ? 'border border-dashed border-stone-300' : ''
                      }`}
                      style={{
                        left: `${sLeft}px`,
                        top: `${sTop}px`,
                        width: `${sWidth}px`,
                        height: `${sHeight}px`,
                        fontFamily: template.fontFamily || 'Cairo, sans-serif',
                        fontSize: `${(template.fontSize || 16) * 0.7}px`,
                        fontWeight: template.fontWeight || 'bold',
                        fontStyle: template.italic ? 'italic' : 'normal',
                        color: template.textColor || '#000000',
                        justifyContent:
                          template.textAlign === 'left'
                            ? 'flex-start'
                            : template.textAlign === 'right'
                            ? 'flex-end'
                            : 'center',
                        alignItems:
                          template.verticalAlign === 'top'
                            ? 'flex-start'
                            : template.verticalAlign === 'bottom'
                            ? 'flex-end'
                            : 'center',
                      }}
                    >
                      {sticker.status === 'assigned' && (
                        <span className="truncate max-w-full">
                          {template.prefix}
                          {sticker.employeeNumber}
                          {template.suffix}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            إجمالي الصفحات: <strong>{assignment.pages.length}</strong> | إجمالي الموظفين المطبوعين: <strong>{assignment.assignedCount}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setPrintPreviewOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
            >
              إغلاق
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>تصدير ملف PDF متجهات</span>
            </button>

            <button
              onClick={handleNativePrint}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة مباشرة الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
