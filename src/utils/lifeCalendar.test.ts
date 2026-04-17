import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAge,
  formatDateAsIso,
  getFeltStats,
  getFeltTimelineCells,
  getFeltWeekWeight,
  getFeltYearCellCounts,
  getLifeStats,
  getWeekDetail,
  isBirthDateInFuture,
  isValidLifeExpectancy,
  parseBirthDate,
} from './lifeCalendar';

function localDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function findCellIndexByWeek(
  weekIndex: number,
  cells: ReturnType<typeof getFeltTimelineCells>,
) {
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];

    if (!cell) {
      continue;
    }

    if (weekIndex < cell.startWeekIndex) {
      return Math.max(0, index - 1);
    }

    if (weekIndex <= cell.endWeekIndex) {
      return index;
    }
  }

  return Math.max(cells.length - 1, -1);
}

test('formatDateAsIso returns yyyy-mm-dd', () => {
  assert.equal(formatDateAsIso(localDate(1998, 4, 1)), '1998-04-01');
});

test('parseBirthDate accepts a valid leap day', () => {
  const parsed = parseBirthDate('2000-02-29');

  assert.ok(parsed);
  assert.equal(parsed.normalized, '2000-02-29');
  assert.equal(parsed.date.getFullYear(), 2000);
  assert.equal(parsed.date.getMonth(), 1);
  assert.equal(parsed.date.getDate(), 29);
});

test('parseBirthDate rejects impossible dates and wrong formats', () => {
  assert.equal(parseBirthDate('2023-02-29'), null);
  assert.equal(parseBirthDate('1998/04/01'), null);
});

test('isValidLifeExpectancy enforces integer range', () => {
  assert.equal(isValidLifeExpectancy(1), true);
  assert.equal(isValidLifeExpectancy(80), true);
  assert.equal(isValidLifeExpectancy(120), true);
  assert.equal(isValidLifeExpectancy(0), false);
  assert.equal(isValidLifeExpectancy(121), false);
  assert.equal(isValidLifeExpectancy(80.5), false);
});

test('isBirthDateInFuture detects dates after the reference date', () => {
  const referenceDate = localDate(2026, 4, 2);

  assert.equal(isBirthDateInFuture(localDate(2026, 4, 3), referenceDate), true);
  assert.equal(isBirthDateInFuture(localDate(2026, 4, 2), referenceDate), false);
  assert.equal(isBirthDateInFuture(localDate(2026, 4, 1), referenceDate), false);
});

test('calculateAge handles birthdays that have not happened yet this year', () => {
  const birthDate = localDate(1998, 4, 10);

  assert.equal(calculateAge(birthDate, localDate(2026, 4, 9)), 27);
  assert.equal(calculateAge(birthDate, localDate(2026, 4, 10)), 28);
});

test('getLifeStats calculates elapsed and remaining weeks', () => {
  const stats = getLifeStats('2000-01-01', 80, localDate(2000, 2, 19));

  assert.equal(stats.age, 0);
  assert.equal(stats.totalWeeks, 4160);
  assert.equal(stats.elapsedWeeks, 7);
  assert.equal(stats.remainingWeeks, 4153);
  assert.equal(stats.currentWeekIndex, 7);
  assert.equal(stats.currentYearIndex, 0);
  assert.equal(stats.progressPercent, (7 / 4160) * 100);
});

test('getLifeStats clamps elapsed weeks once life expectancy is exceeded', () => {
  const stats = getLifeStats('2000-01-01', 1, localDate(2002, 1, 1));

  assert.equal(stats.age, 2);
  assert.equal(stats.totalWeeks, 52);
  assert.equal(stats.elapsedWeeks, 52);
  assert.equal(stats.remainingWeeks, 0);
  assert.equal(stats.currentWeekIndex, 51);
  assert.equal(stats.currentYearIndex, 0);
  assert.equal(stats.progressPercent, 100);
});

test('getLifeStats returns zeroed stats for invalid input', () => {
  const stats = getLifeStats('not-a-date', 0, localDate(2026, 4, 2));

  assert.deepEqual(stats, {
    age: 0,
    totalWeeks: 0,
    elapsedWeeks: 0,
    remainingWeeks: 0,
    progressPercent: 0,
    currentWeekIndex: 0,
    currentYearIndex: 0,
  });
});

