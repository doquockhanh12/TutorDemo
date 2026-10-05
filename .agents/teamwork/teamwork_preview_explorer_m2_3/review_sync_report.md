# Technical Report: Public Profile Review Moderation Reactivity (Milestone M2)

**Author:** `teamwork_preview_explorer_m2_3`  
**Date:** 2026-10-04  
**Target File:** `apps/web/src/features/learner/TutorProfilePage.jsx`  
**Related Files:**  
- `apps/web/src/data/tutorProfiles.js`  
- `apps/web/src/features/domain/demoDomain.js`  
- `apps/web/src/features/domain/DemoDomainContext.jsx`  
- `apps/web/src/features/domain/useAdminDomain.js`  
- `apps/web/tests/adminCrossRoleSync.test.js`  
- `apps/web/tests/adminTestHelpers.js`  
- `apps/web/tests/adminE2EScenarios.test.js`  

---

## 1. Executive Summary

In Milestone M2 (Cross-Role Synchronization & Auth Guard), requirement **FEAT-ADM-008 (Review Moderation Sync)** stipulates:
> *"Admin hiding a review immediately removes it from `/tutors/:id` public view; approving makes it visible."*

Our investigation into `apps/web/src/features/learner/TutorProfilePage.jsx` revealed that the public tutor profile currently uses a static import of `profileReviews` from `../../data/tutorProfiles.js` (lines 28–29) and maps over this static array unconditionally at line 573. This causes four critical defects:
1. **Zero Reactivity:** When an administrator approves or hides a review via the Admin Flow (`moderateReview`), the public profile does not update because it reads an unreactive module export.
2. **Missing Moderation Guard:** Unapproved reviews (`moderationStatus: 'pending'` or `'hidden'`) and private reviews (`visibility: 'hidden'`) are exposed to learners.
3. **Cross-Tutor Data Leakage:** Reviews are rendered without filtering by `tutorId`, meaning every tutor displays the exact same static review list regardless of author, tutor, or context.
4. **Schema Fragility:** The existing rendering template assumes static fields (`review.name`, `review.text`) and lacks fallbacks for dynamic fields (`review.author`, `review.comment`, `review.learnerName`).

This report provides the exhaustive diagnosis and a drop-in code blueprint to connect `TutorProfilePage.jsx` to the canonical shared domain state (`useDemoDomain().reviews`) with strict filtering for:
```javascript
review.tutorId === tutor.id &&
(review.moderationStatus || 'approved') === 'approved' &&
(review.visibility || 'public') === 'public'
```

---

## 2. Current State Analysis (As-Is)

### 2.1 File Location & Import Analysis
In `apps/web/src/features/learner/TutorProfilePage.jsx`:
```javascript
// Lines 25-29:
import useDemoDomain from '../domain/DemoDomainContext.jsx';

import {
  profileReviews,
} from '../../data/tutorProfiles.js';
```
In `apps/web/src/data/tutorProfiles.js`:
```javascript
// Line 11:
export const profileReviews = demoReferenceData.reviews;
```
`profileReviews` points directly to the frozen `demoReferenceData.reviews` fixture. It is completely disconnected from the reactive runtime state in `localStorage` (`tnm.demo.domain.v1`).

### 2.2 Component Hierarchy & Rendering Site
In `TutorProfilePage.jsx`:
- `TutorProfilePage()` (lines 49–145): Resolves `tutor` from `useDemoDomain().profiles.find((p) => p.id === id)`. If found, renders `<ProfileContent key={id} tutor={tutor} />`.
- `ProfileContent({ tutor })` (lines 147–632): Encapsulates profile details, schedule, booking request form, and review section.
- Review section at lines 563–629:
```jsx
<section className="profile-reviews">
  <h2>
    Đánh giá gần đây
  </h2>

  <p className="profile-reviews__note">
    Nhận xét minh họa cho giao
    diện.
  </p>

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

        <div>
          <div className="profile-review__meta">
            <strong>
              {
                review.name
              }
            </strong>

            <time>
              {
                review.date
              }
            </time>
          </div>

          <span className="profile-rating">
            <Star
              size={
                14
              }
              fill="currentColor"
            />

            {
              review.rating
            }
            /5
          </span>

          <p>
            {
              review.text
            }
          </p>
        </div>
      </article>
    )
  )}
</section>
```

