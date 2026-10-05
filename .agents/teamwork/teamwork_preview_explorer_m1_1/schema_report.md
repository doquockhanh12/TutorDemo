# M1 Canonical Domain & Seed Data Schema Blueprint

## 1. Overview & Objective

This document defines the canonical domain schema and deterministic fixture extensions for **Milestone M1 (Canonical Domain & Seed Data)** of the TutorNearMe Admin Flow Subsystem.
It details the exact data structures to add to `apps/web/src/data/demoReferenceData.js`, the state lifecycle enhancements for `apps/web/src/features/domain/demoDomain.js`, the context provider wiring in `DemoDomainContext.jsx`, and the adapter hook contracts in `useAdminDomain.js`.

---

## 2. Invariants & Guardrails

1. **Strict 9-Request Invariant (BUG-010)**:
   - The `requests` array in `demoReferenceData.js` must contain **strictly 9 items** (`demo-01`, `demo-02`, `demo-03`, `req-1`, `req-2`, `req-3`, `ref-1`, `ref-2`, `ref-3`).
   - Adding or removing items from `requests` breaks unit tests (`assert.equal(state.requests.length, 9)` in `tests/demoDomain.test.js`).
2. **Account Order & Index Invariant**:
   - `demoReferenceData.accounts[0]` = `demo-learner` (`minhanh`)
   - `demoReferenceData.accounts[1]` = `demo-tutor` (`giabao`)
   - `demoReferenceData.accounts[2]` = `demo-admin` (`admin`)
   - Existing tests and E2E specs rely directly on index 0 and index 1. All new accounts must be appended at index 3+.
3. **Canonical Income Invariant**:
   - Canonical tutor `quoc-bao` income calculations across May–October 2026 rely on exact completed lessons and fees. No lessons belonging to `quoc-bao` during this period may be added, removed, or altered.
4. **Single Canonical Storage Key**:
   - State persists exclusively under `localStorage` key `tnm.demo.domain.v1`. No secondary storage keys for Admin.

---

## 3. Entity Schema Specifications

### 3.1. `tutorProfiles` (Tutors)

#### Canonical Status Values
- `moderationStatus`: `'approved' | 'pending' | 'rejected' | 'suspended'`
  - Existing 6 profiles (`mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh`, `thu-trang`, `gia-huy`) receive `moderationStatus: 'approved'`.

#### Schema Definition
```typescript
interface TutorDocument {
  id: string;
  type: 'id_card' | 'student_card' | 'degree' | 'certificate';
  title: string;
  issuedBy: string;
  number?: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  status: 'verified' | 'pending' | 'rejected';
}

interface TutorProfile {
  id: string; // canonical unique slug
  accountId?: string; // links to accounts / users
  name: string;
  initials: string;
  avatarTone: string;
  moderationStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  university: string;
  subjects: string[];
  price: number; // VNĐ / buổi
  sessionMinutes: 45 | 90;
  location: string;
  areas: string[];
  levels: string[];
  formats: string[];
  schedule: Array<{ days: number[]; start: string; end: string }>;
  availability: string[];
  experience: string;
  rating: number | null;
  reviews: number;
  featured: boolean;
  verified: boolean;
  image: string;
  intro: string;
  approach: string;
  submittedAt?: string; // ISO string
  submitted?: string; // display string
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  documents: TutorDocument[];
}
```

#### Deterministic Profiles to Add
1. **Pending Profiles**:
   - `thao-vy` ("Lê Thảo Vy", initials: "TV", avatarTone: "violet")
     - `moderationStatus`: `'pending'`
     - `university`: `'ĐH Sư phạm TP.HCM'`
     - `subjects`: `['Tiếng Anh', 'IELTS']`
     - `price`: `180000`
     - `submittedAt`: `'2026-10-04T09:20:00+07:00'`
     - `submitted`: `'Hôm nay, 09:20'`
     - `intro`: `'Sinh viên năm cuối ĐH Sư phạm TP.HCM, chứng chỉ IELTS 8.0, 2 năm kinh nghiệm luyện đề và giao tiếp.'`
     - `documents`: ID card (verified), Student card (pending), IELTS certificate (verified).
   - `hoang-phuc` ("Nguyễn Hoàng Phúc", initials: "HP", avatarTone: "blue")
     - `moderationStatus`: `'pending'`
     - `university`: `'ĐH Bách khoa TP.HCM'`
     - `subjects`: `['Toán', 'Vật lý']`
     - `price`: `200000`
     - `submittedAt`: `'2026-10-04T08:45:00+07:00'`
     - `submitted`: `'Hôm nay, 08:45'`
     - `intro`: `'Sinh viên Kỹ thuật ĐH Bách khoa, đạt giải Nhì học sinh giỏi môn Vật lý, chuyên kèm bồi dưỡng lớp 9 lên 10.'`
     - `documents`: ID card (verified), Student card (pending).
   - `minh-chau` ("Trần Minh Châu", initials: "MC", avatarTone: "yellow")
     - `moderationStatus`: `'pending'`
     - `university`: `'ĐH KHXH&NV'`
     - `subjects`: `['Ngữ văn']`
     - `price`: `170000`
     - `submittedAt`: `'2026-10-03T16:30:00+07:00'`
     - `submitted`: `'Hôm qua, 16:30'`
     - `intro`: `'Cử nhân Sư phạm Văn, phương pháp sơ đồ tư duy giúp học sinh nắm vững luận điểm nghị luận xã hội và văn học.'`
     - `documents`: ID card (verified), Degree (pending).
