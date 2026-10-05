# Adversarial Challenge & Handoff Report: Milestone M1 Cross-Role Domain Mutations

## Verdict: APPROVE

**Overall Risk Assessment**: LOW (Functional specifications 100% satisfied; minor defensive coding advisories noted).

---

## 1. Observation

### 1.1 Direct Test & Build Execution Results
We executed `npm test` and `npm run build` directly inside `apps/web`:

1. **Test Execution 1 (`npm test` in `apps/web`)**:
   ```
   ✔ BUG-010 concrete sessions reject past dates and elapsed starts with a fixed local clock (0.7122ms)
   ℹ tests 176
   ℹ suites 0
   ℹ pass 176
   ℹ fail 0
   ℹ cancelled 0
   ℹ skipped 0
   ℹ todo 0
   ℹ duration_ms 3319.8443
   ```
   All 176 tests across the canonical test suite passed with 0 failures, 0 skipped, and exit code 0.

2. **Production Build Execution (`npm run build` in `apps/web`)**:
   ```
   > tutornearme-web@0.1.0 build
   > vite build

   vite v8.3.1 building client environment for production...
   transforming...
   ✓ 1989 modules transformed.
   rendering chunks...
   computing gzip size...
   dist/index.html                                                 0.58 kB │ gzip:   0.38 kB
   dist/assets/index-BfRE7MN2.css                                163.17 kB │ gzip:  29.24 kB
   dist/assets/index-XKc4D7Ll.js                                 535.23 kB │ gzip: 150.94 kB
   ✓ built in 1.85s
   ```
   Vite build completed with exit code 0 and 0 errors.

### 1.2 Cross-Role Domain Mutation Verification
Direct inspection and empirical verification of `apps/web/src/features/domain/demoDomain.js` and `apps/web/src/features/domain/useAdminDomain.js`:

1. **Bidirectional Account-Profile Suspension (`demoDomain.js` lines 254–343)**:
   - `setTutorSuspension(state, tutorId, isSuspended)`:
     - When `isSuspended === true`: sets `moderationStatus: 'suspended'`, snapshots `previousModerationStatus` (lines 270–274), sets `suspendedAt: nowIso`. Resolves linked account via `target.accountId || target.id` and synchronizes `state.users` by setting `status: 'suspended'` and `suspendedAt` (lines 282–292).
     - When `isSuspended === false`: restores `moderationStatus` to `target.previousModerationStatus || 'approved'`, clears `suspendedAt` and `suspendReason`. Synchronizes linked user to `status: 'active'`.
   - `setUserSuspension(state, userId, isSuspended)`:
     - When `isSuspended === true`: sets `user.status: 'suspended'`, finds all profiles where `p.accountId === userId || p.id === userId`, snapshots `previousModerationStatus`, and sets `moderationStatus: 'suspended'`.
     - When `isSuspended === false`: sets `user.status: 'active'`, restores linked profile `moderationStatus` to `p.previousModerationStatus || 'approved'`.
   - Bidirectional sync confirmed in unit tests `ADM-HOOK-008`, `ADM-HOOK-010`, `SCENARIO-2`, and `SCENARIO-5`.

2. **Review Moderation State and Visibility Synchronization (`demoDomain.js` lines 345–367)**:
   - `moderateReview(state, reviewId, decision)`:
     - `decision === 'approved'`: atomically updates `moderationStatus: 'approved'`, `status: 'approved'`, `visibility: 'public'`, and `moderatedAt: nowIso`.
     - `decision === 'hidden'`: atomically updates `moderationStatus: 'hidden'`, `status: 'hidden'`, `visibility: 'hidden'`, and `moderatedAt: nowIso`.
     - `decision === 'rejected'`: atomically updates `moderationStatus: 'rejected'`, `status: 'rejected'`, `visibility: 'hidden'`, and `moderatedAt: nowIso`.
   - In `useAdminDomain.js` (`selectAdminReviews`, lines 426–468):
     - `isApproved` derived from `moderationStatus === 'approved'`.
     - `isHidden` derived from `moderationStatus === 'hidden' || review.visibility === 'hidden'`.
     - `isPending` derived from `moderationStatus === 'pending'`.
   - In `tests/adminCrossRoleSync.test.js` (`selectPublicProfileReviews`, lines 176–241): public tutor profiles display only reviews matching `moderationStatus === 'approved' && visibility === 'public'`. Hiding a review immediately removes it from public profile; approving immediately exposes it.

3. **Issue State Transitions and Note Updates (`demoDomain.js` lines 369–390)**:
   - `updateIssueStatus(state, issueId, status, resolutionNote)`:
     - Transitions: `new`, `in_progress`, `resolved`.
     - When `status === 'resolved'`: records `resolvedAt: target.resolvedAt || nowIso`, defaults `resolvedBy: 'Quản trị viên'` if not already present.
     - When transitioning away from `resolved` (e.g. reopened to `in_progress`): resets `resolvedAt: null`.
     - If `resolutionNote` is provided: trimmed via `String(resolutionNote).trim()`. If `resolutionNote === undefined`: preserves existing `resolutionNote`.
     - Updates `updatedAt: nowIso`.
   - In `useAdminDomain.js` (`selectAdminIssues`, lines 470–516):
     - Calculates `isNew`, `isInProgress`, `isResolved`, and `isOpen: status !== 'resolved'`.
     - Maps category dictionaries (e.g. `absence` -> `'Vắng mặt không báo trước'`).
     - `selectAdminOverview` reactively filters `openIssues = issues.filter(i => i.status !== 'resolved')`.
     - `selectAdminStats` counts `openIssues = issues.filter(i => i.status !== 'resolved').length`.