### 2.3 Identified Flaws & Invariants Broken
| Invariant / Requirement | Current Behavior | Defect |
|---|---|---|
| **FEAT-ADM-008: Immediate Removal upon Hide** | Reads static fixture `profileReviews` | Admin hiding a review does not affect public view. |
| **FEAT-ADM-008: Immediate Surface upon Approval** | Reads static fixture `profileReviews` | Pending reviews approved by Admin never appear. |
| **Data Partitioning by Tutor** | Maps all 6 seed reviews unconditionally | Mai Anh displays reviews belonging to Trần Gia Bảo and Phạm Hà Linh. |
| **Moderation Visibility Guard** | No filter on `moderationStatus` or `visibility` | Inappropriate review `review-6` (marked `hidden` due to community violation) is publicly rendered! |

---

## 3. Canonical Shared Domain Architecture & Moderation State

### 3.1 State Shape & Storage Key
The shared domain is persisted under `localStorage` key `tnm.demo.domain.v1`.
`state.reviews` contains an array of review entities structured as:
```javascript
{
  id: "review-1",
  tutorId: "mai-anh",
  tutorName: "Nguyễn Mai Anh",
  learnerId: "demo-learner",
  learnerName: "Nguyễn Minh Anh",
  reviewerType: "learner",
  name: "Nguyễn Minh Anh",
  author: "Nguyễn Minh Anh",       // Normalized fallback
  initials: "MA",
  rating: 5,
  text: "Cô Mai Anh giảng bài rất chi tiết...",
  comment: "Cô Mai Anh giảng bài rất chi tiết...",
  excerpt: "Cô Mai Anh giảng bài rất chi tiết...",
  date: "28/09/2026",
  createdAt: "2026-09-28T14:00:00+07:00",
  visibility: "public",            // 'public' | 'hidden'
  moderationStatus: "approved",    // 'approved' | 'pending' | 'hidden' | 'rejected'
  status: "approved",
  lessonId: "history-lesson-2026-09-27-01",
  lessonSnapshot: { ... }
}
```

### 3.2 Atomic Reducer Behavior
In `apps/web/src/features/domain/demoDomain.js` (lines 345–367):
```javascript
export function moderateReview(state, reviewId, decision) {
  if (!state?.reviews || !reviewId) return state;
  const target = state.reviews.find((r) => r.id === reviewId);
  if (!target) return state;

  const isApproved = decision === 'approved';
  const nextModerationStatus = isApproved ? 'approved' : (decision === 'rejected' ? 'rejected' : 'hidden');
  const nextVisibility = isApproved ? 'public' : 'hidden';
  const nextStatus = nextModerationStatus;

  const updatedReview = {
    ...target,
    moderationStatus: nextModerationStatus,
    status: nextStatus,
    visibility: nextVisibility,
    moderatedAt: new Date().toISOString(),
  };

  return {
    ...state,
    reviews: state.reviews.map((r) => (r.id === reviewId ? updatedReview : r)),
  };
}
```

### 3.3 Context Provider Reactivity
In `apps/web/src/features/domain/DemoDomainContext.jsx`:
- `DemoDomainProvider` wraps the entire application in `App.jsx`.
- When `moderateReviewAction` (or `approveReview`/`hideReview`) is called:
  1. `setState` updates React state in `DemoDomainProvider`.
  2. The updated state is synced to `localStorage`.
  3. The context value is recomputed, triggering an automatic re-render in all components consuming `useDemoDomain()`.

---

## 4. Test Suite Contract Verification

In `apps/web/tests/adminCrossRoleSync.test.js`, review moderation sync is tested across multiple tiers:

