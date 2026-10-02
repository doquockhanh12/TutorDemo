import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Clock3, MapPin, Star } from 'lucide-react';
import useDemoStorage from '../../hooks/useDemoStorage.js';
import { PublicDialog, PublicFooter, PublicHeader } from '../public/PublicChrome.jsx';
import { money, publicTutors } from '../../data/public.js';
import { subjectOptions } from '../../data/tutors.js';
import { initialLearnerRequests } from '../../data/learner.js';

function LearnerShell({ children, title, intro }) {
  const [info, setInfo] = useState(null);
  return <div className="public-page learner-flow"><PublicHeader kind="learner" onInfo={(heading, message) => setInfo({ heading, message })}/><div className="learner-flow__band"><div className="public-wrap"><span className="public-kicker">KHÔNG GIAN NGƯỜI HỌC · DEMO</span><h1>{title}</h1><p>{intro}</p></div></div><main className="public-wrap learner-flow__main">{children}</main><PublicFooter/>{info && <PublicDialog title={info.heading} text={info.message} onClose={() => setInfo(null)}/>}</div>;
}

export function TutorDetail() {
  const { id } = useParams();
  const tutor = publicTutors.find((item) => item.id === id);
  const [saved, setSaved] = useDemoStorage('tnm.savedTutors', []);
  if (!tutor) return <LearnerShell title="Không tìm thấy gia sư" intro="Hồ sơ này không có trong dữ liệu minh họa."><Link className="public-btn public-btn--blue" to="/learner/search">Về trang tìm kiếm</Link></LearnerShell>;
  return <LearnerShell title={tutor.name} intro="Thông tin minh họa giúp bạn so sánh trước khi gửi yêu cầu học."><Link className="flow-back" to="/learner/search"><ArrowLeft size={17}/> Tìm gia sư</Link><div className="learner-flow__detail"><article className="learner-flow__profile"><div className="learner-flow__profile-head"><div className="learner-flow__portrait"><img src={tutor.image} alt={`Ảnh minh họa gia sư ${tutor.name}`} onError={(event) => { event.currentTarget.hidden = true; }}/><span aria-hidden="true">{tutor.initials}</span></div><div>{tutor.verified ? <span className="flow-status"><BadgeCheck size={16}/> Hồ sơ demo đã xác minh</span> : <span className="flow-status">Hồ sơ demo</span>}<h2>{tutor.name}</h2><p>{tutor.university}</p><strong className="learner-flow__subject">{tutor.subject}</strong></div></div><div className="learner-flow__facts"><span><Star size={17} fill="currentColor"/> {tutor.rating} · {tutor.reviews} đánh giá</span><span><MapPin size={17}/> {tutor.area}</span><span><Clock3 size={17}/> {tutor.time}</span></div><div className="learner-flow__about"><h3>Giới thiệu</h3><p>{tutor.bio}</p><h3>Thời gian có thể học</h3><p>{tutor.time} · Hãy nêu lịch mong muốn khi gửi yêu cầu.</p></div></article><aside className="learner-flow__request"><span className="public-kicker">BẮT ĐẦU HỌC</span><h3>Trao đổi với {tutor.name}</h3><p>Mô tả mục tiêu và thời gian phù hợp để gia sư xem yêu cầu.</p><div className="learner-flow__fee">{money(tutor.fee)}đ <small>/ buổi tham khảo</small></div><div className="learner-flow__actions"><Link className="public-btn public-btn--blue" to={`/requests/new?tutor=${tutor.id}`}>Gửi yêu cầu học <ArrowRight size={17}/></Link><button className="public-btn public-btn--outline-blue" aria-pressed={saved.includes(id)} onClick={() => setSaved((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids,id])}>{saved.includes(id) ? 'Đã lưu hồ sơ' : 'Lưu hồ sơ'}</button></div></aside></div><section className="learner-flow__section"><h2>Trước khi bắt đầu</h2><div className="learner-flow__three"><span><strong>01</strong> Chia sẻ mục tiêu và thời gian học</span><span><strong>02</strong> Chờ gia sư phản hồi trong demo</span><span><strong>03</strong> Thống nhất lịch trước buổi học</span></div></section></LearnerShell>;
}

export function NewRequest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedTutorId = params.get('tutor');
  const requestedTutor = publicTutors.find((item) => item.id === requestedTutorId);
  const tutor = requestedTutor || publicTutors[0];
  const [requests, setRequests] = useDemoStorage('tnm.learnerRequests', initialLearnerRequests);
  const [subject, setSubject] = useState(params.get('subject') || tutor.subject);
  const [goal, setGoal] = useState(params.get('goal') || '');
  const [schedule, setSchedule] = useState('');
  const [format, setFormat] = useState('Tại nhà');
  const submit = (event) => { event.preventDefault(); const id = `demo-${Date.now()}`; setRequests([...requests,{ id, tutorId:tutor.id, subject, goal, schedule, format, status:'Chờ phản hồi' }]); navigate(`/requests/${id}`); };
  if (requestedTutorId && !requestedTutor) return <LearnerShell title="Không tìm thấy gia sư" intro="Hồ sơ này không có trong dữ liệu minh họa."><Link className="public-btn public-btn--blue" to="/learner/search">Chọn gia sư khác</Link></LearnerShell>;
  return <LearnerShell title="Gửi yêu cầu học" intro="Cho gia sư biết bạn cần hỗ trợ gì và thời điểm phù hợp."><Link className="flow-back" to={`/tutors/${tutor.id}`}><ArrowLeft size={17}/> Quay lại hồ sơ</Link><div className="learner-flow__form-grid"><form className="flow-form" onSubmit={submit}><h2>Nhu cầu học của bạn</h2><label>Môn học<select value={subject} onChange={(e) => setSubject(e.target.value)}>{[...new Set([subject, ...subjectOptions.slice(1)])].map((item) => <option key={item}>{item}</option>)}</select></label><label>Mục tiêu học<textarea required rows="4" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ví dụ: Củng cố kiến thức lớp 9, luyện đề..."/></label><label>Thời gian mong muốn<input required value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Ví dụ: Thứ 3 và thứ 5, sau 18:00"/></label><label>Hình thức<select value={format} onChange={(e) => setFormat(e.target.value)}><option>Tại nhà</option><option>Online</option><option>Linh hoạt</option></select></label><button type="submit" className="public-btn public-btn--blue">Gửi yêu cầu demo <ArrowRight size={17}/></button><small>Thông tin chỉ lưu trong trình duyệt này.</small></form><aside className="flow-summary"><span className="public-kicker">GIA SƯ ĐÃ CHỌN</span><h3>{tutor.name}</h3><p>{tutor.subject} · {tutor.area}</p><strong>{money(tutor.fee)}đ / buổi</strong><p>Yêu cầu sẽ xuất hiện ở trang theo dõi sau khi gửi.</p></aside></div></LearnerShell>;
}

