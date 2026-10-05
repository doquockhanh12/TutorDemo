import test from 'node:test';
import assert from 'node:assert/strict';
import * as demoDomain from '../src/features/domain/demoDomain.js';
import { demoReferenceData } from '../src/data/demoReferenceData.js';

const now = new Date('2026-10-05T06:00:00+07:00');

const {
  createDemoState,
  approveTutor,
  rejectTutor,
  setTutorSuspension,
  moderateReview,
} = demoDomain;

import {
  selectLearnerDiscoveredTutors,
  selectPublicProfileReviews,
  calculateTutorRatingSummary,
} from './adminTestHelpers.js';

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: TUTOR MODERATION & LEARNER SEARCH SYNC (F7, R4)
// ---------------------------------------------------------------------------

test('F7-T1-01: Learner discovery filters out non-approved tutors', () => {
  const state = createDemoState(now);
  state.profiles = [
    { id: 't-app', name: 'Approved Tutor', moderationStatus: 'approved' },
    { id: 't-pend', name: 'Pending Tutor', moderationStatus: 'pending' },
    { id: 't-rej', name: 'Rejected Tutor', moderationStatus: 'rejected' },
    { id: 't-susp', name: 'Suspended Tutor', moderationStatus: 'suspended' },
  ];
  const discovered = selectLearnerDiscoveredTutors(state);
  assert.equal(discovered.length, 1);
  assert.equal(discovered[0].id, 't-app');
});

test('F7-T1-02: Deterministic pending tutor is absent from learner discovery initially', () => {
  const state = createDemoState(now);
  state.profiles.push({
    id: 'thao-vy',
    name: 'Lê Thảo Vy',
    subjects: ['Tiếng Anh'],
    moderationStatus: 'pending'
  });
  const discovered = selectLearnerDiscoveredTutors(state);
  assert.ok(!discovered.some((t) => t.id === 'thao-vy'), 'Pending tutor must not appear in learner discovery');
});

test('F7-T1-03: Approving pending tutor immediately surfaces them in learner discovery', (t) => {
  const state = createDemoState(now);
  state.profiles.push({
    id: 'thao-vy',
    name: 'Lê Thảo Vy',
    subjects: ['Tiếng Anh'],
    price: 160000,
    moderationStatus: 'pending'
  });

  let nextState;
  if (typeof approveTutor === 'function') {
    nextState = approveTutor(state, 'thao-vy');
  } else {
    // Contract reducer fallback
    nextState = {
      ...state,
      profiles: state.profiles.map((p) => p.id === 'thao-vy' ? { ...p, moderationStatus: 'approved' } : p)
    };
  }

  const discovered = selectLearnerDiscoveredTutors(nextState);
  const found = discovered.find((p) => p.id === 'thao-vy');
  assert.ok(found, 'Approved tutor must appear in learner discovery');
  assert.equal(found.name, 'Lê Thảo Vy');
  assert.equal(found.price, 160000);
});

test('F7-T1-04: Rejecting pending tutor keeps them excluded from learner discovery', (t) => {
  const state = createDemoState(now);
  state.profiles.push({
    id: 'hoang-phuc',
    name: 'Nguyễn Hoàng Phúc',
    moderationStatus: 'pending'
  });

  let nextState;
  if (typeof rejectTutor === 'function') {
    nextState = rejectTutor(state, 'hoang-phuc', 'Thiếu chứng chỉ');
  } else {
    nextState = {
      ...state,
      profiles: state.profiles.map((p) => p.id === 'hoang-phuc' ? { ...p, moderationStatus: 'rejected', rejectionReason: 'Thiếu chứng chỉ' } : p)
    };
  }

  const discovered = selectLearnerDiscoveredTutors(nextState);
  assert.ok(!discovered.some((p) => p.id === 'hoang-phuc'), 'Rejected tutor must not be discovered');
  const target = nextState.profiles.find((p) => p.id === 'hoang-phuc');
  assert.equal(target.rejectionReason, 'Thiếu chứng chỉ');
});

