import assert from 'node:assert/strict';
import test from 'node:test';
import { bookableSessions, isValidProposal, proposalLabel, concreteScheduleLabel, removeSelectedProposal } from '../src/features/learner/profileSelection.js';
import { CANONICAL_TUTOR_ID } from '../src/data/tutorSchedule.js';

const date = '2026-10-05';
const range = (start, end, extra = {}) => ({ tutorId: CANONICAL_TUTOR_ID, date, start, end, ...extra });

test('session choices preserve saved start, use tutor duration and omit incomplete remainder', () => {
  assert.deepEqual(bookableSessions([range(1090, 1300)], 90), [
    { date, start: 1090, end: 1180 }, { date, start: 1180, end: 1270 },
  ]);
  assert.equal(bookableSessions([range(1090, 1180)], 45).length, 2);
});

test('session choices never bridge unavailable gaps or offer starts after 22:00', () => {
  assert.deepEqual(bookableSessions([range(1080, 1120), range(1130, 1170)], 45), []);
  assert.deepEqual(bookableSessions([range(1320, 1440)], 45), [{ date, start: 1320, end: 1365 }]);
});

test('Learner request selection accepts the selected 45 or 90 minute duration inside bookable ranges', () => {
  const bookable = [range(1080, 1260)];
  assert.equal(isValidProposal(range(1080, 1125), bookable, 45), true);
  assert.equal(isValidProposal(range(1080, 1170), bookable, 90), true);
  assert.equal(isValidProposal(range(1080, 1170), bookable, 45), false);
});

test('Learner request selection rejects gaps and overlaps with already selected proposals', () => {
  const proposal = range(1080, 1170);
  assert.equal(isValidProposal(proposal, [range(1080, 1125), range(1130, 1170)], 90), false);
  assert.equal(isValidProposal(proposal, [range(1080, 1260)], 90, [range(1125, 1215)]), false);
});

test('Learner removes a proposal by exact local date, start and end identity', () => {
  const proposals = [
    range(1080, 1125, { id: 'first', subject: 'Math' }),
    range(1170, 1215, { id: 'second', subject: 'English' }),
    { ...range(1080, 1125), date: '2026-10-06', id: 'next-day' },
  ];
  const before = structuredClone(proposals);
  assert.deepEqual(removeSelectedProposal(proposals, range(1080, 1125)), [proposals[1], proposals[2]]);
  assert.deepEqual(proposals, before);
});

test('proposal label alias formats a concrete date and local minute interval', () => {
  const proposal = range(1090, 1180);
  assert.equal(concreteScheduleLabel, proposalLabel);
  assert.match(proposalLabel(proposal), /18:10[–-]19:40$/);
});
import { isFutureSession } from '../src/data/tutorSchedule.js';

test('BUG-010 concrete sessions reject past dates and elapsed starts with a fixed local clock', () => {
  const now = new Date('2026-10-06T19:00:00+07:00');
  assert.equal(isFutureSession({date:'2026-10-05',start:1200,end:1245},now),false);
  assert.equal(isFutureSession({date:'2026-10-06',start:1080,end:1125},now),false);
  assert.equal(isFutureSession({date:'2026-10-06',start:1200,end:1245},now),true);
  assert.equal(isFutureSession({date:'2026-10-07',start:420,end:465},now),true);
});
