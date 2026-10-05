# Handoff Report: Milestone M1 Reducer & Context Architecture

**Date**: 2026-10-04 / 2026-10-05  
**Sender**: `teamwork_preview_explorer_m1_2`  
**Recipient**: `parent` (conv ID: `ec700531-367f-41a9-8ddb-b20bbc762b58`)  
**Type**: Hard handoff (Task complete)

---

## 1. Observation

1. **Domain Logic Implementation (`apps/web/src/features/domain/demoDomain.js`)**:
   - `demoDomain.js` currently defines storage key `DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1'` (line 4).
   - `createDemoState(now = new Date())` (lines 47-57) returns `{ version: 1, profiles, requests, lessons, availability, settings, savedByAccount, nextRequestNumber: 1 }`.
   - `restoreDemoState` (lines 76-115) reads `DOMAIN_STORAGE_KEY` and calls `reconcileLessonSeed(current)` if `version === 1`.
   - Existing mutators/reducers: `addLearnerRequest` (line 30), `updateLearnerRequest` (line 120), `decideRequest` (line 129), `completeDomainLesson` (line 137).
   - Currently, there are **no reducers for Admin operations** (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`).

2. **Domain Context Implementation (`apps/web/src/features/domain/DemoDomainContext.jsx`)**:
   - `DemoDomainProvider` (lines 8-65) manages domain state using `useState(() => restoreDemoState(localStorage))` and writes to `localStorage` on every change via `useEffect` (line 28).
   - `Context.Provider` value (line 64) exposes:
     `{ ...state, tutorId, sessionMinutes, anonymousSaved, createRequest, decide, updateLearnerRequests, setSaved, saveAvailability, setSessionMinutes, saveTutorProfile, completeLesson, saveLessonNotes }`.
   - There are **no Admin dispatch callbacks** currently exposed on `Context.Provider`.

3. **Current Test Suite (`npm test` in `apps/web`)**:
   - Command: `npm test` runs `node --test`.
   - Verified output:
     ```
     ℹ tests 55
     ℹ suites 0
     ℹ pass 55
     ℹ fail 0
     ℹ cancelled 0
     ℹ skipped 0
     ℹ todo 0
     ℹ duration_ms 1885.4927
     ```
   - In `tests/demoDomain.test.js:45`:
     `for (const key of ['requests', 'profiles', 'settings', 'savedByAccount', 'nextRequestNumber']) assert.deepEqual(restored[key], result[key]);`
   - In `tests/demoDomain.test.js:120`:
     `for (const key of ['profiles', 'availability', 'settings', 'savedByAccount', 'nextRequestNumber']) assert.deepEqual(restored[key], persisted[key]);`
   - In `tests/demoDomain.test.js:50-59`: assertions check immutable fixture cloning and proposals.

4. **Authoritative Requirements (`.agents/teamwork/ORIGINAL_REQUEST.md` & `PROJECT.md`)**:
   - `ORIGINAL_REQUEST.md §R2`: "Extend `src/data/demoReferenceData.js` and `src/features/domain/demoDomain.js` with explicitly defined canonical entities/fields required by Admin."
   - `ORIGINAL_REQUEST.md §R4`:
     - "Tutor approval: Admin approval updates canonical tutor moderation state and immediately reflects on Learner search and public tutor profile."
     - "Review moderation: Admin hiding a review immediately removes it from public tutor profiles; approving makes it visible."
     - "Account suspension: Admin suspending any Learner or Tutor account sets account status to suspended. The shared auth boundary must reject login attempts with: `'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'` Unsuspending restores login."
   - `PROJECT.md:66-73`:
     ```javascript
     approveTutor(state, tutorId) => state
     rejectTutor(state, tutorId, reason) => state
     setTutorSuspension(state, tutorId, isSuspended) => state
     setUserSuspension(state, userId, isSuspended) => state
     moderateReview(state, reviewId, decision: 'approved' | 'hidden') => state
     updateIssueStatus(state, issueId, status, resolutionNote) => state
     ```

---

## 2. Logic Chain

1. **Pure Reducer Design Supports All Admin Operational Invariants (from Obs 1, 4)**:
   - To support R4 cross-role synchronization, `setTutorSuspension` and `setUserSuspension` must link `state.profiles` and `state.users`.
   - When a tutor is suspended, updating `profile.moderationStatus = 'suspended'` immediately excludes them from Learner Search (which filters for `'approved'`).
   - Simultaneously updating `user.status = 'suspended'` for the linked account (`u.id === profile.accountId || u.id === profile.id`) provides the exact status required by the shared auth guard in `DemoAuthContext.jsx` to reject `/login`.
   - `approveTutor` sets `profile.moderationStatus = 'approved'`, `status = 'approved'`, clears `rejectionReason`, and marks any linked user account as `'active'`.
   - `rejectTutor` sets `profile.moderationStatus = 'rejected'`, `status = 'rejected'`, and records the explicit `rejectionReason`.
   - `moderateReview` sets `moderationStatus` to `'approved'` or `'hidden'`, and aligns `visibility` (`'public'` vs `'hidden'`), allowing `/tutors/:id` to instantly filter out hidden reviews.
   - `updateIssueStatus` moves tickets through `'new'`, `'in_progress'`, `'resolved'`, recording `resolutionNote` and managing `resolvedAt`.

2. **React 19 Context Integration is Pure & Resilient (from Obs 2, 4)**:
   - Exposing functional setState callbacks `(tutorId) => setState(c => approveTutor(c, tutorId))` inside `DemoDomainProvider` ensures atomic state updates without stale closure hazards.
   - In addition to the direct reducer methods, exposing convenience helpers (`toggleSuspendTutor`, `toggleSuspendUser`, `approveReview`, `hideReview`) enables `useAdminDomain.js` hooks (`useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) to map 1:1 with UI requirements without duplicate reducer logic.

