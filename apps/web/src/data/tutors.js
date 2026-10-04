import { demoReferenceData } from './demoReferenceData.js';
// Read-only seed projection; live screens use the domain selectors.
export const tutors = demoReferenceData.tutorProfiles;
export const subjectOptions = ['Tất cả môn', ...new Set(tutors.flatMap((tutor) => tutor.subjects))];
export const locationOptions = ['Tất cả khu vực', ...new Set(tutors.map((tutor) => tutor.location).filter(Boolean))];
export const availabilityOptions = ['Mọi khung giờ', 'Buổi sáng', 'Buổi chiều', 'Buổi tối', 'Cuối tuần'];
