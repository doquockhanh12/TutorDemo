# Architectural Investigation Report: Domain, Storage, Auth & Cross-Role Synchronization

**Investigation Date**: 2026-10-04 (Simulated project date) / 2026-10-05  
**Investigator**: `teamwork_preview_explorer_survey_1`  
**Target Subsystem**: TutorNearMe Admin Flow, Shared Domain & Persistence  
**Reference Specification**: `.agents/teamwork/ORIGINAL_REQUEST.md`, `AGENTS.md`  

---

## Executive Summary

TutorNearMe is an interactive frontend-only prototype operating entirely in-browser using React 19, Vite, and React Router 7. There is no backend API, database, or server process. The core product state is governed by a single canonical shared domain store persisted under `localStorage` key `'tnm.demo.domain.v1'`, with authentication session state persisted in `'tutornearme.demo-auth.v1'`.

Currently, the Learner and Tutor subsystems are deeply integrated into this shared domain, but the existing Admin screen (`/admin/dashboard` in `src/features/admin/AdminDashboard.jsx`) is completely disconnected: it uses unlinked, component-level mock data imported from `src/data/adminDashboard.js`, retains an obsolete `<RoleSwitcher />`, and lacks the operational management routes (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`).

This investigation maps out the exact domain lifecycle, storage mechanics, entity models, authentication guard integration, test infrastructure, and cross-role synchronization touchpoints required to implement the Admin Flow subsystem without regressing any existing invariants.

---

## 1. Domain & Storage Architecture (`demoDomain.js`, `DemoDomainContext.jsx`, `demoReferenceData.js`)

### 1.1 Source Files & Locations
- **Reference Fixture**: `apps/web/src/data/demoReferenceData.js` (1123 lines, immutable frozen fixture via `Object.freeze`)
- **Domain Logic & Reducer/Mutators**: `apps/web/src/features/domain/demoDomain.js` (140 lines)
- **Domain Context & Provider**: `apps/web/src/features/domain/DemoDomainContext.jsx` (87 lines)
- **Income Selectors**: `apps/web/src/features/domain/incomeSelectors.js` (54 lines)
- **Status Metadata**: `apps/web/src/features/domain/statusMetadata.js` (12 lines)
- **Tutor Schedule Engine**: `apps/web/src/data/tutorSchedule.js` (197 lines)

### 1.2 Storage Key & Lifecycle
- **Canonical Key**: `export const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';` (`src/features/domain/demoDomain.js:4`)
- **Initialization**:
  - `DemoDomainContext.jsx` initializes React state with:
    ```javascript
    const [state, setState] = useState(() => restoreDemoState(localStorage));
    ```
  - `restoreDemoState(storage, now = new Date())`:
    1. Reads `localStorage.getItem('tnm.demo.domain.v1')`.
    2. Validates version: `if (current?.version === 1 && Array.isArray(current.profiles) && Array.isArray(current.requests)) return reconcileLessonSeed(current);`
    3. If invalid or missing, falls back to `createDemoState(now)`.
    4. Handles legacy migration inputs from obsolete keys (`tnm.tutorProfile`, `tnm.tutor.workspace.v3`, `tnm.learnerRequests`, `tnm.savedTutors`), and runs `reconcileLessonSeed(state)`.
- **Persistence Mechanics**:
  - `DemoDomainContext.jsx:28`:
    ```javascript
    useEffect(() => {
      try {
        localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* Demo storage may be unavailable */
      }
    }, [state]);
    ```
  - Any mutation performed via `setState` automatically triggers synchronization to `localStorage`.
- **E2E Resets**:
  - E2E testing helper `apps/web/tests/e2e/demoHelpers.js:6-23` (`resetDemo`) wipes all keys matching `tnm.*` and `tutornearme.demo-auth.v1`, and writes a fresh clone from `createDemoState(fixedTime)` into `DOMAIN_STORAGE_KEY`.

### 1.3 Provider Mounting & Component Tree Hierarchy
In `src/main.jsx:32`:
```jsx
<DemoAuthProvider>
  <App />
</DemoAuthProvider>
```
In `src/App.jsx:25`:
```jsx
export const TutorWorkspaceProvider = DemoDomainProvider; // in TutorWorkspaceState.jsx
...
return (
  <TutorWorkspaceProvider>
    <Routes>
      ...
    </Routes>
  </TutorWorkspaceProvider>
);
```
**Key Discovery**: `DemoDomainProvider` is mounted at the top of the route tree inside `App.jsx`. All routes—Learner, Tutor, and Admin—are descendants of `DemoDomainProvider`.

---

## 2. Existing Entity Models vs. Admin Requirements (R2, R3)

### 2.1 Current State Schema (`createDemoState`)
Currently, `createDemoState()` in `src/features/domain/demoDomain.js:47-57` constructs:
```javascript
{
  version: 1,
  profiles: seed.tutorProfiles,        // Tutor profiles array
  requests: [...],                     // Learner requests
  lessons: [...],                      // Active & historical lessons
  availability: [...],                 // Normalized availability ranges
  settings: { [tutorId]: { sessionMinutes } },
  savedByAccount: { [accountId]: [tutorIds] },
  nextRequestNumber: 1
}
```
**Deficiency**: Notice that `users`/`accounts`, `reviews`, and `issues` are **NOT** currently placed in the state returned by `createDemoState()`!
- `seed.accounts` and `seed.reviews` already exist in `demoReferenceData.js`, but have not been hooked into the domain state.
- `issues` does not exist in `demoReferenceData.js` at all (only mocked in `adminDashboard.js`).

### 2.2 Model Gap Analysis & Additions Required

#### A. Tutors (`state.profiles`)
- **Existing Fields**: `id`, `accountId`, `name`, `initials`, `avatarTone`, `schedule`, `subjects`, `location`, `availability`, `price`, `rating`, `reviews`, `experience`, `university`, `featured`, `verified`, `image`, `intro`, `levels`, `approach`, `areas`, `formats`, `legacyLevels`, `sessionMinutes`, `legacyDuration`.
- **Current Defect**: All 6 profiles (`mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy`) lack explicit moderation fields.
- **Required Fields for Admin (R2, R3, R5, R6)**:
  - `status` / `moderationStatus`: `'pending' | 'approved' | 'rejected' | 'suspended'` (default `'approved'` for existing approved tutors).
  - `submittedAt`: ISO timestamp string (e.g. `'2026-10-04T09:20:00+07:00'`).
  - `documents`: Array of verification documents for the detail drawer review, e.g.:
    ```json
    [
      { "id": "doc-1", "type": "id_card", "title": "Căn cước công dân (mặt trước & sau)", "status": "verified", "issuedDate": "2024-05-12" },
      { "id": "doc-2", "type": "degree", "title": "Bằng tốt nghiệp Đại học Sư phạm TP.HCM", "status": "verified", "issuedDate": "2025-08-20" },
      { "id": "doc-3", "type": "certificate", "title": "Chứng chỉ IELTS 8.0 (IDP)", "status": "verified", "issuedDate": "2025-11-10" }
    ]
    ```
  - `rejectionReason`: string | null (when rejected).
  - `suspendReason`: string | null (when suspended).
  - `suspendedAt`: string | null.
- **Required Fixture Profiles (R3)**:
  - `approved`: `mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`.
  - `pending`: `le-thao-vy` ("Lê Thảo Vy", Tiếng Anh, ĐH Sư phạm TP.HCM, submitted 09:20), `hoang-phuc` ("Nguyễn Hoàng Phúc", Toán · Vật lý, ĐH Bách khoa TP.HCM, submitted 08:45).
  - `rejected`: `minh-chau` ("Trần Minh Châu", Ngữ văn, ĐH KHXH&NV, rejectionReason: "Bằng cấp chuyên môn chưa được công chứng theo yêu cầu").
  - `suspended`: `dang-gia-huy` ("Đặng Gia Huy", Vật lý, ĐH Khoa học Tự nhiên, suspendReason: "Nhận nhiều phản ánh về việc vắng mặt không báo trước và tranh chấp học phí").

#### B. Users & Accounts (`state.users`)
- **Existing in `demoReferenceData.js:13-56`**:
  - `demo-learner`: "Nguyễn Minh Anh", username `minhanh`, email `learner@demo.tutornearme.vn`, phone `0900000001`, role `learner`.
  - `demo-tutor`: "Trần Gia Bảo", username `giabao`, email `tutor@demo.tutornearme.vn`, phone `0900000002`, role `tutor`.
  - `demo-admin`: "Quản trị viên", username `admin`, email `admin@demo.tutornearme.vn`, phone `0900000003`, role `admin`.
- **Required Fields for Admin (R2, R3, R6)**:
  - `status`: `'active' | 'suspended'`.
  - `accountType`: `'learner' | 'parent' | 'tutor' | 'admin'`.
  - `registeredAt`: ISO timestamp (e.g. `'2026-08-15T09:00:00+07:00'`).
  - `address`: string.
  - `suspendReason`: string | null.
  - `suspendedAt`: string | null.
- **Required Fixture Accounts (R3)**:
  - Active learners: `demo-learner` (Nguyễn Minh Anh), `user-learner-lan` (Ngọc Lan, learner), `user-parent-minh` (Hoàng Minh, parent).
  - Active tutors: `demo-tutor` (Trần Gia Bảo), `account-mai-anh` (Nguyễn Mai Anh), `account-duc-minh` (Lê Đức Minh).
  - Suspended accounts:
    - Suspended learner: `user-suspended-learner` ("Phạm Quốc Tuấn", username `quoctuan`, suspendReason: "Hủy lịch hẹn học nhiều lần sát giờ mà không có lý do chính đáng").
    - Suspended tutor: `user-suspended-tutor` ("Đặng Gia Huy", username `giahuy_tutor`, suspendReason: "Tranh chấp học phí với phụ huynh và vắng mặt không báo trước").
  - Admin: `demo-admin` (Quản trị viên).

#### C. Reviews (`state.reviews`)
- **Existing in `demoReferenceData.js:907-1027`**:
  - 3 reviews for `quoc-bao` (`review-1`, `review-2`, `review-3`) with:
    `id`, `tutorId`, `lessonId`, `requestId`, `learnerId`, `reviewerType`, `name`, `initials`, `rating`, `text`, `date`, `createdAt`, `visibility` (`"public"`), `moderationStatus` (`"approved"`), `lessonSnapshot`.
- **Required for Admin (R2, R3, R4, R6)**:
  - Wire `reviews` into canonical state: `state.reviews`.
  - Rich fixture dataset:
    - `approved`: `review-1`, `review-2`, `review-3` (visible on `/tutors/quoc-bao`).
    - `pending` moderation:
      - `rv-pending-1`: Learner "Phụ huynh Minh Khang" for Tutor "Mai Anh", rating 5, text: "Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi.", `moderationStatus: 'pending'`, `visibility: 'hidden'`.
      - `rv-pending-2`: Learner "Ngọc Hà" for Tutor "Đức Minh", rating 4, text: "Gia sư đúng giờ và chuẩn bị bài kỹ.", `moderationStatus: 'pending'`, `visibility: 'hidden'`.
    - `hidden` / rejected:
      - `rv-hidden-1`: Learner "Học viên ẩn danh" for Tutor "Đặng Gia Huy", rating 1, text: "Gia sư đến trễ 45 phút và không bù giờ, thái độ không lịch sự.", `moderationStatus: 'rejected'`, `visibility: 'hidden'`, `moderationNote: "Đang thụ lý tranh chấp cùng Issue IS-101"`.

#### D. Issues / Disputes (`state.issues`)
- **Required New Entity in `demoReferenceData.js` and `state.issues` (R2, R3, R6)**:
  - Fields:
    - `id`: e.g. `'ISS-101'`
    - `code`: e.g. `'KN-2026-001'`
    - `category`: `'absence' | 'lesson_time' | 'cancellation' | 'fee_dispute' | 'attitude'`
    - `categoryLabel`: Vietnamese category display
    - `status`: `'open' | 'in_progress' | 'resolved'`
    - `title`: Short title
    - `description`: Detailed issue description
    - `reportedAt`: ISO timestamp
    - `reportedBy`: `{ id, name, role }`
    - `targetUser`: `{ id, name, role }`
    - `tutorId`: string | null
    - `learnerId`: string | null
    - `lessonId`: string | null
    - `priority`: `'low' | 'medium' | 'high' | 'urgent'`
    - `resolutionNote`: string | null
    - `resolvedAt`: ISO timestamp | null
  - Scenarios covering all 5 categories across all 3 statuses:
    1. `ISS-101` (attitude, `open`): Phản ánh thái độ gia sư và đi muộn (liên quan Đặng Gia Huy).
    2. `ISS-102` (absence, `open`): Gia sư vắng mặt không báo trước (liên quan buổi học Toán ngày 02/10).
    3. `ISS-103` (lesson_time, `in_progress`): Tranh chấp thời lượng buổi học thực tế (học viên báo 60 phút nhưng tính phí 90 phút).
    4. `ISS-104` (fee_dispute, `in_progress`): Yêu cầu hoàn học phí buổi học bị hủy sát giờ.
    5. `ISS-105` (cancellation, `resolved`): Học viên báo hủy lịch gấp do sự cố sức khỏe, gia sư đã đồng ý dời lịch và giải quyết xong.

---

## 3. Auth System & Suspension Enforcement Architecture

### 3.1 Current Auth Implementation (`src/features/auth/DemoAuthContext.jsx`)
- Session storage: `STORAGE_KEY = 'tutornearme.demo-auth.v1'`
- Accounts list: `const DEMO_USERS = demoReferenceData.accounts;`
- In `DemoAuthProvider`:
  ```javascript
  const allAccounts = () => [
    ...DEMO_USERS.filter((seed) => !(state.accounts || []).some((account) => account.id === seed.id)),
    ...(state.accounts || [])
  ];
  ```
- Login function (`LoginPage.jsx:15` invokes `login(identity, password, remember)`):
  ```javascript
  const login = (identity, password, remember = true) => {
    const key = identityKey(identity);
    const user = allAccounts().find((item) => [item.username, item.email, item.phone].some((v) => identityKey(v) === key));
    if (!user || user.password !== password)
      return { error: 'Thông tin đăng nhập chưa chính xác. Tài khoản demo: minhanh / demo1234, giabao / demo1234, admin / demo1234.' };
    persist({ ...state, user }, remember);
    return { user };
  };
  ```

### 3.2 Clean Integration of Account Suspension (R4 Guardrail)
Requirement R4 explicitly commands:
> "Account suspension: Admin suspending any Learner or Tutor account sets account status to suspended. The shared auth boundary must reject login attempts with: `'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'` Unsuspending restores login."

**Architectural Design**:
1. Canonical state `state.users` in `tnm.demo.domain.v1` is the authoritative source for user account status (`status: 'active' | 'suspended'`).
2. `DemoAuthContext.jsx` can consult this canonical status cleanly without creating a separate storage key or violating AGENTS rules:
   - When `login(identity, password)` finds matching credentials, before setting `user` into session, it checks whether `user.id` is suspended in `tnm.demo.domain.v1`:
     ```javascript
     function isAccountSuspended(accountId) {
       try {
         const raw = localStorage.getItem('tnm.demo.domain.v1');
         if (raw) {
           const domain = JSON.parse(raw);
           const u = domain.users?.find((item) => item.id === accountId);
           if (u) return u.status === 'suspended';
         }
       } catch {}
       // Fallback to fixture accounts
       const seed = demoReferenceData.accounts?.find((item) => item.id === accountId);
       return seed?.status === 'suspended';
     }
     ```
   - If `isAccountSuspended(user.id)` returns `true`:
     ```javascript
     return { error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' };
     ```
   - Same guard in `loginProvider(provider, phone)`: if matching account is suspended, return the identical error string!
3. When Admin clicks "Tạm khóa" in `/admin/users` or `/admin/tutors`:
   - Admin action sets `user.status = 'suspended'` in `DemoDomainContext`.
   - Domain immediately saves to `localStorage` key `'tnm.demo.domain.v1'`.
   - Subsequent login attempts with that account at `/login` are blocked with the exact Vietnamese error message.
4. When Admin clicks "Mở khóa" (Unsuspend):
   - Admin action sets `user.status = 'active'`.
   - Subsequent login attempts succeed immediately.

---

## 4. Cross-Role Reactive Synchronization

### 4.1 Tutor Approval Synchronization
- **Learner Search Consumer**: `apps/web/src/features/learner/LearnerSearch.jsx:20` calls `useScheduledTutors()`.
- **Tutor Schedule Provider**: `apps/web/src/features/tutor/TutorWorkspaceState.jsx:23-29`:
  ```javascript
  export function useScheduledTutors() {
    const state = useDemoDomain();
    return state.profiles.map((tutor) => {
      const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
      return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
    });
  }
  ```
- **Finding**: Currently `useScheduledTutors()` does NOT filter by moderation status! All tutors in `state.profiles` are returned regardless of status.
- **Required Fix**:
  In `TutorWorkspaceState.jsx`, filter:
  ```javascript
  return state.profiles
    .filter((tutor) => tutor.moderationStatus === 'approved' || tutor.status === 'approved' || (!tutor.moderationStatus && !tutor.status))
    .map(...)
  ```
  And in `TutorProfilePage.jsx:75`, verify that tutor is approved (or if viewing own draft / admin preview).
- **Result**: When Admin approves a pending tutor in `/admin/tutors`, domain state updates `moderationStatus = 'approved'`. `LearnerSearch` re-renders and the new tutor immediately appears in search results and location filters.

### 4.2 Review Moderation Synchronization
- **Tutor Profile Consumer**: `apps/web/src/features/learner/TutorProfilePage.jsx:28 & 573` currently uses:
  ```javascript
  import { profileReviews } from '../../data/tutorProfiles.js';
  ...
  {profileReviews.map((review) => ( ... ))}
  ```
  Where `profileReviews = demoReferenceData.reviews;` (`src/data/tutorProfiles.js:11`).
- **Finding**: `TutorProfilePage` currently reads **static, hardcoded fixture data** directly rather than subscribing to `DemoDomainContext`. It does NOT filter by `tutorId === id`, nor does it filter hidden/rejected reviews!
- **Required Fix**:
  Connect `TutorProfilePage` to domain state:
  ```javascript
  const { reviews } = useDemoDomain();
  const visibleReviews = useMemo(() => {
    return (reviews || []).filter(
      (r) => r.tutorId === id && r.visibility === 'public' && r.moderationStatus === 'approved'
    );
  }, [reviews, id]);
  ```
- **Result**: When Admin clicks "Ẩn" (Hide) in `/admin/reviews`:
  - `review.visibility` becomes `'hidden'` and `review.moderationStatus` becomes `'rejected'`.
  - `TutorProfilePage` immediately re-renders and the hidden review disappears from `/tutors/:id`.
  - When Admin clicks "Duyệt" (Approve), it immediately reappears.

---

## 5. Existing Test Suite & Test Runner Invariants

### 5.1 Test Framework & Runner
- **Command**: `npm run test` (in `apps/web`) executes `node --test`.
- **Framework**: Native Node.js test runner (`node:test`, `node:assert/strict`). No Vitest or Jest.
- **Suite Status**: **55 tests pass**, 0 fail, duration ~920ms.
- **E2E Runner**: `@playwright/test` executes `npm run test:e2e`.

### 5.2 Critical Existing Test Invariants (MUST NOT BE BROKEN)
1. **`BUG-010` in `tests/demoDomain.test.js:172`**:
   ```javascript
   assert.equal(state.requests.length, 9);
   ```
   *CRITICAL INVARIANT*: `createDemoState` creates exactly **9** requests (`requests` array). We must **NOT** add or remove items from `seed.requests` in `demoReferenceData.js` because `state.requests.length` is strictly asserted to be 9!
2. **`BUG-013` in `tests/demoDomain.test.js:87-95`**:
   ```javascript
   assert.equal(tutors, demoReferenceData.tutorProfiles);
   assert.deepEqual(new Set(subjectOptions.slice(1)), new Set(tutors.flatMap((t) => t.subjects)));
   assert.deepEqual(new Set(locationOptions.slice(1)), new Set(tutors.map((t) => t.location)));
   ```
   *CRITICAL INVARIANT*: `tutors` exported by `src/data/tutors.js` is identical to `demoReferenceData.tutorProfiles`.
3. **`SCHED-003` & `INCOME` in `tests/demoDomain.test.js:45 & 120`**:
   ```javascript
   for (const key of ['requests', 'profiles', 'settings', 'savedByAccount', 'nextRequestNumber'])
     assert.deepEqual(restored[key], result[key]);
   ```
   *CRITICAL INVARIANT*: `restoreDemoState` must preserve all these keys identically.
4. **Build Invariant**:
   `npm run build` must build cleanly with Vite without any module or syntax errors.

---

## 6. Recommended Admin Adapters & Hook Design (R2)

To satisfy R2 ("Build clean Admin-facing adapters/hooks on top of the canonical shared domain. The UI layer must only consume these hooks so that future backend/REST API integration requires zero changes to Admin UI components"):

We recommend creating `src/features/admin/useAdminData.js` (or exposing from domain) providing:

```typescript
// 1. Overview metrics & live feeds for /admin/dashboard
export function useAdminOverview(): {
  stats: {
    pendingApprovalsCount: number,
    liveClassesCount: number,
    pendingReviewsCount: number,
    openIssuesCount: number,
  },
  pendingApprovals: TutorProfile[],
  liveClasses: Lesson[],
  pendingReviews: Review[],
  unresolvedIssues: Issue[],
  decideTutorApproval: (id: string, status: 'approved' | 'rejected', reason?: string) => void,
  decideReviewModeration: (id: string, status: 'approved' | 'rejected') => void,
};

// 2. Tutor operational management for /admin/tutors
export function useAdminTutors(): {
  tutors: TutorProfile[],
  counts: { all: number, pending: number, approved: number, rejected: number, suspended: number },
  approveTutor: (id: string) => void,
  rejectTutor: (id: string, reason: string) => void,
  suspendTutor: (id: string, reason: string) => void,
  unsuspendTutor: (id: string) => void,
};

// 3. User operational management for /admin/users
export function useAdminUsers(): {
  users: UserAccount[],
  counts: { all: number, learners: number, tutors: number, active: number, suspended: number },
  getUserActivity: (userId: string) => { requestsCount: number, lessonsCount: number, completedCount: number, reviewsCount: number },
  suspendUser: (id: string, reason: string) => void,
  unsuspendUser: (id: string) => void,
};

// 4. Review moderation for /admin/reviews
export function useAdminReviews(): {
  reviews: Review[],
  counts: { all: number, pending: number, approved: number, hidden: number },
  approveReview: (id: string) => void,
  hideReview: (id: string, reason?: string) => void,
};

// 5. Issues & complaints for /admin/issues
export function useAdminIssues(): {
  issues: Issue[],
  counts: { all: number, open: number, in_progress: number, resolved: number },
  updateIssueStatus: (id: string, status: 'open' | 'in_progress' | 'resolved') => void,
  resolveIssue: (id: string, resolutionNote: string) => void,
};
```

---

## 7. Admin Shell & Navigation Specifications (R1, R5)

1. **`AdminHeader`**:
   - MUST remove `<RoleSwitcher />` entirely.
   - Retain Avatar `AD`, label `Quản trị viên`.
   - Add red logout button with Lucide `LogOut` icon (`variant="quiet"` or red icon button).
   - On click, invokes `logout()` from `useDemoAuth()` and calls `navigate('/login', { replace: true })`.
2. **`AdminSidebar`**:
   - Highlights active route via `NavLink`.
   - Badges display live reactive numbers from domain:
     - "Gia sư" badge: `stats.pendingApprovalsCount`
     - "Đánh giá" badge: `stats.pendingReviewsCount`
     - "Báo cáo & sự cố" badge: `stats.openIssuesCount`
   - Links to `/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`.
3. **Table & Slide-over Drawer UX (R5)**:
   - Sticky header table with internal scroll: `.admin-table-scroll` container.
   - Record counter: `"Hiển thị X / Y bản ghi"`.
   - Tab filter bar with active indicator.
   - Slide-over drawer: slides in from right over a semi-transparent scrim (`position: fixed; right: 0; top: 0; height: 100vh; width: min(480px, 100vw)`). Preserves table scroll position and active search/filter inputs while inspecting and acting.
   - Clean keyboard accessibility (ESC to close, autofocus, proper ARIA `role="dialog"`).

---

## 8. Summary Table of Files to Extend / Create

| File Path | Type | Action / Purpose |
|---|---|---|
| `src/data/demoReferenceData.js` | Core Fixture | Extend with canonical `issues`, pending/rejected/suspended `tutorProfiles`, suspended `accounts`, and reviews. Keep `requests` count at exactly 9. |
| `src/features/domain/demoDomain.js` | Domain Logic | Add `users`, `reviews`, `issues` to `createDemoState` and `restoreDemoState`. Add pure reducer functions for Admin actions. |
| `src/features/domain/DemoDomainContext.jsx` | React Context | Wire new domain state and expose Admin mutators. |
| `src/features/admin/useAdminData.js` | Admin Adapters | Implement `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`. |
| `src/features/auth/DemoAuthContext.jsx` | Auth Guard | Add suspension check in `login` and `loginProvider` returning exact required Vietnamese error. |
| `src/features/learner/TutorProfilePage.jsx` | Learner Screen | Switch reviews to domain `useDemoDomain()` filtered by public + approved. |
| `src/features/tutor/TutorWorkspaceState.jsx` | Shared Schedule | Filter `useScheduledTutors()` to approved tutors only. |
| `src/features/admin/AdminShell.jsx` | Admin UI | Persistent layout with updated `AdminHeader` (no RoleSwitcher, red LogOut) & `AdminSidebar` with reactive badges. |
| `src/features/admin/AdminDashboard.jsx` | Admin UI | Replaced with reactive hooks (`useAdminOverview`). |
| `src/features/admin/AdminTutors.jsx` | Admin UI | Table + Drawer for tutor moderation. |
| `src/features/admin/AdminUsers.jsx` | Admin UI | Table + Drawer for user management. |
| `src/features/admin/AdminReviews.jsx` | Admin UI | Table + Drawer for review moderation. |
| `src/features/admin/AdminIssues.jsx` | Admin UI | Table + Drawer for issue dispute resolution. |
| `src/features/admin/AdminDrawer.jsx` | Admin UI | Reusable slide-over drawer shell component. |
| `src/App.jsx` | Routing | Register `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` protected routes. |
| `tests/demoDomain.test.js` or `tests/adminDomain.test.js` | Tests | Unit tests for Admin mutations, domain persistence, and auth suspension guard. |

---

## Conclusion
The architecture is well-structured and ready for Admin Flow implementation. The critical integration points (canonical domain storage in `tnm.demo.domain.v1`, auth suspension check in `DemoAuthContext`, reactive subscriptions in `DemoDomainContext`, and query filtering in Learner/Tutor consumers) have been precisely pinpointed and verified against the existing 55 passing unit tests.