2. **Rejected Profile**:
   - `thanh-tung` ("Vũ Thanh Tùng", initials: "TT", avatarTone: "coral")
     - `moderationStatus`: `'rejected'`
     - `rejectionReason`: `'Bằng cấp chuyên ngành và hồ sơ căn cước chưa đầy đủ thông tin đối chiếu.'`
     - `rejectedAt`: `'2026-10-02T14:10:00+07:00'`
     - `university`: `'ĐH Công nghệ Sài Gòn'`
     - `subjects`: `['Toán', 'Tin học']`
     - `price`: `150000`
     - `documents`: ID card (rejected).
3. **Suspended Profile**:
   - `quang-huy` ("Hoàng Quang Huy", initials: "QH", avatarTone: "slate")
     - `accountId`: `'user-tutor-suspended'`
     - `moderationStatus`: `'suspended'`
     - `suspendedReason`: `'Khiếu nại nghiêm trọng: hủy buổi học đột xuất không hoàn phí và thái độ không phù hợp.'`
     - `suspendedAt`: `'2026-10-03T11:00:00+07:00'`
     - `university`: `'ĐH Kinh tế TP.HCM'`
     - `subjects`: `['Toán', 'Tiếng Anh']`
     - `price`: `160000`
     - `documents`: ID card (verified), Student card (verified).

---

### 3.2. `accounts` / `users` (Users)

#### Schema Definition
```typescript
interface UserAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: 'learner' | 'tutor' | 'admin';
  status: 'active' | 'suspended';
  password: string; // 'demo1234'
  linkedProviders: string[];
  verified: {
    email: boolean;
    phone: boolean;
  };
  address?: string;
  accountType?: 'learner' | 'parent';
  duration?: string; // for tutors: '45' | '90'
  tutorProfileId?: string; // for tutors
  createdAt: string;
  lastLoginAt: string;
  suspendedReason?: string | null;
  suspendedAt?: string | null;
}
```

#### Deterministic Accounts to Add (Appended after index 2)
- Index 0: `demo-learner` (`minhanh`, role: `'learner'`, status: `'active'`)
- Index 1: `demo-tutor` (`giabao`, role: `'tutor'`, status: `'active'`)
- Index 2: `demo-admin` (`admin`, role: `'admin'`, status: `'active'`)
- Index 3: `user-learner-active-2`
  - id: `'user-learner-active-2'`, fullName: `'Lê Hoàng Nam'`, username: `'hoangnam'`, email: `'nam.le@demo.tutornearme.vn'`, phone: `'0900000010'`, role: `'learner'`, accountType: `'parent'`, status: `'active'`, address: `'Quận 3, TP.HCM'`.
- Index 4: `user-tutor-active-2`
  - id: `'user-tutor-active-2'`, fullName: `'Nguyễn Mai Anh'`, username: `'maianh'`, email: `'maianh.tutor@demo.tutornearme.vn'`, phone: `'0900000011'`, role: `'tutor'`, status: `'active'`, tutorProfileId: `'mai-anh'`, address: `'Bình Thạnh, TP.HCM'`.
- Index 5: `user-learner-suspended`
  - id: `'user-learner-suspended'`, fullName: `'Phạm Quốc Huy'`, username: `'quochuy'`, email: `'quochuy.learner@demo.tutornearme.vn'`, phone: `'0900000012'`, role: `'learner'`, status: `'suspended'`, suspendedReason: `'Vi phạm chính sách: liên tục đặt lịch và vắng mặt không báo trước nhiều lần.'`, suspendedAt: `'2026-10-02T16:00:00+07:00'`.
