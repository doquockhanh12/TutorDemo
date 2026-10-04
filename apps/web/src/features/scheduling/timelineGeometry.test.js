import test from 'node:test';
import assert from 'node:assert/strict';
import * as geometry from './timelineGeometry.js';
import {
  TIMELINE_START,
  TIMELINE_END,
  COLLAPSED_HOUR_HEIGHT,
  EXPANDED_HOUR_HEIGHT,
  hourHeight,
  minuteToY,
  yToMinute,
  minuteSnap,
} from './timelineGeometry.js';

test('SCHED-004 collision lanes preserve every block and handle chains, adjacent times and short rendered blocks', () => {
  for (const expanded of [null, 12]) {
    const blocks = [
      { id: 'a', start: 1080, end: 1125 }, { id: 'b', start: 1095, end: 1185 },
      { id: 'c', start: 1125, end: 1200 }, { id: 'd', start: 1200, end: 1205 },
      { id: 'e', start: 1205, end: 1210 },
    ];
    const result = geometry.layoutDayBlocks(blocks, expanded);
    assert.equal(result.length, blocks.length);
    for (const block of result) {
      assert.deepEqual(blocks.find((item) => item.id === block.id), { id: block.id, start: block.start, end: block.end });
      for (const other of result) {
        if (other.id === block.id || other.layout.lane !== block.layout.lane) continue;
        assert.ok(block.layout.top + block.layout.height <= other.layout.top || other.layout.top + other.layout.height <= block.layout.top);
      }
    }
    assert.equal(result.find((b) => b.id === 'a').layout.laneCount, 2);
  }
});

test('timeline uses 72px collapsed hours and expands one hour to 240px', () => {
  assert.equal(TIMELINE_START, 360);
  assert.equal(TIMELINE_END, 1440);
  assert.equal(COLLAPSED_HOUR_HEIGHT, 72);
  assert.equal(EXPANDED_HOUR_HEIGHT, 240);
  assert.equal(hourHeight(12, null), 72);
  assert.equal(hourHeight(12, 12), 240);
  assert.equal(hourHeight(11, 12), 72);
});

test('minute-to-y and y-to-minute invert each other in collapsed and expanded layouts', () => {
  for (const expanded of [null, 12]) {
    for (const minute of [360, 390, 720, 1080, 1117.5, 1440]) {
      assert.ok(Math.abs(yToMinute(minuteToY(minute, expanded), expanded) - minute) < 1e-9);
    }
  }
});

test('expanded hours snap to five minutes while collapsed hours snap to ten', () => {
  assert.equal(minuteSnap(1083, 12), 1085);
  assert.equal(minuteSnap(1086, 12), 1085);
  assert.equal(minuteSnap(1023, null), 1020);
  assert.equal(minuteSnap(1026, null), 1030);
});
