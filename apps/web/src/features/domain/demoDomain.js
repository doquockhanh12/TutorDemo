import { demoReferenceData as fixture } from '../../data/demoReferenceData.js';
import { acceptanceResult, CANONICAL_TUTOR_ID, localDateKey, migrateWorkspaceV2, normalizeRanges, normalizeSessionMinutes, subtractLessons, subtractRange, weekDates, weeklyScheduleRanges, selectPublicTutorSchedule, isValidProposal, isFutureSession } from '../../data/tutorSchedule.js';

export const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';
const APPROVED_TIMETABLE_CLEANUP = '2026-10-04-thursday-math-friday-availability';
// One-time, explicitly approved correction of this dated demo, not a lifecycle rule.
function applyApprovedDemoCleanup(state) {
  if (state.appliedDemoCleanups?.includes(APPROVED_TIMETABLE_CLEANUP)) return state;
  const removed = state.lessons.filter((lesson) => lesson.tutorId === CANONICAL_TUTOR_ID
    && lesson.requestId === 'req-1' && lesson.date === '2026-10-01'
    && lesson.subject === 'Toán lớp 8' && lesson.learner === 'Phụ huynh bé An'
    && lesson.start === 1095 && lesson.end === 1185);
  const removedIds = new Set(removed.map((lesson) => lesson.id));
  return { ...state,
    lessons: state.lessons.filter((lesson) => !removedIds.has(lesson.id)),
    requests: state.requests.map((request) => removed.length && request.id === 'req-1' && request.tutorId === CANONICAL_TUTOR_ID
      ? { ...request, proposals: (request.proposals || []).filter((proposal) => !(proposal.date === '2026-10-01' && proposal.start === 1095 && proposal.end === 1185)) } : request),
    availability: state.availability.flatMap((range) => subtractRange(range,
      { tutorId: CANONICAL_TUTOR_ID, date: '2026-10-02', start: 1080, end: 1320 })),
    appliedDemoCleanups: [...(state.appliedDemoCleanups || []), APPROVED_TIMETABLE_CLEANUP],
  };
}
const legacyStatuses = { 'Chờ phản hồi': 'pending', 'Đã xác nhận': 'accepted', 'Hoàn tất': 'accepted', 'Đã hủy': 'cancelled' };
export function normalizeRequest(request, learnerId = request.learnerId ?? null) {
  return { ...request, learnerId, status: legacyStatuses[request.status] || request.status,
    ...(request.status === 'Hoàn tất' ? { legacyLessonStatus: 'completed' } : {}),
    note: request.note ?? request.goal ?? '', goal: request.goal ?? request.note ?? '',
    subjects: request.subjects || [request.subject].filter(Boolean) };
}
export function addLearnerRequest(state, user, values, now = new Date()) {
  const tutor = state.profiles.find((p) => p.id === values.tutorId);
  if (user?.role !== 'learner' || !tutor) return { error: 'Đăng nhập người học và chọn hồ sơ gia sư hợp lệ.' };
  if (!values.subjects?.length || !values.levels?.length || !values.formats?.length || (values.formats.includes('Tại nhà') && !values.areas?.length)) return { error: 'Vui lòng hoàn thành các lựa chọn trước khi gửi.' };
  const proposals = values.proposals || [];
  if (!proposals.length || proposals.some((p, index) => {
    const schedule = selectPublicTutorSchedule(state, tutor, weekDates(0, new Date(p.date + 'T12:00:00')), tutor.sessionMinutes);
    return !isFutureSession(p, now) || !isValidProposal(p, schedule.ranges, schedule.sessionMinutes, proposals.slice(0, index));
  })) return { error: 'Buổi học đã qua hoặc lịch rảnh đã thay đổi. Vui lòng chọn lại.' };
  let number = state.nextRequestNumber;
  while (state.requests.some((r) => r.id === 'request-' + number)) number++;
  const id = 'request-' + number;
  const request = normalizeRequest({ ...structuredClone(values), id, learnerId: user.id, learner: user.fullName,
    status: 'pending', received: 'Vừa gửi', area: values.areas?.join(', ') || values.format,
    sessionFee: tutor.price });
  return { id, state: { ...state, nextRequestNumber: number + 1, requests: [...state.requests, request] } };
}
export function createDemoState(now = new Date()) {
  const seed = structuredClone(fixture);
  const dates = weekDates(0, now);
  const lessons = [...seed.lessonTemplates.map(({ day, ...lesson }) => ({ ...lesson, date: localDateKey(dates[day]) })), ...(seed.historicalLessons || [])];
  const requests = seed.requests.map(({ proposalTemplate, ...request }) => normalizeRequest({ ...request,
    ...(proposalTemplate ? { proposals: proposalTemplate.days.map((day) => ({ date: localDateKey(dates[day]), start: proposalTemplate.start, end: proposalTemplate.end })) } : {}) }));
  return applyApprovedDemoCleanup({
    version: 1,
    profiles: seed.tutorProfiles,
    requests,
    lessons,
    availability: subtractLessons(weeklyScheduleRanges(seed.tutorProfiles.find((t) => t.id === CANONICAL_TUTOR_ID), dates), lessons),
    settings: Object.fromEntries(seed.tutorProfiles.filter((p) => p.accountId).map((p) => [p.id, { sessionMinutes: p.sessionMinutes }])),
    savedByAccount: Object.fromEntries(seed.learnerProfiles.map((p) => [p.accountId, p.savedTutorIds])),
    nextRequestNumber: 1,
    users: seed.accounts || seed.users || [],
    reviews: seed.reviews || [],
    issues: seed.issues || [],
    appeals: [],
    nextAppealNumber: 1,
  });
}
function read(storage, key) { try { return JSON.parse(storage.getItem(key)); } catch { return null; } }
function reconcileLessonSeed(state) {
  const templates = new Map(fixture.lessonTemplates.map((lesson) => [lesson.id, lesson]));
  const lessons = (state.lessons || []).map((lesson) => {
    const seed = templates.get(lesson.id);
    return lesson.sessionFee == null && Number.isFinite(seed?.sessionFee)
      ? { ...lesson, sessionFee: seed.sessionFee } : lesson;
  });
  const ids = new Set(lessons.map((lesson) => lesson.id));
  for (const history of fixture.historicalLessons || []) {
    if (ids.has(history.id)) continue;
    lessons.push(structuredClone(history));
    ids.add(history.id);
  }

  // Reconcile users
  const userMap = new Map((state.users || []).map((u) => [u.id, u]));
  for (const account of fixture.accounts || []) {
    if (!userMap.has(account.id)) {
      userMap.set(account.id, structuredClone(account));
    } else {
      const u = userMap.get(account.id);
      if (!u.status) u.status = account.status || 'active';
    }
  }

  // Reconcile reviews
  const reviewMap = new Map((state.reviews || []).map((r) => [r.id, r]));
  for (const review of fixture.reviews || []) {
    if (!reviewMap.has(review.id)) {
      reviewMap.set(review.id, structuredClone(review));
    }
  }

  // Reconcile issues
  const issueMap = new Map((state.issues || []).map((i) => [i.id, i]));
  for (const issue of fixture.issues || []) {
    if (!issueMap.has(issue.id)) {
      issueMap.set(issue.id, structuredClone(issue));
    }
  }

  // Reconcile profiles
  const profileMap = new Map((state.profiles || []).map((p) => [p.id, p]));
  for (const profile of fixture.tutorProfiles || []) {
    if (!profileMap.has(profile.id)) {
      profileMap.set(profile.id, structuredClone(profile));
    } else {
      const p = profileMap.get(profile.id);
      if (!p.moderationStatus) p.moderationStatus = profile.moderationStatus || 'approved';
      if (!p.documents && profile.documents) p.documents = structuredClone(profile.documents);
      if (!p.verificationDocuments && profile.verificationDocuments) p.verificationDocuments = structuredClone(profile.verificationDocuments);
      if (!p.verificationDocs && profile.verificationDocs) p.verificationDocs = structuredClone(profile.verificationDocs);
    }
  }

  // Saved availability predates newly reconciled history in older demo state.
  // Keep the free portions; occupied time must never remain bookable/rendered as free.
  return applyApprovedDemoCleanup({
    ...state,
    profiles: [...profileMap.values()],
    appeals: state.appeals || [],
    nextAppealNumber: state.nextAppealNumber || 1,
    users: [...userMap.values()],
    reviews: [...reviewMap.values()],
    issues: [...issueMap.values()],
    lessons,
    availability: subtractLessons(state.availability || [], lessons),
  });
}
export function restoreDemoState(storage, now = new Date()) {
  const current = read(storage, DOMAIN_STORAGE_KEY);
  if (current?.version === 1 && Array.isArray(current.profiles) && Array.isArray(current.requests)) return reconcileLessonSeed(current);
  const state = createDemoState(now);
  // Compatibility inputs below replace fresh arrays; apply their correction after migration.
  delete state.appliedDemoCleanups;
  const profile = read(storage, 'tnm.tutorProfile');
  const workspace = read(storage, 'tnm.tutor.workspace.v3') || (read(storage, 'tnm.tutor.workspace.v2') && migrateWorkspaceV2(read(storage, 'tnm.tutor.workspace.v2'), profile?.sessionMinutes));
  const learner = read(storage, 'tnm.learnerRequests') || [];
  const tutor = workspace?.requests || [...(read(storage, 'tnm.tutorRequests') || []), ...(read(storage, 'tnm.tutor.referenceRequests.v1') || [])];
  const merged = new Map(state.requests.map((r) => [r.id, r]));
  for (const item of learner) merged.set(item.id, normalizeRequest({ ...merged.get(item.id), ...item }, item.learnerId || 'demo-learner'));
  for (const item of tutor) merged.set(item.id, normalizeRequest({ ...merged.get(item.id), ...item, tutorId: item.tutorId || CANONICAL_TUTOR_ID }));
  state.requests = [...merged.values()];
  if (workspace) {
    state.lessons = (workspace.lessons || state.lessons).map((lesson) => ({ ...lesson, tutorId: lesson.tutorId || CANONICAL_TUTOR_ID }));
    state.availability = normalizeRanges(workspace.availability || state.availability);
    state.settings = workspace.settings || state.settings;
  } else {
    const checks = read(storage, 'tnm.tutor.scheduleChecks.v1');
    if (Array.isArray(checks)) {
      const dates = weekDates(0, now); const periods = { morning: [420, 720], afternoon: [720, 1020], evening: [1020, 1320] };
      state.availability = subtractLessons(checks.flatMap((key) => {
        const [period, day] = key.split('-'); const range = periods[period]; const date = dates[Number(day)];
        return range && date ? [{ id: 'daypart-' + key, tutorId: CANONICAL_TUTOR_ID, date: localDateKey(date), start: range[0], end: range[1] }] : [];
      }), state.lessons);
    }
  }
  state.savedByAccount['demo-learner'] = read(storage, 'tnm.savedTutors') || [];
  if (profile) {
    const target = state.profiles.find((t) => t.id === CANONICAL_TUTOR_ID);
    for (const [oldKey, newKey] of Object.entries({ name: 'name', subjects: 'subjects', levels: 'levels', area: 'location', fee: 'price', bio: 'intro' })) {
      if (profile[oldKey] === undefined || JSON.stringify(profile[oldKey]) === JSON.stringify(fixture.legacyTutorProfileDefaults[oldKey])) continue;
      target[newKey] = oldKey === 'subjects' ? String(profile[oldKey]).split(',').map((s) => s.trim()).filter(Boolean) : oldKey === 'fee' ? Number(profile[oldKey]) : profile[oldKey];
    }
    target.areas = [target.location];
    if (!workspace?.settings) state.settings[CANONICAL_TUTOR_ID] = { sessionMinutes: normalizeSessionMinutes(profile.sessionMinutes) };
  }
  return reconcileLessonSeed(state);
}
export function requestIsCompleted(state, request) {
  const lessons = state.lessons.filter((l) => l.requestId === request.id && l.status !== 'cancelled');
  return request.status === 'accepted' && (lessons.length ? lessons.every((l) => l.status === 'completed') : request.legacyLessonStatus === 'completed');
}
export function updateLearnerRequest(state, accountId, id, patch) {
  return { ...state, requests: state.requests.map((request) => {
    if (request.id !== id || request.learnerId !== accountId) return request;
    const next = { ...request };
    if (request.status === 'pending' && patch.status === 'cancelled') next.status = 'cancelled';
    if (requestIsCompleted(state, request) && patch.review) { next.review = patch.review; next.rating = patch.rating; }
    return next;
  }) };
}
export function decideRequest(state, id, status, tutorId) {
  const request = state.requests.find((r) => r.id === id && r.tutorId === tutorId);
  if (!request || request.status !== 'pending') return { error: 'Yêu cầu này không còn chờ phản hồi hoặc không thuộc gia sư.' };
  if (status === 'accepted') return acceptanceResult(state, id);
  if (status !== 'rejected') return { error: 'Trạng thái không hợp lệ.' };
  return { state: { ...state, requests: state.requests.map((r) => r.id === id ? { ...r, status } : r) } };
}
export const canCompleteLesson = (lesson) => ['confirmed', 'upcoming'].includes(lesson?.status);
export function completeDomainLesson(state, tutorId, id) {
  return { ...state, lessons: state.lessons.map((l) => l.id === id && l.tutorId === tutorId && canCompleteLesson(l) ? { ...l, status: 'completed' } : l) };
}

