import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { calculateGeometry } from '../../lib/geometry';
import { PageOrientation } from '../../types';
import { Star, Check, Sparkles, FileText, AlertTriangle, Info, Maximize2 } from 'lucide-react';

export const SheetSettingsSection: React.FC = () => {
  const {
    template,
    updateTemplateField,
    savedTemplates,
    setTemplate,
    setTemplatesModalOpen,
    defaultTemplateId,
    setDefaultTemplate,
    pinCurrentTemplateAsDefault,
    updateCurrentTemplateInPlace,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const geometry = calculateGeometry(template);

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
  const isDefault = template.id === defaultTemplateId;

  const toggleOrientation = (orient: PageOrientation) => {
    updateTemplateField('orientation', orient);
  };

  // Detect if current paper width/height matches a known standard
  const minDim = Math.min(template.paperWidth, template.paperHeight);
  const maxDim = Math.max(template.paperWidth, template.paperHeight);

  let currentPaperStandard: 'A4' | 'A5' | 'Letter' | 'Custom' = 'Custom';
  if (Math.abs(minDim - 210) <= 1 && Math.abs(maxDim - 297) <= 1) {
    currentPaperStandard = 'A4';
  } else if (Math.abs(minDim - 148) <= 1 && Math.abs(maxDim - 210) <= 1) {
    currentPaperStandard = 'A5';
  } else if (Math.abs(minDim - 215.9) <= 2 && Math.abs(maxDim - 279.4) <= 2) {
    currentPaperStandard = 'Letter';
  }

  const handleSelectPaperStandard = (standard: 'A4' | 'A5' | 'Letter') => {
    let w = 210;
    let h = 297;
    if (standard === 'A5') {
      w = 148;
      h = 210;
    } else if (standard === 'Letter') {
      w = 215.9;
      h = 279.4;
    }

    if (isLandscape) {
      updateTemplateField('paperWidth', Math.max(w, h));
      updateTemplateField('paperHeight', Math.min(w, h));
    } else {
      updateTemplateField('paperWidth', Math.min(w, h));
      updateTemplateField('paperHeight', Math.max(w, h));
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {t('presetTemplate')}
          </label>
          <button
            onClick={() => setTemplatesModalOpen(true)}
            className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
          >
            {language === 'ar' ? 'إدارة القوالب' : 'Manage Templates'}
          </button>
        </div>

        <select
          value={template.id}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full text-xs p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-sky-500 font-sans"
        >
          {savedTemplates.map((tpl, idx) => (
            <option key={`${tpl.id}-${idx}`} value={tpl.id}>
              {tpl.id === defaultTemplateId ? '★ ' : ''}
              {language === 'ar' ? tpl.name : (tpl.nameEn || tpl.name)}
            </option>
          ))}
          <option value="manage">{language === 'ar' ? '⚙️ إدارة وحفظ القوالب المخصصة...' : '⚙️ Manage & Save Custom Templates...'}</option>
        </select>

        {/* Pin Template & Styling as Permanent Default */}
        <div className="mt-2 flex items-center justify-between gap-1.5 flex-wrap">
          {isDefault ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{t('isDefaultTemplate')}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={pinCurrentTemplateAsDefault}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors"
              title={t('pinCurrentAsDefaultDesc')}
            >
              <Star className="w-3 h-3 text-slate-400 hover:text-amber-500" />
              <span>{t('pinCurrentAsDefault')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={updateCurrentTemplateInPlace}
            className="text-[10px] text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:underline ms-auto"
            title="حفظ التعديلات والتنسيق الحالي على القالب"
          >
            {language === 'ar' ? 'حفظ التنسيق الحالي' : 'Save Style'}
          </button>
        </div>
      </div>

      {/* Paper Dimensions & Size Section */}
      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>{t('paperDimensions')}</span>
          </label>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            {template.paperWidth} × {template.paperHeight} mm ({currentPaperStandard === 'Custom' ? (language === 'ar' ? 'مخصص' : 'Custom') : currentPaperStandard})
          </span>
        </div>

        {/* Paper Standard Quick Presets */}
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => handleSelectPaperStandard('A4')}
            className={`py-1 px-1.5 rounded text-[10px] font-bold border transition-all text-center ${
              currentPaperStandard === 'A4'
                ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-2xs font-extrabold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="210 × 297 mm"
          >
            A4 (210×297)
          </button>

          <button
            type="button"
            onClick={() => handleSelectPaperStandard('A5')}
            className={`py-1 px-1.5 rounded text-[10px] font-bold border transition-all text-center ${
              currentPaperStandard === 'A5'
                ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-2xs font-extrabold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="148 × 210 mm (ورقة أصغر من A4)"
          >
            A5 (148×210)
          </button>

          <button
            type="button"
            onClick={() => handleSelectPaperStandard('Letter')}
            className={`py-1 px-1.5 rounded text-[10px] font-bold border transition-all text-center ${
              currentPaperStandard === 'Letter'
                ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-2xs font-extrabold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="216 × 279 mm"
          >
            Letter
          </button>
        </div>

        {/* Exact Paper Width and Height Inputs in mm */}
        <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('paperWidth')}</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="30"
                max="1000"
                value={template.paperWidth}
                onChange={(e) => updateTemplateField('paperWidth', Math.max(10, Number(e.target.value)))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">mm</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('paperHeight')}</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.5"
                min="30"
                max="1000"
                value={template.paperHeight}
                onChange={(e) => updateTemplateField('paperHeight', Math.max(10, Number(e.target.value)))}
                className="w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[10px] font-mono text-slate-400 ms-1">mm</span>
            </div>
          </div>
        </div>

        {/* Helpful Tip for sheets smaller than A4 */}
        <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-800 dark:text-sky-300 text-[10px] flex items-start gap-1 leading-snug">
          <Info className="w-3.5 h-3.5 shrink-0 text-sky-500 mt-0.5" />
          <span>{t('smallerThanA4Alert')}</span>
        </div>

        {/* Warning if Stickers Exceed Current Paper Dimensions */}
        {geometry.warnings.length > 0 && (
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-[10px] flex items-start gap-1 leading-snug">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-bold">{t('paperOverflowWarning')}</p>
              {geometry.warnings.map((w, idx) => (
                <p key={idx} className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">{w}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orientation */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          {t('orientation')}
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
            <span>{t('portrait')}</span>
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
            <span>{t('landscape')}</span>
          </button>
        </div>
      </div>

      {/* Numbering / Flow Direction */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          {t('flowDirection')}
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
            title="Starts top-right to left (RTL)"
          >
            <span className="font-mono text-xs">➡️</span>
            <span>{t('flowRTL')}</span>
          </button>

          <button
            type="button"
            onClick={() => updateTemplateField('flowDirection', 'ltr')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
              template.flowDirection === 'ltr'
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="Starts top-left to right (LTR)"
          >
            <span className="font-mono text-xs">⬅️</span>
            <span>{t('flowLTR')}</span>
          </button>
        </div>
      </div>

      {/* Margins (mm) */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
          {t('margins')}
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('marginTop')}</span>
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
              <span className="text-[10px] font-mono text-slate-400 ms-1">mm</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('marginBottom')}</span>
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
              <span className="text-[10px] font-mono text-slate-400 ms-1">mm</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('marginRight')}</span>
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
              <span className="text-[10px] font-mono text-slate-400 ms-1">mm</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">{t('marginLeft')}</span>
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
              <span className="text-[10px] font-mono text-slate-400 ms-1">mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
