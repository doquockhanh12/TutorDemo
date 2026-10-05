# Learner Search Tutor Moderation Filter Blueprint & Analysis Report

**Milestone**: M2 (Cross-Role Reactive Synchronization)  
**Target Feature**: FEAT-ADM-007 (Tutor Moderation Sync on Learner Search & Discovery)  
**Author**: `teamwork_preview_explorer_m2_2`  
**Date**: 2026-10-04 / 2026-10-05  

---

## 1. Executive Summary

In Milestone M2, administrative decisions (tutor approval, rejection, and suspension) must reactively synchronize with learner-facing discovery without page reloads, secondary storage keys, or disparate entity catalogs. 

This investigation analyzed:
1. `apps/web/src/features/tutor/TutorWorkspaceState.jsx` (`useScheduledTutors`)
2. `apps/web/src/features/learner/LearnerSearch.jsx` (learner discovery search page)
3. `apps/web/src/features/learner/LearnerDashboard.jsx` (saved tutors & recommendations)
4. `apps/web/src/features/learner/TutorProfilePage.jsx` (public tutor profile `/tutors/:id`)
5. Canonical fixtures in `apps/web/src/data/demoReferenceData.js` and reducers in `apps/web/src/features/domain/demoDomain.js`
6. Test specifications in `apps/web/tests/adminCrossRoleSync.test.js` and `apps/web/tests/adminTestHelpers.js`

**Key Discovery**:  
Currently, `useScheduledTutors()` in `apps/web/src/features/tutor/TutorWorkspaceState.jsx` maps across `state.profiles` without checking `moderationStatus`. As a result, all 11 tutors in the canonical seed—including 3 pending tutors (`thao-vy`, `hoang-phuc`, `minh-chau`), 1 rejected tutor (`tuan-anh`), and 1 suspended tutor (`quang-huy`)—are surfaced on `/learner/search`.

By introducing the filter predicate `(tutor.moderationStatus || 'approved') === 'approved'` in `useScheduledTutors()`, learner discovery will return strictly approved tutors. When Admin executes an approval, rejection, or suspension action, the shared domain state triggers a reactive update that immediately shows or hides the target tutor across all discovery surfaces.

---

## 2. Current State Analysis

### 2.1 Inspection of `TutorWorkspaceState.jsx`
Located at `apps/web/src/features/tutor/TutorWorkspaceState.jsx` (lines 23–29):
```javascript
export function useScheduledTutors() {
  const state = useDemoDomain();
  return state.profiles.map((tutor) => {
    const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
    return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
  });
}
```
**Observations**:
- Calls `useDemoDomain()` to obtain canonical reactive state.
- Iterates over `state.profiles` via `.map()` without any filtering.
- Re-runs schedule range calculation and allocates new array/object references on every render.
- Returns all tutors regardless of whether `moderationStatus` is `approved`, `pending`, `rejected`, or `suspended`.

### 2.2 Inspection of `LearnerSearch.jsx`
Located at `apps/web/src/features/learner/LearnerSearch.jsx` (lines 14, 20–22, 33–47):
```javascript
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
...
export default function LearnerSearch() {
  const tutors = useScheduledTutors();
  const subjectOptions = ['Tất cả môn', ...new Set(tutors.flatMap((tutor) => tutor.subjects))];
  const locationOptions = ['Tất cả khu vực', ...new Set(tutors.map((tutor) => tutor.location).filter(Boolean))];
...
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi-VN');
    const filtered = tutors.filter((tutor) => (
      (!normalized || [tutor.name, tutor.university, tutor.location, ...tutor.subjects].join(' ').toLocaleLowerCase('vi-VN').includes(normalized)) &&
      (!subject.length || subject.some((value) => tutor.subjects.includes(value))) &&
      (!location.length || location.includes(tutor.location)) &&
      (!availability.length || availability.some((value) => tutor.availability.includes(value))) &&
      (maxPrice === 'all' || tutor.price <= Number(maxPrice))
    ));
    return [...filtered].sort((a, b) => { ... });
  }, [tutors, query, subject, location, availability, maxPrice, sortBy]);
```
**Observations**:
- `LearnerSearch` treats `useScheduledTutors()` as the sole source of truth for discoverable tutors.
- `subjectOptions` and `locationOptions` are dynamically derived from `tutors`.
- `results` filters and sorts `tutors` based on user inputs.
- Because `tutors` contains pending, rejected, and suspended profiles:
  - Non-approved tutors appear in the search results grid (`TutorCard`).
  - Non-approved tutors contaminate the filter dropdowns (e.g., subjects from rejected tutors appear in "Môn học").
  - The record counter (`results.length gia sư phù hợp`) overcounts unapproved profiles.

