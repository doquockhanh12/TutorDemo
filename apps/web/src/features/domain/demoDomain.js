import { demoReferenceData as fixture } from '../../data/demoReferenceData.js';
import { acceptanceResult, classFromRequest, proposedLessons, CANONICAL_TUTOR_ID, localDateKey, migrateWorkspaceV2, normalizeRanges, normalizeSessionMinutes, subtractLessons, subtractRange, weekDates, weeklyScheduleRanges, selectPublicTutorSchedule, isValidFlexibleProposal, isFutureSession } from '../../data/tutorSchedule.js';

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
const legacyStatuses = {
  'Chờ phản hồi': 'pending',
  'Đã xác nhận': 'accepted',
  'Hoàn tất': 'accepted',
  'Đã hủy': 'cancelled',
  pending_learner_confirmation: 'accepted',
  needs_revision: 'pending',
};
export const MAX_REVIEW_WORDS = 200;
export function countWords(text = '') {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}
export function validateWordLimit(text = '', maxWords = MAX_REVIEW_WORDS) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return 'Vui lòng nhập nội dung.';
  if (countWords(trimmed) > maxWords) {
    return `Nội dung không được vượt quá ${maxWords} từ.`;
  }
  return '';
}
const seedRequestCreatedAt = new Map(
  (fixture.requests || [])
    .filter((item) => item?.id && (item.createdAt || item.created_at))
    .map((item) => [item.id, item.createdAt || item.created_at])
);
function requestTimestamp(request) {
  const raw = request?.createdAt ?? request?.created_at ?? seedRequestCreatedAt.get(request?.id);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Number.POSITIVE_INFINITY;
}
export function sortRequestsFifo(requests = []) {
  return [...requests].sort((a, b) => {
    const timeA = requestTimestamp(a);
    const timeB = requestTimestamp(b);
    if (timeA !== timeB) return timeA - timeB;
    return 0;
  });
}
export function normalizeRequest(request, learnerId = request.learnerId ?? null) {
  const resolvedStatus = request.status === 'needs_revision' && request.legacyAcceptedStatus
    ? 'accepted'
    : (legacyStatuses[request.status] || request.status);
  const { reconciliationError: _reconciliationError, legacyAcceptedStatus: _legacyAcceptedStatus, ...rest } = request;
  return { ...rest, learnerId, status: resolvedStatus,
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
    return !isFutureSession(p, now) || !isValidFlexibleProposal(p, schedule.ranges, proposals.slice(0, index));
  })) return { error: 'Buổi học đã qua hoặc lịch rảnh đã thay đổi. Vui lòng chọn lại.' };
  let number = state.nextRequestNumber;
  while (state.requests.some((r) => r.id === 'request-' + number)) number++;
  const id = 'request-' + number;
  const request = normalizeRequest({ ...structuredClone(values), id, learnerId: user.id, learner: user.fullName,
    status: 'pending', received: 'Vừa gửi', createdAt: values.createdAt || values.created_at || now.toISOString(),
    area: values.areas?.join(', ') || values.format,
    sessionFee: tutor.price });
  return { id, state: { ...state, nextRequestNumber: number + 1, requests: [...state.requests, request] } };
}
export function createDemoState(now = new Date()) {
  const seed = structuredClone(fixture);
  const dates = weekDates(0, now);
  const lessons = [...seed.lessonTemplates.map(({ day, ...lesson }) => ({ ...lesson, date: localDateKey(dates[day]) })), ...(seed.historicalLessons || [])];
  const requests = seed.requests.map(({ proposalTemplate, ...request }) => normalizeRequest({ ...request,
    ...(proposalTemplate ? { proposals: proposalTemplate.days.map((day) => ({ date: localDateKey(dates[day]), start: proposalTemplate.start, end: proposalTemplate.end })) } : {}) }));
  return reconcileAcceptedClasses(applyApprovedDemoCleanup({
    version: 1,
    profiles: seed.tutorProfiles,
    requests,
    classes: [],
    lessons,
    availability: subtractLessons(weeklyScheduleRanges(seed.tutorProfiles.find((t) => t.id === CANONICAL_TUTOR_ID), dates), lessons),
    settings: Object.fromEntries(seed.tutorProfiles.filter((p) => p.accountId).map((p) => [p.id, { sessionMinutes: p.sessionMinutes }])),
    savedByAccount: Object.fromEntries(seed.learnerProfiles.map((p) => [p.accountId, p.savedTutorIds])),
    nextRequestNumber: 1,
    users: seed.accounts || seed.users || [],
    reviews: seed.reviews || [],
    issues: seed.issues || [],
    appeals: [],
    subjectRequests: [],
    nextAppealNumber: 1,
  }));
}
function read(storage, key) { try { return JSON.parse(storage.getItem(key)); } catch { return null; } }
function reconcileAcceptedClasses(state) {
  const seenRequests = new Set();
  const seenClassIds = new Set();
  const classes = (state.classes || []).filter((item) => {
    if (!item?.requestId || !item.id || seenRequests.has(item.requestId) || seenClassIds.has(item.id)) return false;
    seenRequests.add(item.requestId);
    seenClassIds.add(item.id);
    return true;
  });
  const normalizedRequests = (state.requests || []).map((item) => {
    if (!item || typeof item !== 'object') return item;
    const nextStatus = item.status === 'pending_learner_confirmation' || (item.status === 'needs_revision' && item.legacyAcceptedStatus)
      ? 'accepted'
      : item.status === 'needs_revision'
        ? 'pending'
        : item.status;
    if (nextStatus === item.status && !('reconciliationError' in item) && !('legacyAcceptedStatus' in item)) {
      return item;
    }
    const cleaned = { ...item, status: nextStatus };
    delete cleaned.reconciliationError;
    delete cleaned.legacyAcceptedStatus;
    return cleaned;
  });
  let next = { ...state, classes, requests: normalizedRequests };
  for (const request of normalizedRequests) {
    if (request?.status !== 'accepted') continue;
    const existingClass = next.classes.find((item) => item.requestId === request.id);
    if (existingClass) {
      const mismatch = existingClass.tutorId !== request.tutorId || (existingClass.learnerId && request.learnerId && existingClass.learnerId !== request.learnerId);
      if (mismatch) {
        next = {
          ...next,
          classes: next.classes.filter((item) => item.id !== existingClass.id),
          requests: next.requests.map((item) => item.id === request.id && item.classId === existingClass.id ? { ...item, classId: null } : item),
        };
      } else if (request.classId !== existingClass.id) {
        next = {
          ...next,
          requests: next.requests.map((item) => item.id === request.id ? { ...item, status: 'accepted', classId: existingClass.id } : item),
        };
      }
      continue;
    }
    const linked = next.lessons.filter((lesson) => lesson.requestId === request.id);
    if (linked.length) {
      const classId = request.classId || request.id;
      const invalidLesson = linked.some((lesson) => lesson.tutorId !== request.tutorId
        || (lesson.learnerId && request.learnerId && lesson.learnerId !== request.learnerId)
        || (lesson.classId && lesson.classId !== classId)
        || !/^\d{4}-\d{2}-\d{2}$/.test(lesson.date || '')
        || !Number.isFinite(lesson.start) || !Number.isFinite(lesson.end) || lesson.end <= lesson.start);
      if (invalidLesson || next.classes.some((item) => item.id === classId)) {
        continue;
      }
      next = { ...next,
        classes: [...next.classes, classFromRequest(request, linked)],
        requests: next.requests.map((item) => item.id === request.id ? { ...item, status: 'accepted', classId } : item),
        lessons: next.lessons.map((lesson) => lesson.requestId === request.id && !lesson.classId ? { ...lesson, classId } : lesson),
      };
      continue;
    }
    // A previous acceptance can become a class if the stored terms are complete.
    const prepared = { ...next, requests: next.requests.map((item) => item.id === request.id ? { ...item, status: 'pending' } : item) };
    const result = acceptanceResult(prepared, request.id);
    if (result.state) next = result.state;
  }
  return next;
}
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
  return reconcileAcceptedClasses(applyApprovedDemoCleanup({
    ...state,
    profiles: [...profileMap.values()],
    appeals: state.appeals || [],
    subjectRequests: state.subjectRequests || [],
    nextAppealNumber: state.nextAppealNumber || 1,
    users: [...userMap.values()],
    reviews: [...reviewMap.values()],
    issues: [...issueMap.values()],
    lessons,
    availability: subtractLessons(state.availability || [], lessons),
  }));
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
  const lessons = state.lessons.filter((l) => l.requestId === request.id);
  return request.status === 'accepted' && (lessons.length ? lessons.every((l) => l.status === 'completed') : request.legacyLessonStatus === 'completed');
}
export function updateLearnerRequest(state, accountId, id, patch) {
  return { ...state, requests: state.requests.map((request) => {
    if (request.id !== id || request.learnerId !== accountId) return request;
    const next = { ...request };
    if (request.status === 'pending' && patch.status === 'cancelled') next.status = 'cancelled';
    if (requestIsCompleted(state, request) && patch.review) {
      const trimmedReview = String(patch.review).trim();
      if (trimmedReview && countWords(trimmedReview) <= MAX_REVIEW_WORDS) {
        next.review = trimmedReview;
        next.rating = patch.rating;
      }
    }
    return next;
  }) };
}
export function decideRequest(state, id, status, tutorId) {
  const request = state.requests.find((r) => r.id === id && r.tutorId === tutorId);
  if (!request) return { error: 'Yêu cầu này không thuộc gia sư.' };
  if (status === 'accepted') return acceptanceResult(state, id);
  if (request.status !== 'pending') return { error: 'Yêu cầu này không còn chờ phản hồi.' };
  if (status !== 'rejected') return { error: 'Trạng thái không hợp lệ.' };
  return { state: { ...state, requests: state.requests.map((r) => r.id === id ? { ...r, status } : r) } };
}
export function confirmLearnerRequest(state, accountId, id) {
  void state; void accountId; void id;
  return { error: 'Người học không cần xác nhận lần hai. Gia sư nhận lớp từ yêu cầu hợp lệ.' };
}
export const canCompleteLesson = (lesson) => ['confirmed', 'upcoming'].includes(lesson?.status);
export function completeDomainLesson(state, tutorId, id) {
  return { ...state, lessons: state.lessons.map((l) => l.id === id && l.tutorId === tutorId && canCompleteLesson(l) ? { ...l, status: 'completed' } : l) };
}

