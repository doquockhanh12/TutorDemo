# Handoff Report: Review & Adversarial Audit for Milestone 1 (M1)

## 1. Observation

### 1.1 Direct Inspection of Implemented Files
1. **`apps/web/src/data/demoReferenceData.js`**:
   - Lines 13–58: Original accounts 0..2 (`minhanh`, `giabao`, `admin`) strictly preserved with credentials `demo1234` and `status: 'active'`.
   - Lines 59–132: Appended active parent (`user-learner-active-2`), active tutor (`user-tutor-active-2`), suspended learner (`user-learner-suspended`), and suspended tutor (`user-tutor-suspended`). Line 2127 establishes `baseReferenceData.users = baseReferenceData.accounts`.
   - Lines 142–1007: Existing 6 tutor profiles (`mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy`) have `moderationStatus: 'approved'`. Appended 5 profiles: 3 pending (`thao-vy`, `hoang-phuc`, `minh-chau`), 1 rejected (`tuan-anh`), 1 suspended (`quang-huy`). `thao-vy` contains `price: 160000`, `subjects: ['Tiếng Anh']`, and 2 verification documents (`doc-1`, `doc-2`).
   - Lines 1010–1177: Canonical `requests` array contains exactly 9 items (`demo-01`, `demo-02`, `demo-03`, `req-1`, `req-2`, `req-3`, `ref-1`, `ref-2`, `ref-3`).
   - Lines 1520–1932: Canonical `reviews` collection contains 6 items across approved, pending, and hidden states.
   - Lines 1934–2124: Canonical `issues` collection contains 5 items covering `absence`, `lesson_dispute`, `cancellation`, `fee_dispute`, and `attitude` across `new`, `in_progress`, and `resolved` statuses.

2. **`apps/web/src/features/domain/demoDomain.js`**:
   - Lines 47–66 (`createDemoState`): Initializes single canonical state under version 1 with `users`, `reviews`, `issues`, and sets `requests` strictly from `seed.requests` (9 items).
   - Lines 68–134 (`reconcileLessonSeed`): Non-destructively backfills `users`, `reviews`, `issues`, and new tutor profile fixtures into pre-existing `localStorage` state without clearing existing runtime lessons or requests.
   - Lines 200–390: Implements 6 pure reducers with immutable update logic:
     - `approveTutor(state, tutorId)`
     - `rejectTutor(state, tutorId, reason)`
     - `setTutorSuspension(state, tutorId, isSuspended)`
     - `setUserSuspension(state, userId, isSuspended)`
     - `moderateReview(state, reviewId, decision)`
     - `updateIssueStatus(state, issueId, status, resolutionNote)`

3. **`apps/web/src/features/domain/DemoDomainContext.jsx`**:
   - Lines 116–126: Exposes all 6 reducers and ergonomic actions on `<Context.Provider value={{ ... }}>`: `approveTutor`, `rejectTutor`, `setTutorSuspension`, `toggleSuspendTutor`, `setUserSuspension`, `toggleSuspendUser`, `moderateReview`, `approveReview`, `hideReview`, `updateIssueStatus`.

4. **`apps/web/src/features/domain/useAdminDomain.js`**:
   - Lines 8–17: Utilizes top-level await try-catch dynamic import for `./DemoDomainContext.jsx` to prevent Node ESM loader failures (`ERR_UNKNOWN_FILE_EXTENSION`) during `node:test` execution while preserving standard synchronous hook usage in Vite/React.
   - Lines 23–117: Semantic dictionaries and constants (`TUTOR_MODERATION_STATUS`, `USER_STATUS`, `REVIEW_MODERATION_STATUS`, `ISSUE_STATUS`, and Vietnamese label/tone maps).
   - Lines 123–140: Formatting utilities (`formatMinutes`, `formatTimeRange`, `deriveInitials`).
   - Lines 146–516: Pure domain selectors (`selectAdminStats`, `selectAdminOverview`, `calculateAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`).
   - Lines 522–596: Dedicated Admin React hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`).

5. **`apps/web/tests/adminDomain.test.js`**:
   - Lines 46–148: Canonical persistence under `tnm.demo.domain.v1`, corrupted storage fallback, and 9-request invariant tests.
   - Lines 153–268: Deterministic seed fixture tests for pending/rejected/suspended tutors, multi-role users, reviews, and issues.
   - Lines 274–390: Pure reducer tests verifying state transitions, immutability, and safe non-existent ID handling.
   - Lines 484–748: 17 comprehensive unit tests (`ADM-HOOK-001` to `ADM-HOOK-017`) verifying live projections, cross-role synchronization, and deep immutability.

### 1.2 Independent Tool Execution Results
- **Unit Test Execution (`npm test` in `apps/web`)**:
  ```
  ℹ tests 176
  ℹ suites 0
  ℹ pass 176
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 4782.9517
  ```
  Result: 176 tests passed, 0 failed, 0 skipped. All 55 baseline scheduling/income tests pass without changes. All 121 Admin domain, auth guard, cross-role sync, operational, and E2E scenario tests pass.

- **Production Build Execution (`npm run build` in `apps/web`)**:
  ```
  vite v8.3.1 building client environment for production...
  ✓ 1989 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                                                 0.58 kB │ gzip:   0.38 kB
  dist/assets/index-BfRE7MN2.css                                163.17 kB │ gzip:  29.24 kB
  dist/assets/index-XKc4D7Ll.js                                 535.23 kB │ gzip: 150.94 kB
  ✓ built in 2.69s
  ```
  Result: Build succeeded with exit code 0 and zero errors.

---

## 2. Logic Chain

1. **Integrity & Authenticity Verification (from Observation 1.1 & 1.2)**:
   - Evaluated for hardcoded test results embedded in source code: Reducers and selectors operate purely on parameter state arrays (`profiles`, `users`, `reviews`, `issues`) and compute results dynamically without conditional branches for specific test identifiers.
   - Evaluated for dummy or facade implementations: Reducers perform genuine immutable cloning and state mutations (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`).
   - Evaluated for task shortcuts or fabricated verification logs: Independently executed `npm test` and `npm run build`; verified 176 passed tests and successful Vite compilation directly on Windows PowerShell.
   - Conclusion on integrity: ZERO integrity violations found.

