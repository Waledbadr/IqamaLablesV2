import { create } from 'zustand';
import {
  DimensionHighlightKey,
  Language,
  MeasurementUnit,
  PageLayout,
  PrinterCalibration,
  PrintJob,
  StepSize,
  StickerTemplate,
  ThemeMode,
} from '../types';
import { AssignmentResult, computeAssignments } from '../lib/assignmentEngine';
import { calculateGeometry } from '../lib/geometry';
import {
  deleteCustomTemplate,
  deletePrintJob,
  loadCalibration,
  loadRecentJobs,
  loadSavedTemplates,
  loadSettings,
  saveCalibration,
  saveCustomTemplate,
  savePrintJob,
  saveSettings,
  loadPinnedDefaultTemplate,
  savePinnedDefaultTemplate,
  loadCurrentSheetState,
  saveCurrentSheetState,
  clearCurrentSheetState,
} from '../lib/storage';
import { DEFAULT_TEMPLATE } from '../lib/templates';
import { normalizeEmployeeInput } from '../lib/excelParser';

interface HistorySnapshot {
  template: StickerTemplate;
  employeeNumbers: string[];
  startPosition: number;
  usedStickersByPage: Record<number, number[]>;
  individualOffsetsByPage: Record<number, Record<number, { x: number; y: number }>>;
  manualAssignmentsByPage: Record<number, Record<number, string>>;
  calibration: PrinterCalibration;
}

export interface PrintStoreState {
  // Document state
  currentJobId: string;
  currentJobName: string;
  template: StickerTemplate;
  employeeNumbers: string[];
  rawInputText: string;
  startPosition: number; // 1-based on Page 1
  currentPageIndex: number;
  selectedStickerIndex: number | null;
  usedStickersByPage: Record<number, number[]>;
  individualOffsetsByPage: Record<number, Record<number, { x: number; y: number }>>;
  manualAssignmentsByPage: Record<number, Record<number, string>>;
  calibration: PrinterCalibration;

  // Editor configuration
  stepSize: StepSize;
  zoomScale: number;
  showGrid: boolean;
  showRulers: boolean;
  showIndexBadges: boolean;
  showDimensionGuides: boolean;
  activeDimensionHighlight: DimensionHighlightKey | null;
  measurementUnit: MeasurementUnit;
  language: Language;
  theme: ThemeMode;
  toastMessage: string | null;

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Persistence collections
  defaultTemplateId: string;
  savedTemplates: StickerTemplate[];
  recentJobs: PrintJob[];

  // UI Modals & Workflows
  isPrintPreviewOpen: boolean;
  isCalibrationModalOpen: boolean;
  isTemplatesModalOpen: boolean;
  isRecentJobsModalOpen: boolean;
  isHelpModalOpen: boolean;
  isExcelImportModalOpen: boolean;
  isPostPrintModalOpen: boolean;
  postPrintSummary: {
    printedCount: number;
    pagesCount: number;
    printedStickersByPage: Record<number, number[]>;
  } | null;
  swapCandidate: { fromIndex: number; toIndex: number; fromNum: string; toNum: string } | null;

  // Computed layout accessor
  getAssignmentResult: () => AssignmentResult;
  getActivePageLayout: () => PageLayout | null;

  // Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setToastMessage: (msg: string | null) => void;

  // Template actions
  setTemplate: (template: StickerTemplate) => void;
  setDefaultTemplate: (templateId: string) => void;
  pinCurrentTemplateAsDefault: () => void;
  updateTemplateField: <K extends keyof StickerTemplate>(key: K, value: StickerTemplate[K]) => void;
  saveCurrentTemplate: (name: string, setAsDefault?: boolean) => void;
  updateCurrentTemplateInPlace: () => void;
  removeCustomTemplate: (templateId: string) => void;

  // Data actions
  setEmployeeNumbers: (numbers: string[]) => void;
  setRawInputText: (text: string) => void;
  removeDuplicateNumbers: () => void;
  clearEmployeeData: () => void;
  setStartPosition: (pos: number) => void;

  // Navigation and selection
  setCurrentPageIndex: (idx: number) => void;
  setSelectedStickerIndex: (idx: number | null) => void;

  // Used stickers & Sheet Reuse management
  toggleStickerUsed: (pageIndex: number, stickerIndex: number) => void;
  markRowUsed: (pageIndex: number, rowIndex: number) => void;
  markColUsed: (pageIndex: number, colIndex: number) => void;
  markAllUsed: (pageIndex: number) => void;
  clearAllUsed: (pageIndex: number) => void;
  clearAllUsedAllPages: (resetStartPos?: boolean) => void;
  startFreshBlankSheet: () => void;

