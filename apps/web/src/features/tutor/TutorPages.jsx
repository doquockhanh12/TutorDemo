import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Menu, SlidersHorizontal } from 'lucide-react';
import Brand from '../../components/Brand.jsx';
import Badge from '../../components/Badge.jsx';
import RoleSwitcher from '../../components/RoleSwitcher.jsx';
import useDemoStorage from '../../hooks/useDemoStorage.js';
import { initialAvailability, initialLessons, initialRequests, initialTutorProfile } from '../../data/tutorDashboard.js';
import TutorSidebar from './TutorSidebar.jsx';

function TutorShell({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  const [requests] = useDemoStorage('tnm.tutorRequests', initialRequests);
  return <div className="workspace tutor-workspace density-standard"><TutorSidebar open={open} onClose={() => setOpen(false)} pendingCount={requests.filter((item) => item.status === 'pending').length}/>{open && <button className="workspace-scrim" aria-label="Đóng điều hướng" onClick={() => setOpen(false)}/>}<div className="workspace__main"><header className="workspace-topbar tutor-topbar"><button className="icon-button workspace-topbar__menu" onClick={() => setOpen(true)} aria-label="Mở điều hướng"><Menu size={22}/></button><span className="workspace-topbar__mobile-brand"><Brand compact/></span><div className="workspace-topbar__location">Không gian gia sư <ChevronRight size={15}/> <strong>{title}</strong></div><div className="workspace-topbar__actions"><RoleSwitcher/></div></header><main className="tutor-main tutor-flow"><div className="tutor-page-head"><div><span className="eyebrow">KHÔNG GIAN GIA SƯ · DEMO</span><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</main></div></div>;
}

export function TutorProfile() {
  const [profile, setProfile] = useDemoStorage('tnm.tutorProfile', initialTutorProfile);
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const change = (key, value) => { setDraft({ ...draft, [key]:value }); setSaved(false); };
  return <TutorShell title="Hồ sơ gia sư" subtitle="Xem và chỉnh thông tin hiển thị trong hồ sơ demo."><div className="tutor-flow__grid"><form className="flow-form" onSubmit={(e) => { e.preventDefault(); setProfile(draft); setSaved(true); }}><h2>Thông tin chuyên môn</h2><label>Họ và tên<input required value={draft.name} onChange={(e) => change('name',e.target.value)}/></label><label>Môn có thể dạy<input required value={draft.subjects} onChange={(e) => change('subjects',e.target.value)}/></label><label>Khu vực dạy<input required value={draft.area} onChange={(e) => change('area',e.target.value)}/></label><label>Mức phí mỗi buổi<input required type="number" min="0" value={draft.fee} onChange={(e) => change('fee',e.target.value)}/></label><label>Giới thiệu cách dạy<textarea rows="4" value={draft.bio} onChange={(e) => change('bio',e.target.value)}/></label><button className="button button--primary" type="submit">Lưu hồ sơ demo</button>{saved && <p className="flow-success" role="status">Đã lưu hồ sơ trong trình duyệt.</p>}</form><aside className="flow-summary"><span className="eyebrow">XEM TRƯỚC HỒ SƠ</span><h3>{draft.name}</h3><p>{draft.subjects} · {draft.area}</p><strong>{new Intl.NumberFormat('vi-VN').format(Number(draft.fee) || 0)}đ / buổi</strong><p>{draft.bio}</p><Link className="text-link" to="/tutor/availability">Tiếp tục: lịch rảnh <ArrowRight size={16}/></Link></aside></div></TutorShell>;
}

export function TutorAvailability() {
  const [slots, setSlots] = useDemoStorage('tnm.tutorAvailability', initialAvailability);
  return <TutorShell title="Lịch rảnh" subtitle="Bật hoặc tắt các khung giờ có thể nhận lớp."><div className="tutor-flow__panel"><div className="tutor-flow__panel-head"><div><h2>Khung giờ có thể dạy</h2><p>{slots.filter((item) => item.active).length} khung giờ đang mở · lưu tự động trong trình duyệt.</p></div><Clock3 size={25}/></div><div className="tutor-availability__list">{slots.map((slot) => <button className={`tutor-availability__slot ${slot.active ? 'is-active' : ''}`} key={slot.id} type="button" aria-pressed={slot.active} onClick={() => setSlots(slots.map((item) => item.id === slot.id ? { ...item,active:!item.active } : item))}><span className="tutor-availability__check"><Check size={15}/></span><span><strong>{slot.label}</strong><small>{slot.time}</small></span><span className="tutor-availability__state">{slot.active ? 'Đang mở' : 'Đã tắt'}</span></button>)}</div><Link className="text-link" to="/tutor/requests">Xem yêu cầu học <ArrowRight size={16}/></Link></div></TutorShell>;
}

export function TutorRequests() {
  const [requests] = useDemoStorage('tnm.tutorRequests', initialRequests);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const visible = requests.filter((item) => (status === 'all' || item.status === status) && `${item.learner} ${item.subject} ${item.area}`.toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')));
  return <TutorShell title="Yêu cầu học" subtitle="Lọc và phản hồi những yêu cầu đang chờ trong bản demo."><div className="tutor-flow__panel"><div className="flow-toolbar"><div className="flow-tabs">{[['all','Tất cả'],['pending','Chờ phản hồi'],['accepted','Đã nhận'],['rejected','Đã từ chối']].map(([value,label]) => <button className={status === value ? 'is-active' : ''} key={value} onClick={() => setStatus(value)}>{label}</button>)}</div><label className="flow-search"><SlidersHorizontal size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm yêu cầu..."/></label></div><div className="flow-list">{visible.map((item) => <Link className="flow-row" to={`/tutor/requests/${item.id}`} key={item.id}><span className="flow-row__icon"><CalendarDays size={20}/></span><span><strong>{item.subject} · {item.learner}</strong><small>{item.area} · {item.schedule} · {item.received}</small></span><Badge tone={item.status === 'pending' ? 'warning' : item.status === 'accepted' ? 'success' : 'danger'}>{item.status === 'pending' ? 'Chờ phản hồi' : item.status === 'accepted' ? 'Đã nhận' : 'Đã từ chối'}</Badge><ArrowRight size={17}/></Link>)}{!visible.length && <p className="empty-line">Không có yêu cầu khớp bộ lọc.</p>}</div></div></TutorShell>;
}

export function TutorRequestDetail() {
  const { id } = useParams();
  const [requests, setRequests] = useDemoStorage('tnm.tutorRequests', initialRequests);
  const request = requests.find((item) => item.id === id);
  if (!request) return <TutorShell title="Không tìm thấy yêu cầu" subtitle="Yêu cầu này không có trong dữ liệu demo."><Link to="/tutor/requests">Về danh sách</Link></TutorShell>;
  const decide = (status) => setRequests(requests.map((item) => item.id === id ? { ...item,status } : item));
  return <TutorShell title="Chi tiết yêu cầu" subtitle={`Mã ${request.id} · ${request.received}`}><Link className="flow-back" to="/tutor/requests"><ArrowLeft size={17}/> Danh sách yêu cầu</Link><div className="flow-detail-panel"><div><Badge tone={request.status === 'pending' ? 'warning' : request.status === 'accepted' ? 'success' : 'danger'}>{request.status === 'pending' ? 'Chờ phản hồi' : request.status === 'accepted' ? 'Đã nhận' : 'Đã từ chối'}</Badge><h2>{request.subject}</h2><p>“{request.note}”</p><dl><div><dt>Người học</dt><dd>{request.learner}</dd></div><div><dt>Khu vực</dt><dd>{request.area}</dd></div><div><dt>Thời gian mong muốn</dt><dd>{request.schedule}</dd></div></dl></div><aside><h3>Phản hồi yêu cầu</h3><p>Thao tác dưới đây chỉ đổi trạng thái hiển thị trong trình duyệt.</p>{request.status === 'pending' ? <div className="flow-action-stack"><button className="button button--primary" onClick={() => decide('accepted')}>Nhận yêu cầu</button><button className="button button--secondary" onClick={() => decide('rejected')}>Từ chối</button></div> : <p className="flow-success" role="status">Đã cập nhật trạng thái: {request.status === 'accepted' ? 'Đã nhận' : 'Đã từ chối'}.</p>}</aside></div></TutorShell>;
}

export function TutorLessons() {
  const [lessons, setLessons] = useDemoStorage('tnm.tutorLessons', initialLessons);
  return <TutorShell title="Lịch dạy & buổi học" subtitle="Xem lịch đã xác nhận và đánh dấu buổi học hoàn tất trong bản demo."><div className="tutor-flow__panel"><div className="tutor-flow__panel-head"><div><h2>Buổi học sắp tới</h2><p>Lịch tuần minh họa, không đồng bộ lịch thật.</p></div><CalendarDays size={25}/></div><div className="flow-list">{lessons.map((lesson) => <article className="flow-row" key={lesson.id}><span className="flow-row__icon"><CalendarDays size={20}/></span><span><strong>{lesson.subject} · {lesson.learner}</strong><small>{lesson.day} · {lesson.time} · {lesson.place}</small></span><Badge tone={lesson.status === 'completed' ? 'success' : lesson.status === 'confirmed' ? 'info' : 'warning'}>{lesson.status === 'completed' ? 'Hoàn tất' : lesson.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}</Badge>{lesson.status === 'confirmed' && <button className="button button--secondary button--xs" onClick={() => setLessons(lessons.map((item) => item.id === lesson.id ? { ...item,status:'completed' } : item))}>Hoàn tất</button>}</article>)}</div></div></TutorShell>;
}
