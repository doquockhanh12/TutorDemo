import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_TUTOR_ID,
  START_MINUTES,
  END_MINUTES,
  latestAllowedStart,
  timeLabel,
  overlaps,
  mergeAdjacentRanges,
  subtractRange,
  subtractLessons,
  getBookableRanges,
  isValidAvailability,
  isValidProposal,
  migrateWorkspaceV2,
  selectPublicTutorSchedule,
  acceptanceResult,
  proposedLessons,
  weekDates,
} from './tutorSchedule.js';

const monday = '2026-10-05';
const tuesday = '2026-10-06';
const range = (start, end, extra = {}) => ({ tutorId: CANONICAL_TUTOR_ID, date: monday, start, end, ...extra });

test('timeline spans 06:00 to 24:00 and the latest start is 22:00 for both session lengths', () => {
  assert.equal(START_MINUTES, 360);
  assert.equal(END_MINUTES, 1440);
  assert.equal(latestAllowedStart(45), 1320);
  assert.equal(latestAllowedStart(90), 1320);
  assert.equal(timeLabel(1410), '23:30');
});

test('overlap is strict at adjacent boundaries and scoped by date and tutor', () => {
  assert.equal(overlaps(range(1080, 1170), range(1170, 1260)), false);
  assert.equal(overlaps(range(1080, 1171), range(1170, 1260)), true);
  assert.equal(overlaps(range(1080, 1170), range(1080, 1170, { date: tuesday })), false);
  assert.equal(overlaps(range(1080, 1170), range(1080, 1170, { tutorId: 'another-tutor' })), false);
});

test('adjacent and overlapping ranges merge while inputs remain unchanged', () => {
  const input = [range(600, 660), range(630, 690), range(690, 720)];
  const before = structuredClone(input);
  assert.deepEqual(mergeAdjacentRanges(input), [range(600, 720)]);
  assert.deepEqual(input, before);
});

test('ranges on different dates or tutor owners remain separate', () => {
  assert.deepEqual(mergeAdjacentRanges([
    range(600, 660),
    range(660, 720, { date: tuesday }),
    range(660, 720, { tutorId: 'another-tutor' }),
  ]), [range(660, 720, { tutorId: 'another-tutor' }), range(600, 660), range(660, 720, { date: tuesday })]);
});

test('availability permits a 22:00 start ending at 23:30 and rejects 22:05 or an end past 24:00', () => {
  assert.equal(isValidAvailability(range(1320, 1410)), true);
  assert.equal(isValidAvailability(range(1325, 1415)), false);
  assert.equal(isValidAvailability(range(1320, 1445)), false);
});

test('subtraction clips an overlapping lesson from either side', () => {
  assert.deepEqual(subtractRange(range(600, 720), range(660, 780)), [range(600, 660, { id: 'range-600-660' })]);
  assert.deepEqual(subtractRange(range(600, 720), range(540, 660)), [range(660, 720, { id: 'range-660-720' })]);
});

test('subtraction removes equal or fully covered ranges and preserves disjoint ranges', () => {
  assert.deepEqual(subtractRange(range(600, 720), range(600, 720)), []);
  assert.deepEqual(subtractRange(range(600, 720), range(570, 750)), []);
  assert.deepEqual(subtractRange(range(600, 720), range(720, 780)), [range(600, 720)]);
});

test('lessons split availability, preserve outside pieces, and ignore cancelled lessons', () => {
  const availability = [range(600, 780)];
  const result = subtractLessons(availability, [range(660, 720, { id: 'lesson-1', status: 'confirmed' })]);
  assert.deepEqual(result, [range(600, 660, { id: 'range-600-660' }), range(720, 780, { id: 'range-720-780' })]);
  assert.deepEqual(subtractLessons(availability, [range(660, 720, { status: 'cancelled' })]), availability);
  assert.deepEqual(availability, [range(600, 780)]);
});

