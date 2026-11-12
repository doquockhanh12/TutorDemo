import { useLayoutEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  Heart,
  LockKeyhole,
  MapPin,
  Star,
  UserRound,
} from 'lucide-react';
import { useSavedTutors } from '../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Brand from '../../components/Brand.jsx';
import Button from '../../components/Button.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import LearnerAccountPanel from './LearnerAccountPanel.jsx';
import './search.css';
import './dashboard.css';

const dashboardTabIds = ['profile', 'saved', 'password'];

export default function LearnerDashboard() {
  const { hash, key: locationKey } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tutors = useScheduledTutors();
  const [saved, setSaved] = useSavedTutors();
  const requestedTab = searchParams.get('tab');
  const activeTab = hash === '#saved-tutors'
    ? 'saved'
    : dashboardTabIds.includes(requestedTab) ? requestedTab : 'profile';
  const savedTutors = tutors.filter((tutor) => saved.includes(tutor.id));

  useLayoutEffect(() => {
    if (activeTab === 'saved' && hash === '#saved-tutors') {
      const target = document.getElementById('saved-tutors');
      target?.scrollIntoView({ block: 'start', behavior: 'instant' });
      target?.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab, hash, locationKey]);

  return (
    <div className="public-page public-page--learner learner-search-page learner-dashboard-page density-comfortable">
      <LearnerHeader compact />

      <section className="learner-page-banner">
        <div className="learner-container">
          <Link className="flow-back" to="/learner/classes">
            <ArrowLeft size={17} aria-hidden="true" /> Quay lại Lớp học của tôi
          </Link>
          <div className="learner-page-banner__row">
            <div>
              <h1>Quản lý tài khoản người học</h1>
              <p>Cập nhật thông tin liên hệ, địa chỉ học tập và quản lý danh sách gia sư bạn đã lưu yêu thích.</p>
            </div>
            <div className="learner-dashboard-nav-pills" role="tablist" aria-label="Chức năng tài khoản">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'profile'}
                className={`learner-schedule-tab ${activeTab === 'profile' ? 'is-active' : ''}`}
                onClick={() => setSearchParams({ tab: 'profile' })}
              >
                <UserRound size={17} aria-hidden="true" /> Hồ sơ cá nhân
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'saved'}
                className={`learner-schedule-tab ${activeTab === 'saved' ? 'is-active' : ''}`}
                onClick={() => setSearchParams({ tab: 'saved' })}
              >
                <Heart size={17} aria-hidden="true" /> Gia sư yêu thích ({savedTutors.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'password'}
                className={`learner-schedule-tab ${activeTab === 'password' ? 'is-active' : ''}`}
                onClick={() => setSearchParams({ tab: 'password' })}
              >
                <LockKeyhole size={17} aria-hidden="true" /> Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="learner-container learner-dashboard-main">
        <div className="learner-dashboard-content">
          {activeTab === 'profile' && (
            <section aria-labelledby="learner-dashboard-profile-heading">
              <PageHeading
                id="learner-dashboard-profile-heading"
                title="Hồ sơ cá nhân"
                description="Thông tin này giúp gia sư biết khu vực học và phương thức liên lạc khi xác nhận buổi học."
              />
              <LearnerAccountPanel startEditingInitially />
            </section>
          )}

          {activeTab === 'saved' && (
            <SavedTutors tutors={savedTutors} saved={saved} setSaved={setSaved} />
          )}

          {activeTab === 'password' && <PasswordPanel />}
        </div>
      </main>
    </div>
  );
}

