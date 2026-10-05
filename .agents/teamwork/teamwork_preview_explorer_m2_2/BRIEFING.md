# BRIEFING — 2026-10-04T19:24:20Z

## Mission
Investigate and design Learner Search tutor moderation filter for Milestone M2, ensuring only approved tutors (`moderationStatus === 'approved'`) are returned for discovery and sync with admin actions.

## 🔒 My Identity
- Archetype: explorer
- Roles: read-only investigation, analysis, synthesis, blueprint design
- Working directory: d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_2
- Original parent: ec700531-367f-41a9-8ddb-b20bbc762b58
- Milestone: M2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source code
- Adhere strictly to AGENTS.md, PROJECT.md, TEST_READY.md, and ORIGINAL_REQUEST.md
- Produce search_sync_report.md and handoff.md in working directory
- Communicate via send_message to parent

## Current Parent
- Conversation ID: ec700531-367f-41a9-8ddb-b20bbc762b58
- Updated: 2026-10-04T19:24:20Z

## Investigation State
- **Explored paths**:
  - `apps/web/src/features/tutor/TutorWorkspaceState.jsx` (`useScheduledTutors`)
  - `apps/web/src/features/learner/LearnerSearch.jsx` (`tutors`, `results`, `subjectOptions`, `locationOptions`)
  - `apps/web/src/features/learner/LearnerDashboard.jsx` (`savedTutors`, `tutors`)
  - `apps/web/src/features/learner/TutorProfilePage.jsx` (`/tutors/:id` public profile)
  - `apps/web/src/data/demoReferenceData.js` (11 canonical seed tutors: 6 approved, 3 pending, 1 rejected, 1 suspended)
  - `apps/web/src/features/domain/demoDomain.js` (`approveTutor`, `rejectTutor`, `setTutorSuspension`, `setUserSuspension`)
  - `apps/web/tests/adminCrossRoleSync.test.js` (F7 tests, T3-01 pairwise)
  - `apps/web/tests/adminTestHelpers.js` (`selectLearnerDiscoveredTutors`)
  - `apps/web/tests/demoDomain.test.js` (BUG-013 fixture invariant)
- **Key findings**:
  - `useScheduledTutors()` unconditionally maps all 11 tutors in `state.profiles`.
  - Filter predicate `(tutor.moderationStatus || 'approved') === 'approved'` wrapped in `useMemo(() => ..., [state])` perfectly mirrors test selector `selectLearnerDiscoveredTutors(state)` and satisfies all F7 test invariants.
  - Defense-in-depth on `TutorProfilePage.jsx` ensures direct access to `/tutors/:id` for unapproved tutors shows empty fallback.
- **Unexplored areas**: None within the assigned mission scope.

## Key Decisions Made
- Confirmed filter should live inside `useScheduledTutors()` in `TutorWorkspaceState.jsx`.
- Verified `demoReferenceData.tutorProfiles` and `src/data/tutors.js` must NOT be filtered to preserve baseline test BUG-013.
- Produced `search_sync_report.md` and `handoff.md`.

## Artifact Index
- `DISPATCH.md` — Log of instructions
- `progress.md` — Step-by-step progress
- `BRIEFING.md` — Situational memory
- `search_sync_report.md` — Comprehensive analysis and blueprint
- `handoff.md` — 5-component hard handoff report
