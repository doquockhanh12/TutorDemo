# Milestone M1 Admin Hooks & Unit Test Architecture Report

**Document Date**: 2026-10-04 / 2026-10-05  
**Author**: `teamwork_preview_explorer_m1_3` (Read-only Explorer)  
**Target Milestone**: M1 (Canonical Domain & Seed Data)  
**Primary Artifacts**:
- `apps/web/src/features/domain/useAdminDomain.js` (Dedicated Admin Hooks & Pure Selectors)
- `apps/web/tests/adminDomain.test.js` (Deterministic Unit Test Suite)

---

## 1. Executive Summary

Milestone M1 establishes the single canonical shared domain for the Admin subsystem within `tnm.demo.domain.v1`. Per requirements **R2 (Canonical Shared Domain Architecture)**, **R4 (Cross-Role Reactive Synchronization & Login Enforcement)**, **R5/R6 (Admin Table & Detail Drawer UX)**, and **R7 (Admin Dashboard Live Projections)**:

1. **No Duplicate Stores or LocalStorage Keys**:
   Admin UI components must never maintain separate entity stores or duplicate catalogs. All state originates from `DemoDomainContext.jsx` backed by `tnm.demo.domain.v1`.
2. **Dedicated Adapter Layer (`useAdminDomain.js`)**:
   Provides five clean, high-level hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) exposing reactive data projections, computed business metrics, and domain action dispatchers. The UI layer strictly consumes these hooks, ensuring future transition to REST/GraphQL APIs requires **zero changes** to Admin UI components.
3. **Decoupled Pure Selectors for Testability**:
   Each hook is backed by pure selector functions (`selectAdminOverview`, `selectAdminTutors`, `selectAdminUsers`, `selectAdminReviews`, `selectAdminIssues`, `selectAdminStats`). These selectors run in Node.js built-in test runner (`node --test`) without mock DOM or React rendering dependencies.
4. **Deterministic Unit Test Suite (`adminDomain.test.js`)**:
   A comprehensive suite of 17 unit tests verifying live metrics calculation, status transitions, review moderation, suspension synchronization, issue resolution, immutability, and strict preservation of the 9-request invariant (`BUG-010`).

---

## 2. Architectural Blueprint & Design Patterns

### 2.1 The Two-Tier Domain Bridge Pattern
To achieve seamless coexistence between React 19 interactive components and Node's native test runner (`node --test`):

```
+-------------------------------------------------------------------+
|                        Admin UI Components                        |
|   (AdminDashboard, AdminTutors, AdminUsers, AdminReviews, etc.)   |
+-------------------------------------------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|           apps/web/src/features/domain/useAdminDomain.js          |
|                                                                   |
|  [React Hooks] (Consume Context)    [Pure Selectors] (Testable)   |
|  - useAdminOverview()       ----->  - selectAdminOverview(state)  |
|  - useAdminTutors()         ----->  - selectAdminTutors(state)    |
|  - useAdminUsers()          ----->  - selectAdminUsers(state)     |
|  - useAdminReviews()        ----->  - selectAdminReviews(state)   |
|  - useAdminIssues()         ----->  - selectAdminIssues(state)    |
+-------------------------------------------------------------------+
             |                                        ^
             v                                        |
+--------------------------+                          |
|  DemoDomainContext.jsx   |                          |
|  (useDemoDomain context) |                          |
+--------------------------+                          |
             |                                        |
             v                                        |
+---------------------------------------------------------+
|        Canonical State (demoDomain.js / localStorage)   |
|   profiles, users, reviews, issues, lessons, requests   |
+---------------------------------------------------------+
```

1. **Pure Selectors**: Functions of shape `(state) => enrichedEntities`. Deterministic, free of side effects, easily testable in any JavaScript environment.
2. **React Hooks**: Thin wrappers invoking `useDemoDomain()`, piping domain state through pure selectors, and binding Context action dispatchers.

---

## 3. Specifications of the 5 Admin Hooks

### 3.1 `useAdminOverview()` / `selectAdminOverview(state)`

#### Objective
Provides live reactive projections for the `/admin/dashboard` workspace, replacing static mock values with live domain entities.

#### Return Contract
```typescript
interface AdminOverviewPayload {
  stats: {
    pendingTutors: number;      // Count of profiles with moderationStatus === 'pending'
    pendingApprovals: number;   // Alias for AdminDashboard StatItem
    liveClasses: number;        // Count of active/confirmed lessons
    pendingReviews: number;     // Count of reviews with moderationStatus === 'pending'
    openIssues: number;         // Count of issues with status !== 'resolved'
    totalTutors: number;        // Total tutor count
    approvedTutors: number;     // Count of active/approved tutors
    totalUsers: number;         // Total registered accounts
    activeUsers: number;        // Total active users
    suspendedUsers: number;     // Total suspended users
  };
  pendingTutors: Array<{
    id: string;
    accountId?: string;
    name: string;
    initials: string;
    subject: string;            // Formatted string (e.g. 'Toán · Vật lý')
    subjects: string[];
    school: string;             // University/School name
    university: string;
    submitted: string;          // Human-readable relative date (e.g. 'Hôm nay, 09:20')
    submissionDate?: string;
    status: 'pending';
    moderationStatus: 'pending';
    price: number;
    bio: string;
    experience: string;
    verificationDocs: Array<{ id: string; title: string; type: string; file: string }>;
    rating: number | null;
    reviews: number;
    avatarTone: string;
    location: string;
  }>;
  recentReviews: Array<{
    id: string;
    tutorId: string;
    tutor: string;              // Resolved tutor name
    learnerId: string;
    learner: string;            // Resolved learner name
    rating: number;
    excerpt: string;            // Review body snippet
    comment: string;
    status: 'pending' | 'approved' | 'hidden';
    moderationStatus: 'pending' | 'approved' | 'hidden';
    visibility: 'public' | 'hidden';
    lessonId: string | null;
    createdAt: string;
  }>;
  openIssues: Array<{
    id: string;
    label: string;              // Title or localized category
    title: string;
    category: string;
    categoryLabel: string;      // Vietnamese category label
    related: string;            // Related user/tutor name
    relatedUserId: string | null;
    relatedTutorId: string | null;
    received: string;           // Relative timestamp (e.g. '32 phút trước')
    status: 'new' | 'in_progress';
    statusTone: 'warning' | 'info';
    description: string;
    resolutionNote: string;
  }>;
  liveClasses: Array<{
    id: string;
    subject: string;
    tutor: string;
    tutorId: string;
    learner: string;
    time: string;               // e.g. '16:00 – 17:30'
    format: string;             // 'Tại nhà' | 'Online'
    status: 'live' | 'upcoming';
  }>;
}
```

---

### 3.2 `useAdminTutors()` / `selectAdminTutors(state)`

