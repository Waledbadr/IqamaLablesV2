import { Language, MeasurementUnit, PrinterCalibration, PrintJob, StickerTemplate, ThemeMode } from '../types';
import { DEFAULT_TEMPLATE, PRESET_TEMPLATES } from './templates';

const STORAGE_KEYS = {
  TEMPLATES: 'stickerprint_templates_v1',
  RECENT_JOBS: 'stickerprint_recent_jobs_v1',
  ACTIVE_JOB: 'stickerprint_active_job_v1',
  CALIBRATION: 'stickerprint_calibration_v1',
  SETTINGS: 'stickerprint_settings_v1',
  PINNED_DEFAULT_TEMPLATE: 'stickerprint_pinned_default_tpl_v2',
  CURRENT_SHEET_STATE: 'stickerprint_current_sheet_state_v2',
};

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  showGrid: boolean;
  showRulers: boolean;
  showIndexBadges: boolean;
  measurementUnit: MeasurementUnit;
  zoomScale: number;
  defaultTemplateId: string;
}

export interface PhysicalSheetState {
  templateId?: string;
  startPosition: number;
  usedStickersByPage: Record<number, number[]>;
  lastUpdated: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  theme: 'light',
  showGrid: true,
  showRulers: true,
  showIndexBadges: true,
  measurementUnit: 'mm',
  zoomScale: 1.0,
  defaultTemplateId: DEFAULT_TEMPLATE.id,
};

export function savePinnedDefaultTemplate(template: StickerTemplate) {
  try {
    localStorage.setItem(STORAGE_KEYS.PINNED_DEFAULT_TEMPLATE, JSON.stringify(template));
  } catch (e) {
    console.error('Failed to save pinned default template', e);
  }
}

export function loadPinnedDefaultTemplate(): StickerTemplate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PINNED_DEFAULT_TEMPLATE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load pinned default template', e);
  }
  return null;
}

export function saveCurrentSheetState(sheetState: PhysicalSheetState) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHEET_STATE, JSON.stringify(sheetState));
  } catch (e) {
    console.error('Failed to save sheet state', e);
  }
}

export function loadCurrentSheetState(): PhysicalSheetState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SHEET_STATE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load sheet state', e);
  }
  return null;
}

export function clearCurrentSheetState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SHEET_STATE);
  } catch (e) {
    console.error('Failed to clear sheet state', e);
  }
}

const DEFAULT_CALIBRATION: PrinterCalibration = {
  scaleX: 1.0,
  scaleY: 1.0,
  offsetX: 0,
  offsetY: 0,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<AppSettings>) {
  try {
    const current = loadSettings();
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadCalibration(): PrinterCalibration {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CALIBRATION);
    if (raw) {
      return { ...DEFAULT_CALIBRATION, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load calibration', e);
  }
  return DEFAULT_CALIBRATION;
}

export function saveCalibration(cal: PrinterCalibration) {
  try {
    localStorage.setItem(STORAGE_KEYS.CALIBRATION, JSON.stringify(cal));
  } catch (e) {
    console.error('Failed to save calibration', e);
  }
}

export function loadSavedTemplates(): StickerTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (raw) {
      const parsed: StickerTemplate[] = JSON.parse(raw);
      const presetIds = new Set(PRESET_TEMPLATES.map((p) => p.id));
      // Only keep custom templates whose IDs do not collide with preset IDs
      const customOnes = parsed.filter((t) => t && t.id && !t.isPreset && !presetIds.has(t.id));
      
      const seenIds = new Set(presetIds);
      const uniqueCustom: StickerTemplate[] = [];
      for (const t of customOnes) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          uniqueCustom.push(t);
        }
      }
      return [...PRESET_TEMPLATES, ...uniqueCustom];
    }
  } catch (e) {
    console.error('Failed to load templates', e);
  }
  return PRESET_TEMPLATES;
}

export function saveCustomTemplate(template: StickerTemplate) {
  try {
    const all = loadSavedTemplates();
    const presetIds = new Set(PRESET_TEMPLATES.map((p) => p.id));
    
    // Ensure custom template has its own unique ID and is marked as not preset
    let targetId = template.id;
    if (!targetId || presetIds.has(targetId)) {
      targetId = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }

    const templateToSave: StickerTemplate = {
      ...template,
      id: targetId,
      isPreset: false,
    };

    const customOnly = all.filter((t) => !t.isPreset && t.id !== targetId);
    customOnly.push(templateToSave);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(customOnly));
    return [...PRESET_TEMPLATES, ...customOnly];
  } catch (e) {
    console.error('Failed to save custom template', e);
    return PRESET_TEMPLATES;
  }
}

export function deleteCustomTemplate(templateId: string): StickerTemplate[] {
  try {
    const all = loadSavedTemplates();
    const updated = all.filter((t) => t.id !== templateId || t.isPreset);
    const customOnly = updated.filter((t) => !t.isPreset);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(customOnly));
    return updated;
  } catch (e) {
    console.error('Failed to delete template', e);
    return PRESET_TEMPLATES;
  }
}

export function loadRecentJobs(): PrintJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_JOBS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load recent jobs', e);
  }
  return [];
}

export function savePrintJob(job: PrintJob) {
  try {
    const jobs = loadRecentJobs();
    const existingIdx = jobs.findIndex((j) => j.id === job.id);
    let updated: PrintJob[];

    const now = new Date().toISOString();
    const jobToSave: PrintJob = {
      ...job,
      updatedAt: now,
      createdAt: job.createdAt || now,
    };

    if (existingIdx >= 0) {
      updated = [...jobs];
      updated[existingIdx] = jobToSave;
    } else {
      updated = [jobToSave, ...jobs.slice(0, 19)]; // Keep latest 20
    }

    localStorage.setItem(STORAGE_KEYS.RECENT_JOBS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save print job', e);
    return [];
  }
}

export function deletePrintJob(jobId: string): PrintJob[] {
  try {
    const jobs = loadRecentJobs();
    const updated = jobs.filter((j) => j.id !== jobId);
    localStorage.setItem(STORAGE_KEYS.RECENT_JOBS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete print job', e);
    return [];
  }
}

export function exportProjectToJson(job: PrintJob): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(job, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const safeName = (job.name || 'sticker_print_job').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  downloadAnchor.setAttribute('download', `${safeName}.stickerprint.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseProjectJson(jsonText: string): PrintJob {
  const parsed = JSON.parse(jsonText);
  if (!parsed.template || !Array.isArray(parsed.employeeNumbers)) {
    throw new Error('ملف المشروع غير صالح أو لا يحتوي على بنية استيكرات صحيحة.');
  }
  return {
    id: parsed.id || `job_${Date.now()}`,
    name: parsed.name || 'مشروع مستورد',
    createdAt: parsed.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    template: parsed.template,
    employeeNumbers: parsed.employeeNumbers.map(String),
    startPosition: parsed.startPosition || 1,
    usedStickersByPage: parsed.usedStickersByPage || {},
    individualOffsetsByPage: parsed.individualOffsetsByPage || {},
    manualAssignmentsByPage: parsed.manualAssignmentsByPage || {},
    calibration: parsed.calibration || DEFAULT_CALIBRATION,
  };
}
