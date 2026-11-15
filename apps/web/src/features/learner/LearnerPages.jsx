import { useLearnerRequestList, useLearnerRequestDetail } from './hooks/useLearnerRequestsData.js';
import Badge from '../../components/Badge.jsx';
import Avatar from '../../components/Avatar.jsx';
import { requestLabel, requestTone } from '../domain/statusMetadata.js';
import RequestSelectionDetails from './RequestSelectionDetails.jsx';
import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderOpen,
  Flag,
  GraduationCap,
  Hourglass,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { usePublicTutors } from '../domain/DemoDomainContext.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import TutorReportForm from './TutorReportForm.jsx';
import './search.css';
import './learnerSchedule.css';
import { money } from '../../data/public.js';

export function formatRequestId(id = '') {
  if (!id) return '';
  if (id.startsWith('demo-0')) return `#YC-100${id.slice(6)}`;
  if (id.startsWith('demo-')) return `#YC-10${id.slice(5)}`;
  if (id.startsWith('req-')) return `#YC-200${id.slice(4)}`;
  if (id.startsWith('request-')) return `#YC-300${id.slice(8)}`;
  return `#YC-${id}`;
}

function LearnerShell({
  children,
  title,
  intro,
  actions,
  className = '',
  backTo = '/learner/classes',
  backLabel = 'Quay lại Lớp học của tôi',
}) {
  return (
    <div className={`public-page public-page--learner learner-page learner-search-page learner-flow density-comfortable ${className}`}>
      <LearnerHeader compact />
      <section className="learner-page-banner">
        <div className="learner-container">
          {backTo && (
            <Link className="flow-back" to={backTo}>
              <ArrowLeft size={17} aria-hidden="true" /> {backLabel}
            </Link>
          )}
          <div className="learner-page-banner__row">
            <div>
              <h1>{title}</h1>
              <p>{intro}</p>
            </div>
            {actions && <div className="learner-page-banner__actions">{actions}</div>}
          </div>
        </div>
      </section>
      <main className="learner-container learner-flow__main">{children}</main>
    </div>
  );
}

export function NewRequest() {
  const publicTutors = usePublicTutors();
  const [params] = useSearchParams();
  const tutorId = params.get('tutor') || publicTutors[0].id;
  return <Navigate replace to={`/tutors/${encodeURIComponent(tutorId)}?${params.toString()}#profile-request`} />;
}

