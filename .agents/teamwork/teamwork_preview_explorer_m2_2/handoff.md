# Handoff Report: Learner Search Tutor Moderation Filter (Milestone M2)

**Agent**: `teamwork_preview_explorer_m2_2`  
**Working Directory**: `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_m2_2`  
**Target Milestone**: M2 (Cross-Role Reactive Synchronization)  
**Feature**: FEAT-ADM-007 (Tutor Moderation Sync on Learner Search & Discovery)  
**Report Type**: Hard Handoff  

---

## 1. Observation

1. **`apps/web/src/features/tutor/TutorWorkspaceState.jsx` lines 23–29**:
   ```javascript
   export function useScheduledTutors() {
     const state = useDemoDomain();
     return state.profiles.map((tutor) => {
       const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
       return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
     });
   }
   ```
   Direct observation: `state.profiles.map(...)` maps every tutor in `state.profiles` without filtering on `moderationStatus`.

2. **`apps/web/src/features/learner/LearnerSearch.jsx` lines 14, 20–22, 33–47**:
   ```javascript
   import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
   ...
   export default function LearnerSearch() {
     const tutors = useScheduledTutors();
     const subjectOptions = ['Tất cả môn', ...new Set(tutors.flatMap((tutor) => tutor.subjects))];
     const locationOptions = ['Tất cả khu vực', ...new Set(tutors.map((tutor) => tutor.location).filter(Boolean))];
   ```
   Direct observation: `LearnerSearch` uses `useScheduledTutors()` as its sole input for `tutors`. Dynamic filter options (`subjectOptions`, `locationOptions`) and filtered search results (`results`) are directly derived from `tutors`.

3. **`apps/web/src/data/demoReferenceData.js` lines 142–950**:
   Direct observation: `seed.tutorProfiles` contains 11 deterministic tutors across four moderation states:
   - Approved: `mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy` (all have `"moderationStatus": "approved"`).
   - Pending: `thao-vy`, `hoang-phuc`, `minh-chau` (all have `"moderationStatus": "pending"`).
   - Rejected: `tuan-anh` (has `"moderationStatus": "rejected"`, `"rejectionReason": "..."`).
   - Suspended: `quang-huy` (has `"moderationStatus": "suspended"`, `"suspendedReason": "..."`).

4. **`apps/web/tests/adminTestHelpers.js` lines 6–9**:
   ```javascript
   // Canonical selector for Learner discovery
   export function selectLearnerDiscoveredTutors(state) {
     return (state.profiles || []).filter((p) => (p.moderationStatus || 'approved') === 'approved');
   }
   ```
   Direct observation: The canonical test suite contract defines learner-discovered tutors as `(p.moderationStatus || 'approved') === 'approved'`.

5. **`apps/web/tests/adminCrossRoleSync.test.js` lines 26–170, 306–327**:
   Direct observation: Tests `F7-T1-01` through `F7-T1-06` and `T3-01` assert that:
   - Non-approved tutors are filtered out from discovery.
   - Pending tutor `thao-vy` is absent before approval.
   - Calling `approveTutor(state, 'thao-vy')` immediately surfaces them.
   - Calling `rejectTutor(state, 'hoang-phuc')` keeps them excluded.
   - Calling `setTutorSuspension(state, 'quoc-bao', true)` immediately excludes them.
   - Calling `setTutorSuspension(state, 'quoc-bao', false)` immediately restores them.
   - Approving a tutor maintains strictly 9 requests in `state.requests` (BUG-010).

6. **`apps/web/src/data/tutors.js` and `apps/web/tests/demoDomain.test.js` lines 86–95**:
   ```javascript
   test('BUG-013 directory is a canonical fixture projection rather than another identity seed', () => {
     assert.equal(tutors, demoReferenceData.tutorProfiles);
     const state = createDemoState(now);
     assert.equal(state.profiles.find((t) => t.id === 'quoc-bao').sessionMinutes, state.settings['quoc-bao'].sessionMinutes);
   });
   ```
   Direct observation: `apps/web/src/data/tutors.js` must remain untouched because baseline test BUG-013 asserts reference equality with `demoReferenceData.tutorProfiles`.

---

## 2. Logic Chain

