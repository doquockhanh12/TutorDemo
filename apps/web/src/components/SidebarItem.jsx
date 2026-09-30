import { NavLink } from 'react-router-dom';

export default function SidebarItem({ icon: Icon, label, to, active = false, badge }) {
  const content = <><Icon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>{badge && <span className="sidebar-item__count">{badge}</span>}</>;

  if (!to) return <span className="sidebar-item sidebar-item--unavailable" aria-disabled="true" title="Màn này thuộc batch tiếp theo">{content}</span>;

  return <NavLink to={to} className={`sidebar-item ${active ? 'is-active' : ''}`}>{content}</NavLink>;
}
