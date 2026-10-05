# Original User Request

## 2026-10-04T18:16:59Z

Implement the complete Admin Flow subsystem for TutorNearMe based on the current project architecture, preserving existing Learner/Tutor invariants and connecting Admin into the single canonical shared domain.

Working directory: d:/tutor demo/TutorDemo
Integrity mode: development

## Requirements

### R1. Admin Shell & Navigation
- Provide a unified AdminShell with persistent `AdminHeader` and `AdminSidebar`.
- `AdminHeader`: Remove `RoleSwitcher` completely. Retain identity with avatar `AD` and label `Quản trị viên`. Add red logout button using Lucide `LogOut` that invokes the existing auth logout and navigates to `/login`.
- `AdminSidebar`: Manage active routes for `/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`. Badges reactively count pending tutor approvals, reviews needing moderation, and open/unresolved issues.

### R2. Canonical Shared Domain Architecture
- Do NOT create a separate Admin store, Admin localStorage key, or duplicate entity catalogs.
- Extend `src/data/demoReferenceData.js` and `src/features/domain/demoDomain.js` with explicitly defined canonical entities/fields required by Admin.
- Build clean Admin-facing adapters/hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) on top of the canonical shared domain.
- The UI layer must only consume these hooks so that future backend/REST API integration requires zero changes to Admin UI components.

### R3. Deterministic Admin Demo Seed Data
- Rich deterministic scenario in the canonical fixture without random generation or component-level mock data:
  - Tutors: pending (with university, subjects, fee, bio, submission date, illustrative document/card references for drawer review), approved, rejected, suspended.
  - Users: active Learner, active Tutor, suspended accounts.
  - Reviews: approved/public, pending moderation, hidden/rejected (referencing canonical Tutor/Lesson/User where known).
  - Issues: absence, lesson-time dispute, cancellation, fee dispute, attitude complaint across new/open, in progress, resolved states.

### R4. Cross-Role Reactive Synchronization & Login Enforcement
- Tutor approval: Admin approval updates canonical tutor moderation state and immediately reflects on Learner search and public tutor profile.
- Review moderation: Admin hiding a review immediately removes it from public tutor profiles; approving makes it visible.
- Account suspension: Admin suspending any Learner or Tutor account sets account status to suspended. The shared auth boundary must reject login attempts with: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."` Unsuspending restores login.

### R5. Admin Table & Detail Drawer UX
- 4 operational management pages (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`):
  - Instant text search
  - Status/category filter tabs
  - Record counter ("Hiển thị X / Y bản ghi")
  - Internally scrollable table with sticky header
  - Slide-over drawer for inspecting details, evidence, and executing decisions without losing table scroll or filter position
  - Responsive layout adapting gracefully on tablet/mobile viewports

### R6. Core Admin Operational Modules
- `/admin/tutors`: Tabs (Tất cả, Chờ duyệt, Đã duyệt, Đã từ chối, Tạm khóa). Table + Drawer with verification documents, Approve, Reject (with reason), Suspend/Unsuspend.
- `/admin/users`: Tabs (Tất cả, Học viên/Phụ huynh, Gia sư, Đang hoạt động, Đang bị khóa). Table + Drawer with profile/contact, activity counts from canonical domain, Suspend/Unsuspend.
- `/admin/reviews`: Tabs (Cần duyệt / Xem xét, Đã hiển thị, Đã ẩn). Table + Drawer with rating, full excerpt, related lesson info, Approve, Hide.
- `/admin/issues`: Tabs (Mới tiếp nhận, Đang xử lý, Đã giải quyết). Table + Drawer with description, related entities, status update, admin resolution note, mark resolved.

### R7. Admin Dashboard Integration & Scope Protection
- Replace fixed/mock numbers on `/admin/dashboard` with live reactive projections from the canonical domain.
- Do not redesign unrelated Learner/Tutor flows or alter established domain/scheduling invariants.

## Acceptance Criteria

### Shell & Navigation
- [ ] Admin header displays only avatar `AD`, `Quản trị viên`, and red `LogOut` button; `RoleSwitcher` is completely removed.
- [ ] Clicking logout clears session and navigates to `/login`.
- [ ] Sidebar highlights current active route and shows accurate reactive badge counters.

### Data & Architecture
- [ ] Single canonical domain in `tnm.demo.domain.v1`; no secondary Admin storage key or duplicate entity store created.
- [ ] Admin UI components only consume Admin hooks/selectors; no component-level business calculations or data mocking.

### Cross-Role Synchronization & Auth Guard
- [ ] Suspended accounts cannot log in at `/login`, showing `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`
- [ ] Unsuspended accounts log in normally.
- [ ] Approving a tutor makes them active and discoverable on Learner Search.
- [ ] Hiding a review removes it from `/tutors/:id` public view immediately.

### Operational Tables & Drawers
- [ ] `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` render with search, status tabs, record counter, sticky header, and slide-over drawers.
- [ ] Actions executed in drawers (approve, reject, suspend, hide, resolve) update table state and drawer immediately without breaking filter/scroll position.
- [ ] `/admin/dashboard` metrics and recent sections reflect live shared domain state.

### Quality & Verification
- [ ] All 55 existing unit tests pass without weakening assertions.
- [ ] New unit tests covering Admin actions (approve/reject, suspend/unsuspend, hide/approve review, resolve issue, auth suspension guard) pass 100%.
- [ ] Production build (`npm run build`) passes with zero errors.
- [ ] No layout/page overflow regressions on 1440px, 1024px, 390px viewports.

## Verification Resources
- Unit test suite: `npm run test` (in `apps/web`)
- Production build: `npm run build` (in `apps/web`)
- E2E / browser tests: `npm run test:e2e` (in `apps/web`)
- Regression notes: `docs/quality/FRONTEND_REGRESSION_NOTES.md`