export function MyRequests() {
  const [requests] = useDemoStorage('tnm.learnerRequests', initialLearnerRequests);
  const [filter, setFilter] = useState('Tất cả');
  const visible = filter === 'Tất cả' ? requests : requests.filter((item) => item.status === filter);
  return <LearnerShell title="Yêu cầu học của tôi" intro="Theo dõi trạng thái kết nối và lịch học trong bản demo."><div className="flow-toolbar"><div className="flow-tabs">{['Tất cả','Chờ phản hồi','Đã xác nhận','Hoàn tất'].map((item) => <button className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><Link className="public-btn public-btn--blue" to="/requests/new">Tạo yêu cầu mới</Link></div><div className="flow-list">{visible.map((request) => { const tutor = publicTutors.find((t) => t.id === request.tutorId); return <Link key={request.id} to={`/requests/${request.id}`} className="flow-row"><span className="flow-row__icon"><CalendarDays size={21}/></span><span><strong>{request.subject} với {tutor?.name || 'Gia sư demo'}</strong><small>{request.goal} · {request.schedule}</small></span><span className="flow-status">{request.status}</span><ArrowRight size={18}/></Link>; })}{!visible.length && <div className="public-empty"><h3>Chưa có yêu cầu trong nhóm này</h3><p>Chọn trạng thái khác hoặc tạo yêu cầu học mới.</p></div>}</div></LearnerShell>;
}

export function RequestDetail() {
  const { id } = useParams();
  const [requests, setRequests] = useDemoStorage('tnm.learnerRequests', initialLearnerRequests);
  const request = requests.find((item) => item.id === id);
  const tutor = publicTutors.find((item) => item.id === request?.tutorId);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  if (!request) return <LearnerShell title="Không tìm thấy yêu cầu" intro="Yêu cầu này không có trong dữ liệu demo."><Link to="/requests">Xem các yêu cầu</Link></LearnerShell>;
  const update = (patch) => setRequests(requests.map((item) => item.id === id ? { ...item, ...patch } : item));
  return <LearnerShell title="Chi tiết yêu cầu học" intro={`Mã ${request.id} · ${request.status}`}><Link className="flow-back" to="/requests"><ArrowLeft size={17}/> Tất cả yêu cầu</Link><div className="flow-detail-panel"><div><span className="flow-status">{request.status}</span><h2>{request.subject} với {tutor?.name}</h2><p>{request.goal}</p><dl><div><dt>Thời gian</dt><dd>{request.schedule}</dd></div><div><dt>Hình thức</dt><dd>{request.format || 'Tại nhà'}</dd></div><div><dt>Khu vực gia sư</dt><dd>{tutor?.area}</dd></div><div><dt>Học phí tham khảo</dt><dd>{money(tutor?.fee || 0)}đ / buổi</dd></div></dl></div><aside><h3>Bước tiếp theo</h3><p>{request.status === 'Chờ phản hồi' ? 'Gia sư sẽ xem yêu cầu trong luồng demo.' : request.status === 'Đã xác nhận' ? 'Lịch học đã được xác nhận. Bạn có thể xem chi tiết buổi học.' : request.status === 'Hoàn tất' ? 'Buổi học đã hoàn tất. Bạn có thể để lại đánh giá.' : 'Yêu cầu đã hủy trong bản demo.'}</p>{request.status === 'Đã xác nhận' && <button className="public-btn public-btn--blue" onClick={() => update({status:'Hoàn tất'})}>Đánh dấu đã học xong</button>}{request.status === 'Chờ phản hồi' && <button className="public-btn public-btn--outline-blue" onClick={() => update({status:'Đã hủy'})}>Hủy yêu cầu demo</button>}</aside></div>{request.status === 'Hoàn tất' && <form className="flow-form flow-review" onSubmit={(e) => { e.preventDefault(); update({rating,review}); }}><h2>Đánh giá gia sư</h2>{request.review ? <p role="status">Cảm ơn bạn đã đánh giá {request.rating}/5 sao: “{request.review}”</p> : <><label>Đánh giá<select value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} sao</option>)}</select></label><label>Nhận xét<textarea required rows="3" value={review} onChange={(e) => setReview(e.target.value)} placeholder="Buổi học giúp bạn tiến bộ ra sao?"/></label><button className="public-btn public-btn--blue" type="submit">Gửi đánh giá demo</button></>}</form>}</LearnerShell>;
}