export function updateClassStatus(state, tutorId, classId, nextStatus = 'completed') {
  if (!state || !tutorId || !classId || !['completed', 'cancelled'].includes(nextStatus)) return state;
  const request = (state.requests || []).find((r) => (r.id === classId || r.classId === classId) && r.tutorId === tutorId);
  const existingClass = (state.classes || []).find((c) => (c.id === classId || c.requestId === classId) && c.tutorId === tutorId);
  if (!request && !existingClass) return state;

  // Do not allow reverting an already completed or cancelled class
  const currentStatus = existingClass?.classStatus || request?.classStatus;
  if (currentStatus === 'completed' || currentStatus === 'cancelled') return state;

  const targetRequestId = existingClass?.requestId || request?.id || classId;
  const targetClassId = existingClass?.id || request?.classId || classId;

  const updatedClasses = existingClass
    ? (state.classes || []).map((c) => (c.id === existingClass.id ? { ...c, classStatus: nextStatus } : c))
    : [
        ...(state.classes || []),
        {
          id: targetClassId,
          requestId: targetRequestId,
          tutorId,
          learnerId: request?.learnerId ?? null,
          learner: request?.learner || 'Học viên',
          subject: request?.subject || 'Môn học',
          format: request?.format || request?.formats?.join(', ') || 'Online',
          sessionFee: request?.sessionFee ?? null,
          startDate: request?.proposals?.[0]?.date || null,
          lessonIds: [],
          classStatus: nextStatus,
        },
      ];

  const updatedRequests = (state.requests || []).map((r) =>
    r.id === targetRequestId
      ? {
          ...r,
          classId: r.classId || targetClassId,
          classStatus: nextStatus,
          ...(nextStatus === 'completed' ? { legacyLessonStatus: 'completed' } : {}),
        }
      : r
  );

  const updatedLessons =
    nextStatus === 'completed'
      ? (state.lessons || []).map((lesson) => {
          const belongsToClass =
            lesson.tutorId === tutorId &&
            (lesson.classId === targetClassId || lesson.requestId === targetRequestId);
          return belongsToClass ? { ...lesson, status: 'completed' } : lesson;
        })
      : state.lessons;

  return {
    ...state,
    classes: updatedClasses,
    requests: updatedRequests,
    lessons: updatedLessons,
  };
}

