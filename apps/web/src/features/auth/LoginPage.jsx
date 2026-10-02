import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthFrame from './AuthFrame.jsx';
import AuthProviderButtons from './AuthProviderButtons.jsx';
import PhoneAuthModal from './PhoneAuthModal.jsx';
import useDemoAuth from './DemoAuthContext.jsx';
import { authPath, registrationPathFor } from './authUtils.js';
import { authSuccessTarget } from './AuthNavigation.jsx';

export default function LoginPage() {
  const { login, loginProvider } = useDemoAuth(); const location = useLocation(); const navigate = useNavigate();
  const [identity, setIdentity] = useState(''); const [password, setPassword] = useState(''); const [remember, setRemember] = useState(true); const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(''); const [phoneOpen, setPhoneOpen] = useState(false);
  const redirect = new URLSearchParams(location.search).get('redirect');
  const submit = (e) => { e.preventDefault(); setError(''); if (!identity.trim() || !password) { setError('Nhập username/email/số điện thoại và mật khẩu.'); return; } const result = login(identity, password, remember); if (result.error) { setError(result.error); return; } navigate(authSuccessTarget(location.search, result.user.role), { replace: true }); };
  const provider = (name) => { const result = loginProvider(name, undefined, remember); if (result.user) navigate(authSuccessTarget(location.search, result.user.role), { replace: true }); else if (redirect?.startsWith('/admin/')) setError('Admin không có đăng ký công khai. Hãy dùng tài khoản demo admin.'); else navigate(authPath(registrationPathFor(redirect), redirect), { state: { provider: name, prefill: result.payload } }); };
  const phoneVerified = ({ phone, phoneVerified }) => { setPhoneOpen(false); const result = loginProvider('phone', phone, remember); if (result.user) navigate(authSuccessTarget(location.search, result.user.role), { replace: true }); else if (redirect?.startsWith('/admin/')) setError('Admin không có đăng ký công khai. Hãy dùng tài khoản demo admin.'); else navigate(authPath(registrationPathFor(redirect), redirect), { state: { provider: 'phone', prefill: { phone, phoneVerified } } }); };
  return <AuthFrame kind="login"><section className="auth-card" aria-labelledby="auth-login-title"><header className="auth-card__head"><span>ĐĂNG NHẬP TUTORNEARME</span><h2 id="auth-login-title">Đăng nhập tài khoản</h2><p>Dùng tài khoản đã đăng ký để tiếp tục.</p></header>
    <form className="auth-form" onSubmit={submit} noValidate><label className="auth-field"><span>Username / Email / Số điện thoại *</span><input autoComplete="username" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Nhập thông tin tài khoản"/></label>
      <label className="auth-field"><span>Mật khẩu *</span><div className="auth-password"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu"/><button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
      <div className="auth-form__meta"><label className="auth-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}/> Ghi nhớ đăng nhập trên thiết bị này</label><button type="button" className="auth-text-button" onClick={() => setError('Đặt lại mật khẩu chưa có trong prototype.')}>Quên mật khẩu?</button></div>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}<button className="auth-button auth-button--primary" type="submit">Đăng nhập</button>
      <div className="auth-divider"><span>Hoặc tiếp tục với</span></div><AuthProviderButtons onProvider={provider} onPhone={() => setPhoneOpen(true)} compact/>
      <p className="auth-form__foot">Chưa có tài khoản? <Link to={authPath('/register', redirect)}>Đăng ký người học</Link> · <Link to={authPath('/tutor/register', redirect)}>Đăng ký gia sư</Link></p>
      <p className="auth-demo-account">Demo: <b>minhanh</b>, <b>giabao</b> hoặc <b>admin</b> / <b>demo1234</b></p>
    </form></section><PhoneAuthModal open={phoneOpen} onClose={() => setPhoneOpen(false)} onVerified={phoneVerified}/></AuthFrame>;
}
