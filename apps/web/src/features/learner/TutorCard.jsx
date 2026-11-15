import { ArrowUpRight, BadgeCheck, Clock3, GraduationCap, Heart, MapPin, Sparkles, Star } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import { Link } from 'react-router-dom';
import { usePublicTutorSchedule } from '../tutor/TutorWorkspaceState.jsx';
import { rangesSummary } from '../../data/tutorSchedule.js';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value);

function getSubjectTone(subject = '') {
  const s = subject.toLocaleLowerCase('vi-VN');
  if (s.includes('toán') || s.includes('tin')) return 'brand';
  if (s.includes('anh') || s.includes('ielts') || s.includes('toeic')) return 'info';
  if (s.includes('lý') || s.includes('hóa') || s.includes('sinh')) return 'success';
  if (s.includes('văn') || s.includes('sử') || s.includes('địa')) return 'warning';
  return 'brand';
}

export default function TutorCard({ tutor, saved, onSave }) {
  const { ranges } = usePublicTutorSchedule(tutor);
  const scheduleSummary = rangesSummary(ranges).replace(/\s*\u00b7\s*/g, ', ');

  return (
    <article className={`tutor-card ${tutor.featured ? 'tutor-card--featured' : ''}`}>
      {tutor.featured && (
        <div className="tutor-card__featured-ribbon">
          <Sparkles size={13} aria-hidden="true" />
          <span>Gia sư tiêu biểu</span>
        </div>
      )}

      <div className="tutor-card__top">
        <div className="tutor-card__avatar-wrap">
          <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} size={tutor.featured ? 'xl' : 'lg'} />
          {tutor.verified && (
            <span className="tutor-card__avatar-badge" title="Đã xác minh hồ sơ sinh viên" aria-hidden="true">
              <BadgeCheck size={15} />
            </span>
          )}
        </div>

        <div className="tutor-card__identity">
          <h3>
            <Link
              to={`/tutors/${tutor.id}`}
              state={{ from: '/learner/search', fromLabel: 'Quay lại Tìm gia sư' }}
              className="tutor-card__name-link"
            >
              {tutor.name}
            </Link>
          </h3>
          {tutor.university && (
            <p className="tutor-card__university">
              <GraduationCap size={14} aria-hidden="true" />
              <span>{tutor.university}</span>
            </p>
          )}
        </div>

        <button
          className={`icon-button tutor-card__save learner-heart-btn ${saved ? 'is-saved' : ''}`}
          type="button"
          onClick={() => onSave(tutor.id)}
          aria-label={saved ? `Bỏ lưu ${tutor.name}` : `Lưu ${tutor.name}`}
          aria-pressed={saved}
        >
          <Heart size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className="tutor-card__meta">
        {Number.isFinite(tutor.rating) ? (
          <span className="tutor-card__rating">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            <strong>{tutor.rating.toFixed(1)}</strong>
            <span>({tutor.reviews} đánh giá)</span>
          </span>
        ) : (
          <span className="tutor-card__rating tutor-card__rating--empty">Mới tham gia</span>
        )}
        {tutor.verified && (
          <span className="tutor-card__verified">
            <BadgeCheck size={14} aria-hidden="true" /> Đã xác minh SV
          </span>
        )}
      </div>

      {tutor.intro && (
        <p className="tutor-card__intro">{tutor.intro}</p>
      )}

      <div className="tutor-card__subjects" aria-label="Môn dạy">
        {tutor.subjects.map((subject) => (
          <Badge key={subject} tone={getSubjectTone(subject)}>{subject}</Badge>
        ))}
        {tutor.formats?.map((format) => (
          <span key={format} className="tutor-card__format-pill">{format}</span>
        ))}
      </div>

      <div className="tutor-card__facts">
        <span>
          <MapPin size={15} aria-hidden="true" />
          <strong>Khu vực:</strong> {tutor.location}
        </span>
        <span>
          <Clock3 size={15} aria-hidden="true" />
          <strong>Lịch rảnh:</strong> {scheduleSummary}
        </span>
      </div>

      <div className="tutor-card__bottom">
        <div className="tutor-card__fee">
          <small>Học phí tham khảo</small>
          <div>
            <strong>{money(tutor.price)}đ</strong>
            <span>/ buổi</span>
          </div>
        </div>
        <Link
          className={`button button--${tutor.featured ? 'primary' : 'secondary'} button--sm tutor-card__cta`}
          to={`/tutors/${tutor.id}`}
          state={{ from: '/learner/search', fromLabel: 'Quay lại Tìm gia sư' }}
        >
          Xem hồ sơ <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
