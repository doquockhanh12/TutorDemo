import { demoReferenceData } from './demoReferenceData.js';
import { containsRange, getBookableRanges, proposedLessons, isValidAvailability } from './tutorSchedule.js';

// Explicit metadata for existing mock requests; fees are VND per session.
// Compatibility for old callers lacking request metadata. No separate values.
export const classSearchMetadata = Object.fromEntries(demoReferenceData.requests.filter((r) => r.sessionFee != null).map((r) => [r.id, { subject: r.catalogSubject || r.subjects?.[0] || r.subject, sessionFee: r.sessionFee }]));
export const requestMetadata = (request) => ({ subject: request.catalogSubject || request.subjects?.[0] || classSearchMetadata[request.id]?.subject || request.subject, sessionFee: request.sessionFee ?? classSearchMetadata[request.id]?.sessionFee });
export const feeBounds = { min: 0, max: 500000, step: 10000 };
export const formatFee = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
export const savedFreeRanges = (availability, lessons) => getBookableRanges(availability, lessons);
export function fitsSavedAvailability(proposals, availability, lessons) {
  const free = savedFreeRanges(availability, lessons);
  return proposals.length > 0 && proposals.every((proposal) => isValidAvailability(proposal) && free.some((range) => containsRange(range, proposal)));
}
export function filterTutorClasses(requests, { subjects = [], areas = [], minFee = feeBounds.min, maxFee = feeBounds.max }, availability, lessons, dates) {
  if (!savedFreeRanges(availability, lessons).length) return [];
  return requests.flatMap((request) => {
    const metadata = requestMetadata(request);
    if (request.status !== 'pending' || !Number.isFinite(metadata.sessionFee)) return [];
    if (subjects.length && !subjects.includes(metadata.subject)) return [];
    if (areas.length && !areas.includes(request.area)) return [];
    if (metadata.sessionFee < minFee || metadata.sessionFee > maxFee) return [];
    const proposals = proposedLessons(request, dates);
    return fitsSavedAvailability(proposals, availability, lessons) ? [{ ...request, ...metadata, title: request.subject, proposals }] : [];
  });
}
