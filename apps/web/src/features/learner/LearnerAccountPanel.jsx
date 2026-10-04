import { useState } from 'react';
import { BadgeCheck, MapPin, Pencil, UserRound } from 'lucide-react';
import Button from '../../components/Button.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';

export default function LearnerAccountPanel({ addressOnly = false }) {
  const { user, updateProfile } = useDemoAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const startEdit = () => {
    setDraft({ fullName: user.fullName || '', email: user.email || '', phone: user.phone || '', accountType: user.accountType || 'learner', address: user.address || '' });
    setError(''); setNotice(''); setEditing(true);
  };
  const change = (key, value) => { setDraft((current) => ({ ...current, [key]: value })); setError(''); };
  const submit = (event) => {
    event.preventDefault();
    const changes = addressOnly ? { address: draft.address } : { fullName: draft.fullName, email: draft.email, phone: draft.phone, accountType: draft.accountType };
    const result = updateProfile(changes);
    if (result.error) { setError(result.error); return; }
    setEditing(false); setNotice(addressOnly ? 'Đã lưu địa chỉ mới.' : 'Đã cập nhật thông tin cá nhân.');
  };
  return <section className="learner-dashboard-panel" id={addressOnly ? 'account-address' : 'account-profile'} aria-labelledby={addressOnly ? 'address-title' : 'profile-title'}>
    <div className="learner-dashboard-section-head"><div><span className="learner-dashboard-kicker">{addressOnly ? 'KHU VỰC CỦA BẠN' : 'HỒ SƠ TÀI KHOẢN'}</span><h2 id={addressOnly ? 'address-title' : 'profile-title'}>{addressOnly ? <MapPin size={21} /> : <UserRound size={21} />}{addressOnly ? 'Địa chỉ đang sinh sống' : 'Thông tin cá nhân'}</h2></div>
      {!editing && <Button variant="secondary" size="sm" onClick={startEdit}><Pencil size={16} />{addressOnly ? 'Sửa địa chỉ' : 'Chỉnh sửa'}</Button>}</div>
    {editing ? <form onSubmit={submit} noValidate className="learner-dashboard-form">
      {addressOnly ? <label>Địa chỉ đang sinh sống *<textarea autoFocus autoComplete="street-address" rows={3} maxLength={400} value={draft.address} onChange={(e) => change('address', e.target.value)} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" /></label> : <div className="learner-dashboard-field-grid">
        <label>Họ và tên *<input autoFocus autoComplete="name" maxLength={100} value={draft.fullName} onChange={(e) => change('fullName', e.target.value)} /></label>
        <label>Bạn là *<select value={draft.accountType} onChange={(e) => change('accountType', e.target.value)}><option value="learner">Người học</option><option value="parent">Phụ huynh</option></select></label>
        <label>Email *<input type="email" autoComplete="email" value={draft.email} onChange={(e) => change('email', e.target.value)} />{user.verified?.email && draft.email !== user.email && <small>Email mới sẽ cần xác minh lại.</small>}</label>
        <label>Số điện thoại *<input type="tel" autoComplete="tel" value={draft.phone} onChange={(e) => change('phone', e.target.value)} />{user.verified?.phone && draft.phone !== user.phone && <small>Số mới sẽ cần xác minh lại.</small>}</label>
      </div>}
      {error && <p className="learner-dashboard-error" role="alert">{error}</p>}
      <div className="learner-dashboard-form-actions"><Button type="submit">Lưu thay đổi</Button><Button variant="secondary" onClick={() => { setEditing(false); setError(''); }}>Hủy</Button></div>
    </form> : addressOnly ? <div className="learner-dashboard-address"><MapPin size={26} /><div><strong>{user.address || 'Bạn chưa cập nhật địa chỉ'}</strong><p>{user.address ? 'Bạn có thể cập nhật khi thay đổi nơi sinh sống.' : 'Thêm địa chỉ để hồ sơ người học đầy đủ hơn.'}</p></div></div> : <dl className="learner-dashboard-details">
      <div><dt>Họ và tên</dt><dd>{user.fullName || 'Chưa cập nhật'}</dd></div><div><dt>Loại tài khoản</dt><dd>{user.accountType === 'parent' ? 'Phụ huynh' : 'Người học'}</dd></div>
      <div><dt>Email</dt><dd>{user.email || 'Chưa cập nhật'}<Verification verified={user.verified?.email} /></dd></div><div><dt>Số điện thoại</dt><dd>{user.phone || 'Chưa cập nhật'}<Verification verified={user.verified?.phone} /></dd></div>
      <div><dt>Username</dt><dd>@{user.username}</dd></div>
    </dl>}
    {notice && <p className="learner-dashboard-success" role="status"><BadgeCheck size={18} />{notice}</p>}
    {!addressOnly && <p className="learner-dashboard-note">Username được giữ nguyên. Thay đổi email hoặc số điện thoại sẽ bỏ trạng thái xác minh của thông tin đó.</p>}
  </section>;
}
function Verification({ verified }) {
  return <small className={`learner-dashboard-verification${verified ? ' is-verified' : ''}`}>{verified && <BadgeCheck size={14} />}{verified ? 'Đã xác minh' : 'Chưa xác minh'}</small>;
}
