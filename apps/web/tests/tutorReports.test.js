import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoState, restoreDemoState, DOMAIN_STORAGE_KEY } from '../src/features/domain/demoDomain.js';
import { submitTutorReport } from '../src/features/domain/tutorReports.js';
import { selectAdminIssues } from '../src/features/domain/useAdminDomain.js';

const now = new Date('2026-11-15T09:00:00+07:00');
const setup = () => {
  const state = createDemoState(now);
  return { state, actor: state.users.find((item) => item.id === 'demo-learner') };
};
test('Profile report is persisted in shared issues and projected with exact reporter/target/evidence', () => {
  const { state, actor } = setup();
  const before = structuredClone(state);
  const evidence = [{ kind: 'file', name: 'evidence.png', type: 'image/png', data: 'data:image/png;base64,aGVsbG8=' }];
  const result = submitTutorReport(state, actor, { tutorId: 'quoc-bao', reason: 'misleading', description: 'Thông tin giới thiệu chưa khớp.', evidence }, now);
  assert.ok(result.id);
  assert.deepEqual(state, before);
  const restored = restoreDemoState({ getItem: (key) => key === DOMAIN_STORAGE_KEY ? JSON.stringify(result.state) : null }, now);
  const issue = selectAdminIssues(restored).find((item) => item.id === result.id);
  assert.equal(issue.reporter.id, actor.id);
  assert.equal(issue.targetUser.id, 'demo-tutor');
  assert.equal(issue.relatedTutor.id, 'quoc-bao');
  assert.equal(issue.requestId, null);
  assert.equal(issue.evidence[0].data, evidence[0].data);
  assert.equal(issue.reasonLabel, 'Thông tin giới thiệu có dấu hiệu sai lệch');
});
test('Request reasons require the actor-owned matching request, regardless of pending/completed status', () => {
  const { state, actor } = setup();
  for (const requestId of ['demo-01', 'demo-03']) {
    const req = state.requests.find((item) => item.id === requestId);
    assert.ok(submitTutorReport(state, actor, { tutorId: req.tutorId, requestId, reason: 'absence' }, now).id);
    assert.ok(submitTutorReport(state, actor, { tutorId: 'wrong-tutor', requestId, reason: 'absence' }, now).error);
  }
  assert.ok(submitTutorReport(state, actor, { tutorId: 'quoc-bao', reason: 'absence' }, now).error);
  assert.ok(submitTutorReport(state, { ...actor, id: 'another-learner' }, { tutorId: 'mai-anh', requestId: 'demo-01', reason: 'other', description: 'Chi tiết' }, now).error);
});
test('Missing profile keeps the request tutor ID rather than falling back to another tutor', () => {
  const { state, actor } = setup();
  state.requests.find((item) => item.id === 'demo-01').tutorId = 'missing-tutor';
  const result = submitTutorReport(state, actor, { tutorId: 'missing-tutor', requestId: 'demo-01', reason: 'other', description: 'Hồ sơ không còn hiển thị' }, now);
  assert.equal(result.state.issues[0].tutorId, 'missing-tutor');
  assert.equal(result.state.issues[0].targetUser.id, 'missing-tutor');
});
test('Required reason/Other description, image limits and actor permissions are enforced without mutations', () => {
  const { state, actor } = setup();
  const valid = { tutorId: 'quoc-bao', reason: 'other', description: 'Mô tả sự việc' };
  for (const patch of [{ reason: '' }, { reason: 'toString' }, { description: '  ' }, { evidence: [{ kind: 'file', type: 'application/pdf' }] }, { evidence: Array(4).fill({ kind: 'file', type: 'image/png' }) }, { evidence: [{ kind: 'file', type: 'image/png', name: 'large.png', data: `data:image/png;base64,${'a'.repeat(700000)}` }] }]) {
    assert.ok(submitTutorReport(state, actor, { ...valid, ...patch }, now).error);
  }
  assert.ok(submitTutorReport(state, { ...actor, role: 'tutor' }, valid, now).error);
  assert.ok(submitTutorReport(state, { ...actor, appealOnly: true }, valid, now).error);
  const a = submitTutorReport(state, actor, valid, now);
  const b = submitTutorReport(a.state, actor, valid, now);
  assert.notEqual(a.id, b.id);
});
