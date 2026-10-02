export default function Avatar({ initials, name, tone = 'sage', size = 'md' }) {
  return (
    <span className={`avatar avatar--${tone} avatar--${size}`} role="img" aria-label={`Ảnh đại diện của ${name}`}>
      <span aria-hidden="true">{initials}</span>
    </span>
  );
}
