import { isValidProposal, mergeAdjacentRanges, normalizeSessionMinutes } from '../../data/tutorSchedule.js';

// Offer complete sessions anchored to the beginning of each saved free range.
export function bookableSessions(ranges, duration) {
  const minutes = normalizeSessionMinutes(duration);
  return mergeAdjacentRanges(ranges).flatMap((range) => {
    const sessions = [];
    for (let start = range.start; start + minutes <= range.end; start += minutes) {
      const proposal = { date: range.date, start, end: start + minutes };
      if (isValidProposal(proposal, [range], minutes)) sessions.push(proposal);
    }
    return sessions;
  });
}

export { isValidProposal, proposalLabel, proposalLabel as concreteScheduleLabel } from '../../data/tutorSchedule.js';
export function removeSelectedProposal(proposals, target) {
  return proposals.filter((proposal) => proposal.date !== target.date || proposal.start !== target.start || proposal.end !== target.end);
}
