import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { generateCalibrationTestPDF } from '../../lib/pdfGenerator';
import {
  Compass,
  Printer,
  FileDown,
  X,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Calculator,
} from 'lucide-react';

export const CalibrationModal: React.FC = () => {
  const {
    isCalibrationModalOpen,
    setCalibrationModalOpen,
    template,
    calibration,
    setCalibration,
  } = usePrintStore();

  const [measuredWidthMm, setMeasuredWidthMm] = useState<string>('100.0');
  const [measuredHeightMm, setMeasuredHeightMm] = useState<string>('100.0');

  if (!isCalibrationModalOpen) return null;

  const handlePrintTestPDF = () => {
    const doc = generateCalibrationTestPDF(template, calibration);
    doc.save(`StickerPrint_Calibration_Test_${Date.now()}.pdf`);
  };

  const handleCalculateScales = () => {
    const w = parseFloat(measuredWidthMm);
    const h = parseFloat(measuredHeightMm);

    if (w > 0 && h > 0) {
      // Scale multiplier = Expected (100) / Measured
      const newScaleX = Number((100 / w).toFixed(4));
      const newScaleY = Number((100 / h).toFixed(4));

      setCalibration({
        scaleX: newScaleX,
        scaleY: newScaleY,
      });
    }
  };

  const handleReset = () => {
    setCalibration({
      scaleX: 1.0,
      scaleY: 1.0,
      offsetX: 0,
      offsetY: 0,
    });
    setMeasuredWidthMm('100.0');
    setMeasuredHeightMm('100.0');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                معايرة الطابعة الفيزيائية (Printer Calibration)
              </h2>
              <p className="text-[11px] text-stone-500">
                تصحيح خطأ السحب والتمدد في الطابعات المادية لمطابقة الاستيكرات بدقة متناهية
              </p>
            </div>
          </div>

          <button
            onClick={() => setCalibrationModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Print Test Sheet */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                الخطوة 1: طباعة صفحة المعايرة التجريبية
              </div>
              <div className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-0.5">
                اطبع الورقة بمقياس 100% بدون هوامش، ثم قس خط الـ 100 مم بمسطرة حقيقية
              </div>
            </div>

            <button
              onClick={handlePrintTestPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>تحميل ورقة المعايرة PDF</span>
            </button>
          </div>

          {/* Step 2: Scale Correction Calculator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>الخطوة 2: حاسبة مقياس التمدد (Scale Correction)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
              <div>
                <span className="text-[11px] text-stone-500 block mb-1">
                  المقاس المطبوع للخط الأفقي (الهدف: 100 مم):
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="80"
                    max="120"
                    value={measuredWidthMm}
                    onChange={(e) => setMeasuredWidthMm(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                  <span className="text-[11px] text-stone-400">مم</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block mb-1">
                  المقاس المطبوع للخط الرأسي (الهدف: 100 مم):
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="80"
                    max="120"
                    value={measuredHeightMm}
                    onChange={(e) => setMeasuredHeightMm(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                  <span className="text-[11px] text-stone-400">مم</span>
                </div>
              </div>

              <div className="col-span-2 pt-1 flex justify-end">
                <button
                  onClick={handleCalculateScales}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold"
                >
                  حساب وتطبيق معاملات المقياس
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Direct Offsets and Multipliers */}
          <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-700">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              القيم النشطة لمعايرة الطابعة:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 block mb-0.5">معامل المقياس X</span>
                <input
                  type="number"
                  step="0.001"
                  value={calibration.scaleX}
                  onChange={(e) => setCalibration({ scaleX: Number(e.target.value) })}
                  className="w-full font-mono text-xs p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 block mb-0.5">معامل المقياس Y</span>
                <input
                  type="number"
                  step="0.001"
                  value={calibration.scaleY}
                  onChange={(e) => setCalibration({ scaleY: Number(e.target.value) })}
                  className="w-full font-mono text-xs p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 block mb-0.5">إزاحة السحب X (مم)</span>
                <input
                  type="number"
                  step="0.1"
                  value={calibration.offsetX}
                  onChange={(e) => setCalibration({ offsetX: Number(e.target.value) })}
                  className="w-full font-mono text-xs p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 block mb-0.5">إزاحة السحب Y (مم)</span>
                <input
                  type="number"
                  step="0.1"
                  value={calibration.offsetY}
                  onChange={(e) => setCalibration({ offsetY: Number(e.target.value) })}
                  className="w-full font-mono text-xs p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين المعايرة للافتراضي</span>
          </button>

          <button
            onClick={() => setCalibrationModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
