import test from 'node:test';
import assert from 'node:assert/strict';
import { findSubjects, subjectById } from '../src/data/subjectCatalog.js';
import {
  createDemoState,
  decideRequest,
  confirmLearnerRequest,
  restoreDemoState,
  DOMAIN_STORAGE_KEY,
  sortRequestsFifo,
  countWords,
  validateWordLimit,
  MAX_REVIEW_WORDS,
  updateLearnerRequest,
  updateClassStatus,
  saveClassTutorNotes,
  addClassSessionLog,
  updateClassSessionAttendance,
  deleteClassSessionLog,
  applyPublicClassPost,
} from '../src/features/domain/demoDomain.js';
import { buildPublicOpenClassPosts } from '../src/data/tutorClassSearch.js';
import { requestLabel, requestStatusMetadata } from '../src/features/domain/statusMetadata.js';
import { clampBirthDateInput, validateBirthDate, BIRTH_DATE_MIN, BIRTH_DATE_MAX } from '../src/features/auth/authUtils.js';

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

test('restore reconciles complete prior acceptance once and preserves accepted requests without reverse learner confirmation', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const state = createDemoState(now);
  state.requests.find((item) => item.id === 'req-2').status = 'pending_learner_confirmation';
  const storage = { getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(state) : null };
  const restored = restoreDemoState(storage, now);
  assert.equal(restored.requests.find((item) => item.id === 'req-2').status, 'accepted');
  assert.equal(restored.lessons.filter((lesson) => lesson.requestId === 'req-2').length, 1);
  assert.equal(restored.classes.filter((item) => item.requestId === 'req-2').length, 1);
  assert.equal(restored.lessons.filter((lesson) => lesson.requestId === 'demo-02').length, 0);
  assert.equal(restored.requests.find((item) => item.id === 'demo-02').status, 'accepted');
  assert.equal(restored.requests.find((item) => item.id === 'demo-02').reconciliationError, undefined);
  assert.equal(requestLabel(restored.requests.find((item) => item.id === 'demo-02'), 'tutor'), 'Đã nhận');
  assert.equal('pending_learner_confirmation' in requestStatusMetadata, false);
  assert.equal('needs_revision' in requestStatusMetadata, false);
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
  assert.equal(old.status, 'accepted');
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

test('reconciliation drops a mismatched class linked to the wrong tutor without setting needs_revision', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const accepted = decideRequest(createDemoState(now), 'req-2', 'accepted', 'quoc-bao').state;
  accepted.classes.find((item) => item.requestId === 'req-2').tutorId = 'other-tutor';
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(accepted) : null }, now);
  const request = restored.requests.find((item) => item.id === 'req-2');
  assert.equal(request.status, 'accepted');
  assert.equal(request.classId, null);
  assert.equal(restored.classes.some((item) => item.requestId === 'req-2'), false);
});

test('sortRequestsFifo orders class requests ascending by createdAt / created_at (FIFO)', () => {
  const items = [
    { id: 'r-late', createdAt: '2026-10-04T16:00:00+07:00' },
    { id: 'r-early', createdAt: '2026-10-03T10:00:00+07:00' },
    { id: 'r-mid', created_at: '2026-10-04T12:00:00+07:00' },
  ];
  assert.deepEqual(sortRequestsFifo(items).map((item) => item.id), ['r-early', 'r-mid', 'r-late']);

  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const tutorPending = sortRequestsFifo(state.requests.filter((r) => r.tutorId === 'quoc-bao' && r.status === 'pending'));
  assert.equal(tutorPending[0].id, 'req-3');
  assert.equal(tutorPending.at(-1).id, 'ref-1');
});

test('birthDate validation enforces 4-digit year within 1900..2100 and clamps >4-digit years', () => {
  assert.equal(BIRTH_DATE_MIN, '1900-01-01');
  assert.equal(BIRTH_DATE_MAX, '2100-12-31');
  assert.equal(clampBirthDateInput('343234-03-21'), '3432-03-21');
  assert.equal(clampBirthDateInput('+034323-03-21'), '0343-03-21');
  assert.equal(validateBirthDate(''), '');
  assert.equal(validateBirthDate('2000-05-12'), '');
  assert.equal(validateBirthDate('1900-01-01'), '');
  assert.equal(validateBirthDate('2100-12-31'), '');
  assert.match(validateBirthDate('343234-03-21'), /1900/);
  assert.match(validateBirthDate('1899-12-31'), /1900/);
  assert.match(validateBirthDate('2101-01-01'), /2100/);
  assert.match(validateBirthDate('2026-02-30'), /không hợp lệ/);
});

