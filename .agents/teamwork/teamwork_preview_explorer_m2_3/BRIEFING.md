# BRIEFING — 2026-10-04T19:23:00Z

## Mission
Investigate and design public profile review moderation reactivity in TutorProfilePage for Milestone M2.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_3
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: M2 (Public Profile Review Moderation Reactivity)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do not modify source code outside .agents/teamwork/teamwork_preview_explorer_m2_3
- Produce review_sync_report.md and handoff.md
- Verify against adminCrossRoleSync.test.js requirements

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T19:17:14Z

## Investigation State
- **Explored paths**:
  - `apps/web/src/features/learner/TutorProfilePage.jsx` (lines 1-633)
  - `apps/web/src/data/tutorProfiles.js` (lines 1-12)
  - `apps/web/src/features/domain/demoDomain.js` (lines 50-392)
  - `apps/web/src/features/domain/DemoDomainContext.jsx` (lines 1-153)
  - `apps/web/src/features/domain/useAdminDomain.js` (lines 1-597)
  - `apps/web/src/data/demoReferenceData.js` (lines 1515-1950)
  - `apps/web/tests/adminCrossRoleSync.test.js` (lines 1-381)
  - `apps/web/tests/adminTestHelpers.js` (lines 1-133)
  - `apps/web/tests/adminE2EScenarios.test.js` (lines 180-240)
- **Key findings**:
  - `TutorProfilePage.jsx` imports `profileReviews` statically from `../../data/tutorProfiles.js` and maps unconditionally at line 573.
  - Reviews are not filtered by `tutorId`, `moderationStatus`, or `visibility`.
  - Admin actions (`approveReview`, `hideReview`) in `DemoDomainContext` have zero effect on the public profile.
  - Test specs (`adminCrossRoleSync.test.js` F8-T1-01..F8-T1-05 and `adminTestHelpers.js`) define canonical selector `selectPublicProfileReviews`.
  - Full drop-in blueprint designed with normalization and zero-state handling.
- **Unexplored areas**: None within the scope of M2 review sync.

## Key Decisions Made
- Recommending canonical selector export `selectPublicProfileReviews` and `calculateTutorRatingSummary` from `demoDomain.js`.
- Replacing static `profileReviews` with `useDemoDomain().reviews` filtered by `tutor.id`, `moderationStatus === 'approved'`, and `visibility === 'public'`.
- Preserving header `tutor.rating`/`tutor.reviews` while dynamically rendering filtered reviews in the list.

## Artifact Index
- `DISPATCH.md` — incoming dispatch instructions
- `BRIEFING.md` — persistent situational awareness
- `progress.md` — liveness heartbeat
- `review_sync_report.md` — comprehensive technical analysis and code blueprint
- `handoff.md` — 5-component self-contained handoff report
