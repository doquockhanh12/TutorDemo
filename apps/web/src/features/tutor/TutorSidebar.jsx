import { CalendarDays, ClipboardList, LayoutDashboard, UserRound, Users, Wallet, Star, MessageSquare, Settings, Scale, X, BookOpen } from 'lucide-react';
import SidebarItem from '../../components/SidebarItem.jsx';
import useTutorMessagesState from './TutorMessagesState.jsx';
import { BRAND_SLOGAN } from '../../data/brand.js';
import { tutorNavigation } from './tutorNavigation.js';

const icons = [LayoutDashboard, ClipboardList, CalendarDays, BookOpen, Users, Wallet, Wallet, UserRound, Scale, Star, MessageSquare, Settings];
const navigation = tutorNavigation.map(([label, to], index) => ({ label, to, icon: icons[index] }));

export default function TutorSidebar({ open, onClose, pendingCount }) {
  const { unreadMessages } = useTutorMessagesState();
  return <aside className={`tutor-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng gia sư">
    <div className="tutor-sidebar__brand"><a className="tutor-sidebar__reference-brand" href="/"><strong>TutorNearMe</strong><small>{BRAND_SLOGAN}</small></a><button className="icon-button tutor-sidebar__close" type="button" onClick={onClose} aria-label="Đóng điều hướng"><X size={21}/></button></div>
    <nav className="tutor-sidebar__nav" aria-label="Các mục của gia sư">{navigation.map((item) => <SidebarItem key={item.label} {...item} onClose={onClose} badge={item.label === 'Yêu cầu học' ? pendingCount : item.label === 'Tin nhắn' ? unreadMessages : undefined}/>)}</nav>
  </aside>;
}
