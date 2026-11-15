export const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const shortDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
export function monday(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - (result.getDay() + 6) % 7);
  return result;
}
function lessonStart(lesson) {
  if (!scheduleDate(lesson.displayDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(lesson.displayStart)) return null;
  return new Date(`${lesson.displayDate}T${lesson.displayStart}:00`).getTime();
}
function lessonEnd(lesson) {
  if (!scheduleDate(lesson.displayDate)) return null;
  if (lesson.displayEnd === '24:00') {
    const nextDay = scheduleDate(lesson.displayDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    return nextDay.getTime();
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(lesson.displayEnd)) return null;
  return new Date(`${lesson.displayDate}T${lesson.displayEnd}:00`).getTime();
}

function scheduleDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) || dateKey(date) !== value ? null : date;
}

export function formatDate(value) {
  const date = scheduleDate(value);
  return date
    ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : 'Chưa rõ ngày học';
}

function formatTime(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }
  return value || '';
}


export function selectScheduleData(requests, user, allLessons, tutors, now) {
  const requestsById = new Map(requests.map((r) => [r.id, r]));
const ownedLessons = allLessons.filter(
      (lesson) => (lesson.learnerId === user?.id || requestsById.has(lesson.requestId) || lesson.learner === user?.fullName)
        && lesson.status !== 'cancelled'
    );
  const linkedRequestIds = new Set(ownedLessons.map((l) => l.requestId).filter(Boolean));
    const mappedOwned = ownedLessons
      .map((lesson) => {
        const req = requestsById.get(lesson.requestId);
        return {
          ...lesson,
          subject: lesson.subject || req?.subject || 'Buổi học',
          displayDate: lesson.date,
          displayStart: formatTime(lesson.start),
          displayEnd: formatTime(lesson.end),
          completed: lesson.status === 'completed',
          requestId: req?.id || lesson.requestId,
          notes: lesson.notes,
        };
      });

    const mappedAcceptedRequests = requests
      .filter((req) => req.status === 'accepted' && !linkedRequestIds.has(req.id))
      .map((req) => ({
        id: `class-${req.id}`,
        requestId: req.id,
        subject: req.subject,
        tutorId: req.tutorId,
        schedule: req.schedule,
        format: req.format || 'Online / Tại nhà',
        sessionFee: req.sessionFee,
        completed: Boolean(req.completed),
        displayDate: null,
        displayStart: '',
        displayEnd: '',
        notes: req.notes,
      }));

    const lessons = [...mappedOwned, ...mappedAcceptedRequests.map((lesson) => ({ ...lesson, fixedSchedule: true }))];

  const upcomingLessons = lessons.filter((l) => !l.fixedSchedule && ['confirmed', 'upcoming'].includes(l.status) && lessonStart(l) > now.getTime()).sort((a, b) => lessonStart(a) - lessonStart(b));
  const completedLessons = lessons.filter((l) => !l.fixedSchedule && l.completed);
  const ongoingLessons = lessons.filter((lesson) => {
    const start = lessonStart(lesson);
    const end = lessonEnd(lesson);
    return !lesson.fixedSchedule && ['confirmed', 'upcoming'].includes(lesson.status)
      && start !== null && end !== null && end > start
      && start <= now.getTime() && now.getTime() < end;
  });

  const fixedSchedules = lessons.filter((lesson) => lesson.fixedSchedule);

  return { requests, tutors, lessons, upcomingLessons, completedLessons, ongoingLessons, fixedSchedules };
}
export function selectScheduleLessonDetails(lesson, tutors, requests, ongoing, now) {
            const tutor = tutors.find((item) => item.id === lesson.tutorId);
            const targetClassId = lesson.requestId || requests.find((r) => r.tutorId === lesson.tutorId)?.id || 'demo-02';
            const start = ongoing ? lessonStart(lesson) : null;
            const end = ongoing ? lessonEnd(lesson) : null;
            const progress = ongoing ? Math.min(100, Math.max(0, (now.getTime() - start) / (end - start) * 100)) : 0;

return { tutor, targetClassId, start, end, progress,
  elapsedMinutes: ongoing ? Math.floor((now.getTime() - start) / 60000) : 0,
  durationMinutes: ongoing ? (end - start) / 60000 : 0,
  remainingMinutes: ongoing ? Math.ceil((end - now.getTime()) / 60000) : 0,
  ariaProgress: Math.round(progress * 10) / 10,
};
}

export function selectScheduleWeek(lessons, weekDays) {
  const weeklyCount = lessons.filter((lesson) => !lesson.fixedSchedule && weekDays.some((day) => day.iso === lesson.displayDate)).length;
  const weekItems = Object.fromEntries(weekDays.map((day) => [day.iso, lessons.filter((lesson) => !lesson.fixedSchedule && lesson.displayDate === day.iso)]));
  return { weeklyCount, weekItems };
}
