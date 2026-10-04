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
  if (!values.subjects?.length || !values.levels?.length || !values.formats?.length || !values.goal?.trim() || (values.formats.includes('Tại nhà') && !values.areas?.length)) return { error: 'Vui lòng hoàn thành các lựa chọn trước khi gửi.' };
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
  return applyApprovedDemoCleanup({ version: 1, profiles: seed.tutorProfiles, requests, lessons,
    availability: subtractLessons(weeklyScheduleRanges(seed.tutorProfiles.find((t) => t.id === CANONICAL_TUTOR_ID), dates), lessons),
    settings: Object.fromEntries(seed.tutorProfiles.filter((p) => p.accountId).map((p) => [p.id, { sessionMinutes: p.sessionMinutes }])),
    savedByAccount: Object.fromEntries(seed.learnerProfiles.map((p) => [p.accountId, p.savedTutorIds])), nextRequestNumber: 1 });
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
  // Saved availability predates newly reconciled history in older demo state.
  // Keep the free portions; occupied time must never remain bookable/rendered as free.
  return applyApprovedDemoCleanup({ ...state, lessons, availability: subtractLessons(state.availability || [], lessons) });
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
