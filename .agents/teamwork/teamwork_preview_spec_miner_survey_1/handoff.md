# Handoff Report: Admin Operational Pages & Cross-Role Sync Specification Mining

**Agent:** `teamwork_preview_spec_miner_survey_1`  
**Working Directory:** `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_spec_miner_survey_1`  
**Handoff Type:** Hard (Task Complete)  
**Target Specification Report:** `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_spec_miner_survey_1/spec_report.md`  

---

## 1. Observation

1. **`ORIGINAL_REQUEST.md` (lines 12–53)**:
   - **R1 (Admin Shell & Navigation)**:
     - `AdminHeader`: "Remove `RoleSwitcher` completely. Retain identity with avatar `AD` and label `Quản trị viên`. Add red logout button using Lucide `LogOut` that invokes the existing auth logout and navigates to `/login`." (line 14)
     - `AdminSidebar`: "Manage active routes for `/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`. Badges reactively count pending tutor approvals, reviews needing moderation, and open/unresolved issues." (line 15)
   - **R2 (Canonical Shared Domain Architecture)**:
     - "Do NOT create a separate Admin store, Admin localStorage key, or duplicate entity catalogs." (line 18)
     - "Extend `src/data/demoReferenceData.js` and `src/features/domain/demoDomain.js` with explicitly defined canonical entities/fields required by Admin." (line 19)
     - "Build clean Admin-facing adapters/hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) on top of the canonical shared domain." (line 20)
     - "The UI layer must only consume these hooks so that future backend/REST API integration requires zero changes to Admin UI components." (line 21)
   - **R3 (Deterministic Admin Demo Seed Data)**:
     - Fixtures required: Pending tutors (with university, subjects, fee, bio, submission date, document/card references), approved tutors, rejected tutors, suspended tutors; active Learner, active Tutor, suspended accounts; approved/public reviews, pending reviews, hidden/rejected reviews; issues across categories (`absence`, `lesson-time dispute`, `cancellation`, `fee dispute`, `attitude complaint`) across `new`/`open`, `in progress`, `resolved` states (lines 24–28).
   - **R4 (Cross-Role Reactive Synchronization & Login Enforcement)**:
     - "Tutor approval: Admin approval updates canonical tutor moderation state and immediately reflects on Learner search and public tutor profile." (line 31)
     - "Review moderation: Admin hiding a review immediately removes it from public tutor profiles; approving makes it visible." (line 32)
     - "Account suspension: Admin suspending any Learner or Tutor account sets account status to suspended. The shared auth boundary must reject login attempts with: `\"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.\"` Unsuspending restores login." (line 33)
   - **R5 (Admin Table & Detail Drawer UX)**:
     - 4 operational pages (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`): instant text search, status/category filter tabs, record counter (`"Hiển thị X / Y bản ghi"`), internally scrollable table with sticky header, slide-over drawer for inspecting details/evidence/executing decisions without losing table scroll or filter position, responsive layout (lines 36–42).
   - **R6 (Core Admin Operational Modules)**:
     - Exact tabs, table + drawer contents, and actions specified for each of the 4 operational pages (lines 45–48).
   - **R7 (Admin Dashboard Integration & Scope Protection)**:
     - "Replace fixed/mock numbers on `/admin/dashboard` with live reactive projections from the canonical domain." (line 51)
     - "Do not redesign unrelated Learner/Tutor flows or alter established domain/scheduling invariants." (line 52)
   - **Acceptance Criteria (lines 56–80)**:
     - Header logout clears session & navigates to `/login`.
     - Sidebar highlights active route & reactive counters.
     - Single canonical storage key `tnm.demo.domain.v1`.
     - Suspended accounts blocked with verbatim error message.
     - 55 existing unit tests pass without weakening assertions.
     - New unit tests for admin domain transitions & suspension auth guard pass 100%.
     - `npm run build` passes with zero errors.
     - No layout/overflow regressions on 1440px, 1024px, 390px.

2. **Existing Admin Implementation (`apps/web/src/features/admin/AdminDashboard.jsx`)**:
   - Line 98: `<RoleSwitcher />` is rendered directly in the header.
   - Line 98: Avatar is `<Avatar initials="AD" name="Quản trị viên" tone="slate" size="sm" /><span>Quản trị viên</span>`, but no red `LogOut` button exists.
   - Lines 86–87: Uses component local state `const [approvals, setApprovals] = useState(initialApprovals);` and `const [reviews, setReviews] = useState(initialReviews);` importing from `src/data/adminDashboard.js` (line 11), completely disconnected from the canonical shared domain.
   - Lines 13–22: Sidebar navigation items lack routes for users, tutors, reviews, and issues.

3. **Existing Auth Implementation (`apps/web/src/features/auth/DemoAuthContext.jsx`)**:
   - Lines 47–52: `login(identity, password)` checks `user.password !== password` and returns an error for credentials, but does **not** check whether `user.status === 'suspended'`.
   - Lines 53–57: `loginProvider(provider, phone)` returns account directly without checking whether `account.status === 'suspended'`.

4. **Existing Learner Search & Profile Implementation**:
   - `apps/web/src/features/learner/LearnerSearch.jsx` (lines 20, 33–47): Calls `useScheduledTutors()`, which iterates over `state.profiles` unconditionally without checking `moderationStatus`.
   - `apps/web/src/features/learner/TutorProfilePage.jsx` (lines 28–29, 573): Imports `profileReviews` statically from `../../data/tutorProfiles.js` rather than reading canonical reviews from `useDemoDomain()`.

5. **Existing Routes (`apps/web/src/App.jsx`)**:
   - Line 38: Only `/admin/dashboard` is registered. Routes for `/admin/tutors`, `/admin/users`, `/admin/reviews`, and `/admin/issues` are missing.

6. **Current Test Suite & Build Output**:
   - Running `npm run test` (`node --test`) in `apps/web`:
     ```
     ℹ tests 55
     ℹ suites 0
     ℹ pass 55
     ℹ fail 0
     ℹ duration_ms 1000.5197
     ```
     Exactly 55 unit tests pass.
   - Running `npm run build` in `apps/web`:
     ```
     vite v8.3.1 building client environment for production...
     ✓ 1989 modules transformed.
     ✓ built in 2.39s
     ```
     Production build succeeds cleanly with exit code 0.

---

## 2. Logic Chain

1. **Need for Single Shared Domain Extension (Observed in 1, 2, 4)**:
   Because `ORIGINAL_REQUEST.md` R2 strictly forbids secondary stores and requires reactive synchronization across roles (R4), Admin cannot continue using `src/data/adminDashboard.js`. All admin-managed entities (tutor moderation status, user suspension status, review moderation status, issue tickets) must reside within `state` in `tnm.demo.domain.v1`.
2. **Auth Guard Mechanism (Observed in 1, 3)**:
   In `DemoAuthContext.jsx`, both password login and provider login evaluate matching accounts from `allAccounts()`. Inserting a check `if (user.status === 'suspended') return { error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' };` immediately before persisting session directly enforces requirement R4 without breaking existing authentication flows.
3. **Learner Search Filtering (Observed in 1, 4)**:
   In `TutorWorkspaceState.jsx`, `useScheduledTutors` derives public tutor cards from `state.profiles`. Filtering for `p.moderationStatus === 'approved'` ensures that newly approved tutors become visible immediately, while pending, rejected, and suspended tutors are automatically excluded from search discovery.
4. **Public Profile Review Reactivity (Observed in 1, 4)**:
   Replacing the static `profileReviews` import in `TutorProfilePage.jsx` with a hook consuming `state.reviews.filter(r => r.tutorId === tutor.id && r.moderationStatus === 'approved')` ensures that Admin moderation actions (approve/hide) immediately propagate to the public view without page reload.
5. **Operational UX Consistency (Observed in 1, 2, 5)**:
   All four operational pages require identical layout behavior: search input, filter tabs, `"Hiển thị X / Y bản ghi"`, internally scrollable table with sticky `thead th`, and slide-over drawer that preserves table scroll and active filter. Building reusable primitives (`AdminShell`, `AdminDataTable`, `AdminDrawer`, `AdminToolbar`) satisfies R1, R5, and R6 cleanly.
6. **Quality Gate Assurance (Observed in 1, 6)**:
   The existing 55 unit tests confirm that scheduling, income projections, and request synchronization operate under tight invariants. New tests for Admin transitions and auth suspension must be added as independent tests without altering the 55 baseline tests.

---

## 3. Caveats

- **No Caveats.** All requirements, constraints, visual patterns, and invariants are fully documented in `spec_report.md` based on authoritative files.

---

## 4. Conclusion

The specification has been comprehensively mined, analyzed, and cataloged in `spec_report.md`. The design cleanly decouples Admin UI from the domain layer via 5 dedicated hooks, guarantees cross-role reactive synchronization, preserves existing Learner/Tutor scheduling invariants, and establishes clear quality gates (55 existing unit tests + new tests, clean build, 1440/1024/390px viewports).

The Feature Inventory defines 19 concrete items (`FEAT-ADM-001` through `FEAT-ADM-019`) with explicit verification conditions ready for architectural planning and implementation.

---

## 5. Verification Method

1. **Inspect Specification Catalog**:
   - Read `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_spec_miner_survey_1/spec_report.md` to verify all sections (R1–R7, Cross-Role Sync, Operational Pages, Acceptance Criteria, Feature Inventory, Edge Cases).
2. **Verify Baseline Test Count**:
   - Run `npm run test` from `apps/web`. Expected output: `pass 55`, `fail 0`.
3. **Verify Baseline Production Build**:
   - Run `npm run build` from `apps/web`. Expected output: exit code 0, clean build.
4. **Invalidation Conditions**:
   - Changing the single storage key away from `tnm.demo.domain.v1`.
   - Modifying the exact suspension error string: `'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'`.
   - Modifying the exact counter format: `'Hiển thị X / Y bản ghi'`.
   - Weakening or failing any of the 55 baseline unit tests.
