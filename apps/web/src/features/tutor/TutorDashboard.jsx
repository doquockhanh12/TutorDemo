import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Check, ChevronRight, Clock3, ClipboardList, LayoutDashboard, Menu, MessageSquare, Settings2, UserRound, Users, Wallet, X } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Brand from '../../components/Brand.jsx';
import Button from '../../components/Button.jsx';
import RoleSwitcher from '../../components/RoleSwitcher.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import SidebarItem from '../../components/SidebarItem.jsx';
import StatItem from '../../components/StatItem.jsx';
import { initialAvailability, initialLessons, initialRequests, tutorSummary, weeklyLessons } from '../../data/tutorDashboard.js';

const navigation = [
  { label: 'Tổng quan', icon: LayoutDashboard, to: '/tutor/dashboard' },
  { label: 'Yêu cầu học', icon: ClipboardList },
  { label: 'Lịch dạy', icon: CalendarDays },
  { label: 'Lịch rảnh', icon: Clock3 },
  { label: 'Học viên', icon: Users },
  { label: 'Môn dạy', icon: BookOpen },
  { label: 'Thu nhập', icon: Wallet },
  { label: 'Hồ sơ gia sư', icon: UserRound },
  { label: 'Tin nhắn', icon: MessageSquare },
  { label: 'Cài đặt', icon: Settings2 },
];

const statusLabel = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', accepted: 'Đã nhận', rejected: 'Đã từ chối' };

