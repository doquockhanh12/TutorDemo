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
  ['Tìm lớp', '#opportunities'],
  ['Bảng giá', '#income'],
  ['Quy trình', '#profile'],
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
      <Link to="/login">Đăng nhập</Link>
      <Link to="/tutor/register" className="public-btn public-btn--yellow">Đăng ký làm Gia sư</Link>
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
      <Link className="public-header__blue" to="/tutor/register">Đăng ký làm Gia sư</Link>
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
  return (
    <footer className="public-footer">
      <div className="public-wrap public-footer__grid">
        <div className="public-footer__company">
          <Link className="public-brand" to="/" aria-label="TutorNearMe">
            <span className="public-brand__mark">TN</span>
            <span>
              <strong>TutorNearMe</strong>
              <small>Nền tảng kết nối gia sư uy tín</small>
            </span>
          </Link>
          <p>
            Cầu nối tin cậy giữa gia sư giỏi và học viên. Chủ động kết nối theo môn học, khu vực địa lý, thời gian và mức học phí minh bạch.
          </p>
          <div className="public-footer__contact-info">
            <p><strong>Trụ sở:</strong> Tòa nhà Innovation, Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
            <p><strong>Hotline:</strong> <a href="tel:19006868">1900 6868</a> (08:00 – 21:30 hàng ngày)</p>
            <p><strong>Email hỗ trợ:</strong> <a href="mailto:support@tutornearme.vn">support@tutornearme.vn</a></p>
          </div>
        </div>

        <div>
          <strong>Dành cho Gia sư</strong>
          <a href="#opportunities">Tìm lớp gần nhà</a>
          <a href="#income">Công cụ tính thu nhập</a>
          <a href="#profile">Quy trình tạo hồ sơ</a>
          <Link to="/tutor/register">Đăng ký làm Gia sư</Link>
          <Link to="/tutor/dashboard">Khu vực làm việc Gia sư</Link>
        </div>

        <div>
          <strong>Chính sách & Hỗ trợ</strong>
          <Link to="/appeals">Quy chế hoạt động nền tảng</Link>
          <Link to="/appeals">Chính sách bảo mật thông tin</Link>
          <Link to="/appeals">Tiêu chuẩn an toàn giảng dạy</Link>
          <Link to="/appeals">Trung tâm khiếu nại & Hỗ trợ</Link>
          <div className="public-footer__socials">
            <span>Theo dõi chúng tôi:</span>
            <div className="public-footer__social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.8-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.89a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.86H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.98 0 3.58 1.96 3.58 4.5v5.27Z"/></svg></a>
            </div>
          </div>
        </div>
      </div>

      <div className="public-wrap public-footer__bottom">
        <span>© 2026 TutorNearMe. Toàn bộ bản quyền được bảo lưu.</span>
        <span>Giải pháp kết nối giáo dục công nghệ cao hàng đầu tại Việt Nam.</span>
      </div>
    </footer>
  );
}

export function PublicDialog({ title, text, onClose, children }) {
  const dialogRef = useDialogFocus(onClose);
  return <div className="public-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} tabIndex={-1} className="public-dialog" role="dialog" aria-modal="true" aria-labelledby="public-dialog-title"><button className="public-dialog__close" type="button" onClick={onClose} aria-label="Đóng"><X size={21}/></button><span className="public-kicker">TUTORNEARME · PROTOTYPE</span><h2 id="public-dialog-title">{title}</h2>{text && <p>{text}</p>}{children}<button type="button" className="public-btn public-btn--blue" onClick={onClose}>Đã hiểu <ArrowRight size={17}/></button></section></div>;
}

export function SectionHead({ kicker, title, text, light = false }) {
  return <div className={`public-section-head ${light ? 'public-section-head--light' : ''}`}><span className="public-kicker">{kicker}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}
