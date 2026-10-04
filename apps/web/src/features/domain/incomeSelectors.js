// Pure numeric projections of canonical Lessons; independent of seed/storage/UI.
export function eligibleIncomeLessons(lessons, tutorId) {
  if (!tutorId) return [];
  return lessons.filter((lesson) => lesson.tutorId === tutorId
    && lesson.status === 'completed' && Number.isFinite(lesson.sessionFee));
}

export function lastCalendarMonths(referenceDate, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - count + index + 1, 1);
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      year: date.getFullYear(), month: date.getMonth() + 1 };
  });
}

export function monthlyIncome(eligibleLessons, key) {
  const lessons = eligibleLessons.filter((lesson) => lesson.date?.slice(0, 7) === key)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.start || 0) - (a.start || 0) || a.id.localeCompare(b.id));
  const subjects = new Map();
  for (const lesson of lessons) {
    const subject = lesson.subject || null;
    const group = subjects.get(subject) || { subject, total: 0, lessonCount: 0 };
    group.total += lesson.sessionFee;
    group.lessonCount++;
    subjects.set(subject, group);
  }
  const bySubject = [...subjects.values()].sort((a, b) => b.total - a.total || String(a.subject).localeCompare(String(b.subject)));
  return { key, lessons, total: lessons.reduce((sum, lesson) => sum + lesson.sessionFee, 0),
    lessonCount: lessons.length, bySubject, topSubject: bySubject[0] || null };
}

export function selectTutorIncome(lessons, tutorId, referenceDate = new Date(), count = 6) {
  const eligible = eligibleIncomeLessons(lessons, tutorId);
  const current = lastCalendarMonths(referenceDate, 1)[0];
  const months = lastCalendarMonths(referenceDate, count).map((month) => ({ ...month, ...monthlyIncome(eligible, month.key) }));
  return { currentMonth: monthlyIncome(eligible, current.key), months };
}
