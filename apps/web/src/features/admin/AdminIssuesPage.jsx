import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import AdminShell from './AdminShell.jsx';
import AdminSlideOver from './AdminSlideOver.jsx';
import AccountReportHistory from './AccountReportHistory.jsx';
import { formatRecordCount, formatAdminDate } from './AdminTutorsPage.jsx';
import {
  useAdminIssues,
  issueStatusLabels,
  issueStatusTones,
  issueCategoryLabels,
} from '../domain/useAdminDomain.js';

const ISSUE_TABS = ['Mới tiếp nhận', 'Đang xử lý', 'Đã giải quyết', 'Đã từ chối', 'Tất cả'];

export default function AdminIssuesPage() {
  const { issues, updateIssueStatus, warnUserIssue, dismissIssue, getAccountHistory } = useAdminIssues();
  const [historyAccount, setHistoryAccount] = useState(null);

  const [activeTab, setActiveTab] = useState('Mới tiếp nhận');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Drawer action state
  const [actionTab, setActionTab] = useState('warn'); // 'warn' | 'dismiss' | 'update'
  const [warningReason, setWarningReason] = useState('');
  const [dismissalReason, setDismissalReason] = useState('');
  const [statusDraft, setStatusDraft] = useState('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [formError, setFormError] = useState('');

  const selectedIssue = useMemo(
    () => issues.find((i) => i.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  );

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      // Tab filter
      if (activeTab === 'Mới tiếp nhận' && i.status !== 'new') return false;
      if (activeTab === 'Đang xử lý' && i.status !== 'in_progress') return false;
      if (activeTab === 'Đã giải quyết' && i.status !== 'resolved') return false;
      if (activeTab === 'Đã từ chối' && i.status !== 'dismissed' && i.status !== 'rejected') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLocaleLowerCase('vi-VN');
      const idMatch = i.id?.toLocaleLowerCase('vi-VN').includes(q);
      const catMatch = (i.categoryLabel || i.category)?.toLocaleLowerCase('vi-VN').includes(q);
      const descMatch = i.description?.toLocaleLowerCase('vi-VN').includes(q);
      const learnerMatch = (i.reporter?.name || i.learnerName || i.reporter)?.toLocaleLowerCase('vi-VN').includes(q);
      const tutorMatch = (i.targetUser?.name || i.tutorName || i.relatedTo)?.toLocaleLowerCase('vi-VN').includes(q);
      return idMatch || catMatch || descMatch || learnerMatch || tutorMatch;
    });
  }, [issues, activeTab, searchQuery]);

  const handleOpenDrawer = (issue) => {
    setHistoryAccount(null);
    setSelectedIssueId(issue.id);
    setActionTab('warn');
    setWarningReason('');
    setDismissalReason('');
    setStatusDraft(issue.status || 'in_progress');
    setResolutionNote(issue.resolutionNote || '');
    setFormError('');
  };

  const handleCloseDrawer = () => {
    setHistoryAccount(null);
    setSelectedIssueId(null);
    setFormError('');
  };

  // 1. Gửi cảnh cáo vi phạm
  const handleSendWarning = (issue) => {
    if (!warningReason.trim()) {
      setFormError('Vui lòng nhập lý do/căn cứ gửi cảnh cáo vi phạm.');
      return;
    }
    warnUserIssue(issue.id, warningReason.trim());
    const nextCount = (issue.targetUser?.warningCount || 0) + 1;
    if (nextCount > 3) {
      setFeedback({
        type: 'danger',
        message: `Đã gửi cảnh cáo vi phạm tới ${issue.targetUser.name} (Cảnh cáo lần thứ ${nextCount} - vượt quá 3 lần). Tài khoản đã TỰ ĐỘNG BỊ KHÓA!`,
      });
    } else {
      setFeedback({
        type: 'warning',
        message: `Đã gửi cảnh cáo tranh chấp vi phạm tới ${issue.targetUser.name} (${nextCount}/3 cảnh cáo). Sự cố ${issue.id} đã giải quyết xong.`,
      });
    }
    handleCloseDrawer();
  };

  // 2. Từ chối báo cáo thiếu xác thực
  const handleDismissReport = (issue) => {
    if (!dismissalReason.trim()) {
      setFormError('Vui lòng nhập thông báo lý do từ chối gửi về cho người gửi.');
      return;
    }
    dismissIssue(issue.id, dismissalReason.trim());
    setFeedback({
      type: 'info',
      message: `Đã từ chối báo cáo ${issue.id} do chưa đủ tính xác thực và gửi thông báo phản hồi lại cho ${issue.reporter.name}.`,
    });
    handleCloseDrawer();
  };

  // 3. Cập nhật trạng thái thông thường
  const handleSaveStatus = (id) => {
    if (statusDraft === 'resolved' && (!resolutionNote || !resolutionNote.trim())) {
      setFormError('Vui lòng nhập ghi chú giải quyết trước khi đóng sự cố.');
      return;
    }
    updateIssueStatus(id, statusDraft, resolutionNote.trim());
    setFormError('');
    setFeedback({
      type: 'info',
      message: `Đã cập nhật trạng thái sự cố ${id} sang: ${issueStatusLabels[statusDraft] || statusDraft}.`,
    });
    handleCloseDrawer();
  };

  return (
    <AdminShell title="Báo cáo & sự cố">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">XỬ LÝ KHIẾU NẠI & HỖ TRỢ</span>
          <h1>Báo cáo & Sự cố</h1>
          <p>Đối soát thông tin 2 bên, xử lý cảnh cáo tranh chấp (quá 3 lần sẽ tự động khóa) và hủy báo cáo thiếu xác thực.</p>
        </div>
        <Link to="/admin/appeals" className="admin-link-more">Xem kháng cáo</Link>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-tabs" role="tablist" aria-label="Lọc theo trạng thái xử lý">
          {ISSUE_TABS.map((tab) => (
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
            placeholder="Tìm theo mã vé, vấn đề, người gửi..."
            aria-label="Tìm kiếm sự cố"
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
        <span>{formatRecordCount(filteredIssues.length, issues.length)}</span>
      </div>

      <div className="admin-section admin-table-section">
        <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="Bảng sự cố và báo cáo">
          <table className="admin-table admin-table--issues">
            <thead>
              <tr>
                <th>Mã sự cố</th>
                <th>Phân loại</th>
                <th>Người gửi</th>
                <th>Bên liên quan</th>
                <th>Ngày nhận</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                let tone = issueStatusTones[issue.status] || 'warning';
                let label = issueStatusLabels[issue.status] || issue.displayStatus || issue.status;
                if (issue.resolutionAction === 'warning_issued') {
                  tone = 'warning';
                  label = 'Đã cảnh cáo';
                }

                return (
                  <tr key={issue.id}>
                    <td>
                      <strong className="admin-ticket-code" title={issue.id}>{issue.id}</strong>
                    </td>
                    <td>
                      <span className="admin-category-tag">{issue.categoryLabel || issue.category}</span>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={issue.reporter?.name || issue.learnerName || issue.reporter || 'Người học'}>
                        {issue.reporter?.name || issue.learnerName || issue.reporter || 'Người học'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={issue.targetUser?.name || issue.tutorName || issue.relatedTo || 'Gia sư'}>
                        {issue.targetUser?.name || issue.tutorName || issue.relatedTo || 'Gia sư'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="admin-cell-truncate"
                        title={issue.received || formatAdminDate(issue.receivedDate || issue.createdAt, 'Tháng 10/2026')}
                      >
                        {issue.received || formatAdminDate(issue.receivedDate || issue.createdAt, 'Tháng 10/2026')}
                      </span>
                    </td>
                    <td>
                      <Badge tone={tone} dot>{label}</Badge>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(issue)}
                          aria-label={`Xử lý sự cố ${issue.id}`}
                          title="Xem & Xử lý"
                        >
                          <Eye size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-table__empty">
                    Không có báo cáo hoặc sự cố nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Issue details */}
      <AdminSlideOver
        open={Boolean(selectedIssue)}
        onClose={handleCloseDrawer}
        title={historyAccount ? `Lịch sử báo cáo — ${historyAccount.name}` : selectedIssue ? `Sự cố ${selectedIssue.id}` : 'Chi tiết sự cố'}
        subtitle={selectedIssue ? `Phân loại: ${selectedIssue.categoryLabel || selectedIssue.category}` : ''}
        badge={
          selectedIssue && (
            <Badge
              tone={
                selectedIssue.resolutionAction === 'warning_issued'
                  ? 'warning'
                  : (issueStatusTones[selectedIssue.status] || 'warning')
              }
              dot
            >
              {selectedIssue.resolutionAction === 'warning_issued'
                ? 'Đã cảnh cáo'
                : (issueStatusLabels[selectedIssue.status] || selectedIssue.status)}
            </Badge>
          )
        }
        footer={
          selectedIssue && (
            <div className="admin-drawer-actions">
              {historyAccount ? <Button variant="secondary" size="sm" onClick={() => setHistoryAccount(null)}>Quay lại đối soát</Button> : selectedIssue.isOpen ? (
                <>
                  {actionTab === 'warn' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendWarning(selectedIssue)}
                    >
                      <ShieldAlert size={16} /> Gửi cảnh cáo & Giải quyết sự cố
                    </Button>
                  )}
                  {actionTab === 'dismiss' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDismissReport(selectedIssue)}
                    >
                      <XCircle size={16} /> Từ chối báo cáo & Gửi thông báo
                    </Button>
                  )}
                  {actionTab === 'update' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveStatus(selectedIssue.id)}
                    >
                      <CheckCircle2 size={16} /> Lưu cập nhật trạng thái
                    </Button>
                  )}
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={handleCloseDrawer}>
                  Đóng
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedIssue && (historyAccount ? <AccountReportHistory account={historyAccount} history={getAccountHistory(historyAccount.id)} /> : (
          <div className="admin-drawer-detail">
            {/* KHỐI 1: ĐỐI SOÁT THÔNG TIN VÀ ĐỘ TIN CẬY 2 BÊN */}
            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Đối soát thông tin & Độ tin cậy hai bên</h3>
              
              <div className="admin-parties-grid">
                {/* Cột Bên gửi phản ánh */}
                <div className="admin-party-card">
                  <span className="admin-party-card__role-tag">Bên gửi phản ánh</span>
                  <div className="admin-party-card__user">
                    <Avatar
                      initials={selectedIssue.reporter.initials}
                      name={selectedIssue.reporter.name}
                      tone={selectedIssue.reporter.avatarTone}
                      size="sm"
                    />
                    <div className="admin-party-card__user-info">
                      <strong title={selectedIssue.reporter.name}>{selectedIssue.reporter.name}</strong>
                      <small>@{selectedIssue.reporter.username} · {selectedIssue.reporter.displayRole}</small>
                    </div>
                  </div>

                  <div className="admin-party-contacts">
                    <div className="admin-party-contact-item" title={selectedIssue.reporter.email}>
                      <Mail size={13} aria-hidden="true" />
                      <span>{selectedIssue.reporter.email}</span>
                    </div>
                    <div className="admin-party-contact-item" title={selectedIssue.reporter.phone}>
                      <Phone size={13} aria-hidden="true" />
                      <span>{selectedIssue.reporter.phone}</span>
                    </div>
                  </div>

                  <button type="button" aria-label={`Lịch sử báo cáo của ${selectedIssue.reporter.name}`} onClick={() => setHistoryAccount(selectedIssue.reporter)} className="admin-party-trust-badge admin-party-trust-badge--reporter">
                    <span>Lịch sử báo cáo</span>
                    <strong>{getAccountHistory(selectedIssue.reporter.id).reports.length} báo cáo · {getAccountHistory(selectedIssue.reporter.id).warningCount} cảnh cáo</strong>
                  </button>
                </div>

                {/* Cột Bên bị khiếu nại (Đối tượng liên quan) */}
                <div className="admin-party-card">
                  <span className="admin-party-card__role-tag">Đối tượng bị khiếu nại</span>
                  <div className="admin-party-card__user">
                    <Avatar
                      initials={selectedIssue.targetUser.initials}
                      name={selectedIssue.targetUser.name}
                      tone={selectedIssue.targetUser.avatarTone}
                      size="sm"
                    />
                    <div className="admin-party-card__user-info">
                      <strong title={selectedIssue.targetUser.name}>{selectedIssue.targetUser.name}</strong>
                      <small>@{selectedIssue.targetUser.username} · {selectedIssue.targetUser.displayRole}</small>
                    </div>
                  </div>

                  <div className="admin-party-contacts">
                    <div className="admin-party-contact-item" title={selectedIssue.targetUser.email}>
                      <Mail size={13} aria-hidden="true" />
                      <span>{selectedIssue.targetUser.email}</span>
                    </div>
                    <div className="admin-party-contact-item" title={selectedIssue.targetUser.phone}>
                      <Phone size={13} aria-hidden="true" />
                      <span>{selectedIssue.targetUser.phone}</span>
                    </div>
                  </div>

                  <button type="button" aria-label={`Lịch sử báo cáo của ${selectedIssue.targetUser.name}`} onClick={() => setHistoryAccount(selectedIssue.targetUser)} className={`admin-party-trust-badge admin-party-trust-badge--warn-${Math.min(selectedIssue.targetUser.warningCount, 4)}`}>
                    <span>Lịch sử báo cáo</span>
                    <div className="admin-party-trust-right">
                      <strong>{selectedIssue.targetUser.warningCount} / 3</strong>
                      <div className="admin-warning-meter" aria-label={`Đã nhận ${selectedIssue.targetUser.warningCount} trên 3 cảnh cáo`}>
                        <span className={`admin-warning-meter__bar ${selectedIssue.targetUser.warningCount >= 1 ? 'is-active is-level-1' : ''}`} />
                        <span className={`admin-warning-meter__bar ${selectedIssue.targetUser.warningCount >= 2 ? 'is-active is-level-2' : ''}`} />
                        <span className={`admin-warning-meter__bar ${selectedIssue.targetUser.warningCount >= 3 ? 'is-active is-level-3' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {selectedIssue.targetUser.warningCount >= 3 && !selectedIssue.targetUser.isSuspended && (
                    <div className="admin-party-alert admin-party-alert--danger">
                      ⚠️ Đã nhận tối đa 3 cảnh cáo! Nhận thêm 1 cảnh cáo sẽ tự động bị khóa tài khoản ngay lập tức.
                    </div>
                  )}

                  {selectedIssue.targetUser.isSuspended && (
                    <div className="admin-party-alert admin-party-alert--suspended">
                      🚫 Tài khoản này hiện đang bị tạm khóa trong hệ thống.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KHỐI 2: THÔNG TIN PHIẾU & NỘI DUNG PHẢN ÁNH */}
            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Thông tin & Nội dung khiếu nại</h3>
              <dl className="admin-detail-grid">
                <div>
                  <dt>Mã phiếu</dt>
                  <dd><strong>{selectedIssue.id}</strong></dd>
                </div>
                <div>
                  <dt>Phân loại sự cố</dt>
                  <dd>{selectedIssue.categoryLabel || selectedIssue.category}</dd>
                </div>
                <div>
                  <dt>Ngày tiếp nhận</dt>
                  <dd>{formatAdminDate(selectedIssue.receivedDate || selectedIssue.createdAt, 'Tháng 10/2026')}</dd>
                </div>
                <div>
                  <dt>Trạng thái</dt>
                  <dd>
                    <Badge tone={issueStatusTones[selectedIssue.status] || 'warning'} dot>
                      {issueStatusLabels[selectedIssue.status] || selectedIssue.status}
                    </Badge>
                  </dd>
                </div>
              </dl>

              <div className="admin-issue-desc-box">
                <p><strong>Nội dung phản ánh:</strong> {selectedIssue.description || 'Không có mô tả chi tiết kèm theo.'}</p>
              </div>

              {/* Kết quả xử lý đã lưu nếu có */}
              {selectedIssue.resolutionAction === 'warning_issued' && (
                <div className="admin-resolution-box admin-resolution-box--warn">
                  <div className="admin-resolution-box__header">
                    <ShieldAlert size={16} />
                    <strong>Đã xử lý cảnh cáo vi phạm đối với bên liên quan</strong>
                  </div>
                  <p>{selectedIssue.resolutionNote}</p>
                  {selectedIssue.resolvedAt && (
                    <small>Thời gian ghi nhận: {new Date(selectedIssue.resolvedAt).toLocaleString('vi-VN')}</small>
                  )}
                </div>
              )}

              {selectedIssue.resolutionAction === 'dismissed_unverified' && (
                <div className="admin-resolution-box admin-resolution-box--dismiss">
                  <div className="admin-resolution-box__header">
                    <XCircle size={16} />
                    <strong>Đã từ chối báo cáo (Chưa đủ tính xác thực)</strong>
                  </div>
                  <p><strong>Thông báo gửi người báo cáo:</strong> {selectedIssue.reporterNotice || selectedIssue.resolutionNote}</p>
                  {selectedIssue.dismissedAt && (
                    <small>Thời gian từ chối: {new Date(selectedIssue.dismissedAt).toLocaleString('vi-VN')}</small>
                  )}
                </div>
              )}

              {selectedIssue.status === 'resolved' && selectedIssue.resolutionAction !== 'warning_issued' && selectedIssue.resolutionNote && (
                <div className="admin-resolution-box">
                  <div className="admin-resolution-box__header">
                    <CheckCircle2 size={16} />
                    <strong>Kết quả giải quyết sự cố</strong>
                  </div>
                  <p>{selectedIssue.resolutionNote}</p>
                </div>
              )}
            </div>

            {/* KHỐI 3: QUYẾT ĐỊNH XỬ LÝ CỦA QUẢN TRỊ VIÊN */}
            {selectedIssue.isOpen ? (
              <div className="admin-detail-group">
                <h3 className="admin-detail-group__title">Quyết định xử lý của Quản trị viên</h3>

                {/* Sub-tabs lựa chọn hành động */}
                <div className="admin-action-tabs" role="tablist" aria-label="Hình thức xử lý sự cố">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={actionTab === 'warn'}
                    className={`admin-action-tab ${actionTab === 'warn' ? 'is-active is-warn' : ''}`}
                    onClick={() => { setActionTab('warn'); setFormError(''); }}
                  >
                    <ShieldAlert size={15} /> Gửi cảnh cáo vi phạm
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={actionTab === 'dismiss'}
                    className={`admin-action-tab ${actionTab === 'dismiss' ? 'is-active is-dismiss' : ''}`}
                    onClick={() => { setActionTab('dismiss'); setFormError(''); }}
                  >
                    <XCircle size={15} /> Từ chối báo cáo
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={actionTab === 'update'}
                    className={`admin-action-tab ${actionTab === 'update' ? 'is-active' : ''}`}
                    onClick={() => { setActionTab('update'); setFormError(''); }}
                  >
                    Cập nhật tiến độ
                  </button>
                </div>

                {/* Tab 1: Gửi cảnh cáo vi phạm */}
                {actionTab === 'warn' && (
                  <div className="admin-action-panel">
                    <div className={`admin-action-callout ${selectedIssue.targetUser.warningCount >= 3 ? 'admin-action-callout--danger' : 'admin-action-callout--warn'}`}>
                      {selectedIssue.targetUser.warningCount >= 3 ? (
                        <>
                          <strong>⚠️ CẢNH BÁO TỰ ĐỘNG KHÓA:</strong>
                          <p>
                            Tài khoản <strong>{selectedIssue.targetUser.name}</strong> đã có {selectedIssue.targetUser.warningCount} lần cảnh cáo.
                            Gửi cảnh cáo này sẽ nâng tổng số lên <strong>{selectedIssue.targetUser.warningCount + 1} lần (vượt quá 3 lần)</strong> và hệ thống sẽ <strong>TỰ ĐỘNG KHÓA TÀI KHOẢN</strong> ngay lập tức!
                          </p>
                        </>
                      ) : (
                        <>
                          <strong>Quy tắc xử lý cảnh cáo:</strong>
                          <p>
                            Sau thao tác này, tài khoản <strong>{selectedIssue.targetUser.name}</strong> sẽ nhận cảnh cáo lần thứ <strong>{selectedIssue.targetUser.warningCount + 1}/3</strong>. Sự cố sẽ được đóng với trạng thái "Đã giải quyết".
                          </p>
                        </>
                      )}
                    </div>

                    <div className="admin-form-field">
                      <label htmlFor="warning-reason-input">
                        Lý do / Căn cứ gửi cảnh cáo vi phạm: <span className="admin-required-star">*</span>
                      </label>
                      <textarea
                        id="warning-reason-input"
                        className="admin-textarea"
                        value={warningReason}
                        onChange={(e) => {
                          setWarningReason(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="Ghi rõ hành vi vi phạm có đủ chứng cứ (VD: Vắng mặt buổi học online không báo trước, tự ý kết thúc buổi học sớm mà vẫn thu nguyên phí...)"
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Tab 2: Từ chối báo cáo thiếu xác thực */}
                {actionTab === 'dismiss' && (
                  <div className="admin-action-panel">
                    <div className="admin-action-callout admin-action-callout--info">
                      <strong>Chính sách bảo vệ tài khoản:</strong>
                      <p>
                        Hủy yêu cầu báo cáo do chưa đủ chứng cứ xác thực. Đối tượng bị khiếu nại (<strong>{selectedIssue.targetUser.name}</strong>) sẽ <strong>KHÔNG</strong> bị tăng số lần cảnh cáo. Thông báo phản hồi sẽ được gửi trả về người báo cáo.
                      </p>
                    </div>

                    <div className="admin-form-field">
                      <label htmlFor="dismissal-reason-input">
                        Lý do từ chối gửi thông báo phản hồi lại cho người gửi: <span className="admin-required-star">*</span>
                      </label>
                      <textarea
                        id="dismissal-reason-input"
                        className="admin-textarea"
                        value={dismissalReason}
                        onChange={(e) => {
                          setDismissalReason(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="Nhập thông báo phản hồi (VD: Sau khi đối soát thời lượng và liên hệ hai bên, bằng chứng chưa đủ để xác nhận vi phạm...)"
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Tab 3: Cập nhật thông thường */}
                {actionTab === 'update' && (
                  <div className="admin-action-panel">
                    <div className="admin-form-field">
                      <label htmlFor="issue-status-select">Cập nhật trạng thái:</label>
                      <select
                        id="issue-status-select"
                        className="admin-select"
                        value={statusDraft}
                        onChange={(e) => setStatusDraft(e.target.value)}
                      >
                        <option value="new">Mới tiếp nhận</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                      </select>
                    </div>

                    <div className="admin-form-field">
                      <label htmlFor="issue-resolution-note">
                        Ghi chú tiến độ / kết quả xử lý:
                        {statusDraft === 'resolved' && <span className="admin-required-star"> * (Bắt buộc khi đóng sự cố)</span>}
                      </label>
                      <textarea
                        id="issue-resolution-note"
                        className="admin-textarea"
                        value={resolutionNote}
                        onChange={(e) => {
                          setResolutionNote(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="Ghi rõ tiến độ xử lý hoặc phương án thỏa thuận hai bên..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {formError && <p className="admin-form-error">{formError}</p>}
              </div>
            ) : (
              <div className="admin-detail-group">
                <h3 className="admin-detail-group__title">Tình trạng phiếu</h3>
                <p className="admin-closed-issue-note">
                  Phiếu sự cố này đã kết thúc xử lý. Không thể thay đổi quyết định trừ khi tiếp nhận khiếu nại mới.
                </p>
              </div>
            )}
          </div>
        ))}
      </AdminSlideOver>
    </AdminShell>
  );
}
