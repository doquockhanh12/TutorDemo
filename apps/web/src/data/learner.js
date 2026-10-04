import { demoReferenceData } from './demoReferenceData.js';
// Compatibility seed projection only, never a second runtime store.
export const initialLearnerRequests = demoReferenceData.requests.filter((r) => r.learnerId === 'demo-learner');
