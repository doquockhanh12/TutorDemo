import { useMemo } from 'react';
import { selectLearnerMap } from '../../../services/learner/mapService.js';
export default function useLearnerMap(selectedTutorId, selectedArea) {
 return useMemo(() => selectLearnerMap(selectedTutorId, selectedArea), [selectedTutorId, selectedArea]);
}
