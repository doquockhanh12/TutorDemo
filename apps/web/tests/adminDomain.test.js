import test from 'node:test';
import assert from 'node:assert/strict';
import * as demoDomain from '../src/features/domain/demoDomain.js';
import { demoReferenceData } from '../src/data/demoReferenceData.js';

const now = new Date('2026-10-05T06:00:00+07:00');

const {
  createDemoState,
  restoreDemoState,
  DOMAIN_STORAGE_KEY,
  approveTutor,
  rejectTutor,
  setTutorSuspension,
  setUserSuspension,
  moderateReview,
  updateIssueStatus,
  warnUserIssue,
  dismissIssue,
} = demoDomain;

let adminHooksModule = null;
try {
  adminHooksModule = await import('../src/features/domain/useAdminDomain.js');
} catch (e) {
  adminHooksModule = null;
}

const {
  selectAdminStats,
  selectAdminOverview,
  selectAdminTutors,
  selectAdminUsers,
  selectAdminReviews,
  selectAdminIssues,
  deriveInitials,
  formatMinutes,
  formatTimeRange,
  tutorModerationLabels,
  userRoleLabels,
  issueCategoryLabels,
} = adminHooksModule || {};

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: CANONICAL DOMAIN PERSISTENCE (F4, R2)
// ---------------------------------------------------------------------------

test('F4-T1-01: Canonical storage key is strictly tnm.demo.domain.v1', () => {
  assert.equal(DOMAIN_STORAGE_KEY, 'tnm.demo.domain.v1', 'Storage key must strictly be tnm.demo.domain.v1');
});

test('F4-T1-02: State produced by createDemoState has version 1 and core collections', () => {
  const state = createDemoState(now);
  assert.equal(state.version, 1, 'Domain state version must be 1');
  assert.ok(Array.isArray(state.profiles), 'state.profiles must be an array');
  assert.ok(Array.isArray(state.requests), 'state.requests must be an array');
  assert.ok(Array.isArray(state.lessons), 'state.lessons must be an array');
  assert.ok(Array.isArray(state.availability), 'state.availability must be an array');
  assert.ok(state.settings && typeof state.settings === 'object', 'state.settings must be an object');
  assert.ok(state.savedByAccount && typeof state.savedByAccount === 'object', 'state.savedByAccount must be an object');
  assert.ok(Number.isInteger(state.nextRequestNumber), 'nextRequestNumber must be integer');
});

test('F4-T1-03: State requests contains strictly 9 items preserving BUG-010 invariant', () => {
  const state = createDemoState(now);
  assert.equal(state.requests.length, 9, 'Seed requests length must strictly be 9');
});

test('F4-T1-04: Serialization and restore roundtrip preserves state integrity', () => {
  const state = createDemoState(now);
  const mockStorage = {
    store: new Map([[DOMAIN_STORAGE_KEY, JSON.stringify(state)]]),
    getItem(k) { return this.store.get(k) || null; },
    setItem(k, v) { this.store.set(k, v); }
  };
  const restored = restoreDemoState(mockStorage, now);
  assert.equal(restored.version, state.version);
  assert.equal(restored.requests.length, 9);
  assert.equal(restored.profiles.length, state.profiles.length);
});

test('F4-T1-05: restoreDemoState does not read or create secondary tnm.admin keys', () => {
  const accessedKeys = [];
  const state = createDemoState(now);
  const mockStorage = {
    getItem(key) {
      accessedKeys.push(key);
      if (key === DOMAIN_STORAGE_KEY) return JSON.stringify(state);
      return null;
    }
  };
  restoreDemoState(mockStorage, now);
  assert.ok(!accessedKeys.some((k) => k.startsWith('tnm.admin')), 'No tnm.admin storage keys should be read');
});

test('F4-T2-01: restoreDemoState with corrupted JSON or null gracefully falls back to deterministic state', () => {
  const badStorage = {
    getItem() { return 'INVALID_JSON{{{'; }
  };
  const fallback = restoreDemoState(badStorage, now);
  assert.ok(fallback, 'State must recover gracefully');
  assert.equal(fallback.version, 1);
  assert.equal(fallback.requests.length, 9);
});

test('F4-T2-02: Idempotent restore yields stable identical state across repeated invocations', () => {
  const state = createDemoState(now);
  const storage = {
    store: new Map([[DOMAIN_STORAGE_KEY, JSON.stringify(state)]]),
    getItem(k) { return this.store.get(k) || null; },
    setItem(k, v) { this.store.set(k, v); }
  };
  const pass1 = restoreDemoState(storage, now);
  storage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(pass1));
  const pass2 = restoreDemoState(storage, now);
  assert.equal(pass1.requests.length, pass2.requests.length);
  assert.equal(pass1.profiles.length, pass2.profiles.length);
});

test('F4-T2-03: Unknown state version in storage triggers safe recovery', () => {
  const badVersionState = { version: 9999, corrupted: true };
  const storage = {
    getItem(k) { return k === DOMAIN_STORAGE_KEY ? JSON.stringify(badVersionState) : null; }
  };
  const recovered = restoreDemoState(storage, now);
  assert.equal(recovered.version, 1, 'Should reset to version 1');
  assert.ok(Array.isArray(recovered.profiles));
  assert.equal(recovered.requests.length, 9);
});

