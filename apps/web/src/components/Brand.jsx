import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Brand({ compact = false }) {
  return (
    <Link className={`brand ${compact ? 'brand--compact' : ''}`} to="/learner/search" aria-label="TutorNearMe — về trang tìm gia sư">
      <span className="brand__mark" aria-hidden="true"><BookOpen size={21} strokeWidth={1.9} /></span>
      <span className="brand__word">Tutor<span>NearMe</span></span>
    </Link>
  );
}