- Index 6: `user-tutor-suspended`
  - id: `'user-tutor-suspended'`, fullName: `'Hoàng Quang Huy'`, username: `'quanghuy'`, email: `'quanghuy.tutor@demo.tutornearme.vn'`, phone: `'0900000013'`, role: `'tutor'`, status: `'suspended'`, tutorProfileId: `'quang-huy'`, suspendedReason: `'Khiếu nại nghiêm trọng: thái độ không chuẩn mực và tự ý hủy lớp có thu phí.'`, suspendedAt: `'2026-10-03T11:00:00+07:00'`.

---

### 3.3. `reviews` (Reviews)

#### Schema Definition
```typescript
interface ReviewLessonSnapshot {
  subject: string;
  level: string;
  learnerName: string;
  date: string; // YYYY-MM-DD
  start: number; // minutes from 00:00
  end: number;
  durationMinutes: number;
  format: string; // 'Online' | 'Tại nhà'
  area: string;
  sessionFee: number;
}

interface Review {
  id: string;
  tutorId: string;
  tutorName?: string;
  lessonId: string | null;
  requestId: string | null;
  learnerId: string | null;
  reviewerType: 'learner' | 'parent';
  name: string;
  initials: string;
  rating: number; // 1 to 5
  text: string;
  excerpt: string; // alias for drawer/table view
  date: string; // display date DD/MM/YYYY
  createdAt: string; // ISO
  visibility: 'public' | 'hidden';
  moderationStatus: 'approved' | 'pending' | 'hidden';
  hiddenReason?: string | null;
  hiddenAt?: string | null;
  moderatedAt?: string | null;
  lessonSnapshot: ReviewLessonSnapshot;
}
```

#### Deterministic Reviews to Add
- Retain existing `review-1`, `review-2`, `review-3` (`moderationStatus: 'approved'`, `visibility: 'public'`).
- Add `review-4` (`moderationStatus: 'pending'`, `visibility: 'hidden'`):
  - tutorId: `'mai-anh'`, tutorName: `'Nguyễn Mai Anh'`, learnerName: `'Minh Khang'`, reviewerType: `'parent'`, rating: 5, text: `'Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi học Toán.'`, date: `'02/10/2026'`.
- Add `review-5` (`moderationStatus: 'pending'`, `visibility: 'hidden'`):
  - tutorId: `'duc-minh'`, tutorName: `'Lê Đức Minh'`, learnerName: `'Ngọc Hà'`, reviewerType: `'learner'`, rating: 4, text: `'Gia sư đúng giờ và chuẩn bị bài kỹ, tuy nhiên phần bài tập hơi dài.'`, date: `'03/10/2026'`.
- Add `review-6` (`moderationStatus: 'hidden'`, `visibility: 'hidden'`):
  - tutorId: `'quoc-bao'`, tutorName: `'Trần Gia Bảo'`, learnerName: `'Nguyễn Minh Anh'`, reviewerType: `'learner'`, rating: 1, text: `'Đánh giá chứa nội dung quảng cáo dịch vụ bên ngoài và từ ngữ vi phạm quy định cộng đồng.'`, hiddenReason: `'Nội dung vi phạm quy tắc cộng đồng: phát tán liên kết thương mại bên ngoài.'`, hiddenAt: `'2026-09-21T10:30:00+07:00'`.

---

### 3.4. `issues` (Issues & Reports)

#### Schema Definition
```typescript
interface IssueUserReference {
  id: string;
  name: string;
  role: 'learner' | 'tutor' | 'parent';
  phone?: string;
}

interface Issue {
  id: string; // e.g. 'ISSUE-101'
  code: string; // display e.g. 'IS-2048'
  title: string;
  category: 'absence' | 'lesson_time_dispute' | 'cancellation' | 'fee_dispute' | 'attitude_complaint';
  categoryLabel: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'resolved';
  statusLabel: string;
  reportedBy: IssueUserReference;
  targetUser: IssueUserReference;
  tutorId?: string | null;
  tutorName?: string;
  learnerId?: string | null;
  learnerName?: string;
  lessonId?: string | null;
  requestId?: string | null;
  description: string;
  received: string; // relative display string
  createdAt: string; // ISO
  updatedAt: string; // ISO
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}
```

