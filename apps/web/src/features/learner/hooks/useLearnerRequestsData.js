import { useMemo } from 'react';
import { useLearnerRequests, usePublicTutors } from '../../domain/DemoDomainContext.jsx';
import { countLearnerRequests, filterLearnerRequests, selectRequestRows, selectRequestDetail, patchLearnerRequestList } from '../../../services/learner/requestsService.js';
export function useLearnerRequestList(filter) {
  const publicTutors = usePublicTutors();
  const [requests] = useLearnerRequests();
  const counts = useMemo(() => countLearnerRequests(requests), [requests]);
  const visible = useMemo(() => filterLearnerRequests(requests, filter), [requests, filter]);
  const rows = useMemo(() => selectRequestRows(visible, publicTutors), [visible, publicTutors]);
  return { counts, visible, rows };
}
export function useLearnerRequestDetail(id) {
  const publicTutors = usePublicTutors();
  const [requests, setRequests] = useLearnerRequests();
  return { ...selectRequestDetail(requests, publicTutors, id),
    update: (patch) => setRequests(patchLearnerRequestList(requests, id, patch)),
  };
}