export function saveClassTutorNotes(state, tutorId, classId, tutorNotes) {
  if (!state || !tutorId || !classId) return state;
  const cleanedNotes = String(tutorNotes ?? '');
  const updatedAt = new Date().toISOString();
  const request = (state.requests || []).find((r) => (r.id === classId || r.classId === classId) && r.tutorId === tutorId);
  const existingClass = (state.classes || []).find((c) => (c.id === classId || c.requestId === classId) && c.tutorId === tutorId);
  if (!request && !existingClass) return state;

  const targetRequestId = existingClass?.requestId || request?.id || classId;
  const targetClassId = existingClass?.id || request?.classId || classId;

  const updatedClasses = existingClass
    ? (state.classes || []).map((c) => (c.id === existingClass.id ? { ...c, tutorNotes: cleanedNotes, tutorNotesUpdatedAt: updatedAt } : c))
    : [
        ...(state.classes || []),
        {
          id: targetClassId,
          requestId: targetRequestId,
          tutorId,
          learnerId: request?.learnerId ?? null,
          learner: request?.learner || 'Học viên',
          subject: request?.subject || 'Môn học',
          format: request?.format || request?.formats?.join(', ') || 'Online',
          sessionFee: request?.sessionFee ?? null,
          startDate: request?.proposals?.[0]?.date || null,
          lessonIds: [],
          tutorNotes: cleanedNotes,
          tutorNotesUpdatedAt: updatedAt,
        },
      ];

  const updatedRequests = (state.requests || []).map((r) =>
    r.id === targetRequestId
      ? { ...r, classId: r.classId || targetClassId, tutorNotes: cleanedNotes, tutorNotesUpdatedAt: updatedAt }
      : r
  );

  return {
    ...state,
    classes: updatedClasses,
    requests: updatedRequests,
  };
}

