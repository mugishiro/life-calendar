import assert from 'node:assert/strict';
import test from 'node:test';

import { VIEW_MODES, isViewMode, normalizeViewMode } from './viewMode';

test('VIEW_MODES exposes only the visible MVP tabs', () => {
  assert.deepEqual(VIEW_MODES, ['life', 'year']);
});

test('isViewMode accepts only supported modes', () => {
  assert.equal(isViewMode('life'), true);
  assert.equal(isViewMode('year'), true);
  assert.equal(isViewMode('felt'), false);
  assert.equal(isViewMode('clock'), false);
});

test('normalizeViewMode migrates legacy and invalid values to life', () => {
  assert.equal(normalizeViewMode('life'), 'life');
  assert.equal(normalizeViewMode('year'), 'year');
  assert.equal(normalizeViewMode('felt'), 'life');
  assert.equal(normalizeViewMode('unknown'), 'life');
});
