import { useMemo, useState } from 'react';
import { Activity, AlertCircle, BookOpen, Check, ChevronRight, FileWarning, LayoutDashboard, Menu, MessageSquareWarning, Settings2, ShieldCheck, SlidersHorizontal, Users, X } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Brand from '../../components/Brand.jsx';
import Button from '../../components/Button.jsx';
import RoleSwitcher from '../../components/RoleSwitcher.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import SidebarItem from '../../components/SidebarItem.jsx';
import StatItem from '../../components/StatItem.jsx';
import { initialApprovals, initialReviews, issues, liveClasses } from '../../data/adminDashboard.js';

const navigation = [
  { label: 'Tổng quan', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Người dùng', icon: Users },
  { label: 'Gia sư', icon: ShieldCheck },
  { label: 'Lớp đang diễn ra', icon: Activity },
  { label: 'Môn học', icon: BookOpen },
  { label: 'Đánh giá', icon: MessageSquareWarning },
  { label: 'Báo cáo & sự cố', icon: FileWarning },
  { label: 'Cài đặt', icon: Settings2 },
];

const approvalTone = { pending: 'warning', approved: 'success', rejected: 'danger' };
const approvalLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

function AdminSidebar({ open, onClose, pendingCount }) {
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
      <div className="admin-sidebar__brand"><Brand compact /><button className="icon-button admin-sidebar__close" type="button" onClick={onClose} aria-label="Đóng điều hướng"><X size={21} /></button></div>
      <div className="admin-sidebar__label">QUẢN TRỊ HỆ THỐNG</div>
      <nav className="admin-sidebar__nav" aria-label="Các mục quản trị">{navigation.map((item) => <SidebarItem key={item.label} {...item} active={Boolean(item.to)} badge={item.label === 'Gia sư' ? pendingCount : undefined} />)}</nav>
      <div className="admin-sidebar__footer"><span className="admin-sidebar__environment"><span /> Bản demo frontend</span><small>TutorNearMe · Admin workspace</small></div>
    </aside>
  );
}

function ApprovalSection({ approvals, onDecision, filter, onFilter, search }) {
  const visible = approvals.filter((item) => (filter === 'all' || item.status === filter) && `${item.name} ${item.subject} ${item.school}`.toLocaleLowerCase('vi-VN').includes(search.toLocaleLowerCase('vi-VN')));
  return (
    <section className="admin-section admin-approvals" aria-labelledby="approvals-title">
      <div className="admin-section__heading"><div><span className="eyebrow">KIỂM DUYỆT HỒ SƠ</span><h2 id="approvals-title">Gia sư chờ duyệt</h2></div><span className="admin-section__count">{approvals.filter((item) => item.status === 'pending').length} hồ sơ</span></div>
      <div className="admin-section__filter"><SlidersHorizontal size={16} aria-hidden="true" /><label htmlFor="approval-filter">Trạng thái</label><select id="approval-filter" value={filter} onChange={(event) => onFilter(event.target.value)}><option value="pending">Chờ duyệt</option><option value="all">Tất cả</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option></select></div>
      <div className="admin-table-scroll" tabIndex="0" role="region" aria-label="Bảng hồ sơ gia sư chờ duyệt">
        <table className="admin-table admin-table--approvals"><thead><tr><th>Gia sư</th><th>Môn dạy</th><th>Gửi lúc</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
          {visible.map((item) => <tr key={item.id}><td><div className="admin-person"><Avatar initials={item.initials} name={item.name} tone="blue" size="xs" /><div><strong>{item.name}</strong><small>{item.school}</small></div></div></td><td>{item.subject}</td><td>{item.submitted}</td><td><Badge tone={approvalTone[item.status]} dot>{approvalLabel[item.status]}</Badge></td><td>{item.status === 'pending' ? <div className="admin-row-actions"><button type="button" onClick={() => onDecision(item.id, 'approved')} aria-label={`Duyệt hồ sơ ${item.name}`} title="Duyệt"><Check size={17} /></button><button type="button" onClick={() => onDecision(item.id, 'rejected')} aria-label={`Từ chối hồ sơ ${item.name}`} title="Từ chối"><X size={17} /></button></div> : <span className="admin-row-actions__done">Đã xử lý</span>}</td></tr>)}
          {!visible.length && <tr><td colSpan="5" className="admin-table__empty">Không có hồ sơ phù hợp bộ lọc.</td></tr>}
        </tbody></table>
      </div>
      <p className="admin-section__footnote">Các quyết định duyệt chỉ thay đổi trạng thái trên giao diện demo.</p>
    </section>
  );
}

function LiveClassesSection() {
  return (
    <section className="admin-section admin-live" aria-labelledby="live-title">
      <div className="admin-section__heading"><div><span className="eyebrow">GIÁM SÁT HÔM NAY</span><h2 id="live-title">Lớp học đang diễn ra</h2></div><Badge tone="success" dot>{liveClasses.filter((item) => item.status === 'live').length} trực tiếp</Badge></div>
      <div className="admin-live__list">{liveClasses.map((item) => <div className="admin-live__row" key={item.id}><div className="admin-live__time"><strong>{item.time.split(' – ')[0]}</strong><span>{item.format}</span></div><div className="admin-live__body"><strong>{item.subject}</strong><span>{item.tutor} · {item.learner}</span></div><Badge tone={item.status === 'live' ? 'success' : 'info'} dot>{item.status === 'live' ? 'Đang diễn ra' : 'Sắp tới'}</Badge></div>)}</div>
    </section>
  );
}

