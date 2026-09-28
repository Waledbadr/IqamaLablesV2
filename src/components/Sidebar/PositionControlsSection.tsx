import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { StepSize } from '../../types';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { NumericInput } from '../common/NumericInput';

import { getUnitLabel } from '../../lib/units';

export const PositionControlsSection: React.FC = () => {
  const {
    template,
    setGlobalOffset,
    nudgeGlobalOffset,
    stepSize,
    setStepSize,
    selectedStickerIndex,
    nudgeSelectedSticker,
    resetSelectedStickerOffset,
    resetAllPositions,
    getActivePageLayout,
    setActiveDimensionHighlight,
    measurementUnit,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const isAr = language === 'ar';
  const unitLabel = getUnitLabel(measurementUnit, language);
  const activePage = getActivePageLayout();
  const selectedSticker =
    selectedStickerIndex !== null
      ? activePage?.stickers.find((s) => s.index === selectedStickerIndex)
      : null;

  const stepOptions: StepSize[] = [0.1, 0.5, 1.0];

  const handleResetAll = () => {
    resetAllPositions();
  };

  return (
    <div className="space-y-2.5">
      {/* Step Size Selector */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-md border border-slate-200 dark:border-slate-700/80">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {t('stepSize')}:
        </span>
        <div className="flex items-center gap-1">
          {stepOptions.map((sz) => (
            <button
              key={sz}
              onClick={() => setStepSize(sz)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                stepSize === sz
                  ? 'bg-sky-500 text-slate-950 shadow-2xs'
                  : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sz} {language === 'ar' ? 'مم' : 'mm'}
            </button>
          ))}
        </div>
      </div>

      {/* Global Offset Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            <span>{t('globalOffset')} ({unitLabel})</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div
            onMouseEnter={() => setActiveDimensionHighlight('globalOffsetX')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'globalOffsetX' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 cursor-pointer hover:text-sky-500">
              {t('offsetX')} ({unitLabel})
            </span>
            <NumericInput
              step={stepSize}
              min={-100}
              max={100}
              fallbackValue={0}
              dimensionKey="globalOffsetX"
              value={template.globalOffsetX}
              onChange={(val) => setGlobalOffset(val, template.globalOffsetY)}
            />
          </div>

          <div
            onMouseEnter={() => setActiveDimensionHighlight('globalOffsetY')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'globalOffsetY' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 cursor-pointer hover:text-sky-500">
              {t('offsetY')} ({unitLabel})
            </span>
            <NumericInput
              step={stepSize}
              min={-100}
              max={100}
              fallbackValue={0}
              dimensionKey="globalOffsetY"
              value={template.globalOffsetY}
              onChange={(val) => setGlobalOffset(template.globalOffsetX, val)}
            />
          </div>
        </div>

        {/* Global D-Pad Controls */}
        <div className="flex items-center justify-center pt-0.5">
          <div className="inline-grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <div />
            <button
              onClick={() => nudgeGlobalOffset(0, -stepSize)}
              className="p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-transform"
              title={language === 'ar' ? 'تحريك الكل لأعلى' : 'Nudge All Up'}
            >
              <ArrowUp className="w-3.5 h-3.5 mx-auto" />
            </button>
            <div />

            <button
              onClick={() => nudgeGlobalOffset(-stepSize, 0)}
              className="p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-transform"
              title={language === 'ar' ? 'تحريك الكل لليسار' : 'Nudge All Left'}
            >
              <ArrowLeft className="w-3.5 h-3.5 mx-auto" />
            </button>
            <div className="flex items-center justify-center text-[9px] font-mono font-bold text-slate-400">
              {language === 'ar' ? 'الكل' : 'ALL'}
            </div>
            <button
              onClick={() => nudgeGlobalOffset(stepSize, 0)}
              className="p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-transform"
              title={language === 'ar' ? 'تحريك الكل لليمين' : 'Nudge All Right'}
            >
              <ArrowRight className="w-3.5 h-3.5 mx-auto" />
            </button>

            <div />
            <button
              onClick={() => nudgeGlobalOffset(0, stepSize)}
              className="p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 transition-transform"
              title={language === 'ar' ? 'تحريك الكل لأسفل' : 'Nudge All Down'}
            >
              <ArrowDown className="w-3.5 h-3.5 mx-auto" />
            </button>
            <div />
          </div>
        </div>
      </div>

      {/* Selected Sticker Detail Card */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{t('selectedSticker')}</span>
          {selectedSticker && (
            <span className="text-[9px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold px-1.5 py-0.2 rounded border border-sky-500/20">
              #{selectedSticker.displayIndex}
            </span>
          )}
        </label>

        {selectedSticker ? (
          <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-md border border-slate-200 dark:border-slate-700 space-y-1.5">
            {/* Metadata Table */}
            <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-[10px]">
              <div className="text-slate-500 dark:text-slate-400">{t('employeeNumber')}:</div>
              <div className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                {selectedSticker.employeeNumber || (language === 'ar' ? 'غير معين' : 'Unassigned')}
              </div>

              <div className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'الحالة:' : 'Status:'}</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedSticker.status === 'assigned'
                  ? (language === 'ar' ? 'مطبوع' : 'Assigned')
                  : selectedSticker.status === 'used'
                  ? (language === 'ar' ? 'مستعمل' : 'Used')
                  : (language === 'ar' ? 'متاح' : 'Available')}
              </div>

              <div className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'الموضع الأساسي:' : 'Base Pos:'}</div>
              <div className="font-mono text-slate-600 dark:text-slate-400">
                X:{selectedSticker.baseX} Y:{selectedSticker.baseY}
              </div>

              <div className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'الإزاحة الفردية:' : 'Individual:'}</div>
              <div className="font-mono font-bold text-sky-600 dark:text-sky-400">
                X:{selectedSticker.offsetX > 0 ? '+' : ''}{selectedSticker.offsetX} Y:{selectedSticker.offsetY > 0 ? '+' : ''}{selectedSticker.offsetY} {language === 'ar' ? 'مم' : 'mm'}
              </div>

              <div className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'الموضع النهائي:' : 'Final Pos:'}</div>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                X:{selectedSticker.finalX} Y:{selectedSticker.finalY} {language === 'ar' ? 'مم' : 'mm'}
              </div>
            </div>

            {/* Individual Nudge D-Pad */}
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {language === 'ar' ? 'تحريك دقيق:' : 'Precision Nudge:'}
              </span>
              <div className="inline-grid grid-cols-3 gap-0.5">
                <div />
                <button
                  onClick={() => nudgeSelectedSticker(0, -stepSize)}
                  className="p-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95"
                >
                  <ArrowUp className="w-3 h-3 mx-auto" />
                </button>
                <div />

                <button
                  onClick={() => nudgeSelectedSticker(-stepSize, 0)}
                  className="p-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95"
                >
                  <ArrowLeft className="w-3 h-3 mx-auto" />
                </button>
                <div />
                <button
                  onClick={() => nudgeSelectedSticker(stepSize, 0)}
                  className="p-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95"
                >
                  <ArrowRight className="w-3 h-3 mx-auto" />
                </button>

                <div />
                <button
                  onClick={() => nudgeSelectedSticker(0, stepSize)}
                  className="p-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95"
                >
                  <ArrowDown className="w-3 h-3 mx-auto" />
                </button>
                <div />
              </div>
            </div>

            {selectedSticker.isCustomMoved && (
              <button
                onClick={resetSelectedStickerOffset}
                className="w-full py-0.5 text-[10px] text-amber-600 hover:text-amber-700 font-medium hover:underline flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{language === 'ar' ? 'إعادة تعيين إزاحة هذا الاستيكر فقط' : 'Reset this sticker only'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 text-center rounded-md border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-[10px]">
            {language === 'ar' ? 'انقر على أي استيكر لتعديل إحداثياته بدقة' : 'Click on any sticker to fine-tune its position'}
          </div>
        )}
      </div>

      {/* Reset All Button */}
      <button
        onClick={handleResetAll}
        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span>{t('resetAllPositions')}</span>
      </button>
    </div>
  );
};