function PageHeading({ id, title, description }) {
  return (
    <header className="learner-dashboard-page-heading">
      <h1 id={id}>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

function SavedTutors({ tutors, saved, setSaved }) {
  return (
    <section id="saved-tutors" tabIndex={-1} aria-labelledby="saved-tutors-title">
      <PageHeading
        id="saved-tutors-title"
        title="Gia sư yêu thích"
        description="Tìm lại những gia sư bạn đã thả tim yêu thích để xem hồ sơ hoặc đặt lịch học bất cứ lúc nào."
      />
      <div className="learner-dashboard-panel">
        {tutors.length ? (
          <div className="learner-dashboard-saved-list">
            {tutors.map((tutor) => (
              <article key={tutor.id} className="learner-saved-tutor-item">
                <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} size="lg" />
                <div className="learner-saved-tutor-item__info">
                  <div className="learner-saved-tutor-item__head">
                    <Link to={`/tutors/${tutor.id}`} state={{ from: '/learner/dashboard', fromLabel: 'Quay lại Trang chủ' }}><strong>{tutor.name}</strong></Link>
                    {tutor.verified && (
                      <span className="tutor-card__verified">
                        <BadgeCheck size={14} aria-hidden="true" /> Đã xác minh SV
                      </span>
                    )}
                    {Number.isFinite(tutor.rating) && (
                      <span className="tutor-card__rating">
                        <Star size={14} fill="currentColor" aria-hidden="true" />
                        <strong>{tutor.rating.toFixed(1)}</strong>
                      </span>
                    )}
                  </div>
                  <p><GraduationCap size={14} aria-hidden="true" /> {tutor.university} · {tutor.subjects.join(' · ')}</p>
                  <small><MapPin size={14} aria-hidden="true" />{tutor.location} · <strong>{tutor.price.toLocaleString('vi-VN')}đ/buổi</strong></small>
                </div>
                <div className="learner-saved-tutor-item__actions">
                  <Link
                    className="button button--secondary button--sm"
                    to={`/tutors/${tutor.id}`}
                    state={{ from: '/learner/dashboard', fromLabel: 'Quay lại Trang chủ' }}
                  >
                    Xem hồ sơ <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                  <button
                    className="learner-dashboard-unsave learner-heart-btn is-saved"
                    type="button"
                    aria-label={`Bỏ lưu ${tutor.name}`}
                    onClick={() => setSaved(saved.filter((id) => id !== tutor.id))}
                  >
                    <Heart size={19} fill="currentColor" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty icon={Heart} title="Lưu lại gia sư bạn yêu thích" text="Nhấn biểu tượng trái tim màu đỏ trên thẻ hoặc hồ sơ gia sư để dễ tìm lại và so sánh." />
        )}
        <Link className="learner-dashboard-text-link" to="/learner/search">
          Khám phá thêm gia sư <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function PasswordPanel() {
  const [fields, setFields] = useState({ current: '', next: '', confirm: '' });
  const [feedback, setFeedback] = useState('');

  const update = (field, value) => {
    setFields((current) => ({ ...current, [field]: value }));
    setFeedback('');
  };

  const submit = (event) => {
    event.preventDefault();
    setFeedback(fields.next === fields.confirm
      ? 'Đã cập nhật mật khẩu bảo mật thành công.'
      : 'Mật khẩu mới và phần xác nhận chưa khớp.');
  };

  return (
    <section aria-labelledby="learner-dashboard-password-heading">
      <PageHeading
        id="learner-dashboard-password-heading"
        title="Đổi mật khẩu"
        description="Cập nhật mật khẩu định kỳ để tăng cường bảo mật cho tài khoản của bạn."
      />
      <div className="learner-dashboard-panel">
        <form className="learner-dashboard-form learner-dashboard-password-form" onSubmit={submit}>
          <label>Mật khẩu hiện tại *<input type="password" autoComplete="current-password" required value={fields.current} onChange={(event) => update('current', event.target.value)} /></label>
          <label>Mật khẩu mới *<input type="password" autoComplete="new-password" minLength={8} required value={fields.next} onChange={(event) => update('next', event.target.value)} /></label>
          <label>Xác nhận mật khẩu mới *<input type="password" autoComplete="new-password" minLength={8} required value={fields.confirm} onChange={(event) => update('confirm', event.target.value)} /></label>
          {feedback && <p className="learner-dashboard-note" role="status">{feedback}</p>}
          <div className="learner-dashboard-form-actions"><Button type="submit">Cập nhật mật khẩu</Button></div>
        </form>
      </div>
    </section>
  );
}

function Empty({ icon: Icon, title, text }) {
  return (
    <div className="learner-dashboard-empty">
      <Icon size={27} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