function ReviewSection({ reviews, onDecision }) {
  return (
    <section className="admin-section admin-reviews" aria-labelledby="reviews-title">
      <div className="admin-section__heading"><div><span className="eyebrow">CHẤT LƯỢNG CỘNG ĐỒNG</span><h2 id="reviews-title">Đánh giá cần xem</h2></div><span className="admin-section__count">{reviews.filter((item) => item.status === 'pending').length} chờ xử lý</span></div>
      <div className="admin-reviews__list">{reviews.map((item) => <article className="admin-review" key={item.id}><div className="admin-review__main"><div><strong>{item.learner}</strong><span> về {item.tutor} · {item.rating}/5 sao</span></div><p>“{item.excerpt}”</p></div>{item.status === 'pending' ? <div className="admin-review__actions"><Button variant="secondary" size="xs" onClick={() => onDecision(item.id, 'approved')}>Duyệt</Button><Button variant="quiet" size="xs" onClick={() => onDecision(item.id, 'hidden')}>Ẩn</Button></div> : <Badge tone={item.status === 'approved' ? 'success' : 'neutral'}>{item.status === 'approved' ? 'Đã duyệt' : 'Đã ẩn'}</Badge>}</article>)}</div>
    </section>
  );
}

function IssueSection() {
  return (
    <section className="admin-section admin-issues" aria-labelledby="issues-title">
      <div className="admin-section__heading"><div><span className="eyebrow">CẦN THEO DÕI</span><h2 id="issues-title">Báo cáo & sự cố</h2></div><span className="admin-section__count">{issues.length} mục</span></div>
      <div className="admin-issues__list">{issues.map((item) => <div className="admin-issue" key={item.id}><span className="admin-issue__id">{item.id}</span><div><strong>{item.label}</strong><span>{item.related} · {item.received}</span></div><Badge tone={item.status === 'reviewing' ? 'info' : 'warning'}>{item.status === 'reviewing' ? 'Đang xem' : 'Chờ xử lý'}</Badge></div>)}</div>
    </section>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('pending');
  const [approvals, setApprovals] = useState(initialApprovals);
  const [reviews, setReviews] = useState(initialReviews);
  const pendingApprovals = useMemo(() => approvals.filter((item) => item.status === 'pending').length, [approvals]);
  const pendingReviews = useMemo(() => reviews.filter((item) => item.status === 'pending').length, [reviews]);
  const decideApproval = (id, status) => setApprovals((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  const decideReview = (id, status) => setReviews((items) => items.map((item) => item.id === id ? { ...item, status } : item));

  return (
    <div className="workspace admin-workspace density-compact">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pendingCount={pendingApprovals} />
      {sidebarOpen && <button className="workspace-scrim" type="button" onClick={() => setSidebarOpen(false)} aria-label="Đóng điều hướng" />}
      <div className="workspace__main">
        <header className="workspace-topbar admin-topbar"><button className="icon-button workspace-topbar__menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Mở điều hướng"><Menu size={22} /></button><span className="workspace-topbar__mobile-brand"><Brand compact /></span><div className="workspace-topbar__location">Quản trị <ChevronRight size={15} /> <strong>Tổng quan</strong></div><label className="sr-only" htmlFor="admin-search">Tìm hồ sơ gia sư</label><SearchInput id="admin-search" className="workspace-topbar__search" value={search} onChange={setSearch} placeholder="Tìm hồ sơ gia sư..." /><RoleSwitcher /><span className="admin-topbar__user"><Avatar initials="AD" name="Quản trị viên" tone="slate" size="sm" /><span>Quản trị viên</span></span></header>
        <main className="admin-main">
          <div className="admin-page-head"><div><span className="eyebrow">VẬN HÀNH TUTORNEARME</span><h1>Tổng quan hệ thống</h1><p>Theo dõi hoạt động và xử lý những mục đang cần chú ý.</p></div><span className="admin-page-head__date">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div>
          <div className="admin-summary" aria-label="Chỉ số hệ thống"><StatItem label="Hồ sơ chờ duyệt" value={String(pendingApprovals).padStart(2, '0')} note="Cần quyết định" icon={ShieldCheck} /><StatItem label="Lớp đang diễn ra" value={String(liveClasses.filter((item) => item.status === 'live').length).padStart(2, '0')} note="Theo dõi hôm nay" icon={Activity} /><StatItem label="Đánh giá cần xem" value={String(pendingReviews).padStart(2, '0')} note="Chờ kiểm duyệt" icon={MessageSquareWarning} /><StatItem label="Báo cáo & sự cố" value={String(issues.length).padStart(2, '0')} note="Trong hàng xử lý" icon={AlertCircle} /></div>
          <div className="admin-grid"><ApprovalSection approvals={approvals} onDecision={decideApproval} filter={approvalFilter} onFilter={setApprovalFilter} search={search} /><LiveClassesSection /><ReviewSection reviews={reviews} onDecision={decideReview} /><IssueSection /></div>
        </main>
      </div>
    </div>
  );
}
