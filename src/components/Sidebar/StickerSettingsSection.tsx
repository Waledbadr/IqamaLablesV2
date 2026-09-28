import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { calculateGeometry } from '../../lib/geometry';
import { Grid, Eye } from 'lucide-react';
import { NumericInput } from '../common/NumericInput';
import { UnitSelector } from '../common/UnitSelector';
import { getUnitLabel } from '../../lib/units';

export const StickerSettingsSection: React.FC = () => {
  const { template, updateTemplateField, setActiveDimensionHighlight, measurementUnit, language } = usePrintStore();
  const { t } = useTranslation(language);
  const geometry = calculateGeometry(template);
  const isAr = language === 'ar';
  const unitLabel = getUnitLabel(measurementUnit, language);

  return (
    <div className="space-y-2.5">
      {/* Unit Context & Quick Switcher */}
      <div className="flex items-center justify-between px-1 py-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
          {isAr ? 'وحدة القياس الحالية:' : 'Active Unit:'}
        </span>
        <UnitSelector size="xs" />
      </div>

      {/* Live Calculated Stats Pill */}
      <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded-md text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-200 font-bold">
          <Grid className="w-3.5 h-3.5 text-sky-500" />
          <span>{isAr ? 'توزيع الشبكة:' : 'Grid layout:'}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-sky-600 dark:text-sky-400">
          <span>{geometry.columns} {isAr ? 'أعمدة' : 'cols'}</span>
          <span>×</span>
          <span>{geometry.rows} {isAr ? 'صفوف' : 'rows'}</span>
          <span className="bg-sky-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-bold">
            {geometry.totalStickers} {isAr ? 'استيكر' : 'stickers'}
          </span>
        </div>
      </div>

      {/* Dimensions Inputs */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          {isAr ? `أبعاد الاستيكر الواحد (${unitLabel})` : `Single Label Dimensions (${unitLabel})`}
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div
            onMouseEnter={() => setActiveDimensionHighlight('stickerWidth')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'stickerWidth' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 cursor-pointer hover:text-sky-600 transition-colors">
              {t('stickerWidth')} ({unitLabel})
            </span>
            <NumericInput
              step="0.5"
              min={5}
              max={500}
              fallbackValue={50}
              dimensionKey="stickerWidth"
              value={template.stickerWidth}
              onChange={(val) => updateTemplateField('stickerWidth', val)}
            />
          </div>

          <div
            onMouseEnter={() => setActiveDimensionHighlight('stickerHeight')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'stickerHeight' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 cursor-pointer hover:text-sky-600 transition-colors">
              {t('stickerHeight')} ({unitLabel})
            </span>
            <NumericInput
              step="0.5"
              min={5}
              max={500}
              fallbackValue={30}
              dimensionKey="stickerHeight"
              value={template.stickerHeight}
              onChange={(val) => updateTemplateField('stickerHeight', val)}
            />
          </div>
        </div>
      </div>

      {/* Gaps Inputs - المسافات الفاصلة */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>{isAr ? `المسافات الفاصلة بين الاستيكرات (${unitLabel})` : `Gaps between stickers (${unitLabel})`}</span>
          </label>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            <span>{isAr ? 'معايرة مباشرة' : 'Live guides'}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div
            onMouseEnter={() => setActiveDimensionHighlight('horizontalGap')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'horizontalGap' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">
              {t('horizontalGap')} ({unitLabel})
            </span>
            <NumericInput
              step="0.5"
              min={0}
              max={50}
              fallbackValue={0}
              dimensionKey="horizontalGap"
              value={template.horizontalGap}
              onChange={(val) => updateTemplateField('horizontalGap', val)}
            />
          </div>

          <div
            onMouseEnter={() => setActiveDimensionHighlight('verticalGap')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'verticalGap' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">
              {t('verticalGap')} ({unitLabel})
            </span>
            <NumericInput
              step="0.5"
              min={0}
              max={50}
              fallbackValue={0}
              dimensionKey="verticalGap"
              value={template.verticalGap}
              onChange={(val) => updateTemplateField('verticalGap', val)}
            />
          </div>
        </div>
      </div>

      {/* Custom Overrides for Columns and Rows */}
      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
          {language === 'ar' ? 'تحديد عدد الأعمدة والصفوف يدوياً:' : 'Override columns and rows manually:'}
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div
            onMouseEnter={() => setActiveDimensionHighlight('columns')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'columns' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 cursor-pointer hover:text-sky-500">
              {t('columns')}
            </span>
            <NumericInput
              step="1"
              min={1}
              max={25}
              fallbackValue={1}
              dimensionKey="columns"
              value={template.columns}
              onChange={(val) => updateTemplateField('columns', val)}
            />
          </div>

          <div
            onMouseEnter={() => setActiveDimensionHighlight('rows')}
            onMouseLeave={() => usePrintStore.getState().activeDimensionHighlight === 'rows' && setActiveDimensionHighlight(null)}
          >
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 cursor-pointer hover:text-sky-500">
              {t('rows')}
            </span>
            <NumericInput
              step="1"
              min={1}
              max={50}
              fallbackValue={1}
              dimensionKey="rows"
              value={template.rows}
              onChange={(val) => updateTemplateField('rows', val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
