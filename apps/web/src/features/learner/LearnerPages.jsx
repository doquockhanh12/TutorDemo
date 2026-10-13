import Badge from '../../components/Badge.jsx';
import { requestLabel, requestTone } from '../domain/statusMetadata.js';
import RequestSelectionDetails from './RequestSelectionDetails.jsx';
import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Star,
  MessageCircle,
  X,
  Send
} from 'lucide-react';
import { useLearnerRequests } from '../domain/DemoDomainContext.jsx';
import { proposalLabel } from './profileSelection.js';
import { PublicFooter } from '../public/PublicChrome.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import './search.css';
import { money } from '../../data/public.js';
import { usePublicTutors } from '../domain/DemoDomainContext.jsx';

// Component Khung Chat Nổi cố định ở góc dưới màn hình (Floating Chat Widget)
function FloatingChatWidget({ tutorName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'tutor',
      text: `Chào bạn, mình là ${tutorName || 'gia sư'}. Buổi học sắp tới bạn muốn tập trung vào phần kiến thức nào trước nhé?`,
      time: 'Vừa xong'
    }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatLog((prev) => [
      ...prev,
      { sender: 'learner', text: inputMsg, time: 'Vừa xong' }
    ]);
    setInputMsg('');
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {isOpen && (
        <div style={{
          width: '320px',
          height: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e5e7eb',
          marginBottom: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Trao đổi với gia sư</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{tutorName || 'Gia sư'} · Đang hoạt động</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'learner' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  backgroundColor: msg.sender === 'learner' ? '#2563eb' : '#f3f4f6',
                  color: msg.sender === 'learner' ? '#ffffff' : '#1f2937',
                  padding: '8px 12px',
                  borderRadius: msg.sender === 'learner' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #e5e7eb', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nhập tin nhắn trao đổi..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #d1d5db',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginLeft: 'auto'
        }}
        title="Nhắn tin với gia sư"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}

function LearnerShell({ children, title, intro }) {
  return (
    <div className="public-page public-page--learner learner-search-page learner-flow density-comfortable">
      <LearnerHeader />
      <div className="learner-flow__band">
        <div className="public-wrap">
          <span className="public-kicker">KHÔNG GIAN NGƯỜI HỌC · DEMO</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </div>
      <main className="public-wrap learner-flow__main">{children}</main>
      <PublicFooter />
    </div>
  );
}

export function NewRequest() {
  const publicTutors = usePublicTutors();
  const [params] = useSearchParams();
  const tutorId = params.get('tutor') || publicTutors[0]?.id;
  return <Navigate replace to={`/tutors/${encodeURIComponent(tutorId)}?${params.toString()}#profile-request`} />;
}

export function MyRequests() {
  const publicTutors = usePublicTutors();
  const [requests] = useLearnerRequests();
  const [filter, setFilter] = useState('all');

  // Logic lọc danh sách theo 5 nhóm trạng thái
  const visible = requests.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['accepted', 'confirmed'].includes(item.status) && !item.completed;
    if (filter === 'closed') return ['rejected', 'cancelled'].includes(item.status);
    if (filter === 'completed') return item.completed;
    return item.status === filter && !item.completed;
  });

  return (
    <LearnerShell title="Yêu cầu học của tôi" intro="Theo dõi trạng thái kết nối và lịch học trong bản demo.">
      <div className="flow-toolbar">
        <div className="flow-tabs">
          {/* Mảng hiển thị chỉ còn 5 tab */}
          {[
            ['all', 'Tất cả'],
            ['pending', 'Chờ phản hồi'],
            ['active', 'Đang xử lý'],
            ['completed', 'Hoàn tất'],
            ['closed', 'Đã hủy / Từ chối']
          ].map(([item, label]) => (
            <button
              className={filter === item ? 'is-active' : ''}
              onClick={() => setFilter(item)}
              key={item}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flow-list">
        {visible.map((request) => {
          const tutor = publicTutors.find((t) => t.id === request.tutorId);
          return (
            <Link key={request.id} to={`/requests/${request.id}`} className="flow-row">
              <span className="flow-row__icon"><CalendarDays size={21} /></span>
              <span>
                <strong>{request.subject} với {tutor?.name || 'Gia sư demo'}</strong>
                <small>{request.goal} · {request.schedule}</small>
              </span>

              {/* Sửa lỗi hiển thị chữ của Badge */}
              <Badge tone={requestTone(request)}>
                {request.completed
                  ? 'Hoàn tất'
                  : request.status === 'confirmed'
                  ? 'Đã chốt lịch'
                  : request.status === 'accepted'
                  ? 'Gia sư đã nhận'
                  : requestLabel(request)}
              </Badge>

              <ArrowRight size={18} />
            </Link>
          );
        })}
        {!visible.length && (
          <div className="public-empty">
            <h3>Chưa có yêu cầu trong nhóm này</h3>
            <p>Chọn trạng thái khác để xem các yêu cầu đã gửi.</p>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}

export function RequestDetail() {
  const publicTutors = usePublicTutors();
  const { id } = useParams();
  const [requests, setRequests, submitLearnerReview, confirmLearnerRequest] = useLearnerRequests();

  // Lấy dữ liệu đơn gốc từ hệ thống
  const baseRequest = requests.find((item) => item.id === id);

  const request = baseRequest;

  const tutor = publicTutors.find((item) => item.id === request?.tutorId);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [selectedProposalKey, setSelectedProposalKey] = useState('');
  const [confirmError, setConfirmError] = useState('');

  if (!request) {
    return (
      <LearnerShell title="Không tìm thấy yêu cầu" intro="Yêu cầu này không có trong dữ liệu demo.">
        <Link to="/requests">Xem các yêu cầu</Link>
      </LearnerShell>
    );
  }

  // Cập nhật cả State cục bộ lẫn hệ thống
  const update = (patch) => {
    if (typeof setRequests === 'function') {
      setRequests(requests.map((item) => item.id === id ? { ...item, ...patch } : item));
    }
  };

  const sendReview = (event) => {
    event.preventDefault();
    const result = submitLearnerReview(id, { rating, comment: review });
    setReviewError(result.error || '');
  };
  const proposals = request.proposals || [];
  const proposalKey = (proposal) => `${proposal.date}:${proposal.start}:${proposal.end}`;
  const selectedProposal = proposals.find((proposal) => proposalKey(proposal) === selectedProposalKey)
    || (proposals.length === 1 ? proposals[0] : null);
  const confirmSchedule = () => {
    if (!selectedProposal) { setConfirmError('Chọn một khung giờ để xác nhận.'); return; }
    const result = confirmLearnerRequest(id, selectedProposal);
    setConfirmError(result.error || '');
  };

  const isAcceptedOrConfirmed = ['accepted', 'confirmed', 'completed'].includes(request.status);

  return (
    <LearnerShell
      title="Chi tiết yêu cầu học"
      intro={`Mã ${request.id} · ${request.completed ? 'Hoàn tất' : request.status === 'confirmed' ? 'Đã chốt lịch' : request.status === 'accepted' ? 'Gia sư đã nhận' : requestLabel(request)}`}
    >
      <div className="flow-toolbar">
        <Link className="flow-back" to="/requests"><ArrowLeft size={17} /> Tất cả yêu cầu</Link>
        <Link className="public-btn public-btn--blue" to={`/requests/new?tutor=${encodeURIComponent(request.tutorId)}`}>
          Tạo yêu cầu mới
        </Link>
      </div>

      <div className="flow-detail-panel">
        <div>
          {/* Badge phân biệt rõ Gia sư đã nhận và Đã chốt lịch */}
          <Badge tone={requestTone(request)}>
            {request.completed
              ? 'Hoàn tất'
              : request.status === 'confirmed'
              ? 'Đã chốt lịch'
              : request.status === 'accepted'
              ? 'Gia sư đã nhận'
              : requestLabel(request)}
          </Badge>

          <h2>{request.subject} với {tutor?.name}</h2>
          <p>{request.goal}</p>
          <dl>
            <div><dt>Lịch đã đề xuất</dt><dd>{request.schedule}</dd></div>
            {request.confirmedSchedule && <div><dt>Lịch đã xác nhận</dt><dd>{request.confirmedSchedule}</dd></div>}
            <div><dt>Hình thức</dt><dd>{request.format || 'Tại nhà'}</dd></div>
            <div><dt>Khu vực gia sư</dt><dd>{tutor?.area}</dd></div>
            <div><dt>Học phí tham khảo</dt><dd>{money(tutor?.fee || 0)}đ / buổi</dd></div>

            {isAcceptedOrConfirmed && (
              <div>
                <dt>Hotline / Zalo liên hệ</dt>
                <dd style={{ color: '#2563eb', fontWeight: 600 }}>0900 000 002 (Gia sư {tutor?.name})</dd>
              </div>
            )}
          </dl>
          <RequestSelectionDetails request={request} />
        </div>

        <aside>
          <h3>Bước tiếp theo</h3>
          <p>
            {request.status === 'pending'
              ? 'Gia sư sẽ xem yêu cầu trong luồng demo.'
              : request.status === 'accepted' && !request.completed
              ? 'Gia sư đã nhận lớp! Bạn vui lòng bấm Xác nhận lịch học để chốt thời gian chính thức.'
              : request.status === 'confirmed' && !request.completed
              ? 'Lịch học đã được chốt chính thức thành công!'
              : request.completed
              ? 'Buổi học đã hoàn tất. Bạn có thể để lại đánh giá chất lượng gia sư bên dưới.'
              : request.status === 'rejected'
              ? 'Gia sư đã từ chối yêu cầu.'
              : 'Yêu cầu đã được hủy.'}
          </p>

          {/* Nút Xác nhận lịch: Chỉ xuất hiện khi trạng thái là accepted */}
          {request.status === 'accepted' && !request.completed && (
            <div className="request-confirm-schedule">
              {proposals.length ? <>
                <fieldset>
                  <legend>Chọn lịch cuối cùng *</legend>
                  {proposals.map((proposal) => <label key={proposalKey(proposal)}>
                    <input type="radio" name="confirmed-schedule" value={proposalKey(proposal)} checked={selectedProposalKey === proposalKey(proposal) || (proposals.length === 1 && !selectedProposalKey)} onChange={() => { setSelectedProposalKey(proposalKey(proposal)); setConfirmError(''); }} />
                    {proposalLabel(proposal)}
                  </label>)}
                </fieldset>
                {confirmError && <p role="alert">{confirmError}</p>}
                <button className="public-btn public-btn--blue" style={{ width: '100%', marginBottom: '10px' }} onClick={confirmSchedule}>
                  Xác nhận lịch học
                </button>
              </> : <p role="status">Yêu cầu cũ này chưa có ngày và giờ cụ thể để xác nhận. Bạn có thể tạo yêu cầu mới từ hồ sơ gia sư.</p>}
            </div>
          )}

          {/* Nút Hủy yêu cầu */}
          {['pending', 'accepted', 'confirmed'].includes(request.status) && !request.completed && (
            <button
              className="public-btn public-btn--outline-blue"
              style={{ width: '100%' }}
              onClick={() => update({ status: 'cancelled' })}
            >
              Hủy yêu cầu
            </button>
          )}
        </aside>
      </div>

      {/* Form Đánh giá 5 sao */}
      {request.completed && (
        <form
          className="flow-form flow-review"
          onSubmit={sendReview}
        >
          <h2>Đánh giá gia sư</h2>
          {request.reviewId || request.review ? (
            <p role="status">Đánh giá {request.rating}/5 sao đã được lưu.{request.review ? ` Nhận xét: “${request.review}”` : ''}</p>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <span id="learner-review-rating-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Chấm điểm gia sư *</span>
                <div role="group" aria-labelledby="learner-review-rating-label" style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      aria-label={`${star} sao`}
                      aria-pressed={rating === star}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      title={`${star} sao`}
                    >
                      <Star
                        size={30}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                        color={star <= rating ? '#f59e0b' : '#d1d5db'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label>
                Nhận xét buổi học (không bắt buộc)
                <textarea
                  rows="3"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Gia sư giảng dạy ra sao? Bạn có tiến bộ hơn không?"
                />
              </label>
              {reviewError && <p role="alert">{reviewError}</p>}
              <button className="public-btn public-btn--blue" type="submit">Gửi đánh giá</button>
            </>
          )}
        </form>
      )}

      {/* Nút khung Chat nổi */}
      {isAcceptedOrConfirmed && <FloatingChatWidget tutorName={tutor?.name} />}
    </LearnerShell>
  );
}
