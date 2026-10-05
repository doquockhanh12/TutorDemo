# BRIEFING — 2026-10-04T18:39:00Z

## Mission
Investigate and produce the exact schema and fixture extension blueprint for Milestone M1 (Canonical Domain & Seed Data): tutorProfiles, accounts/users, reviews, and issues, respecting existing contracts and the 9-request invariant.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_1
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: M1 (Canonical Domain & Seed Data)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement in apps/web/
- requests must remain strictly 9 items (critical invariant)
- Preserve existing demo domain contracts (Learner/Tutor/Admin) and storage mechanisms
- Single shared /login route; Auth V4 guardrails; no backend DB

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T18:39:00Z

## Investigation State
- **Explored paths**:
  - `apps/web/src/data/demoReferenceData.js`: Reviewed accounts, tutorProfiles, requests, reviews, teachingLevels, locations.
  - `apps/web/src/features/domain/demoDomain.js`: Analyzed createDemoState, restoreDemoState, reconciliation.
  - `apps/web/src/features/domain/DemoDomainContext.jsx`: Analyzed domain provider and dispatch mechanisms.
  - `apps/web/src/features/auth/DemoAuthContext.jsx`: Verified account lookup and login logic.
  - `apps/web/tests/demoDomain.test.js` & `tests/incomeSelectors.test.js`: Verified BUG-010 9-request invariant and income stability.
  - `apps/web/src/data/adminDashboard.js`: Mapped legacy mock approvals, reviews, and issues.
- **Key findings**:
  - `requests` strictly 9 items; must never change length.
  - `accounts[0]`, `accounts[1]`, `accounts[2]` must preserve index and credentials.
  - `createDemoState` and `restoreDemoState` must incorporate `users`, `reviews`, `issues`.
- **Unexplored areas**: None for M1 scope.

## Key Decisions Made
- Fully specified schema and blueprint in `schema_report.md`.
- Formulated 5-component handoff report in `handoff.md`.

## Artifact Index
- `DISPATCH.md` — Dispatch log
- `BRIEFING.md` — Situational awareness
- `progress.md` — Liveness heartbeat
- `schema_report.md` — Complete M1 schema & code blueprint
- `handoff.md` — 5-component handoff report
