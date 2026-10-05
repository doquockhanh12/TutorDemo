import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import useDemoDomain from '../domain/DemoDomainContext.jsx';
import { appealLabels, appealTones, appealReasons, issueTargetId, selectAppeals } from '../domain/appeals.js';
import { defaultDestination } from '../auth/authUtils.js';
import LearnerHeader from '../learner/LearnerHeader.jsx';
import { TutorShell } from '../tutor/TutorPages.jsx';
import { PublicHeader } from '../public/PublicChrome.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import AppealForm from './AppealForm.jsx';
import AppealEvidence from './AppealEvidence.jsx';
import './appeals.css';

function AppealAccess() {
  const { loginForAppeal } = useDemoAuth();
  const [identity, setIdentity] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  return <form className="appeal-form" onSubmit={e => { e.preventDefault(); setError(loginForAppeal(identity, password).error || ''); }}>
    <h2>Xác thực tài khoản</h2><p>Tài khoản bị tạm khóa vẫn có thể xác thực tại đây để gửi kháng cáo. Phiên này không mở quyền sử dụng các khu vực khác.</p>
    <label>Tài khoản<input autoComplete="username" value={identity} onChange={e => setIdentity(e.target.value)} required /></label>
    <label>Mật khẩu<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    {error && <p className="appeal-error" role="alert">{error}</p>}
    <Button type="submit">Xác thực để kháng cáo</Button><Link to="/login?redirect=%2Fappeals">Đăng nhập thông thường</Link>
  </form>;
}
export default function UserAppealsPage() {
  const { user, logout } = useDemoAuth(); const domain = useDemoDomain(); const [feedback, setFeedback] = useState('');
  const issues = domain.issues.filter(i => issueTargetId(domain, i) === user?.id);
  const appeals = selectAppeals(domain, user);
  const actions = user && <><span>@{user.username}</span>{!user.appealOnly && <Link to={defaultDestination(user.role)}>Về khu vực của tôi</Link>}<button className="learner-logout" onClick={logout} type="button"><LogOut size={17} /> Đăng xuất</button></>;
  const content = <>
      {user?.appealOnly && <p className="appeal-notice">Phiên này chỉ cho phép gửi và theo dõi kháng cáo.</p>}
      {!user ? <AppealAccess /> : user.role === 'admin' ? <Link to="/admin/appeals">Mở trang xét duyệt kháng cáo</Link> : <div className="appeal-page-grid">
        <AppealForm issues={issues} onSubmit={values => { const result = domain.createAppeal(values); if (result.id) setFeedback(`Đã gửi kháng cáo ${result.id}.`); return result; }} />
        <section className="appeal-history"><h2>Kháng cáo của tôi</h2>{feedback && <p role="status">{feedback}</p>}{!appeals.length && <p>Bạn chưa gửi kháng cáo.</p>}
          {appeals.map(a => <article key={a.id} className="appeal-record"><header><strong>{a.issueId} · {a.id}</strong><Badge tone={appealTones[a.status]}>{appealLabels[a.status]}</Badge></header><p>{appealReasons[a.reason]}</p><p>{a.content}</p><small>{new Date(a.createdAt).toLocaleString('vi-VN')}</small><details><summary>Xem bằng chứng đã gửi</summary><AppealEvidence evidence={a.evidence} /></details>{a.reviewNote && <p><strong>Phản hồi Admin:</strong> {a.reviewNote}</p>}</article>)}
        </section>
      </div>}
    </>;
  if (user?.role === 'tutor' && !user.appealOnly) {
    return <TutorShell title="Kháng cáo" subtitle="Đề nghị xem xét lại báo cáo khi có hiểu nhầm, tố cáo oan hoặc hoàn cảnh cần được đối chiếu."><div className="appeal-workspace">{content}</div></TutorShell>;
  }
  return <div className="public-page">
    {user?.role === 'learner' && !user.appealOnly ? <LearnerHeader /> : <PublicHeader kind="learner" navigation={[]} actions={actions} />}
    <main className="appeal-page"><header><span className="eyebrow">BẢO VỆ QUYỀN LỢI TÀI KHOẢN</span><h1>Kháng cáo</h1><p>Đề nghị xem xét lại báo cáo khi có hiểu nhầm, tố cáo oan hoặc hoàn cảnh cần được đối chiếu.</p></header>{content}</main>
  </div>;
}
