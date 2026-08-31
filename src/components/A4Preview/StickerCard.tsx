import React, { useRef, useState } from 'react';
import { StickerItem, StickerTemplate } from '../../types';
import { mmToPx } from '../../lib/geometry';
import { usePrintStore } from '../../store/usePrintStore';
import { Ban, Move, ArrowLeftRight } from 'lucide-react';

interface StickerCardProps {
  sticker: StickerItem;
  template: StickerTemplate;
  zoomScale: number;
  isSelected: boolean;
  showGrid: boolean;
  showIndexBadges: boolean;
  onSelect: () => void;
  onToggleUsed: () => void;
}

export const StickerCard: React.FC<StickerCardProps> = ({
  sticker,
  template,
  zoomScale,
  isSelected,
  showGrid,
  showIndexBadges,
  onSelect,
  onToggleUsed,
}) => {
  const {
    setSwapCandidate,
    getActivePageLayout,
  } = usePrintStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Position and size in screen pixels - strictly locked to template geometry
  const leftPx = mmToPx(sticker.finalX, zoomScale);
  const topPx = mmToPx(sticker.finalY, zoomScale);
  const widthPx = mmToPx(sticker.width, zoomScale);
  const heightPx = mmToPx(sticker.height, zoomScale);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only left click
    if (e.button !== 0) return;
    e.stopPropagation();

    // Select sticker on click
    onSelect();

    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;

      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 8) {
        setIsDragging(true);
        setDragPointerPos({ x: moveEvent.clientX, y: moveEvent.clientY });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (dragStartRef.current && sticker.status === 'assigned' && sticker.employeeNumber) {
        const dx = upEvent.clientX - dragStartRef.current.x;
        const dy = upEvent.clientY - dragStartRef.current.y;

        if (Math.hypot(dx, dy) > 8) {
          // Check if dropped onto another assigned sticker for clean value swap
          const pageLayout = getActivePageLayout();
          if (pageLayout) {
            // Find element under pointer
            const elemBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
            const stickerNode = elemBelow?.closest('[id^="sticker-node-"]');
            if (stickerNode) {
              const targetIndexStr = stickerNode.id.replace('sticker-node-', '');
              const targetIndex = parseInt(targetIndexStr, 10);
              const targetSticker = pageLayout.stickers.find((s) => s.index === targetIndex);

              if (
                targetSticker &&
                targetSticker.index !== sticker.index &&
                targetSticker.status !== 'used'
              ) {
                setSwapCandidate({
                  fromIndex: sticker.index,
                  toIndex: targetSticker.index,
                  fromNum: sticker.employeeNumber,
                  toNum: targetSticker.employeeNumber || '',
                });
              }
            }
          }
        }
      }

      setIsDragging(false);
      setDragPointerPos(null);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleUsed();
  };

  const isAssigned = sticker.status === 'assigned';
  const isUsed = sticker.status === 'used';
  const isAvailable = sticker.status === 'available';

  // Format display text
  const displayText = isAssigned
    ? `${template.prefix || ''}${sticker.employeeNumber || ''}${template.suffix || ''}`
    : '';

  return (
    <>
      <div
        id={`sticker-node-${sticker.index}`}
        onPointerDown={handlePointerDown}
        onDoubleClick={onToggleUsed}
        onContextMenu={handleContextMenu}
        className={`absolute select-none cursor-pointer transition-all group ${
          isSelected
            ? 'ring-2 ring-sky-500 ring-offset-1 ring-offset-slate-900 z-20 shadow-md'
            : 'z-10 hover:border-sky-400/60'
        }`}
        style={{
          left: `${leftPx}px`,
          top: `${topPx}px`,
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          borderRadius: `${template.cornerRadiusMm ? template.cornerRadiusMm * zoomScale * 3.78 : 2}px`,
          backgroundColor: isUsed ? '#fef2f2' : template.backgroundColor || '#ffffff',
        }}
        title={`استيكر #${sticker.displayIndex} (صف ${sticker.row + 1}, عمود ${sticker.col + 1})\n• النقر: تحديد\n• النقر المزدوج: تبديل مستعمل\n• السحب لخانة أخرى: تبديل الرقم`}
      >
        {/* Visual Border Guide */}
        <div
          className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-colors ${
            showGrid
              ? isSelected
                ? 'border border-sky-500 bg-sky-500/10'
                : isUsed
                ? 'border border-rose-300'
                : 'border border-dashed border-slate-300 dark:border-slate-600'
              : isSelected
              ? 'border border-sky-500'
              : ''
          }`}
        />

        {/* Used Sticker Visual Pattern */}
        {isUsed && (
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden bg-rose-100/70 dark:bg-rose-950/50 flex items-center justify-center pointer-events-none">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #f43f5e 0, #f43f5e 2px, transparent 0, transparent 8px)',
              }}
            />
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[9px] font-bold z-10 px-1 py-0.5 rounded bg-white/90 dark:bg-slate-900/90 shadow-2xs">
              <Ban className="w-2.5 h-2.5" />
              <span>مستعمل</span>
            </div>
          </div>
        )}

        {/* Index Badge */}
        {showIndexBadges && !isUsed && (
          <div className="absolute top-0.5 start-0.5 text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-slate-900/80 text-sky-400 border border-slate-700 pointer-events-none z-10">
            #{sticker.displayIndex}
          </div>
        )}

        {/* Custom Offset Indicator */}
        {sticker.isCustomMoved && (
          <div
            className="absolute bottom-0.5 end-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none z-10"
            title={`إزاحة: X:${sticker.offsetX}mm, Y:${sticker.offsetY}mm`}
          />
        )}

        {/* Assigned Employee Number Content */}
        {isAssigned && (
          <div
            className="w-full h-full p-1 flex overflow-hidden leading-tight pointer-events-none"
            style={{
              fontFamily: template.fontFamily || 'Cairo, sans-serif',
              fontSize: `${Math.max(8, (template.fontSize || 16) * zoomScale)}px`,
              fontWeight: template.fontWeight || 'bold',
              fontStyle: template.italic ? 'italic' : 'normal',
              color: template.textColor || '#0f172a',
              justifyContent:
                template.textAlign === 'left'
                  ? 'flex-start'
                  : template.textAlign === 'right'
                  ? 'flex-end'
                  : 'center',
              alignItems:
                template.verticalAlign === 'top'
                  ? 'flex-start'
                  : template.verticalAlign === 'bottom'
                  ? 'flex-end'
                  : 'center',
            }}
          >
            <span className="truncate max-w-full tracking-wider">{displayText}</span>
          </div>
        )}

        {/* Available placeholder */}
        {isAvailable && (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-[10px] pointer-events-none font-mono">
            <span className="opacity-40">فارغ</span>
          </div>
        )}

        {/* Floating Tooltip Indicator for selected sticker */}
        {isSelected && (
          <div className="absolute -top-5 start-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-sky-400 font-mono text-[8px] px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 z-40 whitespace-nowrap pointer-events-none">
            <span>#{sticker.displayIndex}</span>
            <span>(ص{sticker.row + 1}, ع{sticker.col + 1})</span>
          </div>
        )}
      </div>

      {/* Floating Drag Indicator when swapping or moving */}
      {isDragging && dragPointerPos && sticker.employeeNumber && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 bg-sky-600 text-white font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-2xl flex items-center gap-1.5 border border-sky-300 animate-pulse"
          style={{
            left: `${dragPointerPos.x}px`,
            top: `${dragPointerPos.y}px`,
          }}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>سحب: {sticker.employeeNumber} (أفلته في خانة فارغة أو استيكر آخر)</span>
        </div>
      )}
    </>
  );
};