  // Post-Print Workflow
  triggerPostPrintWorkflow: () => void;
  confirmMarkPrintedAsUsed: (clearPrintedEmployees?: boolean) => void;
  setPostPrintModalOpen: (open: boolean) => void;

  // Position adjustments
  setStickerOffset: (pageIndex: number, stickerIndex: number, x: number, y: number) => void;
  nudgeSelectedSticker: (dx: number, dy: number) => void;
  resetSelectedStickerOffset: () => void;
  setGlobalOffset: (x: number, y: number) => void;
  nudgeGlobalOffset: (dx: number, dy: number) => void;
  resetAllPositions: () => void;

  // Manual assignments & Swap
  setSwapCandidate: (candidate: { fromIndex: number; toIndex: number; fromNum: string; toNum: string } | null) => void;
  executeSwap: () => void;
  executeSequenceShift: () => void;
  clearSelectedAssignment: () => void;
  resetManualAssignments: (pageIndex?: number) => void;

  // Calibration
  setCalibration: (cal: Partial<PrinterCalibration>) => void;

  // UI State toggles
  setStepSize: (size: StepSize) => void;
  setZoomScale: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;
  setShowIndexBadges: (show: boolean) => void;
  setShowDimensionGuides: (show: boolean) => void;
  toggleShowDimensionGuides: () => void;
  setActiveDimensionHighlight: (field: DimensionHighlightKey | null) => void;
  setMeasurementUnit: (unit: MeasurementUnit) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;

  // Modals
  setPrintPreviewOpen: (open: boolean) => void;
  setCalibrationModalOpen: (open: boolean) => void;
  setTemplatesModalOpen: (open: boolean) => void;
  setRecentJobsModalOpen: (open: boolean) => void;
  setHelpModalOpen: (open: boolean) => void;
  setExcelImportModalOpen: (open: boolean) => void;

  // Job persistence
  saveJob: (name?: string) => void;
  loadJob: (job: PrintJob) => void;
  removeJob: (jobId: string) => void;
  createNewJob: () => void;
}

const initialSettings = loadSettings();
const initialCalibration = loadCalibration();
const initialTemplates = loadSavedTemplates();
const initialJobs = loadRecentJobs();
const initialDefaultTemplateId = initialSettings.defaultTemplateId || DEFAULT_TEMPLATE.id;
const pinnedDefault = loadPinnedDefaultTemplate();
const initialDefaultTemplate =
  pinnedDefault ||
  initialTemplates.find((t) => t.id === initialDefaultTemplateId) ||
  DEFAULT_TEMPLATE;
const initialSheetState = loadCurrentSheetState();

// Initial sample employee numbers for demo
const INITIAL_DEMO_NUMBERS = [
  '001001',
  '001002',
  '001003',
  '001004',
  '001005',
  '001006',
  '001007',
  '001008',
  '001009',
  '001010',
  '001011',
  '001012',
  '001013',
  '001014',
  '001015',
  '001016',
  '001017',
  '001018',
  '001019',
  '001020',
];

