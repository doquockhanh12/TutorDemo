import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReferenceData } from '../src/data/demoReferenceData.js';
import { tutors, subjectOptions, locationOptions } from '../src/data/tutors.js';
import { overlaps } from '../src/data/tutorSchedule.js';
import { createDemoState, restoreDemoState, DOMAIN_STORAGE_KEY, updateLearnerRequest, completeDomainLesson, addLearnerRequest, decideRequest } from '../src/features/domain/demoDomain.js';
const now = new Date('2026-10-05T06:00:00+07:00');

test('SCHED-005 approved demo cleanup removes only Thursday Math and Friday evening free ranges once', () => {
  const state = createDemoState(new Date('2026-10-04T10:00:00+07:00'));
  state.lessons = state.lessons.filter((l) => !l.id.startsWith('history-'));
  const accepted = decideRequest(state, 'req-1', 'accepted', 'quoc-bao').state;
  delete accepted.appliedDemoCleanups;
  accepted.availability.push({ id: 'approved-friday-cleanup-example', tutorId: 'quoc-bao', date: '2026-10-02', start: 1095, end: 1320 });
  const restore = (value) => restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(value) : null }, now);
  const result = restore(accepted);
  assert.ok(!result.lessons.some((l) => l.requestId === 'req-1' && l.date === '2026-10-01'));
  assert.ok(result.lessons.some((l) => l.requestId === 'req-1' && l.date === '2026-09-29'));
  assert.ok(result.lessons.some((l) => l.date === '2026-10-01' && l.learner === 'Nguyễn Minh Anh'));
  assert.ok(result.lessons.some((l) => l.date === '2026-10-02' && l.subject === 'IELTS'));
  assert.ok(!result.availability.some((r) => r.tutorId === 'quoc-bao' && r.date === '2026-10-02' && r.start < 1320 && r.end > 1080));
  assert.ok(!result.requests.find((r) => r.id === 'req-1').proposals.some((p) => p.date === '2026-10-01'));
  assert.deepEqual(result.profiles, accepted.profiles);
  assert.deepEqual(result.savedByAccount, accepted.savedByAccount);
  assert.deepEqual(restore(result), result);
  // Approval is a one-time correction, not a permanent ban on later Tutor edits.
  result.availability.push({ id: 'later-tutor-edit', tutorId: 'quoc-bao', date: '2026-10-02', start: 1095, end: 1140 });
  assert.ok(restore(result).availability.some((r) => r.id === 'later-tutor-edit'));
});

test('SCHED-003 historical reconciliation removes occupied time from legacy availability without losing runtime lessons', () => {
  const state = createDemoState(new Date('2026-09-28T06:00:00+07:00'));
  state.lessons = state.lessons.filter((lesson) => !lesson.id.startsWith('history-'));
  const result = decideRequest(state, 'req-1', 'accepted', 'quoc-bao').state;
  result.availability = result.availability.filter((range) => range.date !== '2026-10-02');
  result.availability.push({ id: 'runtime-friday-range', tutorId: 'quoc-bao', date: '2026-10-02', start: 1095, end: 1320 });
  result.lessons[0].status = 'completed';
  result.lessons[0].notes = 'Keep runtime note';
  delete result.lessons[0].sessionFee;
  const persisted = JSON.stringify(result);
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? persisted : null }, now);
  assert.ok(restored.availability.every((range) => !restored.lessons.some((lesson) => lesson.status !== 'cancelled' && overlaps(range, lesson))), 'availability must be reconciled after historical lessons join');
  assert.equal(restored.lessons.find((lesson) => lesson.id === 'seed-0').notes, 'Keep runtime note');
  assert.ok(result.lessons.every((lesson) => restored.lessons.some((next) => next.id === lesson.id && next.date === lesson.date && next.status === lesson.status)));
  for (const key of ['requests', 'profiles', 'settings', 'savedByAccount', 'nextRequestNumber']) assert.deepEqual(restored[key], result[key]);
  const again = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(restored) : null }, now);
  assert.deepEqual(again, restored);
});

