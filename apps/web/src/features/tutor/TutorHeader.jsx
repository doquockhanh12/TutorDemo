import { NavLink, Link, useNavigate } from 'react-router-dom';
import { MapPin, LayoutDashboard, Menu, LogOut } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';

export default function TutorHeader({ onOpen }) {
  const { user, logout } = useDemoAuth();
  const navigate = useNavigate();
  const name = user?.fullName || 'Gia sư';
  const initials = name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('');
  return <header className="workspace-topbar tutor-topbar">
    <button className="icon-button workspace-topbar__menu" type="button" onClick={onOpen} aria-label="Mở điều hướng"><Menu size={22}/></button>
    <nav className="tutor-header__nav" aria-label="Điều hướng nhanh"><NavLink to="/tutor/map"><MapPin size={18}/>Tìm lớp gần tôi</NavLink><NavLink to="/tutor/dashboard"><LayoutDashboard size={18}/>Tổng Quan</NavLink></nav>
    <div className="tutor-header__user">
      <Link className="tutor-header__account" to="/tutor/profile"><Avatar initials={initials} name={name} tone="blue" size="sm"/><span>{user?.username || name}</span></Link>
      <button className="icon-button tutor-header__logout" type="button" aria-label="Đăng xuất" title="Đăng xuất" onClick={() => { logout(); navigate('/login', { replace: true }); }}><LogOut size={20}/></button>
    </div>
  </header>;
}
