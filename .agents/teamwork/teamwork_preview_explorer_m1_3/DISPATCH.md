## 2026-10-04T18:31:49Z

You are teamwork_preview_explorer_m1_3, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_3
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Project plan: d:/tutor demo/TutorDemo/PROJECT.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate and design the dedicated Admin hooks file (apps/web/src/features/domain/useAdminDomain.js) for Milestone M1:
1. Design the 5 required hooks:
   - useAdminOverview(): returns computed live stats, pendingTutors, recentReviews, openIssues.
   - useAdminTutors(): returns tutors list with computed metrics, actions (approveTutor, rejectTutor, toggleSuspendTutor).
   - useAdminUsers(): returns users list with computed metrics, action (toggleSuspendUser).
   - useAdminReviews(): returns reviews list with computed metrics, actions (approveReview, hideReview).
   - useAdminIssues(): returns issues list with computed metrics, action (updateIssueStatus).
2. Design unit test specifications for these hooks in apps/web/tests/adminDomain.test.js.
3. Write your detailed findings and code blueprints to d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_3/hooks_report.md and handoff.md.
4. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
