import Badge from '../../components/Badge.jsx';
import { requestLabel, requestTone } from '../domain/statusMetadata.js';
import RequestSelectionDetails from './RequestSelectionDetails.jsx';
import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { useLearnerRequests } from '../domain/DemoDomainContext.jsx';
import { PublicFooter } from '../public/PublicChrome.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import './search.css';
import { money } from '../../data/public.js';
import { usePublicTutors } from '../domain/DemoDomainContext.jsx';

function LearnerShell({ children, title, intro }) {
  return <div className="public-page public-page--learner learner-search-page learner-flow density-comfortable"><LearnerHeader /><div className="learner-flow__band"><div className="public-wrap"><span className="public-kicker">KHÔNG GIAN NGƯỜI HỌC · DEMO</span><h1>{title}</h1><p>{intro}</p></div></div><main className="public-wrap learner-flow__main">{children}</main><PublicFooter/></div>;
}

export function NewRequest() {
  const publicTutors = usePublicTutors();
  const [params] = useSearchParams();
  const tutorId = params.get('tutor') || publicTutors[0].id;
  return <Navigate replace to={`/tutors/${encodeURIComponent(tutorId)}?${params.toString()}#profile-request`} />;
}

export function MyRequests() {
  const publicTutors = usePublicTutors();
  const [requests] = useLearnerRequests();
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? requests : requests.filter((item) => filter === 'completed' ? item.completed : item.status === filter && !item.completed);
  return <LearnerShell title="Yêu cầu học của tôi" intro="Theo dõi trạng thái kết nối và lịch học trong bản demo."><div className="flow-toolbar"><div className="flow-tabs">{[['all','Tất cả'],['pending','Chờ phản hồi'],['accepted','Đã xác nhận'],['completed','Hoàn tất'],['rejected','Đã từ chối'],['cancelled','Đã hủy']].map(([item,label]) => <button className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)} key={item}>{label}</button>)}</div></div><div className="flow-list">{visible.map((request) => { const tutor = publicTutors.find((t) => t.id === request.tutorId); return <Link key={request.id} to={`/requests/${request.id}`} className="flow-row"><span className="flow-row__icon"><CalendarDays size={21}/></span><span><strong>{request.subject} với {tutor?.name || 'Gia sư demo'}</strong><small>{request.goal} · {request.schedule}</small></span><Badge tone={requestTone(request)}>{requestLabel(request)}</Badge><ArrowRight size={18}/></Link>; })}{!visible.length && <div className="public-empty"><h3>Chưa có yêu cầu trong nhóm này</h3><p>Chọn trạng thái khác để xem các yêu cầu đã gửi.</p></div>}</div></LearnerShell>;
}

export function RequestDetail() {
  const publicTutors = usePublicTutors();
  const { id } = useParams();
  const [requests, setRequests] = useLearnerRequests();
  const request = requests.find((item) => item.id === id);
  const tutor = publicTutors.find((item) => item.id === request?.tutorId);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  if (!request) return <LearnerShell title="Không tìm thấy yêu cầu" intro="Yêu cầu này không có trong dữ liệu demo."><Link to="/requests">Xem các yêu cầu</Link></LearnerShell>;
  const update = (patch) => setRequests(requests.map((item) => item.id === id ? { ...item, ...patch } : item));
  return <LearnerShell title="Chi tiết yêu cầu học" intro={`Mã ${request.id} · ${requestLabel(request)}`}><div className="flow-toolbar"><Link className="flow-back" to="/requests"><ArrowLeft size={17}/> Tất cả yêu cầu</Link><Link className="public-btn public-btn--blue" to={`/requests/new?tutor=${encodeURIComponent(request.tutorId)}`}>Tạo yêu cầu mới</Link></div><div className="flow-detail-panel"><div><Badge tone={requestTone(request)}>{requestLabel(request)}</Badge><h2>{request.subject} với {tutor?.name}</h2><p>{request.goal}</p><dl><div><dt>Thời gian</dt><dd>{request.schedule}</dd></div><div><dt>Hình thức</dt><dd>{request.format || 'Tại nhà'}</dd></div><div><dt>Khu vực gia sư</dt><dd>{tutor?.area}</dd></div><div><dt>Học phí tham khảo</dt><dd>{money(tutor?.fee || 0)}đ / buổi</dd></div></dl><RequestSelectionDetails request={request} /></div><aside><h3>Bước tiếp theo</h3><p>{request.status === 'pending' ? 'Gia sư sẽ xem yêu cầu trong luồng demo.' : request.status === 'accepted' && !request.completed ? 'Lịch học đã được xác nhận. Bạn có thể xem chi tiết buổi học.' : request.completed ? 'Buổi học đã hoàn tất. Bạn có thể để lại đánh giá.' : request.status === 'rejected' ? 'Gia sư đã từ chối yêu cầu.' : 'Yêu cầu đã hủy trong bản demo.'}</p>{request.status === 'pending' && <button className="public-btn public-btn--outline-blue" onClick={() => update({status:'cancelled'})}>Hủy yêu cầu demo</button>}</aside></div>{request.completed && <form className="flow-form flow-review" onSubmit={(e) => { e.preventDefault(); update({rating,review}); }}><h2>Đánh giá gia sư</h2>{request.review ? <p role="status">Cảm ơn bạn đã đánh giá {request.rating}/5 sao: “{request.review}”</p> : <><label>Đánh giá<select value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} sao</option>)}</select></label><label>Nhận xét<textarea required rows="3" value={review} onChange={(e) => setReview(e.target.value)} placeholder="Buổi học giúp bạn tiến bộ ra sao?"/></label><button className="public-btn public-btn--blue" type="submit">Gửi đánh giá demo</button></>}</form>}</LearnerShell>;
}

