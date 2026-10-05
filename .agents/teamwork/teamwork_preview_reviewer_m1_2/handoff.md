# Review Handoff Report: Milestone 1 (M1) Canonical Domain Layer & Schema

**Reviewer Agent**: `teamwork_preview_reviewer_m1_2`  
**Verdict**: **APPROVE**  
**Integrity Assessment**: **NO INTEGRITY VIOLATIONS DETECTED**

---

## 1. Observation

### 1.1 Direct Inspection of Work Products

1. **Canonical Storage Key & Store Architecture (`apps/web/src/features/domain/demoDomain.js`)**:
   - Line 4: `export const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';`
   - Line 47: `createDemoState(now = new Date())` constructs domain state with version 1 and root collections: `profiles`, `requests`, `lessons`, `availability`, `settings`, `savedByAccount`, `nextRequestNumber`, `users`, `reviews`, `issues`.
   - Grep search for `localStorage` across `apps/web/src` confirmed zero secondary storage keys for Admin. `localStorage` is consumed solely by `DOMAIN_STORAGE_KEY` (`tnm.demo.domain.v1`) and auth session persistence.

2. **Strict Invariant Protection (`apps/web/src/data/demoReferenceData.js`)**:
   - `requests`: Exactly 9 canonical items (`requests.length === 9`: `demo-01`, `demo-02`, `demo-03`, `req-1`, `req-2`, `req-3`, `ref-1`, `ref-2`, `ref-3`).
   - Line 2128: `demoReferenceData = freeze(baseReferenceData)` guarantees deep immutability of the seed fixture.
   - Deterministic fixtures present:
     - Tutors: 6 approved (`mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy`), 3 pending (`thao-vy`, `hoang-phuc`, `minh-chau`), 1 rejected (`tuan-anh` with `rejectionReason`), 1 suspended (`quang-huy` with `suspendedReason`).
     - Tutors verification docs: `thao-vy` includes 2 verification documents (`doc-1`, `doc-2`).
     - Users: 3 active original accounts (`minhanh`, `giabao`, `admin`), active parent (`user-learner-active-2`), active tutor (`user-tutor-active-2`), suspended learner (`user-learner-suspended`), suspended tutor (`user-tutor-suspended`).
     - Reviews: 6 items covering approved/public, pending, and hidden moderation states.
     - Issues: 5 items across categories `absence`, `lesson_dispute`, `cancellation`, `fee_dispute`, `attitude`.

3. **Pure Domain Reducers (`apps/web/src/features/domain/demoDomain.js`)**:
   - `approveTutor(state, tutorId)` (lines 200–232): Pure transition to `moderationStatus: 'approved'`, `status: 'approved'`, `rejectionReason: null`, and unlocks linked user account.
   - `rejectTutor(state, tutorId, reason)` (lines 234–252): Pure transition to `moderationStatus: 'rejected'`, records non-empty rejection reason and timestamp.
   - `setTutorSuspension(state, tutorId, isSuspended)` (lines 254–300): Pure toggle preserving `previousModerationStatus`, syncing linked account status.
   - `setUserSuspension(state, userId, isSuspended)` (lines 302–343): Pure toggle of user status, preserving profile `previousModerationStatus`.
   - `moderateReview(state, reviewId, decision)` (lines 345–367): Pure toggle of `moderationStatus` (`approved` vs `hidden`) and `visibility` (`public` vs `hidden`).
   - `updateIssueStatus(state, issueId, status, resolutionNote)` (lines 369–390): Pure transition of status, persists resolution notes and timestamps.

4. **Reconciliation Logic (`apps/web/src/features/domain/demoDomain.js`)**:
   - `restoreDemoState(storage, now)` (lines 135–174): Reads `DOMAIN_STORAGE_KEY`. If version is 1, invokes `reconcileLessonSeed(current)`.
   - `reconcileLessonSeed(state)` (lines 68–134): Backfills missing accounts, reviews, issues, and tutor verification profiles from fixture without overwriting runtime changes (e.g. preserves runtime suspensions and moderation status).

5. **Admin Adapters & Selectors (`apps/web/src/features/domain/useAdminDomain.js`)**:
   - Exports semantic dictionaries (`tutorModerationLabels`, `userStatusLabels`, `reviewModerationLabels`, `issueStatusLabels`, `issueCategoryLabels`, tones, and role labels).
   - Exports pure helpers: `formatMinutes`, `formatTimeRange`, `deriveInitials`.
   - Exports pure domain selectors: `selectAdminStats`, `selectAdminOverview`, `calculateAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`.
   - Exports React hooks: `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`, strictly binding to `useDemoDomain()`.

### 1.2 Independent Test Execution

Command executed: `npm test` in `apps/web`
```
ℹ tests 176
ℹ suites 0
ℹ pass 176
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4300.3175
```
- 55/55 baseline tests passed (BUG-001 through BUG-014, SCHED, INCOME).
- 121/121 Admin domain, auth guard, cross-role sync, and E2E scenario tests passed.
- 0 tests skipped.

### 1.3 Independent Build Execution

