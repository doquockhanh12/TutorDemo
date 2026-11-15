export default function TutorMap({ learner, tutor, first, second, onSelect, tutors }) {
  const learnerPoint = learner || (second ? first : null);
  const activeTutor = tutor || second || first;

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
      {learnerPoint && activeTutor && (
        <path
          d={`M${learnerPoint.x} ${learnerPoint.y} L${activeTutor.x} ${activeTutor.y}`}
          className="tutor-map__connection"
        />
      )}
      {learnerPoint && (
        <g
          transform={`translate(${learnerPoint.x} ${learnerPoint.y})`}
          className="tutor-map__pin tutor-map__pin--learner"
          aria-label={`Vị trí của bạn (${learnerPoint.location || 'Quận 1'})`}
        >
          <circle r="25" />
          <text textAnchor="middle" dominantBaseline="central">BẠN</text>
        </g>
      )}
      {tutors.map((item) => {
        const active = activeTutor && item.id === activeTutor.id;
        return (
          <g
            key={item.id}
            transform={`translate(${item.x} ${item.y})`}
            className={`tutor-map__pin ${active ? 'is-selected' : ''}`}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `Chọn gia sư ${item.name}, ${item.location}` : undefined}
            aria-pressed={onSelect ? active : undefined}
            onClick={onSelect ? () => onSelect(item) : undefined}
            onKeyDown={onSelect ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(item);
              }
            } : undefined}
          >
            <circle r="25" />
            <text textAnchor="middle" dominantBaseline="central">{item.initials}</text>
          </g>
        );
      })}
    </svg>
  );
}