function TutorSidebar({ open, onClose, pendingCount }) {
  return (
    <aside className={`tutor-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng gia sư">
      <div className="tutor-sidebar__brand"><Brand compact /><button className="icon-button tutor-sidebar__close" type="button" onClick={onClose} aria-label="Đóng điều hướng"><X size={21} /></button></div>
      <div className="tutor-sidebar__workspace"><span className="eyebrow">KHÔNG GIAN GIA SƯ</span><strong>Mai Anh Nguyễn</strong><span>Hồ sơ đang hoạt động</span></div>
      <nav className="tutor-sidebar__nav" aria-label="Các mục của gia sư">
        <span className="sidebar-section-label">CÔNG VIỆC</span>
        {navigation.slice(0, 6).map((item) => <SidebarItem key={item.label} {...item} active={Boolean(item.to)} badge={item.label === 'Yêu cầu học' ? pendingCount : undefined} />)}
        <span className="sidebar-section-label">TÀI KHOẢN</span>
        {navigation.slice(6).map((item) => <SidebarItem key={item.label} {...item} />)}
      </nav>
      <div className="tutor-sidebar__footer"><Avatar initials="MA" name="Mai Anh Nguyễn" tone="sage" size="sm" /><div><strong>Mai Anh Nguyễn</strong><span>Gia sư</span></div></div>
    </aside>
  );
}

function LessonAgenda({ lessons, search }) {
  const visible = lessons.filter((lesson) => `${lesson.subject} ${lesson.learner}`.toLocaleLowerCase('vi-VN').includes(search.toLocaleLowerCase('vi-VN')));
  return (
    <section className="tutor-section tutor-agenda" aria-labelledby="upcoming-title">
      <div className="tutor-section__heading"><div><span className="eyebrow">ƯU TIÊN HÔM NAY</span><h2 id="upcoming-title">Buổi học sắp tới</h2></div><a className="text-link" href="#weekly-preview">Xem lịch tuần <ArrowRight size={16} /></a></div>
      {visible.length ? <div className="tutor-agenda__list">{visible.map((lesson) => <article className="tutor-lesson" key={lesson.id}>
        <div className="tutor-lesson__when"><strong>{lesson.day}</strong><span>{lesson.time}</span></div>
        <div className="tutor-lesson__body"><h3>{lesson.subject}</h3><p>{lesson.learner} <span aria-hidden="true">·</span> {lesson.place}</p></div>
        <Badge tone={lesson.status === 'confirmed' ? 'success' : 'warning'} dot>{statusLabel[lesson.status]}</Badge>
      </article>)}</div> : <p className="empty-line">Không có buổi học khớp với từ khóa.</p>}
    </section>
  );
}

function RequestInbox({ requests, onDecision, search }) {
  const visible = requests.filter((request) => `${request.learner} ${request.subject} ${request.area}`.toLocaleLowerCase('vi-VN').includes(search.toLocaleLowerCase('vi-VN')));
  return (
    <section className="tutor-section tutor-requests" aria-labelledby="requests-title">
      <div className="tutor-section__heading"><div><span className="eyebrow">CẦN PHẢN HỒI</span><h2 id="requests-title">Yêu cầu học mới</h2></div><span className="tutor-section__count">{requests.filter((item) => item.status === 'pending').length} đang chờ</span></div>
      {visible.length ? <div className="tutor-request-list">{visible.map((request) => <article className="tutor-request" key={request.id}>
        <div className="tutor-request__header"><Avatar initials={request.initials} name={request.learner} tone="sand" size="sm" /><div><h3>{request.learner}</h3><span>{request.received}</span></div><Badge tone={request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>{request.status === 'pending' ? 'Chờ phản hồi' : statusLabel[request.status]}</Badge></div>
        <div className="tutor-request__details"><strong>{request.subject}</strong><span>{request.area} · {request.schedule}</span></div>
        <p className="tutor-request__note">“{request.note}”</p>
        {request.status === 'pending' && <div className="tutor-request__actions"><Button size="sm" onClick={() => onDecision(request.id, 'accepted')}><Check size={16} /> Nhận yêu cầu</Button><Button variant="quiet" size="sm" onClick={() => onDecision(request.id, 'rejected')}>Từ chối</Button></div>}
      </article>)}</div> : <p className="empty-line">Không có yêu cầu khớp với từ khóa.</p>}
    </section>
  );
}

function getWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
}

function SchedulePreview() {
  const dates = getWeekDates();
  return (
    <section className="tutor-section tutor-schedule" id="weekly-preview" aria-labelledby="schedule-title">
      <div className="tutor-section__heading"><div><span className="eyebrow">NHÌN NHANH TRONG TUẦN</span><h2 id="schedule-title">Lịch dạy tuần này</h2></div><span className="tutor-section__hint">{dates[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} – {dates[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</span></div>
      <div className="tutor-schedule__grid">{weeklyLessons.map((day, index) => <div className={`tutor-schedule__day ${dates[index].toDateString() === new Date().toDateString() ? 'is-today' : ''}`} key={day.day}>
        <div className="tutor-schedule__date"><span>{day.day}</span><strong>{dates[index].getDate()}</strong></div>
        <div className="tutor-schedule__events">{day.items.length ? day.items.map((item) => <div className={`tutor-schedule__event tutor-schedule__event--${item.tone}`} key={`${item.time}-${item.label}`}><span>{item.time}</span><strong>{item.label}</strong></div>) : <span className="tutor-schedule__empty">Chưa có lớp</span>}</div>
      </div>)}</div>
      <p className="tutor-schedule__caption">Các buổi học minh họa trong bản demo; ngày trên lịch theo tuần hiện tại.</p>
    </section>
  );
}

function AvailabilityPreview({ slots, onToggle }) {
  return (
    <section className="tutor-section tutor-availability" aria-labelledby="availability-title">
      <div className="tutor-section__heading"><div><span className="eyebrow">CÒN CÓ THỂ NHẬN LỚP</span><h2 id="availability-title">Lịch rảnh của bạn</h2></div></div>
      <div className="tutor-availability__list">{slots.map((slot) => <button className={`tutor-availability__slot ${slot.active ? 'is-active' : ''}`} key={slot.id} type="button" onClick={() => onToggle(slot.id)} aria-pressed={slot.active}>
        <span className="tutor-availability__check"><Check size={15} aria-hidden="true" /></span><span><strong>{slot.label}</strong><small>{slot.time}</small></span><span className="tutor-availability__state">{slot.active ? 'Đang mở' : 'Đã tắt'}</span>
      </button>)}</div>
      <p>Chạm vào một khung giờ để bật hoặc tắt trong bản demo.</p>
    </section>
  );
}

export default function TutorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState(initialRequests);
  const [availability, setAvailability] = useState(initialAvailability);
  const pendingCount = useMemo(() => requests.filter((item) => item.status === 'pending').length, [requests]);
  const summary = tutorSummary.map((item, index) => index === 0 ? { ...item, value: String(pendingCount).padStart(2, '0'), note: pendingCount ? 'Chọn một yêu cầu để phản hồi' : 'Đã xử lý hết yêu cầu' } : item);
  const decideRequest = (id, status) => setRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  const toggleAvailability = (id) => setAvailability((items) => items.map((item) => item.id === id ? { ...item, active: !item.active } : item));

  return (
    <div className="workspace tutor-workspace density-standard">
      <TutorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pendingCount={pendingCount} />
      {sidebarOpen && <button className="workspace-scrim" type="button" onClick={() => setSidebarOpen(false)} aria-label="Đóng điều hướng" />}
      <div className="workspace__main">
        <header className="workspace-topbar tutor-topbar"><button className="icon-button workspace-topbar__menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Mở điều hướng"><Menu size={22} /></button><span className="workspace-topbar__mobile-brand"><Brand compact /></span><div className="workspace-topbar__location">Không gian gia sư <ChevronRight size={15} /> <strong>Tổng quan</strong></div><label className="sr-only" htmlFor="tutor-search">Tìm trong dashboard</label><SearchInput id="tutor-search" className="workspace-topbar__search" value={search} onChange={setSearch} placeholder="Tìm buổi học, yêu cầu..." /><RoleSwitcher /><span className="workspace-topbar__user"><Avatar initials="MA" name="Mai Anh Nguyễn" tone="sage" size="sm" /></span></header>
        <main className="tutor-main">
          <div className="tutor-page-head"><div><span className="eyebrow">TỔNG QUAN CÔNG VIỆC</span><h1>Chào bạn, Mai Anh.</h1><p>Một ngày dạy học rõ ràng bắt đầu từ những việc cần chú ý.</p></div><a href="#weekly-preview" className="button button--secondary button--md"><CalendarDays size={18} /> Xem lịch tuần</a></div>
          <div className="tutor-summary" aria-label="Chỉ số nhanh">{summary.map((item) => <StatItem key={item.label} {...item} />)}</div>
          <div className="tutor-main__columns"><LessonAgenda lessons={initialLessons} search={search} /><RequestInbox requests={requests} onDecision={decideRequest} search={search} /></div>
          <div className="tutor-main__bottom"><SchedulePreview /><AvailabilityPreview slots={availability} onToggle={toggleAvailability} /></div>
        </main>
      </div>
    </div>
  );
}
