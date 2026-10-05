## 2026-10-04T19:37:44Z
You are teamwork_preview_reviewer_m2_1, a high-reliability reviewer agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_reviewer_m2_1

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
and test suite status:
d:/tutor demo/TutorDemo/TEST_READY.md
Worker handoff report:
d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m2/handoff.md

YOUR MISSION:
Review Milestone M2 (Cross-Role Sync & Auth Guard) implemented files:
- apps/web/src/features/auth/DemoAuthContext.jsx
- apps/web/src/features/tutor/TutorWorkspaceState.jsx
- apps/web/src/features/learner/TutorProfilePage.jsx

1. Examine correctness against Requirement R4:
   - Verbatim suspension error string: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
   - Credential check precedence before suspension check.
   - Provider login suspension rejection and unsuspension recovery.
   - Filter of approved tutors in useScheduledTutors().
   - Canonical reviews query and filter in TutorProfilePage.jsx.
2. Run builds and tests in `apps/web`:
   - `npm test`
   - `npm run build`
3. Document all findings and provide an explicit verdict: APPROVE or REQUEST_CHANGES.
4. Write your handoff report to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_reviewer_m2_1/handoff.md`.
5. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
