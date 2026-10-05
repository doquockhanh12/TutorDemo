# BRIEFING — 2026-10-04T19:05:00Z

## Mission
Implement Milestone 1: Core Admin Domain Layer, Schema extensions, pure reducers, hooks/selectors, and tests.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m1
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: Milestone 1 (Admin Domain Layer & Schema)

## 🔒 Key Constraints
- Requests array MUST remain strictly 9 items (preserves BUG-010 test).
- accounts indices 0..2 (minhanh, giabao, admin) must be preserved with credentials intact.
- Genuine implementations only: no hardcoding test results, no facade implementations.
- All 55 baseline tests must continue to pass, plus new admin domain tests.
- npm run build in apps/web must produce 0 errors.

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T19:00:15Z

## Task Summary
- **What to build**:
  1. `apps/web/src/data/demoReferenceData.js`: accounts/users expansion, tutorProfiles expansion with moderationStatus, reviews moderation expansion, issues dataset.
  2. `apps/web/src/features/domain/demoDomain.js`: state shape update (users, reviews, issues), reconcileLessonSeed backfill, 6 pure reducers.
  3. `apps/web/src/features/domain/DemoDomainContext.jsx`: export 6 actions/convenience methods.
  4. `apps/web/src/features/domain/useAdminDomain.js`: 5 hooks and pure selectors with safe module loader.
  5. `apps/web/tests/adminDomain.test.js`: test suite covering 35+ domain and selector unit tests.
- **Success criteria**: 55 baseline tests pass, new tests pass (176 total passing, 0 failing, 0 skipped), npm run build passes (0 errors), clean handoff report.
- **Interface contracts**: PROJECT.md, AGENTS.md, schema_report.md, reducer_report.md, hooks_report.md.

## Change Tracker
- **Files modified**:
  - `apps/web/src/data/demoReferenceData.js`: accounts expanded, tutorProfiles with moderationStatus, reviews with moderation, issues dataset.
  - `apps/web/src/features/domain/demoDomain.js`: users/reviews/issues in createDemoState, backfill in reconcileLessonSeed, 6 pure reducers.
  - `apps/web/src/features/domain/DemoDomainContext.jsx`: exposed domain reducers and convenience action dispatchers on provider.
  - `apps/web/src/features/domain/useAdminDomain.js`: status dictionaries, formatting helpers, pure selectors, React hooks with safe dynamic context loader.
  - `apps/web/tests/adminDomain.test.js`: full test coverage including ADM-HOOK-001..017 tests.
  - `apps/web/tests/adminE2EScenarios.test.js`: fixed isolated pending tutors baseline in SCENARIO-4.
- **Build status**: PASS (176 passing unit tests, npm run build succeeded in 1.99s)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (176 passed, 0 failed, 0 skipped)
- **Lint status**: clean
- **Tests added/modified**: 17 ADM-HOOK tests added to adminDomain.test.js, 16 skipped tests enabled.

## Loaded Skills
- none

## Key Decisions Made
- Used top-level await try-catch dynamic import in `useAdminDomain.js` to ensure module evaluation succeeds in raw Node.js test runner while maintaining full synchronous hook compatibility in React/Vite.
- Maintained strict 9 requests invariant in `demoReferenceData.js` and all reducers.
- Preserved accounts indices 0..2 intact with existing credentials.

## Artifact Index
- `.agents/teamwork/teamwork_preview_worker_m1/handoff.md` — Final hard handoff report
