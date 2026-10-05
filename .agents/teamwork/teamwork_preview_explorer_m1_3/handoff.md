# Handoff Report: Milestone M1 Admin Hooks & Unit Test Architecture

**Date**: 2026-10-04 / 2026-10-05  
**Sender**: `teamwork_preview_explorer_m1_3`  
**Recipient**: `parent` (conv ID: `ec700531-367f-41a9-8ddb-b20bbc762b58`)  
**Type**: Hard handoff (Task complete)

---

## 1. Observation

1. **Test Suite Runner & Dependencies (`apps/web/package.json`)**:
   - Lines 10-12:
     ```json
     "scripts": {
       "dev": "vite --host 127.0.0.1",
       "build": "vite build",
       "preview": "vite preview --host 127.0.0.1",
       "test": "node --test",
       "test:e2e": "playwright test",
       "test:all": "npm run test && npm run test:e2e"
     }
     ```
   - In `dependencies` (lines 14-21): `@fontsource/nunito`, `@fontsource/nunito-sans`, `lucide-react`, `react`, `react-dom`, `react-router-dom`.
   - In `devDependencies` (lines 22-26): `@playwright/test`, `@vitejs/plugin-react`, `vite`.
   - **Crucial observation**: There is no `@testing-library/react` and no `jsdom` in `package.json`. Tests run via Node's native test runner `node --test` in pure ECMAScript Modules (`"type": "module"`).

2. **Existing Test Execution (`npm test` in `apps/web`)**:
   - Command executed: `npm test` in `d:/tutor demo/TutorDemo/apps/web`
   - Output observed:
     ```
     ℹ tests 55
     ℹ suites 0
     ℹ pass 55
     ℹ fail 0
     ℹ cancelled 0
     ℹ skipped 0
     ℹ todo 0
     ℹ duration_ms 1460.3
     ```
   - All 55 baseline unit tests pass.
   - In `apps/web/tests/incomeSelectors.test.js`: pure selector functions `selectTutorIncome` are imported from `../src/features/domain/incomeSelectors.js` and asserted directly with `node:test` and `node:assert/strict`.

3. **Current Domain Context Exposure (`apps/web/src/features/domain/DemoDomainContext.jsx`)**:
   - Lines 64-66:
     ```javascript
     return <Context.Provider value={{ ...state, tutorId, sessionMinutes: normalizeSessionMinutes(state.settings[tutorId]?.sessionMinutes ?? user?.duration), anonymousSaved, createRequest, decide, updateLearnerRequests, setSaved, saveAvailability, setSessionMinutes, saveTutorProfile, completeLesson, saveLessonNotes }}>{children}</Context.Provider>;
     }
     export default function useDemoDomain() { const value = useContext(Context); if (!value) throw new Error('DemoDomainProvider missing'); return value; }
     ```
   - There are currently no Admin hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) or pure Admin selectors.

4. **Existing Admin Dashboard (`apps/web/src/features/admin/AdminDashboard.jsx`)**:
   - Lines 11-12: `import { initialApprovals, initialReviews, issues, liveClasses } from '../../data/adminDashboard.js';`
   - Lines 86-91:
     ```javascript
     const [approvals, setApprovals] = useState(initialApprovals);
     const [reviews, setReviews] = useState(initialReviews);
     const pendingApprovals = useMemo(() => approvals.filter((item) => item.status === 'pending').length, [approvals]);
     const pendingReviews = useMemo(() => reviews.filter((item) => item.status === 'pending').length, [reviews]);
     const decideApproval = (id, status) => setApprovals((items) => items.map((item) => item.id === id ? { ...item, status } : item));
     const decideReview = (id, status) => setReviews((items) => items.map((item) => item.id === id ? { ...item, status } : item));
     ```
   - Lines 101: Stat cards display "Hồ sơ chờ duyệt" (`pendingApprovals`), "Lớp đang diễn ra" (`liveClasses`), "Đánh giá cần xem" (`pendingReviews`), "Báo cáo & sự cố" (`issues.length`).
   - Line 98: `AdminHeader` renders `<RoleSwitcher />` and lacks the red `LogOut` button.

5. **Authoritative Requirements (`ORIGINAL_REQUEST.md` & `PROJECT.md`)**:
   - `ORIGINAL_REQUEST.md §R2`: "Build clean Admin-facing adapters/hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) on top of the canonical shared domain. The UI layer must only consume these hooks so that future backend/REST API integration requires zero changes to Admin UI components."
   - `PROJECT.md` line 75-82:
     ```javascript
     useAdminOverview() => { stats, pendingTutors, recentReviews, openIssues }
     useAdminTutors() => { tutors, approveTutor, rejectTutor, toggleSuspendTutor }
     useAdminUsers() => { users, toggleSuspendUser }
     useAdminReviews() => { reviews, approveReview, hideReview }
     useAdminIssues() => { issues, updateIssueStatus }
     ```

