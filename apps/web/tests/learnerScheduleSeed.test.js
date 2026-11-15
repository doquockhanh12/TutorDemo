import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoState, restoreDemoState, DOMAIN_STORAGE_KEY, requestIsCompleted } from '../src/features/domain/demoDomain.js';

const referenceDate = new Date('2026-11-14T21:00:00+07:00');
const storageFor = (state) => ({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(state) : null });

test('Learner dated demo has two completed and four future sessions in the existing ongoing class', () => {
  const state = createDemoState(referenceDate);
  const request = state.requests.find((item) => item.id === 'demo-02');
  const lessons = state.lessons.filter((lesson) => lesson.requestId === request.id && lesson.id.startsWith('demo-02-lesson-'));
  assert.equal(lessons.length, 6);
  assert.equal(lessons.filter((lesson) => lesson.status === 'completed').length, 2);
  assert.equal(requestIsCompleted(state, request), false);
  for (const lesson of lessons) {
    assert.equal(lesson.learnerId, request.learnerId);
    assert.equal(lesson.tutorId, request.tutorId);
    assert.equal(lesson.subject, request.subject);
    assert.equal(lesson.sessionFee, request.sessionFee);
    assert.equal(new Date(`${lesson.date}T12:00:00`).getDay(), 6);
    assert.equal(lesson.start, 540);
    assert.equal(lesson.end, 585);
    if (lesson.status === 'completed') assert.ok(new Date(lesson.completedAt) < referenceDate);
    else {
      assert.equal(lesson.status, 'confirmed');
      assert.ok(new Date(`${lesson.date}T09:00:00+07:00`) > referenceDate);
      assert.equal(lesson.completedAt, undefined);
    }
  }
});

test('Learner schedule refresh reconciles old state once and preserves runtime edits', () => {
  const old = createDemoState(referenceDate);
  old.lessons = old.lessons.filter((lesson) => !lesson.id.startsWith('demo-02-lesson-'));
  old.requests.find((item) => item.id === 'demo-02').schedule = 'Thứ 7, 18/10 · 09:00–10:30';
  const restored = restoreDemoState(storageFor(old), referenceDate);
  assert.equal(restored.lessons.filter((lesson) => lesson.requestId === 'demo-02').length, 7);
  assert.equal(restored.requests.find((item) => item.id === 'demo-02').schedule, 'Thứ 7 · 09:00–09:45');
  restored.requests.find((item) => item.id === 'demo-02').schedule = 'User edited schedule';
  restored.lessons.find((lesson) => lesson.id === 'demo-02-lesson-2026-11-21').status = 'cancelled';
  const again = restoreDemoState(storageFor(restored), referenceDate);
  assert.deepEqual(again.requests, restored.requests);
  assert.deepEqual(again.lessons, restored.lessons);
});
