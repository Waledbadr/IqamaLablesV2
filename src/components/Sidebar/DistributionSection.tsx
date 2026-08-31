import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { calculateGeometry } from '../../lib/geometry';
import { Play, Ban, CheckCircle, RotateCcw, ArrowRightLeft } from 'lucide-react';

export const DistributionSection: React.FC = () => {
  const {
    startPosition,
    setStartPosition,
    template,
    updateTemplateField,
    currentPageIndex,
    selectedStickerIndex,
    toggleStickerUsed,
    markRowUsed,
    markColUsed,
    markAllUsed,
    clearAllUsed,
    clearAllUsedAllPages,
    usedStickersByPage,
    manualAssignmentsByPage,
    resetManualAssignments,
  } = usePrintStore();

  const geometry = calculateGeometry(template);
  const pageUsedCount = (usedStickersByPage[currentPageIndex] || []).length;
  const pageManualCount = Object.keys(manualAssignmentsByPage[currentPageIndex] || {}).length;
  const allUsedCount = Object.values(usedStickersByPage).reduce(
    (acc, arr) => acc + (arr ? arr.length : 0),
    0
  );

  const isSelectedStickerUsed =
    selectedStickerIndex !== null &&
    (usedStickersByPage[currentPageIndex] || []).includes(selectedStickerIndex);

  const handleMarkAllUsed = () => {
    markAllUsed(currentPageIndex);
  };

  const handleClearCurrentPageUsed = () => {
    clearAllUsed(currentPageIndex);
  };

  const handleClearAllPagesAndReset = () => {
    clearAllUsedAllPages(true);
  };

  return (
    <div className="space-y-2.5">
      {/* Numbering & Flow Direction Quick Selector */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
          <span className="flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-sky-500" />
            <span>اتجاه وبدء الترقيم:</span>
          </span>
          <span className="text-[10px] font-mono text-sky-500 font-bold">
            {template.flowDirection === 'ltr' ? 'يسار ⬅️ يمين' : 'يمين ➡️ يسار'}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => updateTemplateField('flowDirection', 'rtl')}
            className={`py-1 px-2 rounded-md font-medium border text-center transition-all ${
              template.flowDirection !== 'ltr'
                ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            من اليمين لليسار (RTL)
          </button>
          <button
            type="button"
            onClick={() => updateTemplateField('flowDirection', 'ltr')}
            className={`py-1 px-2 rounded-md font-medium border text-center transition-all ${
              template.flowDirection === 'ltr'
                ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            من اليسار لليمين (LTR)
          </button>
        </div>
      </div>

      {/* Start Position Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Play className="w-3 h-3 text-sky-500" />
            <span>ابدأ الطباعة من الاستيكر رقم:</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            (1 إلى {geometry.totalStickers})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={Math.max(1, geometry.totalStickers)}
            value={startPosition}
            onChange={(e) => setStartPosition(Math.max(1, Number(e.target.value)))}
            className="w-20 text-xs font-mono font-bold p-1.5 rounded-md border border-sky-500/30 bg-white dark:bg-slate-950 text-sky-600 dark:text-sky-400 outline-none focus:ring-1 focus:ring-sky-500 text-center"
          />
          <button
            type="button"
            onClick={() => setStartPosition(1)}
            disabled={startPosition === 1}
            className="px-2 py-1 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
            title="إعادة التعيين إلى الاستيكر الأول #1"
          >
            بدء من #1
          </button>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
          يتم تخطي الاستيكرات السابقة والمستعملة تلقائياً
        </p>

        {pageManualCount > 0 && (
          <div className="mt-2 p-1.5 rounded-md bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
              تم تعديل ترتيب {pageManualCount} استيكر بالسحب
            </span>
            <button
              type="button"
              onClick={() => resetManualAssignments(currentPageIndex)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-700 dark:text-sky-300 font-bold transition-colors"
            >
              استعادة الترتيب التلقائي
            </button>
          </div>
        )}
      </div>

      {/* Used Stickers Section */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Ban className="w-3 h-3 text-rose-500" />
            <span>الورق المستعمل جزئياً</span>
          </label>
          <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            {pageUsedCount} مستعمل في الصفحة
          </span>
        </div>

        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          انقر نقراً مزدوجاً على أي استيكر لتبديل حالته كمستعمل/متاح:
        </p>

        {/* Selected Sticker Quick Toggle */}
        {selectedStickerIndex !== null && (
          <button
            type="button"
            onClick={() => toggleStickerUsed(currentPageIndex, selectedStickerIndex)}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold border transition-all ${
              isSelectedStickerUsed
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isSelectedStickerUsed ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>إتاحة الاستيكر المحدد #{selectedStickerIndex + 1} للطباعة</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>تعليم الاستيكر المحدد #{selectedStickerIndex + 1} كمستعمل</span>
              </>
            )}
          </button>
        )}

        {/* Batch Tools: Mark Row / Mark Col */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-[9px] font-mono text-slate-400 block mb-1">تعليم صف كامل:</span>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: Math.min(geometry.rows, 8) }).map((_, r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => markRowUsed(currentPageIndex, r)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  title={`تعليم الصف ${r + 1} كمستعمل`}
                >
                  ص{r + 1}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[9px] font-mono text-slate-400 block mb-1">تعليم عمود كامل:</span>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: Math.min(geometry.columns, 6) }).map((_, c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => markColUsed(currentPageIndex, c)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  title={`تعليم العمود ${c + 1} كمستعمل`}
                >
                  ع{c + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset / Mark All Action Buttons */}
        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleMarkAllUsed}
              className="py-1 px-1.5 rounded-md text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center transition-colors"
            >
              تعليم صفحة كاملة
            </button>
            <button
              type="button"
              onClick={handleClearCurrentPageUsed}
              className="py-1 px-1.5 rounded-md text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center transition-colors flex items-center justify-center gap-1"
              title="مسح جميع الاستيكرات المستعملة في الصفحة الحالية"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح المستعمل</span>
            </button>
          </div>

          {(allUsedCount > 0 || startPosition > 1) && (
            <button
              type="button"
              onClick={handleClearAllPagesAndReset}
              className="w-full py-1 px-2 rounded-md text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-center transition-colors"
            >
              مسح المستعمل في كل الصفحات وبدء من #1
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