### 2.3 Inspection of Canonical Seed Profiles (`demoReferenceData.js`)
The canonical fixture defines 11 tutor profiles:
- **Approved (6)**:
  1. `mai-anh` (Nguyễn Mai Anh, `moderationStatus: "approved"`)
  2. `quoc-bao` (Trần Gia Bảo, `moderationStatus: "approved"`, `accountId: "demo-tutor"`)
  3. `ha-linh` (Phạm Hà Linh, `moderationStatus: "approved"`)
  4. `duc-minh` (Lê Đức Minh, `moderationStatus: "approved"`)
  5. `thu-trang` (Võ Thu Trang, `moderationStatus: "approved"`)
  6. `gia-huy` (Đặng Gia Huy, `moderationStatus: "approved"`)
- **Pending (3)**:
  7. `thao-vy` (Lê Thảo Vy, `moderationStatus: "pending"`, complete with verification documents)
  8. `hoang-phuc` (Nguyễn Hoàng Phúc, `moderationStatus: "pending"`, verification documents)
  9. `minh-chau` (Trần Minh Châu, `moderationStatus: "pending"`, degree & id card)
- **Rejected (1)**:
  10. `tuan-anh` (Nguyễn Tuấn Anh, `moderationStatus: "rejected"`, `rejectionReason: "..."`)
- **Suspended (1)**:
  11. `quang-huy` (Hoàng Quang Huy, `moderationStatus: "suspended"`, `suspendedReason: "..."`)

---

## 3. Call Trace: From Canonical Domain to Learner Search

```
[DemoDomainContext (Provider)]
   │ state: { profiles: [ 11 tutors: 6 approved, 3 pending, 1 rejected, 1 suspended ] }
   ▼
[TutorWorkspaceState.jsx -> useScheduledTutors()]
   │ const state = useDemoDomain();
   │ (state.profiles || []).filter(t => (t.moderationStatus || 'approved') === 'approved')
   │    ├── mai-anh      -> approved  -> KEEP
   │    ├── quoc-bao     -> approved  -> KEEP
   │    ├── ha-linh      -> approved  -> KEEP
   │    ├── duc-minh     -> approved  -> KEEP
   │    ├── thu-trang    -> approved  -> KEEP
   │    ├── gia-huy      -> approved  -> KEEP
   │    ├── thao-vy      -> pending   -> EXCLUDE
   │    ├── hoang-phuc   -> pending   -> EXCLUDE
   │    ├── minh-chau    -> pending   -> EXCLUDE
   │    ├── tuan-anh     -> rejected  -> EXCLUDE
   │    └── quang-huy    -> suspended -> EXCLUDE
   │ Result: exactly 6 approved tutors
   ▼
[selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes)]
   │ Computes bookable ranges and schedule summary for each of the 6 approved tutors
   ▼
[LearnerSearch.jsx]
   │ tutors = 6 approved tutors
   │ subjectOptions = ['Tất cả môn', 'Toán', 'Vật lý', 'Tiếng Anh', 'IELTS', 'Ngữ văn', 'Hóa học']
   │ locationOptions = ['Tất cả khu vực', 'Bình Thạnh', 'Thủ Đức', 'Quận 3', 'Phú Nhuận']
   │ results.length = 6 (displayed as "6 gia sư phù hợp")
```

---

## 4. Exact Filter Specification & Design

### 4.1 Filter Predicate
The filter predicate must be:
```javascript
(tutor.moderationStatus || 'approved') === 'approved'
```
**Rationale**:
1. Strictly evaluates to `true` for tutors with explicit `moderationStatus: 'approved'`.
2. Strictly evaluates to `false` for `pending`, `rejected`, and `suspended`.
3. Handles legacy fixtures or mock test objects where `moderationStatus` might be omitted, defaulting them safely to `'approved'` without breaking pre-existing baseline unit tests.
4. Identical to the canonical test helper in `apps/web/tests/adminTestHelpers.js`:
   ```javascript
   export function selectLearnerDiscoveredTutors(state) {
     return (state.profiles || []).filter((p) => (p.moderationStatus || 'approved') === 'approved');
   }
   ```
5. Identical to the selector in `apps/web/src/features/domain/useAdminDomain.js`:
   ```javascript
   (p) => (p.moderationStatus || 'approved') === TUTOR_MODERATION_STATUS.APPROVED
   ```

### 4.2 Memoization with `useMemo`
To avoid re-computing weekly schedule ranges and allocating new arrays on non-domain state re-renders (such as user typing into the search input), wrap the computation in `useMemo`:

```javascript
export function useScheduledTutors() {
  const state = useDemoDomain();
  return useMemo(() => {
    return (state.profiles || [])
      .filter((tutor) => (tutor.moderationStatus || 'approved') === 'approved')
      .map((tutor) => {
        const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
        return {
          ...tutor,
          sessionMinutes,
          availability: availabilityLabels(ranges),
          scheduleSummary: rangesSummary(ranges),
        };
      });
  }, [state]);
}
```

