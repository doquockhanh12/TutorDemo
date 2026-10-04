import { demoReferenceData } from './demoReferenceData.js';
export const CANONICAL_TUTOR_ID = 'quoc-bao';
export const START_MINUTES = 360;
export const END_MINUTES = 1440;
export const MAX_START = 1320;
export const timetableDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
export const normalizeSessionMinutes = (value) => Number(value) === 90 ? 90 : 45;
export const timeLabel = (minute) => String(Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0');
export function localDateKey(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }
export function weekDates(offset = 0, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
}
export const shortDate = (date) => new Date(date + 'T12:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
export const proposalLabel = (range) => shortDate(range.date) + ' · ' + timeLabel(range.start) + '–' + timeLabel(range.end);
export const latestAllowedStart = (duration) => Math.min(MAX_START, END_MINUTES - duration);
export const snapMinute = (minute, step = 5) => Math.round(minute / step) * step;
const sameDay = (a, b) => a.date === b.date && (!a.tutorId || !b.tutorId || a.tutorId === b.tutorId);
export const overlaps = (a, b) => sameDay(a, b) && a.start < b.end && a.end > b.start;
export const containsRange = (outer, inner) => sameDay(outer, inner) && outer.start <= inner.start && outer.end >= inner.end;
const validDate = (date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && localDateKey(new Date(date + 'T12:00:00')) === date;
const validRange = (range) => validDate(range.date) && Number.isInteger(range.start) && Number.isInteger(range.end) && range.start >= START_MINUTES && range.end <= END_MINUTES && range.start < range.end;
export function normalizeRanges(ranges) {
  return ranges.filter(validRange).map((range) => ({ ...range })).sort((a, b) => (a.tutorId || '').localeCompare(b.tutorId || '') || a.date.localeCompare(b.date) || a.start - b.start);
}
export function mergeAdjacentRanges(ranges) {
  return normalizeRanges(ranges).reduce((result, range) => {
    const previous = result.at(-1);
    if (previous && sameDay(previous, range) && previous.end >= range.start) previous.end = Math.max(previous.end, range.end);
    else result.push({ ...range });
    return result;
  }, []);
}
export function subtractRange(range, occupied) {
  if (!overlaps(range, occupied)) return [{ ...range }];
  const result = [];
  if (range.start < occupied.start) result.push({ ...range, end: occupied.start, id: (range.id || 'range') + '-' + range.start + '-' + occupied.start });
  if (range.end > occupied.end) result.push({ ...range, start: occupied.end, id: (range.id || 'range') + '-' + occupied.end + '-' + range.end });
  return result;
}
export function subtractLessons(ranges, lessons) {
  return lessons.filter((lesson) => lesson.status !== 'cancelled').reduce((free, lesson) => free.flatMap((range) => subtractRange(range, lesson)), normalizeRanges(ranges));
}
// Public projection is an allowlist, not private lesson data hidden by CSS.
export function getBookableRanges(availability, lessons, tutorId) {
  const ranges = tutorId ? availability.filter((range) => range.tutorId === tutorId) : availability;
  return mergeAdjacentRanges(subtractLessons(ranges, lessons)).map(({ id, tutorId: owner, date, start, end }) => ({ id, tutorId: owner, date, start, end }));
}
export function isValidAvailability(candidate, availability = [], lessons = [], excludeId) {
  return validRange(candidate) && candidate.start <= MAX_START && !availability.some((range) => (!excludeId || range.id !== excludeId) && overlaps(range, candidate)) && !lessons.some((lesson) => lesson.status !== 'cancelled' && overlaps(lesson, candidate));
}
export function isValidProposal(proposal, bookableRanges, sessionMinutes, selected = []) {
  return validRange(proposal) && proposal.start <= MAX_START && proposal.end === proposal.start + sessionMinutes && mergeAdjacentRanges(bookableRanges).some((range) => containsRange(range, proposal)) && !selected.some((range) => overlaps(range, proposal));
}
export function isFutureSession(proposal, now = new Date()) {
  if (!validRange(proposal)) return false;
  const start = new Date(proposal.date + 'T00:00:00');
  start.setMinutes(proposal.start);
  return start.getTime() >= now.getTime();
}
export function firstFreeStart(date, duration, availability, lessons, preferred = 480, tutorId = CANONICAL_TUTOR_ID) {
  const starts = [...new Set([preferred, ...Array.from({ length: 169 }, (_, i) => 480 + i * 5), ...Array.from({ length: 24 }, (_, i) => START_MINUTES + i * 5)])];
  return starts.find((start) => start <= latestAllowedStart(duration) && isValidAvailability({ tutorId, date, start, end: start + duration }, availability, lessons)) ?? null;
}
export function rangesOverlapPeriod(ranges, date, start, end) { return ranges.some((range) => overlaps(range, { date, start, end })); }
export function weeklyScheduleRanges(tutor, dates = weekDates()) {
  return mergeAdjacentRanges((tutor.schedule || []).flatMap((range, index) => range.days.map((day) => ({ id: 'static-' + tutor.id + '-' + localDateKey(dates[day]) + '-' + index, tutorId: tutor.id, date: localDateKey(dates[day]), start: Number(range.start.slice(0, 2)) * 60 + Number(range.start.slice(3)), end: Number(range.end.slice(0, 2)) * 60 + Number(range.end.slice(3)) }))));
}
export function selectPublicTutorSchedule(state, tutor, dates = weekDates(), fallbackDuration = 45) {
  const keys = new Set(dates.map(localDateKey));
  const canonical = tutor.id === CANONICAL_TUTOR_ID || Boolean(state.settings?.[tutor.id]);
  const ranges = canonical ? getBookableRanges(state.availability, state.lessons, tutor.id) : weeklyScheduleRanges(tutor, dates);
  return { ranges: ranges.filter((range) => keys.has(range.date)), sessionMinutes: normalizeSessionMinutes(canonical ? state.settings?.[tutor.id]?.sessionMinutes : fallbackDuration) };
}
export function availabilityLabels(ranges) {
  const labels = [];
  for (const [label, start, end] of [['Buổi sáng', 360, 720], ['Buổi chiều', 720, 1020], ['Buổi tối', 1020, 1440]]) {
    if (ranges.some((range) => range.start < end && range.end > start)) labels.push(label);
  }
  if (ranges.some((range) => [0, 6].includes(new Date(range.date + 'T12:00:00').getDay()))) labels.push('Cuối tuần');
  return labels;
}
export const rangesSummary = (ranges) => [...new Set(ranges.map((range) => timeLabel(range.start) + '–' + timeLabel(range.end)))].join(' · ') || 'Chưa có lịch rảnh đã lưu';

// Private legacy definition: date:index cells are read only by this migration.
export function migrateWorkspaceV2(source, sessionMinutes = 45) {
  const lessons = (source.lessons || []).map((lesson) => ({ ...lesson, tutorId: lesson.tutorId || CANONICAL_TUTOR_ID }));
  const cells = [...new Set(source.availability || [])].flatMap((key) => {
    if (typeof key !== 'string') return [];
    const parts = key.split(':');
    if (parts.length !== 2) return [];
    const [date, indexText] = parts;
    const index = Number(indexText);
    if (!validDate(date) || !/^\d+$/.test(indexText || '') || index < 0 || index >= 20) return [];
    const start = 420 + index * 45;
    const range = { id: 'legacy-' + date + '-' + start, tutorId: CANONICAL_TUTOR_ID, date, start, end: start + 45 };
    return lessons.some((lesson) => lesson.status !== 'cancelled' && overlaps(lesson, range)) ? [] : [range];
  });
  return { ...source, version: 3, requests: (source.requests || []).map((request) => ({ ...request })), lessons, availability: mergeAdjacentRanges(cells), settings: { [CANONICAL_TUTOR_ID]: { sessionMinutes: normalizeSessionMinutes(sessionMinutes) } } };
}
// Legacy seeded request proposals remain compatibility data.
export const requestProposals = demoReferenceData.legacyRequestProposals;
export function proposedLessons(request, dates = weekDates()) {
  const legacy = requestProposals[request.id];
  const proposals = Array.isArray(request.proposals) ? request.proposals : legacy ? legacy.days.map((day) => ({ date: localDateKey(dates[day]), start: legacy.start, end: legacy.end })) : [];
  return proposals.map((proposal, index) => ({ id: 'request-' + request.id + '-' + proposal.date + '-' + proposal.start + '-' + index, tutorId: request.tutorId || CANONICAL_TUTOR_ID, requestId: request.id, learnerId: request.learnerId, date: proposal.date, start: proposal.start, end: proposal.end, subject: request.subject, learner: request.learner, place: request.area, sessionFee: request.sessionFee, status: 'confirmed' }));
}
export function acceptanceResult(state, id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request) return { error: 'Không tìm thấy yêu cầu.' };
  if (request.status !== 'pending') return { error: 'Yêu cầu này đã được xử lý.' };
  const lessons = proposedLessons(request);
  if (!lessons.length || lessons.some((lesson) => !validRange(lesson) || lesson.start > MAX_START)) return { error: 'Yêu cầu chưa có khung giờ cụ thể hợp lệ để thêm vào lịch.' };
  if (lessons.some((next, index) => state.lessons.some((existing) => existing.status !== 'cancelled' && overlaps(existing, next)) || lessons.slice(0, index).some((other) => overlaps(other, next)))) return { error: 'Khung giờ đề xuất trùng một buổi dạy hiện có. Yêu cầu vẫn đang chờ.' };
  return { state: { ...state, requests: state.requests.map((item) => item.id === id ? { ...item, status: 'accepted' } : item), lessons: [...state.lessons, ...lessons], availability: subtractLessons(state.availability, lessons) } };
}
export function seedLessons(dates = weekDates()) {
  return demoReferenceData.lessonTemplates.map(({day, ...lesson}) => ({...lesson, date: localDateKey(dates[day])}));
}
