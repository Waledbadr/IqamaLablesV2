import { PageLayout, StickerItem, StickerTemplate } from '../types';
import { calculateGeometry, generateBaseStickers } from './geometry';

export interface AssignmentResult {
  pages: PageLayout[];
  totalPages: number;
  totalEmployeeNumbers: number;
  assignedCount: number;
  unassignedCount: number;
  unassignedList: string[];
  totalUsedCount: number;
  stickersPerPage: number;
}

export function computeAssignments(
  template: StickerTemplate,
  employeeNumbers: string[],
  startPosition: number = 1, // 1-based index on Page 1
  usedStickersByPage: Record<number, number[]> = {},
  individualOffsetsByPage: Record<number, Record<number, { x: number; y: number }>> = {},
  manualAssignmentsByPage: Record<number, Record<number, string>> = {}
): AssignmentResult {
  const geo = calculateGeometry(template);
  const stickersPerPage = geo.totalStickers;

  if (!geo.isValid || stickersPerPage <= 0) {
    return {
      pages: [],
      totalPages: 0,
      totalEmployeeNumbers: employeeNumbers.length,
      assignedCount: 0,
      unassignedCount: employeeNumbers.length,
      unassignedList: [...employeeNumbers],
      totalUsedCount: 0,
      stickersPerPage: 0,
    };
  }

  // Filter out empty employee numbers
  const validNumbers = employeeNumbers.filter((num) => num && num.trim().length > 0);

  // 1. Calculate how many pages are required
  // Page 1 available slots:
  const page1UsedSet = new Set(usedStickersByPage[0] || []);
  const page1ManualKeys = Object.keys(manualAssignmentsByPage[0] || {}).map(Number);
  const page1ManualSet = new Set(page1ManualKeys);

  const startIdx = Math.max(0, Math.min(stickersPerPage - 1, startPosition - 1));
  let page1AutoCapacity = 0;
  for (let i = startIdx; i < stickersPerPage; i++) {
    if (!page1UsedSet.has(i) && !page1ManualSet.has(i)) {
      page1AutoCapacity++;
    }
  }

  // Count manual assignments across all pages
  const manualAssignedNumbers = new Set<string>();
  Object.values(manualAssignmentsByPage).forEach((pageMap) => {
    Object.values(pageMap).forEach((num) => {
      if (num && num !== '__EMPTY__') manualAssignedNumbers.add(num);
    });
  });

  const numbersToAutoAssign = validNumbers.filter((num) => !manualAssignedNumbers.has(num));

  let requiredPages = 1;
  let remainingToAssign = Math.max(0, numbersToAutoAssign.length - page1AutoCapacity);

  // Count used stickers across other pages to calculate capacity
  while (remainingToAssign > 0 && requiredPages < 100) {
    const nextPageIndex = requiredPages;
    const nextUsedSet = new Set(usedStickersByPage[nextPageIndex] || []);
    const nextManualSet = new Set(Object.keys(manualAssignmentsByPage[nextPageIndex] || {}).map(Number));

    let nextPageCapacity = 0;
    for (let i = 0; i < stickersPerPage; i++) {
      if (!nextUsedSet.has(i) && !nextManualSet.has(i)) {
        nextPageCapacity++;
      }
    }

    // Default to stickersPerPage if 0 capacity to prevent infinite loop
    const effectiveCapacity = Math.max(1, nextPageCapacity);
    remainingToAssign -= effectiveCapacity;
    requiredPages++;
  }

  // Also ensure pages exist for any page that has used stickers or manual assignments
  const configuredPageIndices = [
    ...Object.keys(usedStickersByPage).map(Number),
    ...Object.keys(manualAssignmentsByPage).map(Number),
    ...Object.keys(individualOffsetsByPage).map(Number),
  ];
  const maxConfiguredPage = configuredPageIndices.length > 0 ? Math.max(...configuredPageIndices) : 0;
  requiredPages = Math.max(requiredPages, maxConfiguredPage + 1, 1);

  // 2. Perform page-by-page distribution
  const pages: PageLayout[] = [];
  let autoAssignCursor = 0;
  let totalUsedCount = 0;
  let totalAssignedCount = 0;

  for (let p = 0; p < requiredPages; p++) {
    const pageOffsets = individualOffsetsByPage[p] || {};
    const pageUsedSet = new Set(usedStickersByPage[p] || []);
    const pageManualMap = manualAssignmentsByPage[p] || {};

    const stickers = generateBaseStickers(template, p, pageOffsets);
    let pageAvailable = 0;
    let pageUsed = 0;
    let pageAssigned = 0;

    const startScanIndex = p === 0 ? startIdx : 0;

    // First pass: mark used and manual assignments
    for (let i = 0; i < stickers.length; i++) {
      const sticker = stickers[i];

      if (pageUsedSet.has(i)) {
        sticker.status = 'used';
        pageUsed++;
        totalUsedCount++;
      } else if (pageManualMap[i] !== undefined) {
        if (pageManualMap[i] === '__EMPTY__' || pageManualMap[i] === '') {
          sticker.status = 'available';
          (sticker as any).isManuallyEmpty = true;
          pageAvailable++;
        } else {
          sticker.status = 'assigned';
          sticker.employeeNumber = pageManualMap[i];
          pageAssigned++;
          totalAssignedCount++;
        }
      } else {
        sticker.status = 'available';
        pageAvailable++;
      }
    }

    // Second pass: auto-assign remaining numbers
    for (let i = 0; i < stickers.length; i++) {
      const sticker = stickers[i];

      // On page 1, skip indices prior to startPosition unless manually assigned
      if (p === 0 && i < startScanIndex) {
        continue;
      }

      if (
        sticker.status === 'available' &&
        !(sticker as any).isManuallyEmpty &&
        autoAssignCursor < numbersToAutoAssign.length
      ) {
        sticker.status = 'assigned';
        sticker.employeeNumber = numbersToAutoAssign[autoAssignCursor];
        autoAssignCursor++;
        pageAssigned++;
        totalAssignedCount++;
        pageAvailable--;
      }
    }

    pages.push({
      pageIndex: p,
      stickers,
      totalAvailable: pageAvailable,
      totalUsed: pageUsed,
      totalAssigned: pageAssigned,
    });
  }

  const unassignedList = numbersToAutoAssign.slice(autoAssignCursor);

  return {
    pages,
    totalPages: requiredPages,
    totalEmployeeNumbers: validNumbers.length,
    assignedCount: totalAssignedCount,
    unassignedCount: unassignedList.length,
    unassignedList,
    totalUsedCount,
    stickersPerPage,
  };
}