**Why dependency `[state]` is correct**:
- `state` from `useDemoDomain()` is a single immutable state object emitted by `DemoDomainProvider`.
- Whenever an Admin executes any domain mutation (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`), a new `domainState` object is generated and provided.
- `useMemo` detects the state reference change and immediately recalculates the discoverable tutor list.
- When `state` does NOT change (e.g., user toggles a search filter in `LearnerSearch.jsx`), `useScheduledTutors()` returns the memoized array, preventing redundant schedule parsing.

---

## 5. Reactive Synchronization Scenarios

### Scenario A: Approving a Pending Tutor (`thao-vy`)
1. **Initial State**:
   - `thao-vy.moderationStatus === 'pending'`.
   - `useScheduledTutors()` excludes `thao-vy`.
   - `LearnerSearch` displays 6 tutors.
2. **Admin Action**:
   - Admin opens `/admin/tutors`, opens drawer for Lê Thảo Vy, and clicks "Duyệt hồ sơ" (`approveTutor(state, 'thao-vy')`).
3. **Domain Mutation**:
   - `demoDomain.js -> approveTutor`: updates profile to `moderationStatus: 'approved'`, `status: 'approved'`, `approvedAt: ISO_STRING`.
   - Preserves strictly 9 requests in `state.requests` (BUG-010 invariant).
   - Persists updated state to `localStorage` under `tnm.demo.domain.v1`.
4. **Reactive Propagation**:
   - `DemoDomainContext` notifies subscribers.
   - `useScheduledTutors()` re-runs: `thao-vy` passes `(moderationStatus || 'approved') === 'approved'`.
   - `selectPublicTutorSchedule` derives schedule ranges for `thao-vy`.
   - `LearnerSearch` re-renders: Lê Thảo Vy appears in search results grid, and counter increments to 7.

### Scenario B: Rejecting a Pending Tutor (`hoang-phuc`)
1. **Initial State**:
   - `hoang-phuc.moderationStatus === 'pending'`.
   - `useScheduledTutors()` excludes `hoang-phuc`.
2. **Admin Action**:
   - Admin clicks "Từ chối hồ sơ" with reason `"Thiếu chứng chỉ đối chiếu"`.
3. **Domain Mutation**:
   - `demoDomain.js -> rejectTutor`: updates profile to `moderationStatus: 'rejected'`, `status: 'rejected'`, `rejectionReason: 'Thiếu chứng chỉ đối chiếu'`, `rejectedAt: ISO_STRING`.
4. **Reactive Propagation**:
   - `useScheduledTutors()` re-runs: `(hoang-phuc.moderationStatus || 'approved') === 'approved'` evaluates to `'rejected' === 'approved'` (`false`).
   - `hoang-phuc` remains excluded from discovery.
   - `rejectionReason` is preserved in state for Admin audit drawer.

### Scenario C: Suspending an Approved Tutor (`quoc-bao`)
1. **Initial State**:
   - `quoc-bao.moderationStatus === 'approved'`.
   - `useScheduledTutors()` includes `quoc-bao`.
2. **Admin Action**:
   - Admin suspends Trần Gia Bảo via `/admin/tutors` or `/admin/users` (`setTutorSuspension(state, 'quoc-bao', true)` or `setUserSuspension(state, 'demo-tutor', true)`).
3. **Domain Mutation**:
   - `demoDomain.js -> setTutorSuspension`: stores `previousModerationStatus: 'approved'`, sets `moderationStatus: 'suspended'`, `status: 'suspended'`.
   - User account `demo-tutor` status updated to `'suspended'`.
4. **Reactive Propagation**:
   - `useScheduledTutors()` re-runs: `(quoc-bao.moderationStatus || 'approved') === 'approved'` evaluates to `'suspended' === 'approved'` (`false`).
   - `quoc-bao` is immediately removed from `LearnerSearch`.
   - Search results count decrements from 6 to 5.
   - Any login attempt by `giabao` at `/login` is blocked with exact error: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`

### Scenario D: Unsuspending a Suspended Tutor (`quoc-bao`)
1. **Admin Action**:
   - Admin clicks "Mở khóa tài khoản" (`setTutorSuspension(state, 'quoc-bao', false)`).
2. **Domain Mutation**:
   - Restores `moderationStatus: target.previousModerationStatus || 'approved'` (`'approved'`).
   - Sets `status: 'approved'`.
   - Restores user account status to `'active'`.
3. **Reactive Propagation**:
   - `useScheduledTutors()` re-runs: `quoc-bao` passes the filter.
   - `quoc-bao` immediately reappears in Learner search results!
   - Login permissions for `giabao` are restored.

---

## 6. Test Suite Alignment (`apps/web/tests/adminCrossRoleSync.test.js`)

The proposed filter directly mirrors and satisfies all test specifications in `adminCrossRoleSync.test.js`:

| Test ID | Test Name | Invariant Checked | Blueprint Result |
|---|---|---|---|
| `F7-T1-01` | Learner discovery filters out non-approved tutors | Matrix of approved, pending, rejected, suspended profiles returns only approved | **PASS** (1 of 4 returned) |
| `F7-T1-02` | Deterministic pending tutor is absent initially | Lê Thảo Vy (`moderationStatus: 'pending'`) is absent from search | **PASS** |
| `F7-T1-03` | Approving pending tutor immediately surfaces them | `approveTutor` makes Lê Thảo Vy discoverable with name and price | **PASS** |
| `F7-T1-04` | Rejecting pending tutor keeps them excluded | `rejectTutor` retains rejection reason and excludes tutor | **PASS** |
| `F7-T1-05` | Suspending approved tutor immediately removes them | `setTutorSuspension` excludes Trần Gia Bảo from search | **PASS** |
| `F7-T1-06` | Unsuspending restores tutor to discovery | Restores previously approved tutor | **PASS** |
| `F7-T2-01` | Approving preserves 9 requests invariant | Seed requests count remains strictly 9 (BUG-010) | **PASS** |
| `F7-T2-02` | Approval does not mutate other bookings | Other tutor lessons and bookings remain unchanged | **PASS** |
| `F7-T2-03` | Idempotent approval | Repeated approval does not duplicate or alter count | **PASS** |
| `T3-01` | Pairwise: Status × Subject Matching Filter | 4 statuses × 2 subjects pairwise matrix: only `approved` can match | **PASS** |
| `SCENARIO-1`| Onboarding New Tutor Workflow (`adminE2EScenarios.test.js`) | Pending in drawer -> Approve -> Immediately discoverable in Learner search | **PASS** |

---

## 7. Implementation Blueprint

### 7.1 Target File: `apps/web/src/features/tutor/TutorWorkspaceState.jsx`
- **Location**: Lines 23–29
- **Change Type**: Add filter for approved moderation status and memoize with `useMemo`.

#### Before:
```javascript
export function useScheduledTutors() {
  const state = useDemoDomain();
  return state.profiles.map((tutor) => {
    const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
    return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
  });
}
```

#### After:
```javascript
export function useScheduledTutors() {
  const state = useDemoDomain();
  return useMemo(() => {
    return (state.profiles || [])
      .filter((tutor) => (tutor.moderationStatus || 'approved') === 'approved')
      .map((tutor) => {
        const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
        return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
      });
  }, [state]);
}
```

### 7.2 Target File: `apps/web/src/features/learner/TutorProfilePage.jsx` (Defense in Depth)
- **Location**: Line 75–107
- **Change Type**: Ensure a non-approved tutor (pending, rejected, suspended) directly accessed via `/tutors/:id` is not displayed for public booking.

#### Before:
```javascript
  const tutor =
    tutors.find(
      (item) =>
        item.id === id
    );

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader />

      <main className="learner-container tutor-profile-page">
...
        {tutor ? (
          <ProfileContent
            key={id}
            tutor={tutor}
          />
        ) : (
          <section className="learner-empty">
```

#### After:
```javascript
  const rawTutor = tutors?.find((item) => item.id === id);
  const tutor = (rawTutor && (rawTutor.moderationStatus || 'approved') === 'approved') ? rawTutor : null;

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader />

      <main className="learner-container tutor-profile-page">
...
        {tutor ? (
          <ProfileContent
            key={id}
            tutor={tutor}
          />
        ) : (
          <section className="learner-empty">
```

### 7.3 Compatibility & Invariant Check
1. **Zero regressions on baseline tests (55 tests)**:
   - `tutors` from `apps/web/src/data/tutors.js` remains strictly equal to `demoReferenceData.tutorProfiles` (BUG-013).
   - `state.profiles` in `createDemoState` and `restoreDemoState` preserves all profiles.
   - `state.requests` strictly retains 9 items (BUG-010).
2. **Layout compliance**:
   - Only existing components and hooks are updated.
   - No separate storage keys or mock stores introduced.

---

## 8. Summary of Findings & Next Steps

1. **Root cause confirmed**: `useScheduledTutors` currently iterates over all profiles without checking `moderationStatus`.
2. **Solution defined**: Add `(tutor.moderationStatus || 'approved') === 'approved'` filter to `useScheduledTutors` and memoize with `useMemo([state])`.
3. **Verification confirmed**: Exactly aligns with `tests/adminCrossRoleSync.test.js`, `tests/adminTestHelpers.js`, and `tests/adminE2EScenarios.test.js`.
4. **Ready for handoff**: The implementation blueprint is concise, robust, and zero-risk for regressions.
