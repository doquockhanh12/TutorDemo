import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';

const homeLinks = [
  ['Chọn vai trò', '#portal'], ['Năng lực cốt lõi', '#features'], ['Đặc quyền đăng ký', '#benefits'], ['Tư vấn', '#consult'],
];
const learnerLinks = [
  ['Tìm gia sư', '#finder'], ['Nhu cầu học', '#needs'], ['Gia sư nổi bật', '#tutors'], ['Ưu đãi', '#offers'], ['Góc học tập', '#stories'],
];
const tutorLinks = [
  ['Cơ hội dạy', '#opportunities'], ['Thu nhập tháng', '#income'], ['Tạo hồ sơ', '#profile'], ['Xem lớp hiện có', '#opportunities'],
];

export function PublicHeader({ kind = 'home', onInfo, navigation, actions, onRegister, className = '', persistentActions = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    let scrollTimeout = null;
    const syncHeaderState = () => {
      const isPastThreshold = window.scrollY > 10;
      setScrolled(isPastThreshold);

      if (isPastThreshold) {
        setScrolling(true);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setScrolling(false);
        }, 180);
      } else {
        setScrolling(false);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      }
    };

    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
    return () => {
      window.removeEventListener('scroll', syncHeaderState);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);
  const tutor = kind === 'tutor';
  const isLearner = kind === 'learner';
  const landingPath = tutor ? '/tutor' : isLearner ? '/learner' : '/';
  const defaultNav = tutor ? tutorLinks : isLearner ? learnerLinks : homeLinks;

  const defaultMobileActions = tutor ? (
    <>
      <Link to="/tutor/register">Tạo hồ sơ gia sư</Link>
      <Link to="/login">Đăng nhập</Link>
    </>
  ) : isLearner ? (
    <>
      <Link to="/learner/search">Khám phá gia sư</Link>
      <Link to="/login">Đăng nhập</Link>
      <Link to="/register">Đăng ký tài khoản</Link>
    </>
  ) : (
    <>
      <a href="#portal">Chọn vai trò</a>
      <Link to="/login">Đăng nhập</Link>
      {onRegister ? (
        <a href="#register" onClick={(e) => { e.preventDefault(); setOpen(false); onRegister(); }}>Đăng ký tài khoản</a>
      ) : (
        <Link to="/register">Đăng ký tài khoản</Link>
      )}
    </>
  );

  const defaultDesktopActions = tutor ? (
    <>
      <Link className="public-header__plain" to="/login">Đăng nhập</Link>
      <Link className="public-header__blue" to="/tutor/register">Tạo hồ sơ gia sư</Link>
    </>
  ) : isLearner ? (
    <>
      <Link className="public-header__plain" to="/login">Đăng nhập</Link>
      <Link className="public-header__blue" to="/register">Đăng ký</Link>
    </>
  ) : (
    <>
      <Link className="public-header__plain" to="/login">Đăng nhập</Link>
      {onRegister ? (
        <button type="button" className="public-header__blue" onClick={onRegister} style={{ border: 'none', cursor: 'pointer' }}>Đăng ký</button>
      ) : (
        <Link className="public-header__blue" to="/register">Đăng ký</Link>
      )}
    </>
  );

  const headerClass = `public-header ${className}${scrolled ? ' is-scrolled' : ''}${scrolling ? ' is-scrolling' : ''}`;

  return <header className={headerClass} id="top">
    <div className="public-header__inner">
      <Link className="public-brand" to="/" aria-label="TutorNearMe — trang chủ">
        <span className="public-brand__mark">TN</span>
        <span>
          <strong>TutorNearMe</strong>
          <small>{tutor ? 'Không gian gia sư' : isLearner ? 'Gia sư gần bạn' : 'Nền tảng kết nối gia sư'}</small>
        </span>
      </Link>
      <nav className={`public-nav ${open ? 'is-open' : ''}`} aria-label="Điều hướng chính">
        {(navigation || defaultNav).map(([label, href, current]) => navigation ? (
          <Link key={label} to={href} aria-current={current ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>
        ) : (
          <a key={label} href={pathname === landingPath ? href : `${landingPath}${href}`} onClick={() => setOpen(false)}>{label}</a>
        ))}
        {!persistentActions && <div className="public-nav__mobile" onClick={() => setOpen(false)}>
          {actions || defaultMobileActions}
        </div>}
      </nav>
      <div className={`public-header__actions${persistentActions ? ' public-header__actions--persistent' : ''}`}
        onClick={persistentActions ? () => setOpen(false) : undefined}
        onFocus={persistentActions ? () => setOpen(false) : undefined}>
        {actions || defaultDesktopActions}
      </div>
      <button className="public-header__menu" type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>
    </div>
  </header>;
}

export function PublicFooter() {
  return <footer className="public-footer"><div className="public-wrap public-footer__grid"><div><Link className="public-brand" to="/"><span className="public-brand__mark">TN</span><span><strong>TutorNearMe</strong><small>Gia sư gần bạn</small></span></Link><p>Kết nối người học và gia sư theo môn học, khu vực, lịch rảnh và mục tiêu.</p></div><div><strong>Người học</strong><Link to="/learner">Dành cho người học</Link><Link to="/learner/search">Tìm gia sư</Link><Link to="/requests">Yêu cầu học</Link></div><div><strong>Gia sư</strong><Link to="/tutor">Trở thành gia sư</Link><Link to="/tutor/dashboard">Không gian gia sư</Link><Link to="/tutor/requests">Cơ hội dạy</Link></div><div><strong>Khám phá</strong><Link to="/">Trang chủ</Link><Link to="/admin/dashboard">Admin demo</Link></div></div><div className="public-wrap public-footer__bottom">© 2026 TutorNearMe · Giao diện tương tác với dữ liệu minh họa.</div></footer>;
}

export function PublicDialog({ title, text, onClose, children }) {
  const dialogRef = useDialogFocus(onClose);
  return <div className="public-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} tabIndex={-1} className="public-dialog" role="dialog" aria-modal="true" aria-labelledby="public-dialog-title"><button className="public-dialog__close" type="button" onClick={onClose} aria-label="Đóng"><X size={21}/></button><span className="public-kicker">TUTORNEARME · PROTOTYPE</span><h2 id="public-dialog-title">{title}</h2>{text && <p>{text}</p>}{children}<button type="button" className="public-btn public-btn--blue" onClick={onClose}>Đã hiểu <ArrowRight size={17}/></button></section></div>;
}

export function SectionHead({ kicker, title, text, light = false }) {
  return <div className={`public-section-head ${light ? 'public-section-head--light' : ''}`}><span className="public-kicker">{kicker}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
