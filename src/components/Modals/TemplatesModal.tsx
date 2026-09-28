import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { StickerTemplate } from '../../types';
import { Layout, Plus, Trash2, Check, X, Star } from 'lucide-react';

export const TemplatesModal: React.FC = () => {
  const {
    isTemplatesModalOpen,
    setTemplatesModalOpen,
    savedTemplates,
    template,
    setTemplate,
    saveCurrentTemplate,
    removeCustomTemplate,
    defaultTemplateId,
    setDefaultTemplate,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isTemplatesModalOpen) return null;

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    saveCurrentTemplate(newTemplateName.trim(), saveAsDefault);
    setNewTemplateName('');
    setSaveAsDefault(false);
    setIsCreating(false);
  };

  const handleSelectTemplate = (tpl: StickerTemplate) => {
    setTemplate(tpl);
    setTemplatesModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-sky-500" />
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('manageTemplatesTitle')}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? 'اختر قالباً جاهزاً، حدد القالب الافتراضي، أو احفظ أبعاد استيكراتك المخصصة'
                  : 'Choose a preset, set your default template, or save custom sticker sizes'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setTemplatesModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Create New Template */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-dashed border-sky-500/40 hover:border-sky-500 hover:bg-sky-500/5 text-sky-600 dark:text-sky-400 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('saveCurrentAsNew')}</span>
            </button>
          ) : (
            <form
              onSubmit={handleSaveNew}
              className="p-2.5 rounded-md bg-sky-500/10 border border-sky-500/30 space-y-2"
            >
              <label className="text-[11px] font-bold text-sky-700 dark:text-sky-300 block">
                {language === 'ar' ? 'اسم القالب الجديد:' : 'New Template Name:'}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'مثال: استيكرات ملفات (5×8)' : 'e.g., Folder Stickers (5x8)'}
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  autoFocus
                  className="flex-1 text-xs p-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  disabled={!newTemplateName.trim()}
                  className="px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold shadow-2xs disabled:opacity-40"
                >
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500"
                />
                <span>{language === 'ar' ? 'تعيين هذا القالب كقالب افتراضي دائماً' : 'Set this template as default template'}</span>
              </label>
            </form>
          )}

          {/* Templates List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              {t('availableTemplates')}
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              {savedTemplates.map((tpl, idx) => {
                const isCurrent = tpl.id === template.id;
                const isDefault = tpl.id === defaultTemplateId;

                return (
                  <div
                    key={`${tpl.id}-${idx}`}
                    className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'border-sky-500/50 bg-sky-500/10 shadow-2xs ring-1 ring-sky-500/50'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectTemplate(tpl)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {language === 'ar' ? tpl.name : (tpl.nameEn || tpl.name)}
                        </span>

                        {isDefault && (
                          <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            {t('defaultTag')}
                          </span>
                        )}

                        {tpl.isPreset ? (
                          <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 py-0.2 rounded">
                            {language === 'ar' ? 'جاهز' : 'Preset'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono bg-sky-500/20 text-sky-600 dark:text-sky-400 px-1 py-0.2 rounded">
                            {language === 'ar' ? 'مخصص' : 'Custom'}
                          </span>
                        )}

                        {isCurrent && (
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            {t('activeTag')}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[9px] text-slate-700 dark:text-slate-300">
                          {tpl.paperWidth}×{tpl.paperHeight} {language === 'ar' ? 'مم' : 'mm'}
                        </span>
                        <span>•</span>
                        <span>
                          {tpl.columns}×{tpl.rows} ({tpl.columns * tpl.rows} {language === 'ar' ? 'استيكر' : 'stickers'})
                        </span>
                        <span>•</span>
                        <span>
                          {tpl.stickerWidth}×{tpl.stickerHeight} {language === 'ar' ? 'مم' : 'mm'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Set Default Button */}
                      {!isDefault ? (
                        <button
                          onClick={() => setDefaultTemplate(tpl.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center gap-1 text-[11px]"
                          title={t('setDefaultTemplate')}
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[10px]">{t('setDefaultTemplate')}</span>
                        </button>
                      ) : (
                        <span className="p-1.5 text-amber-500 flex items-center gap-0.5 text-[10px] font-bold" title={t('isDefaultTemplate')}>
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                        </span>
                      )}

                      <button
                        onClick={() => handleSelectTemplate(tpl)}
                        className="px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold shadow-2xs"
                      >
                        {t('apply')}
                      </button>

                      {!tpl.isPreset && (
                        <button
                          onClick={() => removeCustomTemplate(tpl.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title={language === 'ar' ? 'حذف القالب' : 'Delete Template'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={() => setTemplatesModalOpen(false)}
            className="px-4 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
