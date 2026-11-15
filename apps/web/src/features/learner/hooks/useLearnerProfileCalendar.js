import { usePublicTutorSchedule } from '../../tutor/TutorWorkspaceState.jsx';
import { weekDates } from '../../../data/tutorSchedule.js';
import { bookableSessions } from '../profileSelection.js';
import { selectCalendarChoice, selectCalendarSessionState, selectDailySessions } from '../../../services/learner/calendarService.js';
export default function useLearnerProfileCalendar(tutor, offset, selected, onAdd, onRemove) {
 const dates = weekDates(offset);
 const { ranges, sessionMinutes } = usePublicTutorSchedule(tutor, dates);
 const sessions = bookableSessions(ranges, sessionMinutes);
 const choose = (session) => {
  const { existing, canAdd } = selectCalendarChoice(session, selected, ranges, sessionMinutes);
  if (existing) { onRemove(existing); return; }
  if (canAdd) onAdd(session);
 };
 return { dates, sessions, sessionMinutes, choose,
   dailySessions: (key) => selectDailySessions(sessions, key),
   sessionState: (session) => selectCalendarSessionState(session, selected, ranges, sessionMinutes),
 };
}
