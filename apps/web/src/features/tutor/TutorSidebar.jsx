import { CalendarDays, ClipboardList, LayoutDashboard, UserRound, Users, Wallet, Star, MessageSquare, Settings, Scale, X } from 'lucide-react';
import SidebarItem from '../../components/SidebarItem.jsx';

const navigation = [
  { label: 'Tổng quan', icon: LayoutDashboard, to: '/tutor/dashboard' },
  { label: 'Yêu cầu học', icon: ClipboardList, to: '/tutor/requests' },
  { label: 'Lịch dạy học', icon: CalendarDays, to: '/tutor/timetable' },
  { label: 'Tìm học viên mới', icon: Users, to: '/tutor/find-students' },
  { label: 'Thu nhập', icon: Wallet, to: '/tutor/income' },
  { label: 'Hồ sơ gia sư', icon: UserRound, to: '/tutor/profile' },
  { label: 'Kháng cáo', icon: Scale, to: '/appeals' },
  { label: 'Đánh giá', icon: Star },
  { label: 'Tin nhắn', icon: MessageSquare },
  { label: 'Đánh giá', icon: Star, to: '/tutor/reviews' },
  { label: 'Tin nhắn', icon: MessageSquare, to: '/tutor/messages' },
  { label: 'Cài đặt', icon: Settings, to: '/tutor/settings' },
];

export default function TutorSidebar({ open, onClose, pendingCount }) {
  return <aside className={`tutor-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng gia sư">
    <div className="tutor-sidebar__brand"><a className="tutor-sidebar__reference-brand" href="/"><strong>TutorNearMe</strong><small>Gia sư gần bạn. Tri thức gần hơn.</small></a><button className="icon-button tutor-sidebar__close" type="button" onClick={onClose} aria-label="Đóng điều hướng"><X size={21}/></button></div>
    <nav className="tutor-sidebar__nav" aria-label="Các mục của gia sư">{navigation.map((item) => <SidebarItem key={item.label} {...item} onClose={onClose} badge={item.label === 'Yêu cầu học' ? pendingCount : item.label === 'Tin nhắn' ? 2 : undefined}/>)}</nav>
  </aside>;
}