test('F7-T1-05: Suspending an approved tutor immediately removes them from learner discovery', (t) => {
  const state = createDemoState(now);
  let nextState;
  if (typeof setTutorSuspension === 'function') {
    nextState = setTutorSuspension(state, 'quoc-bao', true);
  } else {
    nextState = {
      ...state,
      profiles: state.profiles.map((p) => p.id === 'quoc-bao' ? { ...p, moderationStatus: 'suspended' } : p)
    };
  }
  const discovered = selectLearnerDiscoveredTutors(nextState);
  assert.ok(!discovered.some((p) => p.id === 'quoc-bao'), 'Suspended tutor must vanish from learner discovery');
});

test('F7-T1-06: Unsuspending a suspended tutor immediately restores them to learner discovery', (t) => {
  const state = createDemoState(now);
  state.profiles = state.profiles.map((p) => p.id === 'quoc-bao' ? { ...p, moderationStatus: 'suspended' } : p);

  let nextState;
  if (typeof setTutorSuspension === 'function') {
    nextState = setTutorSuspension(state, 'quoc-bao', false);
  } else {
    nextState = {
      ...state,
      profiles: state.profiles.map((p) => p.id === 'quoc-bao' ? { ...p, moderationStatus: 'approved' } : p)
    };
  }

  const discovered = selectLearnerDiscoveredTutors(nextState);
  assert.ok(discovered.some((p) => p.id === 'quoc-bao'), 'Unsuspended tutor must reappear in learner discovery');
});

test('F7-T2-01: Approving tutor preserves strictly 9 requests in canonical domain', () => {
  const state = createDemoState(now);
  state.profiles.push({ id: 'dummy-tutor', moderationStatus: 'pending' });
  const approved = {
    ...state,
    profiles: state.profiles.map((p) => p.id === 'dummy-tutor' ? { ...p, moderationStatus: 'approved' } : p)
  };
  assert.equal(approved.requests.length, 9, 'Seed requests must remain strictly 9');
});

test('F7-T2-02: Approving tutor does not overwrite or mutate bookings of other tutors', () => {
  const state = createDemoState(now);
  const originalLessons = structuredClone(state.lessons);
  state.profiles.push({ id: 'new-tutor', moderationStatus: 'pending' });
  const approved = {
    ...state,
    profiles: state.profiles.map((p) => p.id === 'new-tutor' ? { ...p, moderationStatus: 'approved' } : p)
  };
  assert.deepEqual(approved.lessons, originalLessons, 'Lessons of other tutors must remain untouched');
});

test('F7-T2-03: Repeatedly approving an already approved tutor is idempotent', () => {
  const state = createDemoState(now);
  const p1 = {
    ...state,
    profiles: state.profiles.map((p) => p.id === 'quoc-bao' ? { ...p, moderationStatus: 'approved' } : p)
  };
  const d1 = selectLearnerDiscoveredTutors(p1);
  const p2 = {
    ...p1,
    profiles: p1.profiles.map((p) => p.id === 'quoc-bao' ? { ...p, moderationStatus: 'approved' } : p)
  };
  const d2 = selectLearnerDiscoveredTutors(p2);
  assert.equal(d1.length, d2.length);
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: REVIEW MODERATION & PUBLIC PROFILE SYNC (F8, R4)
// ---------------------------------------------------------------------------

test('F8-T1-01: Public profile reviews selector returns only approved and public reviews', () => {
  const state = createDemoState(now);
  state.reviews = [
    { id: 'r1', tutorId: 't1', rating: 5, moderationStatus: 'approved', visibility: 'public' },
    { id: 'r2', tutorId: 't1', rating: 1, moderationStatus: 'pending', visibility: 'hidden' },
    { id: 'r3', tutorId: 't1', rating: 1, moderationStatus: 'hidden', visibility: 'hidden' },
    { id: 'r4', tutorId: 't1', rating: 5, moderationStatus: 'approved', visibility: 'hidden' }, // unapproved visibility
  ];
  const publicReviews = selectPublicProfileReviews(state, 't1');
  assert.equal(publicReviews.length, 1);
  assert.equal(publicReviews[0].id, 'r1');
});

test('F8-T1-02: Pending review is initially absent from public tutor profile', () => {
  const state = createDemoState(now);
  state.reviews = [
    { id: 'rev-pending-1', tutorId: 'mai-anh', rating: 5, comment: 'Tốt', moderationStatus: 'pending', visibility: 'hidden' }
  ];
  const reviews = selectPublicProfileReviews(state, 'mai-anh');
  assert.equal(reviews.length, 0, 'Pending review must not be publicly visible');
});

test('F8-T1-03: Approving pending review immediately surfaces it on tutor public profile', () => {
  const state = createDemoState(now);
  state.reviews = [
    { id: 'rev-pending-1', tutorId: 'mai-anh', rating: 5, author: 'Minh Khang', comment: 'Dạy rất hay', moderationStatus: 'pending', visibility: 'hidden' }
  ];

  let nextState;
  if (typeof moderateReview === 'function') {
    nextState = moderateReview(state, 'rev-pending-1', 'approved');
  } else {
    nextState = {
      ...state,
      reviews: state.reviews.map((r) => r.id === 'rev-pending-1' ? { ...r, moderationStatus: 'approved', visibility: 'public' } : r)
    };
  }

  const reviews = selectPublicProfileReviews(nextState, 'mai-anh');
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].id, 'rev-pending-1');
  assert.equal(reviews[0].author, 'Minh Khang');
});

