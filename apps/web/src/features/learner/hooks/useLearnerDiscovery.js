import { useMemo } from 'react';
import { useScheduledTutors } from '../../tutor/TutorWorkspaceState.jsx';
import { useSavedTutors } from '../../domain/DemoDomainContext.jsx';
import { selectTutorSearch, selectDiscoveryOptions, selectSavedTutors } from '../../../services/learner/discoveryService.js';
export function useLearnerDiscovery(filters) {
  const tutors = useScheduledTutors();
  const options = selectDiscoveryOptions(tutors);
  const { query, subject, location, availability, maxPrice, sortBy } = filters;
  const results = useMemo(() => selectTutorSearch(tutors, filters), [tutors, query, subject, location, availability, maxPrice, sortBy]);
  return { ...options, results, tutors };
}
export function useLearnerSavedTutors() {
  const tutors = useScheduledTutors();
  const [saved, setSaved] = useSavedTutors();
  return { saved, setSaved, savedTutors: selectSavedTutors(tutors, saved) };
}