test('review and reply word limit enforces max 200 words', () => {
  assert.equal(MAX_REVIEW_WORDS, 200);
  const twoHundredWords = Array.from({ length: 200 }, (_, i) => `tu${i + 1}`).join(' ');
  const twoHundredOneWords = `${twoHundredWords} them`;
  assert.equal(countWords(''), 0);
  assert.equal(countWords(twoHundredWords), 200);
  assert.equal(countWords(twoHundredOneWords), 201);
  assert.equal(validateWordLimit(twoHundredWords), '');
  assert.match(validateWordLimit(twoHundredOneWords), /200 từ/);

  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const rejectedOverLimit = updateLearnerRequest(state, 'demo-learner', 'demo-03', { rating: 5, review: twoHundredOneWords });
  assert.equal(rejectedOverLimit.requests.find((r) => r.id === 'demo-03').review, undefined);

  const acceptedWithinLimit = updateLearnerRequest(state, 'demo-learner', 'demo-03', { rating: 5, review: twoHundredWords });
  assert.equal(acceptedWithinLimit.requests.find((r) => r.id === 'demo-03').review, twoHundredWords);
});

test('class management domain actions update status, tutor notes, and session attendance logs', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  let state = createDemoState(now);
  state = decideRequest(state, 'req-2', 'accepted', 'quoc-bao').state;

  // 1. Update class status to completed (and cannot revert back to ongoing)
  state = updateClassStatus(state, 'quoc-bao', 'req-2', 'completed');
  assert.equal(state.classes.find((c) => c.id === 'req-2').classStatus, 'completed');
  assert.equal(state.requests.find((r) => r.id === 'req-2').classStatus, 'completed');
  const revertedAttempt = updateClassStatus(state, 'quoc-bao', 'req-2', 'ongoing');
  assert.equal(revertedAttempt.classes.find((c) => c.id === 'req-2').classStatus, 'completed');

  // 2. Save tutor notes
  state = saveClassTutorNotes(state, 'quoc-bao', 'req-2', 'Học viên tiếp thu nhanh phần mạch điện.');
  assert.equal(state.classes.find((c) => c.id === 'req-2').tutorNotes, 'Học viên tiếp thu nhanh phần mạch điện.');

  // 3. Add a new session log
  const added = addClassSessionLog(state, 'quoc-bao', 'req-2', {
    date: '2026-10-12',
    start: 1080,
    end: 1170,
    status: 'completed',
    notes: 'Giải bài tập định luật Ohm.',
  });
  assert.equal(added.error, undefined);
  state = added.state;
  assert.ok(state.lessons.some((l) => l.id === added.lesson.id && l.notes === 'Giải bài tập định luật Ohm.'));

  // 4. Quick attendance update: 1 completed + 1 cancelled => total=2, completed=1 (50%), classStatus='ongoing'
  state = updateClassSessionAttendance(state, 'quoc-bao', added.lesson.id, { status: 'cancelled', notes: 'Học viên xin nghỉ có phép.' });
  const updatedLesson = state.lessons.find((l) => l.id === added.lesson.id);
  assert.equal(updatedLesson.status, 'cancelled');
  assert.equal(updatedLesson.notes, 'Học viên xin nghỉ có phép.');
  assert.equal(state.classes.find((c) => c.id === 'req-2').classStatus, 'ongoing');

  // 5. Mark second session as completed => 2/2 completed (100%), classStatus='completed'
  state = updateClassSessionAttendance(state, 'quoc-bao', added.lesson.id, { status: 'completed' });
  assert.equal(state.classes.find((c) => c.id === 'req-2').classStatus, 'completed');

  // 6. Delete a session log => removes the session cleanly
  const countBeforeDelete = state.lessons.filter((l) => l.classId === 'req-2' || l.requestId === 'req-2').length;
  state = deleteClassSessionLog(state, 'quoc-bao', added.lesson.id);
  const countAfterDelete = state.lessons.filter((l) => l.classId === 'req-2' || l.requestId === 'req-2').length;
  assert.equal(countAfterDelete, countBeforeDelete - 1);
  assert.equal(state.lessons.some((l) => l.id === added.lesson.id), false);
});

test('public student posts in /tutor/find-students are independent from /tutor/requests and can be applied to create a class', () => {
  const now = new Date('2026-10-05T06:00:00+07:00');
  const state = createDemoState(now);
  const directRequestIds = new Set(state.requests.map((r) => r.id));
  const publicPosts = buildPublicOpenClassPosts();
  assert.ok(publicPosts.length >= 4);
  assert.ok(publicPosts.every((post) => !directRequestIds.has(post.id)));

  const applied = applyPublicClassPost(state, 'quoc-bao', publicPosts[0]);
  assert.equal(applied.error, undefined);
  assert.ok(applied.state.classes.some((c) => c.id === publicPosts[0].id));
  assert.equal(applied.state.requests.length, state.requests.length);
});
