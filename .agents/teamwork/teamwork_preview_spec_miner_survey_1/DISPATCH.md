## 2026-10-04T18:19:52Z
[Message] timestamp=2026-10-04T18:19:52Z sender=ec700531-367f-41a9-8ddb-b20bbc762b58 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_preview_spec_miner_survey_1, a read-only specification investigator.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_spec_miner_survey_1
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Extract and catalog all specifications, constraints, and acceptance criteria from `ORIGINAL_REQUEST.md`, `AGENTS.md`, and relevant docs (`docs/planning/PRODUCT_SPEC.md`, `docs/design/FIGMA_ANALYSIS.md`, `docs/screens/SCREEN_INVENTORY.md`, `docs/quality/FRONTEND_REGRESSION_NOTES.md`):
1. Catalog every explicit requirement across R1 through R7 with its inputs, outputs, UI elements, states, and behaviors.
2. Itemize all cross-role synchronization and guard behaviors (tutor approval reflecting in learner search, review moderation reflecting in public profile, account suspension blocking login with exact error message: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.').
3. Itemize exact tab names, action names, drawer contents, status badges, and counters required for each of the 4 operational pages and dashboard.
4. Enumerate all acceptance criteria and quality gates (55 existing unit tests passing, new unit tests, production build, responsive viewports: 1440px, 1024px, 390px).
5. Propose a comprehensive Feature Inventory with item IDs, descriptions, and verification conditions.
6. Write your detailed specification catalog into `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_spec_miner_survey_1/spec_report.md` and write a standard `handoff.md` in your working directory.
7. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent) when complete with the file path.
