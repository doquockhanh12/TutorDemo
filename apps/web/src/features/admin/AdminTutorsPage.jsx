import { useState, useMemo } from 'react';
import {
  Check,
  Eye,
  FileCheck2,
  Lock,
  Search,
  SlidersHorizontal,
  Unlock,
  X,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import AdminShell from './AdminShell.jsx';
import AdminSlideOver from './AdminSlideOver.jsx';
import {
  useAdminTutors,
  tutorModerationLabels,
  tutorModerationTones,
} from '../domain/useAdminDomain.js';

export function formatRecordCount(visibleCount, totalCount) {
  return `Hiển thị ${visibleCount} / ${totalCount} bản ghi`;
}

export function formatAdminDate(dateStr, fallback = 'Chưa xác định') {
  if (!dateStr) return fallback;
  if (typeof dateStr === 'string' && (dateStr.includes('/') || dateStr.includes('trước') || dateStr.startsWith('Hôm'))) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  } catch {
    /* fallback */
  }
  return dateStr;
}

const TABS = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã từ chối', 'Tạm khóa'];

export default function AdminTutorsPage() {
  const { tutors, approveTutor, rejectTutor, toggleSuspendTutor } = useAdminTutors();

  const [activeTab, setActiveTab] = useState('Chờ duyệt');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [feedback, setFeedback] = useState(null);

  const selectedTutor = useMemo(
    () => tutors.find((t) => t.id === selectedTutorId) || null,
    [tutors, selectedTutorId]
  );

  const filteredTutors = useMemo(() => {
    return tutors.filter((t) => {
      // Tab filter
      if (activeTab === 'Chờ duyệt' && t.moderationStatus !== 'pending') return false;
      if (activeTab === 'Đã duyệt' && t.moderationStatus !== 'approved') return false;
      if (activeTab === 'Đã từ chối' && t.moderationStatus !== 'rejected') return false;
      if (activeTab === 'Tạm khóa' && t.moderationStatus !== 'suspended') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLocaleLowerCase('vi-VN');
      const nameMatch = t.name?.toLocaleLowerCase('vi-VN').includes(q);
      const uniMatch = (t.university || t.school)?.toLocaleLowerCase('vi-VN').includes(q);
      const subjectsMatch = t.subjects?.some((s) => s.toLocaleLowerCase('vi-VN').includes(q));
      const emailMatch = t.email?.toLocaleLowerCase('vi-VN').includes(q);
      return nameMatch || uniMatch || subjectsMatch || emailMatch;
    });
  }, [tutors, activeTab, searchQuery]);

  const handleOpenDrawer = (tutorId) => {
    setSelectedTutorId(tutorId);
    setRejecting(false);
    setRejectionReason('');
    setRejectError('');
  };

  const handleCloseDrawer = () => {
    setSelectedTutorId(null);
    setRejecting(false);
    setRejectionReason('');
    setRejectError('');
  };

  const handleApprove = (id) => {
    approveTutor(id);
    setRejecting(false);
    const target = tutors.find((t) => t.id === id);
    setFeedback({
      type: 'success',
      message: `Đã phê duyệt hồ sơ của gia sư ${target?.name || ''} thành công!`,
    });
  };

  const handleStartReject = () => {
    setRejecting(true);
    setRejectionReason('');
    setRejectError('');
  };

  const handleConfirmReject = (id) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      setRejectError('Vui lòng cung cấp lý do từ chối hồ sơ.');
      return;
    }
    rejectTutor(id, rejectionReason.trim());
    setRejecting(false);
    setRejectionReason('');
    setRejectError('');
    const target = tutors.find((t) => t.id === id);
    setFeedback({
      type: 'danger',
      message: `Đã từ chối hồ sơ của gia sư ${target?.name || ''}.`,
    });
  };

  const handleToggleSuspend = (id) => {
    const target = tutors.find((t) => t.id === id);
    const willSuspend = target?.moderationStatus !== 'suspended';
    toggleSuspendTutor(id);
    setFeedback({
      type: willSuspend ? 'danger' : 'info',
      message: willSuspend
        ? `Đã tạm khóa tài khoản của gia sư ${target?.name || ''}.`
        : `Đã mở khóa tài khoản của gia sư ${target?.name || ''}.`,
    });
  };

  return (
    <AdminShell title="Quản lý gia sư">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">DANH SÁCH & PHÊ DUYỆT</span>
          <h1>Quản lý Gia sư</h1>
          <p>Duyệt hồ sơ mới đăng ký, quản lý tài liệu chứng chỉ và kiểm soát trạng thái hoạt động.</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-tabs" role="tablist" aria-label="Lọc theo trạng thái hồ sơ">
          {TABS.map((tab) => (
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
            placeholder="Tìm theo tên, trường, môn dạy..."
            aria-label="Tìm kiếm gia sư"
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
        <span>{formatRecordCount(filteredTutors.length, tutors.length)}</span>
      </div>

      <div className="admin-section admin-table-section">
        <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="Bảng danh sách gia sư">
          <table className="admin-table admin-table--tutors">
            <thead>
              <tr>
                <th>Gia sư</th>
                <th>Môn có thể dạy</th>
                <th>Học phí</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTutors.map((tutor) => {
                const tone = tutorModerationTones[tutor.moderationStatus] || 'neutral';
                const label = tutorModerationLabels[tutor.moderationStatus] || tutor.moderationStatus;

                return (
                  <tr key={tutor.id}>
                    <td>
                      <div className="admin-person">
                        <Avatar
                          initials={tutor.initials || tutor.name.slice(0, 2)}
                          name={tutor.name}
                          tone="blue"
                          size="xs"
                        />
                        <div>
                          <strong title={tutor.name}>{tutor.name}</strong>
                          <small title={tutor.university || tutor.school || 'Chưa cập nhật trường'}>{tutor.university || tutor.school || 'Chưa cập nhật trường'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-tags-cell" title={tutor.subjects?.join(', ') || 'Chưa chọn'}>
                        {tutor.subjects?.join(', ') || 'Chưa chọn'}
                      </span>
                    </td>
                    <td>
                      <strong>{tutor.price ? `${tutor.price.toLocaleString('vi-VN')} đ` : 'Chưa định giá'}</strong>
                      <small>/buổi</small>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={formatAdminDate(tutor.submissionDate || tutor.submitted, 'Mới cập nhật')}>
                        {formatAdminDate(tutor.submissionDate || tutor.submitted, 'Mới cập nhật')}
                      </span>
                    </td>
                    <td>
                      <Badge tone={tone} dot>{label}</Badge>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(tutor.id)}
                          aria-label={`Xem chi tiết hồ sơ ${tutor.name}`}
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </button>
                        {tutor.moderationStatus === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(tutor.id)}
                              aria-label={`Duyệt hồ sơ ${tutor.name}`}
                              title="Duyệt hồ sơ"
                            >
                              <Check size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenDrawer(tutor.id);
                                setRejecting(true);
                              }}
                              aria-label={`Từ chối hồ sơ ${tutor.name}`}
                              title="Từ chối hồ sơ"
                            >
                              <X size={17} />
                            </button>
                          </>
                        )}
                        {tutor.moderationStatus === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleToggleSuspend(tutor.id)}
                            aria-label={`Tạm khóa tài khoản ${tutor.name}`}
                            title="Tạm khóa tài khoản"
                          >
                            <Lock size={17} />
                          </button>
                        )}
                        {tutor.moderationStatus === 'suspended' && (
                          <button
                            type="button"
                            onClick={() => handleToggleSuspend(tutor.id)}
                            aria-label={`Mở khóa tài khoản ${tutor.name}`}
                            title="Mở khóa tài khoản"
                          >
                            <Unlock size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTutors.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-table__empty">
                    Không có gia sư nào phù hợp với bộ lọc và từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Tutor details */}
      <AdminSlideOver
        open={Boolean(selectedTutor)}
        onClose={handleCloseDrawer}
        title={selectedTutor?.name || 'Chi tiết hồ sơ gia sư'}
        subtitle={selectedTutor?.university || selectedTutor?.school}
        badge={
          selectedTutor && (
            <Badge
              tone={tutorModerationTones[selectedTutor.moderationStatus] || 'neutral'}
              dot
            >
              {tutorModerationLabels[selectedTutor.moderationStatus] || selectedTutor.moderationStatus}
            </Badge>
          )
        }
        footer={
          selectedTutor && (
            <div className="admin-drawer-actions">
              {selectedTutor.moderationStatus === 'pending' && !rejecting && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedTutor.id)}
                  >
                    <Check size={16} /> Phê duyệt hồ sơ
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleStartReject}
                  >
                    <X size={16} /> Từ chối duyệt
                  </Button>
                </>
              )}

              {selectedTutor.moderationStatus === 'approved' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleSuspend(selectedTutor.id)}
                >
                  <Lock size={16} /> Tạm khóa tài khoản
                </Button>
              )}

              {selectedTutor.moderationStatus === 'suspended' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleToggleSuspend(selectedTutor.id)}
                >
                  <Unlock size={16} /> Mở khóa tài khoản
                </Button>
              )}

              {selectedTutor.moderationStatus === 'rejected' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(selectedTutor.id)}
                >
                  <Check size={16} /> Xem xét lại & Phê duyệt
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedTutor && (
          <div className="admin-drawer-detail">
            {rejecting && (
              <div className="admin-reject-box" role="alert">
                <h4>Từ chối hồ sơ gia sư</h4>
                <p>Vui lòng ghi rõ lý do để gửi phản hồi cho sinh viên gia sư:</p>
                <textarea
                  className="admin-textarea"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  placeholder="Ví dụ: Ảnh thẻ sinh viên bị mờ, chứng chỉ chưa hợp lệ..."
                  rows={3}
                />
                {rejectError && <p className="admin-form-error">{rejectError}</p>}
                <div className="admin-reject-box__actions">
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleConfirmReject(selectedTutor.id)}
                  >
                    Xác nhận từ chối
                  </Button>
                  <Button
                    variant="quiet"
                    size="xs"
                    onClick={() => setRejecting(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}

            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Thông tin giảng dạy</h3>
              <dl className="admin-detail-grid">
                <div>
                  <dt>Trường Đại học</dt>
                  <dd>{selectedTutor.university || selectedTutor.school || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Mức học phí đề xuất</dt>
                  <dd>
                    <strong>
                      {selectedTutor.price ? `${selectedTutor.price.toLocaleString('vi-VN')} đ` : 'Chưa định giá'}
                    </strong> / buổi
                  </dd>
                </div>
                <div>
                  <dt>Môn dạy đăng ký</dt>
                  <dd>{selectedTutor.subjects?.join(', ') || 'Chưa có'}</dd>
                </div>
                <div>
                  <dt>Cấp độ có thể dạy</dt>
                  <dd>{selectedTutor.levels?.join(', ') || 'THCS, THPT'}</dd>
                </div>
                <div>
                  <dt>Khu vực dạy</dt>
                  <dd>{selectedTutor.areas?.join(', ') || selectedTutor.location || 'Toàn thành phố'}</dd>
                </div>
                <div>
                  <dt>Thời lượng chuẩn</dt>
                  <dd>{selectedTutor.sessionMinutes ? `${selectedTutor.sessionMinutes} phút` : '45 phút'}</dd>
                </div>
              </dl>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Giới thiệu & Phương pháp</h3>
              <p className="admin-detail-text">
                {selectedTutor.intro || selectedTutor.bio || 'Chưa có nội dung tự giới thiệu.'}
              </p>
              {selectedTutor.approach && (
                <div className="admin-detail-sub">
                  <strong>Phương pháp giảng dạy:</strong>
                  <p>{selectedTutor.approach}</p>
                </div>
              )}
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">
                <FileCheck2 size={16} /> Tài liệu minh chứng & Thẻ sinh viên
              </h3>
              <div className="admin-verification-docs">
                {(selectedTutor.verificationDocuments || [
                  { type: 'student_card', title: 'Thẻ sinh viên ' + (selectedTutor.university || 'Đại học'), verified: true },
                  { type: 'identity_card', title: 'Căn cước công dân gắn chip', verified: true },
                ]).map((doc, idx) => (
                  <div className="admin-doc-item" key={idx}>
                    <div className="admin-doc-item__icon">
                      <FileCheck2 size={20} />
                    </div>
                    <div className="admin-doc-item__info">
                      <strong>{doc.title}</strong>
                      <small>{doc.type === 'student_card' ? 'Thẻ sinh viên xác thực' : 'Giấy tờ tùy thân'}</small>
                    </div>
                    <Badge tone="success" dot>Đã kiểm tra</Badge>
                  </div>
                ))}
              </div>
            </div>

            {selectedTutor.rejectionReason && (
              <div className="admin-detail-group admin-detail-group--warning">
                <h3 className="admin-detail-group__title">Lý do từ chối trước đó</h3>
                <p className="admin-rejection-note">{selectedTutor.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </AdminSlideOver>
    </AdminShell>
  );
}
