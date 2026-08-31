import * as XLSX from 'xlsx';
import { EmployeeDataValidation } from '../types';

export interface ExcelColumnOption {
  key: string;
  name: string;
  sampleValues: string[];
}

export interface ExcelParseResult {
  sheetName: string;
  columns: ExcelColumnOption[];
  selectedColumn: string;
  rows: Record<string, string>[];
  extractedNumbers: string[];
  totalRows: number;
}

/**
 * Parses an Excel or CSV file buffer into structured string columns and rows,
 * strictly preserving leading zeros.
 */
export async function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellText: true,
          raw: false, // Ensures values are read formatted as displayed strings (preserving leading zeros!)
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('الملف فارغ أو لا يحتوي على أوراق عمل.');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Parse sheet to array of arrays using raw: false to guarantee text strings
        const rawJson: string[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: '',
        });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('ورقة العمل فارغة.');
        }

        // Identify header row or construct column letters
        const firstRow = rawJson[0] || [];
        const hasTextHeader = firstRow.some((cell) => cell && isNaN(Number(cell)));
        const headerRow = hasTextHeader ? firstRow : [];
        const dataRows = hasTextHeader ? rawJson.slice(1) : rawJson;

        // Determine max columns
        let maxCols = 0;
        rawJson.forEach((row) => {
          if (row.length > maxCols) maxCols = row.length;
        });

        const columns: ExcelColumnOption[] = [];

        for (let colIdx = 0; colIdx < maxCols; colIdx++) {
          const colLetter = XLSX.utils.encode_col(colIdx);
          const colName = headerRow[colIdx]?.trim() || `العمود ${colLetter} (Column ${colLetter})`;

          const sampleValues: string[] = [];
          for (let r = 0; r < Math.min(dataRows.length, 5); r++) {
            const val = String(dataRows[r]?.[colIdx] || '').trim();
            if (val) sampleValues.push(val);
          }

          columns.push({
            key: String(colIdx),
            name: colName,
            sampleValues,
          });
        }

        // Pick default column: first column with values
        let defaultColIdx = 0;
        const candidateCol = columns.find((c) => c.sampleValues.length > 0);
        if (candidateCol) {
          defaultColIdx = Number(candidateCol.key);
        }

        const extractedNumbers: string[] = [];
        const rows: Record<string, string>[] = [];

        dataRows.forEach((row) => {
          const rowObj: Record<string, string> = {};
          let hasData = false;

          for (let colIdx = 0; colIdx < maxCols; colIdx++) {
            const rawVal = row[colIdx];
            const strVal = (rawVal !== undefined && rawVal !== null ? String(rawVal) : '').trim();
            rowObj[String(colIdx)] = strVal;
            if (strVal) hasData = true;
          }

          if (hasData) {
            rows.push(rowObj);
            const targetVal = rowObj[String(defaultColIdx)];
            if (targetVal) {
              extractedNumbers.push(targetVal);
            }
          }
        });

        resolve({
          sheetName,
          columns,
          selectedColumn: String(defaultColIdx),
          rows,
          extractedNumbers,
          totalRows: rows.length,
        });
      } catch (err: any) {
        reject(err?.message ? err : new Error('حدث خطأ أثناء قراءة ملف الإكسل.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('تعذر قراءة الملف المحدد.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Normalizes user text input (newlines, commas, tabs, spaces),
 * trims blanks, and strictly preserves leading zeros.
 */
export function normalizeEmployeeInput(rawText: string): string[] {
  if (!rawText) return [];

  // Split by newlines, commas, semicolons, or tabs
  const items = rawText.split(/[\r\n,;\t]+/);

  const results: string[] = [];
  items.forEach((item) => {
    const trimmed = item.trim();
    if (trimmed.length > 0) {
      results.push(trimmed);
    }
  });

  return results;
}

/**
 * Validates employee number list and detects duplicates
 */
export function validateEmployeeNumbers(numbers: string[]): EmployeeDataValidation {
  const seen = new Set<string>();
  const duplicatesSet = new Set<string>();
  const validList: string[] = [];

  numbers.forEach((num) => {
    const cleaned = num.trim();
    if (cleaned.length > 0) {
      if (seen.has(cleaned)) {
        duplicatesSet.add(cleaned);
      } else {
        seen.add(cleaned);
      }
      validList.push(cleaned);
    }
  });

  const duplicates = Array.from(duplicatesSet);

  return {
    total: validList.length,
    valid: validList.length,
    invalid: 0,
    duplicates,
    duplicateCount: duplicates.length,
    list: validList,
  };
}

/**
 * Removes duplicates while preserving first occurrence order
 */
export function removeDuplicates(numbers: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  numbers.forEach((num) => {
    const cleaned = num.trim();
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  });

  return result;
}

/**
 * Generates and downloads a sample Excel file (.xlsx) with leading zeros
 */
export function downloadSampleExcelFile() {
  const sampleData = [
    { 'رقم الموظف (Employee ID)': '001001', 'اسم الموظف (Name)': 'أحمد محمد علي', 'القسم (Department)': 'الموارد البشرية' },
    { 'رقم الموظف (Employee ID)': '001002', 'اسم الموظف (Name)': 'سارة خالد المنصور', 'القسم (Department)': 'المالية' },
    { 'رقم الموظف (Employee ID)': '001003', 'اسم الموظف (Name)': 'عمر عبد الله السعيد', 'القسم (Department)': 'تقنية المعلومات' },
    { 'رقم الموظف (Employee ID)': '001004', 'اسم الموظف (Name)': 'منى يوسف إبراهيم', 'القسم (Department)': 'المبيعات' },
    { 'رقم الموظف (Employee ID)': '001005', 'اسم الموظف (Name)': 'فهد ناصر الدوسري', 'القسم (Department)': 'العمليات' },
    { 'رقم الموظف (Employee ID)': '001006', 'اسم الموظف (Name)': 'ريم سلطان القحطاني', 'القسم (Department)': 'خدمة العملاء' },
    { 'رقم الموظف (Employee ID)': '001007', 'اسم الموظف (Name)': 'طارق زياد العلي', 'القسم (Department)': 'التسويق' },
    { 'رقم الموظف (Employee ID)': '001008', 'اسم الموظف (Name)': 'هند سليمان الرشيد', 'القسم (Department)': 'المشتريات' },
    { 'رقم الموظف (Employee ID)': '001009', 'اسم الموظف (Name)': 'ياسر محمود الشمري', 'القسم (Department)': 'الشؤون القانونية' },
    { 'رقم الموظف (Employee ID)': '001010', 'اسم الموظف (Name)': 'نورة عبدالعزيز الحازمي', 'القسم (Department)': 'العلاقات العامة' },
    { 'رقم الموظف (Employee ID)': '001011', 'اسم الموظف (Name)': 'خالد فيصل المطيري', 'القسم (Department)': 'المستودعات' },
    { 'رقم الموظف (Employee ID)': '001012', 'اسم الموظف (Name)': 'دلال مشعل العتيبي', 'القسم (Department)': 'التدريب والتطوير' },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData, { cellStyles: true });

  // Format the first column as text to ensure leading zeros are saved as string
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:C13');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellRef = XLSX.utils.encode_cell({ r: R, c: 0 });
    if (ws[cellRef]) {
      ws[cellRef].t = 's'; // Force string type
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الموظفين (Employees)');

  XLSX.writeFile(wb, 'sample_employees_stickers.xlsx');
}
