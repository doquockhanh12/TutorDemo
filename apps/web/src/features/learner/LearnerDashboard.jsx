import { useLayoutEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Heart, MapPin } from 'lucide-react';
import { useSavedTutors } from '../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import Avatar from '../../components/Avatar.jsx';
import Button from '../../components/Button.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import LearnerAccountPanel from './LearnerAccountPanel.jsx';
import './search.css';
import './dashboard.css';

const dashboardTabIds = ['profile', 'saved', 'password'];

export default function LearnerDashboard() {
  const { hash, key: locationKey } = useLocation();
  const [searchParams] = useSearchParams();
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
      <main className="learner-container learner-dashboard-main">
        <div className="learner-dashboard-content">
          {activeTab === 'profile' && (
            <section aria-labelledby="learner-dashboard-profile-heading">
              <PageHeading
                id="learner-dashboard-profile-heading"
                kicker="THÔNG TIN TÀI KHOẢN"
                title="Hồ sơ cá nhân"
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

function PageHeading({ id, kicker, title, description }) {
  return (
    <header className="learner-dashboard-page-heading">
      <span className="learner-dashboard-kicker">{kicker}</span>
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
        kicker="DANH SÁCH QUAN TÂM"
        title="Gia sư yêu thích"
        description="Tìm lại những gia sư bạn muốn xem hoặc so sánh sau."
      />
      <div className="learner-dashboard-panel">
        {tutors.length ? (
          <div className="learner-dashboard-saved-list">
            {tutors.map((tutor) => (
              <article key={tutor.id}>
                <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} />
                <div>
                  <Link to={`/tutors/${tutor.id}`}><strong>{tutor.name}</strong></Link>
                  <p>{tutor.subjects.join(' · ')}</p>
                  <small><MapPin size={14} aria-hidden="true" />{tutor.location} · {tutor.price.toLocaleString('vi-VN')}đ/buổi</small>
                </div>
                <button
                  className="learner-dashboard-unsave"
                  type="button"
                  aria-label={`Bỏ lưu ${tutor.name}`}
                  onClick={() => setSaved(saved.filter((id) => id !== tutor.id))}
                >
                  <Heart size={19} fill="currentColor" aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <Empty icon={Heart} title="Lưu lại gia sư bạn yêu thích" text="Nhấn biểu tượng trái tim trên hồ sơ gia sư để dễ tìm lại và so sánh." />
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
      ? 'Đây là bản demo; mật khẩu đăng nhập chưa được thay đổi.'
      : 'Mật khẩu mới và phần xác nhận chưa khớp.');
  };

  return (
    <section aria-labelledby="learner-dashboard-password-heading">
      <PageHeading
        id="learner-dashboard-password-heading"
        kicker="BẢO MẬT TÀI KHOẢN"
        title="Đổi mật khẩu"
        description="Biểu mẫu đổi mật khẩu trong giao diện prototype."
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
