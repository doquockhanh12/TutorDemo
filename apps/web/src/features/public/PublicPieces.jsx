import { useState } from 'react';
import { ArrowRight, BadgeCheck, Bookmark, Clock3, MapPin, Star } from 'lucide-react';
import { money } from '../../data/public.js';
import { AuthLink } from '../auth/AuthNavigation.jsx';

export function PublicTutorCard({ tutor, saved, onSave, onOpen, to, featured = false }) {
  return <article className={`public-tutor-card ${featured ? 'public-tutor-card--featured' : ''}`}>
    <div className={`public-tutor-card__portrait tone-${tutor.tone}`}><img src={tutor.image} alt={`Ảnh minh họa gia sư ${tutor.name}`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }}/><span aria-hidden="true">{tutor.initials}</span></div>
    <div className="public-tutor-card__content"><div className="public-tutor-card__top"><span className="public-tag">{tutor.verified && <BadgeCheck size={14}/>} {tutor.verified ? 'Hồ sơ demo đã xác minh' : 'Hồ sơ demo'}</span><button type="button" className={`public-save ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Bỏ lưu ${tutor.name}` : `Lưu ${tutor.name}`} aria-pressed={saved} onClick={() => onSave(tutor.id)}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'}/></button></div><h3>{tutor.name}</h3><p className="public-tutor-card__university">{tutor.university}</p><div className="public-tutor-card__rating"><Star size={16} fill="currentColor"/> <strong>{tutor.rating}</strong><span>{tutor.reviews} đánh giá</span></div><p className="public-tutor-card__bio">{tutor.bio}</p><div className="public-tutor-card__facts"><span>{tutor.subject}</span><span><MapPin size={15}/>{tutor.area}</span><span><Clock3 size={15}/>{tutor.time}</span></div><div className="public-tutor-card__bottom"><div><strong>{money(tutor.fee)}đ</strong><small>/ buổi</small></div>{to ? <AuthLink to={to} className="public-btn public-btn--blue">Xem hồ sơ <ArrowRight size={16}/></AuthLink> : <button type="button" onClick={() => onOpen(tutor)} className="public-btn public-btn--blue">Xem hồ sơ <ArrowRight size={16}/></button>}</div></div>
  </article>;
}

const pins = [
  { id: 0, left: '30%', top: '30%' }, { id: 1, left: '68%', top: '27%' }, { id: 2, left: '57%', top: '68%' }, { id: 3, left: '22%', top: '70%' },
];
export function MapPreview({ tutors, onOpen }) {
  const [selected, setSelected] = useState(0);
  const tutor = tutors[selected];
  return <div className="public-map" aria-label="Bản đồ khu vực minh họa"><div className="public-map__road public-map__road--a"/><div className="public-map__road public-map__road--b"/><div className="public-map__road public-map__road--c"/><div className="public-map__park"/><span className="public-map__area public-map__area--a">BÌNH THẠNH</span><span className="public-map__area public-map__area--b">THỦ ĐỨC</span><span className="public-map__area public-map__area--c">QUẬN 3</span>{pins.map((pin) => <button type="button" key={pin.id} style={{ left: pin.left, top: pin.top }} className={`public-map__pin ${selected === pin.id ? 'is-active' : ''}`} aria-label={`Xem gia sư ${tutors[pin.id].name}`} onClick={() => setSelected(pin.id)}><MapPin size={21} fill="currentColor"/></button>)}<div className="public-map__tooltip"><span className="public-map__tooltip-avatar">{tutor.initials}</span><div><strong>{tutor.name}</strong><small>{tutor.subject} · {tutor.area}</small></div><button type="button" onClick={() => onOpen(tutor)} aria-label={`Xem hồ sơ ${tutor.name}`}><ArrowRight size={17}/></button></div><span className="public-map__notice">Khu vực minh họa · Không hiển thị địa chỉ chính xác</span></div>;
}

export function DemoLink({ to, children, className = '' }) { return <AuthLink className={`public-btn ${className}`} to={to}>{children} <ArrowRight size={17}/></AuthLink>; }
