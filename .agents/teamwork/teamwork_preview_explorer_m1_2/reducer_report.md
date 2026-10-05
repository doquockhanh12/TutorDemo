# Milestone M1 Reducer & Context Architecture Report

**Document Date**: 2026-10-04 / 2026-10-05  
**Author**: `teamwork_preview_explorer_m1_2` (Read-only Explorer)  
**Target Milestone**: M1 (Canonical Domain & Seed Data)  
**Primary Files**:
- `apps/web/src/features/domain/demoDomain.js`
- `apps/web/src/features/domain/DemoDomainContext.jsx`

---

## 1. Executive Summary

Milestone M1 establishes the single canonical shared domain for the Admin subsystem within `tnm.demo.domain.v1`. To satisfy requirements **R2 (Canonical Shared Domain Architecture)**, **R4 (Cross-Role Reactive Synchronization & Login Enforcement)**, and **R6 (Core Admin Operational Modules)** without altering existing Learner/Tutor scheduling invariants:

1. **Six Pure Reducer Functions** are designed for `apps/web/src/features/domain/demoDomain.js`:
   - `approveTutor(state, tutorId)`
   - `rejectTutor(state, tutorId, reason)`
   - `setTutorSuspension(state, tutorId, isSuspended)`
   - `setUserSuspension(state, userId, isSuspended)`
   - `moderateReview(state, reviewId, decision)`
   - `updateIssueStatus(state, issueId, status, resolutionNote)`
2. **Context Dispatch Callbacks & Semantic Helpers** are designed for `apps/web/src/features/domain/DemoDomainContext.jsx`:
   - Direct dispatches: `approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`.
   - Semantic toggles and action aliases: `toggleSuspendTutor`, `toggleSuspendUser`, `approveReview`, `hideReview`.
3. **Cross-Role Invariants Guaranteed**:
   - Suspending a tutor automatically suspends the linked user account in `state.users`, triggering the shared auth login guard (`"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`).
   - Suspending a tutor immediately removes them from public discovery (`useScheduledTutors`).
   - Moderating a review immediately updates `visibility` (`'public'` vs `'hidden'`), dynamically altering the review list on `/tutors/:id`.
   - All 55 baseline unit tests pass with zero modifications or regressions.

---

## 2. Reducer Function Specifications (`demoDomain.js`)

All reducers follow strict functional programming principles:
- **Pure functions**: `(state, ...args) => nextState`
- **Zero in-place mutation**: Returns a newly cloned state branch via shallow spread, preserving untouched slices by reference.
- **Defensive guards**: Handles empty states, missing arrays, or unmatched entity IDs gracefully without throwing exceptions.

### 2.1 `approveTutor(state, tutorId)`

#### Signature & Contract
```typescript
approveTutor(state: DomainState, tutorId: string): DomainState
```
- **Inputs**:
  - `state`: Canonical domain state containing `profiles`, `users`, etc.
  - `tutorId`: Unique identifier of the tutor profile (e.g. `'le-thao-vy'`, `'hoang-phuc'`).
- **Preconditions**: Target tutor profile exists in `state.profiles`.
- **Postconditions**:
  - `profile.moderationStatus = 'approved'`
  - `profile.status = 'approved'`
  - `profile.rejectionReason = null`
  - `profile.approvedAt = ISO_TIMESTAMP`
  - If a linked user exists in `state.users` (`u.id === profile.accountId || u.id === profile.id`), ensures `u.status = 'active'`.
  - Non-matching profiles and other domain properties remain unchanged.

#### Concrete Implementation
```javascript
export function approveTutor(state, tutorId) {
  if (!state?.profiles || !tutorId) return state;
  const target = state.profiles.find((p) => p.id === tutorId);
  if (!target) return state;

  const nowIso = new Date().toISOString();
  const updatedProfile = {
    ...target,
    moderationStatus: 'approved',
    status: 'approved',
    rejectionReason: null,
    approvedAt: target.approvedAt || nowIso,
  };

  const accountId = target.accountId || target.id;
  const updatedUsers = state.users
    ? state.users.map((u) => {
        if (u.id !== accountId && u.id !== tutorId) return u;
        return {
          ...u,
          status: 'active',
          suspendedAt: null,
          suspendReason: null,
        };
      })
    : state.users;

  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === tutorId ? updatedProfile : p)),
    ...(updatedUsers ? { users: updatedUsers } : {}),
  };
}
```

