export function selectTutorSearch(tutors, { query, subject, location, availability, maxPrice, sortBy }) {
    const normalized = query.trim().toLocaleLowerCase('vi-VN');
    const filtered = tutors.filter((tutor) => (
      (!normalized || [tutor.name, tutor.university, tutor.location, ...tutor.subjects].join(' ').toLocaleLowerCase('vi-VN').includes(normalized)) &&
      (!subject || tutor.subjects.includes(subject)) &&
      (!location || tutor.location === location) &&
      (!availability || tutor.availability.includes(availability)) &&
      (maxPrice === 'all' || tutor.price <= Number(maxPrice))
    ));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
}
export function selectDiscoveryOptions(tutors) {
  return { subjectNames: [...new Set(tutors.flatMap((tutor) => tutor.subjects))], locationNames: [...new Set(tutors.map((tutor) => tutor.location).filter(Boolean))], quickSubjects: [...new Set(tutors.flatMap((tutor) => tutor.subjects))].slice(0, 6) };
}
export const selectSavedTutors = (tutors, saved) => tutors.filter((tutor) => saved.includes(tutor.id));