2. **Conformance to Canonical Shared Domain Requirements (R2)**:
   - Persistence strictly targets `DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1'`; no secondary keys (`tnm.admin.*`) are accessed or created (`F4-T1-05`).
   - All Admin operations are centralized in `demoDomain.js` and surfaced through `useAdminDomain.js` adapter hooks. No duplicate stores or divergent models exist.

3. **Deterministic Seed Data Completeness (R3)**:
   - 3 pending tutors (`thao-vy`, `hoang-phuc`, `minh-chau`) include universities, subjects, fees, bios, submission dates, and verification documents (`doc-1`, `doc-2`), satisfying drawer inspection requirements.
   - 1 rejected tutor (`tuan-anh`) includes `rejectionReason`.
   - 1 suspended tutor (`quang-huy`) and 2 suspended accounts (`user-learner-suspended`, `user-tutor-suspended`) provide realistic suspension data.
   - 6 reviews and 5 issues cover all required categories and lifecycle statuses.

4. **Preservation of Critical Invariants**:
   - `requests.length` is strictly 9 in seed fixtures, state initialization, and across all admin reducer operations (`F4-T1-03`, `ADM-HOOK-015`), fully protecting `BUG-010`.
   - Accounts indices 0..2 (`minhanh`, `giabao`, `admin`) remain intact with existing credentials (`demo1234`), preserving all auth baseline tests.

5. **Adversarial Resilience & Edge Cases**:
   - Reducers safely handle `null`/`undefined` states or non-existent entity IDs without throwing uncaught exceptions (`F4-T2-06`).
   - Corrupted or unparseable JSON in `localStorage` safely falls back to version 1 seed state (`F4-T2-01`).
   - `ADM-HOOK-017` verifies that freezing state parameters does not cause mutation errors, guaranteeing pure functional updates.

---

## 3. Caveats

- **User-Profile Bidirectional Linking Observation (Low Risk)**:
  In `apps/web/src/features/domain/demoDomain.js`, `setTutorSuspension` and `setUserSuspension` link users and tutor profiles via `p.accountId === userId || p.id === userId` and `u.id === accountId || u.id === tutorId`. In `demoReferenceData.js`, seed account `user-tutor-active-2` has `tutorProfileId: 'mai-anh'`, while profile `mai-anh` has no explicit `accountId`. If `setUserSuspension(state, 'user-tutor-active-2', true)` is called, `mai-anh` would not be auto-suspended unless `u.tutorProfileId === p.id` is explicitly evaluated. This is low risk because the primary suspended tutor fixture (`quang-huy` / `user-tutor-suspended`) and `quoc-bao` / `demo-tutor` are explicitly linked by `accountId`. Recommend adding `u.tutorProfileId === p.id` matching in M2.
- **Top-Level Await in useAdminDomain.js**:
  The top-level await dynamic import `./DemoDomainContext.jsx` inside a try-catch block functions cleanly in Vite and Node native test runner. However, any module importing `useAdminDomain.js` in a non-async CommonJS context would need to support ESM top-level await. In this modern Vite/ESM frontend stack, this is fully supported and verified by `npm run build`.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 1 (M1) satisfies all architectural and functional requirements (R2, R3, R4 schema readiness):
1. Canonical domain layer in `tnm.demo.domain.v1` is clean, robust, and extensible.
2. Invariants (BUG-010 9 requests and accounts[0..2] credentials) are strictly preserved.
3. 176 out of 176 tests pass (100% pass rate, 0 skipped, 0 failed).
4. Production build (`npm run build`) builds cleanly with zero errors.
5. Zero integrity violations detected.

---

## 5. Verification Method

To independently verify this assessment:

1. **Run Unit Tests**:
   ```powershell
   cd "d:\tutor demo\TutorDemo\apps\web"
   npm test
   ```
   *Expected*: `ℹ pass 176`, `ℹ fail 0`, `ℹ skipped 0`.

2. **Run Production Build**:
   ```powershell
   cd "d:\tutor demo\TutorDemo\apps\web"
   npm run build
   ```
   *Expected*: `✓ built in ~2s`, exit code 0.

3. **Verify 9-Request Invariant & Credential Preservation**:
   Inspect `d:/tutor demo/TutorDemo/apps/web/src/data/demoReferenceData.js`:
   - `demoReferenceData.requests.length === 9`
   - `demoReferenceData.accounts[0].username === 'minhanh'`
   - `demoReferenceData.accounts[1].username === 'giabao'`
   - `demoReferenceData.accounts[2].username === 'admin'`