export function approveTutor(state, tutorId) {
  if (!state?.profiles || !tutorId) return state;
  const target = state.profiles.find((p) => p.id === tutorId);
  if (!target) return state;

  const nowIso = new Date().toISOString();
  const updatedProfile = {
    ...target,
    moderationStatus: 'approved',
    status: 'approved',
    rejectionReason: null,
    approvedAt: target.approvedAt || nowIso,
  };

  const accountId = target.accountId || target.id;
  const updatedUsers = state.users
    ? state.users.map((u) => {
        if (u.id !== accountId && u.id !== tutorId) return u;
        return {
          ...u,
          status: 'active',
          suspendedAt: null,
          suspendReason: null,
        };
      })
    : state.users;

  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === tutorId ? updatedProfile : p)),
    ...(updatedUsers ? { users: updatedUsers } : {}),
  };
}

export function rejectTutor(state, tutorId, reason) {
  if (!state?.profiles || !tutorId) return state;
  const target = state.profiles.find((p) => p.id === tutorId);
  if (!target) return state;

  const rejectionReason = (reason && String(reason).trim()) || 'Hồ sơ chưa đạt yêu cầu';
  const updatedProfile = {
    ...target,
    moderationStatus: 'rejected',
    status: 'rejected',
    rejectionReason,
    rejectedAt: new Date().toISOString(),
  };

  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === tutorId ? updatedProfile : p)),
  };
}

