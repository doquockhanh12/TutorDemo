import { useState, useMemo } from 'react';
import {
  Eye,
  Lock,
  Search,
  Unlock,
  UserCheck,
  UserX,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import AdminShell from './AdminShell.jsx';
import AdminSlideOver from './AdminSlideOver.jsx';
import { formatRecordCount, formatAdminDate } from './AdminTutorsPage.jsx';
import {
  useAdminUsers,
  userRoleLabels,
  userStatusLabels,
  userStatusTones,
} from '../domain/useAdminDomain.js';

const USER_TABS = ['Tất cả', 'Học viên/Phụ huynh', 'Gia sư', 'Đang hoạt động', 'Đang bị khóa'];

export default function AdminUsersPage() {
  const { users, toggleSuspendUser, setUserSuspension } = useAdminUsers();

  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [feedback, setFeedback] = useState(null);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === 'Học viên/Phụ huynh' && u.role !== 'learner' && u.role !== 'parent') return false;
      if (activeTab === 'Gia sư' && u.role !== 'tutor') return false;
      if (activeTab === 'Đang hoạt động' && (u.status || 'active') !== 'active') return false;
      if (activeTab === 'Đang bị khóa' && u.status !== 'suspended') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLocaleLowerCase('vi-VN');
      const nameMatch = u.fullName?.toLocaleLowerCase('vi-VN').includes(q);
      const userMatch = u.username?.toLocaleLowerCase('vi-VN').includes(q);
      const emailMatch = u.email?.toLocaleLowerCase('vi-VN').includes(q);
      const phoneMatch = u.phone?.includes(q);
      return nameMatch || userMatch || emailMatch || phoneMatch;
    });
  }, [users, activeTab, searchQuery]);

  const handleOpenDrawer = (userId) => {
    setSelectedUserId(userId);
  };

  const handleCloseDrawer = () => {
    setSelectedUserId(null);
  };

  const handleToggleSuspend = (userId, currentStatus) => {
    const isSuspended = currentStatus === 'suspended';
    setUserSuspension(userId, !isSuspended);
    const target = users.find((u) => u.id === userId);
    const username = target?.username || '';
    setFeedback({
      type: isSuspended ? 'info' : 'danger',
      message: isSuspended
        ? `Đã mở khóa tài khoản @${username} thành công.`
        : `Đã tạm khóa tài khoản @${username}.`,
    });
  };

  return (
    <AdminShell title="Quản lý người dùng">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">TÀI KHOẢN & PHÂN QUYỀN</span>
          <h1>Quản lý Người dùng</h1>
          <p>Danh sách học viên, phụ huynh và gia sư trên hệ sinh thái TutorNearMe.</p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-tabs" role="tablist" aria-label="Lọc theo vai trò và trạng thái">
          {USER_TABS.map((tab) => (
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
            placeholder="Tìm theo tên, username, email, SĐT..."
            aria-label="Tìm kiếm người dùng"
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
        <span>{formatRecordCount(filteredUsers.length, users.length)}</span>
      </div>

      <div className="admin-section admin-table-section">
        <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="Bảng người dùng">
          <table className="admin-table admin-table--users">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSuspended = user.status === 'suspended';
                const roleLabel = userRoleLabels[user.role] || user.role;
                const statusTone = isSuspended ? 'danger' : 'success';
                const statusLabel = isSuspended ? 'Đang bị khóa' : 'Đang hoạt động';

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-person">
                        <Avatar
                          initials={user.initials || user.fullName?.slice(0, 2) || user.username?.slice(0, 2)}
                          name={user.fullName || user.username}
                          tone={user.role === 'tutor' ? 'blue' : 'slate'}
                          size="xs"
                        />
                        <div>
                          <strong title={user.fullName || user.username}>{user.fullName || user.username}</strong>
                          <small title={`@${user.username}`}>@{user.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={user.email || 'Chưa cập nhật'}>
                        {user.email || 'Chưa cập nhật'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-cell-truncate" title={user.phone || 'Chưa cập nhật'}>
                        {user.phone || 'Chưa cập nhật'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-role-badge">{roleLabel}</span>
                    </td>
                    <td>
                      <span
                        className="admin-cell-truncate"
                        title={formatAdminDate(user.createdAt || user.joinedDate, 'Tháng 10/2026')}
                      >
                        {formatAdminDate(user.createdAt || user.joinedDate, 'Tháng 10/2026')}
                      </span>
                    </td>
                    <td>
                      <Badge tone={statusTone} dot>{statusLabel}</Badge>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(user.id)}
                          aria-label={`Xem chi tiết người dùng ${user.fullName || user.username}`}
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(user.id, user.status)}
                          aria-label={isSuspended ? `Mở khóa tài khoản ${user.username}` : `Khóa tài khoản ${user.username}`}
                          title={isSuspended ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {isSuspended ? <Unlock size={17} /> : <Lock size={17} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-table__empty">
                    Không tìm thấy người dùng phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for User details */}
      <AdminSlideOver
        open={Boolean(selectedUser)}
        onClose={handleCloseDrawer}
        title={selectedUser?.fullName || selectedUser?.username || 'Chi tiết người dùng'}
        subtitle={`@${selectedUser?.username} · ${userRoleLabels[selectedUser?.role] || selectedUser?.role}`}
        badge={
          selectedUser && (
            <Badge tone={selectedUser.status === 'suspended' ? 'danger' : 'success'} dot>
              {selectedUser.status === 'suspended' ? 'Đang bị khóa' : 'Đang hoạt động'}
            </Badge>
          )
        }
        footer={
          selectedUser && (
            <div className="admin-drawer-actions">
              {selectedUser.status === 'suspended' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleToggleSuspend(selectedUser.id, selectedUser.status)}
                >
                  <Unlock size={16} /> Mở khóa tài khoản
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleSuspend(selectedUser.id, selectedUser.status)}
                >
                  <Lock size={16} /> Khóa tài khoản
                </Button>
              )}
            </div>
          )
        }
      >
        {selectedUser && (
          <div className="admin-drawer-detail">
            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Thông tin tài khoản</h3>
              <dl className="admin-detail-grid">
                <div>
                  <dt>Họ và tên</dt>
                  <dd>{selectedUser.fullName || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Tên đăng nhập</dt>
                  <dd>@{selectedUser.username}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedUser.email || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{selectedUser.phone || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Vai trò hệ thống</dt>
                  <dd>{userRoleLabels[selectedUser.role] || selectedUser.role}</dd>
                </div>
                <div>
                  <dt>Trạng thái xác thực</dt>
                  <dd>{selectedUser.verified?.email ? 'Email đã xác thực' : 'Chưa xác thực qua email'}</dd>
                </div>
              </dl>
            </div>

            <div className="admin-detail-group">
              <h3 className="admin-detail-group__title">Hoạt động trên hệ thống</h3>
              <dl className="admin-detail-grid">
                <div>
                  <dt>Số yêu cầu học đã tạo</dt>
                  <dd><strong>{selectedUser.requestsCount ?? selectedUser.createdRequests ?? 0}</strong> yêu cầu</dd>
                </div>
                <div>
                  <dt>Số lớp học liên quan</dt>
                  <dd><strong>{selectedUser.lessonsCount ?? selectedUser.activeClasses ?? 0}</strong> lớp</dd>
                </div>
                <div>
                  <dt>Ngày đăng ký</dt>
                  <dd>{formatAdminDate(selectedUser.createdAt || selectedUser.joinedDate, 'Tháng 10/2026')}</dd>
                </div>
                <div>
                  <dt>Đăng nhập lần cuối</dt>
                  <dd>{selectedUser.lastLogin || 'Gần đây'}</dd>
                </div>
              </dl>
            </div>

            {selectedUser.status === 'suspended' && (
              <div className="admin-detail-group admin-detail-group--danger">
                <h3 className="admin-detail-group__title">Lưu ý quản trị</h3>
                <p className="admin-rejection-note">
                  Tài khoản này hiện đang bị tạm khóa. Khi đăng nhập vào hệ thống, người dùng sẽ nhận được thông báo:
                  <em>"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."</em>
                </p>
              </div>
            )}
          </div>
        )}
      </AdminSlideOver>
    </AdminShell>
  );
}
