import { useMemo, useState } from 'react';
import useDemoAuth from '../../auth/DemoAuthContext.jsx';
import useDemoDomain, { useLearnerRequests } from '../../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../../tutor/TutorWorkspaceState.jsx';
import { selectLearnerClasses, selectClassList, createInitialClassSubmissions, createClassSubmission } from '../../../services/learner/classesService.js';
export function useLearnerClassesData() {
  const [requests] = useLearnerRequests();
  const { user } = useDemoAuth();
  const { lessons: allLessons } = useDemoDomain();
  const tutors = useScheduledTutors();
  return useMemo(() => selectLearnerClasses(requests, tutors, allLessons, user), [requests, tutors, allLessons, user]);
}
export function useLearnerClassList(classes, filter) {
  return useMemo(() => selectClassList(classes, filter), [classes, filter]);
}
export function useClassSubmissions() {
  const [submissions, setSubmissions] = useState(createInitialClassSubmissions);
  const addSubmission = (fileName, uploadNote) => setSubmissions((prev) => [createClassSubmission(fileName, uploadNote), ...prev]);
  return { submissions, addSubmission };
}
