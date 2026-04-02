import type { LanguageCode } from './types';

export const DEFAULT_LANGUAGE: LanguageCode = 'ja';

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
];

interface Translations {
  appTitle: string;
  appSubtitle: string;
  alertSaveFailedTitle: string;
  alertSettingsSaveFailedMessage: string;
  alertMemoSaveFailedMessage: string;
  commonBack: string;
  commonYears: string;
  commonWeeksShort: string;
  commonSelect: string;
  commonClose: string;
  onboardingStep: string;
  onboardingTitle: string;
  onboardingDescription: string;
  onboardingBirthDateLabel: string;
  onboardingBirthDateHelper: string;
  onboardingBirthDatePlaceholder: string;
  onboardingLifeExpectancyLabel: string;
  onboardingTotalWeeksLabel: string;
  onboardingStart: string;
  onboardingBirthDateInvalid: string;
  onboardingBirthDateFuture: string;
  onboardingLifeExpectancyInvalid: string;
  settingsTitle: string;
  settingsDisplay: string;
  settingsTheme: string;
  settingsLanguage: string;
  settingsLife: string;
  settingsBirthDateLabel: string;
  settingsBirthDateHelper: string;
  settingsBirthDatePlaceholder: string;
  settingsLifeExpectancyLabel: string;
  settingsLifeNote: string;
  settingsThemeLight: string;
  settingsThemeDark: string;
  settingsBirthDateInvalid: string;
  settingsBirthDateFuture: string;
  settingsLifeExpectancyInvalid: string;
  mainLeft: string;
  mainProgress: string;
  mainModeLife: string;
  mainModeYear: string;
  mainModeClock: string;
  mainClockSecond: string;
  mainClockMinute: string;
  mainClockHour: string;
  mainClockDay: string;
  mainClockWeek: string;
  mainClockYear: string;
  mainClockLife: string;
  mainMemo: string;
  mainMemoPlaceholder: string;
  mainMemoSave: string;
  mainMemoDelete: string;
  mainMemoSaving: string;
  mainWeekTitle: (ageYear: number, weekOfYear: number) => string;
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  ja: {
    appTitle: 'Life Calendar',
    appSubtitle: '人生を週でみる',
    alertSaveFailedTitle: '保存できませんでした',
    alertSettingsSaveFailedMessage: '設定の保存に失敗しました。もう一度お試しください。',
    alertMemoSaveFailedMessage: '週メモの保存に失敗しました。もう一度お試しください。',
    commonBack: '戻る',
    commonYears: '年',
    commonWeeksShort: '週',
    commonSelect: '選択',
    commonClose: '閉じる',
    onboardingStep: 'Step 1 / 1',
    onboardingTitle: 'はじめに',
    onboardingDescription: '生年月日と想定寿命を入力すると、人生を週単位で表示します。',
    onboardingBirthDateLabel: '生年月日',
    onboardingBirthDateHelper: '未来の日付は選択できません。',
    onboardingBirthDatePlaceholder: '日付を選択',
    onboardingLifeExpectancyLabel: '想定寿命',
    onboardingTotalWeeksLabel: '総週数の目安',
    onboardingStart: '人生カレンダーを始める',
    onboardingBirthDateInvalid: '生年月日は YYYY-MM-DD 形式で入力してください。',
    onboardingBirthDateFuture: '未来の日付は入力できません。',
    onboardingLifeExpectancyInvalid: '想定寿命は 1〜120 歳の範囲で入力してください。',
    settingsTitle: '設定',
    settingsDisplay: '表示設定',
    settingsTheme: 'テーマ',
    settingsLanguage: '言語',
    settingsLife: '人生設定',
    settingsBirthDateLabel: '生年月日',
    settingsBirthDateHelper: '変更すると現在位置と残り週数を再計算します。',
    settingsBirthDatePlaceholder: '日付を選択',
    settingsLifeExpectancyLabel: '想定寿命',
    settingsLifeNote: '変更するとグリッドと残り週数を再計算します。',
    settingsThemeLight: 'ライト',
    settingsThemeDark: 'ダーク',
    settingsBirthDateInvalid: '生年月日は YYYY-MM-DD 形式の正しい日付にしてください。',
    settingsBirthDateFuture: '未来の日付は設定できません。',
    settingsLifeExpectancyInvalid: '想定寿命は 1〜120 歳の範囲で設定してください。',
    mainLeft: '残り',
    mainProgress: '進捗',
    mainModeLife: 'Life',
    mainModeYear: 'Year',
    mainModeClock: 'Clock',
    mainClockSecond: '秒',
    mainClockMinute: '分',
    mainClockHour: '時',
    mainClockDay: '日',
    mainClockWeek: '週',
    mainClockYear: '年',
    mainClockLife: '人生',
    mainMemo: 'メモ',
    mainMemoPlaceholder: 'この週のメモを残す',
    mainMemoSave: 'メモを保存',
    mainMemoDelete: 'メモを削除',
    mainMemoSaving: '保存中...',
    mainWeekTitle: (ageYear, weekOfYear) => `${ageYear}歳の ${weekOfYear}週目`,
  },
  en: {
    appTitle: 'Life Calendar',
    appSubtitle: 'your life in weeks',
    alertSaveFailedTitle: 'Could not save',
    alertSettingsSaveFailedMessage: 'Saving settings failed. Please try again.',
    alertMemoSaveFailedMessage: 'Saving the memo failed. Please try again.',
    commonBack: 'Back',
    commonYears: 'years',
    commonWeeksShort: 'w',
    commonSelect: 'Select',
    commonClose: 'Close',
    onboardingStep: 'Step 1 / 1',
    onboardingTitle: 'Get Started',
    onboardingDescription: 'Enter your birth date and life expectancy to view life in weeks.',
    onboardingBirthDateLabel: 'Birth date',
    onboardingBirthDateHelper: 'Future dates cannot be selected.',
    onboardingBirthDatePlaceholder: 'Select a date',
    onboardingLifeExpectancyLabel: 'Life expectancy',
    onboardingTotalWeeksLabel: 'Estimated total weeks',
    onboardingStart: 'Start Life Calendar',
    onboardingBirthDateInvalid: 'Enter a valid birth date in YYYY-MM-DD format.',
    onboardingBirthDateFuture: 'Future dates are not allowed.',
    onboardingLifeExpectancyInvalid: 'Life expectancy must be between 1 and 120.',
    settingsTitle: 'Settings',
    settingsDisplay: 'Display',
    settingsTheme: 'Theme',
    settingsLanguage: 'Language',
    settingsLife: 'Life',
    settingsBirthDateLabel: 'Birth date',
    settingsBirthDateHelper: 'Changes recalculate current position and remaining weeks.',
    settingsBirthDatePlaceholder: 'Select a date',
    settingsLifeExpectancyLabel: 'Life expectancy',
    settingsLifeNote: 'Changes recalculate the grid and remaining weeks.',
    settingsThemeLight: 'Light',
    settingsThemeDark: 'Dark',
    settingsBirthDateInvalid: 'Enter a valid birth date in YYYY-MM-DD format.',
    settingsBirthDateFuture: 'Future dates are not allowed.',
    settingsLifeExpectancyInvalid: 'Life expectancy must be between 1 and 120.',
    mainLeft: 'Left',
    mainProgress: 'Progress',
    mainModeLife: 'Life',
    mainModeYear: 'Year',
    mainModeClock: 'Clock',
    mainClockSecond: 'Second',
    mainClockMinute: 'Minute',
    mainClockHour: 'Hour',
    mainClockDay: 'Day',
    mainClockWeek: 'Week',
    mainClockYear: 'Year',
    mainClockLife: 'Life',
    mainMemo: 'Memo',
    mainMemoPlaceholder: 'Add a memo for this week',
    mainMemoSave: 'Save Memo',
    mainMemoDelete: 'Delete Memo',
    mainMemoSaving: 'Saving...',
    mainWeekTitle: (ageYear, weekOfYear) => `Age ${ageYear}, week ${weekOfYear}`,
  },
  zh: {
    appTitle: 'Life Calendar',
    appSubtitle: '用周查看你的人生',
    alertSaveFailedTitle: '无法保存',
    alertSettingsSaveFailedMessage: '保存设置失败，请再试一次。',
    alertMemoSaveFailedMessage: '保存周记失败，请再试一次。',
    commonBack: '返回',
    commonYears: '年',
    commonWeeksShort: '周',
    commonSelect: '选择',
    commonClose: '关闭',
    onboardingStep: 'Step 1 / 1',
    onboardingTitle: '开始使用',
    onboardingDescription: '输入生日和预期寿命后，即可按周查看人生。',
    onboardingBirthDateLabel: '出生日期',
    onboardingBirthDateHelper: '不能选择未来日期。',
    onboardingBirthDatePlaceholder: '选择日期',
    onboardingLifeExpectancyLabel: '预期寿命',
    onboardingTotalWeeksLabel: '预计总周数',
    onboardingStart: '开始使用 Life Calendar',
    onboardingBirthDateInvalid: '请输入有效的 YYYY-MM-DD 日期。',
    onboardingBirthDateFuture: '不能输入未来日期。',
    onboardingLifeExpectancyInvalid: '预期寿命必须在 1 到 120 之间。',
    settingsTitle: '设置',
    settingsDisplay: '显示',
    settingsTheme: '主题',
    settingsLanguage: '语言',
    settingsLife: '人生设置',
    settingsBirthDateLabel: '出生日期',
    settingsBirthDateHelper: '修改后会重新计算当前位置和剩余周数。',
    settingsBirthDatePlaceholder: '选择日期',
    settingsLifeExpectancyLabel: '预期寿命',
    settingsLifeNote: '修改后会重新计算网格和剩余周数。',
    settingsThemeLight: '浅色',
    settingsThemeDark: '深色',
    settingsBirthDateInvalid: '请输入有效的 YYYY-MM-DD 日期。',
    settingsBirthDateFuture: '不能设置未来日期。',
    settingsLifeExpectancyInvalid: '预期寿命必须在 1 到 120 之间。',
    mainLeft: '剩余',
    mainProgress: '进度',
    mainModeLife: 'Life',
    mainModeYear: 'Year',
    mainModeClock: 'Clock',
    mainClockSecond: '秒',
    mainClockMinute: '分',
    mainClockHour: '时',
    mainClockDay: '日',
    mainClockWeek: '周',
    mainClockYear: '年',
    mainClockLife: '人生',
    mainMemo: '周记',
    mainMemoPlaceholder: '为这一周写点记录',
    mainMemoSave: '保存周记',
    mainMemoDelete: '删除周记',
    mainMemoSaving: '保存中...',
    mainWeekTitle: (ageYear, weekOfYear) => `${ageYear}岁，第${weekOfYear}周`,
  },
  es: {
    appTitle: 'Life Calendar',
    appSubtitle: 'tu vida en semanas',
    alertSaveFailedTitle: 'No se pudo guardar',
    alertSettingsSaveFailedMessage: 'No se pudieron guardar los ajustes. Inténtalo de nuevo.',
    alertMemoSaveFailedMessage: 'No se pudo guardar la nota. Inténtalo de nuevo.',
    commonBack: 'Volver',
    commonYears: 'años',
    commonWeeksShort: 'sem',
    commonSelect: 'Elegir',
    commonClose: 'Cerrar',
    onboardingStep: 'Paso 1 / 1',
    onboardingTitle: 'Empezar',
    onboardingDescription: 'Introduce tu fecha de nacimiento y esperanza de vida para ver la vida por semanas.',
    onboardingBirthDateLabel: 'Fecha de nacimiento',
    onboardingBirthDateHelper: 'No se pueden seleccionar fechas futuras.',
    onboardingBirthDatePlaceholder: 'Selecciona una fecha',
    onboardingLifeExpectancyLabel: 'Esperanza de vida',
    onboardingTotalWeeksLabel: 'Semanas totales estimadas',
    onboardingStart: 'Empezar Life Calendar',
    onboardingBirthDateInvalid: 'Introduce una fecha válida en formato YYYY-MM-DD.',
    onboardingBirthDateFuture: 'No se permiten fechas futuras.',
    onboardingLifeExpectancyInvalid: 'La esperanza de vida debe estar entre 1 y 120.',
    settingsTitle: 'Ajustes',
    settingsDisplay: 'Pantalla',
    settingsTheme: 'Tema',
    settingsLanguage: 'Idioma',
    settingsLife: 'Vida',
    settingsBirthDateLabel: 'Fecha de nacimiento',
    settingsBirthDateHelper: 'Los cambios recalculan la posición actual y las semanas restantes.',
    settingsBirthDatePlaceholder: 'Selecciona una fecha',
    settingsLifeExpectancyLabel: 'Esperanza de vida',
    settingsLifeNote: 'Los cambios recalculan la cuadrícula y las semanas restantes.',
    settingsThemeLight: 'Claro',
    settingsThemeDark: 'Oscuro',
    settingsBirthDateInvalid: 'Introduce una fecha válida en formato YYYY-MM-DD.',
    settingsBirthDateFuture: 'No se permiten fechas futuras.',
    settingsLifeExpectancyInvalid: 'La esperanza de vida debe estar entre 1 y 120.',
    mainLeft: 'Restan',
    mainProgress: 'Progreso',
    mainModeLife: 'Life',
    mainModeYear: 'Year',
    mainModeClock: 'Clock',
    mainClockSecond: 'Segundo',
    mainClockMinute: 'Minuto',
    mainClockHour: 'Hora',
    mainClockDay: 'Día',
    mainClockWeek: 'Semana',
    mainClockYear: 'Año',
    mainClockLife: 'Vida',
    mainMemo: 'Nota',
    mainMemoPlaceholder: 'Escribe una nota para esta semana',
    mainMemoSave: 'Guardar nota',
    mainMemoDelete: 'Borrar nota',
    mainMemoSaving: 'Guardando...',
    mainWeekTitle: (ageYear, weekOfYear) => `${weekOfYear}.a semana a los ${ageYear} años`,
  },
  hi: {
    appTitle: 'Life Calendar',
    appSubtitle: 'जीवन को हफ्तों में देखें',
    alertSaveFailedTitle: 'सहेजा नहीं जा सका',
    alertSettingsSaveFailedMessage: 'सेटिंग्स सहेजने में विफल। कृपया फिर से प्रयास करें।',
    alertMemoSaveFailedMessage: 'मेमो सहेजने में विफल। कृपया फिर से प्रयास करें।',
    commonBack: 'वापस',
    commonYears: 'वर्ष',
    commonWeeksShort: 'सप्ताह',
    commonSelect: 'चुनें',
    commonClose: 'बंद करें',
    onboardingStep: 'Step 1 / 1',
    onboardingTitle: 'शुरू करें',
    onboardingDescription: 'जन्मतिथि और अनुमानित आयु दर्ज करें, फिर जीवन को हफ्तों में देखें।',
    onboardingBirthDateLabel: 'जन्मतिथि',
    onboardingBirthDateHelper: 'भविष्य की तिथि नहीं चुनी जा सकती।',
    onboardingBirthDatePlaceholder: 'तिथि चुनें',
    onboardingLifeExpectancyLabel: 'अनुमानित आयु',
    onboardingTotalWeeksLabel: 'कुल सप्ताह का अनुमान',
    onboardingStart: 'Life Calendar शुरू करें',
    onboardingBirthDateInvalid: 'कृपया YYYY-MM-DD प्रारूप में सही जन्मतिथि दर्ज करें।',
    onboardingBirthDateFuture: 'भविष्य की तिथि दर्ज नहीं की जा सकती।',
    onboardingLifeExpectancyInvalid: 'अनुमानित आयु 1 से 120 के बीच होनी चाहिए।',
    settingsTitle: 'सेटिंग्स',
    settingsDisplay: 'डिस्प्ले',
    settingsTheme: 'थीम',
    settingsLanguage: 'भाषा',
    settingsLife: 'जीवन सेटिंग्स',
    settingsBirthDateLabel: 'जन्मतिथि',
    settingsBirthDateHelper: 'बदलाव के बाद वर्तमान स्थिति और शेष सप्ताह फिर से गणना होंगे।',
    settingsBirthDatePlaceholder: 'तिथि चुनें',
    settingsLifeExpectancyLabel: 'अनुमानित आयु',
    settingsLifeNote: 'बदलाव के बाद ग्रिड और शेष सप्ताह फिर से गणना होंगे।',
    settingsThemeLight: 'लाइट',
    settingsThemeDark: 'डार्क',
    settingsBirthDateInvalid: 'कृपया YYYY-MM-DD प्रारूप में सही जन्मतिथि दर्ज करें।',
    settingsBirthDateFuture: 'भविष्य की तिथि सेट नहीं की जा सकती।',
    settingsLifeExpectancyInvalid: 'अनुमानित आयु 1 से 120 के बीच होनी चाहिए।',
    mainLeft: 'शेष',
    mainProgress: 'प्रगति',
    mainModeLife: 'Life',
    mainModeYear: 'Year',
    mainModeClock: 'Clock',
    mainClockSecond: 'सेकंड',
    mainClockMinute: 'मिनट',
    mainClockHour: 'घंटा',
    mainClockDay: 'दिन',
    mainClockWeek: 'सप्ताह',
    mainClockYear: 'वर्ष',
    mainClockLife: 'जीवन',
    mainMemo: 'मेमो',
    mainMemoPlaceholder: 'इस सप्ताह के लिए मेमो लिखें',
    mainMemoSave: 'मेमो सहेजें',
    mainMemoDelete: 'मेमो हटाएँ',
    mainMemoSaving: 'सहेजा जा रहा है...',
    mainWeekTitle: (ageYear, weekOfYear) => `आयु ${ageYear}, सप्ताह ${weekOfYear}`,
  },
};

export function isLanguage(value: unknown): value is LanguageCode {
  return LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function getPreferredLanguage(locale = Intl.DateTimeFormat().resolvedOptions().locale) {
  const normalizedLocale = locale.toLowerCase();

  if (normalizedLocale.startsWith('ja')) {
    return 'ja' as const;
  }

  if (normalizedLocale.startsWith('zh')) {
    return 'zh' as const;
  }

  if (normalizedLocale.startsWith('es')) {
    return 'es' as const;
  }

  if (normalizedLocale.startsWith('hi')) {
    return 'hi' as const;
  }

  if (normalizedLocale.startsWith('en')) {
    return 'en' as const;
  }

  return DEFAULT_LANGUAGE;
}

export function getTranslations(language: LanguageCode) {
  return TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE];
}
