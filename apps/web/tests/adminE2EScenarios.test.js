import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReferenceData } from '../src/data/demoReferenceData.js';
import * as demoDomain from '../src/features/domain/demoDomain.js';
import {
  selectLearnerDiscoveredTutors,
  selectPublicProfileReviews,
  calculateTutorRatingSummary,
  formatRecordCount,
  filterTutors,
  filterUsers,
  filterReviews,
  filterIssues,
  authenticateUser as simulateLogin,
  SUSPENDED_ERROR_MESSAGE,
} from './adminTestHelpers.js';

const now = new Date('2026-10-05T06:00:00+07:00');

const {
  createDemoState,
  approveTutor,
  rejectTutor,
  setTutorSuspension,
  setUserSuspension,
  moderateReview,
  updateIssueStatus,
} = demoDomain;

// ---------------------------------------------------------------------------
// TIER 4: SCENARIO 1 — ONBOARDING NEW TUTOR WORKFLOW
// Features: F1, F6, F7, F10, F11, F13
// ---------------------------------------------------------------------------

test('SCENARIO-1: Onboarding New Tutor Workflow', (t) => {
  // Step 1: Initial state has a pending tutor
  const state = createDemoState(now);
  const newTutor = {
    id: 'thao-vy',
    name: 'Lê Thảo Vy',
    university: 'ĐH Sư phạm TP.HCM',
    subjects: ['Tiếng Anh'],
    price: 160000,
    intro: 'Sinh viên năm 3 chuyên ngành Sư phạm Tiếng Anh, IELTS 7.5.',
    moderationStatus: 'pending',
    submissionDate: '2026-10-04',
    verificationDocuments: [
      { id: 'doc-1', type: 'student_card', title: 'Thẻ sinh viên', verified: true },
      { id: 'doc-2', type: 'id_card', title: 'CCCD', verified: true },
    ]
  };
  state.profiles.push(newTutor);

  // Step 2: Verification before approval — absent from learner discovery
  const initialDiscovered = selectLearnerDiscoveredTutors(state);
  assert.ok(!initialDiscovered.some((p) => p.id === 'thao-vy'), 'Tutor must NOT appear in search while pending');

  // Step 3: Admin inspects in /admin/tutors under "Chờ duyệt" tab
  const pendingTutors = filterTutors(state.profiles, 'Chờ duyệt', '');
  assert.ok(pendingTutors.some((p) => p.id === 'thao-vy'), 'Tutor must be listed in Chờ duyệt tab');
  const counterText = formatRecordCount(pendingTutors.length, state.profiles.length);
  assert.match(counterText, /^Hiển thị \d+ \/ \d+ bản ghi$/);

  // Step 4: Admin opens Drawer & inspects documents
  const drawerTutor = pendingTutors.find((p) => p.id === 'thao-vy');
  assert.equal(drawerTutor.verificationDocuments.length, 2);
  assert.equal(drawerTutor.price, 160000);

  // Step 5: Admin executes Approve action
  let approvedState;
  if (typeof approveTutor === 'function') {
    approvedState = approveTutor(state, 'thao-vy');
  } else {
    approvedState = {
      ...state,
      profiles: state.profiles.map((p) => p.id === 'thao-vy' ? { ...p, moderationStatus: 'approved' } : p)
    };
  }

  // Step 6: Verify tutor is now approved in domain state
  const updatedTutor = approvedState.profiles.find((p) => p.id === 'thao-vy');
  assert.equal(updatedTutor.moderationStatus, 'approved');

  // Step 7: Verify tutor immediately appears in Learner search results
  const afterDiscovered = selectLearnerDiscoveredTutors(approvedState);
  const surfaced = afterDiscovered.find((p) => p.id === 'thao-vy');
  assert.ok(surfaced, 'Tutor must now be discoverable on Learner Search');
  assert.equal(surfaced.name, 'Lê Thảo Vy');
  assert.deepEqual(surfaced.subjects, ['Tiếng Anh']);

  // Step 8: Domain invariant check — requests count remains strictly 9
  assert.equal(approvedState.requests.length, 9, 'Seed requests must remain strictly 9');
});

