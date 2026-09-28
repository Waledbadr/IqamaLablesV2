import React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { MeasurementUnit } from '../../types';

interface UnitSelectorProps {
  size?: 'md' | 'sm' | 'xs';
  variant?: 'compact' | 'full';
  showLabel?: boolean;
  className?: string;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  size = 'xs',
  variant = 'compact',
  showLabel = false,
  className = '',
}) => {
  const { measurementUnit, setMeasurementUnit, language } = usePrintStore();
  const isAr = language === 'ar';

  const units: {
    id: MeasurementUnit;
    labelCompactAr: string;
    labelCompactEn: string;
    labelFullAr: string;
    labelFullEn: string;
    titleAr: string;
    titleEn: string;
  }[] = [
    {
      id: 'mm',
      labelCompactAr: 'مم',
      labelCompactEn: 'mm',
      labelFullAr: 'مم (mm)',
      labelFullEn: 'mm (Millimeter)',
      titleAr: 'المليمتر (mm) - القياس الأكثر دقة لطباعة الاستيكرات',
      titleEn: 'Millimeters (mm) - High precision standard',
    },
    {
      id: 'cm',
      labelCompactAr: 'سم',
      labelCompactEn: 'cm',
      labelFullAr: 'سم (cm)',
      labelFullEn: 'cm (Centimeter)',
      titleAr: 'السنتيمتر (cm) - 1 سم = 10 مم',
      titleEn: 'Centimeters (cm) - 1 cm = 10 mm',
    },
    {
      id: 'in',
      labelCompactAr: 'بوصة',
      labelCompactEn: 'in',
      labelFullAr: 'بوصة (in)',
      labelFullEn: 'in (Inches)',
      titleAr: 'البوصة / إنش (in) - 1 بوصة = 25.4 مم',
      titleEn: 'Inches (in) - 1 inch = 25.4 mm',
    },
  ];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {showLabel && (
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
          {isAr ? 'وحدة القياس:' : 'Measurement Unit:'}
        </span>
      )}
      <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs w-full sm:w-auto">
        {units.map((u) => {
          const isSelected = measurementUnit === u.id;
          const displayLabel = variant === 'full'
            ? (isAr ? u.labelFullAr : u.labelFullEn)
            : (isAr ? u.labelCompactAr : u.labelCompactEn);

          return (
            <button
              key={u.id}
              type="button"
              onClick={() => setMeasurementUnit(u.id)}
              className={`font-mono font-bold transition-all flex items-center justify-center flex-1 rounded-md text-center ${
                size === 'xs'
                  ? 'px-2 py-0.5 text-[10px] min-w-[28px]'
                  : size === 'sm'
                  ? 'px-3 py-1.5 text-xs min-w-[36px]'
                  : 'px-4 py-2 text-xs min-w-[44px]'
              } ${
                isSelected
                  ? 'bg-sky-500 text-slate-950 shadow-xs font-black ring-1 ring-sky-400/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
              title={isAr ? u.titleAr : u.titleEn}
            >
              <span>{displayLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

