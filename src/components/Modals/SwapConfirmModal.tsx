import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { ArrowLeftRight, ArrowRight, X } from 'lucide-react';

export const SwapConfirmModal: React.FC = () => {
  const { swapCandidate, setSwapCandidate, executeSwap } = usePrintStore();

  if (!swapCandidate) return null;

  const isMovingToEmpty = !swapCandidate.toNum || swapCandidate.toNum.trim().length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isMovingToEmpty ? 'نقل الرقم إلى خانة فارغة (Move to Empty)' : 'تبديل أرقام الاستيكرات (Swap Numbers)'}
            </h3>
          </div>
          <button
            onClick={() => setSwapCandidate(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
          <p>
            {isMovingToEmpty
              ? `هل تريد نقل الرقم "${swapCandidate.fromNum}" إلى الاستيكر الفارغ #${swapCandidate.toIndex + 1}؟`
              : 'هل تريد تبديل أرقام الموظفين بين الاستيكرين التاليين؟'}
          </p>

          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-center flex-1">
              <span className="text-[10px] font-mono text-slate-400 block">استيكر #{swapCandidate.fromIndex + 1}</span>
              <span className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400">
                {swapCandidate.fromNum}
              </span>
            </div>

            {isMovingToEmpty ? (
              <ArrowRight className="w-4 h-4 text-sky-500 mx-2" />
            ) : (
              <ArrowLeftRight className="w-4 h-4 text-slate-400 mx-2" />
            )}

            <div className="text-center flex-1">
              <span className="text-[10px] font-mono text-slate-400 block">استيكر #{swapCandidate.toIndex + 1}</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isMovingToEmpty ? 'text-slate-400 italic' : 'text-sky-600 dark:text-sky-400'
                }`}
              >
                {isMovingToEmpty ? '(فارغ)' : swapCandidate.toNum}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {isMovingToEmpty
              ? 'سيتم نقل الرقم إلى الخانة المحددة، ويصبح الاستيكر السابق فارغاً دون التأثير على بقية الاستيكرات.'
              : 'سيتم تبديل الأرقام فقط دون تغيير الإحداثيات أو الأبعاد الفيزيائية للاستيكرات.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSwapCandidate(null)}
            className="px-3 py-1 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={executeSwap}
            className="px-3.5 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold shadow-2xs transition-colors"
          >
            {isMovingToEmpty ? 'نعم، نقل الرقم' : 'نعم، تبديل'}
          </button>
        </div>
      </div>
    </div>
  );
};
