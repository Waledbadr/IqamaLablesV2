import React, { useEffect } from 'react';
import { usePrintStore } from './store/usePrintStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { A4Preview } from './components/A4Preview/A4Preview';
import { PrintPortal } from './components/PrintPortal';
import { PrintPreviewModal } from './components/Modals/PrintPreviewModal';
import { ExcelImportModal } from './components/Modals/ExcelImportModal';
import { CalibrationModal } from './components/Modals/CalibrationModal';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { RecentJobsModal } from './components/Modals/RecentJobsModal';
import { HelpModal } from './components/Modals/HelpModal';
import { SwapConfirmModal } from './components/Modals/SwapConfirmModal';

export function App() {
  const { language, theme } = usePrintStore();

  // Synchronize document dir, lang, and dark mode on mount
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans text-xs antialiased print:h-auto print:w-auto print:overflow-visible print:bg-white">
      {/* Top Header */}
      <Header />

      {/* Main Content: Sidebar + A4 Stage */}
      <main className="flex-1 flex overflow-hidden relative print:hidden">
        <Sidebar />
        <A4Preview />
      </main>

      {/* Hidden Print Container for native @media print */}
      <PrintPortal />

      {/* Interactive Modals */}
      <PrintPreviewModal />
      <ExcelImportModal />
      <CalibrationModal />
      <TemplatesModal />
      <RecentJobsModal />
      <HelpModal />
      <SwapConfirmModal />
    </div>
  );
}

export default App;
