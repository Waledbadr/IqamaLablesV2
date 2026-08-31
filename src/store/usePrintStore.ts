import { create } from 'zustand';
import {
  Language,
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
  language: Language;
  theme: ThemeMode;

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Persistence collections
  savedTemplates: StickerTemplate[];
  recentJobs: PrintJob[];

  // UI Modals
  isPrintPreviewOpen: boolean;
  isCalibrationModalOpen: boolean;
  isTemplatesModalOpen: boolean;
  isRecentJobsModalOpen: boolean;
  isHelpModalOpen: boolean;
  isExcelImportModalOpen: boolean;
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

  // Template actions
  setTemplate: (template: StickerTemplate) => void;
  updateTemplateField: <K extends keyof StickerTemplate>(key: K, value: StickerTemplate[K]) => void;
  saveCurrentTemplate: (name: string) => void;
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

  // Used stickers management
  toggleStickerUsed: (pageIndex: number, stickerIndex: number) => void;
  markRowUsed: (pageIndex: number, rowIndex: number) => void;
  markColUsed: (pageIndex: number, colIndex: number) => void;
  markAllUsed: (pageIndex: number) => void;
  clearAllUsed: (pageIndex: number) => void;
  clearAllUsedAllPages: (resetStartPos?: boolean) => void;

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
  template: DEFAULT_TEMPLATE,
  employeeNumbers: INITIAL_DEMO_NUMBERS,
  rawInputText: INITIAL_DEMO_NUMBERS.join('\n'),
  startPosition: 1,
  currentPageIndex: 0,
  selectedStickerIndex: null,
  usedStickersByPage: { 0: [] },
  individualOffsetsByPage: {},
  manualAssignmentsByPage: {},
  calibration: initialCalibration,

  stepSize: 0.1,
  zoomScale: initialSettings.zoomScale || 1.0,
  showGrid: initialSettings.showGrid !== false,
  showRulers: initialSettings.showRulers !== false,
  showIndexBadges: initialSettings.showIndexBadges !== false,
  language: initialSettings.language || 'ar',
  theme: initialSettings.theme || 'light',

  past: [],
  future: [],

  savedTemplates: initialTemplates,
  recentJobs: initialJobs,

  isPrintPreviewOpen: false,
  isCalibrationModalOpen: false,
  isTemplatesModalOpen: false,
  isRecentJobsModalOpen: false,
  isHelpModalOpen: false,
  isExcelImportModalOpen: false,
  swapCandidate: null,

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

  updateTemplateField: (key, value) => {
    get().pushHistory();
    set((state) => ({
      template: {
        ...state.template,
        [key]: value,
      },
    }));
  },

  saveCurrentTemplate: (name) => {
    const s = get();
    const newTpl: StickerTemplate = {
      ...s.template,
      id: `tpl_${Date.now()}`,
      name: name || s.template.name || 'قالب مخصص',
      nameEn: name || s.template.nameEn || 'Custom Template',
      isPreset: false,
    };
    const updated = saveCustomTemplate(newTpl);
    set({ savedTemplates: updated, template: newTpl });
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
    set({ startPosition: Math.max(1, pos) });
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

      return {
        usedStickersByPage: {
          ...state.usedStickersByPage,
          [pageIndex]: updatedPageUsed,
        },
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

      return {
        usedStickersByPage: {
          ...state.usedStickersByPage,
          [pageIndex]: Array.from(pageUsed),
        },
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

      return {
        usedStickersByPage: {
          ...state.usedStickersByPage,
          [pageIndex]: Array.from(pageUsed),
        },
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
    set((state) => ({
      usedStickersByPage: {
        ...state.usedStickersByPage,
        [pageIndex]: allIndices,
      },
    }));
  },

  clearAllUsed: (pageIndex) => {
    get().pushHistory();
    set((state) => ({
      usedStickersByPage: {
        ...state.usedStickersByPage,
        [pageIndex]: [],
      },
    }));
  },

  clearAllUsedAllPages: (resetStartPos = true) => {
    get().pushHistory();
    set({
      usedStickersByPage: { 0: [] },
      ...(resetStartPos ? { startPosition: 1 } : {}),
    });
  },

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
    // Starting with fromNum, assign consecutive numbers to available slots starting from toIndex
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
    set({
      currentJobId: `job_${Date.now()}`,
      currentJobName: 'عملية طباعة جديدة',
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