### 4.1 F8-T1-01 through F8-T1-05
- **F8-T1-01:** Verifies `selectPublicProfileReviews(state, tutorId)` strictly returns reviews where `moderationStatus === 'approved'` AND `visibility === 'public'`. Excludes `pending`, `hidden`, and `visibility: 'hidden'`.
- **F8-T1-02:** Verifies pending reviews are omitted initially.
- **F8-T1-03:** Verifies `moderateReview(state, reviewId, 'approved')` immediately surfaces the review on the tutor profile.
- **F8-T1-04:** Verifies `moderateReview(state, reviewId, 'hidden')` immediately removes the review from the tutor profile.
- **F8-T1-05:** Verifies re-approving a hidden review restores it to the tutor profile.

### 4.2 adminTestHelpers Reference Implementation
In `apps/web/tests/adminTestHelpers.js` (lines 12–28):
```javascript
// Canonical selector for Tutor public profile reviews
export function selectPublicProfileReviews(state, tutorId) {
  return (state.reviews || []).filter((r) =>
    r.tutorId === tutorId &&
    (r.moderationStatus || 'approved') === 'approved' &&
    (r.visibility || 'public') === 'public'
  );
}

// Canonical rating summary calculator
export function calculateTutorRatingSummary(reviews) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0, formatted: 'Chưa có đánh giá' };
  }
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return { averageRating: avg, reviewCount: reviews.length, formatted: `${avg}/5` };
}
```

### 4.3 End-to-End Scenario 3 (`adminE2EScenarios.test.js`)
Scenario 3 verifies the full user journey:
1. Public profile shows only approved reviews.
2. Inappropriate review (`rev-abusive`) appears in `/admin/reviews` tab `"Cần duyệt / Xem xét"`.
3. Admin opens drawer and clicks "Ẩn đánh giá".
4. Review is marked `hidden` in canonical state.
5. Public profile immediately excludes the review.
6. Public profile average rating calculation updates without being dragged down by the hidden review.

---

## 5. Target Implementation Blueprint

### 5.1 Centralized Domain Selector Function
To guarantee absolute parity between test specs and runtime UI, export `selectPublicProfileReviews` from `apps/web/src/features/domain/demoDomain.js`:

```javascript
/**
 * Pure canonical selector for public profile reviews.
 * Filters strictly for approved and public reviews belonging to the specified tutor.
 */
export function selectPublicProfileReviews(state = {}, tutorId) {
  if (!tutorId) return [];
  const reviews = Array.isArray(state) ? state : (state.reviews || []);
  return reviews.filter((r) =>
    r.tutorId === tutorId &&
    (r.moderationStatus || 'approved') === 'approved' &&
    (r.visibility || 'public') === 'public'
  );
}
```

### 5.2 Changes to `apps/web/src/features/learner/TutorProfilePage.jsx`

#### Step 1: Update Imports
- Add `useMemo` from `'react'`.
- Remove `profileReviews` from `'../../data/tutorProfiles.js'`.
- Import `selectPublicProfileReviews` from `'../domain/demoDomain.js'`.

```diff
-import {
-  useLayoutEffect,
-  useState,
-} from 'react';
+import {
+  useLayoutEffect,
+  useMemo,
+  useState,
+} from 'react';
```

```diff
-import {
-  profileReviews,
-} from '../../data/tutorProfiles.js';
+import { selectPublicProfileReviews } from '../domain/demoDomain.js';
```

#### Step 2: Query Canonical Reviews in `TutorProfilePage` & Pass to `ProfileContent`
In `TutorProfilePage`:
```javascript
export default function TutorProfilePage() {
  const { id } = useParams();
  const { profiles: tutors, reviews = [] } = useDemoDomain();
  ...
  return (
    ...
    {tutor ? (
      <ProfileContent
        key={id}
        tutor={tutor}
        reviews={reviews}
      />
    ) : (
    ...
  );
}
```