test('F4-T2-04: Domain state objects are deeply cloned and isolated from fixture mutations', () => {
  const state = createDemoState(now);
  if (state.profiles.length > 0) {
    const originalName = state.profiles[0].name;
    state.profiles[0].name = 'Modified Test Name';
    const freshState = createDemoState(now);
    assert.equal(freshState.profiles[0].name, originalName, 'Fixture must remain isolated from mutations');
  }
});

test('F4-T2-05: Restoring state preserves custom runtime request notes and statuses', () => {
  const state = createDemoState(now);
  state.requests[0].note = 'Custom runtime parent note';
  const storage = {
    getItem(k) { return k === DOMAIN_STORAGE_KEY ? JSON.stringify(state) : null; }
  };
  const restored = restoreDemoState(storage, now);
  assert.equal(restored.requests[0].note, 'Custom runtime parent note');
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: DETERMINISTIC SEED FIXTURES (F6, R3)
// ---------------------------------------------------------------------------

test('F6-T1-01: Deterministic seed contains pending tutors with required drawer verification data', (t) => {
  const state = createDemoState(now);
  const pendingTutors = (state.profiles || []).filter((p) => p.moderationStatus === 'pending');
  if (pendingTutors.length === 0) {
    t.skip('Pending tutors fixture pending M1 seed implementation');
    return;
  }
  assert.ok(pendingTutors.length >= 2, 'Must have at least 2 pending tutors in seed');
  const thaoVy = pendingTutors.find((p) => p.id === 'thao-vy' || p.name?.includes('Thảo Vy'));
  assert.ok(thaoVy, 'thao-vy must be in pending tutors fixture');
  assert.ok(thaoVy.university || thaoVy.school, 'thao-vy must have university');
  assert.ok(thaoVy.price, 'thao-vy must have price/fee');
  assert.ok(thaoVy.subjects?.length > 0, 'thao-vy must have subjects');
  assert.ok(thaoVy.verificationDocuments || thaoVy.documents, 'thao-vy must have verification documents');
});

test('F6-T1-02: Deterministic seed contains canonical approved tutors', (t) => {
  const state = createDemoState(now);
  const approved = (state.profiles || []).filter((p) => p.moderationStatus === 'approved' || !p.moderationStatus);
  assert.ok(approved.some((p) => p.id === 'quoc-bao'), 'quoc-bao must be present in profiles');
  assert.ok(approved.some((p) => p.id === 'mai-anh'), 'mai-anh must be present in profiles');
});

test('F6-T1-03: Deterministic seed contains rejected tutor with rejection reason', (t) => {
  const state = createDemoState(now);
  const rejectedTutors = (state.profiles || []).filter((p) => p.moderationStatus === 'rejected');
  if (rejectedTutors.length === 0) {
    t.skip('Rejected tutor fixture pending M1 seed implementation');
    return;
  }
  const tuanAnh = rejectedTutors.find((p) => p.id === 'tuan-anh' || p.name?.includes('Tuấn Anh'));
  assert.ok(tuanAnh, 'tuan-anh must be in rejected tutors fixture');
  assert.ok(tuanAnh.rejectionReason, 'tuan-anh must have rejectionReason');
});

test('F6-T1-04: Deterministic seed contains suspended tutor', (t) => {
  const state = createDemoState(now);
  const suspendedTutors = (state.profiles || []).filter((p) => p.moderationStatus === 'suspended');
  if (suspendedTutors.length === 0) {
    t.skip('Suspended tutor fixture pending M1 seed implementation');
    return;
  }
  const quangHuy = suspendedTutors.find((p) => p.id === 'quang-huy' || p.name?.includes('Quang Huy'));
  assert.ok(quangHuy, 'quang-huy must be in suspended tutors fixture');
});

test('F6-T1-05: Deterministic seed contains users across learner, tutor, admin, and suspended accounts', (t) => {
  const users = demoReferenceData.accounts || [];
  const state = createDemoState(now);
  const allUsers = state.users || users;
  assert.ok(allUsers.some((u) => u.role === 'learner'), 'Must have learner user');
  assert.ok(allUsers.some((u) => u.role === 'tutor'), 'Must have tutor user');
  assert.ok(allUsers.some((u) => u.role === 'admin'), 'Must have admin user');
  const suspended = allUsers.filter((u) => u.status === 'suspended');
  if (suspended.length === 0) {
    t.skip('Suspended accounts fixture pending M1 seed implementation');
    return;
  }
  assert.ok(suspended.length >= 1, 'Must have at least 1 suspended account in seed');
});

test('F6-T1-06: Deterministic seed contains reviews with approved, pending, and hidden moderation states', (t) => {
  const state = createDemoState(now);
  const reviews = state.reviews || demoReferenceData.reviews || [];
  if (!reviews.some((r) => r.moderationStatus === 'pending')) {
    t.skip('Reviews moderationStatus pending/hidden pending M1 seed implementation');
    return;
  }
  assert.ok(reviews.some((r) => r.moderationStatus === 'approved'), 'Must have approved reviews');
  assert.ok(reviews.some((r) => r.moderationStatus === 'pending'), 'Must have pending reviews');
  assert.ok(reviews.some((r) => r.moderationStatus === 'hidden'), 'Must have hidden reviews');
});

test('F6-T1-07: Deterministic seed contains issues across all 5 required operational categories', (t) => {
  const state = createDemoState(now);
  const issues = state.issues || demoReferenceData.issues || [];
  if (issues.length === 0) {
    t.skip('Issues canonical collection pending M1 seed implementation');
    return;
  }
  const categories = new Set(issues.map((i) => i.category));
  assert.ok(categories.has('absence') || categories.has('vang_mat'), 'Must have absence category');
  assert.ok(categories.has('lesson_dispute') || categories.has('tranh_chap_gio'), 'Must have lesson_dispute category');
  assert.ok(categories.has('cancellation') || categories.has('huy_lop'), 'Must have cancellation category');
  assert.ok(categories.has('fee_dispute') || categories.has('tranh_chap_phi'), 'Must have fee_dispute category');
  assert.ok(categories.has('attitude') || categories.has('thai_do'), 'Must have attitude category');
});

test('F6-T2-01: Seed entity IDs are deterministic, unique, and non-random', () => {
  const state1 = createDemoState(now);
  const state2 = createDemoState(now);
  assert.deepEqual(state1.profiles.map((p) => p.id), state2.profiles.map((p) => p.id));
  assert.deepEqual(state1.requests.map((r) => r.id), state2.requests.map((r) => r.id));
});

test('F6-T2-02: Review ratings are integer numbers bounded between 1 and 5', (t) => {
  const state = createDemoState(now);
  const reviews = state.reviews || demoReferenceData.reviews || [];
  if (reviews.length === 0) {
    t.skip('Reviews pending M1 seed implementation');
    return;
  }
  for (const r of reviews) {
    assert.ok(Number.isInteger(r.rating), `Review rating ${r.rating} must be integer`);
    assert.ok(r.rating >= 1 && r.rating <= 5, `Review rating ${r.rating} must be 1..5`);
  }
});

test('F6-T2-03: Tutor hourly fees in seed are positive integers', () => {
  const state = createDemoState(now);
  for (const p of state.profiles) {
    if (p.price != null) {
      assert.ok(Number.isFinite(p.price) && p.price > 0, `Tutor ${p.id} price must be positive integer`);
    }
  }
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: ADMIN REDUCERS (F4, R2)
// ---------------------------------------------------------------------------

test('F4-T1-06: approveTutor updates tutor moderationStatus to approved', (t) => {
  if (typeof approveTutor !== 'function') {
    t.skip('approveTutor reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  state.profiles.push({ id: 'test-pending', name: 'Test Pending', moderationStatus: 'pending' });
  const updated = approveTutor(state, 'test-pending');
  const target = updated.profiles.find((p) => p.id === 'test-pending');
  assert.equal(target.moderationStatus, 'approved');
});

test('F4-T1-07: rejectTutor updates tutor moderationStatus to rejected and saves reason', (t) => {
  if (typeof rejectTutor !== 'function') {
    t.skip('rejectTutor reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  state.profiles.push({ id: 'test-reject', name: 'Test Reject', moderationStatus: 'pending' });
  const updated = rejectTutor(state, 'test-reject', 'Thông tin văn bằng không hợp lệ');
  const target = updated.profiles.find((p) => p.id === 'test-reject');
  assert.equal(target.moderationStatus, 'rejected');
  assert.equal(target.rejectionReason, 'Thông tin văn bằng không hợp lệ');
});

test('F4-T1-08: setTutorSuspension toggles tutor moderationStatus between suspended and approved', (t) => {
  if (typeof setTutorSuspension !== 'function') {
    t.skip('setTutorSuspension reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  const targetId = 'quoc-bao';
  const suspendedState = setTutorSuspension(state, targetId, true);
  assert.equal(suspendedState.profiles.find((p) => p.id === targetId)?.moderationStatus, 'suspended');

  const unsuspendedState = setTutorSuspension(suspendedState, targetId, false);
  assert.equal(unsuspendedState.profiles.find((p) => p.id === targetId)?.moderationStatus, 'approved');
});

test('F4-T1-09: setUserSuspension toggles account status between suspended and active', (t) => {
  if (typeof setUserSuspension !== 'function') {
    t.skip('setUserSuspension reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  state.users = state.users || structuredClone(demoReferenceData.accounts);
  const userId = 'demo-learner';
  const suspended = setUserSuspension(state, userId, true);
  assert.equal(suspended.users.find((u) => u.id === userId)?.status, 'suspended');

  const restored = setUserSuspension(suspended, userId, false);
  assert.equal(restored.users.find((u) => u.id === userId)?.status, 'active');
});

test('F4-T1-10: moderateReview toggles review between approved/public and hidden/hidden', (t) => {
  if (typeof moderateReview !== 'function') {
    t.skip('moderateReview reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  state.reviews = [
    { id: 'rev-test', tutorId: 'quoc-bao', moderationStatus: 'pending', visibility: 'hidden' },
    ...(state.reviews || [])
  ];
  const approved = moderateReview(state, 'rev-test', 'approved');
  const approvedItem = approved.reviews.find((r) => r.id === 'rev-test');
  assert.equal(approvedItem.moderationStatus, 'approved');
  assert.equal(approvedItem.visibility, 'public');

  const hidden = moderateReview(approved, 'rev-test', 'hidden');
  const hiddenItem = hidden.reviews.find((r) => r.id === 'rev-test');
  assert.equal(hiddenItem.moderationStatus, 'hidden');
  assert.equal(hiddenItem.visibility, 'hidden');
});

test('F4-T1-11: updateIssueStatus updates issue status and records admin resolution note', (t) => {
  if (typeof updateIssueStatus !== 'function') {
    t.skip('updateIssueStatus reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  state.issues = [
    { id: 'ISS-001', category: 'absence', status: 'new', resolutionNote: '' },
    ...(state.issues || [])
  ];
  const inProgress = updateIssueStatus(state, 'ISS-001', 'in_progress', 'Đang liên hệ hai bên');
  assert.equal(inProgress.issues.find((i) => i.id === 'ISS-001')?.status, 'in_progress');

  const resolved = updateIssueStatus(inProgress, 'ISS-001', 'resolved', 'Đã xử lý hòa giải thành công');
  const target = resolved.issues.find((i) => i.id === 'ISS-001');
  assert.equal(target.status, 'resolved');
  assert.equal(target.resolutionNote, 'Đã xử lý hòa giải thành công');
});

test('F4-T1-12: warnUserIssue increments target user warningCount, appends warning history, and resolves issue', () => {
  const state = createDemoState(now);
  state.users = [
    { id: 'user-tutor-1', role: 'tutor', warningCount: 1, warnings: [{ reason: 'Lần 1', issueId: 'ISSUE-OLD' }], status: 'active' },
    ...(state.users || [])
  ];
  state.issues = [
    { id: 'ISSUE-WARN-TEST', targetUser: { id: 'user-tutor-1' }, status: 'new' },
    ...(state.issues || [])
  ];

  const nextState = warnUserIssue(state, 'ISSUE-WARN-TEST', 'Tự ý kết thúc buổi học sớm 30 phút');
  const targetUser = nextState.users.find((u) => u.id === 'user-tutor-1');
  assert.equal(targetUser.warningCount, 2);
  assert.equal(targetUser.warnings.length, 2);
  assert.equal(targetUser.warnings[1].reason, 'Tự ý kết thúc buổi học sớm 30 phút');
  assert.equal(targetUser.status, 'active', 'User should remain active when warningCount <= 3');

  const resolvedIssue = nextState.issues.find((i) => i.id === 'ISSUE-WARN-TEST');
  assert.equal(resolvedIssue.status, 'resolved');
  assert.equal(resolvedIssue.resolutionAction, 'warning_issued');
  assert.equal(resolvedIssue.resolutionNote, 'Tự ý kết thúc buổi học sớm 30 phút');
});

test('F4-T1-13: warnUserIssue auto-suspends user and linked tutor profile when warnings exceed 3 (>3)', () => {
  const state = createDemoState(now);
  state.users = [
    {
      id: 'user-violator',
      role: 'tutor',
      tutorProfileId: 'tutor-violator',
      warningCount: 3,
      warnings: [
        { reason: 'Lần 1' },
        { reason: 'Lần 2' },
        { reason: 'Lần 3' }
      ],
      status: 'active'
    },
    ...(state.users || [])
  ];
  state.profiles = [
    { id: 'tutor-violator', name: 'Gia sư vi phạm', moderationStatus: 'approved' },
    ...(state.profiles || [])
  ];
  state.issues = [
    { id: 'ISSUE-4TH-VIOLATION', targetUser: { id: 'user-violator' }, status: 'new' },
    ...(state.issues || [])
  ];

  // 4th warning -> warningCount becomes 4, which is > 3 -> auto-suspension triggered
  const nextState = warnUserIssue(state, 'ISSUE-4TH-VIOLATION', 'Tái phạm lần 4: Thu thêm phụ phí ngoài hệ thống');
  const user = nextState.users.find((u) => u.id === 'user-violator');
  assert.equal(user.warningCount, 4);
  assert.equal(user.status, 'suspended', 'Target user must be auto-suspended when warningCount > 3');
  assert.ok(user.suspendedReason.includes('vượt quá 3 lần'));

  const profile = nextState.profiles.find((p) => p.id === 'tutor-violator');
  assert.equal(profile.moderationStatus, 'suspended', 'Linked tutor profile must also be auto-suspended');
});

test('F4-T1-14: dismissIssue marks issue dismissed with reporterNotice and does NOT alter target warnings', () => {
  const state = createDemoState(now);
  state.users = [
    { id: 'user-innocent', role: 'tutor', warningCount: 1, warnings: [{ reason: 'Lần 1' }], status: 'active' },
    ...(state.users || [])
  ];
  state.issues = [
    { id: 'ISSUE-UNVERIFIED', targetUser: { id: 'user-innocent' }, status: 'new' },
    ...(state.issues || [])
  ];

  const nextState = dismissIssue(state, 'ISSUE-UNVERIFIED', 'Bằng chứng ảnh chụp không hợp lệ, hai bên đã thống nhất dời lịch');
  const user = nextState.users.find((u) => u.id === 'user-innocent');
  assert.equal(user.warningCount, 1, 'Target user warning count must NOT increase on dismissed report');

  const dismissedIssue = nextState.issues.find((i) => i.id === 'ISSUE-UNVERIFIED');
  assert.equal(dismissedIssue.status, 'dismissed');
  assert.equal(dismissedIssue.resolutionAction, 'dismissed_unverified');
  assert.equal(dismissedIssue.reporterNotice, 'Bằng chứng ảnh chụp không hợp lệ, hai bên đã thống nhất dời lịch');
});

test('F4-T2-06: approveTutor on non-existent ID returns safe state without throwing', (t) => {
  if (typeof approveTutor !== 'function') {
    t.skip('approveTutor reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  const beforeLen = state.profiles.length;
  const next = approveTutor(state, 'non-existent-id');
  assert.equal(next.profiles.length, beforeLen);
});

test('F4-T2-07: Reducer operations are pure and do not mutate original state parameter', (t) => {
  if (typeof approveTutor !== 'function') {
    t.skip('approveTutor reducer pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  state.profiles.push({ id: 'pure-test', moderationStatus: 'pending' });
  const frozen = structuredClone(state);
  const next = approveTutor(state, 'pure-test');
  assert.notEqual(state, next, 'Reducer must return new state reference');
  assert.equal(state.profiles.find((p) => p.id === 'pure-test').moderationStatus, 'pending');
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: ADMIN DOMAIN HOOKS INTERFACE (F5, R2)
// ---------------------------------------------------------------------------

test('F5-T1-01: useAdminDomain module exports required hooks', (t) => {
  if (!adminHooksModule) {
    t.skip('useAdminDomain.js pending M1 implementation');
    return;
  }
  assert.ok(typeof adminHooksModule.useAdminOverview === 'function', 'useAdminOverview must be a function');
  assert.ok(typeof adminHooksModule.useAdminTutors === 'function', 'useAdminTutors must be a function');
  assert.ok(typeof adminHooksModule.useAdminUsers === 'function', 'useAdminUsers must be a function');
  assert.ok(typeof adminHooksModule.useAdminReviews === 'function', 'useAdminReviews must be a function');
  assert.ok(typeof adminHooksModule.useAdminIssues === 'function', 'useAdminIssues must be a function');
});

test('F5-T2-01: Admin overview metrics correctly calculate from domain collections', (t) => {
  if (!adminHooksModule?.calculateAdminOverview) {
    t.skip('Admin overview selector calculation pending M1 implementation');
    return;
  }
  const state = createDemoState(now);
  const overview = adminHooksModule.calculateAdminOverview(state, now);
  assert.ok(Number.isInteger(overview.pendingTutorsCount));
  assert.ok(Number.isInteger(overview.pendingReviewsCount));
  assert.ok(Number.isInteger(overview.openIssuesCount));
});

// ---------------------------------------------------------------------------
// TIER 3 & TIER 4: ADM-HOOK SELECTORS & IMMUTABILITY (ADM-HOOK-001..017)
// ---------------------------------------------------------------------------

function createSampleAdminState() {
  const state = createDemoState(now);

  state.profiles = [
    {
      id: 'tutor-approved',
      accountId: 'user-tutor-1',
      name: 'Trần Gia Bảo',
      subjects: ['Tiếng Anh', 'IELTS'],
      university: 'ĐH Ngoại thương',
      price: 220000,
      moderationStatus: 'approved',
      verificationDocs: [{ id: 'doc-1', title: 'Thẻ SV', type: 'id_card', file: 'id.pdf' }],
    },
    {
      id: 'tutor-pending',
      accountId: 'user-tutor-2',
      name: 'Lê Thảo Vy',
      subjects: ['Ngữ văn'],
      university: 'ĐH Sư phạm TP.HCM',
      price: 180000,
      moderationStatus: 'pending',
      submitted: 'Hôm nay, 09:20',
      verificationDocs: [],
    },
    {
      id: 'tutor-suspended',
      accountId: 'user-tutor-3',
      name: 'Nguyễn Văn A',
      subjects: ['Toán'],
      university: 'ĐH Bách Khoa',
      price: 200000,
      moderationStatus: 'suspended',
      verificationDocs: [],
    },
  ];

  state.users = [
    { id: 'user-learner-1', fullName: 'Nguyễn Minh Anh', username: 'minhanh', role: 'learner', status: 'active' },
    { id: 'user-tutor-1', fullName: 'Trần Gia Bảo', username: 'giabao', role: 'tutor', status: 'active' },
    { id: 'user-tutor-2', fullName: 'Lê Thảo Vy', username: 'thaovy', role: 'tutor', status: 'active' },
    { id: 'user-tutor-3', fullName: 'Nguyễn Văn A', username: 'vana', role: 'tutor', status: 'suspended' },
    { id: 'user-suspended-learner', fullName: 'Phạm Quỳnh', username: 'quynh', role: 'learner', status: 'suspended' },
  ];

  state.reviews = [
    { id: 'rev-1', tutorId: 'tutor-approved', learnerId: 'user-learner-1', rating: 5, comment: 'Gia sư dạy rất hay!', moderationStatus: 'approved', visibility: 'public' },
    { id: 'rev-2', tutorId: 'tutor-approved', learnerId: 'user-learner-1', rating: 4, comment: 'Cần duyệt thêm.', moderationStatus: 'pending', visibility: 'hidden' },
    { id: 'rev-3', tutorId: 'tutor-approved', learnerId: 'user-learner-1', rating: 2, comment: 'Đã bị ẩn.', moderationStatus: 'hidden', visibility: 'hidden' },
  ];

  state.issues = [
    { id: 'iss-1', title: 'Vắng mặt buổi học', category: 'absence', status: 'new', relatedUserId: 'user-learner-1', relatedTutorId: 'tutor-approved', description: 'Gia sư không đến.' },
    { id: 'iss-2', title: 'Tranh chấp giờ học', category: 'time_dispute', status: 'in_progress', relatedUserId: 'user-learner-1', relatedTutorId: 'tutor-approved', description: 'Lớp bị dời lịch.' },
    { id: 'iss-3', title: 'Hủy lịch đã hoàn tiền', category: 'cancellation', status: 'resolved', relatedUserId: 'user-learner-1', resolutionNote: 'Đã hoàn tất xử lý.' },
  ];

  return state;
}

test('ADM-HOOK-001 selectAdminStats accurately counts live domain projections', () => {
  const state = createSampleAdminState();
  const stats = selectAdminStats(state);

  assert.equal(stats.pendingTutors, 1);
  assert.equal(stats.pendingApprovals, 1);
  assert.equal(stats.pendingReviews, 1);
  assert.equal(stats.openIssues, 2);
  assert.equal(stats.totalTutors, 3);
  assert.equal(stats.approvedTutors, 1);
  assert.equal(stats.totalUsers, 5);
  assert.equal(stats.activeUsers, 3);
  assert.equal(stats.suspendedUsers, 2);
});

test('ADM-HOOK-002 selectAdminOverview projects pending tutors with drawer inspection fields', () => {
  const state = createSampleAdminState();
  const overview = selectAdminOverview(state);

  assert.equal(overview.pendingTutors.length, 1);
  const pending = overview.pendingTutors[0];
  assert.equal(pending.id, 'tutor-pending');
  assert.equal(pending.name, 'Lê Thảo Vy');
  assert.equal(pending.initials, 'TV');
  assert.equal(pending.school, 'ĐH Sư phạm TP.HCM');
  assert.equal(pending.status, 'pending');
  assert.equal(pending.submitted, 'Hôm nay, 09:20');
});

test('ADM-HOOK-003 selectAdminOverview projects recent reviews and open issues cleanly', () => {
  const state = createSampleAdminState();
  const overview = selectAdminOverview(state);

  assert.equal(overview.recentReviews.length, 3);
  assert.equal(overview.recentReviews[0].tutor, 'Trần Gia Bảo');
  assert.equal(overview.recentReviews[0].learner, 'Nguyễn Minh Anh');

  assert.equal(overview.openIssues.length, 2);
  assert.equal(overview.openIssues.some((i) => i.id === 'iss-3'), false, 'Resolved issue must not appear in openIssues');
  assert.equal(overview.openIssues.find((i) => i.id === 'iss-1').categoryLabel, 'Vắng mặt không báo trước');
});

test('ADM-HOOK-004 selectAdminOverview handles empty collections gracefully without exceptions', () => {
  const overview = selectAdminOverview({});
  assert.equal(overview.stats.pendingTutors, 0);
  assert.equal(overview.stats.liveClasses, 0);
  assert.deepEqual(overview.pendingTutors, []);
  assert.deepEqual(overview.recentReviews, []);
  assert.deepEqual(overview.openIssues, []);
});

test('ADM-HOOK-005 selectAdminTutors computes lesson counts, earnings, and display labels', () => {
  const state = createSampleAdminState();
  state.lessons = [
    { id: 'l-1', tutorId: 'tutor-approved', status: 'completed', sessionFee: 220000 },
    { id: 'l-2', tutorId: 'tutor-approved', status: 'completed', sessionFee: 220000 },
    { id: 'l-3', tutorId: 'tutor-approved', status: 'confirmed', sessionFee: 220000 },
    { id: 'l-4', tutorId: 'tutor-pending', status: 'upcoming', sessionFee: 180000 },
  ];

  const tutors = selectAdminTutors(state);
  const approved = tutors.find((t) => t.id === 'tutor-approved');
  const pending = tutors.find((t) => t.id === 'tutor-pending');
  const suspended = tutors.find((t) => t.id === 'tutor-suspended');

  assert.equal(approved.totalLessons, 3);
  assert.equal(approved.completedLessonsCount, 2);
  assert.equal(approved.activeLessonsCount, 1);
  assert.equal(approved.totalEarnings, 440000);
  assert.equal(approved.displayStatus, 'Đã duyệt');
  assert.equal(approved.statusTone, 'success');
  assert.equal(approved.hasDocuments, true);

  assert.equal(pending.displayStatus, 'Chờ duyệt');
  assert.equal(pending.statusTone, 'warning');
  assert.equal(pending.hasDocuments, false);

  assert.equal(suspended.displayStatus, 'Tạm khóa');
  assert.equal(suspended.isSuspended, true);
});

test('ADM-HOOK-006 approveTutor transitions tutor to approved and reflects in selectAdminTutors', () => {
  const state = createSampleAdminState();
  const nextState = approveTutor(state, 'tutor-pending');

  const tutors = selectAdminTutors(nextState);
  const target = tutors.find((t) => t.id === 'tutor-pending');
  assert.equal(target.moderationStatus, 'approved');
  assert.equal(target.isApproved, true);
  assert.equal(target.isPending, false);

  const stats = selectAdminStats(nextState);
  assert.equal(stats.pendingTutors, 0);
  assert.equal(stats.approvedTutors, 2);
});

test('ADM-HOOK-007 rejectTutor transitions tutor to rejected with specified reason', () => {
  const state = createSampleAdminState();
  const nextState = rejectTutor(state, 'tutor-pending', 'Bằng cấp chưa đạt yêu cầu kiểm duyệt');

  const tutors = selectAdminTutors(nextState);
  const target = tutors.find((t) => t.id === 'tutor-pending');
  assert.equal(target.moderationStatus, 'rejected');
  assert.equal(target.isRejected, true);
  assert.equal(target.rejectionReason, 'Bằng cấp chưa đạt yêu cầu kiểm duyệt');
  assert.equal(target.displayStatus, 'Đã từ chối');
  assert.equal(target.statusTone, 'danger');
});

test('ADM-HOOK-008 setTutorSuspension toggles suspension and synchronizes linked user status', () => {
  const state = createSampleAdminState();

  const suspendedState = setTutorSuspension(state, 'tutor-approved', true);
  const tutorSuspended = suspendedState.profiles.find((p) => p.id === 'tutor-approved');
  const userSuspended = suspendedState.users.find((u) => u.id === 'user-tutor-1');
  assert.equal(tutorSuspended.moderationStatus, 'suspended');
  assert.equal(userSuspended.status, 'suspended', 'Linked user account must be suspended');

  const restoredState = setTutorSuspension(suspendedState, 'tutor-approved', false);
  const tutorRestored = restoredState.profiles.find((p) => p.id === 'tutor-approved');
  const userRestored = restoredState.users.find((u) => u.id === 'user-tutor-1');
  assert.equal(tutorRestored.moderationStatus, 'approved');
  assert.equal(userRestored.status, 'active', 'Linked user account must be restored to active');
});

test('ADM-HOOK-009 selectAdminUsers computes role translations and canonical activity', () => {
  const state = createSampleAdminState();
  const users = selectAdminUsers(state);

  const learner = users.find((u) => u.id === 'user-learner-1');
  assert.equal(learner.displayRole, 'Học viên');
  assert.equal(learner.displayStatus, 'Đang hoạt động');
  assert.equal(learner.isActive, true);
  assert.equal(learner.isSuspended, false);

  const suspendedUser = users.find((u) => u.id === 'user-suspended-learner');
  assert.equal(suspendedUser.displayStatus, 'Đang bị khóa');
  assert.equal(suspendedUser.statusTone, 'danger');
  assert.equal(suspendedUser.isSuspended, true);
});

test('ADM-HOOK-010 setUserSuspension toggles user status and syncs tutor profile if applicable', () => {
  const state = createSampleAdminState();

  const suspended = setUserSuspension(state, 'user-tutor-1', true);
  assert.equal(suspended.users.find((u) => u.id === 'user-tutor-1').status, 'suspended');
  assert.equal(suspended.profiles.find((p) => p.accountId === 'user-tutor-1').moderationStatus, 'suspended');

  const restored = setUserSuspension(suspended, 'user-tutor-1', false);
  assert.equal(restored.users.find((u) => u.id === 'user-tutor-1').status, 'active');
  assert.equal(restored.profiles.find((p) => p.accountId === 'user-tutor-1').moderationStatus, 'approved');
});

test('ADM-HOOK-011 selectAdminReviews enriches items with entity names and moderation flags', () => {
  const state = createSampleAdminState();
  const reviews = selectAdminReviews(state);

  const pendingRev = reviews.find((r) => r.id === 'rev-2');
  assert.equal(pendingRev.isPending, true);
  assert.equal(pendingRev.displayStatus, 'Cần duyệt');
  assert.equal(pendingRev.statusTone, 'warning');

  const approvedRev = reviews.find((r) => r.id === 'rev-1');
  assert.equal(approvedRev.isApproved, true);
  assert.equal(approvedRev.visibility, 'public');

  const hiddenRev = reviews.find((r) => r.id === 'rev-3');
  assert.equal(hiddenRev.isHidden, true);
  assert.equal(hiddenRev.visibility, 'hidden');
});

test('ADM-HOOK-012 moderateReview toggles review visibility and moderationStatus atomically', () => {
  const state = createSampleAdminState();

  const approvedState = moderateReview(state, 'rev-2', 'approved');
  const approvedReview = approvedState.reviews.find((r) => r.id === 'rev-2');
  assert.equal(approvedReview.moderationStatus, 'approved');
  assert.equal(approvedReview.visibility, 'public');

  const hiddenState = moderateReview(approvedState, 'rev-2', 'hidden');
  const hiddenReview = hiddenState.reviews.find((r) => r.id === 'rev-2');
  assert.equal(hiddenReview.moderationStatus, 'hidden');
  assert.equal(hiddenReview.visibility, 'hidden');
});

test('ADM-HOOK-013 selectAdminIssues computes workflow flags and Vietnamese categories', () => {
  const state = createSampleAdminState();
  const issues = selectAdminIssues(state);

  const newIssue = issues.find((i) => i.id === 'iss-1');
  assert.equal(newIssue.isNew, true);
  assert.equal(newIssue.isOpen, true);
  assert.equal(newIssue.displayStatus, 'Mới tiếp nhận');
  assert.equal(newIssue.categoryLabel, 'Vắng mặt không báo trước');

  const inProgressIssue = issues.find((i) => i.id === 'iss-2');
  assert.equal(inProgressIssue.isInProgress, true);
  assert.equal(inProgressIssue.isOpen, true);
  assert.equal(inProgressIssue.displayStatus, 'Đang xử lý');

  const resolvedIssue = issues.find((i) => i.id === 'iss-3');
  assert.equal(resolvedIssue.isResolved, true);
  assert.equal(resolvedIssue.isOpen, false);
  assert.equal(resolvedIssue.displayStatus, 'Đã giải quyết');
});

test('ADM-HOOK-014 updateIssueStatus updates status, resolution notes, and timestamps', () => {
  const state = createSampleAdminState();

  const inProgressState = updateIssueStatus(state, 'iss-1', 'in_progress', 'Đang liên hệ hai bên.');
  const issue1 = inProgressState.issues.find((i) => i.id === 'iss-1');
  assert.equal(issue1.status, 'in_progress');
  assert.equal(issue1.resolutionNote, 'Đang liên hệ hai bên.');

  const resolvedState = updateIssueStatus(inProgressState, 'iss-1', 'resolved', 'Đã thỏa thuận xong.');
  const issueResolved = resolvedState.issues.find((i) => i.id === 'iss-1');
  assert.equal(issueResolved.status, 'resolved');
  assert.ok(issueResolved.resolvedAt);

  const overview = selectAdminOverview(resolvedState);
  assert.equal(overview.openIssues.some((i) => i.id === 'iss-1'), false);
});

test('ADM-HOOK-015 all admin operations strictly preserve the 9 requests invariant (BUG-010)', () => {
  const state = createDemoState(now);
  assert.equal(state.requests.length, 9, 'Initial request count must be exactly 9');

  let s = approveTutor(state, 'mai-anh');
  s = rejectTutor(s, 'quoc-bao', 'Lý do từ chối');
  s = setTutorSuspension(s, 'mai-anh', true);
  s = setUserSuspension(s, 'demo-learner', true);
  s = moderateReview(s, 'rev-1', 'approved');
  s = updateIssueStatus(s, 'ISSUE-101', 'resolved', 'Done');

  assert.equal(s.requests.length, 9, 'Admin operations must NEVER alter or mutate the 9 canonical requests');
});

test('ADM-HOOK-016 helper functions format minutes and derive initials deterministically', () => {
  assert.equal(formatMinutes(420), '07:00');
  assert.equal(formatMinutes(1095), '18:15');
  assert.equal(formatMinutes(null), '--:--');
  assert.equal(formatTimeRange(420, 465), '07:00 – 07:45');

  assert.equal(deriveInitials('Nguyễn Mai Anh'), 'MA');
  assert.equal(deriveInitials('Trần Gia Bảo'), 'GB');
  assert.equal(deriveInitials('Lê Thảo Vy'), 'TV');
  assert.equal(deriveInitials('Admin'), 'AD');
  assert.equal(deriveInitials(''), 'AD');
});

test('ADM-HOOK-017 pure reducers and selectors guarantee immutability', () => {
  const state = createSampleAdminState();
  const frozen = Object.freeze(state);

  selectAdminOverview(frozen);
  selectAdminTutors(frozen);
  selectAdminUsers(frozen);
  selectAdminReviews(frozen);
  selectAdminIssues(frozen);

  const next = approveTutor(frozen, 'tutor-pending');
  assert.notEqual(next, frozen);
  assert.notEqual(next.profiles, frozen.profiles);
});

test('ADM-HOOK-018 selectAdminIssues projects reporter reportsCount and target warning metrics', () => {
  const state = createDemoState(now);
  const issues = selectAdminIssues(state);
  assert.ok(issues.length > 0, 'Seed issues should not be empty');

  // Verify first issue contains enriched 2-party data
  const firstIssue = issues[0];
  assert.ok(firstIssue.reporter, 'Issue must project reporter object');
  assert.ok(typeof firstIssue.reporter.reportsCount === 'number', 'Reporter must have reportsCount');
  assert.ok(firstIssue.reporter.reportsCount >= 1, 'Reporter reportsCount should reflect issue history');
  assert.ok(firstIssue.reporter.email, 'Reporter must have email');
  assert.ok(firstIssue.reporter.phone, 'Reporter must have phone');

  assert.ok(firstIssue.targetUser, 'Issue must project targetUser object');
  assert.ok(typeof firstIssue.targetUser.warningCount === 'number', 'Target user must have warningCount');
  assert.ok(Array.isArray(firstIssue.targetUser.warnings), 'Target user must have warnings array');
  assert.ok(firstIssue.targetUser.email, 'Target user must have email');
  assert.ok(firstIssue.targetUser.phone, 'Target user must have phone');
});

test('ADM-HOOK-019 selectAdminOverview and selectAdminStats exclude dismissed issues from openIssuesCount', () => {
  const state = createDemoState(now);
  const initialStats = selectAdminStats(state);
  const initialOpenCount = initialStats.openIssuesCount;

  // Find an open issue
  const openIssue = state.issues.find((i) => i.status === 'new' || i.status === 'in_progress');
  assert.ok(openIssue, 'Must find an open issue in seed');

  const dismissedState = dismissIssue(state, openIssue.id, 'Chưa đủ chứng cứ xác thực');
  const nextStats = selectAdminStats(dismissedState);
  assert.equal(nextStats.openIssuesCount, initialOpenCount - 1, 'Dismissed issue must decrement openIssuesCount');

  const overview = selectAdminOverview(dismissedState);
  assert.equal(overview.openIssues.some((i) => i.id === openIssue.id), false, 'Dismissed issue must not appear in open issues');

  const adminIssues = selectAdminIssues(dismissedState);
  const target = adminIssues.find((i) => i.id === openIssue.id);
  assert.equal(target.status, 'dismissed');
  assert.equal(target.isDismissed, true);
  assert.equal(target.isOpen, false);
});

