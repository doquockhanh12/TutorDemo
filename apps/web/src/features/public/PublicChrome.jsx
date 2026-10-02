import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';

const learnerLinks = [
  ['Tìm gia sư', '#finder'], ['Nhu cầu học', '#needs'], ['Gia sư nổi bật', '#tutors'], ['Ưu đãi', '#offers'], ['Góc học tập', '#stories'],
];
const tutorLinks = [
  ['Cơ hội dạy', '#opportunities'], ['Thu nhập tháng', '#income'], ['Tạo hồ sơ', '#profile'], ['Xem lớp hiện có', '#opportunities'],
];

export function PublicHeader({ kind = 'home', onInfo }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const syncHeaderState = () => setScrolled(window.scrollY > 18);
    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
    return () => window.removeEventListener('scroll', syncHeaderState);
  }, []);
  const tutor = kind === 'tutor';
  const landingPath = tutor ? '/tutor' : kind === 'learner' ? '/learner' : '/';
  return <header className={`public-header${scrolled ? ' is-scrolled' : ''}`} id="top">
    <div className="public-header__inner">
      <Link className="public-brand" to="/" aria-label="TutorNearMe — trang chủ"><span className="public-brand__mark">TN</span><span><strong>TutorNearMe</strong><small>{tutor ? 'Không gian gia sư' : 'Gia sư gần bạn'}</small></span></Link>
      <nav className={`public-nav ${open ? 'is-open' : ''}`} aria-label="Điều hướng chính">
        {(tutor ? tutorLinks : learnerLinks).map(([label, href]) => <a key={label} href={pathname === landingPath ? href : `${landingPath}${href}`} onClick={() => setOpen(false)}>{label}</a>)}
        <div className="public-nav__mobile"><Link to={tutor ? '/learner' : '/tutor'}>{tutor ? 'Dành cho người học' : 'Trở thành gia sư'}</Link><Link to={tutor ? '/tutor/register' : '/learner/search'}>{tutor ? 'Tạo hồ sơ gia sư' : 'Khám phá gia sư'}</Link><Link to="/login" onClick={() => setOpen(false)}>Đăng nhập</Link><Link to="/register" onClick={() => setOpen(false)}>Đăng ký</Link></div>
      </nav>
      <div className="public-header__actions"><Link className="public-header__yellow" to={tutor ? '/learner' : '/tutor/register'}>{tutor ? 'Dành cho người học' : 'Trở thành gia sư'}</Link><Link className="public-header__plain" to="/login">Đăng nhập</Link><Link className="public-header__blue" to={tutor ? '/tutor/register' : '/register'}>{tutor ? 'Tạo hồ sơ' : 'Đăng ký'}</Link></div>
      <button className="public-header__menu" type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
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
