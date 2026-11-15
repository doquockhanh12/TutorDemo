import { useMemo } from 'react';
import useDemoAuth from '../../auth/DemoAuthContext.jsx';
import useDemoDomain, { useLearnerRequests } from '../../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../../tutor/TutorWorkspaceState.jsx';
import { selectScheduleData, selectScheduleWeek, selectScheduleLessonDetails } from '../../../services/learner/scheduleService.js';
export default function useLearnerSchedule(now, weekDays) {
  const [requests] = useLearnerRequests();
  const { user } = useDemoAuth();
  const { lessons: allLessons } = useDemoDomain();
  const tutors = useScheduledTutors();
  const data = useMemo(() => selectScheduleData(requests, user, allLessons, tutors, now), [requests, user, allLessons, tutors, now]);
  return { ...data, ...selectScheduleWeek(data.lessons, weekDays),
    resolveLesson: (lesson, ongoing) => selectScheduleLessonDetails(lesson, tutors, requests, ongoing, now),
    classIdForLesson: (slot) => slot.requestId || requests.find((request) => request.tutorId === slot.tutorId)?.id || 'demo-02',
    tutorForLesson: (slot) => tutors.find((tutor) => tutor.id === slot.tutorId),
  };
}
