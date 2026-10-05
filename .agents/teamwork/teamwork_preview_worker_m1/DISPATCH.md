## 2026-10-04T18:41:30Z
You are teamwork_preview_worker_m1, an implementation worker agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m1

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
and coding rules:
d:/tutor demo/TutorDemo/AGENTS.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR EXCLUSIVELY OWNED FILES:
- apps/web/src/data/demoReferenceData.js
- apps/web/src/features/domain/demoDomain.js
- apps/web/src/features/domain/DemoDomainContext.jsx
- apps/web/src/features/domain/useAdminDomain.js
- apps/web/tests/adminDomain.test.js

INPUT BLUEPRINTS TO READ BEFORE CODING:
- d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_1/schema_report.md
- d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_2/reducer_report.md
- d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_3/hooks_report.md

TASKS:
1. In `apps/web/src/data/demoReferenceData.js`:
   - STRICT INVARIANT: `requests` must remain strictly 9 items (preserves BUG-010 test).
   - `accounts`: preserve indices 0..2 (minhanh, giabao, admin) with credentials; add `status: 'active'`, append active parent, active tutor, suspended learner, suspended tutor. Alias `users: accounts`.
   - `tutorProfiles`: add `moderationStatus: 'approved'` to existing 6 tutors. Append 3 pending tutors (with uni, subjects, fee, bio, submission date, illustrative documents for drawer review), 1 rejected tutor, 1 suspended tutor.
   - `reviews`: append pending moderation and hidden/rejected reviews.
   - `issues`: add canonical issues array covering 5 categories across new, in_progress, resolved states.
2. In `apps/web/src/features/domain/demoDomain.js`:
   - Update `createDemoState` to include `users: seed.accounts`, `reviews: seed.reviews`, `issues: seed.issues`.
   - Update `restoreDemoState` / `reconcileLessonSeed` to backfill missing collections and new profiles for existing localStorage.
   - Add 6 pure reducers: `approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`, `moderateReview`, `updateIssueStatus`.
3. In `apps/web/src/features/domain/DemoDomainContext.jsx`:
   - Expose the 6 domain actions and convenience methods on Context.Provider.
4. In `apps/web/src/features/domain/useAdminDomain.js`:
   - Implement the 5 Admin hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) and pure selectors (`selectAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`, `selectAdminStats`).
5. In `apps/web/tests/adminDomain.test.js`:
   - Create unit tests for domain initialization, reducers, pure selectors, and invariant assertions.
6. VERIFICATION:
   - Run unit tests: `npm test` in `apps/web` (node --test). Verify that all 55 baseline tests pass AND new tests pass.
   - Run production build: `npm run build` in `apps/web`. Verify 0 errors.
7. Write your handoff report to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m1/handoff.md` including exact test and build outputs.
8. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).


## 2026-10-04T19:00:15Z
**Context**: Milestone M1 Implementation
**Content**: Heartbeat check: What is your current progress on implementing demoReferenceData.js, demoDomain.js, DemoDomainContext.jsx, useAdminDomain.js, and running test/build?
**Action**: Please provide a brief status update or complete your handoff.
