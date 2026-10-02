import { ArrowUpRight, BadgeCheck, Bookmark, Clock3, MapPin, Star } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value);

export default function TutorCard({ tutor, saved, onSave, onOpen }) {
  return (
    <article className={`tutor-card ${tutor.featured ? 'tutor-card--featured' : ''}`}>
      <div className="tutor-card__top">
        <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} size={tutor.featured ? 'xl' : 'lg'} />
        <div className="tutor-card__identity">
          {tutor.featured && <span className="eyebrow tutor-card__featured-label">Gia sư nổi bật</span>}
          <h3>{tutor.name}</h3>
          <p>{tutor.university}</p>
        </div>
        <button className={`icon-button tutor-card__save ${saved ? 'is-saved' : ''}`} type="button" onClick={() => onSave(tutor.id)} aria-label={saved ? `Bỏ lưu ${tutor.name}` : `Lưu ${tutor.name}`} aria-pressed={saved}>
          <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className="tutor-card__meta">
        <span className="tutor-card__rating"><Star size={15} fill="currentColor" aria-hidden="true" /> <strong>{tutor.rating}</strong> <span>({tutor.reviews} đánh giá)</span></span>
        {tutor.verified && <span className="tutor-card__verified"><BadgeCheck size={15} aria-hidden="true" /> Đã xác minh</span>}
      </div>

      {tutor.featured && <p className="tutor-card__intro">{tutor.intro}</p>}

      <div className="tutor-card__subjects" aria-label="Môn dạy">{tutor.subjects.map((subject) => <Badge key={subject}>{subject}</Badge>)}</div>

      <div className="tutor-card__facts">
        <span><MapPin size={16} aria-hidden="true" />{tutor.location}</span>
        <span><Clock3 size={16} aria-hidden="true" />{tutor.availability.join(' · ')}</span>
      </div>

      <div className="tutor-card__bottom">
        <div className="tutor-card__fee"><strong>{money(tutor.price)}đ</strong><span>/ buổi</span></div>
        <Button variant={tutor.featured ? 'primary' : 'secondary'} size="sm" onClick={() => onOpen(tutor)}>Xem hồ sơ <ArrowUpRight size={16} aria-hidden="true" /></Button>
      </div>
    </article>
  );
}
