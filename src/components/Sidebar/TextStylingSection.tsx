import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
} from 'lucide-react';

export const TextStylingSection: React.FC = () => {
  const { template, updateTemplateField } = usePrintStore();

  const fontFamilies = [
    { label: 'Cairo (الافتراضي)', value: 'Cairo' },
    { label: 'Tajawal', value: 'Tajawal' },
    { label: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic' },
    { label: 'JetBrains Mono (أرقام موحدة)', value: 'JetBrains Mono' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Courier (آلة كاتبة)', value: 'Courier' },
  ];

  return (
    <div className="space-y-2.5">
      {/* Font Family */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          نوع الخط (Font Family)
        </label>
        <select
          value={template.fontFamily}
          onChange={(e) => updateTemplateField('fontFamily', e.target.value)}
          className="w-full text-xs p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-sky-500 font-sans"
        >
          {fontFamilies.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size and Formatting */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            حجم الخط والنمط (Font Size)
          </label>
          <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">
            {template.fontSize} pt
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min="8"
            max="48"
            step="1"
            value={template.fontSize}
            onChange={(e) => updateTemplateField('fontSize', Number(e.target.value))}
            className="flex-1 accent-sky-500"
          />

          <input
            type="number"
            min="6"
            max="72"
            value={template.fontSize}
            onChange={(e) => updateTemplateField('fontSize', Number(e.target.value))}
            className="w-12 text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center"
          />

          {/* Bold toggle */}
          <button
            onClick={() =>
              updateTemplateField(
                'fontWeight',
                template.fontWeight === 'bold' || template.fontWeight === '800' ? 'normal' : 'bold'
              )
            }
            className={`p-1.5 rounded-md border transition-all ${
              template.fontWeight === 'bold' || template.fontWeight === '800'
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="عريض (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic toggle */}
          <button
            onClick={() => updateTemplateField('italic', !template.italic)}
            className={`p-1.5 rounded-md border transition-all ${
              template.italic
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="مائل (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alignment Controls */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          محاذاة النص داخل الاستيكر
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {/* Horizontal Alignment */}
          <div className="flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800/80">
            <button
              onClick={() => updateTemplateField('textAlign', 'right')}
              className={`flex-1 p-1 rounded flex items-center justify-center ${
                template.textAlign === 'right'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="محاذاة لليمين"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateTemplateField('textAlign', 'center')}
              className={`flex-1 p-1 rounded flex items-center justify-center ${
                template.textAlign === 'center'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="توسيط أفقي"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateTemplateField('textAlign', 'left')}
              className={`flex-1 p-1 rounded flex items-center justify-center ${
                template.textAlign === 'left'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vertical Alignment */}
          <div className="flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800/80">
            <button
              onClick={() => updateTemplateField('verticalAlign', 'top')}
              className={`flex-1 p-1 rounded flex items-center justify-center ${
                template.verticalAlign === 'top'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="أعلى"
            >
              <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateTemplateField('verticalAlign', 'middle')}
              className={`flex-1 p-1 rounded flex items-center justify-center ${
                template.verticalAlign === 'middle'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="توسيط رأسي"
            >
              <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateTemplateField('verticalAlign', 'bottom')}
              className={`flex-1 p-1 rounded flex items-center justify-center ${
                template.verticalAlign === 'bottom'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="أسفل"
            >
              <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Static Prefix and Suffix */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">نص بادئ (Prefix)</span>
          <input
            type="text"
            value={template.prefix || ''}
            onChange={(e) => updateTemplateField('prefix', e.target.value)}
            placeholder="مثال: رقم: "
            className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">نص لاحق (Suffix)</span>
          <input
            type="text"
            value={template.suffix || ''}
            onChange={(e) => updateTemplateField('suffix', e.target.value)}
            placeholder="مثال: #"
            className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Text & Background Colors */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">لون النص (Color)</span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={template.textColor || '#000000'}
              onChange={(e) => updateTemplateField('textColor', e.target.value)}
              className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0"
            />
            <input
              type="text"
              value={template.textColor}
              onChange={(e) => updateTemplateField('textColor', e.target.value)}
              className="flex-1 text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">استدارة الزوايا (Radius)</span>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={template.cornerRadiusMm || 0}
              onChange={(e) => updateTemplateField('cornerRadiusMm', Number(e.target.value))}
              className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
            <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
          </div>
        </div>
      </div>
    </div>
  );
};
