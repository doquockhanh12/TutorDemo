## 2026-10-04T18:19:52Z
You are teamwork_preview_explorer_survey_2, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_2
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate existing Admin UI, navigation, shells, and components in TutorNearMe:
1. Locate all current Admin files: routes in `src/routes/` or `src/App.jsx`, `AdminShell`, `AdminHeader`, `AdminSidebar`, `RoleSwitcher`.
2. Locate existing `/admin/dashboard` implementation: what metrics are shown, how are they currently calculated or hardcoded?
3. Check existing management pages or stubs for `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`. Are there existing table, tab, filter, modal, or drawer implementations?
4. Identify shared UI primitives: `src/components/common/` or `src/components/ui/` (e.g. Button, Input, Modal, Table, Badge, Drawer). Note what exists and what is missing.
5. Examine visual tokens, Lucide icons in use, CSS/Tailwind configuration, styling patterns, and responsive breakpoints/classes (desktop, tablet, mobile).
6. Check how drawer components are typically structured in this app or best practices for slide-over drawers without losing table scroll/filter state.
7. Write your detailed findings into `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_2/admin_ui_report.md` and write a standard `handoff.md` in your working directory.
8. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent) when complete with the file path.