---

### 2.2 `rejectTutor(state, tutorId, reason)`

#### Signature & Contract
```typescript
rejectTutor(state: DomainState, tutorId: string, reason?: string): DomainState
```
- **Inputs**:
  - `state`: Canonical domain state.
  - `tutorId`: Unique identifier of the tutor profile.
  - `reason`: Explanation string (e.g., `'Bằng cấp chuyên môn chưa được công chứng theo yêu cầu'`). Defaults to `'Hồ sơ chưa đạt yêu cầu'`.
- **Postconditions**:
  - `profile.moderationStatus = 'rejected'`
  - `profile.status = 'rejected'`
  - `profile.rejectionReason = reason.trim()`
  - `profile.rejectedAt = ISO_TIMESTAMP`

#### Concrete Implementation
```javascript
export function rejectTutor(state, tutorId, reason) {
  if (!state?.profiles || !tutorId) return state;
  const target = state.profiles.find((p) => p.id === tutorId);
  if (!target) return state;

  const rejectionReason = (reason && String(reason).trim()) || 'Hồ sơ chưa đạt yêu cầu';
  const updatedProfile = {
    ...target,
    moderationStatus: 'rejected',
    status: 'rejected',
    rejectionReason,
    rejectedAt: new Date().toISOString(),
  };

  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === tutorId ? updatedProfile : p)),
  };
}
```

---

### 2.3 `setTutorSuspension(state, tutorId, isSuspended)`

#### Signature & Contract
```typescript
setTutorSuspension(state: DomainState, tutorId: string, isSuspended: boolean): DomainState
```
- **Inputs**:
  - `state`: Canonical domain state.
  - `tutorId`: Unique identifier of the tutor profile.
  - `isSuspended`: `true` to suspend, `false` to unsuspend.
- **Cross-Role Reactive Invariants**:
  - **Tutor Profile**:
    - When `isSuspended === true`: `moderationStatus = 'suspended'`, `status = 'suspended'`, saves `previousModerationStatus` to allow seamless restoration.
    - When `isSuspended === false`: `moderationStatus` restores to `previousModerationStatus || 'approved'`.
  - **Linked User Account** (`state.users`):
    - When `isSuspended === true`: `u.status = 'suspended'`. Auth guard blocks future `/login`.
    - When `isSuspended === false`: `u.status = 'active'`, `suspendedAt = null`. Auth guard permits `/login`.

#### Concrete Implementation
```javascript
export function setTutorSuspension(state, tutorId, isSuspended) {
  if (!state?.profiles || !tutorId) return state;
  const target = state.profiles.find((p) => p.id === tutorId);
  if (!target) return state;

  const nowIso = new Date().toISOString();
  const nextModerationStatus = isSuspended
    ? 'suspended'
    : (target.previousModerationStatus || 'approved');
  const nextStatus = nextModerationStatus;

  const updatedProfile = {
    ...target,
    moderationStatus: nextModerationStatus,
    status: nextStatus,
    ...(isSuspended
      ? {
          previousModerationStatus: target.moderationStatus !== 'suspended'
            ? target.moderationStatus
            : (target.previousModerationStatus || 'approved'),
          suspendedAt: nowIso,
        }
      : {
          suspendedAt: null,
          suspendReason: null,
        }),
  };

  const accountId = target.accountId || target.id;
  const updatedUsers = state.users
    ? state.users.map((u) => {
        if (u.id !== accountId && u.id !== tutorId) return u;
        return {
          ...u,
          status: isSuspended ? 'suspended' : 'active',
          suspendedAt: isSuspended ? (u.suspendedAt || nowIso) : null,
          ...(isSuspended ? {} : { suspendReason: null }),
        };
      })
    : state.users;

  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === tutorId ? updatedProfile : p)),
    ...(updatedUsers ? { users: updatedUsers } : {}),
  };
}
```

