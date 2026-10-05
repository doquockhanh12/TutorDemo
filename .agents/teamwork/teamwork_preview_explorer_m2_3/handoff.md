# Handoff Report: Public Profile Review Moderation Reactivity (Milestone M2)

**Agent:** `teamwork_preview_explorer_m2_3`  
**Milestone:** M2 (Cross-Role Synchronization & Auth Guard — FEAT-ADM-008)  
**Date:** 2026-10-04  

---

## 1. Observation

1. **Static Review Import in Learner Profile:**
   - In `apps/web/src/features/learner/TutorProfilePage.jsx` lines 27–29:
     ```javascript
     import {
       profileReviews,
     } from '../../data/tutorProfiles.js';
     ```
   - In `apps/web/src/data/tutorProfiles.js` line 11:
     ```javascript
     export const profileReviews = demoReferenceData.reviews;
     ```
   - `profileReviews` exports the raw static reference array from `demoReferenceData`, completely bypassing runtime state in `DemoDomainContext` and `localStorage` key `tnm.demo.domain.v1`.

2. **Unfiltered Static Mapping in JSX:**
   - In `apps/web/src/features/learner/TutorProfilePage.jsx` lines 573–627:
     ```jsx
     {profileReviews.map(
       (review) => (
         <article
           key={
             review.id
           }
         >
           <Avatar
             initials={
               review.initials
             }
             name={
               review.name
             }
             size="sm"
           />
           ...
     ```
   - There is NO filter by `review.tutorId === tutor.id`.
   - There is NO filter by `review.moderationStatus === 'approved'`.
   - There is NO filter by `review.visibility === 'public'`.
   - Consequently, all tutors render all 6 fixture reviews, including `review-4` (`pending`) and `review-6` (`hidden` for community guideline violations).

3. **Canonical Domain State & Reducer Implementation:**
   - In `apps/web/src/features/domain/demoDomain.js` lines 345–367:
     `moderateReview(state, reviewId, decision)` atomically updates:
     - `moderationStatus`: `'approved'` or `'hidden'`
     - `visibility`: `'public'` or `'hidden'`
     - `status`: `'approved'` or `'hidden'`
     - `moderatedAt`: ISO timestamp
   - In `apps/web/src/features/domain/DemoDomainContext.jsx` line 94–96:
     `DemoDomainProvider` exposes `moderateReview`, `approveReview`, `hideReview` actions and passes `...state` containing `state.reviews` to `useDemoDomain()`.

4. **Test Specifications in `adminCrossRoleSync.test.js`:**
   - In `apps/web/tests/adminCrossRoleSync.test.js` lines 176–256:
     - `F8-T1-01`: Requires public profile to show ONLY reviews where `moderationStatus === 'approved'` AND `visibility === 'public'`.
     - `F8-T1-02`: Requires pending reviews to be absent.
     - `F8-T1-03`: Requires `moderateReview(state, id, 'approved')` to immediately surface review on `/tutors/:id`.
     - `F8-T1-04`: Requires `moderateReview(state, id, 'hidden')` to immediately remove review from `/tutors/:id`.
     - `F8-T1-05`: Requires re-approving a hidden review to restore it to `/tutors/:id`.
   - In `apps/web/tests/adminTestHelpers.js` lines 12–18:
     ```javascript
     export function selectPublicProfileReviews(state, tutorId) {
       return (state.reviews || []).filter((r) =>
         r.tutorId === tutorId &&
         (r.moderationStatus || 'approved') === 'approved' &&
         (r.visibility || 'public') === 'public'
       );
     }
     ```

5. **Test Suite Baseline Health:**
   - Executing `npm run test` in `apps/web` yields `pass 176, fail 0` in ~2.2s.

---

## 2. Logic Chain

1. **Step 1 (From Observation 1 & 2):**  
   Because `TutorProfilePage.jsx` imports `profileReviews` directly from `../../data/tutorProfiles.js` rather than querying `useDemoDomain()`, any state changes made by `DemoDomainProvider` via Admin moderation (`moderateReview`) will never trigger a re-render or alter the rendered reviews in `TutorProfilePage`.
