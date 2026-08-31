import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { DataInputSection } from './DataInputSection';
import { SheetSettingsSection } from './SheetSettingsSection';
import { StickerSettingsSection } from './StickerSettingsSection';
import { DistributionSection } from './DistributionSection';
import { PositionControlsSection } from './PositionControlsSection';
import { TextStylingSection } from './TextStylingSection';
import {
  FileText,
  Layout,
  Grid,
  Sparkles,
  Move,
  Type,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string | number;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  badge,
  children,
}) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800/80 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-right select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sky-500 dark:text-sky-400">{icon}</span>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {title}
          </span>
          {badge !== undefined && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              {badge}
            </span>
          )}
        </div>
        <span className="text-slate-400 dark:text-slate-500">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isOpen && <div className="px-3 pb-3 pt-0.5 animate-fadeIn">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { language, employeeNumbers } = usePrintStore();
  const { t } = useTranslation(language);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    data: true,
    sheet: true,
    sticker: true,
    distribution: true,
    position: true,
    text: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const validCount = employeeNumbers.filter((n) => n && n.trim().length > 0).length;

  return (
    <aside className="w-80 md:w-88 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 h-full flex flex-col shrink-0 overflow-hidden select-none z-10">
      {/* Scrollable Accordion Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        <AccordionSection
          id="data"
          title={language === 'ar' ? 'بيانات أرقام الموظفين' : 'Employee Numbers Data'}
          icon={<FileText className="w-4 h-4" />}
          isOpen={openSections.data}
          onToggle={() => toggleSection('data')}
          badge={validCount > 0 ? validCount : undefined}
        >
          <DataInputSection />
        </AccordionSection>

        <AccordionSection
          id="sheet"
          title={language === 'ar' ? 'إعدادات الورقة والقالب (A4)' : 'Sheet & Template Settings'}
          icon={<Layout className="w-4 h-4" />}
          isOpen={openSections.sheet}
          onToggle={() => toggleSection('sheet')}
        >
          <SheetSettingsSection />
        </AccordionSection>

        <AccordionSection
          id="sticker"
          title={language === 'ar' ? 'أبعاد الاستيكر والشبكة' : 'Sticker Grid Dimensions'}
          icon={<Grid className="w-4 h-4" />}
          isOpen={openSections.sticker}
          onToggle={() => toggleSection('sticker')}
        >
          <StickerSettingsSection />
        </AccordionSection>

        <AccordionSection
          id="distribution"
          title={language === 'ar' ? 'التوزيع والورق المستعمل جزئياً' : 'Layout & Used Paper'}
          icon={<Sparkles className="w-4 h-4" />}
          isOpen={openSections.distribution}
          onToggle={() => toggleSection('distribution')}
        >
          <DistributionSection />
        </AccordionSection>

        <AccordionSection
          id="position"
          title={language === 'ar' ? 'الموضع والمعايرة بالمليمتر' : 'Position & Calibration'}
          icon={<Move className="w-4 h-4" />}
          isOpen={openSections.position}
          onToggle={() => toggleSection('position')}
        >
          <PositionControlsSection />
        </AccordionSection>

        <AccordionSection
          id="text"
          title={language === 'ar' ? 'تنسيق النص والخطوط' : 'Typography & Text Styling'}
          icon={<Type className="w-4 h-4" />}
          isOpen={openSections.text}
          onToggle={() => toggleSection('text')}
        >
          <TextStylingSection />
        </AccordionSection>
      </div>
    </aside>
  );
};
