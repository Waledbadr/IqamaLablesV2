import React from 'react';
import { DimensionHighlightKey, GeometryCalculation, Language, StickerTemplate } from '../../types';
import { mmToPx } from '../../lib/geometry';
import { usePrintStore } from '../../store/usePrintStore';
import { formatUnitValue } from '../../lib/units';

interface DimensionOverlayProps {
  template: StickerTemplate;
  geometry: GeometryCalculation;
  zoomScale: number;
  language: Language;
  activeHighlight: DimensionHighlightKey | null;
  showAllGuides: boolean;
}

export const DimensionOverlay: React.FC<DimensionOverlayProps> = ({
  template,
  geometry,
  zoomScale,
  language,
  activeHighlight,
  showAllGuides,
}) => {
  const measurementUnit = usePrintStore((s) => s.measurementUnit);

  // If neither full guides mode is active nor any single dimension is highlighted, return null
  if (!showAllGuides && !activeHighlight) {
    return null;
  }

  const isAr = language === 'ar';
  const toPx = (mm: number) => mmToPx(mm, zoomScale);

  const paperW = toPx(geometry.pageWidth);
  const paperH = toPx(geometry.pageHeight);

  const isRtl = template.flowDirection === 'rtl';

  // Calculate coordinates of grid and reference stickers
  const colStepMm = template.stickerWidth + template.horizontalGap;
  const rowStepMm = template.stickerHeight + template.verticalGap;

  // Visual column 0 position (physical col depends on RTL/LTR)
  const firstColPhysical = isRtl ? geometry.columns - 1 : 0;
  const firstColLeftMm = template.marginLeft + firstColPhysical * colStepMm;
  const firstColRightMm = firstColLeftMm + template.stickerWidth;

  const firstColLeftPx = toPx(firstColLeftMm);
  const firstColRightPx = toPx(firstColRightMm);
  const firstRowTopPx = toPx(template.marginTop);
  const firstRowBottomPx = toPx(template.marginTop + template.stickerHeight);

  // Determine which items should be shown
  const isAll = showAllGuides;
  const showPaperWidth = isAll || activeHighlight === 'paperWidth';
  const showPaperHeight = isAll || activeHighlight === 'paperHeight';
  const showMarginTop = isAll || activeHighlight === 'marginTop';
  const showMarginBottom = isAll || activeHighlight === 'marginBottom';
  const showMarginLeft = isAll || activeHighlight === 'marginLeft';
  const showMarginRight = isAll || activeHighlight === 'marginRight';
  const showStickerW = isAll || activeHighlight === 'stickerWidth';
  const showStickerH = isAll || activeHighlight === 'stickerHeight';
  const showGapX = isAll || activeHighlight === 'horizontalGap';
  const showGapY = isAll || activeHighlight === 'verticalGap';
  const showCols = activeHighlight === 'columns';
  const showRows = activeHighlight === 'rows';
  const showOffset = activeHighlight === 'globalOffsetX' || activeHighlight === 'globalOffsetY';

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 overflow-visible"
      style={{ width: `${paperW}px`, height: `${paperH}px` }}
    >
      <svg
        className="w-full h-full overflow-visible"
        width={paperW}
        height={paperH}
        viewBox={`0 0 ${paperW} ${paperH}`}
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="dim-arrow-active"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0284c7" />
          </marker>

          <marker
            id="dim-arrow-amber"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>

          <marker
            id="dim-arrow-emerald"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981" />
          </marker>

          <marker
            id="dim-arrow-subtle"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
          </marker>

          {/* Hatching patterns */}
          <pattern
            id="dim-hatch-cyan"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#0284c7" strokeWidth="2" strokeOpacity="0.35" />
          </pattern>

          <pattern
            id="dim-hatch-amber"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="2.5" strokeOpacity="0.45" />
          </pattern>
        </defs>

        {/* ---------------- 1. SHEET BORDERS & DIMENSIONS (Paper Width / Height) ---------------- */}
        {showPaperWidth && (
          <g className={activeHighlight === 'paperWidth' ? 'animate-pulse' : ''}>
            {/* Full edge highlight lines */}
            <line x1="0" y1="0" x2="0" y2={paperH} stroke="#0284c7" strokeWidth="3" strokeDasharray="4 2" />
            <line x1={paperW} y1="0" x2={paperW} y2={paperH} stroke="#0284c7" strokeWidth="3" strokeDasharray="4 2" />

            {/* Top Dimension line */}
            <line
              x1="0"
              y1={Math.min(22, paperH * 0.05)}
              x2={paperW}
              y2={Math.min(22, paperH * 0.05)}
              stroke="#0284c7"
              strokeWidth="2.5"
              markerStart="url(#dim-arrow-active)"
              markerEnd="url(#dim-arrow-active)"
            />
          </g>
        )}

        {showPaperHeight && (
          <g className={activeHighlight === 'paperHeight' ? 'animate-pulse' : ''}>
            {/* Top & bottom edge highlight lines */}
            <line x1="0" y1="0" x2={paperW} y2="0" stroke="#0284c7" strokeWidth="3" strokeDasharray="4 2" />
            <line x1="0" y1={paperH} x2={paperW} y2={paperH} stroke="#0284c7" strokeWidth="3" strokeDasharray="4 2" />

            {/* Side Dimension line */}
            <line
              x1={Math.min(22, paperW * 0.05)}
              y1="0"
              x2={Math.min(22, paperW * 0.05)}
              y2={paperH}
              stroke="#0284c7"
              strokeWidth="2.5"
              markerStart="url(#dim-arrow-active)"
              markerEnd="url(#dim-arrow-active)"
            />
          </g>
        )}

        {/* ---------------- 2. MARGINS HIGHLIGHTS (Top, Bottom, Left, Right) ---------------- */}
        {showMarginTop && template.marginTop > 0 && (
          <g>
            <rect
              x="0"
              y="0"
              width={paperW}
              height={toPx(template.marginTop)}
              fill="url(#dim-hatch-cyan)"
              className={activeHighlight === 'marginTop' ? 'opacity-100' : 'opacity-60'}
            />
            <line
              x1={paperW / 2}
              y1="0"
              x2={paperW / 2}
              y2={toPx(template.marginTop)}
              stroke={activeHighlight === 'marginTop' ? '#0284c7' : '#64748b'}
              strokeWidth="2"
              markerStart={activeHighlight === 'marginTop' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
              markerEnd={activeHighlight === 'marginTop' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
            />
          </g>
        )}

        {showMarginBottom && template.marginBottom > 0 && (
          <g>
            <rect
              x="0"
              y={paperH - toPx(template.marginBottom)}
              width={paperW}
              height={toPx(template.marginBottom)}
              fill="url(#dim-hatch-cyan)"
              className={activeHighlight === 'marginBottom' ? 'opacity-100' : 'opacity-60'}
            />
            <line
              x1={paperW / 2}
              y1={paperH - toPx(template.marginBottom)}
              x2={paperW / 2}
              y2={paperH}
              stroke={activeHighlight === 'marginBottom' ? '#0284c7' : '#64748b'}
              strokeWidth="2"
              markerStart={activeHighlight === 'marginBottom' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
              markerEnd={activeHighlight === 'marginBottom' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
            />
          </g>
        )}

        {showMarginLeft && template.marginLeft > 0 && (
          <g>
            <rect
              x="0"
              y="0"
              width={toPx(template.marginLeft)}
              height={paperH}
              fill="url(#dim-hatch-cyan)"
              className={activeHighlight === 'marginLeft' ? 'opacity-100' : 'opacity-60'}
            />
            <line
              x1="0"
              y1={paperH / 2}
              x2={toPx(template.marginLeft)}
              y2={paperH / 2}
              stroke={activeHighlight === 'marginLeft' ? '#0284c7' : '#64748b'}
              strokeWidth="2"
              markerStart={activeHighlight === 'marginLeft' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
              markerEnd={activeHighlight === 'marginLeft' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
            />
          </g>
        )}

        {showMarginRight && template.marginRight > 0 && (
          <g>
            <rect
              x={paperW - toPx(template.marginRight)}
              y="0"
              width={toPx(template.marginRight)}
              height={paperH}
              fill="url(#dim-hatch-cyan)"
              className={activeHighlight === 'marginRight' ? 'opacity-100' : 'opacity-60'}
            />
            <line
              x1={paperW - toPx(template.marginRight)}
              y1={paperH / 2}
              x2={paperW}
              y2={paperH / 2}
              stroke={activeHighlight === 'marginRight' ? '#0284c7' : '#64748b'}
              strokeWidth="2"
              markerStart={activeHighlight === 'marginRight' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
              markerEnd={activeHighlight === 'marginRight' ? 'url(#dim-arrow-active)' : 'url(#dim-arrow-subtle)'}
            />
          </g>
        )}

        {/* ---------------- 3. COLUMN GAPS (الهامش بين الأعمدة) ---------------- */}
        {showGapX && geometry.columns >= 2 && (
          <g>
            {/* Draw shaded gap stripes between all columns */}
            {Array.from({ length: geometry.columns - 1 }).map((_, cIdx) => {
              const leftColIdx = isRtl ? geometry.columns - 2 - cIdx : cIdx;
              const colLeftMm = template.marginLeft + leftColIdx * colStepMm;
              const gapStartMm = colLeftMm + template.stickerWidth;
              const gapWidthMm = template.horizontalGap;

              const gapStartPx = toPx(gapStartMm);
              const gapWidthPx = Math.max(1, toPx(gapWidthMm));

              const isPrimaryGap = cIdx === 0;

              return (
                <g key={`gap-x-${cIdx}`}>
                  {/* Vertical stripe for column gap */}
                  <rect
                    x={gapStartPx}
                    y={toPx(template.marginTop)}
                    width={gapWidthPx}
                    height={toPx(geometry.gridHeight)}
                    fill={activeHighlight === 'horizontalGap' ? 'url(#dim-hatch-amber)' : 'url(#dim-hatch-cyan)'}
                    stroke={activeHighlight === 'horizontalGap' ? '#f59e0b' : '#0284c7'}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-80"
                  />

                  {/* Leader and dimension arrows on primary gap */}
                  {isPrimaryGap && gapWidthPx > 4 && (
                    <line
                      x1={gapStartPx}
                      y1={firstRowTopPx + toPx(template.stickerHeight) / 2}
                      x2={gapStartPx + gapWidthPx}
                      y2={firstRowTopPx + toPx(template.stickerHeight) / 2}
                      stroke={activeHighlight === 'horizontalGap' ? '#d97706' : '#0284c7'}
                      strokeWidth="2"
                      markerStart={activeHighlight === 'horizontalGap' ? 'url(#dim-arrow-amber)' : 'url(#dim-arrow-active)'}
                      markerEnd={activeHighlight === 'horizontalGap' ? 'url(#dim-arrow-amber)' : 'url(#dim-arrow-active)'}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* ---------------- 4. ROW GAPS (المسافة بين الصفوف) ---------------- */}
        {showGapY && geometry.rows >= 2 && (
          <g>
            {Array.from({ length: geometry.rows - 1 }).map((_, rIdx) => {
              const rowTopMm = template.marginTop + rIdx * rowStepMm;
              const gapStartMm = rowTopMm + template.stickerHeight;
              const gapHeightMm = template.verticalGap;

              const gapStartPx = toPx(gapStartMm);
              const gapHeightPx = Math.max(1, toPx(gapHeightMm));

              const isPrimaryGap = rIdx === 0;

              return (
                <g key={`gap-y-${rIdx}`}>
                  {/* Horizontal stripe for row gap */}
                  <rect
                    x={toPx(template.marginLeft)}
                    y={gapStartPx}
                    width={toPx(geometry.gridWidth)}
                    height={gapHeightPx}
                    fill={activeHighlight === 'verticalGap' ? 'url(#dim-hatch-amber)' : 'url(#dim-hatch-cyan)'}
                    stroke={activeHighlight === 'verticalGap' ? '#f59e0b' : '#0284c7'}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-80"
                  />

                  {isPrimaryGap && gapHeightPx > 4 && (
                    <line
                      x1={firstColLeftPx + toPx(template.stickerWidth) / 2}
                      y1={gapStartPx}
                      x2={firstColLeftPx + toPx(template.stickerWidth) / 2}
                      y2={gapStartPx + gapHeightPx}
                      stroke={activeHighlight === 'verticalGap' ? '#d97706' : '#0284c7'}
                      strokeWidth="2"
                      markerStart={activeHighlight === 'verticalGap' ? 'url(#dim-arrow-amber)' : 'url(#dim-arrow-active)'}
                      markerEnd={activeHighlight === 'verticalGap' ? 'url(#dim-arrow-amber)' : 'url(#dim-arrow-active)'}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* ---------------- 5. STICKER DIMENSIONS (عرض وطول الاستيكر) ---------------- */}
        {(showStickerW || showStickerH) && (
          <g>
            {/* Box highlight on reference sticker */}
            <rect
              x={firstColLeftPx}
              y={firstRowTopPx}
              width={toPx(template.stickerWidth)}
              height={toPx(template.stickerHeight)}
              fill="rgba(14, 165, 233, 0.12)"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              className="animate-pulse"
            />

            {/* Sticker Width Dimension Line */}
            {showStickerW && (
              <line
                x1={firstColLeftPx}
                y1={firstRowTopPx - 8}
                x2={firstColRightPx}
                y2={firstRowTopPx - 8}
                stroke="#0284c7"
                strokeWidth="2.5"
                markerStart="url(#dim-arrow-active)"
                markerEnd="url(#dim-arrow-active)"
              />
            )}

            {/* Sticker Height Dimension Line */}
            {showStickerH && (
              <line
                x1={firstColRightPx + 8}
                y1={firstRowTopPx}
                x2={firstColRightPx + 8}
                y2={firstRowBottomPx}
                stroke="#0284c7"
                strokeWidth="2.5"
                markerStart="url(#dim-arrow-active)"
                markerEnd="url(#dim-arrow-active)"
              />
            )}
          </g>
        )}

        {/* ---------------- 6. COLUMNS OVERVIEW (عدد الأعمدة) ---------------- */}
        {showCols && (
          <g>
            {Array.from({ length: geometry.columns }).map((_, c) => {
              const pCol = isRtl ? geometry.columns - 1 - c : c;
              const leftPx = toPx(template.marginLeft + pCol * colStepMm);
              const wPx = toPx(template.stickerWidth);
              return (
                <rect
                  key={`col-track-${c}`}
                  x={leftPx}
                  y={toPx(template.marginTop)}
                  width={wPx}
                  height={toPx(geometry.gridHeight)}
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              );
            })}
          </g>
        )}

        {/* ---------------- 7. ROWS OVERVIEW (عدد الصفوف) ---------------- */}
        {showRows && (
          <g>
            {Array.from({ length: geometry.rows }).map((_, r) => {
              const topPx = toPx(template.marginTop + r * rowStepMm);
              const hPx = toPx(template.stickerHeight);
              return (
                <rect
                  key={`row-track-${r}`}
                  x={toPx(template.marginLeft)}
                  y={topPx}
                  width={toPx(geometry.gridWidth)}
                  height={hPx}
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* ---------------- HTML FLOATING NUMERICAL BADGES ---------------- */}

      {/* Paper Width Badge */}
      {showPaperWidth && (
        <div
          className="absolute z-40 transform -translate-x-1/2 flex items-center shadow-lg transition-transform"
          style={{
            left: `${paperW / 2}px`,
            top: `${Math.max(4, Math.min(22, paperH * 0.05) - 12)}px`,
          }}
        >
          <span className="bg-sky-600 text-white font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-300 shadow-md whitespace-nowrap flex items-center gap-1.5">
            <span>↔</span>
            <span>{isAr ? 'عرض الورقة:' : 'Paper Width:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.paperWidth, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Paper Height Badge */}
      {showPaperHeight && (
        <div
          className="absolute z-40 transform -translate-y-1/2 flex items-center shadow-lg transition-transform"
          style={{
            left: `${Math.max(6, Math.min(24, paperW * 0.05) + 6)}px`,
            top: `${paperH / 2}px`,
          }}
        >
          <span className="bg-sky-600 text-white font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-300 shadow-md whitespace-nowrap flex items-center gap-1.5">
            <span>↕</span>
            <span>{isAr ? 'طول الورقة:' : 'Paper Height:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.paperHeight, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Column Gap Badge (المسافة بين الأعمدة) */}
      {showGapX && (
        <div
          className="absolute z-40 flex items-center shadow-lg transition-all"
          style={{
            left: `${
              geometry.columns >= 2
                ? toPx(
                    (isRtl
                      ? template.marginLeft + (geometry.columns - 2) * colStepMm + template.stickerWidth
                      : template.marginLeft + template.stickerWidth) +
                      template.horizontalGap / 2
                  )
                : paperW / 2
            }px`,
            top: `${firstRowTopPx + toPx(template.stickerHeight) / 2}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-amber-600 dark:bg-amber-500 text-white font-mono text-[11px] font-bold px-3 py-1 rounded-md border-2 border-amber-300 shadow-xl whitespace-nowrap flex items-center gap-1.5 animate-bounce">
            <span className="text-xs">↔</span>
            <span>{isAr ? 'المسافة بين الأعمدة:' : 'Column Gap:'}</span>
            <span className="bg-slate-950/80 text-amber-300 px-1.5 py-0.2 rounded font-extrabold text-xs">
              {formatUnitValue(template.horizontalGap, measurementUnit, language)}
            </span>
            {template.horizontalGap === 0 && (
              <span className="text-[10px] text-amber-200 opacity-90">({isAr ? 'متلاصقة' : 'Touch'})</span>
            )}
          </div>
        </div>
      )}

      {/* Row Gap Badge (المسافة بين الصفوف) */}
      {showGapY && (
        <div
          className="absolute z-40 flex items-center shadow-lg transition-all"
          style={{
            left: `${firstColLeftPx + toPx(template.stickerWidth) / 2}px`,
            top: `${
              geometry.rows >= 2
                ? toPx(template.marginTop + template.stickerHeight + template.verticalGap / 2)
                : paperH / 2
            }px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-amber-600 dark:bg-amber-500 text-white font-mono text-[11px] font-bold px-3 py-1 rounded-md border-2 border-amber-300 shadow-xl whitespace-nowrap flex items-center gap-1.5 animate-bounce">
            <span className="text-xs">↕</span>
            <span>{isAr ? 'المسافة بين الصفوف:' : 'Row Gap:'}</span>
            <span className="bg-slate-950/80 text-amber-300 px-1.5 py-0.2 rounded font-extrabold text-xs">
              {formatUnitValue(template.verticalGap, measurementUnit, language)}
            </span>
            {template.verticalGap === 0 && (
              <span className="text-[10px] text-amber-200 opacity-90">({isAr ? 'متلاصقة' : 'Touch'})</span>
            )}
          </div>
        </div>
      )}

      {/* Sticker Width Badge */}
      {showStickerW && (
        <div
          className="absolute z-40 transform -translate-x-1/2 -translate-y-full mb-1 flex items-center shadow-lg"
          style={{
            left: `${firstColLeftPx + toPx(template.stickerWidth) / 2}px`,
            top: `${Math.max(4, firstRowTopPx - 10)}px`,
          }}
        >
          <span className="bg-sky-600 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-300 shadow-md whitespace-nowrap flex items-center gap-1">
            <span>{isAr ? 'عرض الاستيكر:' : 'Sticker Width:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.stickerWidth, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Sticker Height Badge */}
      {showStickerH && (
        <div
          className="absolute z-40 transform -translate-y-1/2 ms-2 flex items-center shadow-lg"
          style={{
            left: `${firstColRightPx + 10}px`,
            top: `${firstRowTopPx + toPx(template.stickerHeight) / 2}px`,
          }}
        >
          <span className="bg-sky-600 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-300 shadow-md whitespace-nowrap flex items-center gap-1">
            <span>{isAr ? 'ارتفاع الاستيكر:' : 'Sticker Height:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.stickerHeight, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Top Margin Badge */}
      {showMarginTop && (
        <div
          className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 flex items-center"
          style={{
            left: `${paperW / 2}px`,
            top: `${toPx(template.marginTop) / 2}px`,
          }}
        >
          <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-300 shadow whitespace-nowrap flex items-center gap-1">
            <span>{isAr ? 'الهامش العلوي:' : 'Top Margin:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.marginTop, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Bottom Margin Badge */}
      {showMarginBottom && (
        <div
          className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 flex items-center"
          style={{
            left: `${paperW / 2}px`,
            top: `${paperH - toPx(template.marginBottom) / 2}px`,
          }}
        >
          <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-300 shadow whitespace-nowrap flex items-center gap-1">
            <span>{isAr ? 'الهامش السفلي:' : 'Bottom Margin:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.marginBottom, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Left Margin Badge */}
      {showMarginLeft && (
        <div
          className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 flex items-center"
          style={{
            left: `${toPx(template.marginLeft) / 2}px`,
            top: `${paperH / 2}px`,
          }}
        >
          <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-300 shadow whitespace-nowrap flex items-center gap-1">
            <span>{isAr ? 'الهامش الأيسر:' : 'Left Margin:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.marginLeft, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Right Margin Badge */}
      {showMarginRight && (
        <div
          className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 flex items-center"
          style={{
            left: `${paperW - toPx(template.marginRight) / 2}px`,
            top: `${paperH / 2}px`,
          }}
        >
          <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-300 shadow whitespace-nowrap flex items-center gap-1">
            <span>{isAr ? 'الهامش الأيمن:' : 'Right Margin:'}</span>
            <strong className="text-yellow-200">{formatUnitValue(template.marginRight, measurementUnit, language)}</strong>
          </span>
        </div>
      )}

      {/* Columns Count Badges */}
      {showCols && (
        <div
          className="absolute z-40 transform -translate-x-1/2 -translate-y-full mb-1 flex items-center gap-1"
          style={{
            left: `${paperW / 2}px`,
            top: `${firstRowTopPx - 6}px`,
          }}
        >
          <span className="bg-sky-600 text-white font-mono text-[11px] font-extrabold px-3 py-1 rounded-md border border-sky-300 shadow-lg whitespace-nowrap flex items-center gap-1.5">
            <span>{isAr ? 'عدد الأعمدة:' : 'Total Columns:'}</span>
            <strong className="bg-slate-900 text-yellow-300 px-1.5 py-0.2 rounded">{geometry.columns}</strong>
          </span>
        </div>
      )}

      {/* Rows Count Badges */}
      {showRows && (
        <div
          className="absolute z-40 transform -translate-y-1/2 ms-2 flex items-center gap-1"
          style={{
            left: `${toPx(template.marginLeft + geometry.gridWidth) + 6}px`,
            top: `${paperH / 2}px`,
          }}
        >
          <span className="bg-sky-600 text-white font-mono text-[11px] font-extrabold px-3 py-1 rounded-md border border-sky-300 shadow-lg whitespace-nowrap flex items-center gap-1.5">
            <span>{isAr ? 'عدد الصفوف:' : 'Total Rows:'}</span>
            <strong className="bg-slate-900 text-yellow-300 px-1.5 py-0.2 rounded">{geometry.rows}</strong>
          </span>
        </div>
      )}

      {/* Offset Indicator */}
      {showOffset && (
        <div
          className="absolute z-40 transform -translate-x-1/2 flex items-center shadow-lg"
          style={{
            left: `${paperW / 2}px`,
            bottom: '16px',
          }}
        >
          <span className="bg-purple-600 text-white font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-purple-300 shadow-xl whitespace-nowrap flex items-center gap-2">
            <span>🎯 {isAr ? 'إزاحة الصفحة:' : 'Sheet Offset:'}</span>
            <span>X: <strong>{formatUnitValue(template.globalOffsetX, measurementUnit, language)}</strong></span>
            <span>Y: <strong>{formatUnitValue(template.globalOffsetY, measurementUnit, language)}</strong></span>
          </span>
        </div>
      )}
    </div>
  );
};
