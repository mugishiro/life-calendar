export type ThemeMode = 'light' | 'dark';
export type LanguageCode = 'ja' | 'en' | 'zh' | 'es' | 'hi';
export type ViewMode = 'life' | 'year';

export interface UserSettings {
  birthDate: string;
  language: LanguageCode;
  lifeExpectancy: number;
  selectedCalendarYear: number;
  theme: ThemeMode;
  viewMode: ViewMode;
}

export type WeekMemoMap = Record<string, string>;
