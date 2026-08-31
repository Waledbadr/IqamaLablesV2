import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { PageOrientation } from '../../types';

export const SheetSettingsSection: React.FC = () => {
  const {
    template,
    updateTemplateField,
    savedTemplates,
    setTemplate,
    setTemplatesModalOpen,
  } = usePrintStore();

  const handlePresetChange = (templateId: string) => {
    if (templateId === 'manage') {
      setTemplatesModalOpen(true);
      return;
    }
    const found = savedTemplates.find((t) => t.id === templateId);
    if (found) {
      setTemplate(found);
    }
  };

  const isLandscape = template.orientation === 'landscape';

  const toggleOrientation = (orient: PageOrientation) => {
    updateTemplateField('orientation', orient);
  };

  return (
    <div className="space-y-2.5">
      {/* Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            قوالب الاستيكرات الجاهزة
          </label>
          <button
            onClick={() => setTemplatesModalOpen(true)}
            className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
          >
            إدارة القوالب
          </button>
        </div>

        <select
          value={template.id}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full text-xs p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-sky-500 font-sans"
        >
          {savedTemplates.map((tpl, idx) => (
            <option key={`${tpl.id}-${idx}`} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
          <option value="manage">⚙️ إدارة وحفظ القوالب المخصصة...</option>
        </select>
      </div>

      {/* Orientation */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          اتجاه الصفحة (Page Orientation)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => toggleOrientation('portrait')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
              !isLandscape
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="w-2.5 h-3.5 border border-current rounded-xs" />
            <span>عمودي (Portrait)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleOrientation('landscape')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
              isLandscape
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="w-3.5 h-2.5 border border-current rounded-xs" />
            <span>أفقي (Landscape)</span>
          </button>
        </div>
      </div>

      {/* Numbering / Flow Direction */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          اتجاه وبدء الترقيم (Flow Direction)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => updateTemplateField('flowDirection', 'rtl')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
              template.flowDirection !== 'ltr'
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="يبدأ الاستيكر رقم 1 من أعلى اليمين ثم يمتد لليسار (مناسب للغة العربية)"
          >
            <span className="font-mono text-xs">➡️</span>
            <span>من اليمين لليسار (RTL)</span>
          </button>

          <button
            type="button"
            onClick={() => updateTemplateField('flowDirection', 'ltr')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
              template.flowDirection === 'ltr'
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="يبدأ الاستيكر رقم 1 من أعلى اليسار ثم يمتد لليمين (LTR)"
          >
            <span className="font-mono text-xs">⬅️</span>
            <span>من اليسار لليمين (LTR)</span>
          </button>
        </div>
      </div>

      {/* Margins (mm) */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          هوامش الورقة (بالمليمتر mm)
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">علوي (Top)</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={template.marginTop}
                onChange={(e) => updateTemplateField('marginTop', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">سفلي (Bottom)</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={template.marginBottom}
                onChange={(e) => updateTemplateField('marginBottom', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">أيمن (Right)</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={template.marginRight}
                onChange={(e) => updateTemplateField('marginRight', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">أيسر (Left)</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={template.marginLeft}
                onChange={(e) => updateTemplateField('marginLeft', Number(e.target.value))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">مم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
