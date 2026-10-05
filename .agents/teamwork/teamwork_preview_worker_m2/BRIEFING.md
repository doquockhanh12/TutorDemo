# BRIEFING — 2026-10-04T19:36:30Z

## Mission
Implement live cross-role domain synchronization and admin moderation guards for Auth, Tutor Profiles, and Tutor Reviews in TutorDemo frontend.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m2
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: M2 - Auth Guard and Cross-Role Sync Implementation

## 🔒 Key Constraints
- Exclusively owned files:
  - apps/web/src/features/auth/DemoAuthContext.jsx
  - apps/web/src/features/tutor/TutorWorkspaceState.jsx
  - apps/web/src/features/learner/TutorProfilePage.jsx
- Integrity mandate: DO NOT cheat, hardcode test results, or create dummy implementations.
- Verify 100% pass on all test suites (node --test) including adminAuthGuard.test.js, adminCrossRoleSync.test.js, adminE2EScenarios.test.js.
- Verify npm run build passes with 0 errors.

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T19:36:30Z

## Task Summary
- **What to build**:
  1. DemoAuthContext.jsx: read canonical domain users (`tnm.demo.domain.v1`), sync status, enforce suspension check with Vietnamese error message for credentials and provider login.
  2. TutorWorkspaceState.jsx: `useScheduledTutors()` filtering by `(p.moderationStatus || 'approved') === 'approved'`.
  3. TutorProfilePage.jsx: switch from static `profileReviews` to dynamic domain reviews from `useDemoDomain()`, filter by tutorId, moderationStatus, visibility, and dynamically compute rating stats.
- **Success criteria**: All tests pass, build passes, genuine reactive sync logic.
- **Interface contracts**: PROJECT.md, ORIGINAL_REQUEST.md
- **Code layout**: apps/web/src/...

## Key Decisions Made
- Reconciled `allAccounts()` in `DemoAuthContext.jsx` with canonical domain storage (`tnm.demo.domain.v1`), safely handling both ID and username matches while preserving active accounts and credential precedence.
- In `login()` and `loginProvider()`, placed credential/account match check prior to suspension guard so non-existent users receive invalid credential error rather than suspension message.
- In `TutorWorkspaceState.jsx`, wrapped `useScheduledTutors()` with `useMemo` dependent on `state`, applying `(tutor.moderationStatus || 'approved') === 'approved'` filter to exclude pending/rejected/suspended tutors from Learner discovery.
- In `TutorProfilePage.jsx`, removed static `profileReviews`, consumed `useDemoDomain().reviews`, and applied `(r.tutorId === id || r.tutorId === tutor?.id) && (r.moderationStatus || 'approved') === 'approved' && (r.visibility || 'public') === 'public'`. Dynamically calculated `averageRating` and `reviewCount` with resilient zero-state handling.

## Artifact Index
- DISPATCH.md — assignment details
- progress.md — liveness and heartbeat tracker
- handoff.md — 5-component handoff report for parent orchestrator

## Change Tracker
- **Files modified**:
  - `apps/web/src/features/auth/DemoAuthContext.jsx`: canonical storage reconciliation, suspension rejection for password and provider auth
  - `apps/web/src/features/tutor/TutorWorkspaceState.jsx`: moderationStatus filter for useScheduledTutors
  - `apps/web/src/features/learner/TutorProfilePage.jsx`: dynamic domain reviews, moderation filtering, dynamic rating computation, zero-state message
- **Build status**: `npm test` passed 176/176 tests; `npm run build` completed with 0 errors
- **Pending issues**: none

## Quality Status
- **Build/test result**: Pass (176 passed, 0 failed)
- **Lint status**: 0 errors
- **Tests added/modified**: Verified all suites in apps/web/tests/

## Loaded Skills
None