#### Deterministic Issues Dataset
1. `ISSUE-101` (`code: 'IS-2048'`): Category `absence`, Status `new`, Priority `high`.
   - ReportedBy: `Nguyễn Minh Anh` (`demo-learner`), Target: `Hoàng Quang Huy` (`quang-huy`).
   - Description: `'Học viên đã vào phòng học online đúng giờ hẹn 19:00 ngày 03/10 nhưng gia sư không xuất hiện và không liên lạc được qua điện thoại.'`
2. `ISSUE-102` (`code: 'IS-2045'`): Category `lesson_time_dispute`, Status `in_progress`, Priority `medium`.
   - ReportedBy: `Lê Hoàng Nam` (`user-learner-active-2`), Target: `Trần Gia Bảo` (`quoc-bao`).
   - Description: `'Phụ huynh phản ánh buổi học đăng ký 90 phút nhưng gia sư kết thúc sớm sau 45 phút mà vẫn tính nguyên mức học phí.'`
   - ResolutionNote: `'Đang liên hệ gia sư để đối soát thời lượng và xem xét hoàn lại 50% học phí buổi học.'`
3. `ISSUE-103` (`code: 'IS-2041'`): Category `cancellation`, Status `in_progress`, Priority `high`.
   - ReportedBy: `Nguyễn Minh Anh` (`demo-learner`), Target: `Hoàng Quang Huy` (`quang-huy`).
   - Description: `'Gia sư nhắn tin hủy buổi học chỉ 15 phút trước giờ bắt đầu, gây gián đoạn kế hoạch ôn tập chuẩn bị thi giữa kỳ của học sinh.'`
   - ResolutionNote: `'Đã tạm đình chỉ quyền nhận lớp của gia sư để chờ giải trình.'`
4. `ISSUE-104` (`code: 'IS-2039'`): Category `fee_dispute`, Status `new`, Priority `medium`.
   - ReportedBy: `Phụ huynh bé Nam`, Target: `Trần Gia Bảo` (`quoc-bao`), Request: `req-3`.
   - Description: `'Gia sư yêu cầu phụ huynh đóng thêm 200.000đ tiền in ấn giáo trình và đề cương ôn tập, trong khi hợp đồng ban đầu ghi học phí trọn gói.'`
5. `ISSUE-105` (`code: 'RP-1172'`): Category `attitude_complaint`, Status `resolved`, Priority `low`.
   - ReportedBy: `Nguyễn Minh Anh` (`demo-learner`), Target: `Trần Gia Bảo` (`quoc-bao`), Lesson: `history-lesson-2026-09-27-01`.
   - Description: `'Học viên cảm thấy gia sư có biểu hiện cáu gắt và không giải thích kỹ khi học viên chưa hiểu bài trong buổi học IELTS ngày 27/09.'`
   - ResolutionNote: `'Quản trị viên đã trao đổi trực tiếp với gia sư. Gia sư đã gửi lời xin lỗi học viên và cam kết điều chỉnh phương pháp sư phạm.'`
   - ResolvedAt: `'2026-09-29T15:30:00+07:00'`, ResolvedBy: `'Quản trị viên'`.

---

## 4. Domain State Lifecycle (`demoDomain.js`)

### 4.1. `createDemoState(now = new Date())`
```javascript
export function createDemoState(now = new Date()) {
  const seed = structuredClone(fixture);
  const dates = weekDates(0, now);
  const lessons = [
    ...seed.lessonTemplates.map(({ day, ...lesson }) => ({ ...lesson, date: localDateKey(dates[day]) })),
    ...(seed.historicalLessons || [])
  ];
  const requests = seed.requests.map(({ proposalTemplate, ...request }) =>
    normalizeRequest({
      ...request,
      ...(proposalTemplate ? { proposals: proposalTemplate.days.map((day) => ({ date: localDateKey(dates[day]), start: proposalTemplate.start, end: proposalTemplate.end })) } : {})
    })
  );

  return applyApprovedDemoCleanup({
    version: 1,
    profiles: seed.tutorProfiles,
    requests,
    lessons,
    availability: subtractLessons(weeklyScheduleRanges(seed.tutorProfiles.find((t) => t.id === CANONICAL_TUTOR_ID), dates), lessons),
    settings: Object.fromEntries(seed.tutorProfiles.filter((p) => p.accountId).map((p) => [p.id, { sessionMinutes: p.sessionMinutes }])),
    savedByAccount: Object.fromEntries(seed.learnerProfiles.map((p) => [p.accountId, p.savedTutorIds])),
    nextRequestNumber: 1,
    // NEW ADMIN DOMAIN COLLECTIONS:
    users: seed.accounts || [],
    reviews: seed.reviews || [],
    issues: seed.issues || [],
  });
}
```

