import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { ChevronLeft, ChevronRight, AlertCircle, Layers } from 'lucide-react';

export const PageNavigation: React.FC = () => {
  const {
    currentPageIndex,
    setCurrentPageIndex,
    getAssignmentResult,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const assignment = getAssignmentResult();
  const totalPages = Math.max(1, assignment.totalPages);
  const activePage = assignment.pages[currentPageIndex] || assignment.pages[0];

  const hasOverflow = assignment.totalPages > 1;

  const PrevIcon = language === 'ar' ? ChevronRight : ChevronLeft;
  const NextIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Page Selector Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {language === 'ar'
              ? `صفحة ${currentPageIndex + 1} من ${totalPages}`
              : `Page ${currentPageIndex + 1} of ${totalPages}`}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            ({activePage?.totalAssigned || 0} {language === 'ar' ? 'استيكر مطبوع' : 'printed stickers'})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
            disabled={currentPageIndex <= 0}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title={language === 'ar' ? 'الصفحة السابقة' : 'Previous Page'}
          >
            <PrevIcon className="w-3.5 h-3.5" />
          </button>

          {/* Quick Page Bubbles if multiple */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`w-6 h-6 rounded text-[11px] font-mono font-bold transition-all ${
                    idx === currentPageIndex
                      ? 'bg-sky-500 text-slate-950 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title={language === 'ar' ? 'الصفحة التالية' : 'Next Page'}
          >
            <NextIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Overflow Notice if > 1 page */}
      {hasOverflow && (
        <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px]">
              {language === 'ar'
                ? `عدد الأرقام (${assignment.totalEmployeeNumbers}) يتطلب ${totalPages} ورقات A4.`
                : `Total count (${assignment.totalEmployeeNumbers}) requires ${totalPages} A4 pages.`}
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold">
            {language === 'ar' ? `المتبقي: ${assignment.unassignedCount}` : `Remaining: ${assignment.unassignedCount}`}
          </span>
        </div>
      )}
    </div>
  );
};
