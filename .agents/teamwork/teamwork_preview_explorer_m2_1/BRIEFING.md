# BRIEFING — 2026-10-04T19:24:00Z

## Mission
Investigate and design the Auth suspension guard for Milestone M2: inspect DemoAuthContext.jsx, trace login pathways, design suspension rejection and unsuspension verification matching ORIGINAL_REQUEST.md §R4 verbatim, review adminAuthGuard.test.js, and produce a complete blueprint.

## 🔒 My Identity
- Archetype: explorer
- Roles: read-only investigation, code blueprint design, synthesis
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: M2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify source code directly
- Strict compliance with AGENTS.md, ORIGINAL_REQUEST.md §R4, PROJECT.md
- Enforce exact Vietnamese error message: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
- Verify unsuspension behavior and adminAuthGuard.test.js coverage

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T19:17:13Z

## Investigation State
- **Explored paths**:
  - `apps/web/src/features/auth/DemoAuthContext.jsx` (traced `allAccounts`, `login`, `loginProvider`)
  - `apps/web/src/features/auth/LoginPage.jsx` (traced `submit`, `provider`, `phoneVerified`)
  - `apps/web/src/features/domain/demoDomain.js` (inspected `setUserSuspension`, `setTutorSuspension`, `reconcileLessonSeed`, `createDemoState`)
  - `apps/web/src/features/domain/DemoDomainContext.jsx` & `useAdminDomain.js`
  - `apps/web/src/data/demoReferenceData.js` (accounts seed)
  - `apps/web/tests/adminAuthGuard.test.js` & `adminTestHelpers.js` & `adminE2EScenarios.test.js`
- **Key findings**:
  - `DemoAuthContext.jsx` currently lacks suspension checks on both `login()` and `loginProvider()`.
  - Credentials check must precede suspension check in `login()` to preserve test `F9-T2-01` (non-existent users).
  - Exact Vietnamese error string is `'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'` (76 chars, 100% match with §R4).
  - In `LoginPage.jsx`, lines 16 and 17 must handle `if (result.error)` to display error on UI instead of navigating to registration.
  - `allAccounts()` should reconcile account status with `localStorage.getItem('tnm.demo.domain.v1')` to reactively reflect Admin actions in real-time.
- **Unexplored areas**: None for M2 Auth guard scope.

## Key Decisions Made
- Export `SUSPENDED_ACCOUNT_ERROR` and `INVALID_CREDENTIALS_ERROR` from `DemoAuthContext.jsx`.
- Reconcile `allAccounts()` dynamically with domain state in `localStorage` under `tnm.demo.domain.v1`.
- Reject before session persistence (`persist(...)`).
- Produced comprehensive blueprint and 5-component handoff report.

## Artifact Index
- `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/DISPATCH.md` — Incoming instructions
- `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/BRIEFING.md` — Situational awareness
- `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/progress.md` — Liveness heartbeat
- `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/auth_guard_report.md` — Detailed findings and blueprint
- `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/handoff.md` — 5-component handoff report
