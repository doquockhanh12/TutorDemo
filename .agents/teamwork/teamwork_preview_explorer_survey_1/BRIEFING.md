# BRIEFING — 2026-10-04T18:35:00Z

## Mission
Investigate the data, storage, and domain architecture of TutorNearMe (demoDomain, localStorage, auth, entity models, tests, learner/tutor query filtering) to prepare for Admin subsystem implementation.

## 🔒 My Identity
- Archetype: explorer
- Roles: Domain & Storage Architecture Explorer
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_1
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: Survey & Architectural Discovery

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Adhere to AGENTS.md: Frontend-only prototype, single `/login` route, no backend/DB, canonical shared domain in `tnm.demo.domain.v1`
- Only write in my own agent directory `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_1`

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T18:35:00Z

## Investigation State
- **Explored paths**:
  - `apps/web/src/data/demoReferenceData.js`
  - `apps/web/src/features/domain/demoDomain.js`
  - `apps/web/src/features/domain/DemoDomainContext.jsx`
  - `apps/web/src/features/auth/DemoAuthContext.jsx`
  - `apps/web/src/features/auth/LoginPage.jsx`
  - `apps/web/src/features/admin/AdminDashboard.jsx`
  - `apps/web/src/features/learner/LearnerSearch.jsx`
  - `apps/web/src/features/learner/TutorProfilePage.jsx`
  - `apps/web/src/features/tutor/TutorWorkspaceState.jsx`
  - `apps/web/tests/demoDomain.test.js`
  - `apps/web/tests/incomeSelectors.test.js`
  - `apps/web/tests/profileSelection.test.js`
  - `apps/web/tests/e2e/demoHelpers.js`
- **Key findings**:
  - Storage key is `tnm.demo.domain.v1`.
  - `createDemoState` needs `users`, `reviews`, `issues`.
  - `state.requests.length` is strictly asserted to be 9 in test `BUG-010`.
  - Auth suspension check can be cleanly added in `DemoAuthContext.jsx:47` without altering `/login` route or structure.
  - LearnerSearch needs moderationStatus filter in `useScheduledTutors()`.
  - TutorProfilePage reviews must be wired to reactive domain reviews filtered by approved & public.
- **Unexplored areas**: None. Investigation complete.

## Key Decisions Made
- Confirmed single shared storage key `tnm.demo.domain.v1`.
- Specified clean adapter hooks pattern for Admin UI.
- Identified invariant preserving `seed.requests.length === 9`.

## Artifact Index
- [d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_1/domain_architecture_report.md] — Comprehensive domain architecture report
- [d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md] — Standard handoff report
