import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { StickerTemplate } from '../../types';
import { Layout, Plus, Trash2, Check, X } from 'lucide-react';

export const TemplatesModal: React.FC = () => {
  const {
    isTemplatesModalOpen,
    setTemplatesModalOpen,
    savedTemplates,
    template,
    setTemplate,
    saveCurrentTemplate,
    removeCustomTemplate,
  } = usePrintStore();

  const [newTemplateName, setNewTemplateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isTemplatesModalOpen) return null;

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    saveCurrentTemplate(newTemplateName.trim());
    setNewTemplateName('');
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
                إدارة قوالب الاستيكرات (Templates)
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                اختر قالباً جاهزاً أو احفظ أبعاد استيكراتك المخصصة
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
              <span>حفظ الإعدادات الحالية كقالب جديد</span>
            </button>
          ) : (
            <form
              onSubmit={handleSaveNew}
              className="p-2.5 rounded-md bg-sky-500/10 border border-sky-500/30 space-y-2"
            >
              <label className="text-[11px] font-bold text-sky-700 dark:text-sky-300 block">
                اسم القالب الجديد:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="مثال: استيكرات ملفات (5×8)"
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
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Templates List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              القوالب المتوفرة:
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              {savedTemplates.map((tpl, idx) => {
                const isCurrent = tpl.id === template.id;
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {tpl.name}
                        </span>
                        {tpl.isPreset ? (
                          <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 py-0.2 rounded">
                            افتراضي
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono bg-sky-500/20 text-sky-600 dark:text-sky-400 px-1 py-0.2 rounded">
                            مخصص
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            مفعّل
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>
                          {tpl.columns}×{tpl.rows} ({tpl.columns * tpl.rows} استيكر)
                        </span>
                        <span>•</span>
                        <span>
                          {tpl.stickerWidth}×{tpl.stickerHeight} مم
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSelectTemplate(tpl)}
                        className="px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold shadow-2xs"
                      >
                        تطبيق
                      </button>

                      {!tpl.isPreset && (
                        <button
                          onClick={() => removeCustomTemplate(tpl.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="حذف القالب"
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
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
