import { normalizeSessionMinutes, selectPublicTutorSchedule, weekDates, isValidProposal, availabilityLabels, rangesSummary } from '../../data/tutorSchedule.js';
import useDemoDomain, { DemoDomainProvider } from '../domain/DemoDomainContext.jsx';
import { useMemo } from 'react';
import { isFutureSession } from '../../data/tutorSchedule.js';
export const TutorWorkspaceProvider = DemoDomainProvider;
export default function useTutorWorkspace() {
  const state = useDemoDomain();
  const requests = useMemo(() => state.requests.filter((r) => r.tutorId === state.tutorId), [state.requests, state.tutorId]);
  const lessons = useMemo(() => state.lessons.filter((l) => l.tutorId === state.tutorId), [state.lessons, state.tutorId]);
  const availability = useMemo(() => state.availability.filter((r) => r.tutorId === state.tutorId), [state.availability, state.tutorId]);
  return { ...state, requests, lessons, availability,
    sessionMinutes: state.sessionMinutes };
}
export function usePublicTutorSchedule(tutor, dates = weekDates()) {
  return selectPublicTutorSchedule(useDemoDomain(), tutor, dates, tutor.sessionMinutes);
}
export function useTutorProposalValidation(tutor) {
  const state = useDemoDomain();
  const sessionMinutes = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes).sessionMinutes;
  return { sessionMinutes, validProposal: (proposal, selected = []) => isFutureSession(proposal) && isValidProposal(proposal,
    selectPublicTutorSchedule(state, tutor, weekDates(0, new Date(proposal.date + 'T12:00:00')), tutor.sessionMinutes).ranges, sessionMinutes, selected) };
}
export function useScheduledTutors() {
  const state = useDemoDomain();
  return useMemo(() => {
    return (state.profiles || [])
      .filter((tutor) => (tutor.moderationStatus || 'approved') === 'approved')
      .map((tutor) => {
        const { ranges, sessionMinutes } = selectPublicTutorSchedule(state, tutor, weekDates(), tutor.sessionMinutes);
        return { ...tutor, sessionMinutes, availability: availabilityLabels(ranges), scheduleSummary: rangesSummary(ranges) };
      });
  }, [state]);
}