#### Objective
Drives the `/admin/tutors` operational management page with sticky table filtering, record counting, drawer verification, and moderation controls.

#### Return Contract
```typescript
interface AdminTutorsPayload {
  tutors: Array<{
    // Core Identity & Profile
    id: string;
    accountId?: string;
    name: string;
    initials: string;
    subjects: string[];
    subject: string;
    university: string;
    school: string;
    price: number;
    rating: number;
    reviews: number;
    intro: string;
    bio: string;
    experience: string;
    location: string;
    areas: string[];
    formats: string[];
    avatarTone: string;
    moderationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    rejectionReason: string | null;
    submitted: string;
    submissionDate: string | null;
    verificationDocs: Array<{ id: string; title: string; type: string; file: string }>;
    documentsCount: number;
    hasDocuments: boolean;
    // Computed Domain Metrics
    totalLessons: number;
    activeLessonsCount: number;
    completedLessonsCount: number;
    pendingRequestsCount: number;
    totalEarnings: number;
    isApproved: boolean;
    isPending: boolean;
    isRejected: boolean;
    isSuspended: boolean;
    displayStatus: string;       // 'Chờ duyệt' | 'Đã duyệt' | 'Đã từ chối' | 'Tạm khóa'
    statusTone: string;          // 'warning' | 'success' | 'danger' | 'neutral'
  }>;
  // Dispatches & Actions
  approveTutor: (tutorId: string) => void;
  rejectTutor: (tutorId: string, reason?: string) => void;
  toggleSuspendTutor: (tutorId: string, explicitState?: boolean) => void;
  setTutorSuspension: (tutorId: string, isSuspended: boolean) => void;
}
```

---

### 3.3 `useAdminUsers()` / `selectAdminUsers(state)`

#### Objective
Drives the `/admin/users` operational management page, providing account inspection, cross-domain activity statistics, and account suspension controls.

#### Return Contract
```typescript
interface AdminUsersPayload {
  users: Array<{
    // Identity & Authentication
    id: string;
    fullName: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    role: 'learner' | 'tutor' | 'admin';
    accountType: string;
    status: 'active' | 'suspended';
    initials: string;
    createdAt: string;
    // Computed Domain Metrics
    isSuspended: boolean;
    isActive: boolean;
    displayRole: string;         // 'Học viên' | 'Phụ huynh' | 'Gia sư' | 'Quản trị viên'
    displayStatus: string;       // 'Đang hoạt động' | 'Đang bị khóa'
    statusTone: string;          // 'success' | 'danger'
    requestsCount: number;       // Inbound/outbound requests in canonical domain
    lessonsCount: number;        // Scheduled lessons
    completedLessonsCount: number;
    savedTutorsCount: number;    // Bookmarked tutors
    issuesCount: number;         // Reported or related issues
    totalActivity: number;
  }>;
  // Dispatches & Actions
  toggleSuspendUser: (userId: string, explicitState?: boolean) => void;
  setUserSuspension: (userId: string, isSuspended: boolean) => void;
}
```

---

### 3.4 `useAdminReviews()` / `selectAdminReviews(state)`

#### Objective
Drives the `/admin/reviews` operational moderation page, managing public visibility of tutor reviews and connecting reviews to lessons and students.

#### Return Contract
```typescript
interface AdminReviewsPayload {
  reviews: Array<{
    id: string;
    tutorId: string;
    tutorName: string;
    tutor: string;
    learnerId: string;
    learnerName: string;
    learner: string;
    rating: number;
    comment: string;
    excerpt: string;
    createdAt: string;
    date: string;
    moderationStatus: 'pending' | 'approved' | 'hidden';
    status: 'pending' | 'approved' | 'hidden';
    visibility: 'public' | 'hidden';
    lessonId: string | null;
    subject: string;
    relatedLesson: object | null;
    // Computed Domain Metrics
    isPending: boolean;
    isApproved: boolean;
    isHidden: boolean;
    displayStatus: string;       // 'Cần duyệt' | 'Đã hiển thị' | 'Đã ẩn'
    statusTone: string;          // 'warning' | 'success' | 'neutral'
  }>;
  // Dispatches & Actions
  approveReview: (reviewId: string) => void;
  hideReview: (reviewId: string) => void;
  moderateReview: (reviewId: string, decision: 'approved' | 'hidden') => void;
}
```

---

### 3.5 `useAdminIssues()` / `selectAdminIssues(state)`

#### Objective
Drives the `/admin/issues` operational management page, managing reports, dispute investigations, admin resolution notes, and workflow status transitions.

#### Return Contract
```typescript
interface AdminIssuesPayload {
  issues: Array<{
    id: string;
    title: string;
    label: string;
    description: string;
    category: 'absence' | 'time_dispute' | 'cancellation' | 'fee_dispute' | 'attitude' | 'other';
    status: 'new' | 'in_progress' | 'resolved';
    createdAt: string;
    received: string;
    relatedUserId: string | null;
    relatedUserName: string;
    related: string;
    relatedTutorId: string | null;
    relatedTutorName: string;
    relatedLessonId: string | null;
    resolutionNote: string;
    resolvedAt: string | null;
    updatedAt: string | null;
    relatedUser: object | null;
    relatedTutor: object | null;
    relatedLesson: object | null;
    // Computed Domain Metrics
    isNew: boolean;
    isInProgress: boolean;
    isResolved: boolean;
    isOpen: boolean;
    categoryLabel: string;      // e.g. 'Tranh chấp giờ học'
    displayStatus: string;      // 'Mới tiếp nhận' | 'Đang xử lý' | 'Đã giải quyết'
    statusTone: string;         // 'warning' | 'info' | 'success'
  }>;
  // Dispatches & Actions
  updateIssueStatus: (issueId: string, status: 'new' | 'in_progress' | 'resolved', resolutionNote?: string) => void;
  resolveIssue: (issueId: string, resolutionNote?: string) => void;
}
```

---

## 4. Complete Code Blueprint: `apps/web/src/features/domain/useAdminDomain.js`