test('BUG-001 canonical seed clones immutable data and fixes proposals at seed time', () => {
  const state = createDemoState(now);
  assert.equal(demoReferenceData.accounts.find((a) => a.id === 'demo-tutor').username, 'giabao');
  assert.equal(state.profiles.find((t) => t.id === 'quoc-bao').accountId, 'demo-tutor');
  assert.equal(state.profiles.find((t) => t.id === 'quoc-bao').price, 220000);
  assert.ok(Object.isFrozen(demoReferenceData.requests));
  state.requests[0].goal = 'changed';
  assert.notEqual(demoReferenceData.requests[0].goal, 'changed');
  assert.ok(state.requests.find((r) => r.id === 'ref-1').proposals.every((p) => /^2026-10-/.test(p.date)));
});

test('BUG-002 learner updates cannot complete requests or edit another owner', () => {
  const state = createDemoState(now);
  const result = updateLearnerRequest(state, 'demo-learner', 'demo-02', { status: 'completed' });
  assert.equal(result.requests.find((r) => r.id === 'demo-02').status, 'accepted');
  assert.equal(updateLearnerRequest(state, 'other', 'demo-01', { status: 'cancelled' }).requests[0].status, 'pending');
  assert.equal(updateLearnerRequest(state, 'demo-learner', 'demo-01', { status: 'cancelled' }).requests[0].status, 'cancelled');
});
test('BUG-001 legacy stores migrate once without deleting or becoming the active source', () => {
  const map = new Map([['tnm.learnerRequests', JSON.stringify([{id:'legacy-created',tutorId:'quoc-bao',status:'Chờ phản hồi',proposals:[{date:'2026-10-08',start:1140,end:1185}]}])]]);
  const storage = { getItem: (key) => map.get(key) || null };
  const state = restoreDemoState(storage, now);
  assert.equal(state.requests.find((r) => r.id === 'legacy-created').learnerId, 'demo-learner');
  assert.equal(state.requests.find((r) => r.id === 'legacy-created').status, 'pending');
  assert.ok(map.has('tnm.learnerRequests'));
  map.set(DOMAIN_STORAGE_KEY, JSON.stringify(state));
  map.set('tnm.learnerRequests', '[]');
  assert.ok(restoreDemoState(storage, now).requests.some((r) => r.id === 'legacy-created'));
});

test('BUG-003 persisted requests use codes and completed lessons do not change accepted code', () => {
  const state = createDemoState(now);
  assert.ok(state.requests.every((r) => ['pending','accepted','rejected','cancelled'].includes(r.status)));
  assert.equal(state.requests.find((r) => r.id === 'demo-03').status, 'accepted');
});

test('BUG-013 directory is a canonical fixture projection rather than another identity seed', () => {
  assert.equal(tutors, demoReferenceData.tutorProfiles);
  const state = createDemoState(now);
  assert.equal(state.profiles.find((t) => t.id === 'quoc-bao').sessionMinutes, state.settings['quoc-bao'].sessionMinutes);
});

test('BUG-013 public filter options represent the canonical directory without another catalog seed', () => {
  assert.deepEqual(new Set(subjectOptions.slice(1)), new Set(tutors.flatMap((t) => t.subjects)));
  assert.deepEqual(new Set(locationOptions.slice(1)), new Set(tutors.map((t) => t.location)));
});

test('BUG-014 only confirmed/upcoming lessons belonging to the tutor can complete', () => {
  for (const status of ['confirmed','upcoming','pending','completed','cancelled']) {
    const state = createDemoState(now);
    state.lessons[0].status = status;
    assert.equal(completeDomainLesson(state, 'quoc-bao', state.lessons[0].id).lessons[0].status,
      ['confirmed','upcoming'].includes(status) ? 'completed' : status);
    assert.equal(completeDomainLesson(state, 'different-owner', state.lessons[0].id).lessons[0].status, status);
  }
});

