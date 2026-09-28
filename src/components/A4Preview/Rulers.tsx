import React from 'react';
import { mmToPx } from '../../lib/geometry';
import { usePrintStore } from '../../store/usePrintStore';

interface RulerProps {
  lengthMm: number;
  zoomScale: number;
}

export const RulerTop: React.FC<RulerProps> = ({ lengthMm, zoomScale }) => {
  const measurementUnit = usePrintStore((s) => s.measurementUnit);

  let stepMm = 10; // default 10mm
  let formatMark = (mm: number) => mm;

  if (measurementUnit === 'cm') {
    stepMm = 10;
    formatMark = (mm) => Math.round(mm / 10);
  } else if (measurementUnit === 'in') {
    stepMm = 25.4;
    formatMark = (mm) => Math.round(mm / 25.4);
  }

  const totalMarks = Math.ceil(lengthMm / stepMm);
  const marks = Array.from({ length: totalMarks + 1 }, (_, i) => i * stepMm);

  return (
    <div
      className="relative h-6 bg-slate-200 text-slate-600 border-b border-slate-300 select-none overflow-hidden dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[9px] font-mono"
      style={{ width: `${mmToPx(lengthMm, zoomScale)}px` }}
    >
      {marks.map((mmVal) => {
        const leftPx = mmToPx(mmVal, zoomScale);
        if (mmVal > lengthMm) return null;
        const displayNum = formatMark(mmVal);
        const midStep = stepMm / 2;

        return (
          <React.Fragment key={mmVal}>
            {/* Major tick */}
            <div
              className="absolute bottom-0 w-[1px] h-3.5 bg-slate-400 dark:bg-slate-500"
              style={{ left: `${leftPx}px` }}
            />
            {/* Number label */}
            <span
              className="absolute top-0 transform -translate-x-1/2"
              style={{ left: `${leftPx}px` }}
            >
              {displayNum}
            </span>
            {/* Half step mid tick */}
            {mmVal + midStep <= lengthMm && (
              <div
                className="absolute bottom-0 w-[1px] h-2 bg-slate-300 dark:bg-slate-600"
                style={{ left: `${mmToPx(mmVal + midStep, zoomScale)}px` }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const RulerLeft: React.FC<RulerProps> = ({ lengthMm, zoomScale }) => {
  const measurementUnit = usePrintStore((s) => s.measurementUnit);

  let stepMm = 10; // default 10mm
  let formatMark = (mm: number) => mm;

  if (measurementUnit === 'cm') {
    stepMm = 10;
    formatMark = (mm) => Math.round(mm / 10);
  } else if (measurementUnit === 'in') {
    stepMm = 25.4;
    formatMark = (mm) => Math.round(mm / 25.4);
  }

  const totalMarks = Math.ceil(lengthMm / stepMm);
  const marks = Array.from({ length: totalMarks + 1 }, (_, i) => i * stepMm);

  return (
    <div
      className="relative w-6 bg-slate-200 text-slate-600 border-r border-slate-300 select-none overflow-hidden dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[9px] font-mono"
      style={{ height: `${mmToPx(lengthMm, zoomScale)}px` }}
    >
      {marks.map((mmVal) => {
        const topPx = mmToPx(mmVal, zoomScale);
        if (mmVal > lengthMm) return null;
        const displayNum = formatMark(mmVal);
        const midStep = stepMm / 2;

        return (
          <React.Fragment key={mmVal}>
            {/* Major tick */}
            <div
              className="absolute right-0 h-[1px] w-3.5 bg-slate-400 dark:bg-slate-500"
              style={{ top: `${topPx}px` }}
            />
            {/* Number label */}
            <span
              className="absolute left-0.5 transform -translate-y-1/2 leading-none"
              style={{ top: `${topPx}px` }}
            >
              {displayNum}
            </span>
            {/* Half step mid tick */}
            {mmVal + midStep <= lengthMm && (
              <div
                className="absolute right-0 h-[1px] w-2 bg-slate-300 dark:bg-slate-600"
                style={{ top: `${mmToPx(mmVal + midStep, zoomScale)}px` }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