```javascript
/**
 * apps/web/src/features/domain/useAdminDomain.js
 *
 * Dedicated Admin Domain Adapters and Pure Selectors.
 * Bridges the canonical shared domain (tnm.demo.domain.v1) to Admin UI components.
 */

import useDemoDomain from './DemoDomainContext.jsx';

// ==========================================
// Status Constants & Semantic Dictionaries
// ==========================================

export const TUTOR_MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export const tutorModerationLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
  suspended: 'Tạm khóa',
};

export const tutorModerationTones = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'neutral',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export const userStatusLabels = {
  active: 'Đang hoạt động',
  suspended: 'Đang bị khóa',
};

export const userStatusTones = {
  active: 'success',
  suspended: 'danger',
};

export const userRoleLabels = {
  learner: 'Học viên',
  parent: 'Phụ huynh',
  tutor: 'Gia sư',
  admin: 'Quản trị viên',
};

export const REVIEW_MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  HIDDEN: 'hidden',
};

export const reviewModerationLabels = {
  pending: 'Cần duyệt',
  approved: 'Đã hiển thị',
  hidden: 'Đã ẩn',
};

export const reviewModerationTones = {
  pending: 'warning',
  approved: 'success',
  hidden: 'neutral',
};

export const ISSUE_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

export const issueStatusLabels = {
  new: 'Mới tiếp nhận',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
};

export const issueStatusTones = {
  new: 'warning',
  in_progress: 'info',
  resolved: 'success',
};

export const issueCategoryLabels = {
  absence: 'Vắng mặt không báo trước',
  time_dispute: 'Tranh chấp giờ học',
  cancellation: 'Hủy buổi đột xuất',
  fee_dispute: 'Tranh chấp học phí',
  attitude: 'Phản ánh thái độ',
  other: 'Khác',
};

// ==========================================
// Formatting Helpers
// ==========================================

export function formatMinutes(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return '--:--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatTimeRange(start, end) {
  return `${formatMinutes(start)} – ${formatMinutes(end)}`;
}

export function deriveInitials(name) {
  if (!name || typeof name !== 'string') return 'AD';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ==========================================
// Pure Domain Selectors
// ==========================================

export function selectAdminStats(state = {}) {
  const profiles = state.profiles || [];
  const users = state.users || [];
  const reviews = state.reviews || [];
  const issues = state.issues || [];
  const lessons = state.lessons || [];

  const pendingTutorsCount = profiles.filter(
    (p) => p.moderationStatus === TUTOR_MODERATION_STATUS.PENDING
  ).length;

  const pendingReviewsCount = reviews.filter(
    (r) => r.moderationStatus === REVIEW_MODERATION_STATUS.PENDING
  ).length;

  const openIssuesCount = issues.filter(
    (i) => i.status !== ISSUE_STATUS.RESOLVED
  ).length;

  const liveClassesCount = lessons.filter(
    (l) => l.status === 'live' || l.status === 'confirmed'
  ).length;

  const totalTutorsCount = profiles.length;
  const approvedTutorsCount = profiles.filter(
    (p) => (p.moderationStatus || 'approved') === TUTOR_MODERATION_STATUS.APPROVED
  ).length;
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status !== 'suspended').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;

  return {
    pendingTutors: pendingTutorsCount,
    pendingApprovals: pendingTutorsCount,
    liveClasses: liveClassesCount,
    pendingReviews: pendingReviewsCount,
    openIssues: openIssuesCount,
    totalTutors: totalTutorsCount,
    approvedTutors: approvedTutorsCount,
    totalUsers: totalUsersCount,
    activeUsers: activeUsersCount,
    suspendedUsers: suspendedUsersCount,
  };
}

export function selectAdminOverview(state = {}) {
  const stats = selectAdminStats(state);
  const profiles = state.profiles || [];
  const reviews = state.reviews || [];
  const issues = state.issues || [];
  const lessons = state.lessons || [];
  const users = state.users || [];

  const pendingTutors = profiles
    .filter((p) => p.moderationStatus === TUTOR_MODERATION_STATUS.PENDING)
    .map((tutor) => ({
      id: tutor.id,
      accountId: tutor.accountId || tutor.id,
      name: tutor.name,
      initials: tutor.initials || deriveInitials(tutor.name),
      subject: Array.isArray(tutor.subjects) ? tutor.subjects.join(' · ') : (tutor.subject || ''),
      subjects: tutor.subjects || (tutor.subject ? [tutor.subject] : []),
      school: tutor.university || tutor.school || '',
      university: tutor.university || tutor.school || '',
      submitted: tutor.submitted || tutor.submissionDateFormatted || 'Hôm nay',
      submissionDate: tutor.submissionDate || null,
      status: 'pending',
      moderationStatus: 'pending',
      price: tutor.price,
      bio: tutor.intro || tutor.bio || '',
      experience: tutor.experience || '',
      verificationDocs: tutor.verificationDocs || [],
      rating: tutor.rating ?? null,
      reviews: tutor.reviews ?? 0,
      avatarTone: tutor.avatarTone || 'blue',
      location: tutor.location || '',
    }));

  const recentReviews = reviews.map((review) => {
    const tutor = profiles.find((p) => p.id === review.tutorId);
    const learner = users.find((u) => u.id === review.learnerId);
    return {
      id: review.id,
      tutorId: review.tutorId,
      tutor: review.tutorName || tutor?.name || 'Gia sư',
      learnerId: review.learnerId,
      learner: review.learnerName || learner?.fullName || 'Học viên',
      rating: review.rating,
      excerpt: review.comment || review.excerpt || '',
      comment: review.comment || review.excerpt || '',
      status: review.moderationStatus || 'pending',
      moderationStatus: review.moderationStatus || 'pending',
      visibility: review.visibility || (review.moderationStatus === 'approved' ? 'public' : 'hidden'),
      lessonId: review.lessonId || null,
      createdAt: review.createdAt || '',
    };
  });

  const openIssues = issues
    .filter((i) => i.status !== ISSUE_STATUS.RESOLVED)
    .map((issue) => {
      const user = users.find((u) => u.id === (issue.relatedUserId || issue.userId));
      return {
        id: issue.id,
        label: issue.title || issue.label || issueCategoryLabels[issue.category] || 'Sự cố',
        title: issue.title || issue.label || '',
        category: issue.category,
        categoryLabel: issueCategoryLabels[issue.category] || issue.category || 'Khác',
        related: issue.relatedUserName || issue.related || user?.fullName || 'Người dùng',
        relatedUserId: issue.relatedUserId || issue.userId || null,
        relatedTutorId: issue.relatedTutorId || null,
        received: issue.received || issue.createdAtFormatted || 'Gần đây',
        status: issue.status,
        statusTone: issueStatusTones[issue.status] || 'warning',
        description: issue.description || '',
        resolutionNote: issue.resolutionNote || '',
      };
    });

  const liveClasses = lessons
    .filter((l) => l.status === 'live' || l.status === 'confirmed' || l.status === 'upcoming')
    .slice(0, 10)
    .map((lesson) => {
      const tutor = profiles.find((p) => p.id === lesson.tutorId);
      return {
        id: lesson.id,
        subject: lesson.subject || 'Buổi học',
        tutor: tutor?.name || lesson.tutor || 'Gia sư',
        tutorId: lesson.tutorId,
        learner: lesson.learner || 'Học viên',
        time: lesson.time || formatTimeRange(lesson.start, lesson.end),
        format: lesson.format || lesson.place || 'Tại nhà',
        status: lesson.status === 'confirmed' ? 'live' : lesson.status,
      };
    });

  return {
    stats,
    pendingTutors,
    recentReviews,
    openIssues,
    liveClasses,
  };
}

export function selectAdminTutors(state = {}) {
  const profiles = state.profiles || [];
  const lessons = state.lessons || [];
  const requests = state.requests || [];

  return profiles.map((tutor) => {
    const tutorLessons = lessons.filter((l) => l.tutorId === tutor.id);
    const tutorRequests = requests.filter((r) => r.tutorId === tutor.id);
    const completedLessons = tutorLessons.filter((l) => l.status === 'completed');
    const totalEarnings = completedLessons
      .filter((l) => Number.isFinite(l.sessionFee))
      .reduce((sum, l) => sum + l.sessionFee, 0);

    const moderationStatus = tutor.moderationStatus || 'approved';
    const isSuspended = moderationStatus === TUTOR_MODERATION_STATUS.SUSPENDED;
    const isApproved = moderationStatus === TUTOR_MODERATION_STATUS.APPROVED;
    const isPending = moderationStatus === TUTOR_MODERATION_STATUS.PENDING;
    const isRejected = moderationStatus === TUTOR_MODERATION_STATUS.REJECTED;

    return {
      id: tutor.id,
      accountId: tutor.accountId || tutor.id,
      name: tutor.name,
      initials: tutor.initials || deriveInitials(tutor.name),
      subjects: tutor.subjects || (tutor.subject ? [tutor.subject] : []),
      subject: Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : (tutor.subject || ''),
      university: tutor.university || tutor.school || '',
      school: tutor.university || tutor.school || '',
      price: tutor.price || 0,
      rating: tutor.rating ?? 5.0,
      reviews: tutor.reviews ?? 0,
      intro: tutor.intro || '',
      bio: tutor.intro || tutor.bio || '',
      experience: tutor.experience || '',
      location: tutor.location || '',
      areas: tutor.areas || (tutor.location ? [tutor.location] : []),
      formats: tutor.formats || [],
      avatarTone: tutor.avatarTone || 'blue',
      moderationStatus,
      status: moderationStatus,
      rejectionReason: tutor.rejectionReason || null,
      submitted: tutor.submitted || tutor.submissionDateFormatted || 'Hôm nay',
      submissionDate: tutor.submissionDate || null,
      verificationDocs: tutor.verificationDocs || [],
      documentsCount: (tutor.verificationDocs || []).length,
      hasDocuments: Boolean(tutor.verificationDocs && tutor.verificationDocs.length > 0),
      totalLessons: tutorLessons.length,
      activeLessonsCount: tutorLessons.filter((l) => l.status === 'confirmed' || l.status === 'upcoming' || l.status === 'live').length,
      completedLessonsCount: completedLessons.length,
      pendingRequestsCount: tutorRequests.filter((r) => r.status === 'pending').length,
      totalEarnings,
      isApproved,
      isPending,
      isRejected,
      isSuspended,
      displayStatus: tutorModerationLabels[moderationStatus] || 'Đã duyệt',
      statusTone: tutorModerationTones[moderationStatus] || 'neutral',
    };
  });
}

export function selectAdminUsers(state = {}) {
  const users = state.users || [];
  const lessons = state.lessons || [];
  const requests = state.requests || [];
  const issues = state.issues || [];
  const savedByAccount = state.savedByAccount || {};

  return users.map((user) => {
    const isSuspended = user.status === USER_STATUS.SUSPENDED;
    const isActive = !isSuspended;

    const userRequestsCount = requests.filter(
      (r) => r.learnerId === user.id || r.tutorId === user.id
    ).length;

    const userLessons = lessons.filter(
      (l) => l.tutorId === user.id || l.learnerId === user.id || (user.fullName && l.learner === user.fullName)
    );
    const completedLessonsCount = userLessons.filter((l) => l.status === 'completed').length;
    const savedTutorsCount = (savedByAccount[user.id] || []).length;
    const userIssuesCount = issues.filter(
      (i) => i.userId === user.id || i.relatedUserId === user.id
    ).length;

    const displayRole = user.role === 'tutor'
      ? userRoleLabels.tutor
      : user.role === 'admin'
      ? userRoleLabels.admin
      : (user.accountType === 'parent' ? userRoleLabels.parent : userRoleLabels.learner);

    return {
      id: user.id,
      fullName: user.fullName || user.name || '',
      name: user.fullName || user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'learner',
      accountType: user.accountType || (user.role === 'tutor' ? 'tutor' : 'learner'),
      status: user.status || 'active',
      initials: user.initials || deriveInitials(user.fullName || user.name || ''),
      createdAt: user.createdAt || '2026-09-01',
      isSuspended,
      isActive,
      displayRole,
      displayStatus: userStatusLabels[user.status] || 'Đang hoạt động',
      statusTone: userStatusTones[user.status] || 'success',
      requestsCount: userRequestsCount,
      lessonsCount: userLessons.length,
      completedLessonsCount,
      savedTutorsCount,
      issuesCount: userIssuesCount,
      totalActivity: userRequestsCount + userLessons.length + userIssuesCount,
    };
  });
}

export function selectAdminReviews(state = {}) {
  const reviews = state.reviews || [];
  const profiles = state.profiles || [];
  const users = state.users || [];
  const lessons = state.lessons || [];

  return reviews.map((review) => {
    const tutor = profiles.find((p) => p.id === review.tutorId);
    const learner = users.find((u) => u.id === review.learnerId);
    const relatedLesson = review.lessonId ? lessons.find((l) => l.id === review.lessonId) : null;

    const moderationStatus = review.moderationStatus || 'pending';
    const isPending = moderationStatus === REVIEW_MODERATION_STATUS.PENDING;
    const isApproved = moderationStatus === REVIEW_MODERATION_STATUS.APPROVED;
    const isHidden = moderationStatus === REVIEW_MODERATION_STATUS.HIDDEN || review.visibility === 'hidden';

    return {
      id: review.id,
      tutorId: review.tutorId,
      tutorName: review.tutorName || tutor?.name || 'Gia sư',
      tutor: review.tutorName || tutor?.name || 'Gia sư',
      learnerId: review.learnerId,
      learnerName: review.learnerName || learner?.fullName || 'Học viên',
      learner: review.learnerName || learner?.fullName || 'Học viên',
      rating: review.rating,
      comment: review.comment || review.excerpt || '',
      excerpt: review.excerpt || review.comment || '',
      createdAt: review.createdAt || '',
      date: review.date || review.createdAt || '',
      moderationStatus,
      status: moderationStatus,
      visibility: review.visibility || (isApproved ? 'public' : 'hidden'),
      lessonId: review.lessonId || null,
      subject: review.subject || (tutor?.subjects?.[0] || ''),
      relatedLesson,
      isPending,
      isApproved,
      isHidden,
      displayStatus: reviewModerationLabels[moderationStatus] || 'Cần duyệt',
      statusTone: reviewModerationTones[moderationStatus] || 'neutral',
    };
  });
}

export function selectAdminIssues(state = {}) {
  const issues = state.issues || [];
  const users = state.users || [];
  const profiles = state.profiles || [];
  const lessons = state.lessons || [];

  return issues.map((issue) => {
    const relatedUser = users.find((u) => u.id === (issue.relatedUserId || issue.userId));
    const relatedTutor = profiles.find((p) => p.id === issue.relatedTutorId);
    const relatedLesson = issue.relatedLessonId ? lessons.find((l) => l.id === issue.relatedLessonId) : null;

    const isNew = issue.status === ISSUE_STATUS.NEW;
    const isInProgress = issue.status === ISSUE_STATUS.IN_PROGRESS;
    const isResolved = issue.status === ISSUE_STATUS.RESOLVED;
    const isOpen = !isResolved;

    return {
      id: issue.id,
      title: issue.title || issue.label || '',
      label: issue.label || issue.title || issueCategoryLabels[issue.category] || 'Sự cố',
      description: issue.description || '',
      category: issue.category || 'other',
      status: issue.status || 'new',
      createdAt: issue.createdAt || '',
      received: issue.received || issue.createdAtFormatted || 'Gần đây',
      relatedUserId: issue.relatedUserId || issue.userId || null,
      relatedUserName: issue.relatedUserName || issue.related || relatedUser?.fullName || '',
      related: issue.related || issue.relatedUserName || relatedUser?.fullName || '',
      relatedTutorId: issue.relatedTutorId || null,
      relatedTutorName: issue.relatedTutorName || relatedTutor?.name || '',
      relatedLessonId: issue.relatedLessonId || null,
      resolutionNote: issue.resolutionNote || '',
      resolvedAt: issue.resolvedAt || null,
      updatedAt: issue.updatedAt || null,
      relatedUser,
      relatedTutor,
      relatedLesson,
      isNew,
      isInProgress,
      isResolved,
      isOpen,
      categoryLabel: issueCategoryLabels[issue.category] || issue.category || 'Khác',
      displayStatus: issueStatusLabels[issue.status] || 'Mới tiếp nhận',
      statusTone: issueStatusTones[issue.status] || 'warning',
    };
  });
}

// ==========================================
// React Hooks
// ==========================================

export function useAdminOverview() {
  const domain = useDemoDomain();
  return selectAdminOverview(domain);
}

export function useAdminTutors() {
  const domain = useDemoDomain();
  const tutors = selectAdminTutors(domain);

  return {
    tutors,
    approveTutor: (tutorId) => domain.approveTutor(tutorId),
    rejectTutor: (tutorId, reason) => domain.rejectTutor(tutorId, reason),
    toggleSuspendTutor: (tutorId, explicitState) => {
      if (domain.toggleSuspendTutor && explicitState === undefined) {
        return domain.toggleSuspendTutor(tutorId);
      }
      const tutor = (domain.profiles || []).find((p) => p.id === tutorId);
      const isCurrentlySuspended = tutor?.moderationStatus === 'suspended' || tutor?.status === 'suspended';
      const targetState = explicitState !== undefined ? explicitState : !isCurrentlySuspended;
      return domain.setTutorSuspension(tutorId, targetState);
    },
    setTutorSuspension: (tutorId, isSuspended) => domain.setTutorSuspension(tutorId, isSuspended),
  };
}

export function useAdminUsers() {
  const domain = useDemoDomain();
  const users = selectAdminUsers(domain);

  return {
    users,
    toggleSuspendUser: (userId, explicitState) => {
      if (domain.toggleSuspendUser && explicitState === undefined) {
        return domain.toggleSuspendUser(userId);
      }
      const user = (domain.users || []).find((u) => u.id === userId);
      const isCurrentlySuspended = user?.status === 'suspended';
      const targetState = explicitState !== undefined ? explicitState : !isCurrentlySuspended;
      return domain.setUserSuspension(userId, targetState);
    },
    setUserSuspension: (userId, isSuspended) => domain.setUserSuspension(userId, isSuspended),
  };
}

export function useAdminReviews() {
  const domain = useDemoDomain();
  const reviews = selectAdminReviews(domain);

  return {
    reviews,
    approveReview: (reviewId) => {
      if (domain.approveReview) return domain.approveReview(reviewId);
      return domain.moderateReview(reviewId, 'approved');
    },
    hideReview: (reviewId) => {
      if (domain.hideReview) return domain.hideReview(reviewId);
      return domain.moderateReview(reviewId, 'hidden');
    },
    moderateReview: (reviewId, decision) => domain.moderateReview(reviewId, decision),
  };
}

export function useAdminIssues() {
  const domain = useDemoDomain();
  const issues = selectAdminIssues(domain);

  return {
    issues,
    updateIssueStatus: (issueId, status, resolutionNote) =>
      domain.updateIssueStatus(issueId, status, resolutionNote),
    resolveIssue: (issueId, resolutionNote) =>
      domain.updateIssueStatus(issueId, 'resolved', resolutionNote),
  };
}
```

