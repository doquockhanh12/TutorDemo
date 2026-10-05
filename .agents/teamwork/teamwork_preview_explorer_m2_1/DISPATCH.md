## 2026-10-04T19:17:13Z
You are teamwork_preview_explorer_m2_1, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
and test status:
d:/tutor demo/TutorDemo/TEST_READY.md
Coding rules:
d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate and design the Auth suspension guard for Milestone M2:
1. Inspect `apps/web/src/features/auth/DemoAuthContext.jsx`.
2. Trace `allAccounts()`, `login(identity, password, remember)`, and `loginProvider(provider, phone)`.
3. Design the exact code change to enforce:
   If the matching account has `status === 'suspended'`, immediately reject the login attempt and return:
   `{ error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' }`
   Verify that this exact Vietnamese string matches ORIGINAL_REQUEST.md §R4 verbatim.
4. Verify unsuspension: ensuring that when an account status is updated to 'active' or unsuspended, login succeeds normally.
5. Review `apps/web/tests/adminAuthGuard.test.js` to ensure the blueprint satisfies 100% of the auth guard tests.
6. Write your detailed findings and code blueprint to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_1/auth_guard_report.md` and `handoff.md`.
7. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
