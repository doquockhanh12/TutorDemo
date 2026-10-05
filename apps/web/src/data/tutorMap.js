import { tutors } from './tutors.js';

// Illustrative coordinates only: no real addresses or location data.
const points = [[190, 170], [440, 145], [100, 295], [225, 310], [310, 205], [465, 330]];
export const mapTutors = tutors.map((tutor, index) => {
  const pt = points[index % points.length] || [200, 200];
  return { ...tutor, x: pt[0], y: pt[1] };
});
export function demoDistance(first, second) {
  return (Math.hypot(first.x - second.x, first.y - second.y) * .015).toLocaleString('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}