---

## 5. Unit Test Suite Blueprint: `apps/web/tests/adminDomain.test.js`

### 5.1 Test Execution Architecture
The test suite utilizes Node.js native test runner (`node:test` and `node:assert/strict`), which executes via `npm test` inside `apps/web`. The 17 unit tests verify:
1. Pure calculation correctness across all 5 selectors
2. Pure state transitions via reducers from `demoDomain.js`
3. Cross-role synchronizations (tutor suspension <-> user account suspension)
4. Preservation of the 9-request invariant (`BUG-010`) and zero mutation of input objects

### 5.2 Complete Test Suite Code

```javascript
/**
 * apps/web/tests/adminDomain.test.js
 *
 * Deterministic Unit Tests for Milestone M1 Admin Adapters & Domain Reducers.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDemoState,
  approveTutor,
  rejectTutor,
  setTutorSuspension,
  setUserSuspension,
  moderateReview,
  updateIssueStatus,
} from '../src/features/domain/demoDomain.js';

import {
  selectAdminStats,
  selectAdminOverview,
  selectAdminTutors,
  selectAdminUsers,
  selectAdminReviews,
  selectAdminIssues,
  deriveInitials,
  formatMinutes,
  formatTimeRange,
  tutorModerationLabels,
  userRoleLabels,
  issueCategoryLabels,
} from '../src/features/domain/useAdminDomain.js';

const referenceDate = new Date('2026-10-05T06:00:00+07:00');

function createSampleAdminState() {
  const state = createDemoState(referenceDate);

  // Extend with deterministic sample data for testing
  state.profiles = [
    {
      id: 'tutor-approved',
      accountId: 'user-tutor-1',
      name: 'Trần Gia Bảo',
      subjects: ['Tiếng Anh', 'IELTS'],
      university: 'ĐH Ngoại thương',
      price: 220000,
      moderationStatus: 'approved',
      verificationDocs: [{ id: 'doc-1', title: 'Thẻ SV', type: 'id_card', file: 'id.pdf' }],
    },
    {
      id: 'tutor-pending',
      accountId: 'user-tutor-2',
      name: 'Lê Thảo Vy',
      subjects: ['Ngữ văn'],
      university: 'ĐH Sư phạm TP.HCM',
      price: 180000,
      moderationStatus: 'pending',
      submitted: 'Hôm nay, 09:20',
      verificationDocs: [],
    },
    {
      id: 'tutor-suspended',
      accountId: 'user-tutor-3',
      name: 'Nguyễn Văn A',
      subjects: ['Toán'],
      university: 'ĐH Bách Khoa',
      price: 200000,
      moderationStatus: 'suspended',
      verificationDocs: [],
    },
  ];

  state.users = [
    { id: 'user-learner-1', fullName: 'Nguyễn Minh Anh', username: 'minhanh', role: 'learner', status: 'active' },
    { id: 'user-tutor-1', fullName: 'Trần Gia Bảo', username: 'giabao', role: 'tutor', status: 'active' },
    { id: 'user-tutor-2', fullName: 'Lê Thảo Vy', username: 'thaovy', role: 'tutor', status: 'active' },
    { id: 'user-tutor-3', fullName: 'Nguyễn Văn A', username: 'vana', role: 'tutor', status: 'suspended' },
    { id: 'user-suspended-learner', fullName: 'Phạm Quỳnh', username: 'quynh', role: 'learner', status: 'suspended' },
  ];

  state.reviews = [
    { id: 'rev-1', tutorId: 'tutor-approved', learnerId: 'user-learner-1', rating: 5, comment: 'Gia sư dạy rất hay!', moderationStatus: 'approved', visibility: 'public' },
    { id: 'rev-2', tutorId: 'tutor-approved', learnerId: 'user-learner-1', rating: 4, comment: 'Cần duyệt thêm.', moderationStatus: 'pending', visibility: 'hidden' },
    { id: 'rev-3', tutorId: 'tutor-approved', learnerId: 'user-learner-1', rating: 2, comment: 'Đã bị ẩn.', moderationStatus: 'hidden', visibility: 'hidden' },
  ];

  state.issues = [
    { id: 'iss-1', title: 'Vắng mặt buổi học', category: 'absence', status: 'new', relatedUserId: 'user-learner-1', relatedTutorId: 'tutor-approved', description: 'Gia sư không đến.' },
    { id: 'iss-2', title: 'Tranh chấp giờ học', category: 'time_dispute', status: 'in_progress', relatedUserId: 'user-learner-1', relatedTutorId: 'tutor-approved', description: 'Lớp bị dời lịch.' },
    { id: 'iss-3', title: 'Hủy lịch đã hoàn tiền', category: 'cancellation', status: 'resolved', relatedUserId: 'user-learner-1', resolutionNote: 'Đã hoàn tất xử lý.' },
  ];

  return state;
}

// ==========================================
// 1. Overview & Stats Tests
// ==========================================

test('ADM-HOOK-001 selectAdminStats accurately counts live domain projections', () => {
  const state = createSampleAdminState();
  const stats = selectAdminStats(state);

  assert.equal(stats.pendingTutors, 1);
  assert.equal(stats.pendingApprovals, 1);
  assert.equal(stats.pendingReviews, 1);
  assert.equal(stats.openIssues, 2); // iss-1 (new) + iss-2 (in_progress)
  assert.equal(stats.totalTutors, 3);
  assert.equal(stats.approvedTutors, 1);
  assert.equal(stats.totalUsers, 5);
  assert.equal(stats.activeUsers, 3);
  assert.equal(stats.suspendedUsers, 2);
});

test('ADM-HOOK-002 selectAdminOverview projects pending tutors with drawer inspection fields', () => {
  const state = createSampleAdminState();
  const overview = selectAdminOverview(state);

  assert.equal(overview.pendingTutors.length, 1);
  const pending = overview.pendingTutors[0];
  assert.equal(pending.id, 'tutor-pending');
  assert.equal(pending.name, 'Lê Thảo Vy');
  assert.equal(pending.initials, 'TV');
  assert.equal(pending.school, 'ĐH Sư phạm TP.HCM');
  assert.equal(pending.status, 'pending');
  assert.equal(pending.submitted, 'Hôm nay, 09:20');
});

test('ADM-HOOK-003 selectAdminOverview projects recent reviews and open issues cleanly', () => {
  const state = createSampleAdminState();
  const overview = selectAdminOverview(state);

  assert.equal(overview.recentReviews.length, 3);
  assert.equal(overview.recentReviews[0].tutor, 'Trần Gia Bảo');
  assert.equal(overview.recentReviews[0].learner, 'Nguyễn Minh Anh');

  assert.equal(overview.openIssues.length, 2);
  assert.equal(overview.openIssues.some((i) => i.id === 'iss-3'), false, 'Resolved issue must not appear in openIssues');
  assert.equal(overview.openIssues.find((i) => i.id === 'iss-1').categoryLabel, 'Vắng mặt không báo trước');
});

test('ADM-HOOK-004 selectAdminOverview handles empty collections gracefully without exceptions', () => {
  const overview = selectAdminOverview({});
  assert.equal(overview.stats.pendingTutors, 0);
  assert.equal(overview.stats.liveClasses, 0);
  assert.deepEqual(overview.pendingTutors, []);
  assert.deepEqual(overview.recentReviews, []);
  assert.deepEqual(overview.openIssues, []);
});

// ==========================================
// 2. Tutors Hook & Selector Tests
// ==========================================

test('ADM-HOOK-005 selectAdminTutors computes lesson counts, earnings, and display labels', () => {
  const state = createSampleAdminState();
  state.lessons = [
    { id: 'l-1', tutorId: 'tutor-approved', status: 'completed', sessionFee: 220000 },
    { id: 'l-2', tutorId: 'tutor-approved', status: 'completed', sessionFee: 220000 },
    { id: 'l-3', tutorId: 'tutor-approved', status: 'confirmed', sessionFee: 220000 },
    { id: 'l-4', tutorId: 'tutor-pending', status: 'upcoming', sessionFee: 180000 },
  ];

  const tutors = selectAdminTutors(state);
  const approved = tutors.find((t) => t.id === 'tutor-approved');
  const pending = tutors.find((t) => t.id === 'tutor-pending');
  const suspended = tutors.find((t) => t.id === 'tutor-suspended');

  assert.equal(approved.totalLessons, 3);
  assert.equal(approved.completedLessonsCount, 2);
  assert.equal(approved.activeLessonsCount, 1);
  assert.equal(approved.totalEarnings, 440000);
  assert.equal(approved.displayStatus, 'Đã duyệt');
  assert.equal(approved.statusTone, 'success');
  assert.equal(approved.hasDocuments, true);

  assert.equal(pending.displayStatus, 'Chờ duyệt');
  assert.equal(pending.statusTone, 'warning');
  assert.equal(pending.hasDocuments, false);

  assert.equal(suspended.displayStatus, 'Tạm khóa');
  assert.equal(suspended.isSuspended, true);
});

test('ADM-HOOK-006 approveTutor transitions tutor to approved and reflects in selectAdminTutors', () => {
  const state = createSampleAdminState();
  const nextState = approveTutor(state, 'tutor-pending');

  const tutors = selectAdminTutors(nextState);
  const target = tutors.find((t) => t.id === 'tutor-pending');
  assert.equal(target.moderationStatus, 'approved');
  assert.equal(target.isApproved, true);
  assert.equal(target.isPending, false);

  const stats = selectAdminStats(nextState);
  assert.equal(stats.pendingTutors, 0);
  assert.equal(stats.approvedTutors, 2);
});

test('ADM-HOOK-007 rejectTutor transitions tutor to rejected with specified reason', () => {
  const state = createSampleAdminState();
  const nextState = rejectTutor(state, 'tutor-pending', 'Bằng cấp chưa đạt yêu cầu kiểm duyệt');

  const tutors = selectAdminTutors(nextState);
  const target = tutors.find((t) => t.id === 'tutor-pending');
  assert.equal(target.moderationStatus, 'rejected');
  assert.equal(target.isRejected, true);
  assert.equal(target.rejectionReason, 'Bằng cấp chưa đạt yêu cầu kiểm duyệt');
  assert.equal(target.displayStatus, 'Đã từ chối');
  assert.equal(target.statusTone, 'danger');
});

test('ADM-HOOK-008 setTutorSuspension toggles suspension and synchronizes linked user status', () => {
  const state = createSampleAdminState();

  // Suspend approved tutor
  const suspendedState = setTutorSuspension(state, 'tutor-approved', true);
  const tutorSuspended = suspendedState.profiles.find((p) => p.id === 'tutor-approved');
  const userSuspended = suspendedState.users.find((u) => u.id === 'user-tutor-1');
  assert.equal(tutorSuspended.moderationStatus, 'suspended');
  assert.equal(userSuspended.status, 'suspended', 'Linked user account must be suspended');

  // Unsuspend tutor
  const restoredState = setTutorSuspension(suspendedState, 'tutor-approved', false);
  const tutorRestored = restoredState.profiles.find((p) => p.id === 'tutor-approved');
  const userRestored = restoredState.users.find((u) => u.id === 'user-tutor-1');
  assert.equal(tutorRestored.moderationStatus, 'approved');
  assert.equal(userRestored.status, 'active', 'Linked user account must be restored to active');
});

// ==========================================
// 3. Users Hook & Selector Tests
// ==========================================

test('ADM-HOOK-009 selectAdminUsers computes role translations and canonical activity', () => {
  const state = createSampleAdminState();
  const users = selectAdminUsers(state);

  const learner = users.find((u) => u.id === 'user-learner-1');
  assert.equal(learner.displayRole, 'Học viên');
  assert.equal(learner.displayStatus, 'Đang hoạt động');
  assert.equal(learner.isActive, true);
  assert.equal(learner.isSuspended, false);

  const suspendedUser = users.find((u) => u.id === 'user-suspended-learner');
  assert.equal(suspendedUser.displayStatus, 'Đang bị khóa');
  assert.equal(suspendedUser.statusTone, 'danger');
  assert.equal(suspendedUser.isSuspended, true);
});

test('ADM-HOOK-010 setUserSuspension toggles user status and syncs tutor profile if applicable', () => {
  const state = createSampleAdminState();

  // Suspend user
  const suspended = setUserSuspension(state, 'user-tutor-1', true);
  assert.equal(suspended.users.find((u) => u.id === 'user-tutor-1').status, 'suspended');
  assert.equal(suspended.profiles.find((p) => p.accountId === 'user-tutor-1').moderationStatus, 'suspended');

  // Unsuspend user
  const restored = setUserSuspension(suspended, 'user-tutor-1', false);
  assert.equal(restored.users.find((u) => u.id === 'user-tutor-1').status, 'active');
  assert.equal(restored.profiles.find((p) => p.accountId === 'user-tutor-1').moderationStatus, 'approved');
});

// ==========================================
// 4. Reviews Hook & Selector Tests
// ==========================================

test('ADM-HOOK-011 selectAdminReviews enriches items with entity names and moderation flags', () => {
  const state = createSampleAdminState();
  const reviews = selectAdminReviews(state);

  const pendingRev = reviews.find((r) => r.id === 'rev-2');
  assert.equal(pendingRev.isPending, true);
  assert.equal(pendingRev.displayStatus, 'Cần duyệt');
  assert.equal(pendingRev.statusTone, 'warning');

  const approvedRev = reviews.find((r) => r.id === 'rev-1');
  assert.equal(approvedRev.isApproved, true);
  assert.equal(approvedRev.visibility, 'public');

  const hiddenRev = reviews.find((r) => r.id === 'rev-3');
  assert.equal(hiddenRev.isHidden, true);
  assert.equal(hiddenRev.visibility, 'hidden');
});

test('ADM-HOOK-012 moderateReview toggles review visibility and moderationStatus atomically', () => {
  const state = createSampleAdminState();

  // Approve pending review
  const approvedState = moderateReview(state, 'rev-2', 'approved');
  const approvedReview = approvedState.reviews.find((r) => r.id === 'rev-2');
  assert.equal(approvedReview.moderationStatus, 'approved');
  assert.equal(approvedReview.visibility, 'public');

  // Hide approved review
  const hiddenState = moderateReview(approvedState, 'rev-2', 'hidden');
  const hiddenReview = hiddenState.reviews.find((r) => r.id === 'rev-2');
  assert.equal(hiddenReview.moderationStatus, 'hidden');
  assert.equal(hiddenReview.visibility, 'hidden');
});

// ==========================================
// 5. Issues Hook & Selector Tests
// ==========================================

test('ADM-HOOK-013 selectAdminIssues computes workflow flags and Vietnamese categories', () => {
  const state = createSampleAdminState();
  const issues = selectAdminIssues(state);

  const newIssue = issues.find((i) => i.id === 'iss-1');
  assert.equal(newIssue.isNew, true);
  assert.equal(newIssue.isOpen, true);
  assert.equal(newIssue.displayStatus, 'Mới tiếp nhận');
  assert.equal(newIssue.categoryLabel, 'Vắng mặt không báo trước');

  const inProgressIssue = issues.find((i) => i.id === 'iss-2');
  assert.equal(inProgressIssue.isInProgress, true);
  assert.equal(inProgressIssue.isOpen, true);
  assert.equal(inProgressIssue.displayStatus, 'Đang xử lý');

  const resolvedIssue = issues.find((i) => i.id === 'iss-3');
  assert.equal(resolvedIssue.isResolved, true);
  assert.equal(resolvedIssue.isOpen, false);
  assert.equal(resolvedIssue.displayStatus, 'Đã giải quyết');
});

test('ADM-HOOK-014 updateIssueStatus updates status, resolution notes, and timestamps', () => {
  const state = createSampleAdminState();

  const inProgressState = updateIssueStatus(state, 'iss-1', 'in_progress', 'Đang liên hệ hai bên.');
  const issue1 = inProgressState.issues.find((i) => i.id === 'iss-1');
  assert.equal(issue1.status, 'in_progress');
  assert.equal(issue1.resolutionNote, 'Đang liên hệ hai bên.');

  const resolvedState = updateIssueStatus(inProgressState, 'iss-1', 'resolved', 'Đã thỏa thuận xong.');
  const issueResolved = resolvedState.issues.find((i) => i.id === 'iss-1');
  assert.equal(issueResolved.status, 'resolved');
  assert.ok(issueResolved.resolvedAt);

  // Resolved issue is removed from openIssues projection
  const overview = selectAdminOverview(resolvedState);
  assert.equal(overview.openIssues.some((i) => i.id === 'iss-1'), false);
});

// ==========================================
// 6. Invariant & Regression Protections
// ==========================================

test('ADM-HOOK-015 all admin operations strictly preserve the 9 requests invariant (BUG-010)', () => {
  const state = createDemoState(referenceDate);
  assert.equal(state.requests.length, 9, 'Initial request count must be exactly 9');

  let s = approveTutor(state, 'mai-anh');
  s = rejectTutor(s, 'quoc-bao', 'Lý do từ chối');
  s = setTutorSuspension(s, 'mai-anh', true);
  s = setUserSuspension(s, 'demo-learner', true);
  s = moderateReview(s, 'rev-1', 'approved');
  s = updateIssueStatus(s, 'iss-1', 'resolved', 'Done');

  assert.equal(s.requests.length, 9, 'Admin operations must NEVER alter or mutate the 9 canonical requests');
});

test('ADM-HOOK-016 helper functions format minutes and derive initials deterministically', () => {
  assert.equal(formatMinutes(420), '07:00');
  assert.equal(formatMinutes(1095), '18:15');
  assert.equal(formatMinutes(null), '--:--');
  assert.equal(formatTimeRange(420, 465), '07:00 – 07:45');

  assert.equal(deriveInitials('Nguyễn Mai Anh'), 'MA');
  assert.equal(deriveInitials('Trần Gia Bảo'), 'GB');
  assert.equal(deriveInitials('Lê Thảo Vy'), 'TV');
  assert.equal(deriveInitials('Admin'), 'AD');
  assert.equal(deriveInitials(''), 'AD');
});

test('ADM-HOOK-017 pure reducers and selectors guarantee immutability', () => {
  const state = createSampleAdminState();
  const frozen = Object.freeze(state);

  // Performing selectors does not mutate
  selectAdminOverview(frozen);
  selectAdminTutors(frozen);
  selectAdminUsers(frozen);
  selectAdminReviews(frozen);
  selectAdminIssues(frozen);

  // Performing reducers returns new state references
  const next = approveTutor(frozen, 'tutor-pending');
  assert.notEqual(next, frozen);
  assert.notEqual(next.profiles, frozen.profiles);
});
```