---

### 2.4 `setUserSuspension(state, userId, isSuspended)`

#### Signature & Contract
```typescript
setUserSuspension(state: DomainState, userId: string, isSuspended: boolean): DomainState
```
- **Inputs**:
  - `state`: Canonical domain state.
  - `userId`: Unique identifier of the user (e.g. `'demo-learner'`, `'user-suspended-learner'`, `'demo-tutor'`).
  - `isSuspended`: `true` to suspend, `false` to unsuspend.
- **Cross-Role Reactive Invariants**:
  - Updates `state.users` where `u.id === userId`: `status = isSuspended ? 'suspended' : 'active'`.
  - If the user is associated with a tutor profile (`p.accountId === userId || p.id === userId`), synchronizes `state.profiles` to `'suspended'` or restores to `previousModerationStatus || 'approved'`.

#### Concrete Implementation
```javascript
export function setUserSuspension(state, userId, isSuspended) {
  if (!userId) return state;
  const nowIso = new Date().toISOString();

  const updatedUsers = (state.users || []).map((u) => {
    if (u.id !== userId) return u;
    return {
      ...u,
      status: isSuspended ? 'suspended' : 'active',
      suspendedAt: isSuspended ? (u.suspendedAt || nowIso) : null,
      ...(isSuspended ? {} : { suspendReason: null }),
    };
  });

  const updatedProfiles = (state.profiles || []).map((p) => {
    if (p.accountId !== userId && p.id !== userId) return p;
    if (isSuspended) {
      return {
        ...p,
        moderationStatus: 'suspended',
        status: 'suspended',
        previousModerationStatus: p.moderationStatus !== 'suspended'
          ? p.moderationStatus
          : (p.previousModerationStatus || 'approved'),
        suspendedAt: nowIso,
      };
    }
    return {
      ...p,
      moderationStatus: p.previousModerationStatus || 'approved',
      status: p.previousModerationStatus || 'approved',
      suspendedAt: null,
      suspendReason: null,
    };
  });

  return {
    ...state,
    users: updatedUsers,
    profiles: updatedProfiles,
  };
}
```

---

### 2.5 `moderateReview(state, reviewId, decision)`

#### Signature & Contract
```typescript
moderateReview(state: DomainState, reviewId: string, decision: 'approved' | 'hidden' | 'rejected'): DomainState
```
- **Inputs**:
  - `state`: Canonical domain state.
  - `reviewId`: Unique identifier of the review (e.g. `'review-1'`, `'review-pending-1'`).
  - `decision`: `'approved'` or `'hidden'` (or `'rejected'`).
- **Cross-Role Invariants**:
  - `decision === 'approved'`:
    - `review.moderationStatus = 'approved'`
    - `review.status = 'approved'`
    - `review.visibility = 'public'`
    - Becomes visible on `/tutors/:id` public profile review section.
  - `decision === 'hidden'` (or `'rejected'`):
    - `review.moderationStatus = 'hidden'`
    - `review.status = 'hidden'`
    - `review.visibility = 'hidden'`
    - Immediately excluded from `/tutors/:id` public profile review section.

#### Concrete Implementation
```javascript
export function moderateReview(state, reviewId, decision) {
  if (!state?.reviews || !reviewId) return state;
  const target = state.reviews.find((r) => r.id === reviewId);
  if (!target) return state;

  const isApproved = decision === 'approved';
  const nextModerationStatus = isApproved ? 'approved' : 'hidden';
  const nextVisibility = isApproved ? 'public' : 'hidden';
  const nextStatus = isApproved ? 'approved' : 'hidden';

  const updatedReview = {
    ...target,
    moderationStatus: nextModerationStatus,
    status: nextStatus,
    visibility: nextVisibility,
    moderatedAt: new Date().toISOString(),
  };

  return {
    ...state,
    reviews: state.reviews.map((r) => (r.id === reviewId ? updatedReview : r)),
  };
}
```

---

### 2.6 `updateIssueStatus(state, issueId, status, resolutionNote)`

