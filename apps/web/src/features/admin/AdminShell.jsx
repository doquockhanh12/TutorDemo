import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  FileWarning,
  Scale,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Brand from '../../components/Brand.jsx';
import SidebarItem from '../../components/SidebarItem.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { useAdminOverview } from '../domain/useAdminDomain.js';

export function AdminHeader({ onOpenSidebar, title = 'Tổng quan' }) {
  const { logout } = useDemoAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="workspace-topbar admin-topbar">
      <button
        className="icon-button workspace-topbar__menu"
        type="button"
        onClick={onOpenSidebar}
        aria-label="Mở điều hướng"
      >
        <Menu size={22} />
      </button>

      <span className="workspace-topbar__mobile-brand">
        <Brand compact />
      </span>

      <div className="workspace-topbar__location">
        Quản trị <ChevronRight size={15} /> <strong>{title}</strong>
      </div>

      <div className="admin-topbar__actions">
        <span className="admin-topbar__user">
          <Avatar initials="AD" name="Quản trị viên" tone="slate" size="sm" />
          <span>Quản trị viên</span>
        </span>
        <button
          className="icon-button admin-header__logout"
          type="button"
          aria-label="Đăng xuất"
          title="Đăng xuất"
          onClick={handleLogout}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const overview = useAdminOverview();

  const navigation = [
    { label: 'Tổng quan', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Gia sư', icon: ShieldCheck, to: '/admin/tutors', badge: overview?.pendingTutorsCount || undefined },
    { label: 'Người dùng', icon: Users, to: '/admin/users' },
    { label: 'Đánh giá', icon: MessageSquareWarning, to: '/admin/reviews', badge: overview?.pendingReviewsCount || undefined },
    { label: 'Báo cáo & sự cố', icon: FileWarning, to: '/admin/issues', badge: overview?.openIssuesCount || undefined },
    { label: 'Kháng cáo', icon: Scale, to: '/admin/appeals' },
  ];

  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
      <div className="admin-sidebar__brand">
        <Brand compact />
        <button
          className="icon-button admin-sidebar__close"
          type="button"
          onClick={onClose}
          aria-label="Đóng điều hướng"
        >
          <X size={21} />
        </button>
      </div>
      <div className="admin-sidebar__label">QUẢN TRỊ HỆ THỐNG</div>
      <nav className="admin-sidebar__nav" aria-label="Các mục quản trị">
        {navigation.map((item) => (
          <SidebarItem
            key={item.label}
            {...item}
            active={location.pathname === item.to}
            onClose={onClose}
          />
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <span className="admin-sidebar__environment">
          <span /> Bản demo frontend
        </span>
        <small>TutorNearMe · Admin workspace</small>
      </div>
    </aside>
  );
}

export default function AdminShell({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="workspace admin-workspace density-compact">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          className="workspace-scrim"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Đóng điều hướng"
        />
      )}
      <div className="workspace__main">
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} title={title} />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