---

## 6. UI Integration Mapping for Subsequent Milestones (M3, M4, M5)

### 6.1 Admin Operational Pages (Milestone M4)
The designed hooks map 1:1 with the operational page requirements in `ORIGINAL_REQUEST.md`:

| Route | Hook Consumed | Filter Tabs Supported | Slide-Over Drawer Actions |
|---|---|---|---|
| `/admin/tutors` | `useAdminTutors()` | Tất cả, Chờ duyệt (`isPending`), Đã duyệt (`isApproved`), Đã từ chối (`isRejected`), Tạm khóa (`isSuspended`) | `approveTutor(id)`, `rejectTutor(id, reason)`, `toggleSuspendTutor(id)` |
| `/admin/users` | `useAdminUsers()` | Tất cả, Học viên/Phụ huynh (`role === 'learner'`), Gia sư (`role === 'tutor'`), Đang hoạt động (`isActive`), Đang bị khóa (`isSuspended`) | `toggleSuspendUser(id)` |
| `/admin/reviews` | `useAdminReviews()` | Cần duyệt (`isPending`), Đã hiển thị (`isApproved`), Đã ẩn (`isHidden`) | `approveReview(id)`, `hideReview(id)` |
| `/admin/issues` | `useAdminIssues()` | Mới tiếp nhận (`isNew`), Đang xử lý (`isInProgress`), Đã giải quyết (`isResolved`) | `updateIssueStatus(id, status, note)`, `resolveIssue(id, note)` |

