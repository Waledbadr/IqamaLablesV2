import React, { useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { calculateGeometry } from '../../lib/geometry';
import { formatDimensions, getUnitLabel } from '../../lib/units';
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
  Layers,
  SlidersHorizontal,
  ChevronsUpDown,
  CheckCircle2,
} from 'lucide-react';

export type SidebarTab = 'data' | 'sheet' | 'distribution' | 'style';
export type SheetSubTab = 'all' | 'paper' | 'sticker';
export type StyleSubTab = 'all' | 'font' | 'position';

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string | number;
  subtitle?: string;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  badge,
  subtitle,
  children,
}) => {
  return (
    <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs transition-all mb-2.5">
      <button
        onClick={onToggle}
        className={`w-full px-3.5 py-2.5 flex items-center justify-between transition-colors text-right select-none ${
          isOpen
            ? 'bg-sky-50/50 dark:bg-sky-950/20 border-b border-slate-100 dark:border-slate-800/80'
            : 'hover:bg-slate-50 dark:hover:bg-slate-850'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${isOpen ? 'bg-sky-500 text-slate-950 shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {icon}
          </div>
          <div className="text-right truncate">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isOpen ? 'text-sky-950 dark:text-sky-200' : 'text-slate-800 dark:text-slate-200'}`}>
                {title}
              </span>
              {badge !== undefined && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-500 ms-2 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4 text-sky-600 dark:text-sky-400" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && <div className="p-3.5 animate-fadeIn bg-white dark:bg-slate-900">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { language, employeeNumbers, template, measurementUnit } = usePrintStore();
  const { t } = useTranslation(language);
  const isAr = language === 'ar';
  const geometry = calculateGeometry(template);
  const unitLabel = getUnitLabel(measurementUnit, language);

  // View Mode: 'tabs' (focused, professional) or 'accordion' (all visible)
  const [viewMode, setViewMode] = useState<'tabs' | 'accordion'>('tabs');
  const [activeTab, setActiveTab] = useState<SidebarTab>('sheet');
  const [sheetSubTab, setSheetSubTab] = useState<SheetSubTab>('all');
  const [styleSubTab, setStyleSubTab] = useState<StyleSubTab>('all');

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sheet: true,
    sticker: true,
    data: true,
    distribution: true,
    styleText: true,
    stylePosition: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAllSections = () => {
    setOpenSections({
      sheet: true,
      sticker: true,
      data: true,
      distribution: true,
      styleText: true,
      stylePosition: true,
    });
  };

  const collapseAllSections = () => {
    setOpenSections({
      sheet: false,
      sticker: false,
      data: false,
      distribution: false,
      styleText: false,
      stylePosition: false,
    });
  };

  const validCount = employeeNumbers.filter((n) => n && n.trim().length > 0).length;

  const tabs: {
    id: SidebarTab;
    labelAr: string;
    labelEn: string;
    shortAr: string;
    shortEn: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'sheet',
      labelAr: 'الورقة والاستيكر',
      labelEn: 'Sheet & Labels',
      shortAr: 'الورقة',
      shortEn: 'Sheet',
      icon: <Layout className="w-4 h-4" />,
    },
    {
      id: 'data',
      labelAr: 'أرقام الموظفين',
      labelEn: 'Employee Data',
      shortAr: 'الأرقام',
      shortEn: 'Numbers',
      icon: <FileText className="w-4 h-4" />,
      badge: validCount > 0 ? validCount : undefined,
    },
    {
      id: 'distribution',
      labelAr: 'التوزيع والبدء',
      labelEn: 'Layout & Start',
      shortAr: 'التوزيع',
      shortEn: 'Layout',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'style',
      labelAr: 'الخط والإزاحة',
      labelEn: 'Font & Offset',
      shortAr: 'الخط',
      shortEn: 'Style',
      icon: <Type className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-80 md:w-92 bg-slate-50/60 dark:bg-slate-950 border-e border-slate-200 dark:border-slate-800 h-full flex flex-col shrink-0 overflow-hidden select-none z-10 shadow-xs">
      {/* 1. Header Overview Dashboard Ribbon */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
            <span>{isAr ? 'لوحة التحكم والإعدادات' : 'Print Configuration'}</span>
          </div>

          {/* Toggle between Tabbed and Accordion Mode */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('tabs')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'tabs'
                  ? 'bg-sky-500 text-slate-950 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={isAr ? 'عرض مركّز بالأقسام (تبويبات مريحة)' : 'Tabbed Focused View'}
            >
              <span>{isAr ? 'تبويبات' : 'Tabs'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('accordion')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'accordion'
                  ? 'bg-sky-500 text-slate-950 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={isAr ? 'عرض شامل لكافة الخيارات معاً' : 'Accordion All Sections'}
            >
              <span>{isAr ? 'شامل' : 'All'}</span>
            </button>
          </div>
        </div>

        {/* Live Status Pills */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="px-2 py-1 rounded-md bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="block text-[9px] text-slate-400">{isAr ? 'الورقة' : 'Sheet'}</span>
            <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate block">
              {formatDimensions(template.paperWidth, template.paperHeight, measurementUnit, language)}
            </span>
          </div>

          <div className="px-2 py-1 rounded-md bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="block text-[9px] text-slate-400">{isAr ? 'الشبكة' : 'Grid'}</span>
            <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 truncate block">
              {geometry.columns}×{geometry.rows} ({geometry.totalStickers})
            </span>
          </div>

          <div className="px-2 py-1 rounded-md bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="block text-[9px] text-slate-400">{isAr ? 'الأرقام' : 'Data'}</span>
            <span className={`font-mono text-[10px] font-bold truncate block ${validCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {validCount} {isAr ? 'رقم' : 'items'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs (when in Tabs mode) */}
      {viewMode === 'tabs' ? (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 py-1.5 shrink-0">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 relative ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-xs font-black ring-1 ring-sky-400/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isAr ? tab.labelAr : tab.labelEn}
                >
                  <div className="flex items-center justify-center">
                    {tab.icon}
                    {tab.badge !== undefined && (
                      <span className={`ms-1 text-[9px] px-1 py-0.2 rounded-full font-mono font-bold leading-none ${
                        isActive
                          ? 'bg-slate-950 text-white'
                          : 'bg-sky-500 text-slate-950'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] truncate max-w-full leading-tight font-medium">
                    {isAr ? tab.shortAr : tab.shortEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accordion Mode Toolbar (Expand/Collapse All) */
        <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {isAr ? 'عرض كافة الأقسام:' : 'All Sections View:'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAllSections}
              className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-bold"
            >
              {isAr ? 'فتح الكل' : 'Expand All'}
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={collapseAllSections}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline"
            >
              {isAr ? 'طي الكل' : 'Collapse All'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {viewMode === 'tabs' ? (
          <div className="animate-fadeIn">
            {/* TAB 1: SHEET & STICKER SETTINGS */}
            {activeTab === 'sheet' && (
              <div className="space-y-3">
                {/* Sub-tabs for Sheet and Sticker */}
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSheetSubTab('all')}
                    className={`flex-1 py-1 rounded-md text-[11px] transition-all text-center ${
                      sheetSubTab === 'all'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isAr ? 'عرض الكل' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetSubTab('paper')}
                    className={`flex-1 py-1 rounded-md text-[11px] transition-all text-center ${
                      sheetSubTab === 'paper'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isAr ? 'الورقة والقالب' : 'Sheet & Presets'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetSubTab('sticker')}
                    className={`flex-1 py-1 rounded-md text-[11px] transition-all text-center ${
                      sheetSubTab === 'sticker'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isAr ? 'أبعاد الاستيكر' : 'Sticker Dimensions'}
                  </button>
                </div>

                {/* SubTab Contents */}
                {(sheetSubTab === 'all' || sheetSubTab === 'paper') && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <SheetSettingsSection />
                  </div>
                )}

                {(sheetSubTab === 'all' || sheetSubTab === 'sticker') && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <StickerSettingsSection />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EMPLOYEE NUMBERS DATA */}
            {activeTab === 'data' && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <DataInputSection />
              </div>
            )}

            {/* TAB 3: DISTRIBUTION & REUSE */}
            {activeTab === 'distribution' && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <DistributionSection />
              </div>
            )}

            {/* TAB 4: STYLE & POSITION CONTROLS */}
            {activeTab === 'style' && (
              <div className="space-y-3">
                {/* Sub-tabs for Style and Position */}
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setStyleSubTab('all')}
                    className={`flex-1 py-1 rounded-md text-[11px] transition-all text-center ${
                      styleSubTab === 'all'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isAr ? 'عرض الكل' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleSubTab('font')}
                    className={`flex-1 py-1 rounded-md text-[11px] transition-all text-center ${
                      styleSubTab === 'font'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isAr ? 'تنسيق الخط' : 'Typography'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleSubTab('position')}
                    className={`flex-1 py-1 rounded-md text-[11px] transition-all text-center ${
                      styleSubTab === 'position'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isAr ? 'ضبط الإزاحة' : 'Position & Offset'}
                  </button>
                </div>

                {(styleSubTab === 'all' || styleSubTab === 'font') && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <TextStylingSection />
                  </div>
                )}

                {(styleSubTab === 'all' || styleSubTab === 'position') && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <PositionControlsSection />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ACCORDION VIEW MODE (All Sections Stacked with Premium Rounded Cards) */
          <div className="space-y-1 animate-fadeIn">
            <AccordionSection
              id="sheet"
              title={isAr ? 'إعدادات الورقة ووحدة القياس (A4)' : 'Sheet & Measurement Settings'}
              subtitle={formatDimensions(template.paperWidth, template.paperHeight, measurementUnit, language)}
              icon={<Layout className="w-4 h-4" />}
              isOpen={openSections.sheet}
              onToggle={() => toggleSection('sheet')}
            >
              <SheetSettingsSection />
            </AccordionSection>

            <AccordionSection
              id="sticker"
              title={isAr ? 'أبعاد الاستيكر الواحد والشبكة' : 'Label Dimensions & Grid'}
              subtitle={`${geometry.columns}×${geometry.rows} (${geometry.totalStickers} ${isAr ? 'استيكر' : 'labels'})`}
              icon={<Grid className="w-4 h-4" />}
              isOpen={openSections.sticker}
              onToggle={() => toggleSection('sticker')}
            >
              <StickerSettingsSection />
            </AccordionSection>

            <AccordionSection
              id="data"
              title={isAr ? 'بيانات أرقام الموظفين' : 'Employee Numbers Data'}
              subtitle={`${validCount} ${isAr ? 'رقم مسجل' : 'numbers loaded'}`}
              icon={<FileText className="w-4 h-4" />}
              isOpen={openSections.data}
              onToggle={() => toggleSection('data')}
              badge={validCount > 0 ? validCount : undefined}
            >
              <DataInputSection />
            </AccordionSection>

            <AccordionSection
              id="distribution"
              title={isAr ? 'التوزيع وإعادة استعمال الورق' : 'Placement & Sheet Reuse'}
              subtitle={isAr ? 'تخطي الاستيكرات التالفة ونقطة البداية' : 'Skip used stickers & start slot'}
              icon={<Sparkles className="w-4 h-4" />}
              isOpen={openSections.distribution}
              onToggle={() => toggleSection('distribution')}
            >
              <DistributionSection />
            </AccordionSection>

            <AccordionSection
              id="styleText"
              title={isAr ? 'تنسيق النص والخطوط والألوان' : 'Typography & Text Styling'}
              subtitle={isAr ? 'نوع الخط، الحجم، والبادئة' : 'Font family, size & prefix'}
              icon={<Type className="w-4 h-4" />}
              isOpen={openSections.styleText}
              onToggle={() => toggleSection('styleText')}
            >
              <TextStylingSection />
            </AccordionSection>

            <AccordionSection
              id="stylePosition"
              title={isAr ? 'ضبط الموضع والإزاحة الدقيقة' : 'Position Fine-tuning & Offset'}
              subtitle={isAr ? 'معايرة بالميليمتر والتحريك الفردي' : 'Millimeter calibration & nudge'}
              icon={<Move className="w-4 h-4" />}
              isOpen={openSections.stylePosition}
              onToggle={() => toggleSection('stylePosition')}
            >
              <PositionControlsSection />
            </AccordionSection>
          </div>
        )}
      </div>
    </aside>
  );
};
