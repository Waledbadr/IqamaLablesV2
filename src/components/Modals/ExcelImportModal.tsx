import React, { useRef, useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { ExcelParseResult, parseExcelFile, downloadSampleExcelFile } from '../../lib/excelParser';
import {
  FileSpreadsheet,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  FileCheck,
} from 'lucide-react';

export const ExcelImportModal: React.FC = () => {
  const { isExcelImportModalOpen, setExcelImportModalOpen, setEmployeeNumbers } =
    usePrintStore();

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ExcelParseResult | null>(null);
  const [selectedColumnKey, setSelectedColumnKey] = useState<string>('0');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isExcelImportModalOpen) return null;

  const handleFileProcess = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const result = await parseExcelFile(file);
      setParsedData(result);
      setSelectedColumnKey(result.selectedColumn);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء معالجة الملف.');
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleColumnChange = (colKey: string) => {
    setSelectedColumnKey(colKey);
    if (parsedData) {
      const newNumbers = parsedData.rows
        .map((row) => row[colKey])
        .filter((val) => val && val.trim().length > 0);
      setParsedData({
        ...parsedData,
        selectedColumn: colKey,
        extractedNumbers: newNumbers,
      });
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;
    const numbers = parsedData.extractedNumbers;
    if (numbers.length === 0) {
      setError('العمود المحدد لا يحتوي على أرقام.');
      return;
    }
    setEmployeeNumbers(numbers);
    setExcelImportModalOpen(false);
    setParsedData(null);
  };

  const currentNumbers = parsedData?.extractedNumbers || [];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                استيراد أرقام الموظفين من ملف Excel أو CSV
              </h2>
              <p className="text-[11px] text-stone-500">
                تتم المعالجة محلياً في متصفحك بالكامل دون إرسال البيانات لأي خادم
              </p>
            </div>
          </div>

          <button
            onClick={() => setExcelImportModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-stone-300 dark:border-stone-700 hover:border-emerald-500 bg-stone-50/50 dark:bg-stone-850'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-emerald-600" />
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                اسحب ملف Excel أو CSV هنا، أو انقر للاختيار من جهازك
              </div>
              <div className="text-[11px] text-stone-400">
                يدعم صيغ .xlsx و .xls و .csv (يحافظ على الأصفار البادئة مثل 00125)
              </div>
            </div>
          </div>

          {/* Sample template link */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>هل تريد تجربة نموذج جاهز؟</span>
            <button
              onClick={downloadSampleExcelFile}
              className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل نموذج إكسل تجريبي</span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedData && (
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  اختر العمود الذي يحتوي على أرقام الموظفين:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {currentNumbers.length} موظف مستخرج
                </span>
              </div>

              {/* Column selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {parsedData.columns.map((col) => (
                  <label
                    key={col.key}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedColumnKey === col.key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="excelColumn"
                      value={col.key}
                      checked={selectedColumnKey === col.key}
                      onChange={() => handleColumnChange(col.key)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div className="text-xs">
                      <div className="font-bold">{col.name}</div>
                      {col.sampleValues.length > 0 && (
                        <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 mt-0.5 truncate max-w-[200px]">
                          عينات: {col.sampleValues.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Preview Table of First 5 records */}
              <div>
                <div className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                  معاينة أول 5 أرقام مستخرجة:
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-xs text-stone-800 dark:text-stone-200">
                  {currentNumbers.slice(0, 8).map((num, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 shadow-2xs font-semibold"
                    >
                      {num}
                    </span>
                  ))}
                  {currentNumbers.length > 8 && (
                    <span className="text-stone-400 self-center text-[10px]">
                      + {currentNumbers.length - 8} أرقام إضافية...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between">
          <button
            onClick={() => setExcelImportModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            إلغاء
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!parsedData || currentNumbers.length === 0}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>استيراد {currentNumbers.length} رقم الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
