import React, { useRef, useState } from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { useTranslation } from '../../lib/i18n';
import { PrintJob } from '../../types';
import { exportProjectToJson, parseProjectJson } from '../../lib/storage';
import {
  FolderOpen,
  Save,
  FileDown,
  Upload,
  Trash2,
  X,
  Clock,
  FileText,
} from 'lucide-react';

export const RecentJobsModal: React.FC = () => {
  const {
    isRecentJobsModalOpen,
    setRecentJobsModalOpen,
    recentJobs,
    loadJob,
    saveJob,
    removeJob,
    currentJobName,
    currentJobId,
    template,
    employeeNumbers,
    startPosition,
    usedStickersByPage,
    individualOffsetsByPage,
    manualAssignmentsByPage,
    calibration,
    language,
  } = usePrintStore();

  const { t } = useTranslation(language);
  const [jobNameInput, setJobNameInput] = useState(currentJobName);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  if (!isRecentJobsModalOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobNameInput.trim()) return;
    saveJob(jobNameInput.trim());
  };

  const handleExportCurrent = () => {
    const currentJob: PrintJob = {
      id: currentJobId,
      name: jobNameInput || currentJobName || (language === 'ar' ? 'عملية طباعة استيكرات' : 'Sticker Print Job'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template,
      employeeNumbers,
      startPosition,
      usedStickersByPage,
      individualOffsetsByPage,
      manualAssignmentsByPage,
      calibration,
    };
    exportProjectToJson(currentJob);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedJob = parseProjectJson(text);
        loadJob(parsedJob);
        setRecentJobsModalOpen(false);
      } catch (err: any) {
        alert(err?.message || (language === 'ar' ? 'تعذر قراءة ملف المشروع.' : 'Failed to parse project file.'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-sky-500" />
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {language === 'ar' ? 'إدارة وحفظ المشاريع (Projects & Print Jobs)' : 'Projects & Print Jobs Manager'}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'احفظ حالة الطباعة والورق المستعمل والأرقام للعودة إليها لاحقاً' : 'Save current state, used stickers, and numbers to resume anytime'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setRecentJobsModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Quick Save Current Job Bar */}
          <form
            onSubmit={handleSaveCurrent}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5"
          >
            <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              {language === 'ar' ? 'حفظ المشروع الحالي محلياً:' : 'Save Current Project Locally:'}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder={language === 'ar' ? 'اسم المشروع...' : 'Project name...'}
                value={jobNameInput}
                onChange={(e) => setJobNameInput(e.target.value)}
                className="flex-1 text-xs p-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'حفظ محلي' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportCurrent}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                title={language === 'ar' ? 'تصدير ملف JSON خارجي لنقله إلى جهاز آخر' : 'Export JSON to backup or transfer'}
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تصدير JSON' : 'Export JSON'}</span>
              </button>
            </div>
          </form>

          {/* Import JSON Section */}
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-[11px]">
                {language === 'ar' ? 'استيراد ملف مشروع سابق من جهازك (.json):' : 'Import project file from computer (.json):'}
              </span>
            </div>
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-2xs border border-slate-700"
            >
              {language === 'ar' ? 'اختيار ملف JSON' : 'Choose JSON File'}
            </button>
          </div>

          {/* Saved Jobs List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'ar' ? `المشاريع المحفوظة مؤخراً (${recentJobs.length}):` : `Saved Projects (${recentJobs.length}):`}
            </span>

            {recentJobs.length === 0 ? (
              <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-mono">
                {language === 'ar' ? 'لا توجد مشاريع محفوظة حتى الآن' : 'No saved projects yet'}
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentJobs.map((j) => (
                  <div
                    key={j.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 bg-white dark:bg-slate-850 flex items-center justify-between transition-all"
                  >
                    <div
                      onClick={() => {
                        loadJob(j);
                        setRecentJobsModalOpen(false);
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{j.name}</span>
                        {j.id === currentJobId && (
                          <span className="text-[9px] font-mono bg-sky-500/20 text-sky-600 dark:text-sky-400 px-1.5 py-0.2 rounded font-bold">
                            {language === 'ar' ? 'المفتوح حالياً' : 'Currently Active'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {j.employeeNumbers.length} {language === 'ar' ? 'موظف' : 'items'}
                        </span>
                        <span>•</span>
                        <span>{j.template.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(j.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          loadJob(j);
                          setRecentJobsModalOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-semibold shadow-2xs"
                      >
                        {language === 'ar' ? 'فتح' : 'Open'}
                      </button>
                      <button
                        onClick={() => exportProjectToJson(j)}
                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title={language === 'ar' ? 'تصدير كملف JSON' : 'Export as JSON'}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeJob(j.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={() => setRecentJobsModalOpen(false)}
            className="px-4 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
