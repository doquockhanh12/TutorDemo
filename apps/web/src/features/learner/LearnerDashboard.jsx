import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, Heart, Search, MapPin } from 'lucide-react';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { useSavedTutors } from '../domain/DemoDomainContext.jsx';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import { useLearnerRequests } from '../domain/DemoDomainContext.jsx';
import { requestLabel, requestTone } from '../domain/statusMetadata.js';
import LearnerHeader from './LearnerHeader.jsx';
import LearnerAccountPanel from './LearnerAccountPanel.jsx';
import './search.css';
import './dashboard.css';

export default function LearnerDashboard() {
  const { user } = useDemoAuth();
  const tutors = useScheduledTutors();
  const [saved, setSaved] = useSavedTutors();
  const [requests] = useLearnerRequests();
  const savedTutors = tutors.filter((tutor) => saved.includes(tutor.id));
  const confirmed = requests.filter((request) => request.status === 'accepted' && !request.completed);
  const pending = requests.filter((request) => request.status === 'pending');
  const initials = (user.fullName || user.username).split(' ').slice(-2).map((part) => part[0]).join('');
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return <div className="public-page public-page--learner learner-search-page learner-dashboard-page density-comfortable">
    <LearnerHeader />
    <main className="learner-container learner-dashboard-main">
      <header className="learner-dashboard-welcome"><div><span className="learner-dashboard-kicker">KHÔNG GIAN NGƯỜI HỌC</span><h1>Việc học của bạn,<br /><span>gọn trong một nơi.</span></h1><p>Quản lý hồ sơ, theo dõi yêu cầu và kết nối với gia sư phù hợp.</p><Link className="learner-dashboard-primary-link" to="/learner/search"><Search size={18} />Tìm gia sư<ArrowRight size={18} /></Link></div>
        <div className="learner-dashboard-identity"><Avatar initials={initials} name={user.fullName || user.username} size="lg" /><strong>Xin chào, {user.fullName || user.username}!</strong><span>@{user.username} · {user.accountType === 'parent' ? 'Phụ huynh' : 'Người học'}</span><a href="#account-profile">Xem và cập nhật hồ sơ <ArrowRight size={16} /></a></div></header>
      <div className="learner-dashboard-stats"><Stat icon={BookOpen} value={pending.length} label="Yêu cầu chờ phản hồi" to="/requests" /><Stat icon={CalendarDays} value={confirmed.length} label="Yêu cầu đã xác nhận" to="/requests" /><Stat icon={Heart} value={savedTutors.length} label="Gia sư đã lưu" to="#saved-tutors" anchor /></div>
      <nav className="learner-dashboard-shortcuts" aria-label="Mục trong tài khoản"><a href="#account-profile">Thông tin cá nhân</a><a href="#account-address">Địa chỉ</a><a href="#learning-requests">Yêu cầu học</a><a href="#saved-tutors">Gia sư đã lưu</a></nav>
      <div className="learner-dashboard-grid"><div className="learner-dashboard-column"><LearnerAccountPanel /><LearnerAccountPanel addressOnly />
        <section className="learner-dashboard-panel" id="saved-tutors"><div className="learner-dashboard-section-head"><div><span className="learner-dashboard-kicker">DANH SÁCH QUAN TÂM</span><h2><Heart size={21} />Gia sư đã lưu <span className="learner-dashboard-count">{savedTutors.length}</span></h2></div></div>
          {savedTutors.length ? <div className="learner-dashboard-saved-list">{savedTutors.map((tutor) => <article key={tutor.id}><Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} /><div><Link to={`/tutors/${tutor.id}`}><strong>{tutor.name}</strong></Link><p>{tutor.subjects.join(' · ')}</p><small><MapPin size={14} />{tutor.location} · {tutor.price.toLocaleString('vi-VN')}đ/buổi</small></div><button className="learner-dashboard-unsave" aria-label={`Bỏ lưu ${tutor.name}`} onClick={() => setSaved(saved.filter((id) => id !== tutor.id))}><Heart size={19} fill="currentColor" /></button></article>)}</div> : <Empty icon={Heart} title="Lưu lại gia sư bạn yêu thích" text="Nhấn biểu tượng trái tim trên hồ sơ gia sư để dễ tìm lại và so sánh." />}
          <Link className="learner-dashboard-text-link" to="/learner/search">Khám phá thêm gia sư <ArrowRight size={16} /></Link>
        </section></div>
        <aside className="learner-dashboard-column"><section className="learner-dashboard-panel" id="learning-requests"><div className="learner-dashboard-section-head"><div><span className="learner-dashboard-kicker">THEO DÕI KẾT NỐI</span><h2><BookOpen size={21} />Yêu cầu học gần đây</h2></div></div>
          {requests.length ? <div className="learner-dashboard-request-list">{requests.slice(-3).reverse().map((request) => { const tutor = tutors.find((item) => item.id === request.tutorId); return <Link to={`/requests/${request.id}`} key={request.id}><div><strong>{request.subject}</strong><ArrowRight size={17} /></div><p>{tutor?.name || 'Gia sư'} · {request.goal}</p><Badge tone={requestTone(request)}>{requestLabel(request)}</Badge></Link>; })}</div> : <Empty icon={BookOpen} title="Chưa có yêu cầu học" text="Chọn gia sư phù hợp và gửi yêu cầu ngay từ hồ sơ của họ." />}
          <Link className="learner-dashboard-text-link" to="/requests">Xem tất cả yêu cầu <ArrowRight size={16} /></Link></section>
          <section className="learner-dashboard-schedule"><span className="learner-dashboard-kicker">SẮP XẾP VIỆC HỌC</span><h2><CalendarDays size={21} />Lịch đã xác nhận</h2>{confirmed.length ? confirmed.map((request) => <Link key={request.id} to={`/requests/${request.id}`}><strong>{request.subject}</strong><span>{request.schedule}</span><small>{tutors.find((tutor) => tutor.id === request.tutorId)?.name}</small></Link>) : <p>Lịch học sẽ xuất hiện khi yêu cầu của bạn được xác nhận.</p>}<p className="learner-dashboard-note">Lịch từ yêu cầu demo; xem chi tiết để kiểm tra các khung giờ đã chọn.</p></section>
        </aside></div>
      <p className="learner-dashboard-demo-note">Dữ liệu prototype được lưu trên trình duyệt này, chưa đồng bộ với thiết bị khác.</p>
    </main>
  </div>;
}
function Stat({ icon: Icon, value, label, to, anchor }) {
  const content = <><Icon size={22} /><div><strong>{value}</strong><span>{label}</span></div><ArrowRight size={17} /></>;
  return anchor ? <a href={to}>{content}</a> : <Link to={to}>{content}</Link>;
}
function Empty({ icon: Icon, title, text }) {
  return <div className="learner-dashboard-empty"><Icon size={27} /><strong>{title}</strong><p>{text}</p></div>;
}