2. **Step 2 (From Observation 2 & 4):**  
   Because lines 573–627 map over `profileReviews` directly without filtering by `tutorId`, `moderationStatus`, or `visibility`, public tutor pages violate requirement FEAT-ADM-008 and leak unapproved/hidden reviews to learners.
3. **Step 3 (From Observation 3 & 4):**  
   The canonical domain in `demoDomain.js` already holds the single source of truth for review moderation under `state.reviews`, and `DemoDomainContext` already provides reactive updates when reviews are approved or hidden.
4. **Step 4 (From Observation 4 & 5):**  
   The test helper `selectPublicProfileReviews(state, tutorId)` defines the authoritative contract for public review display:
   ```javascript
   (review.tutorId === tutorId) &&
   ((review.moderationStatus || 'approved') === 'approved') &&
   ((review.visibility || 'public') === 'public')
   ```
5. **Step 5 (Synthesis to Conclusion):**  
   Replacing the static import in `TutorProfilePage.jsx` with `useDemoDomain().reviews` filtered by `selectPublicProfileReviews` completely resolves FEAT-ADM-008, satisfies all Tier 1–4 tests, and ensures immediate cross-role reactivity when Admin approves or hides reviews.

---

## 3. Caveats

1. **Header Aggregate Rating vs. Review List:**  
   In the tutor profile identity header (lines 298–311), `tutor.rating` and `tutor.reviews` represent seed metadata from the tutor profile record (e.g. 4.9 stars, 36 reviews) rather than dynamically computed averages over the few detailed demo reviews in `state.reviews`. In our blueprint, we preserve `tutor.rating` / `tutor.reviews` for header stability while dynamically filtering the review list. If dynamic rating recalculation in the header is also desired, `calculateTutorRatingSummary(visibleReviews)` can be optionally integrated.
2. **Author and Comment Field Aliases:**  
   Test fixtures and seed fixtures vary slightly in property naming (`name` vs `author`, `text` vs `comment` vs `excerpt`). The blueprint explicitly normalizes these (`review.name || review.author || review.learnerName`, `review.text || review.comment || review.excerpt`) to guarantee zero runtime rendering crashes across all test fixtures and production seeds.

---

## 4. Conclusion

- The root cause of the lack of review moderation reactivity in `TutorProfilePage.jsx` is the static import `profileReviews` from `../../data/tutorProfiles.js` and the unfiltered map at line 573.
- The recommended fix is:
  1. Export canonical pure selector `selectPublicProfileReviews(state, tutorId)` and helper `calculateTutorRatingSummary(reviews)` in `apps/web/src/features/domain/demoDomain.js`.
  2. Remove `import { profileReviews } from '../../data/tutorProfiles.js'` in `TutorProfilePage.jsx`.
  3. Query `reviews` from `useDemoDomain()` in `TutorProfilePage.jsx` and compute `visibleReviews` using `selectPublicProfileReviews({ reviews }, tutor.id)`.
  4. Render `visibleReviews` with fallback handling for names/comments/dates and a clean zero-state message ("Chưa có đánh giá nào cho gia sư này.").
- Full drop-in code blueprint and line-by-line diff are documented in `.agents/teamwork/teamwork_preview_explorer_m2_3/review_sync_report.md`.

---

## 5. Verification Method

1. **Automated Unit & Integration Tests:**
   In `apps/web`:
   ```powershell
   node --test tests/adminCrossRoleSync.test.js
   node --test tests/adminE2EScenarios.test.js
   npm run test
   ```
   **Expected Outcome:** All 176 tests pass 100%.

2. **Interactive UI Verification:**
   - Run `npm run dev` in `apps/web`.
   - Navigate to `/tutors/mai-anh`: verify only `review-1` is visible (review-4 is pending and hidden).
   - In `/admin/reviews`, click "Ẩn" on `review-1`: verify `/tutors/mai-anh` immediately removes `review-1` and shows zero-state fallback.
   - In `/admin/reviews`, click "Duyệt" on `review-4`: verify `/tutors/mai-anh` immediately renders `review-4`.
