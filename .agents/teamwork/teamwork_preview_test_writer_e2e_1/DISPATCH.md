## 2026-10-04T18:31:49Z
You are teamwork_preview_test_writer_e2e_1, an E2E test writer agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_test_writer_e2e_1
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Project plan: d:/tutor demo/TutorDemo/PROJECT.md
Test infrastructure plan: d:/tutor demo/TutorDemo/TEST_INFRA.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Design and implement the complete opaque-box E2E and functional test suite for the Admin Flow subsystem across Tiers 1-4 per TEST_INFRA.md.
1. The test runner is Node.js built-in test runner (node --test), matching existing test files in apps/web/tests/.
2. Do NOT touch or weaken any of the 55 existing tests in apps/web/tests/.
3. Create comprehensive test suites in apps/web/tests/:
   - apps/web/tests/adminDomain.test.js: Tier 1 & 2 tests for canonical domain state, persistence under tnm.demo.domain.v1, reducers, deterministic fixtures, and hooks.
   - apps/web/tests/adminAuthGuard.test.js: Tier 1 & 2 tests for account suspension login rejection with exact message: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.', password and provider login, and unsuspension login recovery.
   - apps/web/tests/adminCrossRoleSync.test.js: Tier 1, 2 & 3 tests for tutor approval reflecting in learner discovery and review moderation reflecting in public profile.
   - apps/web/tests/adminOperational.test.js: Tier 1, 2 & 3 tests for operational tables, search query matching, status tabs filtering, record counter ('Hiển thị X / Y bản ghi'), and drawer actions.
   - apps/web/tests/adminE2EScenarios.test.js: Tier 4 tests covering the 5 real-world application scenarios specified in TEST_INFRA.md.
4. Run npm run test or node --test to verify your test suite structure and syntax.
5. When complete, create d:/tutor demo/TutorDemo/TEST_READY.md at project root with the test runner command, tier breakdown, and feature checklist.
6. Write your handoff report to d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_test_writer_e2e_1/handoff.md.
7. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent) with the status.