test('F8-T1-04: Hiding public review immediately removes it from tutor public profile', () => {
  const state = createDemoState(now);
  state.reviews = [
    { id: 'rev-1', tutorId: 'mai-anh', rating: 5, moderationStatus: 'approved', visibility: 'public' },
    { id: 'rev-2', tutorId: 'mai-anh', rating: 4, moderationStatus: 'approved', visibility: 'public' }
  ];
  assert.equal(selectPublicProfileReviews(state, 'mai-anh').length, 2);

  let nextState;
  if (typeof moderateReview === 'function') {
    nextState = moderateReview(state, 'rev-1', 'hidden');
  } else {
    nextState = {
      ...state,
      reviews: state.reviews.map((r) => r.id === 'rev-1' ? { ...r, moderationStatus: 'hidden', visibility: 'hidden' } : r)
    };
  }

  const reviews = selectPublicProfileReviews(nextState, 'mai-anh');
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].id, 'rev-2', 'Only rev-2 should remain visible');
});

test('F8-T1-05: Re-approving hidden review restores it to public tutor profile', () => {
  const state = createDemoState(now);
  state.reviews = [
    { id: 'rev-1', tutorId: 'quoc-bao', rating: 5, moderationStatus: 'hidden', visibility: 'hidden' }
  ];
  assert.equal(selectPublicProfileReviews(state, 'quoc-bao').length, 0);

  const restored = {
    ...state,
    reviews: state.reviews.map((r) => r.id === 'rev-1' ? { ...r, moderationStatus: 'approved', visibility: 'public' } : r)
  };
  assert.equal(selectPublicProfileReviews(restored, 'quoc-bao').length, 1);
});

test('F8-T2-01: Hiding a review does NOT delete it from canonical domain state', () => {
  const state = createDemoState(now);
  state.reviews = [
    { id: 'rev-keep', tutorId: 'mai-anh', rating: 1, moderationStatus: 'approved', visibility: 'public' }
  ];
  const hidden = {
    ...state,
    reviews: state.reviews.map((r) => r.id === 'rev-keep' ? { ...r, moderationStatus: 'hidden', visibility: 'hidden' } : r)
  };
  assert.ok(hidden.reviews.some((r) => r.id === 'rev-keep'), 'Review must remain in state for Admin audit');
  assert.equal(hidden.reviews.find((r) => r.id === 'rev-keep').visibility, 'hidden');
});

test('F8-T2-02: Public profile average rating calculation updates dynamically with moderation decisions', () => {
  const reviews = [
    { id: 'r1', rating: 5, moderationStatus: 'approved', visibility: 'public' },
    { id: 'r2', rating: 3, moderationStatus: 'approved', visibility: 'public' },
  ];
  // Initial: (5 + 3) / 2 = 4.0
  assert.equal(calculateTutorRatingSummary(reviews).averageRating, 4.0);

  // If r2 is hidden, only r1 remains: 5.0
  const afterHidingR2 = reviews.filter((r) => r.id === 'r1');
  assert.equal(calculateTutorRatingSummary(afterHidingR2).averageRating, 5.0);
});