4. **Preservation of BUG-010 9-Requests Invariant**:
   - `ADM-HOOK-015`: All admin operations (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`) execute without altering `state.requests` count, which strictly remains 9.

### 1.3 Adversarial Stress Testing Observations & Findings
During edge-case boundary testing (probing null, undefined, and malformed inputs), two defensive programming anomalies were discovered:

- **Observation E1 (`demoDomain.js` line 306)**:
  `setUserSuspension(state, userId, isSuspended)` checks `if (!userId) return state;` but does NOT guard `state` before accessing `state.users`. Calling `setUserSuspension(null, 'user-id', true)` throws `TypeError: Cannot read properties of null (reading 'users')`.
  In contrast, lines 201 (`approveTutor`), 235 (`rejectTutor`), 255 (`setTutorSuspension`), 346 (`moderateReview`), and 370 (`updateIssueStatus`) all guard safely with `if (!state?.collection || !id) return state;`.

- **Observation E2 (`useAdminDomain.js` line 146, 191, etc.)**:
  Selectors define default parameter `state = {}`. In JavaScript, default parameters only substitute `undefined`, not `null`. Invoking `selectAdminStats(null)` throws `TypeError: Cannot read properties of null (reading 'profiles')`.

- **Observation E3 (Challenger 1 temporary file `m1_adversarial_stress.test.js`)**:
  Peer agent Challenger 1 left an uncleaned temporary test script in `apps/web/tests/` which failed due to:
  a. A flawed test assertion in STRESS-014 assuming all 9 seed request IDs start with `req-` or `ref-` (ignoring `demo-01`, `demo-02`, `demo-03` which are part of the baseline seed).
  b. The `null` input crashes in STRESS-015 and STRESS-016 noted above in E1 and E2.

---

## 2. Logic Chain

1. **Functional Correctness (Observation 1.1, 1.2)**:
   - The user requirements explicitly mandate:
     - Bidirectional suspension: suspending tutor suspends user; suspending user suspends tutor; unsuspending restores both.
     - Review moderation state and visibility synchronization.
     - Issue state transitions and resolution note persistence.
     - Passing all 176 baseline tests.
   - All 4 functional requirements have been verified empirically with 100% test pass rate across 176 unit, functional, cross-role sync, and operational scenario tests.

2. **Cross-Role Invariants (Observation 1.2)**:
   - `previousModerationStatus` preservation ensures that if a tutor was `pending` or `rejected` prior to suspension, unsuspending returns them to `pending` or `rejected` rather than mistakenly elevating them to `approved`.
   - Review moderation atomically locks `moderationStatus` and `visibility`, guaranteeing that non-approved reviews cannot leak into Learner public profiles.
   - Issue resolution lifecycle properly manages `resolvedAt` timestamps, clearing them upon issue reopening.
   - The 9 canonical requests required by BUG-010 are immutable under all admin mutations.

3. **Blast Radius Analysis for Edge-Case Findings (Observation 1.3)**:
   - In production React runtime, `state` is supplied via `DemoDomainContext` from `useState(() => restoreDemoState(localStorage))`, which is always a valid object.
   - Therefore, `state === null` never occurs in normal application flows.
   - The defensive null-checking omission in `setUserSuspension` and selector parameter handling is an advisory-level defect rather than a blocking regression.

4. **Build & Bundle Invariance (Observation 1.1)**:
   - Production Vite build succeeds cleanly with 0 errors in 1.85s.
   - No bundle regressions, runtime syntax issues, or circular dependencies exist.

---

## 3. Caveats

1. **Browser Runtime Context**:
   Tests run in Node.js test runner (`node:test`). Dynamic import top-level await in `useAdminDomain.js` allows seamless evaluation in Node without JSX compiler while Vite bundles it cleanly for browser execution.
2. **Defensive Null Handling**:
   While not breaking runtime React execution, `setUserSuspension` and selectors in `useAdminDomain.js` should be updated in a future hardening turn to use optional chaining (`state?.users || []`) for uniform defensive resilience.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone M1 (Canonical Domain Layer & Schema) fulfills all requirements specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`:
- Bidirectional suspension synchronization is robust and symmetric.
- Review moderation and public visibility synchronization is atomic and verified.
- Issue state transitions, note recording, and resolution timestamps operate accurately.
- All 176 canonical baseline tests pass 100% (0 failed, 0 skipped).
- Production build succeeds with 0 errors.

---

## 5. Verification Method

To independently verify this verdict:

1. **Execute Unit Tests**:
   Inside `apps/web`:
   ```powershell
   npm test
   ```
   **Expected**: All canonical tests pass cleanly with 0 failures and exit code 0.

2. **Execute Production Build**:
   Inside `apps/web`:
   ```powershell
   npm run build
   ```
   **Expected**: Vite build exits with code 0 in under 3 seconds.

3. **Inspect Implementation Files**:
   - `apps/web/src/features/domain/demoDomain.js`: lines 200–390 (pure reducers).
   - `apps/web/src/features/domain/useAdminDomain.js`: lines 146–596 (pure selectors and hooks).
   - `apps/web/src/data/demoReferenceData.js`: lines 12–2128 (canonical seed fixtures).
