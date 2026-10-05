# Handoff Report: Milestone M1 Schema & Fixture Exploration

## 1. Observation

1. **`apps/web/src/data/demoReferenceData.js` Lines 13-56**:
   - `accounts` contains exactly 3 entries:
     - Line 15: `id: "demo-learner"`, `username: "minhanh"`
     - Line 29: `id: "demo-tutor"`, `username: "giabao"`
     - Line 43: `id: "demo-admin"`, `username: "admin"`
   - Currently, none of the accounts have a `status` field (`'active'` or `'suspended'`).
   - Line 7 of `apps/web/src/features/auth/DemoAuthContext.jsx`: `const DEMO_USERS = demoReferenceData.accounts;`
   - Line 52 of `apps/web/tests/demoDomain.test.js`: `assert.equal(demoReferenceData.accounts.find((a) => a.id === 'demo-tutor').username, 'giabao');`
   - Line 166 of `apps/web/tests/demoDomain.test.js`: `const user = demoReferenceData.accounts[0];`
   - Line 39 of `apps/web/tests/e2e/auth-regressions.spec.js`: `await page.getByLabel(/^Email \*/).fill(demoReferenceData.accounts[0].email);`
   - Consequently, `accounts[0]`, `accounts[1]`, and `accounts[2]` must retain their exact order, username, email, and identity.

2. **`apps/web/src/data/demoReferenceData.js` Lines 65-395 (`tutorProfiles`)**:
   - Contains exactly 6 approved tutors: `mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy`.
   - None currently contain `moderationStatus`.
   - `quoc-bao` is linked to account `demo-tutor` (line 126: `accountId: "demo-tutor"`).
   - In `apps/web/src/data/adminDashboard.js` lines 1-5, pending approval entries exist only as isolated local mocks: `ap-1` (`Lê Thảo Vy`), `ap-2` (`Nguyễn Hoàng Phúc`), `ap-3` (`Trần Minh Châu`).

3. **`apps/web/src/data/demoReferenceData.js` Lines 397-564 (`requests`) & Strict Invariant**:
   - Lines 397-564 contain strictly 9 requests: `demo-01`, `demo-02`, `demo-03`, `req-1`, `req-2`, `req-3`, `ref-1`, `ref-2`, `ref-3`.
   - In `apps/web/tests/demoDomain.test.js` line 172: `assert.equal(state.requests.length, 9);`
   - Any modification adding or deleting from `requests` directly fails test BUG-010.

4. **`apps/web/src/data/demoReferenceData.js` Lines 907-1026 (`reviews`)**:
   - Contains 3 reviews: `review-1`, `review-2`, `review-3`. All 3 are currently `moderationStatus: "approved"`, `visibility: "public"`.
   - No pending moderation or hidden reviews exist in `demoReferenceData.js`.

5. **`apps/web/src/data/demoReferenceData.js` (absence of `issues`)**:
   - `issues` does not currently exist in `demoReferenceData.js`.
   - Only standalone mock issues exist in `apps/web/src/data/adminDashboard.js` lines 18-22 (`IS-2048`, `RP-1172`, `IS-2044`).

6. **`apps/web/src/features/domain/demoDomain.js` Lines 53-56 (`createDemoState`)**:
   ```javascript
   return applyApprovedDemoCleanup({ version: 1, profiles: seed.tutorProfiles, requests, lessons,
     availability: subtractLessons(weeklyScheduleRanges(seed.tutorProfiles.find((t) => t.id === CANONICAL_TUTOR_ID), dates), lessons),
     settings: Object.fromEntries(seed.tutorProfiles.filter((p) => p.accountId).map((p) => [p.id, { sessionMinutes: p.sessionMinutes }])),
     savedByAccount: Object.fromEntries(seed.learnerProfiles.map((p) => [p.accountId, p.savedTutorIds])), nextRequestNumber: 1 });
   ```
   - Currently, `createDemoState` does NOT include `users`, `reviews`, or `issues` in the returned state.
   - In `restoreDemoState` (lines 76-78):
   ```javascript
   const current = read(storage, DOMAIN_STORAGE_KEY);
   if (current?.version === 1 && Array.isArray(current.profiles) && Array.isArray(current.requests)) return reconcileLessonSeed(current);
   ```
   - When restoring an existing version 1 state that lacks `users`, `reviews`, or `issues`, `reconcileLessonSeed` only handles lessons and availability, leaving the new collections undefined unless backfilled during reconciliation.

---

## 2. Logic Chain

1. **Premise 1**: Tests and Auth depend on `demoReferenceData.accounts` being an array where index 0 is `demo-learner`, index 1 is `demo-tutor`, and index 2 is `demo-admin`.
   - **Inference**: Active status (`status: 'active'`) must be added to these three accounts without changing their indices, properties, or credentials. New accounts (active parent, active tutor, suspended learner, suspended tutor) must be appended at indices 3 through 6.
   - **Supported by**: Observation 1.

