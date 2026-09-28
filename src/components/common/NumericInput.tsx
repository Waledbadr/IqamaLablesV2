import React, { useState, useEffect, useRef } from 'react';
import { DimensionHighlightKey } from '../../types';
import { usePrintStore } from '../../store/usePrintStore';
import { mmToUnit, unitToMm, getUnitLabel, getUnitStep } from '../../lib/units';

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  fallbackValue?: number;
  unit?: string;
  containerClassName?: string;
  dimensionKey?: DimensionHighlightKey;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 'any',
  fallbackValue,
  unit,
  dimensionKey,
  className = '',
  containerClassName = '',
  onFocus,
  onBlur,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  ...restProps
}) => {
  const measurementUnit = usePrintStore((s) => s.measurementUnit);
  const language = usePrintStore((s) => s.language);
  const activeDimensionHighlight = usePrintStore((s) => s.activeDimensionHighlight);
  const setActiveDimensionHighlight = usePrintStore((s) => s.setActiveDimensionHighlight);

  // Columns and rows are discrete count overrides, not spatial linear dimensions
  const isSpatialDimension = Boolean(
    (dimensionKey && dimensionKey !== 'columns' && dimensionKey !== 'rows') ||
    unit === 'mm' ||
    unit === 'مم'
  );

  const toDisplayValue = (mm: number | undefined | null): string => {
    if (mm === undefined || mm === null || isNaN(mm)) return '';
    return isSpatialDimension ? String(mmToUnit(mm, measurementUnit)) : String(mm);
  };

  const [localText, setLocalText] = useState<string>(() => toDisplayValue(value));
  const isFocusedRef = useRef(false);

  const isHighlighted = Boolean(dimensionKey && activeDimensionHighlight === dimensionKey);

  // Sync external value or measurementUnit changes when not focused
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalText(toDisplayValue(value));
    }
  }, [value, measurementUnit, isSpatialDimension]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalText(text);

    // If empty or just a minus/dot sign while typing, don't force a minimum or push bad numbers
    if (text.trim() === '' || text === '-' || text === '.') {
      return;
    }

    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      const finalMm = isSpatialDimension ? unitToMm(parsed, measurementUnit) : parsed;
      onChange(finalMm);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    let num = parseFloat(localText);

    if (isNaN(num)) {
      const fallback = fallbackValue !== undefined ? fallbackValue : (min !== undefined ? min : 0);
      num = isSpatialDimension ? mmToUnit(fallback, measurementUnit) : fallback;
    } else {
      if (min !== undefined) {
        const boundMin = isSpatialDimension ? mmToUnit(min, measurementUnit) : min;
        if (num < boundMin) num = boundMin;
      }
      if (max !== undefined) {
        const boundMax = isSpatialDimension ? mmToUnit(max, measurementUnit) : max;
        if (num > boundMax) num = boundMax;
      }
    }

    setLocalText(String(num));
    const finalMm = isSpatialDimension ? unitToMm(num, measurementUnit) : num;
    onChange(finalMm);

    if (dimensionKey && usePrintStore.getState().activeDimensionHighlight === dimensionKey) {
      setActiveDimensionHighlight(null);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    e.target.select();
    if (dimensionKey) {
      setActiveDimensionHighlight(dimensionKey);
    }
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    if (dimensionKey) {
      setActiveDimensionHighlight(dimensionKey);
    }
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    if (dimensionKey && !isFocusedRef.current && usePrintStore.getState().activeDimensionHighlight === dimensionKey) {
      setActiveDimensionHighlight(null);
    }
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  };

  const effectiveStep = isSpatialDimension
    ? (step !== 'any' ? getUnitStep(measurementUnit) : 'any')
    : step;

  const effectiveMin = min !== undefined
    ? (isSpatialDimension ? mmToUnit(min, measurementUnit) : min)
    : undefined;

  const effectiveMax = max !== undefined
    ? (isSpatialDimension ? mmToUnit(max, measurementUnit) : max)
    : undefined;

  const displayUnit = isSpatialDimension
    ? getUnitLabel(measurementUnit, language)
    : unit;

  const defaultClasses = isHighlighted
    ? 'w-full text-xs font-mono p-1 rounded-md border-2 border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-950 dark:text-sky-100 font-bold ring-2 ring-sky-400/40 shadow-xs transition-all duration-150'
    : 'w-full text-xs font-mono p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all duration-150';

  const inputElement = (
    <input
      type="number"
      step={effectiveStep}
      min={effectiveMin}
      max={effectiveMax}
      value={localText}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className ? `${className} ${isHighlighted ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 font-bold' : ''}` : defaultClasses}
      {...restProps}
    />
  );

  if (displayUnit) {
    return (
      <div
        className={`flex items-center ${containerClassName}`}
        onMouseEnter={() => dimensionKey && setActiveDimensionHighlight(dimensionKey)}
        onMouseLeave={() => {
          if (dimensionKey && !isFocusedRef.current && usePrintStore.getState().activeDimensionHighlight === dimensionKey) {
            setActiveDimensionHighlight(null);
          }
        }}
      >
        {inputElement}
        <span className={`text-[10px] font-mono ms-1 shrink-0 transition-colors ${isHighlighted ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-400'}`}>
          {displayUnit}
        </span>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => dimensionKey && setActiveDimensionHighlight(dimensionKey)}
      onMouseLeave={() => {
        if (dimensionKey && !isFocusedRef.current && usePrintStore.getState().activeDimensionHighlight === dimensionKey) {
          setActiveDimensionHighlight(null);
        }
      }}
      className={containerClassName}
    >
      {inputElement}
    </div>
  );
};
