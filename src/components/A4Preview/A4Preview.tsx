import React, { useEffect, useRef } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { calculateGeometry, mmToPx } from '../../lib/geometry';
import { RulerLeft, RulerTop } from './Rulers';
import { StickerCard } from './StickerCard';
import { PageNavigation } from './PageNavigation';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Grid,
  Ruler as RulerIcon,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export const A4Preview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    template,
    zoomScale,
    setZoomScale,
    showGrid,
    setShowGrid,
    showRulers,
    setShowRulers,
    showIndexBadges,
    setShowIndexBadges,
    selectedStickerIndex,
    setSelectedStickerIndex,
    toggleStickerUsed,
    nudgeSelectedSticker,
    stepSize,
    undo,
    redo,
    getActivePageLayout,
    currentPageIndex,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const geometry = calculateGeometry(template);
  const activePage = getActivePageLayout();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedStickerIndex(null);
        return;
      }

      // Arrow keys to nudge selected sticker
      if (selectedStickerIndex !== null) {
        const step = e.shiftKey ? stepSize * 5 : stepSize;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          nudgeSelectedSticker(-step, 0);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nudgeSelectedSticker(step, 0);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          nudgeSelectedSticker(0, -step);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          nudgeSelectedSticker(0, step);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStickerIndex, stepSize, undo, redo, nudgeSelectedSticker, setSelectedStickerIndex]);

  // Fit to screen helper
  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 100;
    const availW = clientWidth - padding;
    const availH = clientHeight - padding;

    const paperW = mmToPx(geometry.pageWidth, 1);
    const paperH = mmToPx(geometry.pageHeight, 1);

    const scaleW = availW / paperW;
    const scaleH = availH / paperH;
    const idealScale = Math.min(scaleW, scaleH, 1.4);

    setZoomScale(Math.max(0.4, Math.min(2.0, idealScale)));
  };

  const pMin = Math.min(geometry.pageWidth, geometry.pageHeight);
  const pMax = Math.max(geometry.pageWidth, geometry.pageHeight);
  const paperFormatLabel =
    Math.abs(pMin - 210) <= 1 && Math.abs(pMax - 297) <= 1
      ? 'A4'
      : Math.abs(pMin - 148) <= 1 && Math.abs(pMax - 210) <= 1
      ? 'A5'
      : Math.abs(pMin - 215.9) <= 2 && Math.abs(pMax - 279.4) <= 2
      ? 'Letter'
      : (language === 'ar' ? 'مخصص' : 'Custom');

  const paperWidthPx = mmToPx(geometry.pageWidth, zoomScale);
  const paperHeightPx = mmToPx(geometry.pageHeight, zoomScale);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 bg-grid-blueprint overflow-hidden relative select-none">
      {/* Top Floating Action Bar */}
      <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 flex items-center justify-between z-20 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-500" />
            <span>{t('previewTitle')}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            <strong className="text-sky-600 dark:text-sky-400 me-1">{paperFormatLabel}</strong>
            {geometry.pageWidth} × {geometry.pageHeight} {language === 'ar' ? 'مم' : 'mm'} ({template.orientation === 'landscape' ? (language === 'ar' ? 'أفقي' : 'Landscape') : (language === 'ar' ? 'عمودي' : 'Portrait')})
          </span>
          <button
            onClick={() => usePrintStore.getState().updateTemplateField('flowDirection', template.flowDirection === 'ltr' ? 'rtl' : 'ltr')}
            className="text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30 transition-colors flex items-center gap-1"
            title={language === 'ar' ? 'تبديل اتجاه بدء الترقيم بين اليمين واليسار' : 'Toggle flow direction (LTR / RTL)'}
          >
            <span>{template.flowDirection === 'ltr' ? (language === 'ar' ? '⬅️ من اليسار' : '⬅️ From Left') : (language === 'ar' ? '➡️ من اليمين' : '➡️ From Right')}</span>
          </button>
        </div>

        {/* View Controls Toolbar */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${
              showGrid
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={language === 'ar' ? 'إظهار/إخفاء حدود الاستيكرات' : 'Show/Hide Grid'}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">{language === 'ar' ? 'الشبكة' : 'Grid'}</span>
          </button>

          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${
              showRulers
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={language === 'ar' ? 'إظهار/إخفاء المساطر المليمترية' : 'Show/Hide Rulers'}
          >
            <RulerIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">{language === 'ar' ? 'المسطرة' : 'Ruler'}</span>
          </button>

          <button
            onClick={() => setShowIndexBadges(!showIndexBadges)}
            className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${
              showIndexBadges
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={language === 'ar' ? 'إظهار/إخفاء أرقام الاستيكرات' : 'Show/Hide Index Badges'}
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">{language === 'ar' ? 'الترقيم' : 'Indexes'}</span>
          </button>

          <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoomScale(zoomScale - 0.15)}
            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t('zoomOut')}
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          <span className="text-[10px] font-mono font-bold px-1 text-slate-700 dark:text-slate-300 min-w-[36px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            onClick={() => setZoomScale(zoomScale + 0.15)}
            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t('zoomIn')}
          >
            <ZoomIn className="w-3 h-3" />
          </button>

          <button
            onClick={handleFitToScreen}
            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t('fitScreen')}
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={containerRef}
        onClick={() => setSelectedStickerIndex(null)}
        className="flex-1 overflow-auto p-4 flex flex-col items-center justify-start relative"
      >
        {/* Page Navigation header */}
        <div className="w-full max-w-2xl mb-3" onClick={(e) => e.stopPropagation()}>
          <PageNavigation />
        </div>

        {/* Validation Errors Notice */}
        {!geometry.isValid && (
          <div className="max-w-md w-full mb-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <div className="font-bold text-xs">{language === 'ar' ? 'أبعاد القالب غير متطابقة مع حجم الورقة' : 'Template dimensions exceed paper size'}</div>
              <ul className="text-[11px] list-disc list-inside mt-0.5 space-y-0.5">
                {geometry.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Interactive A4 Sheet Container */}
        {geometry.isValid && (
          <div
            className="relative flex flex-col shadow-2xl transition-all duration-75"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: `${paperWidthPx + (showRulers ? 24 : 0)}px`,
            }}
          >
            {/* Top Ruler */}
            {showRulers && (
              <div className="flex">
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 border-b border-r border-slate-300 dark:border-slate-700 text-[8px] flex items-center justify-center font-mono text-slate-500 dark:text-slate-400">
                  mm
                </div>
                <RulerTop lengthMm={geometry.pageWidth} zoomScale={zoomScale} />
              </div>
            )}

            <div className="flex">
              {/* Left Ruler */}
              {showRulers && <RulerLeft lengthMm={geometry.pageHeight} zoomScale={zoomScale} />}

              {/* Physical A4 Paper */}
              <div
                id="a4-physical-sheet"
                className="relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md overflow-hidden select-none"
                style={{
                  width: `${paperWidthPx}px`,
                  height: `${paperHeightPx}px`,
                }}
              >
                {/* Paper Printable Margins Guides */}
                {showGrid && (
                  <div
                    className="absolute border border-dotted border-slate-300 dark:border-slate-700 pointer-events-none opacity-60"
                    style={{
                      left: `${mmToPx(template.marginLeft, zoomScale)}px`,
                      top: `${mmToPx(template.marginTop, zoomScale)}px`,
                      width: `${mmToPx(geometry.gridWidth, zoomScale)}px`,
                      height: `${mmToPx(geometry.gridHeight, zoomScale)}px`,
                    }}
                  />
                )}

                {/* Individual Stickers */}
                {activePage?.stickers.map((sticker) => (
                  <StickerCard
                    key={sticker.index}
                    sticker={sticker}
                    template={template}
                    zoomScale={zoomScale}
                    isSelected={selectedStickerIndex === sticker.index}
                    showGrid={showGrid}
                    showIndexBadges={showIndexBadges}
                    onSelect={() => setSelectedStickerIndex(sticker.index)}
                    onToggleUsed={() => toggleStickerUsed(currentPageIndex, sticker.index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Helper Info */}
        <div className="mt-4 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap justify-center font-mono">
          <span>{language === 'ar' ? '💡 تحديد وضبط بالأسهم' : '💡 Select & nudge with arrows'}</span>
          <span>•</span>
          <span>{language === 'ar' ? '🖱️ نقر مزدوج = تبديل مستعمل' : '🖱️ Double click = mark used'}</span>
          <span>•</span>
          <span>{language === 'ar' ? '✋ سحب للتحريك بالمليمتر' : '✋ Drag & drop to move'}</span>
        </div>
      </div>
    </div>
  );
};
