## 2026-10-04T19:17:14Z
You are teamwork_preview_explorer_m2_3, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_3

MANDATORY FIRST STEP: Read the authoritative user requirements:
d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture:
d:/tutor demo/TutorDemo/PROJECT.md
and test status:
d:/tutor demo/TutorDemo/TEST_READY.md
Coding rules:
d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate and design the public profile review moderation reactivity for Milestone M2:
1. Inspect `apps/web/src/features/learner/TutorProfilePage.jsx`.
2. Find the static import of `profileReviews` from `../../data/tutorProfiles.js` (around line 28/29) and how reviews are rendered (around line 573).
3. Design the replacement to query canonical reviews from domain state (`useDemoDomain().reviews` or selector).
4. Filter reviews: only include reviews where `review.tutorId === tutor.id` AND `review.moderationStatus === 'approved'` AND `review.visibility === 'public'`.
5. Verify that Admin hiding a review immediately removes it from the public profile, and approving makes it visible.
6. Review `apps/web/tests/adminCrossRoleSync.test.js` to ensure the blueprint satisfies profile review sync tests.
7. Write your detailed findings and code blueprint to `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_3/review_sync_report.md` and `handoff.md`.
8. Send a message to parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent).