1. From Observation 1, `useScheduledTutors()` iterates unconditionally over `state.profiles`.
2. From Observation 3, `state.profiles` holds all 11 tutors, including 3 pending, 1 rejected, and 1 suspended tutor.
3. From Observation 2, `LearnerSearch.jsx` renders all tutors supplied by `useScheduledTutors()`. Consequently, unapproved tutors currently appear on `/learner/search`, contaminating the results and filter dropdowns.
4. From Observation 4 and 5, the project specification and test suite contract (`adminCrossRoleSync.test.js`) require learner discovery to return only approved tutors via `(p.moderationStatus || 'approved') === 'approved'`.
5. From Observation 6, filtering must NOT be implemented in `apps/web/src/data/tutors.js` to preserve the BUG-013 baseline test invariant.
6. Therefore, filtering must be placed inside `useScheduledTutors()` in `apps/web/src/features/tutor/TutorWorkspaceState.jsx`.
7. Because `useDemoDomain()` provides a reactive state object that updates upon administrative actions (`approveTutor`, `rejectTutor`, `setTutorSuspension`), wrapping `useScheduledTutors()` with `useMemo(() => ..., [state])` ensures:
   - Immediate reactive visibility when a tutor is approved.
   - Immediate exclusion when a tutor is suspended or rejected.
   - Immediate restoration when a suspended tutor is unsuspended.
   - Elimination of redundant schedule recalculations during search filter typing.
8. Defense-in-depth on `TutorProfilePage.jsx` ensures that direct navigation to `/tutors/:id` by learners for a non-approved tutor displays the fallback empty state rather than booking controls.

---

## 3. Caveats

1. **Static Landing Pages**: Public landing pages (`HomePage.jsx` and `LearnerLanding.jsx`) consume `publicTutors` from `data/public.js` per `reference/final/` visual guidelines; dynamic interactive discovery is handled by `/learner/search` (`LearnerSearch.jsx`) and `/learner/dashboard` (`LearnerDashboard.jsx`).
2. **Review Moderation Sync**: Review moderation on public profiles is part of FEAT-ADM-008 and is handled in parallel by the designated explorer/builder for review sync.
3. **Assumptions Made**: We assume `state.profiles` continues to be maintained as an array in `DemoDomainContext`. The defensive check `(state.profiles || [])` guards against null/undefined state during initial boot.

---

## 4. Conclusion

The solution to Milestone M2 FEAT-ADM-007 is clear, self-contained, and verified against all invariants:
In `apps/web/src/features/tutor/TutorWorkspaceState.jsx`, replace `state.profiles.map(...)` in `useScheduledTutors()` with:
```javascript
export function useScheduledTutors() {
  const state = useDemoDomain();
  return useMemo(() => {
    return (state.profiles || [])
      .filter((tutor) => (tutor.moderationStatus || 'approved') === 'approved')
      .map((tutor) => {
        const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
        return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
      });
  }, [state]);
}
```

This single change:
- Hides all 5 unapproved seed tutors from `/learner/search` (reducing visible seed tutors from 11 to 6).
- Instantly surfaces approved tutors upon Admin approval.
- Instantly removes suspended or rejected tutors upon Admin action.
- Directly satisfies `adminCrossRoleSync.test.js` tests F7-T1-01 through F7-T1-06, F7-T2-01 through F7-T2-03, T3-01, and SCENARIO-1 in `adminE2EScenarios.test.js`.
- Preserves all 55 pre-existing baseline unit tests without modification.

---

## 5. Verification Method

To independently verify the blueprint:

1. **Inspect Code Files**:
   - `apps/web/src/features/tutor/TutorWorkspaceState.jsx`: Lines 23–29
   - `apps/web/src/features/learner/LearnerSearch.jsx`: Lines 14, 20, 33–47
   - `apps/web/tests/adminTestHelpers.js`: Lines 7–9
   - `apps/web/tests/adminCrossRoleSync.test.js`: Lines 26–170, 306–327

2. **Project Test Commands** (to be run in `apps/web`):
   ```powershell
   # 1. Run cross-role sync test suite
   node --test tests/adminCrossRoleSync.test.js

   # 2. Run end-to-end admin scenario suite (verifies Scenario 1 Onboarding & Discovery)
   node --test tests/adminE2EScenarios.test.js

   # 3. Run canonical domain test suite
   node --test tests/adminDomain.test.js

   # 4. Run baseline regression suite (verifies BUG-010, BUG-013, SCHED-005 invariants)
   node --test tests/demoDomain.test.js tests/incomeSelectors.test.js tests/profileSelection.test.js
   ```

3. **Invalidation Conditions**:
   - If `(state.profiles || []).filter(...)` filters out tutors with `moderationStatus: 'approved'`.
   - If modifying `TutorWorkspaceState.jsx` alters the exported API signature of `useScheduledTutors()`.
   - If `apps/web/src/data/tutors.js` is modified (would break BUG-013 invariant).
