import { isValidProposal, isFutureSession } from '../../data/tutorSchedule.js';
const sameSession = (a, b) =>
  a.date === b.date &&
  a.start === b.start &&
  a.end === b.end;

export function selectCalendarChoice(session, selected, ranges, sessionMinutes) {
 const existing = selected.find((proposal) => sameSession(proposal, session));
 if (existing) return { existing, canAdd: false };
 return { existing, canAdd: isFutureSession(session) && isValidProposal(session, ranges, sessionMinutes, selected) };
}
export function selectCalendarSessionState(session, selected, ranges, sessionMinutes) {
 const active = selected.some((proposal) => sameSession(proposal, session));
 const disabled = !isFutureSession(session) || (!active && !isValidProposal(session, ranges, sessionMinutes, selected));
 return { active, disabled };
}
export const selectDailySessions = (sessions, key) => sessions.filter((session) => session.date === key);
