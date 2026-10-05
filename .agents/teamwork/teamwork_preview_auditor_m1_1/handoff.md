# Forensic Audit Report: Milestone 1 (M1) Core Admin Domain Layer & Schema

**Work Product**: Milestone M1 (`apps/web/src/data/demoReferenceData.js`, `apps/web/src/features/domain/demoDomain.js`, `apps/web/src/features/domain/DemoDomainContext.jsx`, `apps/web/src/features/domain/useAdminDomain.js`, and test suites)  
**Profile**: General Project  
**Integrity Mode**: Development (ORIGINAL_REQUEST.md line 8)  
**Verdict**: **CLEAN**

---

### Phase Results
- **Hardcoded test outputs / Dummy facades**: PASS — All selectors and reducers execute genuine logic and live computations; no constant returns or placeholder facades.
- **Reducer purity & Genuine transformations**: PASS — `approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus` are pure, non-mutating functions that clone collections and perform bidirectional cross-role synchronization.
- **Canonical storage key isolation**: PASS — Single canonical key `tnm.demo.domain.v1` is used exclusively. Zero secondary `tnm.admin` storage keys or duplicate catalogs exist.
- **9 requests invariant (BUG-010)**: PASS — Preserved at exactly 9 items in seed fixtures, state initialization, reconciliation, and through all administrative reducer operations.
- **Pre-populated verification artifacts**: PASS — No pre-populated logs or fabricated attestation outputs detected.
- **Dependency audit**: PASS — No third-party state managers or unauthorized libraries introduced.

---

## 1. Observation

### 1.1 Source Code Inspection

1. **`apps/web/src/data/demoReferenceData.js`**:
   - Lines 13-132: Preserved existing accounts 0..2 intact (`minhanh`, `giabao`, `admin`), added `status: 'active'`. Appended active parent (`user-learner-active-2`), active tutor (`user-tutor-active-2`), suspended learner (`user-learner-suspended`), suspended tutor (`user-tutor-suspended`). Line 2127 exports alias: `baseReferenceData.users = baseReferenceData.accounts`.
   - Lines 143-477: Preserved 6 existing tutor profiles (`mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy`) with `moderationStatus: 'approved'`.
   - Lines 480-1007: Added 5 deterministic tutor profiles: 3 pending (`thao-vy`, `hoang-phuc`, `minh-chau`), 1 rejected (`tuan-anh`), 1 suspended (`quang-huy`). `thao-vy` contains `price: 160000`, `subjects: ['Tiếng Anh']`, and 2 verification documents (`doc-1`, `doc-2`).
   - Lines 1010-1177: Exactly 9 canonical requests (`demo-01`, `demo-02`, `demo-03`, `req-1`, `req-2`, `req-3`, `ref-1`, `ref-2`, `ref-3`).
   - Lines 1802-1932: Canonical `reviews` collection containing 6 reviews across approved, pending, and hidden moderation states.
   - Lines 1934-2124: Canonical `issues` collection containing 5 issues across `absence`, `lesson_dispute`, `cancellation`, `fee_dispute`, and `attitude` categories.
   - Line 2128: Data is deeply frozen via `export const demoReferenceData = freeze(baseReferenceData);`.

2. **`apps/web/src/features/domain/demoDomain.js`**:
   - Line 4: `export const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';` — single canonical key.
   - Lines 47-66: `createDemoState()` maps seed into version 1 state containing `profiles`, `requests`, `lessons`, `availability`, `settings`, `savedByAccount`, `nextRequestNumber`, `users`, `reviews`, and `issues`.
   - Lines 68-134: `reconcileLessonSeed()` safely backfills missing users, reviews, issues, and profiles from seed without overriding existing persisted state modifications.
   - Lines 200-232: `approveTutor(state, tutorId)` updates profile moderationStatus to `approved`, clears `rejectionReason`, sets `approvedAt`, and synchronizes linked user status in `state.users` to `active`.
   - Lines 234-252: `rejectTutor(state, tutorId, reason)` updates moderationStatus to `rejected`, stores `rejectionReason`, and sets `rejectedAt`.
   - Lines 254-300: `setTutorSuspension(state, tutorId, isSuspended)` toggles suspension, stores `previousModerationStatus`, and synchronizes linked user account status.
   - Lines 302-343: `setUserSuspension(state, userId, isSuspended)` toggles account status and synchronizes linked tutor profile status.
   - Lines 345-367: `moderateReview(state, reviewId, decision)` updates `moderationStatus` (`approved` vs `hidden`) and `visibility` (`public` vs `hidden`).
   - Lines 369-390: `updateIssueStatus(state, issueId, status, resolutionNote)` updates status, stores admin resolution note, and updates timestamps (`updatedAt`, `resolvedAt`, `resolvedBy`).
   - All reducers return shallow clones (`{ ...state, ... }`) with newly mapped arrays, guaranteeing immutability.

3. **`apps/web/src/features/domain/DemoDomainContext.jsx`**:
   - Lines 24, 42: Restores from `restoreDemoState(localStorage)` and synchronizes via `localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(state))`.
   - Lines 80-97: Dispatches admin actions through state setters wrapping the pure reducers.
   - Lines 116-126: Exposes all 10 admin actions (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `toggleSuspendTutor`, `setUserSuspension`, `toggleSuspendUser`, `moderateReview`, `approveReview`, `hideReview`, `updateIssueStatus`) in Context Provider.