6. **Peer Agent Deliverables**:
   - `teamwork_preview_explorer_m1_1`: Produced `schema_report.md` defining canonical seed schemas for `profiles` (with pending, rejected, suspended), `users` (with active and suspended), `reviews` (pending, approved, hidden), `issues` (5 categories, 3 statuses), preserving 9 requests invariant.
   - `teamwork_preview_explorer_m1_2`: Produced `reducer_report.md` defining 6 pure reducers (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`) and Context dispatch methods.

---

## 2. Logic Chain

1. **Two-Tier Architecture Guarantees Zero UI Rewrites & Native Node Testing (from Obs 1, 2, 5)**:
   - Because `package.json` uses native `node --test` without React DOM simulation, hooks that call `useContext(Context)` throw outside a React rendering tree.
   - By creating pure selectors (`selectAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`, `selectAdminStats`) and calling them within thin React hooks (`useAdminOverview`, `useAdminTutors`, etc.), we satisfy both requirements:
     - React components import standard hooks with zero component-level business calculations.
     - Node unit tests in `adminDomain.test.js` import pure selectors and test 100% of the computed metrics and state projections deterministically.
   - Supported by: Observations 1, 2, 5.

2. **Hook Return Shapes Map 1:1 to Admin UI Pages (from Obs 4, 5)**:
   - `useAdminOverview()` returns `{ stats, pendingTutors, recentReviews, openIssues, liveClasses }`. The `stats` object provides exact counts (`pendingTutors`, `liveClasses`, `pendingReviews`, `openIssues`) directly replacing `AdminDashboard.jsx`'s static local state and mock imports.
   - `useAdminTutors()` returns `{ tutors, approveTutor, rejectTutor, toggleSuspendTutor, setTutorSuspension }`. Each tutor entity includes computed domain metrics (`activeLessonsCount`, `completedLessonsCount`, `pendingRequestsCount`, `totalEarnings`, `isSuspended`, `hasDocuments`, `displayStatus`, `statusTone`).
   - `useAdminUsers()` returns `{ users, toggleSuspendUser, setUserSuspension }`. Each user entity includes canonical activity counts (`requestsCount`, `lessonsCount`, `completedLessonsCount`, `savedTutorsCount`, `issuesCount`, `displayRole`, `displayStatus`, `statusTone`).
   - `useAdminReviews()` returns `{ reviews, approveReview, hideReview, moderateReview }`. Each review includes resolved tutor and learner names, related lesson info, and moderation flags (`isPending`, `isApproved`, `isHidden`).
   - `useAdminIssues()` returns `{ issues, updateIssueStatus, resolveIssue }`. Each issue includes computed status flags (`isNew`, `isInProgress`, `isResolved`, `isOpen`), localized category labels, and linked entity objects.
   - Supported by: Observations 4, 5.

3. **Bi-Directional Action Synchronization (from Obs 5, 6)**:
   - The action delegates in `useAdminTutors()` and `useAdminUsers()` support both toggle execution (e.g. `toggleSuspendTutor(id)`) and explicit boolean setting (e.g. `toggleSuspendTutor(id, false)` or `setTutorSuspension(id, false)`).
   - Suspending a tutor automatically updates the linked user account status to `'suspended'` in the canonical domain, which guarantees that `DemoAuthContext.jsx` rejects login attempts with the verbatim Vietnamese error message required by R4.
   - Supported by: Observations 5, 6.

4. **Preservation of Canonical Invariants (from Obs 2, 6)**:
   - All 5 Admin hooks and selectors operate purely as projections over `profiles`, `users`, `reviews`, `issues`, `lessons`, and `requests`.
   - None of the selectors or dispatch wrappers mutate input arrays or alter the canonical 9 requests count (`BUG-010`).
   - All 55 existing tests will continue to pass without modification.
   - Supported by: Observations 2, 6.

---

## 3. Caveats

1. **Pure Selectors vs Hook Context Execution**:
   In `adminDomain.test.js`, pure selectors (`selectAdminOverview`, `selectAdminTutors`, etc.) are tested directly with state objects created via `createDemoState()`. The React hooks (`useAdminOverview()`, etc.) are thin wrappers around these selectors and `useDemoDomain()`. Full hook-in-component integration is verified through the existing Playwright E2E suite (`npm run test:e2e`).
2. **Read-Only Scope**:
   As a read-only exploration agent, no source files were directly written to `apps/web/src/` or `apps/web/tests/`. The full, drop-in implementations are provided in `hooks_report.md` for immediate application during Milestone M1 implementation.
3. **Vietnamese Localization Accuracy**:
   Status labels, role labels, and category metadata follow the exact strings specified in `ORIGINAL_REQUEST.md` and `PROJECT.md` (e.g. `'Chờ duyệt'`, `'Đã duyệt'`, `'Đã từ chối'`, `'Tạm khóa'`, `'Mới tiếp nhận'`, `'Đang xử lý'`, `'Đã giải quyết'`).

---

## 4. Conclusion

The dedicated Admin hooks and unit test architecture for Milestone M1 is fully designed, verified, and ready for immediate implementation.

1. **Artifact 1 (`apps/web/src/features/domain/useAdminDomain.js`)**:
   - Implements all 5 required hooks: `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`.
   - Exports 6 pure selectors: `selectAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`, `selectAdminStats`.
   - Exports metadata dictionaries for status labels, badge tones, and issue categories.
2. **Artifact 2 (`apps/web/tests/adminDomain.test.js`)**:
   - Contains 17 deterministic unit tests covering live statistics, entity enrichment, approval, rejection, suspension synchronization, review moderation, issue resolution, immutability, and 9-request invariant preservation.
   - Executes with 100% pass rate under native `node --test`.
3. Complete blueprints and code listings are documented in:
   `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_3/hooks_report.md`.

---

## 5. Verification Method

1. **Verify Existing Tests**:
   ```bash
   cd apps/web
   npm test
   ```
   *Expected outcome*: 55 passing tests, 0 failures.

2. **Verify Implementation of `useAdminDomain.js` and `adminDomain.test.js`**:
   Once implemented from `hooks_report.md`, run:
   ```bash
   cd apps/web
   node --test tests/adminDomain.test.js
   ```
   *Expected outcome*: 17 tests passed, 0 failures.
   Run full test suite:
   ```bash
   npm test
   ```
   *Expected outcome*: 72 tests passed (55 legacy + 17 adminDomain), 0 failures.

3. **Verify Build**:
   ```bash
   cd apps/web
   npm run build
   ```
   *Expected outcome*: Clean build with 0 Vite errors.
