export default function StatItem({ label, value, note, icon: Icon }) {
  return (
    <div className="stat-item">
      <div className="stat-item__top"><span>{label}</span>{Icon && <Icon size={18} strokeWidth={1.7} aria-hidden="true" />}</div>
      <strong>{value}</strong>
      {note && <span className="stat-item__note">{note}</span>}
    </div>
  );
}
