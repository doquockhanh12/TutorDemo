import { demoDistance, mapTutors } from '../../data/tutorMap.js';
import { LEARNER_LOCATION } from '../../data/learner/map.js';
export function selectLearnerMap(selectedTutorId, selectedArea) {
 const selectedTutor = mapTutors.find((t) => t.id === selectedTutorId) || mapTutors[0];
 return { mapTutors, learnerLocation: LEARNER_LOCATION, selectedTutor,
 areaOptions: ['Tất cả khu vực', ...new Set(mapTutors.map((t) => t.location).filter(Boolean))],
 distanceToLearner: selectedTutor ? demoDistance(LEARNER_LOCATION, selectedTutor) : '0.0',
 visibleTutors: mapTutors.filter((t) => selectedArea === 'Tất cả khu vực' || t.location === selectedArea),
 firstInArea: mapTutors.find((t) => t.location === selectedArea) };
}