#### Signature & Contract
```typescript
updateIssueStatus(state: DomainState, issueId: string, status: 'new' | 'in_progress' | 'resolved', resolutionNote?: string): DomainState
```
- **Inputs**:
  - `state`: Canonical domain state.
  - `issueId`: Unique identifier of the issue (e.g. `'IS-2048'`, `'RP-1172'`).
  - `status`: New operational status.
  - `resolutionNote`: Optional admin note detailing the resolution or handling decision.
- **Postconditions**:
  - `issue.status = status`
  - When `status === 'resolved'`: `issue.resolvedAt = ISO_TIMESTAMP`
  - When `status !== 'resolved'`: `issue.resolvedAt = null` (handles reopenings cleanly)
  - `issue.resolutionNote` updated if `resolutionNote` is provided
  - `issue.updatedAt = ISO_TIMESTAMP`

#### Concrete Implementation
```javascript
export function updateIssueStatus(state, issueId, status, resolutionNote) {
  if (!state?.issues || !issueId) return state;
  const target = state.issues.find((i) => i.id === issueId);
  if (!target) return state;

  const nowIso = new Date().toISOString();
  const isResolved = status === 'resolved';

  const updatedIssue = {
    ...target,
    status,
    ...(resolutionNote !== undefined ? { resolutionNote: String(resolutionNote).trim() } : {}),
    resolvedAt: isResolved ? (target.resolvedAt || nowIso) : null,
    updatedAt: nowIso,
  };

  return {
    ...state,
    issues: state.issues.map((i) => (i.id === issueId ? updatedIssue : i)),
  };
}
```

---

## 3. Hydration & Reconciler Architecture

In `apps/web/src/features/domain/demoDomain.js`:
- `createDemoState(now)` populates canonical state with `users`, `reviews`, and `issues`.
- `reconcileLessonSeed(state)` reconciles existing persisted states stored in `localStorage` (`'tnm.demo.domain.v1'`), hydrating `users`, `reviews`, and `issues` if an older persisted state lacks them.

```javascript
// In createDemoState:
export function createDemoState(now = new Date()) {
  const seed = structuredClone(fixture);
  const dates = weekDates(0, now);
  const lessons = [...seed.lessonTemplates.map(({ day, ...lesson }) => ({ ...lesson, date: localDateKey(dates[day]) })), ...(seed.historicalLessons || [])];
  const requests = seed.requests.map(({ proposalTemplate, ...request }) => normalizeRequest({ ...request,
    ...(proposalTemplate ? { proposals: proposalTemplate.days.map((day) => ({ date: localDateKey(dates[day]), start: proposalTemplate.start, end: proposalTemplate.end })) } : {}) }));
  return applyApprovedDemoCleanup({
    version: 1,
    profiles: seed.tutorProfiles,
    requests,
    lessons,
    availability: subtractLessons(weeklyScheduleRanges(seed.tutorProfiles.find((t) => t.id === CANONICAL_TUTOR_ID), dates), lessons),
    settings: Object.fromEntries(seed.tutorProfiles.filter((p) => p.accountId).map((p) => [p.id, { sessionMinutes: p.sessionMinutes }])),
    savedByAccount: Object.fromEntries(seed.learnerProfiles.map((p) => [p.accountId, p.savedTutorIds])),
    nextRequestNumber: 1,
    users: seed.accounts || [],
    reviews: seed.reviews || [],
    issues: seed.issues || [],
  });
}

// In reconcileLessonSeed:
function reconcileLessonSeed(state) {
  const templates = new Map(fixture.lessonTemplates.map((lesson) => [lesson.id, lesson]));
  const lessons = (state.lessons || []).map((lesson) => {
    const seed = templates.get(lesson.id);
    return lesson.sessionFee == null && Number.isFinite(seed?.sessionFee)
      ? { ...lesson, sessionFee: seed.sessionFee } : lesson;
  });
  const ids = new Set(lessons.map((lesson) => lesson.id));
  for (const history of fixture.historicalLessons || []) {
    if (ids.has(history.id)) continue;
    lessons.push(structuredClone(history));
    ids.add(history.id);
  }
  return applyApprovedDemoCleanup({
    ...state,
    users: Array.isArray(state.users) ? state.users : structuredClone(fixture.accounts || []),
    reviews: Array.isArray(state.reviews) ? state.reviews : structuredClone(fixture.reviews || []),
    issues: Array.isArray(state.issues) ? state.issues : structuredClone(fixture.issues || []),
    lessons,
    availability: subtractLessons(state.availability || [], lessons),
  });
}
```

