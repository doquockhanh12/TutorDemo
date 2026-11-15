import { concreteScheduleLabel } from '../../features/learner/profileSelection.js';
export function validateLearnerSelection(selection, validProposal) {
  const ranges = selection.proposals;
  const selectedSubjects = selection.subjects ? [selection.subjects] : [];
  const selectedLevels = selection.levels ? [selection.levels] : [];

  const proposalsValid = ranges.every(
    (proposal, index) =>
      validProposal(
        proposal,
        ranges.slice(0, index)
      )
  );

  const areaRequired =
    selection.formats.includes('Tại nhà');

  const errors = {
    subjects: !selection.subjects,

    levels: !selection.levels,

    proposals:
      ranges.length === 0 ||
      !proposalsValid,

    formats:
      selection.formats.length === 0,

    areas:
      areaRequired &&
      selection.areas.length === 0,
  };

  const ready =
    !Object.values(errors).some(Boolean);


return { ranges, selectedSubjects, selectedLevels, proposalsValid, areaRequired, errors, ready };
}
export function createLearnerRequestPayload(tutor, selection, goal) {
  const ranges = selection.proposals;
  const selectedSubjects = selection.subjects ? [selection.subjects] : [];
  const selectedLevels = selection.levels ? [selection.levels] : [];
    const proposals = ranges.map(
      ({
        date,
        start,
        end,
      }) => ({
        date,
        start,
        end,
      })
    );

    return {
        tutorId: tutor.id,

        subjects:
          selectedSubjects,

        subject:
          selectedSubjects.join(', '),

        levels:
          selectedLevels,

        proposals,

        schedule:
          proposals
            .map(concreteScheduleLabel)
            .join('; '),

        formats:
          selection.formats,

        format:
          selection.formats.join(', '),

        areas:
          selection.areas,

        goal:
          goal.trim(),

        status: 'pending',
    };

}