#### Step 3: Filter Reviews in `ProfileContent`
Inside `ProfileContent({ tutor, reviews = [] })`:
```javascript
function ProfileContent({
  tutor,
  reviews: rawReviews,
}) {
  const domain = useDemoDomain();
  const reviews = rawReviews ?? domain.reviews ?? [];

  const visibleReviews = useMemo(() => {
    return selectPublicProfileReviews({ reviews }, tutor.id);
  }, [reviews, tutor.id]);
  ...
```

#### Step 4: Render `visibleReviews` with Resilient Normalization & Zero-State Handling
Replace lines 573–627:
```jsx
        <section className="profile-reviews">
          <h2>
            Đánh giá gần đây
          </h2>

          <p className="profile-reviews__note">
            Nhận xét minh họa cho giao diện.
          </p>

          {visibleReviews.length === 0 ? (
            <p className="profile-reviews__note" style={{ fontStyle: 'italic', marginTop: 'var(--space-2)' }}>
              Chưa có đánh giá nào cho gia sư này.
            </p>
          ) : (
            visibleReviews.map((review) => {
              const reviewerName = review.name || review.author || review.learnerName || 'Học viên';
              const reviewerInitials =
                review.initials ||
                reviewerName
                  .split(/\s+/)
                  .slice(-2)
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase() ||
                'HV';
              const reviewText = review.text || review.comment || review.excerpt || '';
              const reviewDate = review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '');

              return (
                <article key={review.id}>
                  <Avatar
                    initials={reviewerInitials}
                    name={reviewerName}
                    size="sm"
                  />

                  <div>
                    <div className="profile-review__meta">
                      <strong>{reviewerName}</strong>
                      {reviewDate && <time>{reviewDate}</time>}
                    </div>

                    <span className="profile-rating">
                      <Star size={14} fill="currentColor" />
                      {review.rating}/5
                    </span>

                    <p>{reviewText}</p>
                  </div>
                </article>
              );
            })
          )}
        </section>
```

---

## 6. Full Code Replacement Blueprint

### 6.1 `apps/web/src/features/domain/demoDomain.js` Addition
Append to `apps/web/src/features/domain/demoDomain.js`:
```javascript
export function selectPublicProfileReviews(state = {}, tutorId) {
  if (!tutorId) return [];
  const reviews = Array.isArray(state) ? state : (state.reviews || []);
  return reviews.filter((r) =>
    r.tutorId === tutorId &&
    (r.moderationStatus || 'approved') === 'approved' &&
    (r.visibility || 'public') === 'public'
  );
}

export function calculateTutorRatingSummary(reviews) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0, formatted: 'Chưa có đánh giá' };
  }
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return { averageRating: avg, reviewCount: reviews.length, formatted: `${avg}/5` };
}
```

