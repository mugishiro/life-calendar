import type { ViewMode } from '../types';

export const VIEW_MODES: ViewMode[] = ['life', 'year'];

export function isViewMode(value: unknown): value is ViewMode {
  return value === 'life' || value === 'year';
}

export function normalizeViewMode(value: unknown): ViewMode {
  return value === 'year' ? 'year' : 'life';
}
