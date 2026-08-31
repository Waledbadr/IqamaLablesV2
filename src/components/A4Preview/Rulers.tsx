import React from 'react';
import { mmToPx } from '../../lib/geometry';

interface RulerProps {
  lengthMm: number;
  zoomScale: number;
}

export const RulerTop: React.FC<RulerProps> = ({ lengthMm, zoomScale }) => {
  const totalMarks = Math.ceil(lengthMm / 10);
  const marks = Array.from({ length: totalMarks + 1 }, (_, i) => i * 10);

  return (
    <div
      className="relative h-6 bg-slate-200 text-slate-600 border-b border-slate-300 select-none overflow-hidden dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[9px] font-mono"
      style={{ width: `${mmToPx(lengthMm, zoomScale)}px` }}
    >
      {marks.map((mm) => {
        const leftPx = mmToPx(mm, zoomScale);
        if (mm > lengthMm) return null;
        return (
          <React.Fragment key={mm}>
            {/* Major tick (10mm) */}
            <div
              className="absolute bottom-0 w-[1px] h-3.5 bg-slate-400 dark:bg-slate-500"
              style={{ left: `${leftPx}px` }}
            />
            {/* Number label */}
            <span
              className="absolute top-0 transform -translate-x-1/2"
              style={{ left: `${leftPx}px` }}
            >
              {mm}
            </span>
            {/* 5mm mid tick */}
            {mm + 5 <= lengthMm && (
              <div
                className="absolute bottom-0 w-[1px] h-2 bg-slate-300 dark:bg-slate-600"
                style={{ left: `${mmToPx(mm + 5, zoomScale)}px` }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const RulerLeft: React.FC<RulerProps> = ({ lengthMm, zoomScale }) => {
  const totalMarks = Math.ceil(lengthMm / 10);
  const marks = Array.from({ length: totalMarks + 1 }, (_, i) => i * 10);

  return (
    <div
      className="relative w-6 bg-slate-200 text-slate-600 border-r border-slate-300 select-none overflow-hidden dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[9px] font-mono"
      style={{ height: `${mmToPx(lengthMm, zoomScale)}px` }}
    >
      {marks.map((mm) => {
        const topPx = mmToPx(mm, zoomScale);
        if (mm > lengthMm) return null;
        return (
          <React.Fragment key={mm}>
            {/* Major tick (10mm) */}
            <div
              className="absolute right-0 h-[1px] w-3.5 bg-slate-400 dark:bg-slate-500"
              style={{ top: `${topPx}px` }}
            />
            {/* Number label */}
            <span
              className="absolute left-0.5 transform -translate-y-1/2 leading-none"
              style={{ top: `${topPx}px` }}
            >
              {mm}
            </span>
            {/* 5mm mid tick */}
            {mm + 5 <= lengthMm && (
              <div
                className="absolute right-0 h-[1px] w-2 bg-slate-300 dark:bg-slate-600"
                style={{ top: `${mmToPx(mm + 5, zoomScale)}px` }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
