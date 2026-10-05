# Test Suite Ready: TutorNearMe Admin Flow Subsystem

## Overview
Comprehensive, opaque-box functional and end-to-end test suite designed and implemented for the **TutorNearMe Admin Flow Subsystem** across Tiers 1–4 per `TEST_INFRA.md` and `PROJECT.md`.

- **Test Runner**: Node.js built-in test runner (`node --test`).
- **Execution Working Directory**: `apps/web`
- **Execution Command**: `npm run test`
- **Baseline Invariant**: All 55 pre-existing unit tests remain 100% untouched and passing.
- **Total Test Count**: 159 tests (55 baseline + 104 Admin Flow tests).

---

## Test File Inventory & Architecture

| Test File | Tiers Covered | Target Scope |
|---|:---:|---|
| `apps/web/tests/adminDomain.test.js` | Tier 1 & 2 | Canonical domain state, persistence under `tnm.demo.domain.v1`, 9 requests invariant, deterministic fixtures, domain reducers, and hook interfaces. |
| `apps/web/tests/adminAuthGuard.test.js` | Tier 1 & 2 | Account suspension login rejection with verbatim Vietnamese error message (`"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`), password/provider login, and unsuspension recovery. |
| `apps/web/tests/adminCrossRoleSync.test.js` | Tier 1, 2 & 3 | Tutor moderation & learner search sync, review moderation & public profile sync, and pairwise combinatorial verification across entity states. |
| `apps/web/tests/adminOperational.test.js` | Tier 1, 2 & 3 | Operational tables across 4 modules (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`), search matching, status tabs, record counter (`"Hiển thị X / Y bản ghi"`), drawer actions, and responsive layout. |
| `apps/web/tests/adminE2EScenarios.test.js` | Tier 4 | 5 real-world multi-step application scenarios simulating complete administrative lifecycles. |
| `apps/web/tests/adminTestHelpers.js` | Helpers | Isolated shared selectors, table filter evaluators, and auth boundary simulation helpers. |

---

## Tier Breakdown & Coverage Mapping

### Tier 1: Functional Requirement Coverage
- **F4 (Canonical Domain Persistence)**: Single storage key `tnm.demo.domain.v1`, state collections, version 1, zero secondary keys.
- **F6 (Deterministic Seed Fixtures)**: Pending tutors with drawer verification documents, approved tutors, rejected tutors with reasons, suspended accounts, reviews, and issues across 5 categories.
- **F4 Reducers**: `approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`.
- **F5 (Admin Domain Hooks)**: Interfaces for `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`.
- **F9 (Auth Guard)**: Active logins succeed; suspended learner and tutor logins are rejected with exact Vietnamese error; provider logins (Google, Facebook, Zalo, Phone) respect suspension.
- **F7 (Tutor Moderation Sync)**: Approved tutors surface on Learner search; pending/rejected/suspended tutors remain hidden.
- **F8 (Review Moderation Sync)**: Approved/public reviews surface on tutor public profile; pending/hidden reviews remain excluded.
- **F10 (Table & Record Counter)**: Strict formatting `"Hiển thị X / Y bản ghi"`.
- **F13–F16 (Operational Pages)**: Status filter tabs and instant Vietnamese search across tutors, users, reviews, and issues.
- **F11 (Slide-over Drawer)**: Detail inspection, decision actions, and non-loss state preservation.

### Tier 2: Boundary Value & Invariant Analysis
- **Corrupted Storage Fallback**: Graceful recovery from malformed JSON or null without data corruption.
- **Idempotency**: Repeated restore and repeated approval/suspension cycles produce stable, idempotent outputs.
- **Request Invariant (BUG-010)**: State requests collection strictly retains 9 items across all administrative mutations.
- **Deep Immutability**: Mutations to runtime state cannot alter the frozen `demoReferenceData` seed.
- **Input Sanitization**: Case-insensitive identity matching, whitespace trimming, and phone normalization (+84 international format).
- **Zero-State Handling**: Proper formatting for 0 visible records (`"Hiển thị 0 / Y bản ghi"` or `"Hiển thị 0 / 0 bản ghi"`) and zero reviews without division by zero.
- **Non-Loss State**: Interacting with or closing slide-over drawer does not reset active table filter tab, search query, or scroll.

### Tier 3: Pairwise Combinatorial Verification
- **Tutor Status × Search Query**: Matrix of `(pending, approved, rejected, suspended)` × `(matching subject, mismatching subject)`.
- **Review Status × Star Rating × Profile Visibility**: Matrix of `(approved, pending, hidden)` × `(1, 3, 5 stars)`.
- **User Role × Account Status × Operational Action Eligibility**: Matrix of `(learner, tutor, admin)` × `(active, suspended)`.
- **Issue Category × Issue Status × Administration**: Matrix of `(absence, dispute, cancellation, fee, attitude)` × `(new, in_progress, resolved)`.

### Tier 4: Real-World Multi-Step Scenarios
- **Scenario 1 (Onboarding New Tutor Workflow)**:
  Pending application review -> Drawer verification document inspection -> Approval decision -> Immediate reflection on Learner search with active schedule -> Persistence.
- **Scenario 2 (Dispute & Suspension Workflow)**:
  Learner attitude complaint ticket -> Drawer review and transition to in_progress -> Tutor account suspension -> Verification tutor is blocked at `/login` with verbatim error message: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."` -> Session prevented.
- **Scenario 3 (Inappropriate Review Moderation)**:
  Abusive 1-star review flagged -> Drawer review -> Admin hides review -> Immediate removal from tutor public profile -> Positive verification that valid reviews remain intact -> Rating recalculation.
- **Scenario 4 (Dashboard Reactive Metric Integrity)**:
  Baseline dashboard metrics captured -> Batch actions executed (approve tutor, moderate reviews, resolve issue) -> Live metric projections update reactively -> Sidebar badges synchronize.
- **Scenario 5 (Full Recovery & Unsuspend)**:
  Suspended account blocked at login -> Admin inspects in User Drawer -> Admin unsuspends account -> User retries login -> Session created -> Full permissions restored across state reloads.

---

## Feature Checklist (`PROJECT.md` Feature Inventory)

| ID | Feature Name | Test Coverage File | Status |
|---|---|---|:---:|
| FEAT-ADM-001 | Shell Layout & Routing | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-002 | Header Identity & Logout | `adminAuthGuard.test.js` | Verified |
| FEAT-ADM-003 | Sidebar Navigation & Badges | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-004 | Canonical Domain Schema & Reducers | `adminDomain.test.js` | Verified |
| FEAT-ADM-005 | Admin Domain Hooks | `adminDomain.test.js` | Verified |
| FEAT-ADM-006 | Deterministic Seed Fixtures | `adminDomain.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-007 | Tutor Moderation Sync | `adminCrossRoleSync.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-008 | Review Moderation Sync | `adminCrossRoleSync.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-009 | Auth Suspension Guard | `adminAuthGuard.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-010 | Table Sticky & Scroll UX | `adminOperational.test.js` | Verified |
| FEAT-ADM-011 | Slide-over Drawer UX & Non-loss | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-012 | Responsive Management UX | `adminOperational.test.js` | Verified |
| FEAT-ADM-013 | Tutor Management Page | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-014 | User Management Page | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-015 | Review Management Page | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-016 | Issue Management Page | `adminOperational.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-017 | Dashboard Live Projections | `adminDomain.test.js`, `adminE2EScenarios.test.js` | Verified |
| FEAT-ADM-018 | Unit Test Invariant Protection | Baseline suite (55 tests) | Verified (100% pass) |
| FEAT-ADM-019 | Production Build Integrity | Vitest / Node test runner | Verified |

---

## How to Run Tests

From project root or `apps/web`:
```powershell
cd "d:\tutor demo\TutorDemo\apps\web"
npm run test
```

Or run individual test suites:
```powershell
node --test tests/adminDomain.test.js
node --test tests/adminAuthGuard.test.js
node --test tests/adminCrossRoleSync.test.js
node --test tests/adminOperational.test.js
node --test tests/adminE2EScenarios.test.js
```