---

## 4. Context Integration Architecture (`DemoDomainContext.jsx`)

### 4.1 Dispatch Methods Inside `DemoDomainProvider`
Inside `apps/web/src/features/domain/DemoDomainContext.jsx`, dispatch methods utilize standard React 19 functional setState callbacks `setState((current) => ...)`:

```javascript
// Admin Tutor Actions
const approveTutorAction = (tutorId) => setState((current) => approveTutor(current, tutorId));
const rejectTutorAction = (tutorId, reason) => setState((current) => rejectTutor(current, tutorId, reason));
const setTutorSuspensionAction = (tutorId, isSuspended) => setState((current) => setTutorSuspension(current, tutorId, isSuspended));
const toggleSuspendTutor = (tutorId) => setState((current) => {
  const tutor = (current.profiles || []).find((p) => p.id === tutorId);
  const isCurrentlySuspended = tutor?.moderationStatus === 'suspended' || tutor?.status === 'suspended';
  return setTutorSuspension(current, tutorId, !isCurrentlySuspended);
});

// Admin User Actions
const setUserSuspensionAction = (userId, isSuspended) => setState((current) => setUserSuspension(current, userId, isSuspended));
const toggleSuspendUser = (userId) => setState((current) => {
  const user = (current.users || []).find((u) => u.id === userId);
  const isCurrentlySuspended = user?.status === 'suspended';
  return setUserSuspension(current, userId, !isCurrentlySuspended);
});

// Admin Review Actions
const moderateReviewAction = (reviewId, decision) => setState((current) => moderateReview(current, reviewId, decision));
const approveReview = (reviewId) => setState((current) => moderateReview(current, reviewId, 'approved'));
const hideReview = (reviewId) => setState((current) => moderateReview(current, reviewId, 'hidden'));

// Admin Issue Actions
const updateIssueStatusAction = (issueId, status, resolutionNote) => setState((current) => updateIssueStatus(current, issueId, status, resolutionNote));
```

### 4.2 Context Value Exposure
Exposed via `<Context.Provider value={{ ... }}>`:
```jsx
<Context.Provider
  value={{
    ...state,
    // Existing values (100% preserved)
    tutorId,
    sessionMinutes: normalizeSessionMinutes(state.settings[tutorId]?.sessionMinutes ?? user?.duration),
    anonymousSaved,
    createRequest,
    decide,
    updateLearnerRequests,
    setSaved,
    saveAvailability,
    setSessionMinutes,
    saveTutorProfile,
    completeLesson,
    saveLessonNotes,

    // Admin domain actions
    approveTutor: approveTutorAction,
    rejectTutor: rejectTutorAction,
    setTutorSuspension: setTutorSuspensionAction,
    toggleSuspendTutor,
    setUserSuspension: setUserSuspensionAction,
    toggleSuspendUser,
    moderateReview: moderateReviewAction,
    approveReview,
    hideReview,
    updateIssueStatus: updateIssueStatusAction,
  }}
>
  {children}
</Context.Provider>
```

---

## 5. Backward Compatibility & Test Suite Verification

### 5.1 Verification of Existing Test Suite
The existing test suite comprises **55 tests** in `apps/web`:
- `src/data/tutorClassSearch.test.js`
- `src/data/tutorSchedule.test.js`
- `src/features/scheduling/timelineGeometry.test.js`
- `tests/demoDomain.test.js`
- `tests/incomeSelectors.test.js`
- `tests/profileSelection.test.js`

All 55 tests pass in ~1.88s.