export function setTutorSuspension(state, tutorId, isSuspended) {
  if (!state?.profiles || !tutorId) return state;
  const target = state.profiles.find((p) => p.id === tutorId);
  if (!target) return state;

  const nowIso = new Date().toISOString();
  const nextModerationStatus = isSuspended
    ? 'suspended'
    : (target.previousModerationStatus || 'approved');
  const nextStatus = nextModerationStatus;

  const updatedProfile = {
    ...target,
    moderationStatus: nextModerationStatus,
    status: nextStatus,
    ...(isSuspended
      ? {
          previousModerationStatus: target.moderationStatus !== 'suspended'
            ? target.moderationStatus
            : (target.previousModerationStatus || 'approved'),
          suspendedAt: nowIso,
        }
      : {
          suspendedAt: null,
          suspendReason: null,
        }),
  };

  const accountId = target.accountId || target.id;
  const updatedUsers = state.users
    ? state.users.map((u) => {
        if (u.id !== accountId && u.id !== tutorId) return u;
        return {
          ...u,
          status: isSuspended ? 'suspended' : 'active',
          suspendedAt: isSuspended ? (u.suspendedAt || nowIso) : null,
          ...(isSuspended ? {} : { suspendReason: null }),
        };
      })
    : state.users;

  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === tutorId ? updatedProfile : p)),
    ...(updatedUsers ? { users: updatedUsers } : {}),
  };
}

