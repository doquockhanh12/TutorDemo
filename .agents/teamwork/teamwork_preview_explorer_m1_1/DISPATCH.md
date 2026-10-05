## 2026-10-04T18:31:49Z
You are teamwork_preview_explorer_m1_1, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_1
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Project plan: d:/tutor demo/TutorDemo/PROJECT.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate and produce the exact schema and fixture extension blueprint for Milestone M1 (Canonical Domain & Seed Data):
1. Read apps/web/src/data/demoReferenceData.js and determine the exact data structure to add for:
   - tutorProfiles: pending tutors (with university, subjects, fee, bio, submission date, illustrative document/card references for drawer review), approved tutors, rejected tutors, suspended tutors.
   - accounts: active Learner, active Tutor, suspended accounts (status: 'suspended').
   - reviews: approved/public, pending moderation, hidden/rejected (referencing canonical Tutor/Lesson/User).
   - issues: absence, lesson-time dispute, cancellation, fee dispute, attitude complaint across new/open, in progress, resolved states.
   - CRITICAL INVARIANT: requests must remain strictly 9 items.
2. Read apps/web/src/features/domain/demoDomain.js: how createDemoState and restoreDemoState must incorporate users, reviews, and issues.
3. Write your detailed findings and code blueprints to d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_1/schema_report.md and handoff.md.
4. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