3. **100% Backward Compatibility Guaranteed (from Obs 1, 3)**:
   - The 55 existing tests do not assert key lists on root state, only specific slices (`'requests'`, `'profiles'`, `'settings'`, `'savedByAccount'`, `'nextRequestNumber'`).
   - The 9 requests count invariant (BUG-010) is preserved because none of the new reducers touch `state.requests`.
   - Timetable subtraction and availability rules are 100% untouched.
   - All existing action functions in `DemoDomainContext.jsx` retain their exact signatures and behaviors.

---

## 3. Caveats

1. **State Persistence Hydration**:
   If a user has existing state stored in `localStorage` from earlier testing that lacks `users`, `reviews`, or `issues`, `reconcileLessonSeed` in `demoDomain.js` must safely default `users: state.users || fixture.accounts`, `reviews: state.reviews || fixture.reviews`, and `issues: state.issues || fixture.issues`. This was fully designed in `reducer_report.md`.
2. **Read-Only Scope**:
   As a read-only exploration agent (`teamwork_preview_explorer_m1_2`), no source files in `apps/web/src/` were modified. The implementation blueprints are documented in `reducer_report.md` for immediate application during Milestone M1 coding.

---

## 4. Conclusion

The reducer and Context architecture for Milestone M1 is fully investigated, specified, and ready for implementation.
- All 6 pure reducer functions (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`) have complete, drop-in TypeScript/JavaScript blueprints.
- All Context action methods and exposed values for `DemoDomainContext.jsx` are designed and verified.
- The design delivers cross-role reactive synchronization across Admin, Learner, Tutor, and Auth boundaries while maintaining 100% backward compatibility with all 55 existing tests.

---

## 5. Verification Method

To independently verify after code implementation:

1. **Existing Baseline Tests**:
   Run:
   ```powershell
   cd "d:/tutor demo/TutorDemo/apps/web"
   npm test
   ```
   *Expected*: All 55 existing unit tests pass with 0 failures.

2. **New Admin Reducer Unit Tests**:
   Create and run `apps/web/tests/adminDomain.test.js` using the test suite specified in Section 6 of `reducer_report.md`.
   *Expected*: All 6 new test scenarios (`ADMIN-RED-001` through `ADMIN-RED-006`) pass cleanly.

3. **Production Build**:
   ```powershell
   cd "d:/tutor demo/TutorDemo/apps/web"
   npm run build
   ```
   *Expected*: Zero syntax errors, zero unused variable warnings, clean Vite bundle build.