test('INCOME seed reconciliation adds missing historical lessons once and preserves runtime records', () => {
  const initial = createDemoState(now);
  const historical = demoReferenceData.historicalLessons;
  assert.ok(Array.isArray(historical) && historical.length > 0);
  const preservedLesson = { ...historical[0], learner: 'Runtime edit wins', sessionFee: 123456 };
  const runtimeLesson = { ...initial.lessons[0], id: 'runtime-lesson-income', status: 'completed' };
  const persisted = { ...initial, lessons: [preservedLesson, runtimeLesson], requests: [{ id: 'preserved-request' }], marker: 'keep' };
  const map = new Map([[DOMAIN_STORAGE_KEY, JSON.stringify(persisted)]]);
  const storage = { getItem: (key) => map.get(key) || null };

  const restored = restoreDemoState(storage, now);
  assert.equal(restored.marker, 'keep');
  assert.deepEqual(restored.requests, persisted.requests);
  for (const key of ['profiles', 'availability', 'settings', 'savedByAccount', 'nextRequestNumber']) assert.deepEqual(restored[key], persisted[key]);
  assert.equal(restored.lessons.find((lesson) => lesson.id === preservedLesson.id).learner, 'Runtime edit wins');
  assert.equal(restored.lessons.find((lesson) => lesson.id === 'runtime-lesson-income').id, 'runtime-lesson-income');
  assert.equal(restored.lessons.filter((lesson) => historical.some((seed) => seed.id === lesson.id)).length, historical.length);

  map.set(DOMAIN_STORAGE_KEY, JSON.stringify(restored));
  const restoredAgain = restoreDemoState(storage, now);
  assert.equal(restoredAgain.lessons.length, restored.lessons.length);
  assert.equal(restoredAgain.lessons.filter((lesson) => lesson.id === preservedLesson.id).length, 1);
});

test('INCOME fresh state contains absolute historical lessons and hydrates only missing legacy seed fees', () => {
  const state = createDemoState(now);
  for (const history of demoReferenceData.historicalLessons) assert.deepEqual(state.lessons.find((l) => l.id === history.id), history);
  const lessons = state.lessons.filter((l) => l.id.startsWith('seed-'));
  delete lessons[0].sessionFee;
  lessons[0].notes = 'Preserved runtime note';
  lessons[1].sessionFee = 123456;
  lessons[2].sessionFee = null;
  state.profiles.find((p) => p.id === 'quoc-bao').price = 999999;
  const persisted = { ...state, lessons };
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(persisted) : null }, now);
  const seed = demoReferenceData.lessonTemplates.find((l) => l.id === lessons[0].id);
  assert.deepEqual(restored.lessons.find((l) => l.id === lessons[0].id), { ...lessons[0], sessionFee: seed.sessionFee });
  assert.equal(restored.lessons.find((l) => l.id === lessons[1].id).sessionFee, 123456);
  assert.equal(restored.lessons.find((l) => l.id === lessons[2].id).sessionFee, seed.sessionFee);
});

test('INCOME-001 accepted request snapshots its fee into each Lesson without profile fallback', () => {
  for (const fee of [180000, undefined]) {
    const state = createDemoState(now);
    const request = state.requests.find((r) => r.id === 'req-2');
    request.sessionFee = fee;
    state.profiles.find((p) => p.id === 'quoc-bao').price = 999999;
    const result = decideRequest(state, request.id, 'accepted', 'quoc-bao');
    assert.equal(result.error, undefined);
    const lessons = result.state.lessons.filter((l) => l.requestId === request.id);
    assert.ok(lessons.length > 0);
    assert.ok(lessons.every((l) => l.sessionFee === fee));
  }
});

test('BUG-010 submit rechecks the clock and rejects stale selections without changing state', () => {
  const state = createDemoState(now);
  const values = { tutorId:'quoc-bao', subjects:['Tiếng Anh'], levels:['THCS'], formats:['Online'],
    format:'Online', goal:state.requests[1].goal, proposals:[{date:'2026-10-06',start:1080,end:1125}] };
  const user = demoReferenceData.accounts[0];
  const valid = addLearnerRequest(state,user,values,now);
  assert.ok(valid.id);
  assert.equal(valid.state.requests.at(-1).learnerId,'demo-learner');
  assert.equal(valid.state.requests.at(-1).tutorId,'quoc-bao');
  assert.ok(addLearnerRequest(state,user,values,new Date('2026-10-06T19:00:00+07:00')).error);
  assert.equal(state.requests.length,9);
});