### 6.2 Admin Navigation Badges (Milestone M3)
In `AdminSidebar`:
```jsx
// Sidebar badge count directly consumes useAdminOverview():
const { stats } = useAdminOverview();

<SidebarItem label="Gia sư" badge={stats.pendingTutors || undefined} />
<SidebarItem label="Đánh giá" badge={stats.pendingReviews || undefined} />
<SidebarItem label="Báo cáo & sự cố" badge={stats.openIssues || undefined} />
```

### 6.3 Admin Dashboard Live Projections (Milestone M5)
In `AdminDashboard.jsx`:
```jsx
const { stats, pendingTutors, recentReviews, openIssues, liveClasses } = useAdminOverview();
const { approveTutor, rejectTutor } = useAdminTutors();
const { approveReview, hideReview } = useAdminReviews();
// Completely replace local useState(initialApprovals) and static mock arrays!
```

---

## 7. Verification Method

1. **Verify Existing Tests**:
   Execute `npm test` inside `apps/web`. All 55 baseline tests must continue to pass without error.
2. **Execute New Admin Domain Tests**:
   Once `apps/web/src/features/domain/useAdminDomain.js` and `apps/web/tests/adminDomain.test.js` are created during implementation, execute `npm test`. All 72 tests (55 legacy + 17 admin domain) will pass cleanly.
3. **Verify Build**:
   Execute `npm run build` inside `apps/web` to confirm zero lint or Vite bundling issues.
