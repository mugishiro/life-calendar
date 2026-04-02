import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAge,
  formatDateAsIso,
  getLifeStats,
  getWeekDetail,
  isBirthDateInFuture,
  isValidLifeExpectancy,
  parseBirthDate,
} from './lifeCalendar';

function localDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
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
