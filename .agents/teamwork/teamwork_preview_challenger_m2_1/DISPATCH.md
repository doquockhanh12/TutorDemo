## 2026-10-04T19:37:44Z
You are teamwork_preview_challenger_m2_1, a code-executing adversarial verifier agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_challenger_m2_1

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
Worker handoff report:
d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_worker_m2/handoff.md

YOUR MISSION:
Empirically stress-test the Auth Suspension Guard for Milestone M2:
1. Verify password login suspension rejection for both learner and tutor suspended accounts.
2. Verify provider login suspension rejection for Google, Facebook, Zalo, and Phone providers.
3. Verify that non-existent accounts return standard credentials error (credential check precedence).
4. Verify unsuspension restores login privileges immediately.
5. Verify exact character match of the error string: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
6. Execute test run (`npm test` in `apps/web`) and verify all 176 tests pass.
7. Provide an explicit verdict: APPROVE or FAIL.
8. Write your handoff report to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_challenger_m2_1/handoff.md`.
9. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
