import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { calculateGeometry } from '../../lib/geometry';
import { Grid } from 'lucide-react';

export const StickerSettingsSection: React.FC = () => {
  const { template, updateTemplateField } = usePrintStore();
  const geometry = calculateGeometry(template);

  return (
    <div className="space-y-2.5">
      {/* Live Calculated Stats Pill */}
      <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded-md text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-200 font-bold">
          <Grid className="w-3.5 h-3.5 text-sky-500" />
          <span>توزيع الشبكة:</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-sky-600 dark:text-sky-400">
          <span>{geometry.columns} أعمدة</span>
          <span>×</span>
          <span>{geometry.rows} صفوف</span>
          <span className="bg-sky-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-bold">
            {geometry.totalStickers} استيكر
          </span>
        </div>
      </div>

      {/* Dimensions Inputs */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          أبعاد الاستيكر الفردي (بالمليمتر mm)
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">العرض (Width)</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="5"
                max="210"
                value={template.stickerWidth}
                onChange={(e) => updateTemplateField('stickerWidth', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">الارتفاع (Height)</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="5"
                max="297"
                value={template.stickerHeight}
                onChange={(e) => updateTemplateField('stickerHeight', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gaps Inputs */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          المسافات الفاصلة (Gaps)
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">فاصل أفقي</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={template.horizontalGap}
                onChange={(e) => updateTemplateField('horizontalGap', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">فاصل رأسي</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={template.verticalGap}
                onChange={(e) => updateTemplateField('verticalGap', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Overrides for Columns and Rows */}
      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">تحديد عدد الأعمدة والصفوف يدوياً:</span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">الأعمدة (Cols)</span>
            <input
              type="number"
              min="1"
              max="20"
              value={template.columns}
              onChange={(e) => updateTemplateField('columns', Math.max(1, Number(e.target.value)))}
              className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">الصفوف (Rows)</span>
            <input
              type="number"
              min="1"
              max="40"
              value={template.rows}
              onChange={(e) => updateTemplateField('rows', Math.max(1, Number(e.target.value)))}
              className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