### 4.2. `restoreDemoState(storage, now = new Date())`
To maintain full backwards compatibility with persisted state in existing `localStorage`, `reconcileLessonSeed(state)` is enhanced to reconcile missing seed items for `profiles`, `users`, `reviews`, and `issues`:
```javascript
function reconcileDomainSeed(state) {
  // Reconcile lessons as existing
  const reconciled = reconcileLessonSeed(state);

  // Reconcile users
  const userMap = new Map((reconciled.users || []).map((u) => [u.id, u]));
  for (const account of fixture.accounts || []) {
    if (!userMap.has(account.id)) userMap.set(account.id, structuredClone(account));
    else {
      const u = userMap.get(account.id);
      if (!u.status) u.status = account.status || 'active';
    }
  }

  // Reconcile reviews
  const reviewMap = new Map((reconciled.reviews || []).map((r) => [r.id, r]));
  for (const review of fixture.reviews || []) {
    if (!reviewMap.has(review.id)) reviewMap.set(review.id, structuredClone(review));
  }

  // Reconcile issues
  const issueMap = new Map((reconciled.issues || []).map((i) => [i.id, i]));
  for (const issue of fixture.issues || []) {
    if (!issueMap.has(issue.id)) issueMap.set(issue.id, structuredClone(issue));
  }

  // Reconcile profiles
  const profileMap = new Map((reconciled.profiles || []).map((p) => [p.id, p]));
  for (const profile of fixture.tutorProfiles || []) {
    if (!profileMap.has(profile.id)) profileMap.set(profile.id, structuredClone(profile));
    else {
      const p = profileMap.get(profile.id);
      if (!p.moderationStatus) p.moderationStatus = profile.moderationStatus || 'approved';
      if (!p.documents && profile.documents) p.documents = structuredClone(profile.documents);
    }
  }

  return {
    ...reconciled,
    profiles: [...profileMap.values()],
    users: [...userMap.values()],
    reviews: [...reviewMap.values()],
    issues: [...issueMap.values()],
  };
}
```

---

## 5. Domain Action Reducers (`demoDomain.js`)

1. **`approveTutor(state, tutorId)`**:
   - Updates `profile.moderationStatus = 'approved'`, `verified = true`, `approvedAt = new Date().toISOString()`.
2. **`rejectTutor(state, tutorId, reason)`**:
   - Updates `profile.moderationStatus = 'rejected'`, `rejectionReason = reason`, `rejectedAt = new Date().toISOString()`.
3. **`setTutorSuspension(state, tutorId, isSuspended, reason)`**:
   - Updates `profile.moderationStatus = isSuspended ? 'suspended' : 'approved'`.
   - Synchronizes `accountId` in `state.users`: sets `user.status = isSuspended ? 'suspended' : 'active'`.
4. **`setUserSuspension(state, userId, isSuspended, reason)`**:
   - Updates `user.status = isSuspended ? 'suspended' : 'active'`.
   - If user is a tutor, synchronizes matching `tutorProfile` in `state.profiles`.
5. **`moderateReview(state, reviewId, decision)`**:
   - `decision` must be `'approved' | 'hidden'`.
   - Sets `review.moderationStatus = decision`, `review.visibility = decision === 'approved' ? 'public' : 'hidden'`.
6. **`updateIssueStatus(state, issueId, status, resolutionNote)`**:
   - `status` must be `'new' | 'in_progress' | 'resolved'`.
   - Updates status, note, and if resolved sets `resolvedAt` and `resolvedBy: 'Quản trị viên'`.

---

## 6. Adapter Hooks (`apps/web/src/features/domain/useAdminDomain.js`)

- `useAdminOverview()`: Returns reactive aggregated counters (`stats`) and top items for dashboard.
- `useAdminTutors()`: Returns `tutors`, `approveTutor`, `rejectTutor`, `toggleSuspendTutor`.
- `useAdminUsers()`: Returns `users`, `toggleSuspendUser`.
- `useAdminReviews()`: Returns `reviews`, `approveReview`, `hideReview`.
- `useAdminIssues()`: Returns `issues`, `updateIssueStatus`.

All UI components interact solely through these hooks.