export function MyRequests() {
  const [filter, setFilter] = useState('all');
  const { counts, visible, rows } = useLearnerRequestList(filter);

  return (
    <LearnerShell
      className="learner-requests-view"
      title="Yêu cầu học của tôi"
      intro="Theo dõi tiến độ duyệt lịch từ gia sư, vào lớp học đã xác nhận hoặc gửi đánh giá chất lượng dạy học."
      backTo={null}
      actions={(
        <div className="learner-page-banner__actions">
          <Link className="button button--secondary button--sm" to="/learner/classes">
            <BookOpen size={16} aria-hidden="true" /> Lớp học của tôi
          </Link>
          <Link className="button button--primary button--sm" to="/learner/search">
            <Search size={16} aria-hidden="true" /> Tìm gia sư mới
          </Link>
        </div>
      )}
    >
      <section className="learner-stats-grid" aria-label="Thống kê yêu cầu học">
        <div className="learner-stat-card learner-stat-card--blue">
          <div className="learner-stat-card__icon" aria-hidden="true">
            <CalendarDays size={22} />
          </div>
          <div className="learner-stat-card__body">
            <span>Tổng số yêu cầu</span>
            <strong>{counts.all} yêu cầu</strong>
            <small>Đã gửi tới các gia sư</small>
          </div>
        </div>

        <div className="learner-stat-card learner-stat-card--indigo">
          <div className="learner-stat-card__icon" aria-hidden="true">
            <Hourglass size={22} />
          </div>
          <div className="learner-stat-card__body">
            <span>Chờ phản hồi</span>
            <strong>{counts.pending} yêu cầu</strong>
            <small>Đang chờ gia sư phản hồi</small>
          </div>
        </div>

        <div className="learner-stat-card learner-stat-card--green">
          <div className="learner-stat-card__icon" aria-hidden="true">
            <CheckCircle2 size={22} />
          </div>
          <div className="learner-stat-card__body">
            <span>Đã hoàn thành</span>
            <strong>{counts.completed} lớp</strong>
            <small>Đã kết thúc khóa học</small>
          </div>
        </div>
      </section>

      <div className="learner-classes-bar">
        <div className="learner-segmented-tabs" role="tablist" aria-label="Lọc yêu cầu học">
          {[
            ['all', 'Tất cả', counts.all],
            ['pending', 'Chờ phản hồi', counts.pending],
            ['accepted', 'Đã xác nhận', counts.accepted],
            ['completed', 'Hoàn tất', counts.completed],
            ['cancelled', 'Đã hủy', counts.cancelled],
          ].map(([item, label, count]) => (
            <button
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={`learner-segmented-tab ${filter === item ? 'is-active' : ''}`}
              onClick={() => setFilter(item)}
              key={item}
            >
              <span>{label}</span>
              <em className="learner-segmented-tab__count">{count}</em>
            </button>
          ))}
        </div>

        <div className="learner-classes-bar__actions">
          <Link className="learner-action-link-btn" to="/learner/schedule">
            <CalendarDays size={16} aria-hidden="true" />
            <span>Mở Thời khóa biểu tuần</span>
          </Link>
        </div>
      </div>

      <div className="learner-request-cards">
        {rows.map(({ request, tutor, isAccepted, isPending, isCompleted }) => {
          return (
            <article key={request.id} className="learner-request-card">
              <div className="learner-request-card__head">
                <div className="learner-request-card__tutor">
                  <Avatar
                    initials={tutor?.initials || 'GS'}
                    name={tutor?.name || 'Gia sư'}
                    tone={tutor?.tone || 'blue'}
                    size="md"
                  />
                  <div>
                    <div className="learner-request-card__meta-top">
                      <span className="learner-request-card__id">{formatRequestId(request.id)}</span>
                      <span className="learner-request-card__subject">Môn {request.subject}</span>
                    </div>
                    <h3>
                      <Link to={`/requests/${request.id}`} className="tutor-card__name-link">
                        Yêu cầu học môn {request.subject} — {tutor?.name}
                      </Link>
                    </h3>
                    <p><GraduationCap size={14} aria-hidden="true" /> {tutor?.university || 'Đại học xác minh'} · {tutor?.area || 'TP. Hồ Chí Minh'}</p>
                  </div>
                </div>

                <div className="learner-request-card__status">
                  <Badge tone={requestTone(request)}>{requestLabel(request)}</Badge>
                </div>
              </div>

              <div className="learner-request-card__body">
                <div className="learner-request-card__info-grid">
                  <div>
                    <span className="learner-request-card__info-label"><Clock3 size={14} /> Thời gian học:</span>
                    <strong>{request.schedule || 'Lịch theo thỏa thuận'}</strong>
                  </div>
                  <div>
                    <span className="learner-request-card__info-label"><Sparkles size={14} /> Hình thức & Mục tiêu:</span>
                    <span>{request.format || 'Tại nhà'} · {request.goal || 'Bám sát lộ trình'}</span>
                  </div>
                  <div>
                    <span className="learner-request-card__info-label"><GraduationCap size={14} /> Học phí tham khảo:</span>
                    <strong className="learner-request-card__fee">{money(request.sessionFee || tutor?.price || 180000)}đ/buổi</strong>
                  </div>
                </div>

                {isCompleted && (
                  <div className="learner-request-card__review-preview">
                    {request.review ? (
                      <div className="learner-request-card__reviewed">
                        <div className="learner-request-card__stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} fill={s <= (request.rating || 5) ? 'currentColor' : 'none'} aria-hidden="true" />
                          ))}
                        </div>
                        <span>Đã đánh giá: “{request.review}”</span>
                      </div>
                    ) : (
                      <div className="learner-request-card__unreviewed">
                        <Star size={14} aria-hidden="true" />
                        <span>Khóa học đã kết thúc. Bạn có thể gửi đánh giá cho gia sư {tutor?.name}.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="learner-request-card__actions">
                <Link className="button button--primary button--sm" to={`/requests/${request.id}`}>
                  Chi tiết yêu cầu
                </Link>

                {isAccepted && (
                  <Link
                    className="button button--secondary button--sm"
                    to={`/learner/classes/${request.id}`}
                    state={{ from: '/requests', fromLabel: 'Yêu cầu học' }}
                  >
                    Vào bài học <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                )}

                {isCompleted && !request.review && (
                  <Link className="button button--secondary button--sm" to={`/requests/${request.id}#danh-gia`}>
                    <Star size={15} aria-hidden="true" /> Đánh giá gia sư
                  </Link>
                )}

                {isPending && (
                  <Link className="button button--secondary button--sm" to={`/requests/${request.id}`}>
                    Xem trạng thái chờ duyệt
                  </Link>
                )}
              </div>
            </article>
          );
        })}

        {!visible.length && (
          <div className="learner-empty">
            <Sparkles size={28} aria-hidden="true" />
            <h3>Chưa có yêu cầu nào trong mục này</h3>
            <p>Chọn tab trạng thái khác hoặc khám phá thêm gia sư để gửi yêu cầu học mới.</p>
            <Link className="button button--primary" to="/learner/search">Tìm gia sư mới</Link>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}

export function RequestDetail() {
  const { id } = useParams();
  const { request, tutor, update } = useLearnerRequestDetail(id);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotice, setReportNotice] = useState('');

  if (!request) {
    return (
      <LearnerShell
        title="Không tìm thấy yêu cầu"
        intro="Không tìm thấy thông tin yêu cầu học này trong hệ thống."
        backTo="/requests"
        backLabel="Tất cả yêu cầu học"
      >
        <div className="learner-empty">
          <Link className="button button--primary" to="/requests">Xem các yêu cầu học</Link>
        </div>
      </LearnerShell>
    );
  }

  const reportButton = request.tutorId && (
    <button className="button button--secondary button--sm tutor-report-button" type="button" onClick={() => { setReportNotice(''); setReportOpen(true); }}><Flag size={16} aria-hidden="true" />Báo cáo gia sư</button>
  );

  return (
    <LearnerShell
      title={`Chi tiết yêu cầu môn ${request.subject}`}
      intro={`Mã hồ sơ: ${formatRequestId(request.id)} · Trạng thái: ${requestLabel(request)}`}
      backTo="/requests"
      backLabel="Quay lại danh sách yêu cầu học"
      actions={(
        <div className="learner-page-banner__actions">
          {request.status === 'accepted' && (
            <Link
              className="button button--primary button--sm"
              to={`/learner/classes/${request.id}`}
              state={{ from: `/requests/${request.id}`, fromLabel: 'Chi tiết yêu cầu' }}
            >
              Vào bài học <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          <Link
            className="button button--secondary button--sm"
            to={`/requests/new?tutor=${encodeURIComponent(request.tutorId)}`}
          >
            Tạo yêu cầu mới
          </Link>
        </div>
      )}
    >
      <div className="flow-detail-panel learner-request-detail-grid">
        <aside className="learner-request-detail-aside">
          <div className="learner-request-summary-card">
            {tutor && (
              <div className="learner-request-summary-card__tutor">
                <div className="learner-request-tutor-card__header">
                  <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone || tutor.tone || 'blue'} size="lg" />
                  <div className="learner-request-tutor-card__info">
                    <h3 className="learner-request-tutor-card__name">{tutor.name}</h3>
                    <p className="learner-request-tutor-card__uni">{tutor.university}</p>
                    <p className="learner-request-tutor-sub">
                      <span>Môn dạy: <strong>{request.subject || tutor.subject || (tutor.subjects && tutor.subjects[0])}</strong></span>
                      {tutor.rating && <span className="rating-star"> · ⭐ {Number(tutor.rating).toFixed(1)}</span>}
                    </p>
                  </div>
                </div>
                <div className="tutor-report-request-actions">
                  <Link
                    to={`/tutors/${tutor.id}`}
                    state={{ from: `/requests/${request.id}`, fromLabel: 'Quay lại chi tiết yêu cầu' }}
                    className="button button--secondary button--sm"
                  >
                    Xem hồ sơ gia sư <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                  {reportButton}
                </div>
              </div>
            )}

            {!tutor && <div><h3>Gia sư ({request.tutorId || 'Chưa rõ ID'})</h3><div className="tutor-report-request-actions">{reportButton}</div></div>}
            {reportNotice && <p className="tutor-report-feedback" role="status">{reportNotice}</p>}
            {tutor && <div className="learner-request-summary-card__divider" />}

            <div className="learner-request-summary-card__status">
              <div className="learner-request-status-card__top">
                <h3>Trạng thái & Tiến trình</h3>
              </div>
              <p>
                {request.status === 'pending'
                  ? 'Gia sư đã nhận được yêu cầu học của bạn và sẽ sớm phản hồi để thống nhất lịch học.'
                  : request.status === 'accepted' && !request.completed
                    ? 'Lịch học đã được gia sư xác nhận thành công! Bạn có thể xem trên Thời khóa biểu hoặc vào trực tiếp bài học.'
                    : request.completed
                      ? 'Khóa học đã kết thúc tốt đẹp. Hãy gửi đánh giá sao và chia sẻ trải nghiệm học cùng gia sư nhé!'
                      : request.status === 'rejected'
                        ? 'Gia sư đã từ chối yêu cầu do trùng lịch dạy. Bạn có thể gửi yêu cầu khác hoặc chọn gia sư mới.'
                        : 'Yêu cầu học này đã được hủy theo nguyện vọng của học viên.'}
              </p>

              {request.status === 'accepted' && (
                <div className="learner-request-next-actions">
                  <Link
                    className="button button--primary button--sm"
                    to={`/learner/classes/${request.id}`}
                    state={{ from: `/requests/${request.id}`, fromLabel: 'Chi tiết yêu cầu' }}
                  >
                    Vào bài học <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <Link className="button button--secondary button--sm" to="/learner/schedule">
                    <CalendarDays size={16} aria-hidden="true" /> Xem Thời khóa biểu
                  </Link>
                </div>
              )}

              {request.status === 'pending' && (
                <button
                  type="button"
                  className="button button--secondary button--sm learner-request-cancel-btn"
                  onClick={() => update({ status: 'cancelled' })}
                >
                  Hủy yêu cầu học
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="learner-request-detail-card">
          <div className="learner-request-detail-card__head">
            <Badge tone={requestTone(request)}>{requestLabel(request)}</Badge>
            <span>Mã hồ sơ: <strong>{formatRequestId(request.id)}</strong></span>
          </div>
          <h2>Lớp {request.subject} — {tutor?.name}</h2>

          <dl className="learner-request-dl">
            <div>
              <dt><Clock3 size={15} aria-hidden="true" /> Thời gian</dt>
              <dd>
                {request.schedule ? (
                  request.schedule.includes(';') ? (
                    <div className="learner-request-schedules-col">
                      {request.schedule.split(';').map((s, idx) => (
                        <span key={idx} className="learner-request-schedule-badge">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span>{request.schedule}</span>
                  )
                ) : (
                  'Lịch theo thỏa thuận'
                )}
              </dd>
            </div>
            <div>
              <dt><BookOpen size={15} aria-hidden="true" /> Hình thức</dt>
              <dd>{request.format || (request.formats?.length ? request.formats.join(', ') : 'Tại nhà')}</dd>
            </div>
            {(request.areas?.length > 0 || request.area || tutor?.area || tutor?.location) && (
              <div>
                <dt><MapPin size={15} aria-hidden="true" /> Khu vực</dt>
                <dd>{(request.areas?.length ? request.areas.join(', ') : request.area) || tutor?.area || tutor?.location || 'TP. Hồ Chí Minh'}</dd>
              </div>
            )}
            <div>
              <dt><GraduationCap size={15} aria-hidden="true" /> Mức phí</dt>
              <dd>{money(request.sessionFee || tutor?.price || 0)}đ / buổi</dd>
            </div>
            {(request.subject || request.subjects?.length > 0) && (
              <div>
                <dt><BookOpen size={15} aria-hidden="true" /> Môn học</dt>
                <dd>{request.subject || request.subjects?.join(', ')}</dd>
              </div>
            )}
            {request.levels?.length > 0 && (
              <div>
                <dt><Layers size={15} aria-hidden="true" /> Cấp độ</dt>
                <dd>{request.levels.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt><Sparkles size={15} aria-hidden="true" /> Nguyện vọng</dt>
              <dd>{request.goal || request.note || 'Theo lộ trình chuẩn của gia sư'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {reportOpen && <TutorReportForm key={request.id} tutorId={request.tutorId} tutorName={tutor?.name} requestId={request.id} requestCode={formatRequestId(request.id)} onClose={() => setReportOpen(false)} onSuccess={() => { setReportOpen(false); setReportNotice('Đã gửi báo cáo. Quản trị viên sẽ xem xét.'); }} />}
      <div className="learner-request-review-wrapper">
        {request.completed || request.status === 'accepted' ? (
          <form
            id="danh-gia"
            className="flow-form flow-review learner-review-box"
            onSubmit={(event) => {
              event.preventDefault();
              update({ rating, review });
            }}
          >
            <div className="learner-review-box__head">
              <h2>Đánh giá & Nhận xét gia sư {tutor?.name}</h2>
              <p>Ý kiến phản hồi chân thực của bạn giúp gia sư cải thiện chất lượng giảng dạy và hỗ trợ các bạn học sinh khác chọn gia sư phù hợp.</p>
            </div>

            {request.review ? (
              <div className="learner-review-submitted" role="status">
                <CheckCircle2 size={24} aria-hidden="true" />
                <div>
                  <strong>Bạn đã đánh giá {request.rating || 5}/5 sao</strong>
                  <p>“{request.review}”</p>
                  <small>Cảm ơn bạn đã đóng góp đánh giá cho gia sư!</small>
                </div>
              </div>
            ) : (
              <>
                <div className="learner-star-picker" role="group" aria-label="Chọn số sao đánh giá">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`learner-star-btn ${value <= rating ? 'is-active' : ''}`}
                      onClick={() => setRating(value)}
                    >
                      <Star size={22} fill={value <= rating ? 'currentColor' : 'none'} aria-hidden="true" />
                      <span>{value} sao</span>
                    </button>
                  ))}
                </div>
                <label>
                  Mức độ hài lòng
                  <select
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                  >
                    <option value={5}>5 sao — Rất hài lòng, giảng bài dễ hiểu và nhiệt tình</option>
                    <option value={4}>4 sao — Hài lòng, đúng giờ và nắm vững chuyên môn</option>
                    <option value={3}>3 sao — Bình thường, cần cải thiện phương pháp</option>
                    <option value={2}>2 sao — Chưa hài lòng</option>
                    <option value={1}>1 sao — Không hài lòng</option>
                  </select>
                </label>
                <label>
                  Nhận xét chi tiết
                  <textarea
                    required
                    rows="3"
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    placeholder="Gia sư giảng dạy như thế nào? Buổi học đã giúp bạn tiến bộ ra sao?..."
                  />
                </label>
                <button className="button button--primary" type="submit">
                  Gửi đánh giá gia sư
                </button>
              </>
            )}
          </form>
        ) : (
          <div className="flow-form learner-review-box learner-review-box--disabled">
            <div className="learner-review-box__head">
              <h2>Đánh giá & Nhận xét gia sư {tutor?.name}</h2>
              <p>
                {request.status === 'cancelled'
                  ? 'Yêu cầu học này đã hủy nên không áp dụng đánh giá gia sư.'
                  : 'Mục đánh giá sẽ tự động mở sau khi gia sư xác nhận lịch và bắt đầu các buổi học.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
