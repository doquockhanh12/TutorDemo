import useDemoDomain from '../../domain/DemoDomainContext.jsx';
import { useTutorProposalValidation } from '../../tutor/TutorWorkspaceState.jsx';
import { validateLearnerSelection, createLearnerRequestPayload } from '../../../services/learner/bookingService.js';
export default function useLearnerBooking(tutor, selection) {
 const { createRequest } = useDemoDomain();
 const { validProposal } = useTutorProposalValidation(tutor);
 return { ...validateLearnerSelection(selection, validProposal), submitRequest: (goal) => createRequest(createLearnerRequestPayload(tutor, selection, goal)) };
}
