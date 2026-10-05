# Project: TutorNearMe Admin Flow Subsystem

## Architecture
- **Single Canonical Domain**: State is centered in `apps/web/src/features/domain/demoDomain.js` and persisted via `localStorage` key `tnm.demo.domain.v1` under `DemoDomainProvider` in `App.jsx`. No secondary storage keys or duplicate entity catalogs.
- **Admin Adapters & Hooks**: Dedicated domain hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) expose pure selectors and domain dispatchers. Admin UI components strictly consume these hooks, ensuring zero UI rewrites when moving to backend APIs.
- **Cross-Role Synchronizations**:
  - Auth boundary in `DemoAuthContext.jsx` queries account suspension status before session persistence, rejecting suspended users with exact Vietnamese message: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`.
  - Learner discovery (`useScheduledTutors`) filters for `moderationStatus === 'approved'`.
  - Public profile (`TutorProfilePage.jsx`) filters reviews from canonical domain for `moderationStatus === 'approved'` and `visibility === 'public'`.
- **Operational UI**:
  - `AdminShell` encapsulates persistent `AdminHeader` (avatar `AD`, label `Quản trị viên`, red `LogOut` button, no `RoleSwitcher`) and `AdminSidebar` (active route highlighting, reactive pending badges).
  - 4 operational pages (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`) provide instant search, status filter tabs, record counter (`"Hiển thị X / Y bản ghi"`), sticky header table, and slide-over drawers for in-place inspection and decision execution without losing table scroll or filter position.
  - `/admin/dashboard` renders live projections directly from the canonical domain.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| FEAT-ADM-001 | Shell Layout & Routing | Unified AdminShell wrapping persistent Header and Sidebar; register `/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` in App.jsx | M3 | ORIGINAL_REQUEST §R1 |
| FEAT-ADM-002 | Header Identity & Logout | Avatar `AD`, label `Quản trị viên`, complete removal of `RoleSwitcher`, red `LogOut` button that clears auth session and navigates to `/login` | M3 | ORIGINAL_REQUEST §R1 |
| FEAT-ADM-003 | Sidebar Navigation & Badges | Highlight active routes and show reactive counters for pending tutors, moderation-needed reviews, and open issues | M3 | ORIGINAL_REQUEST §R1 |
| FEAT-ADM-004 | Canonical Domain Schema | Extend `demoReferenceData.js` and `demoDomain.js` with `users`, `reviews`, `issues` in `tnm.demo.domain.v1` while strictly preserving 9 seed requests | M1 (DONE) | ORIGINAL_REQUEST §R2 |
| FEAT-ADM-005 | Admin Domain Hooks | Implement `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues` adapters | M1 (DONE) | ORIGINAL_REQUEST §R2 |
| FEAT-ADM-006 | Deterministic Seed Fixtures | Populate deterministic tutors (pending with uni/docs/bio/fee, approved, rejected, suspended), users (learner, tutor, suspended), reviews, and issues | M1 (DONE) | ORIGINAL_REQUEST §R3 |
| FEAT-ADM-007 | Tutor Moderation Sync | Approving tutor updates domain status and immediately surfaces tutor on Learner search and public profile | M2 | ORIGINAL_REQUEST §R4 |
| FEAT-ADM-008 | Review Moderation Sync | Hiding review immediately removes it from public tutor profiles; approving displays it | M2 | ORIGINAL_REQUEST §R4 |
| FEAT-ADM-009 | Auth Suspension Guard | Shared auth rejects suspended login attempts with verbatim message: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`; unsuspending restores login | M2 | ORIGINAL_REQUEST §R4 |
| FEAT-ADM-010 | Table Sticky & Scroll UX | Internally scrollable table with sticky header and `"Hiển thị X / Y bản ghi"` counter across all 4 operational pages | M4 | ORIGINAL_REQUEST §R5 |
| FEAT-ADM-011 | Slide-over Drawer UX | Inspect details and execute actions without losing table scroll or filter state; smooth scrim and focus trapping | M4 | ORIGINAL_REQUEST §R5 |
| FEAT-ADM-012 | Responsive Management UX | Graceful adaptation for desktop (1440px), tablet (1024px), mobile (390px) viewports with zero horizontal overflow | M4 | ORIGINAL_REQUEST §R5 |
| FEAT-ADM-013 | Tutor Management Page | Tabs: Tất cả, Chờ duyệt, Đã duyệt, Đã từ chối, Tạm khóa; Table + Drawer with verification docs, Approve, Reject (with reason), Suspend/Unsuspend | M4 | ORIGINAL_REQUEST §R6 |
| FEAT-ADM-014 | User Management Page | Tabs: Tất cả, Học viên/Phụ huynh, Gia sư, Đang hoạt động, Đang bị khóa; Table + Drawer with profile/contact, activity counts, Suspend/Unsuspend | M4 | ORIGINAL_REQUEST §R6 |
| FEAT-ADM-015 | Review Management Page | Tabs: Cần duyệt / Xem xét, Đã hiển thị, Đã ẩn; Table + Drawer with rating, full excerpt, related lesson info, Approve, Hide | M4 | ORIGINAL_REQUEST §R6 |
| FEAT-ADM-016 | Issue Management Page | Tabs: Mới tiếp nhận, Đang xử lý, Đã giải quyết; Table + Drawer with description, related entities, status update, admin resolution note, mark resolved | M4 | ORIGINAL_REQUEST §R6 |
| FEAT-ADM-017 | Dashboard Live Projections | Replace mock numbers on `/admin/dashboard` with live reactive stats, recent lists, and quick navigation from canonical domain | M5 | ORIGINAL_REQUEST §R7 |
| FEAT-ADM-018 | Unit Test Invariant Protection | All 55 baseline unit tests pass without assertion changes, plus 100% pass on new Admin domain and auth tests | M6 | ORIGINAL_REQUEST §AC |
| FEAT-ADM-019 | Production Build & Zero Lint | `npm run build` succeeds cleanly with zero errors; no console or layout regressions | M6 | ORIGINAL_REQUEST §AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Canonical Domain & Seed Data | Extend `demoReferenceData.js`, `demoDomain.js`, `DemoDomainContext.jsx`, create Admin hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`), unit tests | none | DONE |
| M2 | Cross-Role Sync & Auth Guard | Enforce suspension login rejection in `DemoAuthContext.jsx`, filter approved tutors in `useScheduledTutors`, filter public reviews in `TutorProfilePage.jsx` | M1 | PLANNED |
| M3 | Admin Shell & Navigation | Implement `AdminShell`, `AdminHeader` (red LogOut, no RoleSwitcher, avatar AD), `AdminSidebar` (reactive badge counters), routes in `App.jsx` | M1 | PLANNED |
| M4 | Operational Pages & Drawers | Implement `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` with sticky tables, search, status tabs, record counters, slide-over drawers | M1, M2, M3 | PLANNED |
| M5 | Admin Dashboard Live Projections | Connect `/admin/dashboard` to `useAdminOverview()`, replace static data with reactive projections | M1, M4 | PLANNED |
| M6 | Final Milestone: 100% E2E Verification & Hardening | Phase 1: 100% pass of E2E test suite (Tiers 1-4); Phase 2: Adversarial hardening (Tier 5) | M1-M5 | PLANNED |

