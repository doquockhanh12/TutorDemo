import { Link } from 'react-router-dom';

export default function Brand({ compact = false }) {
  return (
    <Link className={`brand ${compact ? 'brand--compact' : ''}`} to="/" aria-label="TutorNearMe — trang chủ">
      <span className="brand__mark" aria-hidden="true">TN</span>
      <span className="brand__word">TutorNearMe</span>
    </Link>
  );
}
