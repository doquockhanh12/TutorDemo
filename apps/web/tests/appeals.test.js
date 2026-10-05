import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoState, restoreDemoState, DOMAIN_STORAGE_KEY } from '../src/features/domain/demoDomain.js';
import { accountHistory, issueTargetId, submitAppeal, reviewAppeal, selectAppeals } from '../src/features/domain/appeals.js';

const now = new Date('2026-10-05T08:00:00+07:00');
const seed = () => createDemoState(now);
const input = { issueId: 'ISSUE-105', reason: 'misunderstanding', content: 'Tôi đề nghị đối chiếu lại trao đổi và nội dung buổi học.', evidence: [{ kind: 'link', url: 'https://example.org/proof', description: 'Bản trao đổi trong buổi học cần đối chiếu.' }], truthful: true };

test('Appeals history resolves account/profile IDs and lists both sent reports and warnings without inventing data', () => {
  const state = seed();
  assert.equal(issueTargetId(state, state.issues.find(i => i.id === 'ISSUE-102')), 'demo-tutor');
  const tutor = accountHistory(state, 'demo-tutor');
  assert.equal(tutor.warnings[0].reason, state.users.find(u => u.id === 'demo-tutor').warnings[0].reason);
  assert.equal(tutor.warningCount, 1);
  assert.equal(tutor.reports.length, 0);
  const learner = accountHistory(state, 'demo-learner');
  assert.equal(learner.reports.length, state.issues.filter(i => i.reportedBy?.id === 'demo-learner').length);
  assert.equal(learner.warningCount, 0);
});

test('Appeals require target ownership, substantive content, evidence and truth declaration at the domain boundary', () => {
  const state = seed(); const tutor = state.users.find(u => u.id === 'demo-tutor');
  assert.ok(submitAppeal(state, tutor, { ...input, content: '' }, now).error);
  assert.ok(submitAppeal(state, tutor, { ...input, evidence: [] }, now).error);
  assert.ok(submitAppeal(state, tutor, { ...input, truthful: false }, now).error);
  assert.ok(submitAppeal(state, tutor, { ...input, evidence: [{ kind: 'link', url: 'javascript:alert(1)', description: 'Thông tin đối chiếu.' }] }, now).error);
  assert.ok(submitAppeal(state, state.users.find(u => u.id === 'demo-learner'), input, now).error);
  assert.ok(submitAppeal(state, tutor, { ...input, issueId: 'unknown' }, now).error);
});

test('Appeals share one persisted entity across user/admin, preserve state, reject duplicate pending submissions and require review reasons', () => {
  const state = seed(); const tutor = state.users.find(u => u.id === 'demo-tutor'); const admin = state.users.find(u => u.role === 'admin');
  const created = submitAppeal(state, tutor, input, now);
  assert.ok(created.id); assert.equal(created.state.appeals.length, 1);
  assert.equal(state.appeals?.length || 0, 0);
  assert.deepEqual(created.state.lessons, state.lessons);
  assert.ok(submitAppeal(created.state, tutor, input, now).error);
  assert.equal(selectAppeals(created.state, tutor)[0].id, selectAppeals(created.state, admin)[0].id);
  assert.equal(selectAppeals(created.state, state.users.find(u => u.id === 'demo-learner')).length, 0);
  assert.ok(reviewAppeal(created.state, tutor, created.id, 'accepted', 'Đã đối chiếu', now).error);
  assert.ok(reviewAppeal(created.state, admin, created.id, 'accepted', '', now).error);
  const result = reviewAppeal(created.state, admin, created.id, 'accepted', 'Chấp nhận giải trình sau khi đối chiếu bằng chứng.', now);
  assert.equal(result.state.appeals[0].status, 'accepted');
  // Review does not silently revoke a warning or lift suspension with no approved policy.
  assert.deepEqual(result.state.users, state.users);
  const restored = restoreDemoState({ getItem: key => key === DOMAIN_STORAGE_KEY ? JSON.stringify(result.state) : null }, now);
  assert.deepEqual(restored.appeals, result.state.appeals);
});

test('Appeals also accept a real local image evidence payload, reject oversized/unsupported data and retain warning history', () => {
  const state = seed(); const tutor = state.users.find(u => u.id === 'demo-tutor');
  const file = { kind: 'file', name: 'proof.png', type: 'image/png', data: 'data:image/png;base64,aGVsbG8=', description: 'Ảnh chụp trao đổi.' };
  assert.ok(submitAppeal(state, tutor, { ...input, evidence: [file] }, now).id);
  assert.ok(submitAppeal(state, tutor, { ...input, evidence: [{ ...file, data: 'data:text/html;base64,aGVsbG8=' }] }, now).error);
  assert.ok(submitAppeal(state, tutor, { ...input, evidence: [{ ...file, data: 'data:image/png;base64,' + 'A'.repeat(800000) }] }, now).error);
});
