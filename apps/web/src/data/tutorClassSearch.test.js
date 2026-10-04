import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTutorClasses, fitsSavedAvailability, savedFreeRanges } from './tutorClassSearch.js';
import { CANONICAL_TUTOR_ID, proposedLessons } from './tutorSchedule.js';

const monday = '2026-10-05';
const tuesday = '2026-10-06';
const wednesday = '2026-10-07';
const range = (date, start, end, extra = {}) => ({ tutorId: CANONICAL_TUTOR_ID, date, start, end, ...extra });
const requests = [
  { id: 'ref-1', subject: 'Toán', area: 'Cầu Giấy, Hà Nội', status: 'pending', proposals: [
    { date: monday, start: 1140, end: 1230 }, { date: wednesday, start: 1140, end: 1230 },
  ] },
  { id: 'ref-2', subject: 'Tiếng Anh', area: 'Đống Đa, Hà Nội', status: 'pending', proposals: [
    { date: tuesday, start: 1095, end: 1185 },
  ] },
  { id: 'req-3', subject: 'Toán lớp 9', area: 'Quận 3', status: 'accepted', proposals: [
    { date: monday, start: 1140, end: 1230 },
  ] },
];
const rangesFor = (request) => proposedLessons(request).map((proposal, index) => range(proposal.date, proposal.start, proposal.end, { id: `${request.id}-${index}` }));
const allAvailable = requests.flatMap(rangesFor);

test('saved free ranges subtract lessons and preserve local date/minute ranges', () => {
  const availability = [
    range(monday, 1080, 1200, { id: 'saved', parent: 'Private Parent', phone: '0900000000' }),
    range(tuesday, 1080, 1200, { id: 'other-date' }),
  ];
  const before = structuredClone(availability);
  const free = savedFreeRanges(availability, [range(monday, 1125, 1170, { status: 'confirmed', learner: 'Private Learner' })]);
  assert.deepEqual(free.map(({ date, start, end }) => ({ date, start, end })), [
    { date: monday, start: 1080, end: 1125 },
    { date: monday, start: 1170, end: 1200 },
    { date: tuesday, start: 1080, end: 1200 },
  ]);
  assert.ok(free.every((item) => !('parent' in item) && !('phone' in item) && !('learner' in item)));
  assert.deepEqual(availability, before);
});

test('requires complete proposal coverage on each exact date', () => {
  const proposals = proposedLessons(requests[0]);
  const complete = rangesFor(requests[0]);
  assert.equal(fitsSavedAvailability(proposals, complete, []), true);
  assert.equal(fitsSavedAvailability(proposals, complete.slice(1), []), false);
  assert.equal(fitsSavedAvailability(proposals, complete.map((item) => ({ ...item, date: tuesday })), []), false);
  assert.equal(fitsSavedAvailability([], complete, []), false);
});

test('adjacent saved ranges can jointly cover a proposal but a gap cannot', () => {
  const proposal = { date: monday, start: 1080, end: 1170 };
  assert.equal(fitsSavedAvailability([proposal], [range(monday, 1080, 1125), range(monday, 1125, 1170)], []), true);
  assert.equal(fitsSavedAvailability([proposal], [range(monday, 1080, 1125), range(monday, 1130, 1170)], []), false);
});

test('booked lesson overlap removes proposal eligibility while exact adjacency remains eligible', () => {
  const proposal = { date: monday, start: 1080, end: 1170 };
  const availability = [range(monday, 1080, 1170)];
  assert.equal(fitsSavedAvailability([proposal], availability, [range(monday, 1070, 1080, { status: 'confirmed' })]), true);
  assert.equal(fitsSavedAvailability([proposal], availability, [range(monday, 1169, 1200, { status: 'confirmed' })]), false);
  assert.equal(fitsSavedAvailability([proposal], availability, [range(monday, 1169, 1200, { status: 'cancelled' })]), true);
});

test('filter combines multiple choices with OR within groups and AND across groups', () => {
  const result = filterTutorClasses(requests, {
    subjects: ['Toán', 'Tiếng Anh'],
    areas: ['Cầu Giấy, Hà Nội', 'Đống Đa, Hà Nội'],
    minFee: 180000,
    maxFee: 200000,
  }, allAvailable, [], []);
  assert.deepEqual(result.map((item) => item.id), ['ref-1', 'ref-2']);
});

test('filter applies inclusive fee bounds and rejects cross-group mismatches and handled requests', () => {
  assert.deepEqual(filterTutorClasses(requests, { minFee: 180000, maxFee: 180000 }, allAvailable, [], []).map((item) => item.id), ['ref-2']);
  assert.deepEqual(filterTutorClasses(requests, { subjects: ['Toán'], areas: ['Đống Đa, Hà Nội'] }, allAvailable, [], []), []);
  assert.ok(!filterTutorClasses(requests, {}, allAvailable, [], []).some((item) => item.id === 'req-3'));
});

test('filter shows no classes when there are no saved free ranges or a request only partially fits', () => {
  assert.deepEqual(filterTutorClasses(requests, {}, [], [], []), []);
  const partial = rangesFor(requests[0]).slice(0, 1);
  assert.deepEqual(filterTutorClasses([requests[0]], {}, partial, [], []), []);
});

test('BUG-013 a learner-created request can be discovered without an ID-specific metadata entry', () => {
  const request = { ...requests[0], id: 'created-request', sessionFee: 200000, subjects: ['Toán'] };
  const result = filterTutorClasses([request], {}, rangesFor(request), [], []);
  assert.deepEqual(result.map((r) => r.id), [request.id]);
  assert.equal(result[0].sessionFee, 200000);
});
