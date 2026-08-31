import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { ArrowLeftRight, ArrowRight, X, Layers, UserCheck } from 'lucide-react';

export const SwapConfirmModal: React.FC = () => {
  const {
    swapCandidate,
    setSwapCandidate,
    executeSwap,
    executeSequenceShift,
  } = usePrintStore();

  if (!swapCandidate) return null;

  const isMovingToEmpty = !swapCandidate.toNum || swapCandidate.toNum.trim().length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isMovingToEmpty ? 'تحديد طريقة نقل الاستيكر' : 'تحديد طريقة نقل / تبديل الاستيكر'}
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
        <div className="p-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
          {/* Comparison Bar */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-center flex-1">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">الموقع السابق #{swapCandidate.fromIndex + 1}</span>
              <span className="font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                {swapCandidate.fromNum}
              </span>
            </div>

            {isMovingToEmpty ? (
              <ArrowRight className="w-4 h-4 text-sky-500 mx-2 shrink-0" />
            ) : (
              <ArrowLeftRight className="w-4 h-4 text-slate-400 mx-2 shrink-0" />
            )}

            <div className="text-center flex-1">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">الموقع الجديد #{swapCandidate.toIndex + 1}</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isMovingToEmpty ? 'text-slate-400 italic' : 'text-sky-600 dark:text-sky-400'
                }`}
              >
                {isMovingToEmpty ? '(خانة فارغة)' : swapCandidate.toNum}
              </span>
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            اختر نوع العملية المطلوبة:
          </p>

          {/* Action Choice Cards */}
          <div className="grid grid-cols-1 gap-2">
            {/* Choice 1: Single Sticker Move / Swap */}
            <button
              type="button"
              onClick={executeSwap}
              className="w-full text-right p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-sky-500/10 transition-all flex items-start gap-2.5 group"
            >
              <div className="p-2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>1. نقل هذا الاستيكر فقط</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-semibold">استيكر فردي</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {isMovingToEmpty
                    ? `نقل الرقم (${swapCandidate.fromNum}) فقط إلى الخانة #${swapCandidate.toIndex + 1} وجعل الخانة السابقة فارغة، مع بقاء ترتيب باقي الاستيكرات كما هو.`
                    : `تبديل الرقمين بين الاستيكر #${swapCandidate.fromIndex + 1} والاستيكر #${swapCandidate.toIndex + 1} فقط دون المساس ببقية الأرقام.`}
                </p>
              </div>
            </button>

            {/* Choice 2: Shift Entire Sequence */}
            <button
              type="button"
              onClick={executeSequenceShift}
              className="w-full text-right p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-emerald-500/10 transition-all flex items-start gap-2.5 group"
            >
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>2. نقل كامل التسلسل ابتداءً من هذه الخانة</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">تسلسل كامل</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  بدء توزيع أرقام الموظفين تسلسلياً ابتداءً من الخانة #{swapCandidate.toIndex + 1} بحيث تتدفق باقي الأرقام تباعاً في الخانات التالية.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSwapCandidate(null)}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إلغاء الأمر
          </button>
        </div>
      </div>
    </div>
  );
};