2. **Premise 2**: `BUG-010` asserts `state.requests.length === 9`.
   - **Inference**: The `requests` array in `demoReferenceData.js` must remain strictly untouched and maintain exactly 9 items.
   - **Supported by**: Observation 3.

3. **Premise 3**: Admin requires operational review across 4 statuses of tutors (`pending`, `approved`, `rejected`, `suspended`), reviews across 3 statuses (`approved`, `pending`, `hidden`), and issues across 5 categories (`absence`, `lesson_time_dispute`, `cancellation`, `fee_dispute`, `attitude_complaint`) and 3 states (`new`, `in_progress`, `resolved`).
   - **Inference**: `demoReferenceData.js` must be extended with deterministic seed fixtures for these entities, connecting them to canonical identities (`quoc-bao`, `mai-anh`, `demo-learner`, `demo-tutor`).
   - **Supported by**: Observations 2, 4, 5.

4. **Premise 4**: `createDemoState` is the single factory creating canonical domain state, while `restoreDemoState` restores and reconciles persisted state from `localStorage`.
   - **Inference**: `createDemoState` must incorporate `users: seed.accounts`, `reviews: seed.reviews`, and `issues: seed.issues`. To prevent regressions for existing persisted sessions, `reconcileDomainSeed` must check for missing entities and backfill them from fixture.
   - **Supported by**: Observation 6.

5. **Premise 5**: Admin UI must remain completely decoupled from data storage and business mutation logic.
   - **Inference**: Reducers (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`) must live in `demoDomain.js`, be exposed via `DemoDomainContext.jsx`, and be consumed through dedicated adapter hooks in `useAdminDomain.js`.
   - **Supported by**: Invariant R2 and PROJECT.md contract.

---

## 3. Caveats

1. **Two-Way Suspension Synchronization**: When suspending a tutor, if their profile has an `accountId`, the associated user account must also be set to `status: 'suspended'` (and vice versa) so login rejection is immediately enforced in cross-role sync.
2. **Deterministic Time Geometry**: Issue and review dates use deterministic relative and ISO strings (e.g. October 2026) to prevent test flakiness due to dynamic clock drift.
3. **No Database / No Server API**: All data structures operate purely within local frontend memory and `localStorage` key `tnm.demo.domain.v1`.

---

## 4. Conclusion

Milestone M1 is fully specified and ready for implementation.
The schema blueprint is written to:
`d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_1/schema_report.md`.

Summary of required code changes for implementation:
1. `apps/web/src/data/demoReferenceData.js`:
   - Append `moderationStatus: 'approved'` to existing 6 tutor profiles.
   - Add 3 pending tutors (`thao-vy`, `hoang-phuc`, `minh-chau`), 1 rejected tutor (`thanh-tung`), 1 suspended tutor (`quang-huy`) with illustrative documents.
   - Add `status: 'active'` to existing 3 accounts. Append 1 active parent, 1 active tutor, 1 suspended learner, 1 suspended tutor. Alias `users: accounts`.
   - Add 3 new reviews: 2 pending moderation (`review-4`, `review-5`) and 1 hidden/rejected (`review-6`).
   - Add canonical `issues` array containing 5 deterministic issues covering all categories and statuses.
   - Keep `requests` strictly at 9 items.
2. `apps/web/src/features/domain/demoDomain.js`:
   - Add `users`, `reviews`, `issues` to `createDemoState`.
   - Add seed backfilling for `users`, `reviews`, `issues`, and new profiles in `restoreDemoState`.
   - Implement domain reducers: `approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`.
3. `apps/web/src/features/domain/DemoDomainContext.jsx`:
   - Expose dispatch methods for the 6 new domain actions.
4. `apps/web/src/features/domain/useAdminDomain.js`:
   - Create new adapter hooks file exposing `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`.
5. `apps/web/tests/adminDomain.test.js`:
   - Add unit test suite verifying M1 domain state creation, reconciliation, actions, and invariants.

---

## 5. Verification Method

To verify the blueprint implementation:

1. **Execute Unit Test Suite**:
   ```powershell
   cd "d:\tutor demo\TutorDemo\apps\web"
   npm test
   ```
   - Expected: All 55 baseline unit tests pass 100%.
   - Expected: New unit tests in `tests/adminDomain.test.js` pass 100%.

2. **Verify 9-Request Invariant**:
   - Ensure `tests/demoDomain.test.js` passes assertion:
     `assert.equal(state.requests.length, 9);`

3. **Verify Production Build**:
   ```powershell
   cd "d:\tutor demo\TutorDemo\apps\web"
   npm run build
   ```
   - Expected: Clean build with 0 TypeScript/ESLint/Vite bundle errors.

4. **Invalidation Conditions**:
   - If `demoReferenceData.requests.length !== 9`, this handoff is invalidated.
   - If `demoReferenceData.accounts[0].id !== 'demo-learner'`, this handoff is invalidated.
   - If existing `quoc-bao` income calculations diverge from baseline tests, this handoff is invalidated.
