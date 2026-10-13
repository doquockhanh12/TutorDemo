export default function Avatar({ initials, name, tone = 'blue', size = 'md', imageUrl = '' }) {
  return (
    <span className={`avatar avatar--${tone} avatar--${size}`} role="img" aria-label={`Ảnh đại diện của ${name}`}>
      {imageUrl && <img className="avatar__image" src={imageUrl} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.hidden = true; }} />}
      <span aria-hidden="true">{initials}</span>
    </span>
  );
}
