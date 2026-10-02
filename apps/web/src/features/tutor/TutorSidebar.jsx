import { BookOpen, CalendarDays, Clock3, ClipboardList, LayoutDashboard, UserRound, Users, Wallet, X } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Brand from '../../components/Brand.jsx';
import SidebarItem from '../../components/SidebarItem.jsx';

const navigation = [
  { label: 'Tổng quan', icon: LayoutDashboard, to: '/tutor/dashboard' },
  { label: 'Yêu cầu học', icon: ClipboardList, to: '/tutor/requests' },
  { label: 'Lịch dạy', icon: CalendarDays, to: '/tutor/lessons' },
  { label: 'Lịch rảnh', icon: Clock3, to: '/tutor/availability' },
  { label: 'Hồ sơ gia sư', icon: UserRound, to: '/tutor/profile' },
];

export default function TutorSidebar({ open, onClose, pendingCount }) {
  return <aside className={`tutor-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng gia sư">
    <div className="tutor-sidebar__brand"><Brand compact/><button className="icon-button tutor-sidebar__close" type="button" onClick={onClose} aria-label="Đóng điều hướng"><X size={21}/></button></div>
    <div className="tutor-sidebar__workspace"><span className="eyebrow">KHÔNG GIAN GIA SƯ</span><strong>Mai Anh Nguyễn</strong><span>Hồ sơ đang hoạt động</span></div>
    <nav className="tutor-sidebar__nav" aria-label="Các mục của gia sư"><span className="sidebar-section-label">CÔNG VIỆC</span>{navigation.map((item) => <SidebarItem key={item.label} {...item} onClose={onClose} badge={item.label === 'Yêu cầu học' ? pendingCount : undefined}/>)}</nav>
    <div className="tutor-sidebar__footer"><Avatar initials="MA" name="Mai Anh Nguyễn" tone="blue" size="sm"/><div><strong>Mai Anh Nguyễn</strong><span>Gia sư</span></div></div>
  </aside>;
}