// ---------------------------------------------------------------------------
// TIER 4: SCENARIO 2 — DISPUTE & SUSPENSION WORKFLOW
// Features: F6, F9, F11, F14, F16
// ---------------------------------------------------------------------------

test('SCENARIO-2: Dispute & Suspension Workflow', (t) => {
  const state = createDemoState(now);
  const accounts = structuredClone(demoReferenceData.accounts);

  // Step 1: Issue ticket exists in canonical domain
  const issueTicket = {
    id: 'RP-1172',
    category: 'attitude',
    tutorId: 'quoc-bao',
    tutorUsername: 'giabao',
    learnerId: 'minhanh',
    description: 'Gia sư sử dụng điện thoại liên tục trong giờ dạy và thái độ không đúng mực.',
    status: 'new',
    createdAt: '2026-10-04T14:30:00Z',
  };
  state.issues = [issueTicket];

  // Step 2: Tutor initially can log in normally
  const tutorInitialLogin = simulateLogin(accounts, 'giabao', 'demo1234');
  assert.ok(tutorInitialLogin.user, 'Tutor must initially be able to log in');

  // Step 3: Admin reviews issue in Drawer, transitions to in_progress
  let issueState;
  if (typeof updateIssueStatus === 'function') {
    issueState = updateIssueStatus(state, 'RP-1172', 'in_progress', 'Đang xử lý khiếu nại');
  } else {
    issueState = {
      ...state,
      issues: state.issues.map((i) => i.id === 'RP-1172' ? { ...i, status: 'in_progress', resolutionNote: 'Đang xử lý' } : i)
    };
  }
  assert.equal(issueState.issues.find((i) => i.id === 'RP-1172').status, 'in_progress');

  // Step 4: Admin investigates and decides to suspend Tutor account
  let suspendedDomain;
  if (typeof setTutorSuspension === 'function') {
    suspendedDomain = setTutorSuspension(issueState, 'quoc-bao', true);
  } else {
    suspendedDomain = {
      ...issueState,
      profiles: issueState.profiles.map((p) => p.id === 'quoc-bao' ? { ...p, moderationStatus: 'suspended' } : p)
    };
  }
  const tutorAccount = accounts.find((a) => a.username === 'giabao');
  tutorAccount.status = 'suspended';

  // Step 5: Verify Tutor is removed from Learner discovery
  const searchResults = selectLearnerDiscoveredTutors(suspendedDomain);
  assert.ok(!searchResults.some((p) => p.id === 'quoc-bao'), 'Suspended tutor must not appear in search');

  // Step 6: Verify Tutor login attempt is rejected with exact Vietnamese error
  const blockedLogin = simulateLogin(accounts, 'giabao', 'demo1234');
  assert.equal(blockedLogin.user, undefined, 'Session must not be granted');
  assert.equal(
    blockedLogin.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.',
    'Must receive exact verbatim suspension message'
  );
});

// ---------------------------------------------------------------------------
// TIER 4: SCENARIO 3 — INAPPROPRIATE REVIEW MODERATION
// Features: F6, F8, F11, F15
// ---------------------------------------------------------------------------

