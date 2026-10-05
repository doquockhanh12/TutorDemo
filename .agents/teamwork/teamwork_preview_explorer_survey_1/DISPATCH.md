## 2026-10-04T18:19:51Z

You are teamwork_preview_explorer_survey_1, a read-only exploration agent.
Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_1
Authoritative requirements: d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md
Coding rules: d:/tutor demo/TutorDemo/AGENTS.md

YOUR MISSION:
Investigate the data, storage, and domain architecture of TutorNearMe:
1. Examine `src/data/demoReferenceData.js`, `src/features/domain/demoDomain.js`, and any related domain context/hooks (`DemoDomainContext`, hooks in `src/features/domain/` or `src/features/`).
2. Discover how data is initialized, how localStorage persistence works (`tnm.demo.domain.v1`), how resets occur, and how domain state is modified and subscribed to.
3. Determine existing entity models: tutors, users/accounts, lessons, reviews, issues/disputes. Check what fields already exist vs what needs to be added for Admin requirements (R2, R3).
4. Check auth system implementation: `src/features/auth/` or `src/context/AuthContext.js`, login flow at `/login`, logout flow, and how account suspension check can be integrated cleanly without violating existing rules.
5. Check existing tests: where are unit tests located, what test runner is used (vitest/jest), run tests or examine test files to see how tests mock or test domain state.
6. Check Learner search (`/tutors` or learner search components) and Tutor public profile (`/tutors/:id`): how do they query tutors and reviews from domain state? Where are approved vs pending tutors filtered? Where are public vs hidden reviews filtered?
7. Write your detailed findings into `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_1/domain_architecture_report.md` and write a standard `handoff.md` in your working directory.
8. Send a message to your parent (conv ID: ec700531-367f-41a9-8ddb-b20bbc762b58, recipient name: parent) when complete with the file path.
