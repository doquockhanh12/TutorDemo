import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  FileWarning,
  MessageSquareWarning,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import StatItem from '../../components/StatItem.jsx';
import AdminShell from './AdminShell.jsx';
import { formatAdminDate } from './AdminTutorsPage.jsx';
import { liveClasses } from '../../data/adminDashboard.js';
import {
  useAdminOverview,
  useAdminTutors,
  useAdminReviews,
  useAdminIssues,
  tutorModerationLabels,
  tutorModerationTones,
  reviewModerationLabels,
  reviewModerationTones,
  issueStatusLabels,
  issueStatusTones,
} from '../domain/useAdminDomain.js';

function ApprovalSection({ tutors, onApprove, onReject, filter, onFilter, search }) {
  const visible = tutors.filter((item) => {
    if (filter !== 'all' && item.moderationStatus !== filter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLocaleLowerCase('vi-VN');
    return `${item.name} ${item.subjects?.join(' ')} ${item.university || item.school}`
      .toLocaleLowerCase('vi-VN')
      .includes(q);
  });

  const pendingCount = tutors.filter((item) => item.moderationStatus === 'pending').length;

  return (
    <section className="admin-section admin-approvals" aria-labelledby="approvals-title">
      <div className="admin-section__heading">
        <div>
          <span className="eyebrow">KIỂM DUYỆT HỒ SƠ</span>
          <h2 id="approvals-title">Gia sư chờ duyệt</h2>
        </div>
        <div className="admin-section__heading-right">
          <span className="admin-section__count">{pendingCount} hồ sơ cần xử lý</span>
          <Link to="/admin/tutors" className="admin-link-more">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="admin-section__filter">
        <SlidersHorizontal size={16} aria-hidden="true" />
        <label htmlFor="approval-filter">Trạng thái</label>
        <select
          id="approval-filter"
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
        >
          <option value="pending">Chờ duyệt</option>
          <option value="all">Tất cả</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
          <option value="suspended">Tạm khóa</option>
        </select>
      </div>

      <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="Bảng hồ sơ gia sư chờ duyệt">
        <table className="admin-table admin-table--approvals">
          <thead>
            <tr>
              <th>Gia sư</th>
              <th>Môn dạy</th>
              <th>Gửi lúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.slice(0, 6).map((item) => {
              const tone = tutorModerationTones[item.moderationStatus] || 'neutral';
              const label = tutorModerationLabels[item.moderationStatus] || item.moderationStatus;

              return (
                <tr key={item.id}>
                  <td>
                    <div className="admin-person">
                      <Avatar
                        initials={item.initials || item.name.slice(0, 2)}
                        name={item.name}
                        tone="blue"
                        size="xs"
                      />
                      <div>
                        <strong title={item.name}>{item.name}</strong>
                        <small title={item.university || item.school || 'Đang xác minh'}>{item.university || item.school || 'Đang xác minh'}</small>
                      </div>
                    </div>
                  </td>
                  <td title={item.subjects?.join(', ') || item.subject || 'Toán học'}>
                    <span className="admin-cell-truncate">{item.subjects?.join(', ') || item.subject || 'Toán học'}</span>
                  </td>
                  <td>
                    <span className="admin-cell-truncate">{formatAdminDate(item.submissionDate || item.submitted, 'Hôm nay')}</span>
                  </td>
                  <td>
                    <Badge tone={tone} dot>{label}</Badge>
                  </td>
                  <td>
                    {item.moderationStatus === 'pending' ? (
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => onApprove(item.id)}
                          aria-label={`Duyệt hồ sơ ${item.name}`}
                          title="Duyệt"
                        >
                          <Check size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item.id, 'Thông tin xác thực chưa đầy đủ')}
                          aria-label={`Từ chối hồ sơ ${item.name}`}
                          title="Từ chối"
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ) : (
                      <span className="admin-row-actions__done">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan="5" className="admin-table__empty">
                  Không có hồ sơ phù hợp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="admin-section__footnote">
        Thao tác duyệt cập nhật tức thì vào danh sách gia sư công khai trên toàn hệ thống.
      </p>
    </section>
  );
}

function LiveClassesSection() {
  return (
    <section className="admin-section admin-live" aria-labelledby="live-title">
      <div className="admin-section__heading">
        <div>
          <span className="eyebrow">GIÁM SÁT HÔM NAY</span>
          <h2 id="live-title">Lớp học đang diễn ra</h2>
        </div>
        <Badge tone="success" dot>
          {liveClasses.filter((item) => item.status === 'live').length} trực tiếp
        </Badge>
      </div>
      <div className="admin-live__list">
        {liveClasses.map((item) => (
          <div className="admin-live__row" key={item.id}>
            <div className="admin-live__time">
              <strong>{item.time.split(' – ')[0]}</strong>
              <span>{item.format}</span>
            </div>
            <div className="admin-live__body">
              <strong>{item.subject}</strong>
              <span>{item.tutor} · {item.learner}</span>
            </div>
            <Badge tone={item.status === 'live' ? 'success' : 'info'} dot>
              {item.status === 'live' ? 'Đang diễn ra' : 'Sắp tới'}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewSection({ reviews, onApprove, onHide }) {
  const pendingCount = reviews.filter((item) => item.moderationStatus === 'pending').length;

  return (
    <section className="admin-section admin-reviews" aria-labelledby="reviews-title">
      <div className="admin-section__heading">
        <div>
          <span className="eyebrow">CHẤT LƯỢNG CỘNG ĐỒNG</span>
          <h2 id="reviews-title">Đánh giá cần xem</h2>
        </div>
        <div className="admin-section__heading-right">
          <span className="admin-section__count">{pendingCount} chờ xử lý</span>
          <Link to="/admin/reviews" className="admin-link-more">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <div className="admin-reviews__list">
        {reviews.slice(0, 4).map((item) => (
          <article className="admin-review" key={item.id}>
            <div className="admin-review__main">
              <div>
                <strong>{item.author || item.learner}</strong>
                <span> về {item.tutorName || item.tutor} · {item.rating}/5 sao</span>
              </div>
              <p>“{item.comment || item.excerpt}”</p>
            </div>
            {item.moderationStatus === 'pending' ? (
              <div className="admin-review__actions">
                <Button variant="secondary" size="xs" onClick={() => onApprove(item.id)}>
                  Duyệt
                </Button>
                <Button variant="quiet" size="xs" onClick={() => onHide(item.id)}>
                  Ẩn
                </Button>
              </div>
            ) : (
              <Badge tone={reviewModerationTones[item.moderationStatus] || 'neutral'}>
                {reviewModerationLabels[item.moderationStatus] || item.moderationStatus}
              </Badge>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function IssueSection({ issues }) {
  const openCount = issues.filter((i) => i.status !== 'resolved').length;

  return (
    <section className="admin-section admin-issues" aria-labelledby="issues-title">
      <div className="admin-section__heading">
        <div>
          <span className="eyebrow">CẦN THEO DÕI</span>
          <h2 id="issues-title">Báo cáo & sự cố</h2>
        </div>
        <div className="admin-section__heading-right">
          <span className="admin-section__count">{openCount} sự cố mở</span>
          <Link to="/admin/issues" className="admin-link-more">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <div className="admin-issues__list">
        {issues.slice(0, 5).map((item) => (
          <div className="admin-issue" key={item.id}>
            <span className="admin-issue__id">{item.id}</span>
            <div>
              <strong>{item.categoryLabel || item.label || item.category}</strong>
              <span>
                {item.learnerName || item.reporter || 'Học viên'} · {item.receivedDate || item.received || 'Mới đây'}
              </span>
            </div>
            <Badge tone={issueStatusTones[item.status] || 'warning'}>
              {issueStatusLabels[item.status] || item.status}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const overview = useAdminOverview();
  const { tutors, approveTutor, rejectTutor } = useAdminTutors();
  const { reviews, approveReview, hideReview } = useAdminReviews();
  const { issues } = useAdminIssues();

  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('pending');

  return (
    <AdminShell title="Tổng quan">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">VẬN HÀNH TUTORNEARME</span>
          <h1>Tổng quan hệ thống</h1>
          <p>Theo dõi hoạt động thực tế trên nền tảng và xử lý những mục đang cần chú ý.</p>
        </div>
        <span className="admin-page-head__date">
          {new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date())}
        </span>
      </div>

      <div className="admin-summary">
        <StatItem
          label="Gia sư trên hệ thống"
          value={overview?.stats?.totalTutors ?? 0}
          note={`${overview?.pendingTutorsCount ?? 0} hồ sơ chờ duyệt`}
          tone={overview?.pendingTutorsCount > 0 ? 'warning' : 'neutral'}
        />
        <StatItem
          label="Người dùng hoạt động"
          value={overview?.stats?.activeUsers ?? 0}
          note={`${overview?.stats?.suspendedUsers ?? 0} tài khoản bị khóa`}
          tone="neutral"
        />
        <StatItem
          label="Đánh giá gửi về"
          value={overview?.stats?.totalReviews ?? 0}
          note={`${overview?.pendingReviewsCount ?? 0} cần kiểm duyệt`}
          tone={overview?.pendingReviewsCount > 0 ? 'warning' : 'neutral'}
        />
        <StatItem
          label="Sự cố & khiếu nại"
          value={overview?.stats?.totalIssues ?? 0}
          note={`${overview?.openIssuesCount ?? 0} mục cần xử lý`}
          tone={overview?.openIssuesCount > 0 ? 'danger' : 'neutral'}
        />
      </div>

      <div className="admin-grid">
        <div className="admin-subgrid">
          <ApprovalSection
            tutors={tutors}
            onApprove={approveTutor}
            onReject={rejectTutor}
            filter={approvalFilter}
            onFilter={setApprovalFilter}
            search={search}
          />
          <IssueSection issues={issues} />
        </div>

        <div className="admin-subgrid">
          <LiveClassesSection />
          <ReviewSection
            reviews={reviews}
            onApprove={approveReview}
            onHide={hideReview}
          />
        </div>
      </div>
    </AdminShell>
  );
}
