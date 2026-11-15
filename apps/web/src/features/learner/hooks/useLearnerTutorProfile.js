import { useMemo } from 'react';
import useDemoDomain from '../../domain/DemoDomainContext.jsx';
import { selectLearnerTutor, selectPublicReviews, summarizePublicReviews, selectFeaturedReviews, selectTutorCredentials, selectReviewDistribution } from '../../../services/learner/tutorProfileService.js';
export function useLearnerTutorProfile(id) {
  const domain = useDemoDomain();
  const tutors = domain.profiles || [];
  const reviews = domain.reviews || [];
  return { tutor: selectLearnerTutor(tutors, id), reviews };
}
export function useLearnerProfileReviews(tutor, allReviews) {
  const domain = useDemoDomain();
  const reviews = allReviews || domain.reviews || [];
  const visibleReviews = useMemo(() => selectPublicReviews(reviews, tutor), [reviews, tutor.id]);
  const ratingSummary = useMemo(() => summarizePublicReviews(visibleReviews), [visibleReviews]);
  const featuredReviews = useMemo(() => selectFeaturedReviews(visibleReviews), [visibleReviews]);
  return { visibleReviews, ratingSummary, featuredReviews, credentials: selectTutorCredentials(tutor), distribution: selectReviewDistribution(visibleReviews, ratingSummary.reviewCount) };
}
