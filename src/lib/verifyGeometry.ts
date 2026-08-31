import { calculateGeometry, generateBaseStickers } from './geometry';
import { computeAssignments } from './assignmentEngine';
import { normalizeEmployeeInput, validateEmployeeNumbers } from './excelParser';
import { DEFAULT_TEMPLATE } from './templates';
import { StickerTemplate } from '../types';

/**
 * Self-verifying automated test suite for the precision geometry and assignment engine.
 */
export function runVerificationSuite(): { passed: boolean; logs: string[] } {
  const logs: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      logs.push(`✅ PASS: ${testName}`);
    } else {
      logs.push(`❌ FAIL: ${testName}`);
      allPassed = false;
    }
  }

  // 1. Test A4 210x297 Portrait Base Calculations
  const defaultGeo = calculateGeometry(DEFAULT_TEMPLATE);
  assert(defaultGeo.isValid, 'Default template geometry is valid');
  assert(defaultGeo.pageWidth === 210 && defaultGeo.pageHeight === 297, 'Page dimensions are 210 x 297 mm');
  assert(defaultGeo.columns === 5 && defaultGeo.rows === 8, 'Default template has 5 columns and 8 rows');
  assert(defaultGeo.totalStickers === 40, 'Default template total stickers = 40');

  // 2. Test Landscape Orientation Calculation
  const landscapeTemplate: StickerTemplate = {
    ...DEFAULT_TEMPLATE,
    orientation: 'landscape',
  };
  const landscapeGeo = calculateGeometry(landscapeTemplate);
  assert(
    landscapeGeo.pageWidth === 297 && landscapeGeo.pageHeight === 210,
    'Landscape orientation swaps dimensions correctly to 297 x 210 mm'
  );

  // 3. Test Leading Zero Preservation in String Processing
  const rawInput = '00125, 00126\n00127\t00128;00001';
  const normalized = normalizeEmployeeInput(rawInput);
  assert(
    normalized[0] === '00125' &&
      normalized[1] === '00126' &&
      normalized[2] === '00127' &&
      normalized[3] === '00128' &&
      normalized[4] === '00001',
    'Leading zeros are strictly preserved across delimiters'
  );

  // 4. Test Partial Sheet & Start Position Assignment
  // Start from sticker #6 with stickers #1, #2, #3, #7, #8 marked USED
  const usedMap: Record<number, number[]> = {
    0: [0, 1, 2, 6, 7], // 0-based indices corresponding to 1, 2, 3, 7, 8
  };
  const numbers = ['001001', '001002', '001003', '001004'];
  const assignment = computeAssignments(DEFAULT_TEMPLATE, numbers, 1, usedMap);

  const p1 = assignment.pages[0];
  // Index 3 (Sticker #4) -> 001001
  // Index 4 (Sticker #5) -> 001002
  // Index 5 (Sticker #6) -> 001003
  // Index 6 (Sticker #7) is USED -> skipped!
  // Index 7 (Sticker #8) is USED -> skipped!
  // Index 8 (Sticker #9) -> 001004
  assert(p1.stickers[3].employeeNumber === '001001', 'Sticker #4 receives first number 001001');
  assert(p1.stickers[4].employeeNumber === '001002', 'Sticker #5 receives second number 001002');
  assert(p1.stickers[5].employeeNumber === '001003', 'Sticker #6 receives third number 001003');
  assert(p1.stickers[6].status === 'used', 'Sticker #7 is marked USED and skipped');
  assert(p1.stickers[7].status === 'used', 'Sticker #8 is marked USED and skipped');
  assert(p1.stickers[8].employeeNumber === '001004', 'Sticker #9 receives fourth number 001004');

  // 5. Test Global and Individual Offsets
  const offsetsMap = {
    0: {
      0: { x: 1.5, y: -0.5 },
    },
  };
  const templateWithGlobalOffset: StickerTemplate = {
    ...DEFAULT_TEMPLATE,
    globalOffsetX: 2.0,
    globalOffsetY: 1.0,
  };
  const stickersWithOffsets = generateBaseStickers(templateWithGlobalOffset, 0, offsetsMap[0]);
  const s0 = stickersWithOffsets[0];
  // baseX = 10, baseY = 10
  // finalX = baseX (10) + globalOffset (2.0) + stickerOffset (1.5) = 13.5 mm
  // finalY = baseY (10) + globalOffset (1.0) + stickerOffset (-0.5) = 10.5 mm
  assert(s0.finalX === 13.5, 'Final X calculates baseX + globalOffsetX + stickerOffsetX (13.5 mm)');
  assert(s0.finalY === 10.5, 'Final Y calculates baseY + globalOffsetY + stickerOffsetY (10.5 mm)');

  // 6. Test Multi-page Overflow Calculation
  // 75 numbers on a 40-sticker sheet with 10 used on page 1 -> requires 3 pages
  const largeNumbers = Array.from({ length: 75 }, (_, i) => `EMP_${String(i + 1).padStart(4, '0')}`);
  const multiPageAssignment = computeAssignments(DEFAULT_TEMPLATE, largeNumbers, 1);
  assert(multiPageAssignment.totalPages === 2, '75 numbers on 40-capacity sheet calculates 2 pages');
  assert(multiPageAssignment.assignedCount === 75, 'All 75 numbers successfully assigned across pages');

  return { passed: allPassed, logs };
}
