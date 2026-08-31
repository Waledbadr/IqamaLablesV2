import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { validateEmployeeNumbers, downloadSampleExcelFile } from '../../lib/excelParser';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const DataInputSection: React.FC = () => {
  const {
    rawInputText,
    setRawInputText,
    employeeNumbers,
    removeDuplicateNumbers,
    clearEmployeeData,
    setExcelImportModalOpen,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const validation = validateEmployeeNumbers(employeeNumbers);

  const handleClear = () => {
    clearEmployeeData();
  };

  return (
    <div className="space-y-2.5">
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setExcelImportModalOpen(true)}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{t('importExcel')}</span>
        </button>

        <button
          onClick={downloadSampleExcelFile}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          title={language === 'ar' ? 'تحميل ملف إكسل تجريبي يحتوي على أصفار بادئة' : 'Download sample excel with preserved leading zeros'}
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('downloadTemplate')}</span>
        </button>
      </div>

      {/* Large Text Area Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {t('employeeNumbers')}
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {language === 'ar' ? 'سطر جديد لكل رقم' : 'one per line'}
          </span>
        </div>

        <textarea
          value={rawInputText}
          onChange={(e) => setRawInputText(e.target.value)}
          placeholder={`001001\n001002\n001003\n001004...`}
          rows={5}
          dir="ltr"
          className="w-full text-xs font-mono p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all leading-relaxed resize-y"
        />
      </div>

      {/* Statistics & Validation Badge */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">{t('totalNumbers')}:</span>
          <span className="font-bold font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
            {validation.total} {language === 'ar' ? 'موظف' : 'items'}
          </span>
        </div>

        {validation.duplicateCount > 0 && (
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('duplicates')} ({validation.duplicateCount}):</span>
            </span>
            <button
              onClick={removeDuplicateNumbers}
              className="text-[10px] font-bold underline hover:opacity-80"
            >
              {t('removeDuplicates')}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
          <span>{language === 'ar' ? 'الحفاظ على الأصفار البادئة (00125)' : 'Leading zeros preserved (00125)'}</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        </div>
      </div>

      {/* Clear Button */}
      {employeeNumbers.length > 0 && (
        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('clearAll')}</span>
        </button>
      )}
    </div>
  );
};