test('a 19:00–20:30 lesson subtracts from saved 18:00–21:00 availability', () => {
  assert.deepEqual(subtractLessons(
    [range(1080, 1260, { id: 'evening-availability' })],
    [range(1140, 1230, { id: 'evening-lesson', status: 'confirmed' })],
  ), [
    range(1080, 1140, { id: 'evening-availability-1080-1140' }),
    range(1230, 1260, { id: 'evening-availability-1230-1260' }),
  ]);
});

test('public bookable ranges subtract lessons and expose only allowlisted scheduling fields', () => {
  const availability = [range(1080, 1200, { learner: 'Private Name', note: 'private note', phone: '0900000000' })];
  const lessons = [range(1125, 1170, { id: 'lesson-1', status: 'confirmed', learner: 'Booked Learner', place: 'Home address' })];
  const publicRanges = getBookableRanges(availability, lessons, CANONICAL_TUTOR_ID);
  assert.deepEqual(publicRanges, [
    { id: 'range-1080-1125', tutorId: CANONICAL_TUTOR_ID, date: monday, start: 1080, end: 1125 },
    { id: 'range-1170-1200', tutorId: CANONICAL_TUTOR_ID, date: monday, start: 1170, end: 1200 },
  ]);
  assert.deepEqual(Object.keys(publicRanges[0]).sort(), ['date', 'end', 'id', 'start', 'tutorId']);
});

test('v2 migration coalesces adjacent cells, retains gaps, and drops cells occupied by lessons', () => {
  const source = {
    requests: [{ id: 'req-1', status: 'accepted', note: 'keep request state' }],
    lessons: [{ id: 'lesson-1', date: monday, start: 600, end: 645, learner: 'Learner', status: 'confirmed' }],
    availability: [`${monday}:0`, `${monday}:1`, `${monday}:3`, `${monday}:4`, `${monday}:3`],
    marker: 'preserved',
  };
  const before = structuredClone(source);
  const migrated = migrateWorkspaceV2(source, 90);
  assert.equal(migrated.version, 3);
  assert.deepEqual(migrated.availability, [
    range(420, 510, { id: `legacy-${monday}-420` }),
    range(555, 600, { id: `legacy-${monday}-555` }),
  ]);
  assert.deepEqual(migrated.requests, source.requests);
  assert.equal(migrated.lessons[0].id, 'lesson-1');
  assert.equal(migrated.lessons[0].start, 600);
  assert.equal(migrated.lessons[0].end, 645);
  assert.equal(migrated.lessons[0].tutorId, CANONICAL_TUTOR_ID);
  assert.equal(migrated.settings[CANONICAL_TUTOR_ID].sessionMinutes, 90);
  assert.equal(migrated.marker, 'preserved');
  assert.deepEqual(source, before);
});

test('v2 migration ignores malformed cell keys and defaults unsupported session length to 45', () => {
  const migrated = migrateWorkspaceV2({ requests: [], lessons: [], availability: [
    `${monday}:0`, `${monday}:20`, `${monday}:-1`, `${monday}:1:extra`, '2026-02-30:0', null,
  ] }, 60);
  assert.deepEqual(migrated.availability, [range(420, 465, { id: `legacy-${monday}-420` })]);
  assert.equal(migrated.settings[CANONICAL_TUTOR_ID].sessionMinutes, 45);
});

test('v2 migration subtracts booked cells without mutating source lessons or requests', () => {
  const source = {
    requests: [{ id: 'req-1', status: 'pending' }],
    lessons: [{ id: 'booked', date: monday, start: 465, end: 510, status: 'confirmed' }],
    availability: [`${monday}:0`, `${monday}:1`, `${monday}:2`],
  };
  const migrated = migrateWorkspaceV2(source);
  assert.deepEqual(migrated.availability, [range(420, 465, { id: `legacy-${monday}-420` }), range(510, 555, { id: `legacy-${monday}-510` })]);
  assert.deepEqual(source.availability, [`${monday}:0`, `${monday}:1`, `${monday}:2`]);
  assert.equal(source.lessons[0].tutorId, undefined);
});