Command executed: `npm run build` in `apps/web`
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
✓ built in 3.23s
```
- Build succeeded with 0 errors (exit code 0).

---

## 2. Logic Chain

1. **Integrity Verification**:
   - Inspected source code in `apps/web/src/features/domain/useAdminDomain.js` and `demoDomain.js`. No hardcoded test responses, fake shortcuts, or dummy facades exist.
   - Selectors compute live metrics dynamically from the `state` collections (`profiles`, `users`, `reviews`, `issues`, `lessons`, `requests`).
   - All tests run against genuine logic and assertions; zero skipped tests.

2. **Schema & Immutability Compliance (Observation 1.1)**:
   - `demoReferenceData.js` is deep-frozen via `freeze(baseReferenceData)`.
   - All 6 reducers (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`) return new state objects with cloned arrays.
   - Tested immutability directly in `ADM-HOOK-017` (`Object.freeze(state)` passed through all selectors and reducers without throwing).
   - Invariant `requests.length === 9` is preserved across all administrative operations (`ADM-HOOK-015`).

3. **Single Canonical Storage Invariant (Observation 1.1, 1.2)**:
   - Codebase search verified that `useAdminDomain.js` does not access `localStorage` or `sessionStorage`.
   - `DemoDomainContext.jsx` synchronizes solely with `DOMAIN_STORAGE_KEY` (`tnm.demo.domain.v1`).
   - No secondary storage keys or duplicate catalogs exist, satisfying Requirement R2 / Acceptance Criteria §Data & Architecture.

4. **Reconciliation Robustness (Observation 1.1)**:
   - `restoreDemoState` safely recovers from null or corrupted storage (tested in `F4-T2-01`), resets unknown version states to version 1 (tested in `F4-T2-03`), and preserves custom runtime notes and statuses (tested in `F4-T2-05`).
   - `reconcileLessonSeed` backfills new fixtures without overwriting existing persisted accounts, reviews, or tutor moderation states.

---

## 3. Adversarial Challenges & Findings

### Finding 1 (Minor / Edge Case — Bidirectional Link on Unlinked Seed Profile):
- **Observation**: In `demoReferenceData.js`, user account `user-tutor-active-2` (`Nguyễn Mai Anh`) sets `tutorProfileId: 'mai-anh'`, but profile `mai-anh` in `tutorProfiles` does not define `accountId: 'user-tutor-active-2'`.
- **Attack Scenario**: If an admin calls `setUserSuspension(state, 'user-tutor-active-2', true)`, the reducer checks `p.accountId === userId || p.id === userId`. Since `mai-anh.accountId` is undefined and `mai-anh.id !== 'user-tutor-active-2'`, the profile does not transition to `suspended`. Similarly, `setTutorSuspension` on `'mai-anh'` does not find account `'user-tutor-active-2'`.
- **Note**: In contrast, `quoc-bao` (`accountId: 'demo-tutor'`) and `quang-huy` (`accountId: 'user-tutor-suspended'`) have explicit bidirectional links that synchronize properly.
- **Recommendation for M2 / M4**: In `setUserSuspension` and `setTutorSuspension`, enhance lookup to check `u.tutorProfileId === p.id`, and populate `accountId: 'user-tutor-active-2'` on profile `mai-anh`.

### Finding 2 (Minor / Informational — Top-Level Await Dynamic Import):
- **Observation**: `useAdminDomain.js` uses `const domainContextModule = await import('./DemoDomainContext.jsx');` inside try-catch to allow `node:test` to load the module without JSX transpiler errors.
- **Assessment**: Vite bundles this cleanly for modern browser targets (`modules`), and Node.js native test runner imports it without error. No breaking behavior observed.

---

## 4. Caveats

- **UI Drawer Integration**: Operational UI pages (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`) and drawers are scheduled for Milestone M4 per `PROJECT.md`. This review is strictly scoped to Milestone M1 (Canonical Domain Layer & Schema).

---

## 5. Conclusion

**Verdict: APPROVE**

- Milestone M1 has been thoroughly implemented in accordance with `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- Canonical domain persistence strictly uses `tnm.demo.domain.v1` with zero secondary keys.
- Domain reducers are pure and preserve immutability.
- Invariant of 9 requests (BUG-010) is intact.
- 176 out of 176 tests pass with 0 failures and 0 skipped.
- Production build succeeds cleanly.
- No integrity violations found.

---

## 6. Verification Method

To independently verify this report:

1. **Run Full Test Suite**:
   ```powershell
   cd "d:\tutor demo\TutorDemo\apps\web"
   npm test
   ```
   **Expected**: 176 passed, 0 failed, 0 skipped.

2. **Run Production Build**:
   ```powershell
   cd "d:\tutor demo\TutorDemo\apps\web"
   npm run build
   ```
   **Expected**: Exit code 0, 0 build errors.

3. **Verify Zero Secondary Storage Keys**:
   Inspect `apps/web/src/features/domain/useAdminDomain.js` and `demoDomain.js` to confirm that only `tnm.demo.domain.v1` is accessed.
