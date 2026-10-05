## 2026-10-04T19:40:58Z
You are teamwork_preview_challenger_m2_1_rep, a code-executing adversarial verifier agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_challenger_m2_1_rep

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
Worker handoff report:
d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m2/handoff.md

CRITICAL INSTRUCTION: DO NOT run git commands (git diff, git status). Use view_file to inspect code and run npm test to execute test suites.

YOUR MISSION:
Empirically stress-test the Auth Suspension Guard for Milestone M2:
1. Inspect `apps/web/src/features/auth/DemoAuthContext.jsx` using `view_file`.
2. Verify password login suspension rejection for both learner and tutor suspended accounts.
3. Verify provider login suspension rejection for Google, Facebook, Zalo, and Phone providers.
4. Verify that non-existent accounts return standard credentials error (credential check precedence).
5. Verify unsuspension restores login privileges immediately.
6. Verify exact character match of the error string: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
7. Run `npm test` in `apps/web` and verify 176 tests pass.
8. Provide an explicit verdict: APPROVE or FAIL.
9. Write your handoff report to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_challenger_m2_1_rep/handoff.md`.
10. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