## Interface Contracts
### Canonical Domain (`apps/web/src/features/domain/demoDomain.js`)
```javascript
// State Shape:
// {
//   version: 1,
//   profiles: [...],        // includes moderationStatus: 'approved' | 'pending' | 'rejected' | 'suspended'
//   requests: [...],        // STRICTLY 9 items to maintain BUG-010 invariant
//   lessons: [...],
//   availability: [...],
//   settings: {...},
//   savedByAccount: {...},
//   nextRequestNumber: 1,
//   users: [...],           // includes status: 'active' | 'suspended', role: 'learner' | 'tutor' | 'admin'
//   reviews: [...],         // includes moderationStatus: 'approved' | 'pending' | 'hidden', visibility: 'public' | 'hidden'
//   issues: [...]           // includes status: 'new' | 'in_progress' | 'resolved', category, resolutionNote
// }

// Reducers / Actions:
approveTutor(state, tutorId) => state
rejectTutor(state, tutorId, reason) => state
setTutorSuspension(state, tutorId, isSuspended) => state
setUserSuspension(state, userId, isSuspended) => state
moderateReview(state, reviewId, decision: 'approved' | 'hidden') => state
updateIssueStatus(state, issueId, status, resolutionNote) => state
```

## Code Layout
- `apps/web/src/data/demoReferenceData.js`: Canonical seed data for users, tutors, reviews, issues (requests count preserved at 9).
- `apps/web/src/features/domain/demoDomain.js`: State reducers, action creators, initialization, and localStorage synchronization.
- `apps/web/src/features/domain/DemoDomainContext.jsx`: Context provider and action dispatches.
- `apps/web/src/features/domain/useAdminDomain.js`: Dedicated Admin adapter hooks.
- `apps/web/src/features/auth/DemoAuthContext.jsx`: Suspension check on password and provider login.
- `apps/web/src/features/learner/TutorProfilePage.jsx`: Filter approved and public reviews from domain.
- `apps/web/src/features/tutor/TutorWorkspaceState.jsx`: Filter approved tutors in `useScheduledTutors`.
- `apps/web/src/features/admin/AdminShell.jsx`: Shell layout container.
- `apps/web/src/features/admin/AdminHeader.jsx`: Persistent header without RoleSwitcher, avatar AD, red LogOut.
- `apps/web/src/features/admin/AdminSidebar.jsx`: Persistent sidebar with active route highlighting and reactive badges.
- `apps/web/src/features/admin/AdminDataTable.jsx`: Reusable sticky header table with record counter.
- `apps/web/src/features/admin/AdminDrawer.jsx`: Slide-over drawer with scrim and action buttons.
- `apps/web/src/features/admin/AdminTutors.jsx`: Tutor management operational page.
- `apps/web/src/features/admin/AdminUsers.jsx`: User management operational page.
- `apps/web/src/features/admin/AdminReviews.jsx`: Review moderation operational page.
- `apps/web/src/features/admin/AdminIssues.jsx`: Issue resolution operational page.
- `apps/web/src/features/admin/AdminDashboard.jsx`: Live reactive dashboard.
- `apps/web/src/features/admin/admin.css`: Admin styling and responsive viewport adaptation.
- `apps/web/src/App.jsx`: Route definitions for `/admin/*`.
- `apps/web/tests/`: Unit tests and E2E verification test suites.
