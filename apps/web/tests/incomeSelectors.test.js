import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTutorIncome } from '../src/features/domain/incomeSelectors.js';
import { createDemoState } from '../src/features/domain/demoDomain.js';

const referenceDate = new Date('2026-10-05T06:00:00+07:00');

test('Tutor income includes only completed finite-fee lessons owned by the current tutor', () => {
  const lessons = [
    { id: 'oct-a', tutorId: 'tutor-a', status: 'completed', date: '2026-10-03', start: 600, sessionFee: 200000 },
    { id: 'oct-b', tutorId: 'tutor-a', status: 'completed', date: '2026-10-01', start: 540, sessionFee: 180000 },
    { id: 'other-owner', tutorId: 'tutor-b', status: 'completed', date: '2026-10-02', sessionFee: 500000 },
    { id: 'not-completed', tutorId: 'tutor-a', status: 'confirmed', date: '2026-10-02', sessionFee: 500000 },
    { id: 'missing-fee', tutorId: 'tutor-a', status: 'completed', date: '2026-10-02' },
    { id: 'string-fee', tutorId: 'tutor-a', status: 'completed', date: '2026-10-02', sessionFee: '500000' },
  ];

  const report = selectTutorIncome(lessons, 'tutor-a', referenceDate);
  assert.equal(report.currentMonth.total, 380000);
  assert.equal(report.currentMonth.lessonCount, 2);
  assert.deepEqual(report.currentMonth.lessons.map((lesson) => lesson.id), ['oct-a', 'oct-b']);
});

test('Tutor income returns six calendar months and groups completed lessons by lesson date', () => {
  const lessons = [
    { id: 'may', tutorId: 'tutor-a', status: 'completed', date: '2026-05-31', sessionFee: 100000 },
    { id: 'jun', tutorId: 'tutor-a', status: 'completed', date: '2026-06-01', sessionFee: 200000 },
    { id: 'sep', tutorId: 'tutor-a', status: 'completed', date: '2026-09-15', sessionFee: 300000 },
    { id: 'oct', tutorId: 'tutor-a', status: 'completed', date: '2026-10-04', sessionFee: 400000 },
    { id: 'outside-window', tutorId: 'tutor-a', status: 'completed', date: '2026-04-30', sessionFee: 900000 },
  ];

  const report = selectTutorIncome(lessons, 'tutor-a', referenceDate);
  assert.deepEqual(report.months.map((month) => month.key), [
    '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
  ]);
  assert.deepEqual(report.months.map((month) => month.total), [100000, 200000, 0, 0, 300000, 400000]);
  assert.equal(report.currentMonth.key, '2026-10');
  assert.equal(report.currentMonth.total, 400000);
});

test('Approved fixture produces October summary, subject groups and six-month Income without profile price fallback', () => {
  const state = createDemoState(referenceDate);
  const report = selectTutorIncome(state.lessons, 'quoc-bao', referenceDate);
  assert.equal(report.currentMonth.total, 660000);
  assert.equal(report.currentMonth.lessonCount, 3);
  assert.deepEqual(report.currentMonth.bySubject, [
    { subject: 'Tiếng Anh', total: 440000, lessonCount: 2 },
    { subject: 'IELTS', total: 220000, lessonCount: 1 },
  ]);
  assert.equal(report.currentMonth.topSubject.subject, 'Tiếng Anh');
  assert.deepEqual(report.months.map((month) => month.total), [180000, 360000, 400000, 620000, 880000, 660000]);
  state.profiles.find((profile) => profile.id === 'quoc-bao').price = 999999;
  assert.deepEqual(selectTutorIncome(state.lessons, 'quoc-bao', referenceDate), report);
});

test('Income zero states and calendar year rollover are derived from reference date', () => {
  const report = selectTutorIncome([], 'quoc-bao', new Date(2027, 0, 1), 3);
  assert.deepEqual(report.months.map((month) => month.key), ['2026-11', '2026-12', '2027-01']);
  assert.equal(report.currentMonth.total, 0);
  assert.equal(report.currentMonth.lessonCount, 0);
  assert.equal(report.currentMonth.topSubject, null);
});
