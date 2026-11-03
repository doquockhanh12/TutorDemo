import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidFlexibleProposal, isValidTimeRange, mergeAdjacentRanges } from '../src/data/tutorSchedule.js';
import { fitsSavedAvailability } from '../src/data/tutorClassSearch.js';

const day = '2026-11-09';
const range = (date, start, end, tutorId = 'tutor-a') => ({ date, start, end, tutorId });

test('availability joins touching and overlapping intervals, retaining gaps and separate dates', () => {
  const joined = mergeAdjacentRanges([
    range(day, 555, 630), range(day, 480, 555), range(day, 600, 675),
    range(day, 705, 735), range('2026-11-10', 480, 555), range(day, 480, 555, 'tutor-b'),
  ]);
  assert.deepEqual(joined, [range(day, 480, 675), range(day, 705, 735), range('2026-11-10', 480, 555), range(day, 480, 555, 'tutor-b')]);
});

test('flexible time accepts arbitrary minutes and midnight end, rejects invalid boundaries', () => {
  assert.equal(isValidTimeRange(range(day, 480, 555)), true);
  assert.equal(isValidTimeRange(range(day, 1390, 1440)), true);
  assert.equal(isValidTimeRange(range(day, 480, 480)), false);
  assert.equal(isValidTimeRange(range(day, 480, 1441)), false);
});

test('learner proposal requires exact free coverage and no overlap with another choice', () => {
  const free = [range(day, 480, 555), range(day, 555, 630), range(day, 660, 720)];
  assert.equal(isValidFlexibleProposal(range(day, 490, 620), free), true);
  assert.equal(isValidFlexibleProposal(range(day, 600, 670), free), false);
  assert.equal(isValidFlexibleProposal(range(day, 555, 600), free, [range(day, 500, 570)]), false);
});

test('a valid late proposal remains visible when it fits a saved range', () => {
  const late = range(day, 1395, 1440);
  assert.equal(fitsSavedAvailability([late], [range(day, 1380, 1440)], []), true);
});
