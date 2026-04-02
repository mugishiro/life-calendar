import type { ThemeMode } from './types';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    mutedText: string;
    primary: string;
    primaryText: string;
    past: string;
    current: string;
    future: string;
    memo: string;
    outline: string;
    inputBackground: string;
    shadow: string;
  };
}

const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceMuted: '#f3f5f7',
    border: '#e3e8ee',
    text: '#182026',
    mutedText: '#6f7c88',
    primary: '#3f7f68',
    primaryText: '#f7fbf8',
    past: '#9cb7ae',
    current: '#ea7b55',
    future: '#e9eef3',
    memo: '#2f6fed',
    outline: '#d3dbe3',
    inputBackground: '#f7f9fb',
    shadow: 'rgba(24, 32, 38, 0.06)',
  },
};

const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#161819',
    surface: '#1d2123',
    surfaceMuted: '#24292c',
    border: '#344147',
    text: '#f0ece6',
    mutedText: '#b5b0a8',
    primary: '#7ca88f',
    primaryText: '#132018',
    past: '#6f8f80',
    current: '#f08c63',
    future: '#2a3236',
    memo: '#4fc3ff',
    outline: '#4a5a60',
    inputBackground: '#202527',
    shadow: 'rgba(0, 0, 0, 0.26)',
  },
};

export function getTheme(mode: ThemeMode): AppTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