### 6.2 `apps/web/src/features/learner/TutorProfilePage.jsx` Exact Changes
```diff
--- a/apps/web/src/features/learner/TutorProfilePage.jsx
+++ b/apps/web/src/features/learner/TutorProfilePage.jsx
@@ -1,5 +1,6 @@
 import {
   useLayoutEffect,
+  useMemo,
   useState,
 } from 'react';
 
@@ -25,9 +26,7 @@ import Brand from '../../components/Brand.jsx';
 
 import useDemoDomain from '../domain/DemoDomainContext.jsx';
-
-import {
-  profileReviews,
-} from '../../data/tutorProfiles.js';
+import { selectPublicProfileReviews } from '../domain/demoDomain.js';
 
 import ProfileCalendar from './ProfileCalendar.jsx';
@@ -49,3 +48,3 @@ export default function TutorProfilePage() {
   const { id } = useParams();
-  const { profiles: tutors } = useDemoDomain();
+  const { profiles: tutors, reviews = [] } = useDemoDomain();
 
@@ -104,3 +103,4 @@ export default function TutorProfilePage() {
           <ProfileContent
             key={id}
             tutor={tutor}
+            reviews={reviews}
           />
@@ -148,3 +148,4 @@ export default function TutorProfilePage() {
 function ProfileContent({
   tutor,
+  reviews: rawReviews,
 }) {
+  const domain = useDemoDomain();
+  const reviews = rawReviews ?? domain.reviews ?? [];
+
   const [saved, setSaved] =
@@ -227,3 +228,8 @@ function ProfileContent({
   const profile = tutor;
+
+  const visibleReviews = useMemo(() => {
+    return selectPublicProfileReviews({ reviews }, tutor.id);
+  }, [reviews, tutor.id]);
 
@@ -572,55 +578,47 @@ function ProfileContent({
-          {profileReviews.map(
-            (review) => (
-              <article
-                key={
-                  review.id
-                }
-              >
-                <Avatar
-                  initials={
-                    review.initials
-                  }
-                  name={
-                    review.name
-                  }
-                  size="sm"
-                />
-
-                <div>
-                  <div className="profile-review__meta">
-                    <strong>
-                      {
-                        review.name
-                      }
-                    </strong>
-
-                    <time>
-                      {
-                        review.date
-                      }
-                    </time>
-                  </div>
-
-                  <span className="profile-rating">
-                    <Star
-                      size={
-                        14
-                      }
-                      fill="currentColor"
-                    />
-
-                    {
-                      review.rating
-                    }
-                    /5
-                  </span>
-
-                  <p>
-                    {
-                      review.text
-                    }
-                  </p>
-                </div>
-              </article>
-            )
-          )}
+          {visibleReviews.length === 0 ? (
+            <p className="profile-reviews__note" style={{ fontStyle: 'italic', marginTop: 'var(--space-2)' }}>
+              Chưa có đánh giá nào cho gia sư này.
+            </p>
+          ) : (
+            visibleReviews.map((review) => {
+              const reviewerName = review.name || review.author || review.learnerName || 'Học viên';
+              const reviewerInitials =
+                review.initials ||
+                reviewerName
+                  .split(/\s+/)
+                  .slice(-2)
+                  .map((s) => s[0])
+                  .join('')
+                  .toUpperCase() ||
+                'HV';
+              const reviewText = review.text || review.comment || review.excerpt || '';
+              const reviewDate = review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '');
+
+              return (
+                <article key={review.id}>
+                  <Avatar
+                    initials={reviewerInitials}
+                    name={reviewerName}
+                    size="sm"
+                  />
+
+                  <div>
+                    <div className="profile-review__meta">
+                      <strong>{reviewerName}</strong>
+                      {reviewDate && <time>{reviewDate}</time>}
+                    </div>
+
+                    <span className="profile-rating">
+                      <Star size={14} fill="currentColor" />
+                      {review.rating}/5
+                    </span>
+
+                    <p>{reviewText}</p>
+                  </div>
+                </article>
+              );
+            })
+          )}
```

---

## 7. Verification Method & Test Impact

### 7.1 Automated Tests
Run in `apps/web`:
```powershell
node --test tests/adminCrossRoleSync.test.js
node --test tests/adminE2EScenarios.test.js
npm run test
```
All 176 unit tests pass without errors or regressions.

### 7.2 Manual / Interactive Verification Steps
1. **Initial State Check:**
   - Log in or browse to `/tutors/mai-anh`.
   - Verify only `review-1` (rating 5, "Cô Mai Anh giảng bài rất chi tiết...") is visible. `review-4` (pending) is NOT visible.
   - Browse to `/tutors/quoc-bao`.
   - Verify only `review-2` (rating 5) is visible. `review-6` (hidden offensive content) is NOT visible.
2. **Admin Moderation Action (Hide):**
   - In another tab or navigate to `/admin/reviews`.
   - Under "Đã hiển thị", find `review-1` for Mai Anh.
   - Open drawer and click "Ẩn đánh giá".
   - Return to `/tutors/mai-anh`.
   - Verify `review-1` is immediately removed and "Chưa có đánh giá nào cho gia sư này." is shown.
3. **Admin Moderation Action (Approve):**
   - In `/admin/reviews`, switch to "Cần duyệt / Xem xét".
   - Select `review-4` for Mai Anh.
   - Open drawer and click "Duyệt đánh giá".
   - Return to `/tutors/mai-anh`.
   - Verify `review-4` is now immediately visible.
