import { mapTutors } from '../../data/tutorMap.js';

export default function TutorMap({ first, second, onSelect }) {
  return (
    <svg className="tutor-map" viewBox="0 0 600 440" aria-label="Bản đồ minh họa khu vực gia sư">
      <rect width="600" height="440" className="tutor-map__ground" />
      <path d="M320 -20 C250 90 400 160 345 245 S365 360 320 460" className="tutor-map__river" />
      <path d="M-20 105 L620 235 M-20 345 L620 95 M90 -20 L180 460 M460 -20 L430 460 M-20 245 L620 365" className="tutor-map__roads" />
      <g className="tutor-map__labels">
        <text x="95" y="110">PHÚ NHUẬN</text>
        <text x="205" y="255">BÌNH THẠNH</text>
        <text x="450" y="95">THỦ ĐỨC</text>
        <text x="45" y="385">QUẬN 3</text>
      </g>
      {first && second && <path d={`M${first.x} ${first.y} L${second.x} ${second.y}`} className="tutor-map__connection" />}
      {mapTutors.map((tutor) => {
        const active = tutor.id === first?.id || tutor.id === second?.id;
        return (
          <g
            key={tutor.id}
            transform={`translate(${tutor.x} ${tutor.y})`}
            className={`tutor-map__pin ${active ? 'is-selected' : ''}`}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `Chọn ${tutor.name}, ${tutor.location}` : undefined}
            aria-pressed={onSelect ? active : undefined}
            onClick={onSelect ? () => onSelect(tutor) : undefined}
            onKeyDown={onSelect ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(tutor);
              }
            } : undefined}
          >
            <circle r="25" />
            <text textAnchor="middle" dominantBaseline="central">{tutor.initials}</text>
          </g>
        );
      })}
    </svg>
  );
}
