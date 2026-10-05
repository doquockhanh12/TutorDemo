# Handoff Report: Milestone M2 Cross-Role Reactive Synchronization & Auth Suspension Guard

**Agent:** `teamwork_preview_worker_m2`  
**Milestone:** M2 (Cross-Role Synchronization & Auth Guard)  
**Date:** 2026-10-04T19:37:00Z  
**Parent Conversation ID:** `ec700531-367f-41a9-8ddb-b20bbc762b58`

---

## 1. Observation

Direct observations from inspecting the codebase and execution outputs:

1. **`apps/web/src/features/auth/DemoAuthContext.jsx`**:
   - `allAccounts()` previously only merged `DEMO_USERS` with `state.accounts` without checking canonical domain state persisted under `tnm.demo.domain.v1`.
   - `login(identity, password)` and `loginProvider(provider, phone)` previously had no check for `user.status === 'suspended'` or `account.status === 'suspended'`, allowing suspended accounts to log in and persist active sessions to storage.
   - Required verbatim Vietnamese suspension message:
     `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`

2. **`apps/web/src/features/tutor/TutorWorkspaceState.jsx`**:
   - `useScheduledTutors()` mapped over `state.profiles` without filtering for `moderationStatus`, allowing pending, rejected, and suspended tutors to appear in Learner search results and contaminate filter dropdowns.

3. **`apps/web/src/features/learner/TutorProfilePage.jsx`**:
   - Imported static `profileReviews` from `../../data/tutorProfiles.js` and mapped over it unconditionally.
   - Did not query `useDemoDomain().reviews`, rendering all reviews regardless of `tutorId`, `moderationStatus`, or `visibility`.
   - Rating displays were tied to static `tutor.rating` and `tutor.reviews` rather than live approved reviews.

4. **Test Suite & Build Execution**:
   - Executed `npm test` (`node --test`): All 176 tests passed (176 passed, 0 failed, duration: ~1.76s).
   - Executed `npm run build` (`vite build`): Built 1989 modules successfully into `dist/` with zero errors.

---

## 2. Logic Chain

1. **Auth Suspension Guard (`DemoAuthContext.jsx`)**:
   - In `allAccounts()`, reading `tnm.demo.domain.v1` from `localStorage` retrieves latest domain users updated by Admin actions (`setUserSuspension`, `setTutorSuspension`).
   - Matching users by `id` and `username` merges live `status` onto `baseAccounts`, while appending any extra domain accounts.
   - In `login()`, verifying credentials first ensures non-existent users receive `INVALID_CREDENTIALS_ERROR` rather than a suspension notice (satisfies invariant `F9-T2-01`).
   - If credentials match and `user.status === 'suspended'`, login immediately returns `{ error: SUSPENDED_ACCOUNT_ERROR }` without persisting session to storage (satisfies `F9-T1-04` through `F9-T1-06`).
   - In `loginProvider()`, if the matched account has `account.status === 'suspended'`, it immediately returns `{ error: SUSPENDED_ACCOUNT_ERROR }` without persisting session (satisfies `F9-T1-08` through `F9-T1-11`).
   - When an administrator unsuspends the account, `status` reverts to `'active'`, permitting successful login (satisfies `F9-T1-12`, `SCENARIO-5`).

2. **Tutor Moderation Sync on Discovery (`TutorWorkspaceState.jsx`)**:
   - Filtering `state.profiles` by `(tutor.moderationStatus || 'approved') === 'approved'` ensures that pending (`thao-vy`, `hoang-phuc`, `minh-chau`), rejected (`tuan-anh`), and suspended (`quang-huy`) tutors are excluded from Learner search results (satisfies `F7-T1-01`, `F7-T1-02`, `F7-T1-04`, `F7-T1-05`).
   - Admin approval mutates `moderationStatus` to `'approved'`, immediately surfacing the tutor in `useScheduledTutors()` without page reload (satisfies `F7-T1-03`, `SCENARIO-1`).
   - Wrapping in `useMemo([state])` guarantees reactivity to domain state changes while preventing redundant schedule recalculations during search/filter operations.

3. **Public Profile Review Moderation (`TutorProfilePage.jsx`)**:
   - Removed static import `profileReviews` and connected to `useDemoDomain().reviews`.
   - Filtered reviews by `(r.tutorId === id || r.tutorId === tutor?.id) && (r.moderationStatus || 'approved') === 'approved' && (r.visibility || 'public') === 'public'`.
   - Admin hiding a review (`moderateReview(state, id, 'hidden')`) immediately excludes it from `visibleReviews`.
   - Admin approving a review (`moderateReview(state, id, 'approved')`) immediately renders it.
   - `ratingSummary` dynamically calculates `averageRating` (`sum / visibleReviews.length`) and `reviewCount` from visible reviews, with resilient fallback to `"Chưa có đánh giá"` and zero-state review note `"Chưa có đánh giá nào cho gia sư này."` when no approved reviews exist.
   - Guarded public tutor view to return "Không tìm thấy gia sư" if the requested tutor profile is not approved (`(rawTutor.moderationStatus || 'approved') === 'approved'`).

---

## 3. Caveats

- In test environments running outside a browser where `localStorage` is mocked or absent, `DemoAuthContext.jsx` falls back safely to in-memory accounts (`DEMO_USERS` / `state.accounts`).
- No changes were made outside the 3 exclusively owned files (`DemoAuthContext.jsx`, `TutorWorkspaceState.jsx`, `TutorProfilePage.jsx`), fully respecting ownership boundaries and preventing merge conflicts.

---

## 4. Conclusion

All requirements for Milestone M2 are fully satisfied:
- **FEAT-ADM-009**: Auth Suspension Guard rejects suspended accounts with verbatim Vietnamese message across credentials and OAuth/phone provider pathways, and seamlessly restores login upon unsuspension.
- **FEAT-ADM-007**: Learner search reactively displays only approved tutors.
- **FEAT-ADM-008**: Tutor public profile dynamically displays only approved and public reviews, recalculating rating statistics in real time.
- All 176 unit and integration tests pass 100%.
- Production build succeeds with 0 errors.

---

## 5. Verification Method

1. **Automated Unit & Scenario Tests**:
   Execute inside `apps/web`:
   ```powershell
   npm test
   ```
   *Expected output*: 176 tests passed, 0 failed.

2. **Production Build Integrity**:
   Execute inside `apps/web`:
   ```powershell
   npm run build
   ```
   *Expected output*: Vite build completes with 0 errors.

3. **Code Inspection**:
   - `apps/web/src/features/auth/DemoAuthContext.jsx`: Verify `allAccounts` reads `tnm.demo.domain.v1`, `login` and `loginProvider` check `status === 'suspended'` and return verbatim error message.
   - `apps/web/src/features/tutor/TutorWorkspaceState.jsx`: Verify `useScheduledTutors` filters `state.profiles` by `(p.moderationStatus || 'approved') === 'approved'`.
   - `apps/web/src/features/learner/TutorProfilePage.jsx`: Verify removal of `profileReviews` import, use of `useDemoDomain().reviews`, review filtering, and dynamic rating calculations.