export function setUserSuspension(state, userId, isSuspended) {
  if (!userId) return state;
  const nowIso = new Date().toISOString();

  const updatedUsers = (state.users || []).map((u) => {
    if (u.id !== userId) return u;
    return {
      ...u,
      status: isSuspended ? 'suspended' : 'active',
      suspendedAt: isSuspended ? (u.suspendedAt || nowIso) : null,
      ...(isSuspended ? {} : { suspendReason: null }),
    };
  });

  const updatedProfiles = (state.profiles || []).map((p) => {
    if (p.accountId !== userId && p.id !== userId) return p;
    if (isSuspended) {
      return {
        ...p,
        moderationStatus: 'suspended',
        status: 'suspended',
        previousModerationStatus: p.moderationStatus !== 'suspended'
          ? p.moderationStatus
          : (p.previousModerationStatus || 'approved'),
        suspendedAt: nowIso,
      };
    }
    return {
      ...p,
      moderationStatus: p.previousModerationStatus || 'approved',
      status: p.previousModerationStatus || 'approved',
      suspendedAt: null,
      suspendReason: null,
    };
  });

  return {
    ...state,
    users: updatedUsers,
    profiles: updatedProfiles,
  };
}

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

export function updateIssueStatus(state, issueId, status, resolutionNote) {
  if (!state?.issues || !issueId) return state;
  const target = state.issues.find((i) => i.id === issueId);
  if (!target) return state;

  const nowIso = new Date().toISOString();
  const isResolved = status === 'resolved';

  const updatedIssue = {
    ...target,
    status,
    ...(resolutionNote !== undefined ? { resolutionNote: String(resolutionNote).trim() } : {}),
    resolvedAt: isResolved ? (target.resolvedAt || nowIso) : null,
    updatedAt: nowIso,
    ...(isResolved && !target.resolvedBy ? { resolvedBy: 'Quản trị viên' } : {}),
  };

  return {
    ...state,
    issues: state.issues.map((i) => (i.id === issueId ? updatedIssue : i)),
  };
}

