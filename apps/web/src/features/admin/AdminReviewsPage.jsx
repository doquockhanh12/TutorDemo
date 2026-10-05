import { useState, useMemo } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  MessageSquare,
  Search,
  Star,
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import AdminShell from './AdminShell.jsx';
import AdminSlideOver from './AdminSlideOver.jsx';
import { formatRecordCount, formatAdminDate } from './AdminTutorsPage.jsx';
import {
  useAdminReviews,
  reviewModerationLabels,
  reviewModerationTones,
} from '../domain/useAdminDomain.js';

const REVIEW_TABS = ['Cần duyệt / Xem xét', 'Đã hiển thị', 'Đã ẩn', 'Tất cả'];

export default function AdminReviewsPage() {
  const { reviews, approveReview, hideReview } = useAdminReviews();

  const [activeTab, setActiveTab] = useState('Cần duyệt / Xem xét');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const [feedback, setFeedback] = useState(null);

  const selectedReview = useMemo(
    () => reviews.find((r) => r.id === selectedReviewId) || null,
    [reviews, selectedReviewId]
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Tab filter
      if (activeTab === 'Cần duyệt / Xem xét' && r.moderationStatus !== 'pending') return false;
      if (activeTab === 'Đã hiển thị' && (r.moderationStatus || 'approved') !== 'approved') return false;
      if (activeTab === 'Đã ẩn' && r.moderationStatus !== 'hidden') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLocaleLowerCase('vi-VN');
      const authorMatch = (r.author || r.learnerName)?.toLocaleLowerCase('vi-VN').includes(q);
      const commentMatch = (r.comment || r.excerpt)?.toLocaleLowerCase('vi-VN').includes(q);
      const tutorMatch = (r.tutorName || r.tutor)?.toLocaleLowerCase('vi-VN').includes(q);
      return authorMatch || commentMatch || tutorMatch;
    });
  }, [reviews, activeTab, searchQuery]);

  const handleOpenDrawer = (reviewId) => {
    setSelectedReviewId(reviewId);
  };

  const handleCloseDrawer = () => {
    setSelectedReviewId(null);
  };

  const handleApprove = (id) => {
    approveReview(id);
    setFeedback({
      type: 'success',
      message: 'Đã phê duyệt hiển thị đánh giá công khai trên hồ sơ gia sư.',
    });
  };

  const handleHide = (id) => {
    hideReview(id);
    setFeedback({
      type: 'info',
      message: 'Đã ẩn đánh giá khỏi trang cá nhân công khai của gia sư.',
    });
  };

  return (
    <AdminShell title="Kiểm duyệt đánh giá">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">CHẤT LƯỢNG CỘNG ĐỒNG</span>
          <h1>Kiểm duyệt Đánh giá</h1>
          <p>Duyệt và kiểm soát các nhận xét, đánh giá từ học viên về gia sư sau các buổi học.</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-tabs" role="tablist" aria-label="Lọc theo trạng thái kiểm duyệt">
          {REVIEW_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`admin-tab ${activeTab === tab ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="admin-filter-bar__search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo người đánh giá, gia sư, nội dung..."
            aria-label="Tìm kiếm đánh giá"
          />
        </div>
      </div>

      {feedback && (
        <div className={`admin-feedback-banner admin-feedback-banner--${feedback.type}`} role="status">
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Đóng thông báo">✕</button>
        </div>
      )}

      <div className="admin-record-counter">
        <span>{formatRecordCount(filteredReviews.length, reviews.length)}</span>
      </div>

      <div className="admin-section admin-table-section">
        <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="Bảng đánh giá">
          <table className="admin-table admin-table--reviews">
            <thead>
              <tr>
                <th>Người đánh giá</th>
                <th>Gia sư</th>
                <th>Điểm sao</th>
                <th>Nội dung nhận xét</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((rev) => {
                const tone = reviewModerationTones[rev.moderationStatus] || 'neutral';
                const label = reviewModerationLabels[rev.moderationStatus] || rev.moderationStatus;

                return (
                  <tr key={rev.id}>
                    <td>
                      <strong className="admin-cell-truncate" title={rev.author || rev.learnerName || 'Ẩn danh'}>
                        {rev.author || rev.learnerName || 'Ẩn danh'}
                      </strong>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={rev.tutorName || rev.tutor || 'Gia sư'}>
                        {rev.tutorName || rev.tutor || 'Gia sư'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-stars-cell">
                        <Star size={14} className="star-filled" />
                        <strong>{rev.rating}/5</strong>
                      </div>
                    </td>
                    <td>
                      <span className="admin-excerpt-cell" title={rev.comment || rev.excerpt}>
                        “{rev.comment || rev.excerpt}”
                      </span>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={formatAdminDate(rev.date || rev.submitted, 'Tháng 10/2026')}>
                        {formatAdminDate(rev.date || rev.submitted, 'Tháng 10/2026')}
                      </span>
                    </td>
                    <td>
                      <Badge tone={tone} dot>{label}</Badge>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(rev.id)}
                          aria-label={`Xem chi tiết đánh giá từ ${rev.author || 'người học'}`}
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </button>
                        {rev.moderationStatus !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(rev.id)}
                            aria-label={`Duyệt hiển thị đánh giá ${rev.id}`}
                            title="Duyệt hiển thị"
                          >
                            <Check size={17} />
                          </button>
                        )}
                        {rev.moderationStatus !== 'hidden' && (
                          <button
                            type="button"
                            onClick={() => handleHide(rev.id)}
                            aria-label={`Ẩn đánh giá ${rev.id}`}
                            title="Ẩn đánh giá"
                          >
                            <EyeOff size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-table__empty">
                    Không có đánh giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Review details */}
      <AdminSlideOver
        open={Boolean(selectedReview)}
        onClose={handleCloseDrawer}
        title={selectedReview ? `Đánh giá từ ${selectedReview.author || 'Người học'}` : 'Chi tiết đánh giá'}
        subtitle={`Dành cho Gia sư ${selectedReview?.tutorName || selectedReview?.tutor}`}
        badge={
          selectedReview && (
            <Badge
              tone={reviewModerationTones[selectedReview.moderationStatus] || 'neutral'}
              dot
            >
              {reviewModerationLabels[selectedReview.moderationStatus] || selectedReview.moderationStatus}
            </Badge>
          )
        }
        footer={
          selectedReview && (
            <div className="admin-drawer-actions">
              {selectedReview.moderationStatus !== 'approved' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(selectedReview.id)}
                >
                  <Check size={16} /> Duyệt hiển thị công khai
                </Button>
              )}
              {selectedReview.moderationStatus !== 'hidden' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleHide(selectedReview.id)}
                >
                  <EyeOff size={16} /> Ẩn khỏi trang gia sư
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedReview && (
          <div className="admin-drawer-detail">
            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Điểm xếp hạng</h3>
              <div className="admin-rating-display">
                <div className="admin-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={star <= selectedReview.rating ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <strong>{selectedReview.rating} trên 5 sao</strong>
              </div>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Nội dung nhận xét</h3>
              <blockquote className="admin-review-quote">
                “{selectedReview.comment || selectedReview.excerpt}”
              </blockquote>
              <div className="admin-detail-meta">
                <span>Gửi vào lúc: <strong>{selectedReview.date || selectedReview.submitted || 'Tháng 10/2026'}</strong></span>
              </div>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Thông tin buổi học liên quan</h3>
              <dl className="admin-detail-grid">
                <div>
                  <dt>Người đánh giá</dt>
                  <dd>{selectedReview.author || selectedReview.learnerName || 'Học viên ẩn danh'}</dd>
                </div>
                <div>
                  <dt>Gia sư được đánh giá</dt>
                  <dd>{selectedReview.tutorName || selectedReview.tutor}</dd>
                </div>
                <div>
                  <dt>Môn học</dt>
                  <dd>{selectedReview.subject || selectedReview.relatedLesson?.subject || 'Theo khóa học'}</dd>
                </div>
                <div>
                  <dt>Mã buổi học</dt>
                  <dd>{selectedReview.relatedLessonId || selectedReview.lessonId || 'Đã liên kết lớp học'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </AdminSlideOver>
    </AdminShell>
  );
}
