## 2026-10-04T18:31:49Z
Sender: ec700531-367f-41a9-8ddb-b20bbc762b58 (parent)
Content:
You are teamwork_preview_explorer_m1_2, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_2
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Project plan: d:/tutor demo/TutorDemo/PROJECT.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate and produce the exact reducer functions and Context action methods needed for Milestone M1:
1. In apps/web/src/features/domain/demoDomain.js:
   - Design pure reducer functions for:
     approveTutor(state, tutorId)
     rejectTutor(state, tutorId, reason)
     setTutorSuspension(state, tutorId, isSuspended)
     setUserSuspension(state, userId, isSuspended)
     moderateReview(state, reviewId, decision: 'approved' | 'hidden')
     updateIssueStatus(state, issueId, status, resolutionNote)
2. In apps/web/src/features/domain/DemoDomainContext.jsx:
   - Design the dispatch callbacks to expose on the Context object.
3. Verify backward compatibility: ensure existing actions (requestLesson, updateLessonStatus, saveProfile, etc.) and existing 55 tests are 100% untouched and unaffected.
4. Write your detailed findings and code blueprints to d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m1_2/reducer_report.md and handoff.md.
5. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