export function warnUserIssue(state, issueId, warningReason) {
  if (!state?.issues || !issueId) return state;
  const targetIssue = state.issues.find((i) => i.id === issueId);
  if (!targetIssue) return state;

  const nowIso = new Date().toISOString();
  const reasonText = String(warningReason || '').trim() || 'Vi phạm chính sách thỏa thuận buổi học';

  // Find target user
  const targetUserId = targetIssue.targetUser?.id || targetIssue.targetUserId || targetIssue.relatedTutorId || targetIssue.tutorId;
  const users = state.users || [];
  const profiles = state.profiles || [];

  const existingUser = users.find((u) => u.id === targetUserId || (u.tutorProfileId && u.tutorProfileId === targetUserId));

  let updatedUsers = users;
  let updatedProfiles = profiles;

  if (existingUser) {
    const currentWarnings = existingUser.warnings || [];
    const newWarning = {
      id: `warn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      issueId,
      reason: reasonText,
      warnedAt: nowIso,
      warnedBy: 'Quản trị viên',
    };
    const nextWarningCount = (existingUser.warningCount || currentWarnings.length || 0) + 1;
    // Rule: quá 3 lần sẽ bị khóa (tức lần vi phạm thứ 4 trở đi: nextWarningCount > 3)
    const shouldSuspend = nextWarningCount > 3;

    const updatedUser = {
      ...existingUser,
      warningCount: nextWarningCount,
      warnings: [...currentWarnings, newWarning],
      ...(shouldSuspend
        ? {
            status: 'suspended',
            suspendedReason: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên do vượt quá 3 lần bị cảnh cáo tranh chấp.',
            suspendedAt: nowIso,
          }
        : {}),
    };

    updatedUsers = users.map((u) => (u.id === existingUser.id ? updatedUser : u));

    if (shouldSuspend && (existingUser.role === 'tutor' || existingUser.tutorProfileId)) {
      const profileId = existingUser.tutorProfileId || existingUser.id;
      updatedProfiles = profiles.map((p) =>
        p.id === profileId
          ? {
              ...p,
              moderationStatus: 'suspended',
              status: 'suspended',
              suspendedReason: updatedUser.suspendedReason,
              suspendedAt: nowIso,
            }
          : p
      );
    }
  }

  const updatedIssue = {
    ...targetIssue,
    status: 'resolved',
    resolutionAction: 'warning_issued',
    resolutionNote: reasonText,
    resolvedAt: nowIso,
    updatedAt: nowIso,
    resolvedBy: 'Quản trị viên',
    warnedUserId: existingUser?.id || targetUserId,
  };

  return {
    ...state,
    users: updatedUsers,
    profiles: updatedProfiles,
    issues: state.issues.map((i) => (i.id === issueId ? updatedIssue : i)),
  };
}

export function dismissIssue(state, issueId, rejectionReason) {
  if (!state?.issues || !issueId) return state;
  const targetIssue = state.issues.find((i) => i.id === issueId);
  if (!targetIssue) return state;

  const nowIso = new Date().toISOString();
  const reasonText = String(rejectionReason || '').trim() || 'Chưa đủ chứng cứ xác thực khiếu nại';

  const updatedIssue = {
    ...targetIssue,
    status: 'dismissed',
    resolutionAction: 'dismissed_unverified',
    resolutionNote: reasonText,
    reporterNotice: reasonText,
    resolvedAt: nowIso,
    dismissedAt: nowIso,
    updatedAt: nowIso,
    resolvedBy: 'Quản trị viên',
  };

  return {
    ...state,
    issues: state.issues.map((i) => (i.id === issueId ? updatedIssue : i)),
  };
}