test('proposals require exact bookable coverage, selected-time availability, and the chosen 45 or 90 minute duration', () => {
  const bookable = [range(1080, 1260)];
  assert.equal(isValidProposal(range(1080, 1125), bookable, 45), true);
  assert.equal(isValidProposal(range(1080, 1170), bookable, 90), true);
  assert.equal(isValidProposal(range(1080, 1125), bookable, 90), false);
  assert.equal(isValidProposal(range(1080, 1170), [range(1080, 1125), range(1125, 1170)], 90), true);
  assert.equal(isValidProposal(range(1080, 1170), [range(1080, 1140), range(1145, 1200)], 90), false);
  assert.equal(isValidProposal(range(1080, 1170), bookable, 90, [range(1125, 1215)]), false);
});

test('a 90-minute proposal can start at 22:00 and end at 23:30, but cannot end after midnight', () => {
  assert.equal(isValidProposal(range(1320, 1410), [range(1320, 1440)], 90), true);
  assert.equal(isValidProposal(range(1325, 1415), [range(1320, 1440)], 90), false);
  assert.equal(isValidProposal(range(1320, 1445), [range(1320, 1440)], 125), false);
});

test('public tutor schedule uses canonical saved ranges and configured duration for quoc-bao', () => {
  const dates = weekDates(0, new Date(2026, 9, 5));
  const tutor = { id: 'quoc-bao', schedule: [{ days: [0], start: '07:00', end: '08:30' }] };
  const state = {
    availability: [range(1090, 1180, { id: 'saved-1' }), range(1090, 1180, { id: 'saved-2', date: '2026-10-12' })],
    lessons: [],
    settings: { 'quoc-bao': { sessionMinutes: 90 } },
  };
  const selected = selectPublicTutorSchedule(state, tutor, dates, 45);
  assert.deepEqual(selected, { ranges: [range(1090, 1180, { id: 'saved-1' })], sessionMinutes: 90 });
});

test('non-canonical tutors use their public weekly schedule and fallback session duration', () => {
  const dates = weekDates(0, new Date(2026, 9, 5));
  const tutor = { id: 'public-tutor', schedule: [{ days: [0], start: '18:10', end: '19:40' }] };
  const selected = selectPublicTutorSchedule({ availability: [], lessons: [], settings: {} }, tutor, dates, 90);
  assert.deepEqual(selected, {
    ranges: [{ id: `static-public-tutor-${monday}-0`, tutorId: 'public-tutor', date: monday, start: 1090, end: 1180 }],
    sessionMinutes: 90,
  });
});

test('acceptance uses exact request proposals, permits adjacency, and subtracts lesson intervals', () => {
  const request = {
    id: 'request-exact', tutorId: CANONICAL_TUTOR_ID, status: 'pending', subject: 'English', learner: 'Learner', area: 'District 1',
    proposals: [{ date: monday, start: 1080, end: 1170 }],
  };
  const state = { requests: [request], lessons: [range(990, 1080, { id: 'adjacent' })], availability: [range(1020, 1200)] };
  const proposed = proposedLessons(request, weekDates(0, new Date(2026, 9, 5)));
  assert.equal(proposed[0].date, monday);
  assert.equal(proposed[0].start, 1080);
  const result = acceptanceResult(state, request.id);
  assert.equal(result.state.requests[0].status, 'accepted');
  assert.deepEqual(result.state.availability, [range(1020, 1080, { id: 'range-1020-1080' }), range(1170, 1200, { id: 'range-1170-1200' })]);
  assert.equal(state.requests[0].status, 'pending');
  assert.ok(acceptanceResult(result.state, request.id).error);
});

test('acceptance rejects overlapping lessons and proposals without changing input state', () => {
  const request = { id: 'request-overlap', status: 'pending', proposals: [{ date: monday, start: 1080, end: 1170 }] };
  const state = { requests: [request], lessons: [range(1075, 1100, { id: 'existing' })], availability: [] };
  const before = structuredClone(state);
  const result = acceptanceResult(state, request.id);
  assert.ok(result.error);
  assert.equal(result.state, undefined);
  assert.deepEqual(state, before);
});
