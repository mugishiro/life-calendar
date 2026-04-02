import AsyncStorage from '@react-native-async-storage/async-storage';

import { getPreferredLanguage, isLanguage } from '../i18n';
import type { UserSettings, WeekMemoMap } from '../types';
import { isValidLifeExpectancy, parseBirthDate } from './lifeCalendar';

const USER_SETTINGS_STORAGE_KEY = 'life-calendar:user-settings';
const WEEK_MEMOS_STORAGE_KEY = 'life-calendar:week-memos';
const MAX_MEMO_LENGTH = 200;

function isTheme(value: unknown): value is UserSettings['theme'] {
  return value === 'light' || value === 'dark';
}

function isViewMode(value: unknown): value is UserSettings['viewMode'] {
  return value === 'life' || value === 'year';
}

function normalizeUserSettings(value: unknown): UserSettings | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.birthDate !== 'string' ||
    parseBirthDate(candidate.birthDate) === null ||
    typeof candidate.lifeExpectancy !== 'number' ||
    !isValidLifeExpectancy(candidate.lifeExpectancy) ||
    !isTheme(candidate.theme)
  ) {
    return null;
  }

  return {
    birthDate: candidate.birthDate,
    language:
      candidate.language === 'ko'
        ? 'hi'
        : isLanguage(candidate.language)
          ? candidate.language
          : getPreferredLanguage(),
    lifeExpectancy: candidate.lifeExpectancy,
    selectedCalendarYear:
      typeof candidate.selectedCalendarYear === 'number' &&
      Number.isInteger(candidate.selectedCalendarYear)
        ? candidate.selectedCalendarYear
        : new Date().getFullYear(),
    theme: candidate.theme,
    viewMode: isViewMode(candidate.viewMode) ? candidate.viewMode : 'life',
  };
}

export async function loadUserSettings() {
  try {
    const rawValue = await AsyncStorage.getItem(USER_SETTINGS_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return normalizeUserSettings(parsedValue);
  } catch (error) {
    return null;
  }
}

export async function saveUserSettings(settings: UserSettings) {
  await AsyncStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function sanitizeMemoText(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.slice(0, MAX_MEMO_LENGTH);
}

function isWeekMemoMap(value: unknown): value is WeekMemoMap {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.entries(value as Record<string, unknown>).every(([key, memo]) => {
    return /^\d+$/.test(key) && typeof memo === 'string';
  });
}

function sanitizeWeekMemoMap(memos: WeekMemoMap) {
  const nextMemos: WeekMemoMap = {};

  for (const [key, value] of Object.entries(memos)) {
    const sanitizedValue = sanitizeMemoText(value);

    if (sanitizedValue.trim()) {
      nextMemos[key] = sanitizedValue;
    }
  }

  return nextMemos;
}

export async function loadWeekMemos() {
  try {
    const rawValue = await AsyncStorage.getItem(WEEK_MEMOS_STORAGE_KEY);

    if (!rawValue) {
      return {} as WeekMemoMap;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isWeekMemoMap(parsedValue)
      ? sanitizeWeekMemoMap(parsedValue)
      : ({} as WeekMemoMap);
  } catch (error) {
    return {} as WeekMemoMap;
  }
}

export async function saveWeekMemo(weekIndex: number, text: string) {
  const currentMemos = await loadWeekMemos();
  const nextMemos = { ...currentMemos };
  const sanitizedText = sanitizeMemoText(text);

  if (sanitizedText.trim()) {
    nextMemos[String(weekIndex)] = sanitizedText;
  } else {
    delete nextMemos[String(weekIndex)];
  }

  await AsyncStorage.setItem(
    WEEK_MEMOS_STORAGE_KEY,
    JSON.stringify(sanitizeWeekMemoMap(nextMemos)),
  );

  return nextMemos;
}