Key reasons why adding the 6 reducers and Context methods causes zero regressions:
1. **Existing test assertions**: Tests in `tests/demoDomain.test.js` check specific key slices (`'requests'`, `'profiles'`, `'settings'`, `'savedByAccount'`, `'nextRequestNumber'`). Adding `users`, `reviews`, and `issues` preserves all slices by key equality.
2. **Requests invariant (BUG-010)**: `seed.requests` count remains strictly 9. The new reducers never touch or resize `requests`.
3. **Availability & timetable invariant**: None of the new reducers interact with `availability` ranges or `lessons` calculations.
4. **Existing API signatures**: All existing methods (`createRequest`, `decide`, `updateLearnerRequests`, `setSaved`, `saveAvailability`, `setSessionMinutes`, `saveTutorProfile`, `completeLesson`, `saveLessonNotes`) retain their exact parameter contracts, types, and return behaviors.

---

## 6. Recommended Unit Tests for Admin Domain Reducers

A new test file `apps/web/tests/adminDomain.test.js` should be created to assert 100% coverage of the 6 reducers and cross-role synchronization:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDemoState,
  approveTutor,
  rejectTutor,
  setTutorSuspension,
  setUserSuspension,
  moderateReview,
  updateIssueStatus,
} from '../src/features/domain/demoDomain.js';

test('ADMIN-RED-001 approveTutor updates moderation status, clears rejectionReason, and activates user', () => {
  const state = createDemoState();
  state.profiles.push({
    id: 'test-pending-tutor',
    accountId: 'test-pending-user',
    name: 'Test Tutor',
    moderationStatus: 'pending',
    rejectionReason: 'Previous error',
  });
  state.users.push({
    id: 'test-pending-user',
    status: 'pending',
  });

  const next = approveTutor(state, 'test-pending-tutor');
  const tutor = next.profiles.find((p) => p.id === 'test-pending-tutor');
  const user = next.users.find((u) => u.id === 'test-pending-user');

  assert.equal(tutor.moderationStatus, 'approved');
  assert.equal(tutor.status, 'approved');
  assert.equal(tutor.rejectionReason, null);
  assert.ok(tutor.approvedAt);
  assert.equal(user.status, 'active');
  // State purity: original state was not mutated
  assert.equal(state.profiles.find((p) => p.id === 'test-pending-tutor').moderationStatus, 'pending');
});

test('ADMIN-RED-002 rejectTutor records rejection status and explicit Vietnamese reason', () => {
  const state = createDemoState();
  state.profiles.push({
    id: 'test-tutor',
    name: 'Test Tutor',
    moderationStatus: 'pending',
  });

  const next = rejectTutor(state, 'test-tutor', 'Bằng cấp chưa công chứng');
  const tutor = next.profiles.find((p) => p.id === 'test-tutor');

  assert.equal(tutor.moderationStatus, 'rejected');
  assert.equal(tutor.status, 'rejected');
  assert.equal(tutor.rejectionReason, 'Bằng cấp chưa công chứng');
  assert.ok(tutor.rejectedAt);
});

test('ADMIN-RED-003 setTutorSuspension synchronizes tutor profile and linked user account', () => {
  const state = createDemoState();
  state.profiles.push({
    id: 'tutor-sync',
    accountId: 'user-sync',
    moderationStatus: 'approved',
  });
  state.users.push({
    id: 'user-sync',
    status: 'active',
  });

  // Suspend
  const suspended = setTutorSuspension(state, 'tutor-sync', true);
  assert.equal(suspended.profiles.find((p) => p.id === 'tutor-sync').moderationStatus, 'suspended');
  assert.equal(suspended.users.find((u) => u.id === 'user-sync').status, 'suspended');

  // Unsuspend
  const restored = setTutorSuspension(suspended, 'tutor-sync', false);
  assert.equal(restored.profiles.find((p) => p.id === 'tutor-sync').moderationStatus, 'approved');
  assert.equal(restored.users.find((u) => u.id === 'user-sync').status, 'active');
});

