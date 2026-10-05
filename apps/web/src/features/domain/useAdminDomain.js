/**
 * apps/web/src/features/domain/useAdminDomain.js
 *
 * Dedicated Admin Domain Adapters and Pure Selectors.
 * Bridges the canonical shared domain (tnm.demo.domain.v1) to Admin UI components.
 */

import { accountHistory } from './appeals.js';

let useDemoDomain = () => {
  throw new Error('useDemoDomain is only available within a React environment');
};

try {
  const domainContextModule = await import('./DemoDomainContext.jsx');
  useDemoDomain = domainContextModule.default || domainContextModule.useDemoDomain;
} catch (e) {
  // Gracefully handle raw Node.js test environment without JSX loader
}

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
  DISMISSED: 'dismissed',
};

export const issueStatusLabels = {
  new: 'Mới tiếp nhận',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  dismissed: 'Đã từ chối',
  rejected: 'Đã từ chối',
};

export const issueStatusTones = {
  new: 'warning',
  in_progress: 'info',
  resolved: 'success',
  dismissed: 'neutral',
  rejected: 'neutral',
};

export const issueCategoryLabels = {
  absence: 'Vắng mặt không báo trước',
  vang_mat: 'Vắng mặt không báo trước',
  lesson_dispute: 'Tranh chấp giờ học',
  lesson_time_dispute: 'Tranh chấp giờ học',
  tranh_chap_gio: 'Tranh chấp giờ học',
  time_dispute: 'Tranh chấp giờ học',
  cancellation: 'Hủy buổi đột xuất',
  huy_lop: 'Hủy buổi đột xuất',
  fee_dispute: 'Tranh chấp học phí',
  tranh_chap_phi: 'Tranh chấp học phí',
  attitude: 'Phản ánh thái độ',
  attitude_complaint: 'Phản ánh thái độ',
  thai_do: 'Phản ánh thái độ',
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
    (i) => i.status !== ISSUE_STATUS.RESOLVED && i.status !== ISSUE_STATUS.DISMISSED && i.status !== 'rejected'
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
    openIssuesCount: openIssuesCount,
    totalTutors: totalTutorsCount,
    approvedTutors: approvedTutorsCount,
    totalUsers: totalUsersCount,
    totalReviews: reviews.length,
    totalIssues: issues.length,
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
      submitted: tutor.submitted || tutor.submissionDateFormatted || 'Hôm nay, 09:20',
      submissionDate: tutor.submissionDate || tutor.submittedAt || null,
      status: 'pending',
      moderationStatus: 'pending',
      price: tutor.price,
      bio: tutor.intro || tutor.bio || '',
      experience: tutor.experience || '',
      verificationDocs: tutor.verificationDocs || tutor.verificationDocuments || tutor.documents || [],
      verificationDocuments: tutor.verificationDocuments || tutor.verificationDocs || tutor.documents || [],
      documents: tutor.documents || tutor.verificationDocuments || tutor.verificationDocs || [],
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
      tutorName: review.tutorName || tutor?.name || 'Gia sư',
      learnerId: review.learnerId,
      learner: review.learnerName || learner?.fullName || 'Học viên',
      learnerName: review.learnerName || learner?.fullName || 'Học viên',
      rating: review.rating,
      excerpt: review.comment || review.excerpt || review.text || '',
      comment: review.comment || review.excerpt || review.text || '',
      status: review.moderationStatus || 'pending',
      moderationStatus: review.moderationStatus || 'pending',
      visibility: review.visibility || (review.moderationStatus === 'approved' ? 'public' : 'hidden'),
      lessonId: review.lessonId || null,
      createdAt: review.createdAt || '',
    };
  });

  const openIssues = issues
    .filter((i) => i.status !== ISSUE_STATUS.RESOLVED && i.status !== ISSUE_STATUS.DISMISSED && i.status !== 'rejected')
    .map((issue) => {
      const user = users.find((u) => u.id === (issue.relatedUserId || issue.userId || issue.learnerId));
      return {
        id: issue.id,
        label: issue.title || issue.label || issueCategoryLabels[issue.category] || 'Sự cố',
        title: issue.title || issue.label || '',
        category: issue.category,
        categoryLabel: issueCategoryLabels[issue.category] || issue.category || 'Khác',
        related: issue.relatedUserName || issue.related || user?.fullName || 'Người dùng',
        relatedUserName: issue.relatedUserName || issue.related || user?.fullName || 'Người dùng',
        relatedUserId: issue.relatedUserId || issue.userId || issue.learnerId || null,
        relatedTutorId: issue.relatedTutorId || issue.tutorId || null,
        relatedTutorName: issue.relatedTutorName || issue.tutorName || '',
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
    pendingTutorsCount: stats.pendingTutors,
    pendingReviewsCount: stats.pendingReviews,
    openIssuesCount: stats.openIssues,
    pendingTutors,
    recentReviews,
    openIssues,
    liveClasses,
  };
}

export function calculateAdminOverview(state = {}, now = new Date()) {
  return selectAdminOverview(state);
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

    const docs = tutor.verificationDocs || tutor.verificationDocuments || tutor.documents || [];

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
      intro: tutor.intro || tutor.bio || '',
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
      submissionDate: tutor.submissionDate || tutor.submittedAt || null,
      verificationDocs: docs,
      verificationDocuments: docs,
      documents: docs,
      documentsCount: docs.length,
      hasDocuments: docs.length > 0,
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
      (i) => i.userId === user.id || i.relatedUserId === user.id || i.learnerId === user.id
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
      comment: review.comment || review.excerpt || review.text || '',
      excerpt: review.excerpt || review.comment || review.text || '',
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
    // 1. Resolve Reporter (Bên gửi khiếu nại)
    const reporterAccount = users.find(
      (u) => u.id === (issue.reportedBy?.id || issue.learnerId || issue.userId || issue.relatedUserId)
    );
    const reporterId = reporterAccount?.id || issue.reportedBy?.id || issue.learnerId || 'unknown-reporter';
    const reporterName = reporterAccount?.fullName || reporterAccount?.name || issue.reportedBy?.name || issue.learnerName || issue.reporter || 'Người học';
    const reporterUsername = reporterAccount?.username || issue.reportedBy?.username || (reporterAccount ? reporterAccount.id : 'nguoihoc');
    const reporterEmail = reporterAccount?.email || issue.reportedBy?.email || 'Chưa cập nhật email';
    const reporterPhone = reporterAccount?.phone || issue.reportedBy?.phone || 'Chưa cập nhật SĐT';
    const reporterRole = reporterAccount?.role || issue.reportedBy?.role || (reporterAccount?.accountType === 'parent' ? 'parent' : 'learner');
    const reporterDisplayRole = userRoleLabels[reporterRole] || (reporterRole === 'parent' ? 'Phụ huynh' : 'Học viên');
    const reporterReportsCount = issues.filter(
      (i) =>
        (i.reportedBy?.id && i.reportedBy.id === reporterId) ||
        (i.learnerId && i.learnerId === reporterId) ||
        (i.userId && i.userId === reporterId)
    ).length;

    const reporter = {
      id: reporterId,
      name: reporterName,
      fullName: reporterName,
      username: reporterUsername,
      email: reporterEmail,
      phone: reporterPhone,
      role: reporterRole,
      displayRole: reporterDisplayRole,
      status: reporterAccount?.status || 'active',
      reportsCount: reporterReportsCount,
      avatarTone: reporterRole === 'tutor' ? 'blue' : 'slate',
      initials: reporterAccount?.initials || deriveInitials(reporterName || 'NH'),
    };

    // 2. Resolve Target (Bên bị khiếu nại / bên liên quan)
    const targetAccount = users.find(
      (u) =>
        u.id === (issue.targetUser?.id || issue.targetUserId) ||
        (issue.relatedTutorId && (u.tutorProfileId === issue.relatedTutorId || u.id === issue.relatedTutorId)) ||
        (issue.tutorId && (u.tutorProfileId === issue.tutorId || u.id === issue.tutorId))
    );
    const targetProfile = profiles.find(
      (p) =>
        p.id === (issue.relatedTutorId || issue.tutorId || targetAccount?.tutorProfileId || targetAccount?.id)
    );
    const targetId = targetAccount?.id || issue.targetUser?.id || targetProfile?.accountId || targetProfile?.id || 'unknown-target';
    const targetName = targetAccount?.fullName || targetAccount?.name || targetProfile?.name || issue.targetUser?.name || issue.tutorName || 'Gia sư';
    const targetUsername = targetAccount?.username || issue.targetUser?.username || (targetAccount ? targetAccount.id : 'giasu');
    const targetEmail = targetAccount?.email || issue.targetUser?.email || 'Chưa cập nhật email';
    const targetPhone = targetAccount?.phone || issue.targetUser?.phone || 'Chưa cập nhật SĐT';
    const targetRole = targetAccount?.role || issue.targetUser?.role || 'tutor';
    const targetDisplayRole = userRoleLabels[targetRole] || (targetRole === 'tutor' ? 'Gia sư' : 'Người học');
    const targetWarningCount = targetAccount?.warningCount ?? 0;
    const targetWarnings = targetAccount?.warnings || [];
    const isTargetSuspended = targetAccount?.status === 'suspended' || targetProfile?.moderationStatus === 'suspended';

    const targetUser = {
      id: targetId,
      name: targetName,
      fullName: targetName,
      username: targetUsername,
      email: targetEmail,
      phone: targetPhone,
      role: targetRole,
      displayRole: targetDisplayRole,
      status: targetAccount?.status || (isTargetSuspended ? 'suspended' : 'active'),
      isSuspended: isTargetSuspended,
      warningCount: targetWarningCount,
      warnings: targetWarnings,
      avatarTone: targetRole === 'learner' ? 'slate' : 'coral',
      initials: targetAccount?.initials || deriveInitials(targetName || 'GS'),
    };

    const relatedLesson = issue.relatedLessonId ? lessons.find((l) => l.id === issue.relatedLessonId) : null;

    const isNew = issue.status === ISSUE_STATUS.NEW;
    const isInProgress = issue.status === ISSUE_STATUS.IN_PROGRESS;
    const isResolved = issue.status === ISSUE_STATUS.RESOLVED;
    const isDismissed = issue.status === ISSUE_STATUS.DISMISSED || issue.status === 'rejected';
    const isOpen = !isResolved && !isDismissed;

    return {
      id: issue.id,
      title: issue.title || issue.label || '',
      label: issue.label || issue.title || issueCategoryLabels[issue.category] || 'Sự cố',
      description: issue.description || '',
      category: issue.category || 'other',
      status: issue.status || 'new',
      createdAt: issue.createdAt || '',
      received: issue.received || issue.createdAtFormatted || 'Gần đây',
      relatedUserId: reporterId,
      relatedUserName: reporterName,
      related: reporterName,
      learnerId: reporterId,
      learnerName: reporterName,
      relatedTutorId: targetId,
      relatedTutorName: targetName,
      tutorId: targetId,
      tutorName: targetName,
      relatedLessonId: issue.relatedLessonId || null,
      resolutionNote: issue.resolutionNote || '',
      resolutionAction: issue.resolutionAction || (isResolved ? 'resolved_normal' : (isDismissed ? 'dismissed_unverified' : null)),
      reporterNotice: issue.reporterNotice || null,
      warnedUserId: issue.warnedUserId || null,
      resolvedAt: issue.resolvedAt || null,
      dismissedAt: issue.dismissedAt || null,
      updatedAt: issue.updatedAt || null,
      reporter,
      targetUser,
      relatedUser: reporterAccount,
      relatedTutor: targetProfile,
      relatedLesson,
      isNew,
      isInProgress,
      isResolved,
      isDismissed,
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
    getAccountHistory: (id) => accountHistory(domain, id),
    updateIssueStatus: (issueId, status, resolutionNote) =>
      domain.updateIssueStatus(issueId, status, resolutionNote),
    resolveIssue: (issueId, resolutionNote) =>
      domain.updateIssueStatus(issueId, 'resolved', resolutionNote),
    warnUserIssue: (issueId, reason) =>
      domain.warnUserIssue(issueId, reason),
    dismissIssue: (issueId, reason) =>
      domain.dismissIssue(issueId, reason),
  };
}