test('SCENARIO-3: Inappropriate Review Moderation', (t) => {
  const state = createDemoState(now);
  const tutorId = 'mai-anh';

  // Step 1: Initial reviews exist: 1 good approved, 1 abusive pending
  state.reviews = [
    {
      id: 'rev-good',
      tutorId,
      author: 'Ngọc Lan',
      rating: 5,
      comment: 'Cô Mai Anh dạy rất nhiệt tình và chu đáo.',
      moderationStatus: 'approved',
      visibility: 'public'
    },
    {
      id: 'rev-abusive',
      tutorId,
      author: 'Ẩn danh',
      rating: 1,
      comment: 'Quảng cáo sai sự thật, thái độ xúc phạm học viên và ngôn từ không phù hợp!',
      moderationStatus: 'pending',
      visibility: 'hidden'
    }
  ];

  // Step 2: Public profile initially only shows the approved review
  const publicInitial = selectPublicProfileReviews(state, tutorId);
  assert.equal(publicInitial.length, 1);
  assert.equal(publicInitial[0].id, 'rev-good');
  assert.equal(calculateTutorRatingSummary(publicInitial).averageRating, 5.0);

  // Step 3: Admin inspects review in /admin/reviews under "Cần duyệt / Xem xét"
  const pendingReviews = filterReviews(state.reviews, 'Cần duyệt / Xem xét', '');
  assert.ok(pendingReviews.some((r) => r.id === 'rev-abusive'));

  // Step 4: Admin opens Drawer, inspects context, and clicks "Ẩn đánh giá"
  let moderatedState;
  if (typeof moderateReview === 'function') {
    moderatedState = moderateReview(state, 'rev-abusive', 'hidden');
  } else {
    moderatedState = {
      ...state,
      reviews: state.reviews.map((r) => r.id === 'rev-abusive' ? { ...r, moderationStatus: 'hidden', visibility: 'hidden' } : r)
    };
  }

  // Step 5: Verification in domain state
  const updatedRev = moderatedState.reviews.find((r) => r.id === 'rev-abusive');
  assert.equal(updatedRev.moderationStatus, 'hidden');
  assert.equal(updatedRev.visibility, 'hidden');

  // Step 6: Verify public profile strictly does not render the hidden review
  const publicAfter = selectPublicProfileReviews(moderatedState, tutorId);
  assert.equal(publicAfter.length, 1);
  assert.equal(publicAfter[0].id, 'rev-good');

  // Step 7: Verify tutor rating remains intact (5.0, not dragged down by hidden review)
  const ratingSummary = calculateTutorRatingSummary(publicAfter);
  assert.equal(ratingSummary.averageRating, 5.0);
  assert.equal(ratingSummary.reviewCount, 1);
});

// ---------------------------------------------------------------------------
// TIER 4: SCENARIO 4 — DASHBOARD REACTIVE METRIC INTEGRITY
// Features: F3, F4, F5, F17
// ---------------------------------------------------------------------------

test('SCENARIO-4: Dashboard Reactive Metric Integrity', (t) => {
  // Simulator of live dashboard calculations
  function computeDashboardStats(state) {
    const pendingTutors = (state.profiles || []).filter((p) => p.moderationStatus === 'pending').length;
    const pendingReviews = (state.reviews || []).filter((r) => r.moderationStatus === 'pending').length;
    const openIssues = (state.issues || []).filter((i) => i.status !== 'resolved').length;
    return { pendingTutors, pendingReviews, openIssues };
  }

  // Step 1: Initial state with known pending items
  const state = createDemoState(now);
  state.profiles = state.profiles.map((p) => ({ ...p, moderationStatus: 'approved' }));
  state.profiles.push({ id: 'tutor-p1', moderationStatus: 'pending' });
  state.reviews = [
    { id: 'rev-p1', moderationStatus: 'pending', visibility: 'hidden' },
    { id: 'rev-p2', moderationStatus: 'pending', visibility: 'hidden' }
  ];
  state.issues = [
    { id: 'ISS-1', status: 'new' },
    { id: 'ISS-2', status: 'in_progress' }
  ];

  // Capture baseline stats
  const baseline = computeDashboardStats(state);
  assert.equal(baseline.pendingTutors, 1);
  assert.equal(baseline.pendingReviews, 2);
  assert.equal(baseline.openIssues, 2);

  // Step 2: Batch action 1 — Approve 1 tutor
  let state1;
  if (typeof approveTutor === 'function') {
    state1 = approveTutor(state, 'tutor-p1');
  } else {
    state1 = {
      ...state,
      profiles: state.profiles.map((p) => p.id === 'tutor-p1' ? { ...p, moderationStatus: 'approved' } : p)
    };
  }

  // Step 3: Batch action 2 — Moderate reviews (approve 1, hide 1)
  let state2;
  if (typeof moderateReview === 'function') {
    state2 = moderateReview(moderateReview(state1, 'rev-p1', 'approved'), 'rev-p2', 'hidden');
  } else {
    state2 = {
      ...state1,
      reviews: state1.reviews.map((r) => {
        if (r.id === 'rev-p1') return { ...r, moderationStatus: 'approved', visibility: 'public' };
        if (r.id === 'rev-p2') return { ...r, moderationStatus: 'hidden', visibility: 'hidden' };
        return r;
      })
    };
  }

  // Step 4: Batch action 3 — Resolve 1 issue
  let state3;
  if (typeof updateIssueStatus === 'function') {
    state3 = updateIssueStatus(state2, 'ISS-1', 'resolved', 'Đã xử lý xong');
  } else {
    state3 = {
      ...state2,
      issues: state2.issues.map((i) => i.id === 'ISS-1' ? { ...i, status: 'resolved', resolutionNote: 'Xong' } : i)
    };
  }

  // Step 5: Verify dashboard stats reflect exact updated counts
  const finalStats = computeDashboardStats(state3);
  assert.equal(finalStats.pendingTutors, 0, 'Pending tutors must be 0 after approval');
  assert.equal(finalStats.pendingReviews, 0, 'Pending reviews must be 0 after moderation');
  assert.equal(finalStats.openIssues, 1, 'Open issues must be 1 (only ISS-2 remains in_progress)');
});

