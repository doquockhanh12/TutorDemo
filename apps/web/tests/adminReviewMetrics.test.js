import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoState } from '../src/features/domain/demoDomain.js';
import { selectAdminStats } from '../src/features/domain/useAdminDomain.js';

test('ADM-REG-004 dashboard totals match the shared review and issue collections', () => {
  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const stats = selectAdminStats(state);
  assert.equal(stats.totalReviews, state.reviews.length);
  assert.equal(stats.totalIssues, state.issues.length);
});