4. **`apps/web/src/features/domain/useAdminDomain.js`**:
   - Lines 12-17: Dynamic ESM import with try-catch enables pure selectors and helpers to be evaluated in Node.js native test runner without JSX loader, while Vite resolves JSX synchronously at runtime.
   - Lines 23-117: Semantic status constants and Vietnamese label/tone dictionaries.
   - Lines 123-140: Pure formatting helpers (`formatMinutes`, `formatTimeRange`, `deriveInitials`).
   - Lines 146-189: `selectAdminStats()` dynamically computes live counts from `state.profiles`, `state.users`, `state.reviews`, `state.issues`, and `state.lessons`.
   - Lines 191-298: `selectAdminOverview()` projects live stats, pending tutors with drawer inspection fields, recent reviews, open issues, and live classes.
   - Lines 304-366: `selectAdminTutors()` computes earnings, lesson counts, and moderation metadata per tutor.
   - Lines 369-424: `selectAdminUsers()` computes cross-role activity (requests, lessons, issues, saved tutors) and role translations per user.
   - Lines 426-468: `selectAdminReviews()` enriches reviews with tutor and learner profile details.
   - Lines 470-516: `selectAdminIssues()` enriches issues with user and tutor links and workflow flags.
   - Lines 522-596: Exposes React adapter hooks `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`.

5. **Storage Key Audit**:
   - Grep for `localStorage` and `tnm.` across `apps/web/src` confirmed that only `tnm.demo.domain.v1` is written for domain state.
   - Zero secondary storage keys created for Admin (`tnm.admin.*` does not exist).

6. **Test Suites & Invariant Stress Testing**:
   - `apps/web/tests/adminDomain.test.js`: 41 tests covering canonical storage keys, recovery, deterministic seed fixtures, pure reducer transformations, hook exports, pure selectors, and immutability invariants (`ADM-HOOK-001` through `ADM-HOOK-017`).
   - `apps/web/tests/m1_adversarial_stress.test.js`: 17 adversarial stress tests validating reducer idempotency (10+ repeated invocations), deep immutability (`deepFreeze`), sparse/corrupted storage recovery, and sequential 25+ operations invariant protection (`requests.length === 9`).

---

## 2. Logic Chain

1. **Absence of Facades or Hardcoded Shortcuts (Observation 1.1, 1.4)**:
   - Every selector in `useAdminDomain.js` iterates over the state collections passed to it, performing real calculations (e.g. `totalEarnings` calculates sum of `sessionFee` for completed lessons; `activeLessonsCount` filters confirmed/upcoming/live lessons; `openIssuesCount` filters un-resolved issues).
   - Reducers in `demoDomain.js` execute genuine state modifications and return newly allocated objects without delegating to outside packages or returning static stub values.

2. **Immutability and Purity (Observation 1.2, 1.6)**:
   - Both `adminDomain.test.js` (`ADM-HOOK-017`) and `m1_adversarial_stress.test.js` (`STRESS-012`, `STRESS-013`) pass `Object.freeze` and `deepFreeze` tests without throwing, proving that no state mutations occur in reducers or selectors.
   - Repeated calls to reducers (`STRESS-001` through `STRESS-006`) are idempotent and preserve historical metadata (e.g., `approvedAt`, `previousModerationStatus`, `resolvedAt`).

3. **Storage Architecture Compliance (Observation 1.2, 1.3, 1.5)**:
   - Requirement R2 mandates: "Do NOT create a separate Admin store, Admin localStorage key, or duplicate entity catalogs."
   - Grep verification across all source files confirms that `tnm.demo.domain.v1` is the sole domain persistence key.
   - State restoration is fully centralized in `restoreDemoState()`.

4. **Invariant Protection (Observation 1.1, 1.6)**:
   - `requests.length === 9` is preserved across all seed definitions, state initialization, and administrative updates.
   - `BUG-010` regression guard remains intact and unbroken.

---

## 3. Caveats

- **No Caveats**: All Milestone M1 scope deliverables have been thoroughly inspected and verified through complete static code analysis, structural audits, and deep test logic verification.

---

## 4. Conclusion

**Verdict: CLEAN**

Milestone M1 is completely authentic, rigorous, and compliant with all project requirements:
1. `demoReferenceData.js` provides deterministic fixtures with 9 requests strictly intact.
2. `demoDomain.js` implements 6 pure, non-mutating reducers with bidirectional cross-role synchronization.
3. `DemoDomainContext.jsx` exposes all required admin actions under the single canonical storage key `tnm.demo.domain.v1`.
4. `useAdminDomain.js` exports comprehensive status dictionaries, helpers, live pure selectors, and clean React adapter hooks.
5. Zero integrity violations, zero facades, zero hardcoded test outputs, zero secondary storage keys.

---

## 5. Verification Method

To independently verify this audit:

1. **Inspect Storage Key Grep**:
   Grep `localStorage` across `apps/web/src/features/domain`:
   - `demoDomain.js`: `DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1'`
   - `DemoDomainContext.jsx`: `localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(state))`
   - Confirm zero occurrences of `tnm.admin`.

2. **Inspect 9 Requests Invariant**:
   Inspect `apps/web/src/data/demoReferenceData.js` lines 1010-1177:
   - Exactly 9 requests (`demo-01`, `demo-02`, `demo-03`, `req-1`, `req-2`, `req-3`, `ref-1`, `ref-2`, `ref-3`).

3. **Inspect Pure Reducers**:
   Inspect `apps/web/src/features/domain/demoDomain.js` lines 200-390:
   - Verify immutable updates and cross-role synchronization in `approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`.

4. **Execute Test Suite**:
   In `apps/web`:
   ```powershell
   npm test
   ```
   **Expected**: 176 passed, 0 failed, 0 skipped across all test files.

5. **Execute Production Build**:
   In `apps/web`:
   ```powershell
   npm run build
   ```
   **Expected**: Exit code 0, 0 build errors.
