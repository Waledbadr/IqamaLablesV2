import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import {
  HelpCircle,
  X,
  AlertTriangle,
} from 'lucide-react';

export const HelpModal: React.FC = () => {
  const { isHelpModalOpen, setHelpModalOpen, language } = usePrintStore();
  const { t } = useTranslation(language);

  if (!isHelpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-500" />
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {language === 'ar' ? 'دليل الاستخدام والطباعة الدقيقة (User Guide)' : 'User & Print Accuracy Guide'}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'خطوات طباعة أرقام الموظفين على استيكرات A4 بأعلى دقة مليمترية' : 'Steps to print employee numbers on A4 stickers with high accuracy'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setHelpModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Golden Rule Alert */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs">
                {language === 'ar' ? 'القاعدة الذهبية لطباعة الاستيكرات:' : 'Golden Rule for Sticker Printing:'}
              </div>
              <p className="text-[11px] mt-0.5">
                {language === 'ar' ? (
                  <>
                    في إعدادات الطباعة بالمتصفح أو الطابعة، <strong>لا تختر أبداً "Fit to Page" أو "ملاءمة الصفحة"</strong>. اختر دائماً المقياس <strong>100% (Actual Size)</strong> والهوامش = <strong>None / لا شيء</strong>.
                  </>
                ) : (
                  <>
                    In your browser/printer print dialog, <strong>never choose "Fit to Page" or "Scale to fit"</strong>. Always select scale <strong>100% (Actual Size)</strong> and Margins = <strong>None</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Step by step */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center text-[11px] font-bold shrink-0 font-mono">
                1
              </span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
                  {language === 'ar' ? 'تحديد أبعاد الاستيكر أو اختيار قالب جاهز' : 'Choose Preset Template or Custom Dimensions'}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'ar'
                    ? 'اختر من القوالب القياسية الجاهزة (مثل 5×8 أو 3×8) أو أدخل أبعاد الاستيكر الفعلي بالمليمتر (العرض، الارتفاع، الهوامش، والفواصل).'
                    : 'Select a standard preset (e.g. 5x8 or 3x8) or customize physical sticker dimensions in millimeters.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center text-[11px] font-bold shrink-0 font-mono">
                2
              </span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
                  {language === 'ar' ? 'إدخال أرقام الموظفين (لصق أو استيراد Excel)' : 'Input Employee IDs (Paste or Excel Import)'}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'ar'
                    ? 'انسخ الأرقام والصقها في مربع النصوص أو استورد ملف Excel (.xlsx أو .csv). يحافظ التطبيق بدقة على الأصفار البادئة (مثل 00125).'
                    : 'Paste numbers or import Excel (.xlsx / .csv). The app preserves leading zeroes (e.g. 00125) accurately.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center text-[11px] font-bold shrink-0 font-mono">
                3
              </span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
                  {language === 'ar' ? 'الاستفادة من الورق المستعمل جزئياً' : 'Utilize Partially Used Sheets'}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'ar'
                    ? 'إذا كانت ورقة الاستيكرات مستعملة جزئياً، انقر نقراً مزدوجاً على الاستيكرات المستهلكة لتعليمها كمستعملة، أو حدد "ابدأ من الاستيكر رقم X". سيتخطاها التطبيق تلقائياً!'
                    : 'Double click on already peeled stickers on the preview sheet to mark them used, or set "Start at sticker #X".'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center text-[11px] font-bold shrink-0 font-mono">
                4
              </span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
                  {language === 'ar' ? 'المعايرة والتحريك الدقيق' : 'Calibration & Fine Nudging'}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'ar'
                    ? 'يمكنك سحب أي استيكر أو تحريكه بأسهم لوحة المفاتيح بدقة 0.1 مم. كما يمكنك إزاحة الشبكة كاملة (Global Offset) أو استخدام ميزة "معايرة الطابعة" لتصحيح انحراف سحب الورق في طابعتك.'
                    : 'Drag or nudge stickers with arrow keys at 0.1mm increments. Use Hardware Calibration for printer feed errors.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center text-[11px] font-bold shrink-0 font-mono">
                5
              </span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
                  {language === 'ar' ? 'الطباعة المباشرة أو تصدير PDF' : 'Direct Print or Export PDF'}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'ar'
                    ? 'انقر على "معاينة الطباعة" للتحقق من المظهر النهائي، ثم اطبع مباشرة أو صدّر ملف PDF عالي الدقة.'
                    : 'Click "Print Preview" to inspect the final layout, then print directly or export a vector PDF.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={() => setHelpModalOpen(false)}
            className="px-4 py-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold shadow-2xs"
          >
            {language === 'ar' ? 'فهمت، إغلاق' : 'Got it, Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
