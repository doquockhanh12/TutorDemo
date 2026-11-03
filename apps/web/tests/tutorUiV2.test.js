import test from 'node:test';
import assert from 'node:assert/strict';
import { findSubjects, subjectById } from '../src/data/subjectCatalog.js';
import { createDemoState, decideRequest, confirmLearnerRequest, restoreDemoState, DOMAIN_STORAGE_KEY } from '../src/features/domain/demoDomain.js';

test('subject search resolves accent-insensitive keywords without merging parent and child IDs', () => {
  const ai = findSubjects('AI').find((item) => item.name === 'Trí tuệ nhân tạo (AI)');
  const ml = findSubjects('machine learning').find((item) => item.name === 'Machine Learning');
  assert.equal(ml.parentId, ai.id);
  assert.notEqual(ml.id, ai.id);
  assert.ok(findSubjects('mĩ thuật').some((item) => item.name === 'Vẽ / Hội họa'));
  assert.ok(findSubjects('duong cam').some((item) => item.name === 'Piano'));
  assert.equal(subjectById(ml.id).name, 'Machine Learning');
});

test('tutor acceptance creates one linked class and lessons immediately', () => {
  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const request = state.requests.find((item) => item.id === 'req-2');
  request.learnerId = 'demo-learner';
  const decision = decideRequest(state, request.id, 'accepted', request.tutorId);
  assert.equal(decision.error, undefined);
  const lessons = decision.state.lessons.filter((item) => item.requestId === request.id);
  assert.equal(lessons.length, 1);
  assert.equal(lessons[0].classId, request.id);
  assert.equal(decision.state.requests.find((item) => item.id === request.id).status, 'accepted');
  assert.equal(decision.state.requests.find((item) => item.id === request.id).classId, request.id);
  assert.equal(decision.state.classes.find((item) => item.id === request.id).requestId, request.id);
  assert.equal(decideRequest(decision.state, request.id, 'accepted', request.tutorId).state.classes.length, 1);
  assert.ok(confirmLearnerRequest(decision.state, 'demo-learner', request.id).error);
});

test('acceptance rejects missing terms, wrong tutor and a conflicting slot without creating lessons', () => {
  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const request = state.requests.find((item) => item.id === 'req-2');
  assert.ok(decideRequest(state, request.id, 'accepted', 'other-tutor').error);
  const missingFee = structuredClone(state);
  missingFee.requests.find((item) => item.id === request.id).sessionFee = undefined;
  assert.match(decideRequest(missingFee, request.id, 'accepted', request.tutorId).error, /học phí/);
  const conflicting = structuredClone(state);
  conflicting.lessons.push({ id: 'collision', tutorId: request.tutorId, date: request.proposals[0].date, start: request.proposals[0].start, end: request.proposals[0].end, status: 'confirmed' });
  assert.match(decideRequest(conflicting, request.id, 'accepted', request.tutorId).error, /trùng/);
  assert.equal(state.lessons.filter((lesson) => lesson.requestId === request.id).length, 0);
});

test('restore reconciles complete prior acceptance once and preserves incomplete requests', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const state = createDemoState(now);
  state.requests.find((item) => item.id === 'req-2').status = 'pending_learner_confirmation';
  const storage = { getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(state) : null };
  const restored = restoreDemoState(storage, now);
  assert.equal(restored.requests.find((item) => item.id === 'req-2').status, 'accepted');
  assert.equal(restored.lessons.filter((lesson) => lesson.requestId === 'req-2').length, 1);
  assert.equal(restored.classes.filter((item) => item.requestId === 'req-2').length, 1);
  assert.equal(restored.lessons.filter((lesson) => lesson.requestId === 'demo-02').length, 0);
  assert.equal(restored.requests.find((item) => item.id === 'demo-02').status, 'needs_revision');
  assert.match(restored.requests.find((item) => item.id === 'demo-02').reconciliationError, /hình thức/);
  const again = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(restored) : null }, now);
  assert.equal(again.lessons.filter((lesson) => lesson.requestId === 'req-2').length, 1);
  assert.equal(again.classes.filter((item) => item.requestId === 'req-2').length, 1);
});

test('two different accepted requests create two classes and repeat acceptance is idempotent after restore', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const first = decideRequest(createDemoState(now), 'req-1', 'accepted', 'quoc-bao');
  assert.equal(first.error, undefined);
  const second = decideRequest(first.state, 'req-2', 'accepted', 'quoc-bao');
  assert.equal(second.error, undefined);
  const repeated = decideRequest(second.state, 'req-1', 'accepted', 'quoc-bao');
  assert.equal(repeated.state.classes.length, 2);
  assert.equal(repeated.state.lessons.length, second.state.lessons.length);
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(repeated.state) : null }, now);
  for (const id of ['req-1', 'req-2']) {
    assert.equal(restored.classes.filter((item) => item.requestId === id).length, 1);
    assert.equal(restored.requests.find((item) => item.id === id).classId, id);
    assert.ok(restored.lessons.some((item) => item.classId === id));
  }
});

test('rejection never creates a class or lesson', () => {
  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const result = decideRequest(state, 'req-1', 'rejected', 'quoc-bao');
  assert.equal(result.state.requests.find((item) => item.id === 'req-1').status, 'rejected');
  assert.equal(result.state.classes.some((item) => item.requestId === 'req-1'), false);
  assert.equal(result.state.lessons.some((item) => item.requestId === 'req-1'), false);
});

test('an incomplete old acceptance can reconcile later when its original terms are supplied', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const state = createDemoState(now);
  const old = state.requests.find((item) => item.id === 'demo-02');
  assert.equal(old.status, 'needs_revision');
  const available = state.requests.find((item) => item.id === 'req-2').proposals[0];
  old.format = 'Online';
  old.proposals = [{ ...available }];
  const storage = { getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(state) : null };
  const restored = restoreDemoState(storage, now);
  assert.equal(restored.requests.find((item) => item.id === old.id).status, 'accepted');
  assert.equal(restored.classes.filter((item) => item.requestId === old.id).length, 1);
  assert.equal(restored.lessons.filter((item) => item.requestId === old.id).length, 1);
});

test('reconciliation relinks an existing class by requestId without making a duplicate', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const accepted = decideRequest(createDemoState(now), 'req-2', 'accepted', 'quoc-bao').state;
  accepted.requests.find((item) => item.id === 'req-2').classId = null;
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(accepted) : null }, now);
  assert.equal(restored.requests.find((item) => item.id === 'req-2').classId, 'req-2');
  assert.equal(restored.classes.filter((item) => item.requestId === 'req-2').length, 1);
});

test('reconciliation flags a class linked to the wrong tutor instead of accepting it', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const accepted = decideRequest(createDemoState(now), 'req-2', 'accepted', 'quoc-bao').state;
  accepted.classes.find((item) => item.requestId === 'req-2').tutorId = 'other-tutor';
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(accepted) : null }, now);
  const request = restored.requests.find((item) => item.id === 'req-2');
  assert.equal(request.status, 'needs_revision');
  assert.match(request.reconciliationError, /không khớp gia sư/);
});
