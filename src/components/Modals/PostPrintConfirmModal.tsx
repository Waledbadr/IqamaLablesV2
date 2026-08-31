import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { calculateGeometry } from '../../lib/geometry';
import {
  CheckCircle2,
  X,
  FileCheck2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Printer,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const PostPrintConfirmModal: React.FC = () => {
  const {
    isPostPrintModalOpen,
    postPrintSummary,
    confirmMarkPrintedAsUsed,
    startFreshBlankSheet,
    setPostPrintModalOpen,
    template,
    usedStickersByPage,
    startPosition,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const [clearPrintedEmployees, setClearPrintedEmployees] = useState(true);

  if (!isPostPrintModalOpen || !postPrintSummary) return null;

  const geo = calculateGeometry(template);
  const totalStickersPerSheet = geo.totalStickers;

  // Calculate projected remaining stickers on Page 0 after marking
  const currentPage0Used = new Set(usedStickersByPage[0] || []);
  const newlyPrintedPage0 = postPrintSummary.printedStickersByPage[0] || [];
  newlyPrintedPage0.forEach((idx) => currentPage0Used.add(idx));
  const remainingFreeCount = Math.max(0, totalStickersPerSheet - currentPage0Used.size);

  const handleConfirmUsed = () => {
    confirmMarkPrintedAsUsed(clearPrintedEmployees);
  };

  const handleStartFresh = () => {
    startFreshBlankSheet();
  };

  const handleDismiss = () => {
    setPostPrintModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('postPrintTitle')}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === 'ar'
                  ? 'تم إرسال أمر الطباعة بنجاح، هل تريد حفظ أماكن الاستيكرات المستعملة؟'
                  : 'Print command sent! Do you want to mark these stickers as used?'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500 text-slate-950 font-bold">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('printedStickersCount')}:{' '}
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-black text-sm">
                    {postPrintSummary.printedCount}
                  </span>{' '}
                  {t('stickerUnit')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'ar'
                    ? `متبقي في نفس الورقة ${remainingFreeCount} استيكر فارغ للاستخدام لاحقاً`
                    : `${remainingFreeCount} blank stickers remaining on this sheet`}
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {postPrintSummary.pagesCount}{' '}
              <span className="text-[10px] text-slate-400 font-sans">
                {language === 'ar' ? 'صفحة' : 'Page'}
              </span>
            </div>
          </div>

          {/* Workflow Explanation Tip */}
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {language === 'ar'
                ? 'عند تعليمها كمستعمل، سيتم تلقائياً حفظ الورقة ونقل مؤشر الطباعة إلى أول استيكر فارغ. في المرة القادمة، ما عليك سوى لصق الأرقام وإدخال نفس الورقة في الطابعة!'
                : 'Marking as used saves the sheet state and auto-advances the start position to the next blank sticker. Next time, just paste new numbers and re-insert the sheet!'}
            </span>
          </div>

          {/* Option Checkbox: Clear Printed Employee Numbers */}
          <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <input
              type="checkbox"
              checked={clearPrintedEmployees}
              onChange={(e) => setClearPrintedEmployees(e.target.checked)}
              className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {language === 'ar'
                ? 'مسح الأرقام التي تم طباعتها من القائمة (لصق دفعة جديدة مباشرة)'
                : 'Clear printed numbers from list (ready to paste next batch directly)'}
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleStartFresh}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
            title={t('startFreshDesc')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('startFreshSheet')}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            >
              {language === 'ar' ? 'إغلاق دون تعديل' : 'Close without saving'}
            </button>

            <button
              type="button"
              onClick={handleConfirmUsed}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('markPrintedAsUsed')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
