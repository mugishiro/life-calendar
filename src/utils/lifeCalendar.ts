const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export interface ParsedBirthDate {
  normalized: string;
  date: Date;
}

export interface LifeStats {
  age: number;
  totalWeeks: number;
  elapsedWeeks: number;
  remainingWeeks: number;
  progressPercent: number;
  currentWeekIndex: number;
  currentYearIndex: number;
}

export interface FeltStats {
  totalWeight: number;
  elapsedWeight: number;
  remainingWeight: number;
  progressPercent: number;
  currentWeekIndex: number;
  currentYearIndex: number;
}

export interface FeltTimelineCell {
  ageYear: number;
  endWeekIndex: number;
  representativeWeekIndex: number;
  startWeekIndex: number;
}

export interface WeekDetail {
  ageYear: number;
  elapsedWeeks: number;
  endDate: string;
  phase: 'past' | 'current' | 'future';
  remainingWeeks: number;
  startDate: string;
  weekIndex: number;
  weekOfYear: number;
}

export interface CalendarYearWeek {
  endDate: string;
  isCurrent: boolean;
  lifeWeekIndex: number | null;
  phase: 'past' | 'current' | 'future' | 'outside';
  startDate: string;
  weekNumber: number;
}

function toSafeLocalDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfYear(year: number) {
  return new Date(year, 11, 31);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function getHarmonicSum(count: number) {
  let total = 0;

  for (let index = 1; index <= count; index += 1) {
    total += 1 / index;
  }

  return total;
}

export function isValidLifeExpectancy(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 120;
}

export function formatDateAsIso(date: Date) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseBirthDate(input: string): ParsedBirthDate | null {
  const trimmed = input.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = toSafeLocalDate(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return {
    normalized: formatDateAsIso(date),
    date,
  };
}

export function isBirthDateInFuture(birthDate: Date, referenceDate = new Date()) {
  return startOfDay(birthDate).getTime() > startOfDay(referenceDate).getTime();
}

export function calculateAge(birthDate: Date, referenceDate = new Date()) {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    referenceDate.getMonth() > birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() &&
      referenceDate.getDate() >= birthDate.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export function getLifeStats(
  birthDateInput: string,
  lifeExpectancy: number,
  referenceDate = new Date(),
): LifeStats {
  const parsedBirthDate = parseBirthDate(birthDateInput);

  if (!parsedBirthDate || !isValidLifeExpectancy(lifeExpectancy)) {
    return {
      age: 0,
      totalWeeks: 0,
      elapsedWeeks: 0,
      remainingWeeks: 0,
      progressPercent: 0,
      currentWeekIndex: 0,
      currentYearIndex: 0,
    };
  }

  const totalWeeks = lifeExpectancy * 52;
  const birthDate = startOfDay(parsedBirthDate.date);
  const today = startOfDay(referenceDate);
  const elapsedWeeksRaw = Math.floor((today.getTime() - birthDate.getTime()) / WEEK_IN_MS);
  const elapsedWeeks = Math.max(0, Math.min(elapsedWeeksRaw, totalWeeks));
  const currentWeekIndex = totalWeeks === 0 ? 0 : Math.min(elapsedWeeks, totalWeeks - 1);
  const currentYearIndex = Math.floor(currentWeekIndex / 52);

  return {
    age: calculateAge(parsedBirthDate.date, referenceDate),
    totalWeeks,
    elapsedWeeks,
    remainingWeeks: Math.max(totalWeeks - elapsedWeeks, 0),
    progressPercent: totalWeeks === 0 ? 0 : Math.min((elapsedWeeks / totalWeeks) * 100, 100),
    currentWeekIndex,
    currentYearIndex,
  };
}

export function getFeltWeekWeight(weekIndex: number) {
  if (!Number.isInteger(weekIndex) || weekIndex < 0) {
    return 0;
  }

  return 1 / (Math.floor(weekIndex / 52) + 1);
}

export function getFeltYearCellCounts(
  lifeExpectancy: number,
  requestedCellCount: number,
) {
  if (
    !isValidLifeExpectancy(lifeExpectancy) ||
    !Number.isFinite(requestedCellCount) ||
    requestedCellCount < 1
  ) {
    return [];
  }

  const totalWeeks = lifeExpectancy * 52;
  const totalCellCount = Math.max(1, Math.min(totalWeeks, Math.floor(requestedCellCount)));
  const counts = Array.from({ length: lifeExpectancy }, () => 0);
  let allocatedCount = 0;

  while (allocatedCount < totalCellCount) {
    let bestAgeYear = -1;
    let bestPriority = -1;

    for (let ageYear = 0; ageYear < lifeExpectancy; ageYear += 1) {
      if (counts[ageYear] >= 52) {
        continue;
      }

      const priority = (1 / (ageYear + 1)) / (counts[ageYear] + 1);

      if (priority > bestPriority) {
        bestPriority = priority;
        bestAgeYear = ageYear;
      }
    }

    if (bestAgeYear === -1) {
      break;
    }

    counts[bestAgeYear] += 1;
    allocatedCount += 1;
  }

  return counts;
}

export function getFeltTimelineCells(
  lifeExpectancy: number,
  requestedCellCount: number,
): FeltTimelineCell[] {
  if (
    !isValidLifeExpectancy(lifeExpectancy) ||
    !Number.isFinite(requestedCellCount) ||
    requestedCellCount < 1
  ) {
    return [];
  }

  const yearCellCounts = getFeltYearCellCounts(lifeExpectancy, requestedCellCount);
  const cells: FeltTimelineCell[] = [];

  for (let ageYear = 0; ageYear < yearCellCounts.length; ageYear += 1) {
    const yearStartWeekIndex = ageYear * 52;
    const yearCellCount = yearCellCounts[ageYear] ?? 0;

    for (let cellIndex = 0; cellIndex < yearCellCount; cellIndex += 1) {
      const startWeekOfYear = Math.floor((cellIndex * 52) / yearCellCount);
      const nextStartWeekOfYear = Math.floor(((cellIndex + 1) * 52) / yearCellCount);
      const startWeekIndex = yearStartWeekIndex + startWeekOfYear;
      const endWeekIndex = yearStartWeekIndex + Math.max(startWeekOfYear, nextStartWeekOfYear - 1);
      const representativeWeekIndex =
        startWeekIndex + Math.floor((endWeekIndex - startWeekIndex) / 2);

      cells.push({
        ageYear,
        endWeekIndex,
        representativeWeekIndex,
        startWeekIndex,
      });
    }
  }

  return cells;
}

export function getFeltStats(
  birthDateInput: string,
  lifeExpectancy: number,
  referenceDate = new Date(),
): FeltStats {
  const stats = getLifeStats(birthDateInput, lifeExpectancy, referenceDate);

  if (stats.totalWeeks === 0) {
    return {
      totalWeight: 0,
      elapsedWeight: 0,
      remainingWeight: 0,
      progressPercent: 0,
      currentWeekIndex: 0,
      currentYearIndex: 0,
    };
  }

  const elapsedYears = Math.floor(stats.elapsedWeeks / 52);
  const elapsedPartialWeeks = stats.elapsedWeeks % 52;
  const elapsedWeight =
    52 * getHarmonicSum(elapsedYears) +
    (elapsedPartialWeeks > 0 ? elapsedPartialWeeks / (elapsedYears + 1) : 0);
  const totalWeight = 52 * getHarmonicSum(lifeExpectancy);

  return {
    totalWeight,
    elapsedWeight,
    remainingWeight: Math.max(totalWeight - elapsedWeight, 0),
    progressPercent: totalWeight === 0 ? 0 : Math.min((elapsedWeight / totalWeight) * 100, 100),
    currentWeekIndex: stats.currentWeekIndex,
    currentYearIndex: stats.currentYearIndex,
  };
}

export function getWeekDetail(
  birthDateInput: string,
  lifeExpectancy: number,
  weekIndex: number,
  referenceDate = new Date(),
): WeekDetail | null {
  const parsedBirthDate = parseBirthDate(birthDateInput);

  if (!parsedBirthDate || !isValidLifeExpectancy(lifeExpectancy)) {
    return null;
  }

  const totalWeeks = lifeExpectancy * 52;

  if (!Number.isInteger(weekIndex) || weekIndex < 0 || weekIndex >= totalWeeks) {
    return null;
  }

  const stats = getLifeStats(birthDateInput, lifeExpectancy, referenceDate);
  const startDate = new Date(parsedBirthDate.date.getTime() + weekIndex * WEEK_IN_MS);
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  return {
    ageYear: Math.floor(weekIndex / 52),
    elapsedWeeks: Math.min(weekIndex, stats.elapsedWeeks),
    endDate: formatDateAsIso(endDate),
    phase:
      weekIndex < stats.elapsedWeeks
        ? 'past'
        : weekIndex === stats.currentWeekIndex
          ? 'current'
          : 'future',
    remainingWeeks: Math.max(totalWeeks - weekIndex - 1, 0),
    startDate: formatDateAsIso(startDate),
    weekIndex,
    weekOfYear: (weekIndex % 52) + 1,
  };
}

export function getCalendarYearWeeks(
  birthDateInput: string,
  lifeExpectancy: number,
  calendarYear: number,
  referenceDate = new Date(),
): CalendarYearWeek[] {
  const parsedBirthDate = parseBirthDate(birthDateInput);

  if (!parsedBirthDate || !isValidLifeExpectancy(lifeExpectancy) || !Number.isInteger(calendarYear)) {
    return [];
  }

  const birthDate = startOfDay(parsedBirthDate.date);
  const stats = getLifeStats(birthDateInput, lifeExpectancy, referenceDate);
  const totalWeeks = lifeExpectancy * 52;
  const yearEnd = endOfYear(calendarYear);
  const today = startOfDay(referenceDate);
  const weeks: CalendarYearWeek[] = [];
  let cursor = new Date(calendarYear, 0, 1);
  let weekNumber = 1;

  while (cursor.getTime() <= yearEnd.getTime()) {
    const blockStart = startOfDay(cursor);
    const rawEnd = addDays(blockStart, 6);
    const blockEnd =
      rawEnd.getTime() > yearEnd.getTime() ? startOfDay(yearEnd) : rawEnd;
    const rawLifeWeekIndex = Math.floor((blockStart.getTime() - birthDate.getTime()) / WEEK_IN_MS);
    const lifeWeekIndex =
      rawLifeWeekIndex >= 0 && rawLifeWeekIndex < totalWeeks ? rawLifeWeekIndex : null;

    weeks.push({
      endDate: formatDateAsIso(blockEnd),
      isCurrent: today.getTime() >= blockStart.getTime() && today.getTime() <= blockEnd.getTime(),
      lifeWeekIndex,
      phase:
        lifeWeekIndex === null
          ? 'outside'
          : lifeWeekIndex < stats.elapsedWeeks
            ? 'past'
            : lifeWeekIndex === stats.currentWeekIndex
              ? 'current'
              : 'future',
      startDate: formatDateAsIso(blockStart),
      weekNumber,
    });

    cursor = addDays(blockStart, 7);
    weekNumber += 1;
  }

  return weeks;
}