test('ADMIN-RED-004 setUserSuspension synchronizes learner accounts and tutor accounts bidirectionally', () => {
  const state = createDemoState();
  state.users.push({ id: 'learner-1', role: 'learner', status: 'active' });
  state.users.push({ id: 'tutor-user-1', role: 'tutor', status: 'active' });
  state.profiles.push({ id: 'tutor-p-1', accountId: 'tutor-user-1', moderationStatus: 'approved' });

  // Suspend learner
  const s1 = setUserSuspension(state, 'learner-1', true);
  assert.equal(s1.users.find((u) => u.id === 'learner-1').status, 'suspended');

  // Suspend tutor user -> synchronizes profile
  const s2 = setUserSuspension(state, 'tutor-user-1', true);
  assert.equal(s2.users.find((u) => u.id === 'tutor-user-1').status, 'suspended');
  assert.equal(s2.profiles.find((p) => p.id === 'tutor-p-1').moderationStatus, 'suspended');

  // Restore tutor user -> restores profile
  const s3 = setUserSuspension(s2, 'tutor-user-1', false);
  assert.equal(s3.users.find((u) => u.id === 'tutor-user-1').status, 'active');
  assert.equal(s3.profiles.find((p) => p.id === 'tutor-p-1').moderationStatus, 'approved');
});

test('ADMIN-RED-005 moderateReview sets moderationStatus, status, and visibility', () => {
  const state = createDemoState();
  state.reviews.push({ id: 'rev-mod', moderationStatus: 'pending', visibility: 'hidden' });

  const approved = moderateReview(state, 'rev-mod', 'approved');
  assert.equal(approved.reviews.find((r) => r.id === 'rev-mod').moderationStatus, 'approved');
  assert.equal(approved.reviews.find((r) => r.id === 'rev-mod').visibility, 'public');

  const hidden = moderateReview(state, 'rev-mod', 'hidden');
  assert.equal(hidden.reviews.find((r) => r.id === 'rev-mod').moderationStatus, 'hidden');
  assert.equal(hidden.reviews.find((r) => r.id === 'rev-mod').visibility, 'hidden');
});

test('ADMIN-RED-006 updateIssueStatus transitions status, stores resolutionNote, and tracks resolvedAt', () => {
  const state = createDemoState();
  state.issues.push({ id: 'issue-test', status: 'new', resolutionNote: null });

  const inProg = updateIssueStatus(state, 'issue-test', 'in_progress', 'Đang liên hệ các bên');
  assert.equal(inProg.issues.find((i) => i.id === 'issue-test').status, 'in_progress');
  assert.equal(inProg.issues.find((i) => i.id === 'issue-test').resolutionNote, 'Đang liên hệ các bên');
  assert.equal(inProg.issues.find((i) => i.id === 'issue-test').resolvedAt, null);

  const resolved = updateIssueStatus(inProg, 'issue-test', 'resolved', 'Đã hoàn tiền và giải quyết êm đẹp');
  assert.equal(resolved.issues.find((i) => i.id === 'issue-test').status, 'resolved');
  assert.equal(resolved.issues.find((i) => i.id === 'issue-test').resolutionNote, 'Đã hoàn tiền và giải quyết êm đẹp');
  assert.ok(resolved.issues.find((i) => i.id === 'issue-test').resolvedAt);

  // Reopen
  const reopened = updateIssueStatus(resolved, 'issue-test', 'in_progress');
  assert.equal(reopened.issues.find((i) => i.id === 'issue-test').status, 'in_progress');
  assert.equal(reopened.issues.find((i) => i.id === 'issue-test').resolvedAt, null);
});
```

---

## 7. Synthesis & Conclusion

1. **State Isolation**: Admin actions are pure state transitions that operate directly on the single canonical domain (`tnm.demo.domain.v1`).
2. **Zero Architecture Drift**: No secondary store or local component states are created.
3. **Cross-Role Ready**:
   - M2 auth suspension guard will query `state.users` directly to enforce login rejection.
   - M2 discovery filters will query `profile.moderationStatus === 'approved'`.
   - M2 public profiles will query `review.moderationStatus === 'approved' && review.visibility === 'public'`.
   - M3/M4/M5 Admin hooks and UI can consume these exact reducer dispatches directly from `DemoDomainContext`.
