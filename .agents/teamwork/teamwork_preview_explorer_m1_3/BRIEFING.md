# BRIEFING — 2026-10-04T18:41:00Z

## Mission
Investigate and design dedicated Admin hooks (apps/web/src/features/domain/useAdminDomain.js) and unit test specifications (apps/web/tests/adminDomain.test.js) for Milestone M1.

## 🔒 My Identity
- Archetype: explorer
- Roles: M1 Admin Hooks & Adapter Explorer
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_3
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: M1

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Write only to my working directory (.agents/teamwork/teamwork_preview_explorer_m1_3/)
- Adhere to AGENTS.md, PROJECT.md, ORIGINAL_REQUEST.md
- Never place source code or test files in .agents/teamwork/
- Never name files AGENTS.md or GEMINI.md

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `apps/web/package.json` (node --test runner, dependencies)
  - `apps/web/tests/` (55 baseline unit tests passed, incomeSelectors test patterns)
  - `apps/web/src/features/domain/demoDomain.js` (canonical domain state factory & reducers)
  - `apps/web/src/features/domain/DemoDomainContext.jsx` (context provider, action exposures)
  - `apps/web/src/features/admin/AdminDashboard.jsx` (stats, approvals, reviews, issues, live classes)
  - Peer agent reports (`schema_report.md` in m1_1, `reducer_report.md` in m1_2)
- **Key findings**:
  - `package.json` uses native `node --test` without jsdom or @testing-library/react; therefore pure domain selectors decoupled from React Context are critical for fast, deterministic unit testing.
  - Two-tier bridge pattern: Pure selectors (`selectAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`, `selectAdminStats`) + thin React hooks (`useAdminOverview`, `useAdminTutors`, etc.) satisfy both testability in Node and zero-UI-rewrite React consumption.
  - All 5 Admin hooks seamlessly bind to Context action dispatchers and support bi-directional account suspension synchronization.
  - Invariant R2 and BUG-010 (strictly 9 requests) are 100% preserved.
- **Unexplored areas**: None for M1 Admin hooks; complete design achieved.

## Key Decisions Made
- Designed 5 required hooks: `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`.
- Designed 6 pure selectors and semantic metadata constants for Vietnamese translations and badge tones.
- Designed 17 comprehensive unit tests in `apps/web/tests/adminDomain.test.js` covering all operational flows and invariants.
- Wrote full blueprints to `hooks_report.md` and complete handoff report to `handoff.md`.

## Artifact Index
- DISPATCH.md — record of incoming dispatch
- progress.md — liveness heartbeat
- BRIEFING.md — persistent working memory
- hooks_report.md — detailed technical blueprints for `useAdminDomain.js` and `adminDomain.test.js`
- handoff.md — 5-component hard handoff report
