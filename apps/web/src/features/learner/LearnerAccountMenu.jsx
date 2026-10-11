import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, ChevronDown, ClipboardList, LogOut, UserRound } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import './account-menu.css';

const accountLinks = [
  { label: 'Tài khoản của tôi', to: '/learner/dashboard', icon: UserRound },
  { label: 'Yêu cầu học', to: '/requests', icon: ClipboardList },
  { label: 'Gia sư đã lưu', to: '/learner/dashboard#saved-tutors', icon: Bookmark },
];

export default function LearnerAccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const initialFocus = useRef(0);
  const menuId = useId();
  const { key: locationKey } = useLocation();
  const displayName = user.fullName || user.username;
  const initials = displayName.trim().split(/\s+/).slice(-2).map((word) => word[0]).join('');
  const accountLabel = user.accountType === 'parent' ? 'Tài khoản Phụ huynh' : 'Tài khoản Người học';

  useEffect(() => { setOpen(false); }, [locationKey]);

  useEffect(() => {
    if (!open) return;
    const items = menuRef.current.querySelectorAll('[role="menuitem"]');
    items[initialFocus.current === -1 ? items.length - 1 : 0]?.focus();
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocusTrigger();
    } else if (event.key === 'Tab') {
      // Leave the non-modal menu in the header's natural tab order.
      closeAndFocusTrigger();
      if (event.shiftKey) event.preventDefault();
    } else if (event.key === ' ' && event.target.matches('a[role="menuitem"]')) {
      event.preventDefault();
      event.target.click();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const items = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));
      const current = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
  };

  return <div className="learner-account-menu" ref={rootRef} onKeyDown={handleKeyDown}>
    <button ref={triggerRef} className="learner-account-menu__trigger" type="button"
      aria-label={`Menu tài khoản của ${user.username}`} aria-haspopup="menu" aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={() => { initialFocus.current = 0; setOpen((value) => !value); }}
      onKeyDown={(event) => {
        if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
          event.preventDefault();
          initialFocus.current = event.key === 'ArrowUp' ? -1 : 0;
          setOpen(true);
        }
      }}>
      <Avatar initials={initials} name={displayName} size="sm" />
      <span className="learner-account-menu__username">{user.username}</span>
      <ChevronDown className="learner-account-menu__chevron" size={16} aria-hidden="true" />
    </button>
    {open && <div className="learner-account-menu__panel">
      <div className="learner-account-menu__identity">
        <Avatar initials={initials} name={displayName} />
        <div><strong>{user.username}</strong><span>{accountLabel}</span></div>
      </div>
      <div ref={menuRef} id={menuId} role="menu" aria-label="Chức năng tài khoản">
        {accountLinks.map(({ label, to, icon: Icon }) => <Link key={to} to={to} role="menuitem" tabIndex={-1}
          className="learner-account-menu__item" onClick={() => setOpen(false)}>
          <Icon size={19} aria-hidden="true" /><span>{label}</span>
        </Link>)}
        <div className="learner-account-menu__separator" role="separator" />
        <button type="button" role="menuitem" tabIndex={-1}
          className="learner-account-menu__item learner-account-menu__item--logout"
          onClick={() => { setOpen(false); onLogout(); }}>
          <LogOut size={19} aria-hidden="true" /><span>Đăng xuất</span>
        </button>
      </div>
    </div>}
  </div>;
}
