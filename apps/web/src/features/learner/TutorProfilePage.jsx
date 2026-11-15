import { useLearnerTutorProfile, useLearnerProfileReviews } from './hooks/useLearnerTutorProfile.js';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  FileCheck2,
  Flag,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  ShieldCheck,
  Star,
} from 'lucide-react';

import Avatar from '../../components/Avatar.jsx';
import Brand from '../../components/Brand.jsx';
import { useSavedTutors } from '../domain/DemoDomainContext.jsx';

import BookingModal from './BookingModal.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import ProfileCalendar from './ProfileCalendar.jsx';
import TutorReportForm from './TutorReportForm.jsx';

import './search.css';
import './profile.css';

export default function TutorProfilePage() {
  const { id } = useParams();
  const { tutor, reviews } = useLearnerTutorProfile(id);
  const location = useLocation();
  const { hash } = location;

  useLayoutEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));

    if (target) {
      target.scrollIntoView({ behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [id, hash]);

  const backTo = location.state?.from || '/learner/search';
  const backLabel = location.state?.fromLabel || 'Quay lại Tìm gia sư';

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable tutor-profile-shell bg-slate-50 min-h-screen">
      <LearnerHeader compact />

      <main className="tutor-profile-page bg-slate-50 min-h-screen pt-2.5 pb-8">
        <div className="tutor-profile-page__container max-w-6xl mx-auto px-4 flex flex-col gap-3">
          <Link className="profile-back-link" to={backTo}>
            <ArrowLeft size={17} aria-hidden="true" />
            {backLabel}
          </Link>

          {tutor ? (
            <ProfileContent key={id} tutor={tutor} reviews={reviews} />
          ) : (
            <section className="learner-empty">
              <h1>Không tìm thấy gia sư</h1>
              <p>Hồ sơ gia sư này hiện không tồn tại hoặc đã ngừng nhận lớp.</p>
              <Link className="button button--primary button--md" to="/learner/search">
                Trở về tìm kiếm
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileContent({ tutor, reviews: allReviews }) {
  const { visibleReviews, ratingSummary, featuredReviews, credentials, distribution } = useLearnerProfileReviews(tutor, allReviews);
  const { hash } = useLocation();
  const [savedTutors, setSavedTutors] = useSavedTutors();
  const [bookingOpen, setBookingOpen] = useState(hash === '#profile-request');
  const [videoNotice, setVideoNotice] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotice, setReportNotice] = useState('');

  useEffect(() => {
    if (hash === '#profile-request') setBookingOpen(true);
  }, [hash]);

  const isSaved = savedTutors.includes(tutor.id);
  const price = new Intl.NumberFormat('vi-VN').format(tutor.price);

  const toggleSaved = () => {
    setSavedTutors((current) => isSaved
      ? current.filter((value) => value !== tutor.id)
      : [...current, tutor.id]);
  };

  return (
    <>
      <div className="profile-landing flex flex-col gap-6">
        <div className="profile-landing__hero grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="profile-landing__media lg:col-span-8">
            <TutorMediaBox
              tutor={tutor}
              notice={videoNotice}
              onPlay={() => setVideoNotice(true)}
            />
          </div>

          <section className="profile-bento__box profile-bento__cta profile-landing__cta bg-white rounded-3xl p-8 shadow-sm flex flex-col gap-4 lg:col-span-4" aria-label="Học phí và liên hệ">
            <span className="profile-bento__eyebrow">HỌC PHÍ THEO BUỔI</span>
            <p className="profile-bento__price">
              {price}đ <small>/ buổi</small>
            </p>
            <button
              className="button button--primary button--md profile-bento__book"
              type="button"
              onClick={() => setBookingOpen(true)}
            >
              ĐẶT LỊCH HỌC
            </button>
            <Link
              to={`/learner/messages?tutorId=${tutor.id}`}
              className="button button--secondary button--md profile-bento__message"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Nhắn tin
            </Link>
          </section>
        </div>

        <TutorIdentityBox
          tutor={tutor}
          isSaved={isSaved}
          onToggleSaved={toggleSaved}
          ratingSummary={ratingSummary}
          onReport={() => { setReportNotice(''); setReportOpen(true); }}
        />
        {reportNotice && <p className="tutor-report-feedback" role="status">{reportNotice}</p>}

        <section className="profile-bento__box profile-bento__intro profile-landing__intro bg-white rounded-3xl shadow-sm p-8">
          <div className="profile-bento__section-heading">
            <h2>Giới thiệu & phương pháp giảng dạy</h2>
          </div>
          <div className="profile-bento__intro-copy">
            <article>
              <h3>Đôi nét về {tutor.name}</h3>
              <p>{tutor.intro || 'Gia sư chưa cập nhật phần giới thiệu.'}</p>
            </article>
            <article>
              <h3>Cách đồng hành</h3>
              <p>{tutor.approach || 'Gia sư chưa cập nhật phương pháp giảng dạy.'}</p>
            </article>
          </div>
          <p className="profile-bento__detail-note">
            Địa điểm cụ thể sẽ được trao đổi khi gia sư phản hồi yêu cầu.
          </p>
        </section>

        <ProfileCalendar
          tutor={tutor}
          readOnly
          id="profile-calendar-overview"
          className="profile-bento__box profile-bento__schedule profile-landing__schedule"
        />

        <TutorCredentialsBox docs={credentials} />

        <TutorReviews
          reviews={featuredReviews}
          allReviews={visibleReviews}
          distribution={distribution}
          ratingSummary={ratingSummary}
        />
      </div>

      <BookingModal
        tutor={tutor}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
      {reportOpen && <TutorReportForm tutorId={tutor.id} tutorName={tutor.name} onClose={() => setReportOpen(false)} onSuccess={() => { setReportOpen(false); setReportNotice('Đã gửi báo cáo. Quản trị viên sẽ xem xét.'); }} />}
    </>
  );
}

function TutorMediaBox({ tutor, notice, onPlay }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (tutor.videoUrl) {
    return (
      <section className="profile-bento__box profile-bento__media aspect-video rounded-3xl" aria-label={`Video giới thiệu của ${tutor.name}`}>
        <video controls playsInline poster={tutor.image} src={tutor.videoUrl}>
          Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      </section>
    );
  }

  return (
    <section className="profile-bento__box profile-bento__media aspect-video rounded-3xl" aria-label={`Ảnh giới thiệu của ${tutor.name}`}>
      <div className="profile-bento__poster-fallback" aria-hidden="true">
        <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} size="xl" />
      </div>
      {!imageFailed && tutor.image && (
        <img
          className="profile-bento__poster"
          src={tutor.image}
          alt={`Ảnh hồ sơ của ${tutor.name}`}
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="profile-bento__media-shade" aria-hidden="true" />
      <span className="profile-bento__media-label">
        <BookOpen size={16} aria-hidden="true" />
        HỒ SƠ GIA SƯ
      </span>
      <button className="profile-bento__play" type="button" onClick={onPlay} aria-label="Phát video giới thiệu">
        <Play size={24} fill="currentColor" aria-hidden="true" />
      </button>
      <div className="profile-bento__media-caption">
        <span>GIỚI THIỆU</span>
        <strong>{tutor.name}</strong>
        <small>{tutor.subjects?.slice(0, 2).join(' · ')}</small>
      </div>
      {notice && (
        <p className="profile-bento__media-notice" role="status">
          Video giới thiệu chưa có trong hồ sơ này.
        </p>
      )}
    </section>
  );
}

function TutorReviews({ reviews, allReviews, ratingSummary, distribution }) {
  return (
    <section className="profile-bento__box profile-bento__reviews bg-white rounded-3xl shadow-sm p-8" aria-labelledby="profile-reviews-title">
      <div className="profile-bento__section-heading">
        <h2 id="profile-reviews-title">Đánh giá từ học viên</h2>
      </div>

      {ratingSummary.hasReviews ? (
        <div className="profile-bento__rating-summary">
          <div className="profile-bento__rating-total">
            <strong>{ratingSummary.averageRating.toFixed(1)}</strong>
            <div aria-label={`${ratingSummary.averageRating} trên 5 sao`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={15} fill="currentColor" aria-hidden="true" />
              ))}
            </div>
            <span>{ratingSummary.reviewCount} đánh giá công khai</span>
          </div>

          <div className="profile-bento__rating-bars" aria-label="Phân bố đánh giá">
            {distribution.map(({ rating, count, percentage }) => {
              return (
                <div className="profile-bento__rating-row" key={rating}>
                  <span>{rating} sao</span>
                  <div
                    className="profile-bento__progress"
                    role="progressbar"
                    aria-label={`${rating} sao`}
                    aria-valuemin={0}
                    aria-valuemax={ratingSummary.reviewCount}
                    aria-valuenow={count}
                  >
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="profile-bento__empty">Gia sư chưa có đánh giá công khai.</p>
      )}

      <div className="profile-bento__review-list">
        {reviews.length ? reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        )) : (
          <p className="profile-bento__empty">Nhận xét sẽ xuất hiện tại đây sau buổi học.</p>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review }) {
  const name = review.name || review.author || review.learnerName || 'Học viên';
  const initials = review.initials || name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase();
  const text = review.text || review.comment || review.excerpt || '';
  const date = review.date || (review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('vi-VN')
    : '');

  return (
    <article className="profile-bento__review">
      <Avatar initials={initials} name={name} size="sm" />
      <div className="profile-bento__review-content">
        <div className="profile-bento__review-meta">
          <strong>{name}</strong>
          {date && <time>{date}</time>}
        </div>
        <span className="profile-bento__review-rating">
          <Star size={14} fill="currentColor" aria-hidden="true" />
          {review.rating}/5
        </span>
        {text && <p>{text}</p>}
      </div>
    </article>
  );
}

function TutorIdentityBox({ tutor, isSaved, onToggleSaved, ratingSummary, onReport }) {
  const subjects = tutor.subjects || [];
  const areas = tutor.areas || [];

  return (
    <section className="profile-bento__box profile-landing__identity bg-white rounded-3xl shadow-sm p-6" aria-label="Thông tin gia sư">
      <div className="profile-landing__identity-main">
        <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} size="lg" />
        <div className="profile-landing__identity-name">
          <h1>{tutor.name}</h1>
          {ratingSummary.hasReviews ? (
            <div className="profile-bento__rating">
              <Star size={17} fill="currentColor" aria-hidden="true" />
              <strong>{ratingSummary.averageRating.toFixed(1)}</strong>
              <span>({ratingSummary.reviewCount} đánh giá)</span>
            </div>
          ) : (
            <p className="profile-bento__rating-empty">Chưa có đánh giá</p>
          )}
        </div>
      </div>

      <div className="profile-landing__identity-details">
        <p className="profile-bento__identity-meta">
          <BookOpen size={16} aria-hidden="true" />
          <span>{subjects.length ? subjects.join(' · ') : 'Chưa cập nhật môn dạy'}</span>
        </p>
        <p className="profile-bento__identity-meta">
          <MapPin size={16} aria-hidden="true" />
          <span>{areas.length ? areas.join(' · ') : (tutor.location || 'Chưa cập nhật khu vực')}</span>
        </p>
        {tutor.university && (
          <p className="profile-bento__identity-meta">
            <GraduationCap size={16} aria-hidden="true" />
            <span>{tutor.university}</span>
          </p>
        )}
        {tutor.experience && (
          <p className="profile-bento__identity-meta">
            <BadgeCheck size={16} aria-hidden="true" />
            <span>{tutor.experience}</span>
          </p>
        )}
      </div>

      <div className="profile-landing__identity-actions profile-identity-report-actions">
        {tutor.verified && (
          <span className="profile-bento__verified">
            <BadgeCheck size={16} aria-hidden="true" />
            Đã xác minh SV
          </span>
        )}
        <div className="profile-identity-report-buttons">
        <button
          className={`profile-landing__save learner-heart-pill w-32 justify-center${isSaved ? ' is-saved' : ''}`}
          type="button"
          aria-label={isSaved ? 'Bỏ lưu gia sư' : 'Lưu hồ sơ'}
          aria-pressed={isSaved}
          onClick={onToggleSaved}
        >
          <Heart size={19} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
          {isSaved ? 'Đã lưu' : 'Yêu thích'}
        </button>
        <button className="button button--secondary button--sm profile-identity-report-button" type="button" onClick={onReport}><Flag size={17} aria-hidden="true" />Báo cáo gia sư</button>
        </div>
      </div>
    </section>
  );
}

function TutorCredentialsBox({ docs }) {
  return (
    <section className="profile-bento__box profile-bento__credentials bg-white rounded-3xl shadow-sm p-8" aria-labelledby="profile-credentials-title">
      <div className="profile-bento__section-heading">
        <h2 id="profile-credentials-title">Chứng chỉ & Minh chứng chuyên môn</h2>
      </div>
      <div className="profile-credentials-grid">
        {docs.map((doc) => (
          <article key={doc.id || doc.title} className="profile-credential-card">
            <div className="profile-credential-card__icon" aria-hidden="true">
              <FileCheck2 size={22} />
            </div>
            <div className="profile-credential-card__info">
              <h3>{doc.title}</h3>
              <p>Đơn vị cấp: {doc.issuedBy || 'Trường Đại học'}</p>
            </div>
            <span className="profile-credential-card__badge">
              <ShieldCheck size={15} aria-hidden="true" /> Đã đối chiếu ({doc.fileType || 'PDF'})
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
