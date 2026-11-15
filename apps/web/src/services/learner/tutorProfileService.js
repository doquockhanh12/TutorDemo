import { createFallbackTutorCredentials } from '../../data/learner/tutorCredentials.js';
export function selectLearnerTutor(tutors, id) {
  const rawTutor = tutors.find(
    (item) =>
      item.id === id ||
      item.accountId === id ||
      (item.name && id && item.name.trim().toLowerCase() === id.trim().toLowerCase())
  );
  const tutor = rawTutor && (rawTutor.moderationStatus || 'approved') === 'approved'
    ? rawTutor
    : null;

return tutor;
}
export function selectPublicReviews(reviews, tutor) { return reviews.filter(
      (review) => review.tutorId === tutor.id
        && (review.moderationStatus || 'approved') === 'approved'
        && (review.visibility || 'public') === 'public'
    ); }
export function summarizePublicReviews(visibleReviews) {
    if (!visibleReviews.length) {
      return { averageRating: 0, reviewCount: 0, hasReviews: false };
    }

    const total = visibleReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return {
      averageRating: Number((total / visibleReviews.length).toFixed(1)),
      reviewCount: visibleReviews.length,
      hasReviews: true,
    };
}
export function selectFeaturedReviews(visibleReviews) { return [...visibleReviews]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)
        || new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 2); }

export const selectTutorCredentials = (tutor) => tutor.verificationDocuments || tutor.documents || createFallbackTutorCredentials(tutor);
export function selectReviewDistribution(allReviews, reviewCount) {
 return [5, 4, 3, 2, 1].map((rating) => {
  const count = allReviews.filter((review) => review.rating === rating).length;
  return { rating, count, percentage: reviewCount ? (count / reviewCount) * 100 : 0 };
 });
}
