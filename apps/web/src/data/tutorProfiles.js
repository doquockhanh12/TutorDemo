import { demoReferenceData } from './demoReferenceData.js';
export const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
export const teachingLevels = demoReferenceData.teachingLevels;
const hour = (time) => time.replace(':00', 'h').replace(':', 'h');
export const scheduleRange = (slot) => `${hour(slot.start)}–${hour(slot.end)}`;
export const tutorHours = (tutor) => [...new Set(tutor.schedule.map(scheduleRange))].join(' · ');

// Additional fictional profile content for the interactive demo.
export const tutorProfiles = Object.fromEntries(demoReferenceData.tutorProfiles.map((profile) => [profile.id, profile]));

export const profileReviews = demoReferenceData.reviews;