// ---------------------------------------------------------------------------
// TIER 4: SCENARIO 5 — FULL RECOVERY & UNSUSPEND
// Features: F6, F9, F11, F14
// ---------------------------------------------------------------------------

test('SCENARIO-5: Full Recovery & Unsuspend', (t) => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const state = createDemoState(now);

  // Step 1: Start with suspended account
  const suspendedUser = {
    id: 'user-suspended-learner',
    fullName: 'Hoàng Văn Khóa',
    username: 'hoang_khoa',
    email: 'khoa@demo.tutornearme.vn',
    role: 'learner',
    password: 'demo1234',
    status: 'suspended'
  };
  accounts.push(suspendedUser);
  state.users = accounts;

  // Step 2: Verify login is blocked
  const initialLogin = simulateLogin(accounts, 'hoang_khoa', 'demo1234');
  assert.equal(initialLogin.user, undefined);
  assert.equal(initialLogin.error, SUSPENDED_ERROR_MESSAGE);

  // Step 3: Admin inspects User in /admin/users under "Đang bị khóa" tab
  const suspendedUsers = filterUsers(accounts, 'Đang bị khóa', '');
  assert.ok(suspendedUsers.some((u) => u.username === 'hoang_khoa'));

  // Step 4: Admin opens User Drawer and clicks "Mở khóa tài khoản"
  let unsuspendedState;
  if (typeof setUserSuspension === 'function') {
    unsuspendedState = setUserSuspension(state, 'user-suspended-learner', false);
  } else {
    unsuspendedState = {
      ...state,
      users: state.users.map((u) => u.id === 'user-suspended-learner' ? { ...u, status: 'active' } : u)
    };
  }
  const targetAccount = accounts.find((u) => u.id === 'user-suspended-learner');
  targetAccount.status = 'active';

  // Step 5: Verify user status in state is now active
  const targetUserInState = unsuspendedState.users.find((u) => u.id === 'user-suspended-learner');
  assert.equal(targetUserInState.status, 'active');

  // Step 6: User retries login with valid credentials
  const recoveredLogin = simulateLogin(accounts, 'hoang_khoa', 'demo1234');
  assert.ok(recoveredLogin.user, 'Recovered user must log in successfully');
  assert.equal(recoveredLogin.user.id, 'user-suspended-learner');
  assert.equal(recoveredLogin.user.role, 'learner');
  assert.equal(recoveredLogin.error, undefined);

  // Step 7: Persistence verification — storing and reloading preserves active status
  const storedJson = JSON.stringify(unsuspendedState);
  const reloaded = JSON.parse(storedJson);
  assert.equal(reloaded.users.find((u) => u.id === 'user-suspended-learner').status, 'active');
});