export const usePrintStore = create<PrintStoreState>((set, get) => ({
  currentJobId: `job_${Date.now()}`,
  currentJobName: 'طباعة أرقام الموظفين',
  template: initialDefaultTemplate,
  employeeNumbers: INITIAL_DEMO_NUMBERS,
  rawInputText: INITIAL_DEMO_NUMBERS.join('\n'),
  startPosition: initialSheetState?.startPosition || 1,
  currentPageIndex: 0,
  selectedStickerIndex: null,
  usedStickersByPage: initialSheetState?.usedStickersByPage || { 0: [] },
  individualOffsetsByPage: {},
  manualAssignmentsByPage: {},
  calibration: initialCalibration,

  stepSize: 0.1,
  zoomScale: initialSettings.zoomScale || 1.0,
  showGrid: initialSettings.showGrid !== false,
  showRulers: initialSettings.showRulers !== false,
  showIndexBadges: initialSettings.showIndexBadges !== false,
  showDimensionGuides: false,
  activeDimensionHighlight: null,
  measurementUnit: initialSettings.measurementUnit || 'mm',
  language: initialSettings.language || 'ar',
  theme: initialSettings.theme || 'light',
  toastMessage: null,

  past: [],
  future: [],

  defaultTemplateId: pinnedDefault?.id || initialDefaultTemplateId,
  savedTemplates: initialTemplates,
  recentJobs: initialJobs,

  isPrintPreviewOpen: false,
  isCalibrationModalOpen: false,
  isTemplatesModalOpen: false,
  isRecentJobsModalOpen: false,
  isHelpModalOpen: false,
  isExcelImportModalOpen: false,
  isPostPrintModalOpen: false,
  postPrintSummary: null,
  swapCandidate: null,

  setToastMessage: (msg) => {
    set({ toastMessage: msg });
    if (msg) {
      setTimeout(() => {
        if (get().toastMessage === msg) {
          set({ toastMessage: null });
        }
      }, 4000);
    }
  },

  getAssignmentResult: () => {
    const s = get();
    return computeAssignments(
      s.template,
      s.employeeNumbers,
      s.startPosition,
      s.usedStickersByPage,
      s.individualOffsetsByPage,
      s.manualAssignmentsByPage
    );
  },

  getActivePageLayout: () => {
    const result = get().getAssignmentResult();
    const activeIdx = get().currentPageIndex;
    return result.pages[activeIdx] || result.pages[0] || null;
  },

  pushHistory: () => {
    const s = get();
    const snapshot: HistorySnapshot = {
      template: JSON.parse(JSON.stringify(s.template)),
      employeeNumbers: [...s.employeeNumbers],
      startPosition: s.startPosition,
      usedStickersByPage: JSON.parse(JSON.stringify(s.usedStickersByPage)),
      individualOffsetsByPage: JSON.parse(JSON.stringify(s.individualOffsetsByPage)),
      manualAssignmentsByPage: JSON.parse(JSON.stringify(s.manualAssignmentsByPage)),
      calibration: { ...s.calibration },
    };

    set((state) => ({
      past: [...state.past.slice(-25), snapshot],
      future: [],
    }));
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const s = get();
    if (s.past.length === 0) return;

    const previous = s.past[s.past.length - 1];
    const newPast = s.past.slice(0, s.past.length - 1);

    const currentSnapshot: HistorySnapshot = {
      template: JSON.parse(JSON.stringify(s.template)),
      employeeNumbers: [...s.employeeNumbers],
      startPosition: s.startPosition,
      usedStickersByPage: JSON.parse(JSON.stringify(s.usedStickersByPage)),
      individualOffsetsByPage: JSON.parse(JSON.stringify(s.individualOffsetsByPage)),
      manualAssignmentsByPage: JSON.parse(JSON.stringify(s.manualAssignmentsByPage)),
      calibration: { ...s.calibration },
    };

    set({
      past: newPast,
      future: [currentSnapshot, ...s.future.slice(0, 25)],
      template: previous.template,
      employeeNumbers: previous.employeeNumbers,
      rawInputText: previous.employeeNumbers.join('\n'),
      startPosition: previous.startPosition,
      usedStickersByPage: previous.usedStickersByPage,
      individualOffsetsByPage: previous.individualOffsetsByPage,
      manualAssignmentsByPage: previous.manualAssignmentsByPage,
      calibration: previous.calibration,
    });
  },

  redo: () => {
    const s = get();
    if (s.future.length === 0) return;

    const next = s.future[0];
    const newFuture = s.future.slice(1);

    const currentSnapshot: HistorySnapshot = {
      template: JSON.parse(JSON.stringify(s.template)),
      employeeNumbers: [...s.employeeNumbers],
      startPosition: s.startPosition,
      usedStickersByPage: JSON.parse(JSON.stringify(s.usedStickersByPage)),
      individualOffsetsByPage: JSON.parse(JSON.stringify(s.individualOffsetsByPage)),
      manualAssignmentsByPage: JSON.parse(JSON.stringify(s.manualAssignmentsByPage)),
      calibration: { ...s.calibration },
    };

    set({
      past: [...s.past, currentSnapshot],
      future: newFuture,
      template: next.template,
      employeeNumbers: next.employeeNumbers,
      rawInputText: next.employeeNumbers.join('\n'),
      startPosition: next.startPosition,
      usedStickersByPage: next.usedStickersByPage,
      individualOffsetsByPage: next.individualOffsetsByPage,
      manualAssignmentsByPage: next.manualAssignmentsByPage,
      calibration: next.calibration,
    });
  },

  setTemplate: (template) => {
    get().pushHistory();
    set({ template: { ...template } });
  },

  setDefaultTemplate: (templateId) => {
    saveSettings({ defaultTemplateId: templateId });
    const s = get();
    const found = s.savedTemplates.find((t) => t.id === templateId) || s.template;
    savePinnedDefaultTemplate(found);
    set({
      defaultTemplateId: templateId,
      template: found,
    });
    get().setToastMessage(
      s.language === 'ar'
        ? `تم تعيين وتثبيت "${found.name}" كقالب افتراضي`
        : `Pinned "${found.nameEn || found.name}" as default template`
    );
  },

  pinCurrentTemplateAsDefault: () => {
    const s = get();
    savePinnedDefaultTemplate(s.template);
    saveSettings({ defaultTemplateId: s.template.id });
    let updatedTemplates = s.savedTemplates;
    if (!s.template.isPreset) {
      updatedTemplates = saveCustomTemplate(s.template);
    }
    set({
      defaultTemplateId: s.template.id,
      savedTemplates: updatedTemplates,
    });
    get().setToastMessage(
      s.language === 'ar'
        ? '⭐ تم تثبيت القالب والتنسيق كقالب افتراضي دائم'
        : '⭐ Pinned template & styling as default!'
    );
  },

  updateTemplateField: (key, value) => {
    get().pushHistory();
    set((state) => {
      const updatedTemplate = {
        ...state.template,
        [key]: value,
      };
      // If active template is the default, update pinned default in storage
      if (updatedTemplate.id === state.defaultTemplateId) {
        savePinnedDefaultTemplate(updatedTemplate);
      }
      return {
        template: updatedTemplate,
      };
    });
  },

  saveCurrentTemplate: (name, setAsDefault = false) => {
    const s = get();
    const newTpl: StickerTemplate = {
      ...s.template,
      id: `tpl_${Date.now()}`,
      name: name || s.template.name || 'قالب مخصص',
      nameEn: name || s.template.nameEn || 'Custom Template',
      isPreset: false,
    };
    const updated = saveCustomTemplate(newTpl);
    if (setAsDefault) {
      saveSettings({ defaultTemplateId: newTpl.id });
      savePinnedDefaultTemplate(newTpl);
    }
    set({
      savedTemplates: updated,
      template: newTpl,
      ...(setAsDefault ? { defaultTemplateId: newTpl.id } : {}),
    });
    get().setToastMessage(
      s.language === 'ar'
        ? `تم حفظ القالب "${newTpl.name}" بنجاح`
        : `Saved template "${newTpl.nameEn || newTpl.name}" successfully`
    );
  },

  updateCurrentTemplateInPlace: () => {
    const s = get();
    if (!s.template.isPreset) {
      const updated = saveCustomTemplate(s.template);
      set({ savedTemplates: updated });
    }
    if (s.template.id === s.defaultTemplateId) {
      savePinnedDefaultTemplate(s.template);
    }
    get().setToastMessage(
      s.language === 'ar'
        ? 'تم حفظ جميع التعديلات والتنسيقات على القالب'
        : 'Saved all modifications & styles to template'
    );
  },

  removeCustomTemplate: (templateId) => {
    const updated = deleteCustomTemplate(templateId);
    set({ savedTemplates: updated });
  },

  setEmployeeNumbers: (numbers) => {
    get().pushHistory();
    set({
      employeeNumbers: numbers,
      rawInputText: numbers.join('\n'),
    });
  },

  setRawInputText: (text) => {
    const normalized = normalizeEmployeeInput(text);
    get().pushHistory();
    set({
      rawInputText: text,
      employeeNumbers: normalized,
    });
  },

  removeDuplicateNumbers: () => {
    const s = get();
    const seen = new Set<string>();
    const deduplicated: string[] = [];
    s.employeeNumbers.forEach((num) => {
      if (num && !seen.has(num)) {
        seen.add(num);
        deduplicated.push(num);
      }
    });
    get().pushHistory();
    set({
      employeeNumbers: deduplicated,
      rawInputText: deduplicated.join('\n'),
    });
  },

  clearEmployeeData: () => {
    get().pushHistory();
    set({
      employeeNumbers: [],
      rawInputText: '',
      manualAssignmentsByPage: {},
    });
  },

  setStartPosition: (pos) => {
    get().pushHistory();
    const clamped = Math.max(1, pos);
    const s = get();
    saveCurrentSheetState({
      templateId: s.template.id,
      startPosition: clamped,
      usedStickersByPage: s.usedStickersByPage,
      lastUpdated: new Date().toISOString(),
    });
    set({ startPosition: clamped });
  },

  setCurrentPageIndex: (idx) => {
    set({ currentPageIndex: Math.max(0, idx), selectedStickerIndex: null });
  },

  setSelectedStickerIndex: (idx) => {
    set({ selectedStickerIndex: idx });
  },

  toggleStickerUsed: (pageIndex, stickerIndex) => {
    get().pushHistory();
    set((state) => {
      const pageUsed = state.usedStickersByPage[pageIndex] || [];
      const isCurrentlyUsed = pageUsed.includes(stickerIndex);
      const updatedPageUsed = isCurrentlyUsed
        ? pageUsed.filter((i) => i !== stickerIndex)
        : [...pageUsed, stickerIndex];

      const updatedAllPages = {
        ...state.usedStickersByPage,
        [pageIndex]: updatedPageUsed,
      };

      saveCurrentSheetState({
        templateId: state.template.id,
        startPosition: state.startPosition,
        usedStickersByPage: updatedAllPages,
        lastUpdated: new Date().toISOString(),
      });

      return {
        usedStickersByPage: updatedAllPages,
      };
    });
  },

  markRowUsed: (pageIndex, rowIndex) => {
    const s = get();
    const geo = calculateGeometry(s.template);
    if (!geo.isValid) return;

    const rowStickerIndices: number[] = [];
    for (let c = 0; c < geo.columns; c++) {
      rowStickerIndices.push(rowIndex * geo.columns + c);
    }

    get().pushHistory();
    set((state) => {
      const pageUsed = new Set(state.usedStickersByPage[pageIndex] || []);
      rowStickerIndices.forEach((idx) => pageUsed.add(idx));

      const updatedAll = {
        ...state.usedStickersByPage,
        [pageIndex]: Array.from(pageUsed),
      };

      saveCurrentSheetState({
        templateId: state.template.id,
        startPosition: state.startPosition,
        usedStickersByPage: updatedAll,
        lastUpdated: new Date().toISOString(),
      });

      return {
        usedStickersByPage: updatedAll,
      };
    });
  },

  markColUsed: (pageIndex, colIndex) => {
    const s = get();
    const geo = calculateGeometry(s.template);
    if (!geo.isValid) return;

    const colStickerIndices: number[] = [];
    for (let r = 0; r < geo.rows; r++) {
      colStickerIndices.push(r * geo.columns + colIndex);
    }

    get().pushHistory();
    set((state) => {
      const pageUsed = new Set(state.usedStickersByPage[pageIndex] || []);
      colStickerIndices.forEach((idx) => pageUsed.add(idx));

      const updatedAll = {
        ...state.usedStickersByPage,
        [pageIndex]: Array.from(pageUsed),
      };

      saveCurrentSheetState({
        templateId: state.template.id,
        startPosition: state.startPosition,
        usedStickersByPage: updatedAll,
        lastUpdated: new Date().toISOString(),
      });

      return {
        usedStickersByPage: updatedAll,
      };
    });
  },

  markAllUsed: (pageIndex) => {
    const s = get();
    const geo = calculateGeometry(s.template);
    if (!geo.isValid) return;

    const allIndices: number[] = [];
    for (let i = 0; i < geo.totalStickers; i++) {
      allIndices.push(i);
    }

    get().pushHistory();
    set((state) => {
      const updatedAll = {
        ...state.usedStickersByPage,
        [pageIndex]: allIndices,
      };

      saveCurrentSheetState({
        templateId: state.template.id,
        startPosition: state.startPosition,
        usedStickersByPage: updatedAll,
        lastUpdated: new Date().toISOString(),
      });

      return {
        usedStickersByPage: updatedAll,
      };
    });
  },

  clearAllUsed: (pageIndex) => {
    get().pushHistory();
    set((state) => {
      const updatedAll = {
        ...state.usedStickersByPage,
        [pageIndex]: [],
      };

      saveCurrentSheetState({
        templateId: state.template.id,
        startPosition: state.startPosition,
        usedStickersByPage: updatedAll,
        lastUpdated: new Date().toISOString(),
      });

      return {
        usedStickersByPage: updatedAll,
      };
    });
  },

  clearAllUsedAllPages: (resetStartPos = true) => {
    get().pushHistory();
    const newUsed = { 0: [] };
    const newStartPos = resetStartPos ? 1 : get().startPosition;

    saveCurrentSheetState({
      templateId: get().template.id,
      startPosition: newStartPos,
      usedStickersByPage: newUsed,
      lastUpdated: new Date().toISOString(),
    });

    set({
      usedStickersByPage: newUsed,
      ...(resetStartPos ? { startPosition: 1 } : {}),
    });
  },

  startFreshBlankSheet: () => {
    get().pushHistory();
    clearCurrentSheetState();
    set({
      usedStickersByPage: { 0: [] },
      startPosition: 1,
      manualAssignmentsByPage: {},
      isPostPrintModalOpen: false,
      postPrintSummary: null,
    });
    get().setToastMessage(
      get().language === 'ar'
        ? '✨ تم تصفير الورقة وجاهزة كورقة A4 جديدة بالكامل'
        : '✨ Fresh blank sheet ready!'
    );
  },

  triggerPostPrintWorkflow: () => {
    const assignment = get().getAssignmentResult();
    const printedStickersByPage: Record<number, number[]> = {};
    let totalPrinted = 0;

    assignment.pages.forEach((page) => {
      const assignedIndices: number[] = [];
      page.stickers.forEach((st) => {
        if (st.status === 'assigned' && st.employeeNumber && st.employeeNumber.trim().length > 0) {
          assignedIndices.push(st.index);
          totalPrinted++;
        }
      });
      if (assignedIndices.length > 0) {
        printedStickersByPage[page.pageIndex] = assignedIndices;
      }
    });

    if (totalPrinted === 0) {
      return;
    }

    set({
      isPostPrintModalOpen: true,
      postPrintSummary: {
        printedCount: totalPrinted,
        pagesCount: assignment.pages.length,
        printedStickersByPage,
      },
    });
  },

  confirmMarkPrintedAsUsed: (clearPrintedEmployees = true) => {
    const s = get();
    const summary = s.postPrintSummary;
    if (!summary) {
      set({ isPostPrintModalOpen: false });
      return;
    }

    get().pushHistory();

    // Merge printed indices into usedStickersByPage
    const updatedUsedByPage: Record<number, number[]> = { ...s.usedStickersByPage };
    Object.entries(summary.printedStickersByPage).forEach(([pageStr, indices]) => {
      const pageIdx = Number(pageStr);
      const existing = new Set(updatedUsedByPage[pageIdx] || []);
      indices.forEach((idx) => existing.add(idx));
      updatedUsedByPage[pageIdx] = Array.from(existing);
    });

    // If user wants to clear printed numbers (so they can paste next batch directly):
    let updatedEmployeeNumbers = s.employeeNumbers;
    let updatedRawText = s.rawInputText;
    if (clearPrintedEmployees) {
      const assignment = get().getAssignmentResult();
      const printedNumSet = new Set<string>();
      assignment.pages.forEach((p) => {
        p.stickers.forEach((st) => {
          if (st.status === 'assigned' && st.employeeNumber) {
            printedNumSet.add(st.employeeNumber);
          }
        });
      });
      updatedEmployeeNumbers = s.employeeNumbers.filter((num) => !printedNumSet.has(num));
      updatedRawText = updatedEmployeeNumbers.join('\n');
    }

    // Find next first available free slot on page 0
    const geo = calculateGeometry(s.template);
    const page0Used = new Set(updatedUsedByPage[0] || []);
    let nextFirstFree = 1;
    for (let i = 0; i < geo.totalStickers; i++) {
      if (!page0Used.has(i)) {
        nextFirstFree = i + 1;
        break;
      }
    }

    saveCurrentSheetState({
      templateId: s.template.id,
      startPosition: nextFirstFree,
      usedStickersByPage: updatedUsedByPage,
      lastUpdated: new Date().toISOString(),
    });

    set({
      usedStickersByPage: updatedUsedByPage,
      startPosition: nextFirstFree,
      employeeNumbers: updatedEmployeeNumbers,
      rawInputText: updatedRawText,
      manualAssignmentsByPage: {},
      isPostPrintModalOpen: false,
      postPrintSummary: null,
    });

    get().setToastMessage(
      s.language === 'ar'
        ? `✅ تم تعليم ${summary.printedCount} استيكر كمستعمل وحفظ الورقة! الاستيكرات الفارغة جاهزة للطباعة القادمة.`
        : `✅ Marked ${summary.printedCount} stickers as used & saved sheet for next batch.`
    );
  },

  setPostPrintModalOpen: (open) => set({ isPostPrintModalOpen: open }),

  setStickerOffset: (pageIndex, stickerIndex, x, y) => {
    set((state) => {
      const pageOffsets = state.individualOffsetsByPage[pageIndex] || {};
      return {
        individualOffsetsByPage: {
          ...state.individualOffsetsByPage,
          [pageIndex]: {
            ...pageOffsets,
            [stickerIndex]: {
              x: Number(x.toFixed(2)),
              y: Number(y.toFixed(2)),
            },
          },
        },
      };
    });
  },

  nudgeSelectedSticker: (dx, dy) => {
    const s = get();
    if (s.selectedStickerIndex === null) return;
    const p = s.currentPageIndex;
    const idx = s.selectedStickerIndex;
    const curOffset = s.individualOffsetsByPage[p]?.[idx] || { x: 0, y: 0 };

    get().pushHistory();
    get().setStickerOffset(p, idx, curOffset.x + dx, curOffset.y + dy);
  },

  resetSelectedStickerOffset: () => {
    const s = get();
    if (s.selectedStickerIndex === null) return;
    const p = s.currentPageIndex;
    const idx = s.selectedStickerIndex;

    get().pushHistory();
    set((state) => {
      const pageOffsets = { ...(state.individualOffsetsByPage[p] || {}) };
      delete pageOffsets[idx];
      return {
        individualOffsetsByPage: {
          ...state.individualOffsetsByPage,
          [p]: pageOffsets,
        },
      };
    });
  },

  setGlobalOffset: (x, y) => {
    get().pushHistory();
    set((state) => ({
      template: {
        ...state.template,
        globalOffsetX: Number(x.toFixed(2)),
        globalOffsetY: Number(y.toFixed(2)),
      },
    }));
  },

  nudgeGlobalOffset: (dx, dy) => {
    const s = get();
    get().pushHistory();
    set((state) => ({
      template: {
        ...state.template,
        globalOffsetX: Number((state.template.globalOffsetX + dx).toFixed(2)),
        globalOffsetY: Number((state.template.globalOffsetY + dy).toFixed(2)),
      },
    }));
  },

  resetAllPositions: () => {
    get().pushHistory();
    set((state) => ({
      template: {
        ...state.template,
        globalOffsetX: 0,
        globalOffsetY: 0,
      },
      individualOffsetsByPage: {},
    }));
  },

  setSwapCandidate: (candidate) => {
    set({ swapCandidate: candidate });
  },

  executeSwap: () => {
    const s = get();
    if (!s.swapCandidate) return;

    const { fromIndex, toIndex, fromNum, toNum } = s.swapCandidate;
    const p = s.currentPageIndex;

    get().pushHistory();
    set((state) => {
      const pageManuals = { ...(state.manualAssignmentsByPage[p] || {}) };
      // Target gets the dragged number
      pageManuals[toIndex] = fromNum;
      // Source gets the target's number if exists, otherwise marked as __EMPTY__
      pageManuals[fromIndex] = toNum && toNum.trim().length > 0 ? toNum : '__EMPTY__';

      return {
        manualAssignmentsByPage: {
          ...state.manualAssignmentsByPage,
          [p]: pageManuals,
        },
        swapCandidate: null,
        selectedStickerIndex: toIndex,
      };
    });
  },

  executeSequenceShift: () => {
    const s = get();
    if (!s.swapCandidate) return;

    const { fromIndex, toIndex, fromNum } = s.swapCandidate;
    const p = s.currentPageIndex;

    get().pushHistory();

    const validNumbers = s.employeeNumbers.filter((n) => n && n.trim().length > 0);
    const numIdx = validNumbers.findIndex((n) => n === fromNum);

    // If on Page 0 and it's the very first number or we're shifting the entire starting offset
    if (p === 0 && (numIdx === 0 || numIdx === -1)) {
      set((state) => {
        const manuals = { ...state.manualAssignmentsByPage };
        delete manuals[0];
        return {
          startPosition: toIndex + 1,
          manualAssignmentsByPage: manuals,
          swapCandidate: null,
          selectedStickerIndex: toIndex,
        };
      });
      return;
    }

    // General Sequence Shift:
    set((state) => {
      const pageManuals = { ...(state.manualAssignmentsByPage[p] || {}) };
      const usedSet = new Set(state.usedStickersByPage[p] || []);
      const geo = calculateGeometry(state.template);
      const totalStickers = geo.totalStickers;

      const remainingNumbers = numIdx >= 0 ? validNumbers.slice(numIdx) : [fromNum];

      // Free previous slots from fromIndex up to toIndex if shifted forward
      if (toIndex > fromIndex) {
        for (let i = fromIndex; i < toIndex; i++) {
          if (!usedSet.has(i)) {
            pageManuals[i] = '__EMPTY__';
          }
        }
      } else {
        // Shifted backward: clear manual overrides in between
        for (let i = toIndex; i <= fromIndex; i++) {
          if (!usedSet.has(i)) {
            delete pageManuals[i];
          }
        }
      }

      let numCursor = 0;
      for (let i = toIndex; i < totalStickers && numCursor < remainingNumbers.length; i++) {
        if (!usedSet.has(i)) {
          pageManuals[i] = remainingNumbers[numCursor];
          numCursor++;
        }
      }

      return {
        manualAssignmentsByPage: {
          ...state.manualAssignmentsByPage,
          [p]: pageManuals,
        },
        swapCandidate: null,
        selectedStickerIndex: toIndex,
      };
    });
  },

  clearSelectedAssignment: () => {
    const s = get();
    if (s.selectedStickerIndex === null) return;
    const p = s.currentPageIndex;
    const idx = s.selectedStickerIndex;

    get().pushHistory();
    set((state) => {
      const pageManuals = { ...(state.manualAssignmentsByPage[p] || {}) };
      delete pageManuals[idx];
      return {
        manualAssignmentsByPage: {
          ...state.manualAssignmentsByPage,
          [p]: pageManuals,
        },
      };
    });
  },

  resetManualAssignments: (pageIndex) => {
    get().pushHistory();
    if (pageIndex !== undefined) {
      set((state) => {
        const manuals = { ...state.manualAssignmentsByPage };
        delete manuals[pageIndex];
        return { manualAssignmentsByPage: manuals };
      });
    } else {
      set({ manualAssignmentsByPage: {} });
    }
  },

  setCalibration: (cal) => {
    set((state) => {
      const updated = { ...state.calibration, ...cal };
      saveCalibration(updated);
      return { calibration: updated };
    });
  },

  setStepSize: (size) => set({ stepSize: size }),
  setZoomScale: (zoom) => {
    const clamped = Math.max(0.3, Math.min(2.5, Number(zoom.toFixed(2))));
    saveSettings({ zoomScale: clamped });
    set({ zoomScale: clamped });
  },
  setShowGrid: (show) => {
    saveSettings({ showGrid: show });
    set({ showGrid: show });
  },
  setShowRulers: (show) => {
    saveSettings({ showRulers: show });
    set({ showRulers: show });
  },
  setShowIndexBadges: (show) => {
    saveSettings({ showIndexBadges: show });
    set({ showIndexBadges: show });
  },
  setShowDimensionGuides: (show) => {
    set({ showDimensionGuides: show });
  },
  toggleShowDimensionGuides: () => {
    set((state) => ({ showDimensionGuides: !state.showDimensionGuides }));
  },
  setActiveDimensionHighlight: (field) => {
    set({ activeDimensionHighlight: field });
  },
  setMeasurementUnit: (unit) => {
    saveSettings({ measurementUnit: unit });
    set({ measurementUnit: unit });
  },
  setLanguage: (lang) => {
    saveSettings({ language: lang });
    set({ language: lang });
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  },
  setTheme: (theme) => {
    saveSettings({ theme });
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setPrintPreviewOpen: (open) => set({ isPrintPreviewOpen: open }),
  setCalibrationModalOpen: (open) => set({ isCalibrationModalOpen: open }),
  setTemplatesModalOpen: (open) => set({ isTemplatesModalOpen: open }),
  setRecentJobsModalOpen: (open) => set({ isRecentJobsModalOpen: open }),
  setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),
  setExcelImportModalOpen: (open) => set({ isExcelImportModalOpen: open }),

  saveJob: (name) => {
    const s = get();
    const job: PrintJob = {
      id: s.currentJobId,
      name: name || s.currentJobName || 'عملية طباعة',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: s.template,
      employeeNumbers: s.employeeNumbers,
      startPosition: s.startPosition,
      usedStickersByPage: s.usedStickersByPage,
      individualOffsetsByPage: s.individualOffsetsByPage,
      manualAssignmentsByPage: s.manualAssignmentsByPage,
      calibration: s.calibration,
    };
    const updated = savePrintJob(job);
    set({ recentJobs: updated, currentJobName: job.name });
  },

  loadJob: (job) => {
    set({
      currentJobId: job.id,
      currentJobName: job.name,
      template: job.template,
      employeeNumbers: job.employeeNumbers,
      rawInputText: job.employeeNumbers.join('\n'),
      startPosition: job.startPosition || 1,
      currentPageIndex: 0,
      selectedStickerIndex: null,
      usedStickersByPage: job.usedStickersByPage || {},
      individualOffsetsByPage: job.individualOffsetsByPage || {},
      manualAssignmentsByPage: job.manualAssignmentsByPage || {},
      calibration: job.calibration || initialCalibration,
      past: [],
      future: [],
    });
  },

  removeJob: (jobId) => {
    const updated = deletePrintJob(jobId);
    set({ recentJobs: updated });
  },

  createNewJob: () => {
    const s = get();
    const defaultTpl =
      loadPinnedDefaultTemplate() ||
      s.savedTemplates.find((t) => t.id === s.defaultTemplateId) ||
      DEFAULT_TEMPLATE;

    set({
      currentJobId: `job_${Date.now()}`,
      currentJobName: s.language === 'ar' ? 'عملية طباعة جديدة' : 'New Print Job',
      template: { ...defaultTpl },
      employeeNumbers: [],
      rawInputText: '',
      startPosition: 1,
      currentPageIndex: 0,
      selectedStickerIndex: null,
      usedStickersByPage: {},
      individualOffsetsByPage: {},
      manualAssignmentsByPage: {},
      past: [],
      future: [],
    });
  },
}));