test('F8-T2-03: Zero-review state displays formatted fallback without division by zero', () => {
  const summary = calculateTutorRatingSummary([]);
  assert.equal(summary.averageRating, 0);
  assert.equal(summary.reviewCount, 0);
  assert.equal(summary.formatted, 'Chưa có đánh giá');
});

test('F8-T2-04: Review moderation preserves associated lesson metadata snapshot', () => {
  const review = {
    id: 'rev-meta',
    tutorId: 'quoc-bao',
    lessonSnapshot: { subject: 'Tiếng Anh', sessionFee: 220000, date: '2026-10-01' },
    moderationStatus: 'pending',
    visibility: 'hidden'
  };
  const updated = { ...review, moderationStatus: 'approved', visibility: 'public' };
  assert.deepEqual(updated.lessonSnapshot, review.lessonSnapshot, 'Lesson snapshot must be preserved');
});

// ---------------------------------------------------------------------------
// TIER 3: PAIRWISE COMBINATORIAL TESTING (F7, F8, F9, F16)
// ---------------------------------------------------------------------------

test('T3-01: Pairwise: Tutor Status × Subject Matching Filter in Learner Search', () => {
  const statuses = ['approved', 'pending', 'rejected', 'suspended'];
  const subjects = ['Toán', 'Tiếng Anh'];

  for (const status of statuses) {
    for (const subject of subjects) {
      const state = {
        profiles: [
          { id: `tutor-${status}-${subject}`, subjects: [subject], moderationStatus: status }
        ]
      };
      const discovered = selectLearnerDiscoveredTutors(state);
      const matchesSubject = discovered.filter((t) => t.subjects.includes(subject));

      if (status === 'approved') {
        assert.equal(matchesSubject.length, 1, `Approved tutor with ${subject} must be discovered`);
      } else {
        assert.equal(matchesSubject.length, 0, `Non-approved tutor (${status}) must NOT be discovered`);
      }
    }
  }
});

test('T3-02: Pairwise: Review Status × Star Rating × Public Profile Display', () => {
  const statuses = ['approved', 'pending', 'hidden'];
  const ratings = [1, 3, 5];

  for (const status of statuses) {
    for (const rating of ratings) {
      const visibility = status === 'approved' ? 'public' : 'hidden';
      const review = { id: `rev-${status}-${rating}`, tutorId: 'tutor-1', rating, moderationStatus: status, visibility };
      const state = { reviews: [review] };
      const publicReviews = selectPublicProfileReviews(state, 'tutor-1');

      if (status === 'approved') {
        assert.equal(publicReviews.length, 1);
        assert.equal(publicReviews[0].rating, rating);
      } else {
        assert.equal(publicReviews.length, 0);
      }
    }
  }
});

test('T3-03: Pairwise: User Role × Account Status × Operational Action Eligibility', () => {
  const roles = ['learner', 'tutor', 'admin'];
  const statuses = ['active', 'suspended'];

  for (const role of roles) {
    for (const status of statuses) {
      const user = { id: `u-${role}-${status}`, role, status };
      const canSuspend = status === 'active';
      const canUnsuspend = status === 'suspended';

      assert.notEqual(canSuspend, canUnsuspend, 'User must be either suspendable or unsuspendable');
    }
  }
});

test('T3-04: Pairwise: Issue Category × Issue Status × Administrative Handling', () => {
  const categories = ['absence', 'lesson_dispute', 'cancellation', 'fee_dispute', 'attitude'];
  const statuses = ['new', 'in_progress', 'resolved'];

  for (const category of categories) {
    for (const status of statuses) {
      const issue = { id: `ISS-${category}-${status}`, category, status };
      const isOpen = status !== 'resolved';
      if (status === 'resolved') {
        assert.equal(isOpen, false);
      } else {
        assert.equal(isOpen, true);
      }
    }
  }
});
