## 2026-10-04T19:26:27Z
You are teamwork_preview_worker_m2, an implementation worker agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m2

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
and test suite status:
d:/tutor demo/TutorDemo/TEST_READY.md
Coding rules:
d:/tutor demo/TutorDemo/AGENTS.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR EXCLUSIVELY OWNED FILES:
- apps/web/src/features/auth/DemoAuthContext.jsx
- apps/web/src/features/tutor/TutorWorkspaceState.jsx
- apps/web/src/features/learner/TutorProfilePage.jsx

INPUT BLUEPRINTS TO READ BEFORE CODING:
- d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/auth_guard_report.md
- d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_2/search_sync_report.md
- d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_3/review_sync_report.md

TASKS:
1. In `apps/web/src/features/auth/DemoAuthContext.jsx`:
   - Account synchronization: in `allAccounts()`, read latest users from canonical domain storage (`tnm.demo.domain.v1`) if available, merging with `DEMO_USERS` so real-time suspensions/unsuspensions executed in Admin are immediately reflected.
   - In `login(identity, password)`: if `user.status === 'suspended'`, reject login immediately and return:
     `{ error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' }`
     (Make sure credentials match check happens first so non-existent users get credential error).
   - In `loginProvider(provider, phone)`: if `account.status === 'suspended'`, reject login immediately and return:
     `{ error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' }`
   - When unsuspended (`status !== 'suspended'`), login succeeds.
2. In `apps/web/src/features/tutor/TutorWorkspaceState.jsx`:
   - In `useScheduledTutors()`: filter `state.profiles` to return only tutors where `(p.moderationStatus || 'approved') === 'approved'`.
3. In `apps/web/src/features/learner/TutorProfilePage.jsx`:
   - Remove static `profileReviews` import.
   - Use `useDemoDomain()` to read `state.reviews`.
   - Filter reviews: `(r.tutorId === id || r.tutorId === tutor?.id) && (r.moderationStatus || 'approved') === 'approved' && (r.visibility || 'public') === 'public'`.
   - Update ratings and review list display dynamically.
4. VERIFICATION:
   - Run unit & e2e tests in `apps/web`: `npm test` (node --test). Verify 100% pass on all suites including `adminAuthGuard.test.js`, `adminCrossRoleSync.test.js`, `adminE2EScenarios.test.js`.
   - Run production build in `apps/web`: `npm run build`. Verify 0 errors.
5. Write your handoff report to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m2/handoff.md`.
6. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