export function addClassSessionLog(state, tutorId, classId, values = {}) {
  if (!state || !tutorId || !classId) return { error: 'Không tìm thấy thông tin lớp học.' };
  const existingClass = (state.classes || []).find((c) => (c.id === classId || c.requestId === classId) && c.tutorId === tutorId);
  const request = (state.requests || []).find((r) => (r.id === classId || r.classId === classId || r.id === existingClass?.requestId) && r.tutorId === tutorId);
  if (!existingClass && !request) return { error: 'Không tìm thấy lớp học thuộc gia sư.' };

  const date = String(values.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Vui lòng chọn ngày học hợp lệ.' };
  const year = Number(date.slice(0, 4));
  if (year < 1900 || year > 2100) return { error: 'Năm của buổi học phải nằm trong khoảng 1900 – 2100.' };

  const start = Number.isFinite(Number(values.start)) ? Number(values.start) : 1080;
  const end = Number.isFinite(Number(values.end)) ? Number(values.end) : start + 90;
  if (start < 0 || end > 1440 || end <= start) return { error: 'Khung giờ buổi học không hợp lệ.' };

  const attendanceStatus = ['completed', 'upcoming', 'confirmed', 'cancelled'].includes(values.status)
    ? values.status
    : 'completed';
  const notes = String(values.notes ?? '').trim();

  const targetClassId = existingClass?.id || request?.classId || classId;
  const targetRequestId = existingClass?.requestId || request?.id || classId;
  const newLesson = {
    id: `session-${targetClassId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tutorId,
    classId: targetClassId,
    requestId: targetRequestId,
    learnerId: existingClass?.learnerId ?? request?.learnerId ?? null,
    learner: existingClass?.learner || request?.learner || 'Học viên',
    subject: existingClass?.subject || request?.subject || 'Môn học',
    place: request?.area || existingClass?.format || request?.format || 'Online',
    format: existingClass?.format || request?.format || 'Online',
    sessionFee: existingClass?.sessionFee ?? request?.sessionFee ?? 200000,
    date,
    start,
    end,
    status: attendanceStatus,
    notes,
  };

  const updatedLessons = [...(state.lessons || []), newLesson];
  const classLessons = updatedLessons.filter(
    (l) => l.tutorId === tutorId && (l.classId === targetClassId || l.requestId === targetRequestId)
  );
  const allCompleted = classLessons.length > 0 && classLessons.every((l) => l.status === 'completed');
  const nextClassStatus = allCompleted ? 'completed' : 'ongoing';

  return {
    lesson: newLesson,
    state: {
      ...state,
      lessons: updatedLessons,
      classes: (state.classes || []).map((c) =>
        (c.id === targetClassId || c.requestId === targetRequestId) && c.tutorId === tutorId && c.classStatus !== 'cancelled'
          ? { ...c, classStatus: nextClassStatus }
          : c
      ),
      requests: (state.requests || []).map((r) =>
        (r.id === targetRequestId || r.classId === targetClassId) && r.tutorId === tutorId && r.classStatus !== 'cancelled'
          ? { ...r, classStatus: nextClassStatus, legacyLessonStatus: allCompleted ? 'completed' : null }
          : r
      ),
    },
  };
}

export function updateClassSessionAttendance(state, tutorId, lessonId, patch = {}) {
  if (!state || !tutorId || !lessonId) return state;
  const targetLesson = (state.lessons || []).find((l) => l.id === lessonId && l.tutorId === tutorId);
  const updatedLessons = (state.lessons || []).map((lesson) => {
    if (lesson.id !== lessonId || lesson.tutorId !== tutorId) return lesson;
    return {
      ...lesson,
      ...(patch.status && ['completed', 'upcoming', 'confirmed', 'cancelled'].includes(patch.status)
        ? { status: patch.status }
        : {}),
      ...(patch.notes !== undefined ? { notes: String(patch.notes) } : {}),
      ...(patch.classId ? { classId: patch.classId } : {}),
      ...(patch.requestId ? { requestId: patch.requestId } : {}),
    };
  });

  const targetClassId = patch.classId || targetLesson?.classId || targetLesson?.requestId;
  const targetRequestId = patch.requestId || targetLesson?.requestId || targetLesson?.classId;
  const classLessons = updatedLessons.filter(
    (l) => l.tutorId === tutorId && (l.classId === targetClassId || l.requestId === targetRequestId)
  );
  const allCompleted = classLessons.length > 0 && classLessons.every((l) => l.status === 'completed');
  const nextClassStatus = allCompleted ? 'completed' : 'ongoing';

  return {
    ...state,
    lessons: updatedLessons,
    classes: (state.classes || []).map((c) =>
      (c.id === targetClassId || c.requestId === targetRequestId) && c.tutorId === tutorId && c.classStatus !== 'cancelled'
        ? { ...c, classStatus: nextClassStatus }
        : c
    ),
    requests: (state.requests || []).map((r) =>
      (r.id === targetRequestId || r.classId === targetClassId) && r.tutorId === tutorId && r.classStatus !== 'cancelled'
        ? { ...r, classStatus: nextClassStatus, legacyLessonStatus: allCompleted ? 'completed' : null }
        : r
    ),
  };
}

export function deleteClassSessionLog(state, tutorId, lessonId) {
  if (!state || !tutorId || !lessonId) return state;
  const targetLesson = (state.lessons || []).find((l) => l.id === lessonId && l.tutorId === tutorId);
  if (!targetLesson) return state;

  const updatedLessons = (state.lessons || []).filter(
    (lesson) => !(lesson.id === lessonId && lesson.tutorId === tutorId)
  );

  return {
    ...state,
    lessons: updatedLessons,
  };
}

export function applyPublicClassPost(state, tutorId, post) {
  if (!state || !tutorId || !post?.id) return { error: 'Thông tin lớp học không hợp lệ.' };
  const existing = (state.classes || []).find((c) => c.id === post.id || c.requestId === post.id);
  if (existing) return { classId: existing.id, state };

  const rawProposals = Array.isArray(post.proposals) ? post.proposals : [];
  const createdLessons = rawProposals.map((proposal, index) => ({
    id: `pub-lesson-${post.id}-${proposal.date}-${proposal.start}-${index}`,
    tutorId,
    classId: post.id,
    requestId: post.id,
    learnerId: null,
    learner: post.learner || 'Học viên',
    subject: post.title || post.subject || 'Môn học',
    place: post.area || post.format || 'Online',
    format: post.format || 'Tại nhà',
    sessionFee: post.sessionFee ?? 200000,
    date: proposal.date,
    start: proposal.start,
    end: proposal.end,
    status: 'upcoming',
    notes: '',
  }));

  const newClass = {
    id: post.id,
    requestId: post.id,
    tutorId,
    learnerId: null,
    learner: post.learner || 'Học viên',
    parent: post.parent || null,
    phone: post.phone || '0904 512 889',
    subject: post.title || post.subject || 'Môn học',
    level: post.level || 'THCS / THPT',
    area: post.area || 'TP.HCM',
    format: post.format || 'Tại nhà',
    schedule: post.schedule || 'Theo lịch đã chọn',
    goal: post.note || '',
    sessionFee: post.sessionFee ?? 200000,
    startDate: createdLessons[0]?.date || new Date().toISOString().slice(0, 10),
    lessonIds: createdLessons.map((l) => l.id),
    classStatus: 'ongoing',
    isPublicPost: true,
  };

  return {
    classId: newClass.id,
    state: {
      ...state,
      classes: [...(state.classes || []), newClass],
      lessons: [...(state.lessons || []), ...createdLessons],
      availability: subtractLessons(state.availability || [], createdLessons),
    },
  };
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

