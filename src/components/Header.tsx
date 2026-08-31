import React from 'react';
import { usePrintStore } from '../store/usePrintStore';
import { generateStickersPDF } from '../lib/pdfGenerator';
import { triggerBrowserPrint } from '../lib/printService';
import {
  Printer,
  FileDown,
  Undo2,
  Redo2,
  FolderOpen,
  Layout,
  Compass,
  HelpCircle,
  Sun,
  Moon,
  Languages,
  Plus,
  Eye,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    language,
    setLanguage,
    theme,
    setTheme,
    setPrintPreviewOpen,
    setCalibrationModalOpen,
    setTemplatesModalOpen,
    setRecentJobsModalOpen,
    setHelpModalOpen,
    createNewJob,
    template,
    calibration,
    getAssignmentResult,
  } = usePrintStore();

  const assignment = getAssignmentResult();

  const handleExportPDF = () => {
    const doc = generateStickersPDF({
      template,
      pages: assignment.pages,
      calibration,
      showOutlines: false,
    });
    const safeName = (template.name || 'stickers').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
    doc.save(`StickerPrint_${safeName}_${Date.now()}.pdf`);
  };

  const handleDirectPrint = () => {
    triggerBrowserPrint({
      template,
      pages: assignment.pages,
      calibration,
    });
  };

  const handleNewJob = () => {
    if (window.confirm('هل تريد بدء عملية طباعة جديدة ومسح البيانات الحالية؟')) {
      createNewJob();
    }
  };

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 shadow-xs font-bold">
          <Printer className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-black tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              StickerPrint
            </h1>
            <span className="text-[9px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20">
              A4 PRECISION
            </span>
          </div>
        </div>
      </div>

      {/* Center Tools: History & Management */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="تراجع (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="إعادة (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

        {/* Project & Template Buttons */}
        <button
          onClick={handleNewJob}
          className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center gap-1"
          title="مشروع جديد"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">جديد</span>
        </button>

        <button
          onClick={() => setRecentJobsModalOpen(true)}
          className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center gap-1"
          title="حفظ / فتح المشاريع"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">المشاريع</span>
        </button>

        <button
          onClick={() => setTemplatesModalOpen(true)}
          className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center gap-1"
          title="قوالب الاستيكرات"
        >
          <Layout className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">القوالب</span>
        </button>

        <button
          onClick={() => setCalibrationModalOpen(true)}
          className="px-2 py-1 rounded-md text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-transparent hover:border-sky-300 dark:hover:border-sky-800 transition-colors flex items-center gap-1"
          title="معايرة الطابعة الفيزيائية"
        >
          <Compass className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden md:inline">المعايرة</span>
        </button>
      </div>

      {/* Right Tools: Preferences, Preview & Print */}
      <div className="flex items-center gap-1">
        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="p-1 px-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-mono font-bold transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="تبديل اللغة / Switch Language"
        >
          {language === 'ar' ? 'EN' : 'عربي'}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="الوضع الليلي / النهاري"
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* Help */}
        <button
          onClick={() => setHelpModalOpen(true)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="دليل الاستخدام"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Print Preview Button */}
        <button
          onClick={() => setPrintPreviewOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">معاينة</span>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold transition-colors"
          title="تصدير ملف PDF متجهات للطباعة"
        >
          <FileDown className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        {/* Direct Print Button */}
        <button
          onClick={handleDirectPrint}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة</span>
        </button>
      </div>
    </header>
  );
};