test('getFeltWeekWeight decreases as age years increase', () => {
  assert.equal(getFeltWeekWeight(0), 1);
  assert.equal(getFeltWeekWeight(51), 1);
  assert.equal(getFeltWeekWeight(52), 0.5);
  assert.equal(getFeltWeekWeight(104), 1 / 3);
});

test('getFeltYearCellCounts keeps later years from overtaking earlier years', () => {
  const yearCellCounts = getFeltYearCellCounts(80, 400);

  assert.equal(yearCellCounts.length, 80);
  assert.equal(yearCellCounts.reduce((sum, count) => sum + count, 0), 400);
  assert.equal(yearCellCounts[34] >= yearCellCounts[35], true);
  assert.equal(yearCellCounts.slice(35, 40).reduce((sum, count) => sum + count, 0) > 5, true);
  assert.equal(yearCellCounts[57] >= 1, true);
  assert.equal(yearCellCounts[63] >= 1, true);

  for (let ageYear = 1; ageYear < yearCellCounts.length; ageYear += 1) {
    assert.equal(yearCellCounts[ageYear - 1] >= yearCellCounts[ageYear], true);
  }
});

test('getFeltTimelineCells creates contiguous cells for every represented year', () => {
  const cells = getFeltTimelineCells(80, 400);
  const yearCounts = cells.reduce<Record<number, number>>((counts, cell) => {
    counts[cell.ageYear] = (counts[cell.ageYear] ?? 0) + 1;
    return counts;
  }, {});

  assert.equal(cells.length, 400);
  assert.equal(cells[0]?.startWeekIndex, 0);
  assert.equal(cells.at(-1)?.endWeekIndex, 4159);
  assert.equal(yearCounts[57] >= 1, true);
  assert.equal(yearCounts[63] >= 1, true);

  for (let index = 1; index < cells.length; index += 1) {
    const currentCell = cells[index];
    const previousCell = cells[index - 1];

    if (currentCell?.ageYear === previousCell?.ageYear) {
      assert.equal(currentCell.startWeekIndex, (previousCell.endWeekIndex ?? -1) + 1);
    } else {
      assert.equal(currentCell?.ageYear, (previousCell?.ageYear ?? -1) + 1);
      assert.equal(currentCell?.startWeekIndex, currentCell.ageYear * 52);
    }
  }
});

test('getFeltStats calculates subjective progress with Janet weighting', () => {
  const stats = getFeltStats('2000-01-01', 2, localDate(2001, 1, 9));

  assert.equal(stats.currentWeekIndex, 53);
  assert.equal(stats.currentYearIndex, 1);
  assert.equal(stats.totalWeight, 78);
  assert.equal(stats.elapsedWeight, 52.5);
  assert.equal(stats.remainingWeight, 25.5);
  assert.equal(stats.progressPercent, (52.5 / 78) * 100);
});

test('felt timeline cell position stays close to felt progress for adult ages', () => {
  const cells = getFeltTimelineCells(80, 400);
  const birthDate = localDate(2000, 1, 1);

  for (const ageYear of [20, 25, 30, 35, 40, 45, 50]) {
    const referenceDate = new Date(birthDate.getTime() + ageYear * 52 * 7 * 24 * 60 * 60 * 1000);
    const stats = getFeltStats('2000-01-01', 80, referenceDate);
    const currentCellIndex = findCellIndexByWeek(stats.currentWeekIndex, cells);
    const cellProgressPercent = ((currentCellIndex + 1) / cells.length) * 100;

    assert.equal(Math.abs(cellProgressPercent - stats.progressPercent) < 3, true);
  }
});

test('getWeekDetail returns age, week number, range, and phase', () => {
  const detail = getWeekDetail('2000-01-01', 80, 53, localDate(2001, 1, 9));

  assert.deepEqual(detail, {
    ageYear: 1,
    elapsedWeeks: 53,
    endDate: '2001-01-12',
    phase: 'current',
    remainingWeeks: 4106,
    startDate: '2001-01-06',
    weekIndex: 53,
    weekOfYear: 2,
  });
});

test('getWeekDetail returns null for an out-of-range index', () => {
  assert.equal(getWeekDetail('2000-01-01', 1, 52, localDate(2000, 1, 1)), null);
});
