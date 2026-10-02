import { NavLink } from 'react-router-dom';

const roles = [
  { to: '/learner/search', label: 'Người học' },
  { to: '/tutor/dashboard', label: 'Gia sư' },
  { to: '/admin/dashboard', label: 'Admin' },
];

export default function RoleSwitcher() {
  return (
    <nav className="role-switcher" aria-label="Chuyển giao diện demo">
      <span className="role-switcher__label">Xem giao diện</span>
      {roles.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `role-switcher__link ${isActive ? 'is-active' : ''}`}>{label}</NavLink>)}
    </nav>
  );
}
