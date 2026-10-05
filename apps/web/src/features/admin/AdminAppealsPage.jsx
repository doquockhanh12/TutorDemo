import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import useDemoDomain from '../domain/DemoDomainContext.jsx';
import { appealLabels, appealTones, appealReasons, selectAppeals } from '../domain/appeals.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import AdminShell from './AdminShell.jsx';
import AdminSlideOver from './AdminSlideOver.jsx';
import AppealEvidence from '../appeals/AppealEvidence.jsx';
import '../appeals/appeals.css';

export default function AdminAppealsPage() {
  const { user } = useDemoAuth(); const domain = useDemoDomain();
  const [filter, setFilter] = useState('all'); const [search, setSearch] = useState(''); const [selectedId, setSelectedId] = useState(null);
  const [decision, setDecision] = useState('in_review'); const [note, setNote] = useState(''); const [error, setError] = useState(''); const [feedback, setFeedback] = useState('');
  const appeals = selectAppeals(domain, user);
  const visible = appeals.filter(a => (filter === 'all' || a.status === filter) && `${a.id} ${a.issueId} ${a.accountName} ${a.content}`.toLocaleLowerCase('vi-VN').includes(search.toLocaleLowerCase('vi-VN')));
  const selected = appeals.find(a => a.id === selectedId);
  const open = a => { setSelectedId(a.id); setDecision('in_review'); setNote(''); setError(''); };
  const save = () => { const result = domain.decideAppeal(selected.id, decision, note); if (result.error) setError(result.error); else { setSelectedId(null); setFeedback('Đã lưu kết quả xem xét kháng cáo.'); } };
  return <AdminShell title="Kháng cáo">
    <div className="admin-page-head"><div><span className="eyebrow">XEM XÉT LẠI BÁO CÁO</span><h1>Kháng cáo</h1><p>Đối chiếu giải trình và bằng chứng của bên bị báo cáo trước khi đưa ra kết quả.</p></div><Link className="admin-link-more" to="/admin/issues">Báo cáo & sự cố</Link></div>
    <div className="admin-filter-bar"><label>Trạng thái kháng cáo<select className="admin-select" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả</option>{Object.entries(appealLabels).map(([code, label]) => <option value={code} key={code}>{label}</option>)}</select></label><label className="admin-filter-bar__search"><span className="sr-only">Tìm kháng cáo</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Mã hồ sơ, tài khoản, nội dung..." /></label></div>
    {feedback && <p className="admin-feedback-banner admin-feedback-banner--info" role="status">{feedback}</p>}
    <p className="admin-record-counter">Hiển thị {visible.length} / {appeals.length} hồ sơ</p>
    <section className="admin-section admin-table-section"><div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Bảng kháng cáo"><table className="admin-table admin-table--appeals"><thead><tr><th>Hồ sơ / sự cố</th><th>Tài khoản</th><th>Lý do</th><th>Ngày gửi</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      {visible.map(a => <tr key={a.id}><td><strong>{a.id}</strong><br />{a.issueId}</td><td><span className="admin-cell-truncate" title={a.accountName}>{a.accountName}</span></td><td><span className="admin-cell-truncate" title={appealReasons[a.reason]}>{appealReasons[a.reason]}</span></td><td>{new Date(a.createdAt).toLocaleDateString('vi-VN')}</td><td><Badge tone={appealTones[a.status]}>{appealLabels[a.status]}</Badge></td><td><div className="admin-row-actions"><button aria-label={`Xem kháng cáo ${a.id}`} type="button" onClick={() => open(a)}><Eye size={17} /></button></div></td></tr>)}
      {!visible.length && <tr><td colSpan={6} className="admin-table__empty">{appeals.length ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Chưa có kháng cáo. Hồ sơ người dùng gửi sẽ xuất hiện tại đây.'}</td></tr>}
    </tbody></table></div></section>
    <AdminSlideOver open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected ? `Kháng cáo ${selected.id}` : 'Kháng cáo'} badge={selected && <Badge tone={appealTones[selected.status]}>{appealLabels[selected.status]}</Badge>} footer={selected && ['pending', 'in_review'].includes(selected.status) && <Button size="sm" onClick={save}>Lưu kết quả</Button>}>
      {selected && <div className="admin-drawer-detail"><section className="admin-detail-group"><h3>{selected.accountName}</h3><p><strong>{selected.issueId}</strong> · {selected.issueTitle}</p><p>{appealReasons[selected.reason]}</p><p className="appeal-prose">{selected.content}</p><small>Người gửi đã cam kết nội dung và bằng chứng trung thực. Admin cần đối chiếu độc lập.</small></section>
        <section className="admin-detail-group"><h3>Bằng chứng kèm theo</h3><AppealEvidence evidence={selected.evidence} /></section>
        {['pending', 'in_review'].includes(selected.status) ? <section className="admin-detail-group"><h3>Xem xét kháng cáo</h3><label className="admin-form-field">Kết quả xem xét<select className="admin-select" value={decision} onChange={e => setDecision(e.target.value)}><option value="in_review">Đang xem xét</option><option value="accepted">Chấp nhận</option><option value="rejected">Không chấp nhận</option></select></label><label className="admin-form-field">Căn cứ / phản hồi<textarea className="admin-textarea" rows={4} required value={note} onChange={e => setNote(e.target.value)} /></label><p className="admin-detail-sub">Kết quả kháng cáo không tự xóa cảnh cáo hoặc mở khóa tài khoản. Các quyết định tài khoản vẫn được quản lý riêng.</p>{error && <p role="alert" className="admin-form-error">{error}</p>}</section> : <section className="admin-detail-group"><h3>Kết quả đã lưu</h3><p>{selected.reviewNote}</p></section>}
      </div>}
    </AdminSlideOver>
  </AdminShell>;
}
