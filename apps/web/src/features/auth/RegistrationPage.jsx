import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BadgeCheck } from 'lucide-react';
import AuthFrame from './AuthFrame.jsx';
import AuthProviderButtons from './AuthProviderButtons.jsx';
import PhoneAuthModal from './PhoneAuthModal.jsx';
import useDemoAuth, { MOCK_PROVIDER_PAYLOADS } from './DemoAuthContext.jsx';
import { authPath, normalizePhone } from './authUtils.js';
import { authSuccessTarget } from './AuthNavigation.jsx';

const subjects = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'Tin học', 'Giáo dục Kinh tế & Pháp luật', 'Tiếng Trung', 'Tiếng Nhật', 'IELTS', 'TOEIC', 'SAT', 'Cấu trúc dữ liệu và giải thuật', 'Khác'];
const availability = ['Sáng ngày thường', 'Chiều ngày thường', 'Tối ngày thường', 'Sáng cuối tuần', 'Chiều cuối tuần', 'Tối cuối tuần'];

export default function RegistrationPage({ role = 'learner' }) {
  const tutor = role === 'tutor'; const location = useLocation(); const navigate = useNavigate(); const { register, loginProvider } = useDemoAuth();
  const [values, setValues] = useState({ fullName: '', accountType: '', username: '', phone: '', email: '', address: '', university: '', area: '', fee: '', duration: '60', customDuration: '', otherSubject: '', password: '', confirmPassword: '' });
  const [selectedSubjects, setSubjects] = useState([]); const [selectedAvailability, setAvailability] = useState([]); const [provider, setProvider] = useState(''); const [verified, setVerified] = useState({ email: false, phone: false }); const [needsVerification, setNeedsVerification] = useState({ email: false, phone: false }); const [quickVisible, setQuickVisible] = useState(true); const [phoneOpen, setPhoneOpen] = useState(false); const [showPassword, setShowPassword] = useState(false); const [showConfirm, setShowConfirm] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const redirect = new URLSearchParams(location.search).get('redirect');
  const setField = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const incoming = location.state?.prefill; const incomingProvider = location.state?.provider;
    if (!incoming) return;
    setProvider(incomingProvider || ''); setQuickVisible(false);
    setValues((v) => ({ ...v, ...(incoming.fullName ? { fullName: incoming.fullName } : {}), ...(incoming.email ? { email: incoming.email } : {}), ...(incoming.phone ? { phone: incoming.phone } : {}) }));
    setVerified({ email: Boolean(incoming.email && incoming.emailVerified), phone: Boolean(incoming.phone && incoming.phoneVerified) }); setNeedsVerification({ email: false, phone: false });
    setNotice(`Đã xác minh ${incomingProvider === 'phone' ? 'số điện thoại' : incomingProvider || 'provider'}. Chỉ thông tin provider thực sự cung cấp được điền; mật khẩu TutorNearMe vẫn bắt buộc.`);
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, []);

  const markChanged = (key, value) => { setField(key, value); if ((key === 'email' && verified.email && value.trim() !== values.email) || (key === 'phone' && verified.phone && normalizePhone(value) !== normalizePhone(values.phone))) { setVerified((v) => ({ ...v, [key]: false })); setNeedsVerification((v) => ({ ...v, [key]: true })); setNotice('Giá trị đã thay đổi và cần xác minh lại.'); } };
  const providerContinue = (name) => {
    const linked = loginProvider(name);
    if (linked.user) { navigate(authSuccessTarget(location.search, linked.user.role), { replace: true }); return; }
    const payload = MOCK_PROVIDER_PAYLOADS[name];
    setProvider(name); setQuickVisible(false); setValues((v) => ({ ...v, ...(payload.fullName ? { fullName: payload.fullName } : {}), ...(payload.email ? { email: payload.email } : {}), ...(payload.phone ? { phone: payload.phone } : {}) }));
    setVerified({ email: Boolean(payload.email && payload.emailVerified), phone: Boolean(payload.phone && payload.phoneVerified) }); setNeedsVerification({ email: false, phone: false }); setNotice(`Đã xác minh ${name === 'google' ? 'Google' : 'Facebook'}. Chỉ các trường có trong payload mới được điền; mật khẩu TutorNearMe vẫn bắt buộc.`);
  };
  const phoneVerified = (payload) => { setPhoneOpen(false); const linked = loginProvider('phone', payload.phone); if (linked.user) { navigate(authSuccessTarget(location.search, linked.user.role), { replace: true }); return; } setProvider('phone'); setField('phone', payload.phone); setVerified((v) => ({ ...v, phone: true })); setNeedsVerification((v) => ({ ...v, phone: false })); setQuickVisible(false); setNotice('Số điện thoại đã xác minh bằng OTP. Bạn vẫn cần tạo mật khẩu TutorNearMe.'); };
  const toggle = (list, setList, item) => setList((current) => current.includes(item) ? current.filter((v) => v !== item) : [...current, item]);
  const submit = (event) => {
    event.preventDefault(); setError('');
    const required = tutor ? ['fullName', 'username', 'phone', 'email', 'university', 'area', 'fee', 'password', 'confirmPassword'] : ['fullName', 'accountType', 'username', 'phone', 'email', 'address', 'password', 'confirmPassword'];
    const missing = required.find((key) => !String(values[key]).trim());
    if (missing) { setError('Vui lòng điền đầy đủ các thông tin bắt buộc.'); document.getElementById(`auth-${missing}`)?.focus(); return; }
    if (!/^[A-Za-z0-9._-]{4,30}$/.test(values.username)) { setError('Username cần 4–30 ký tự, không có khoảng trắng; chỉ dùng chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { setError('Email chưa đúng định dạng.'); return; }
    const phone = normalizePhone(values.phone); if (phone.length < 10 || phone.length > 11) { setError('Số điện thoại chưa hợp lệ.'); return; }
    if (values.password.length < 8) { setError('Mật khẩu cần có ít nhất 8 ký tự.'); return; }
    if (values.password !== values.confirmPassword) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    if (tutor && (!selectedSubjects.length || !selectedAvailability.length)) { setError('Gia sư cần chọn ít nhất một môn và một khung giờ rảnh.'); return; }
    if (tutor && (!Number.isFinite(Number(values.fee)) || Number(values.fee) < 10000)) { setError('Mức phí cần từ 10.000đ mỗi buổi.'); return; }
    if (tutor && selectedSubjects.includes('Khác') && !values.otherSubject.trim()) { setError('Vui lòng nhập môn / kỹ năng khác.'); return; }
    if (tutor && values.duration === 'other' && !values.customDuration.trim()) { setError('Vui lòng nhập thời lượng buổi học.'); return; }
    const { confirmPassword, ...accountFields } = values;
    const result = register(role, { ...accountFields, phone, subjects: selectedSubjects.filter((s) => s !== 'Khác').concat(selectedSubjects.includes('Khác') ? [values.otherSubject.trim()] : []), availability: selectedAvailability, duration: values.duration === 'other' ? values.customDuration : values.duration, emailVerified: verified.email, phoneVerified: verified.phone }, provider);
    if (result.error) { setError(result.error); return; }
    navigate(authSuccessTarget(location.search, role), { replace: true });
  };

  const field = (key, label, options = {}) => <label className={`auth-field ${options.className || ''}`} key={key}><span>{label} *</span>{options.select ? <select id={`auth-${key}`} required value={values[key]} onChange={(e) => setField(key, e.target.value)}>{options.select.map(([v, t]) => <option value={v} key={v}>{t}</option>)}</select> : <input id={`auth-${key}`} required type={options.type || 'text'} inputMode={options.inputMode} autoComplete={options.autoComplete} value={values[key]} placeholder={options.placeholder || ''} onChange={(e) => (key === 'email' || key === 'phone') ? markChanged(key, e.target.value) : setField(key, e.target.value)} />}{key === 'email' && <VerificationState active={verified.email} changed={needsVerification.email}/ >}{key === 'phone' && <VerificationState active={verified.phone} changed={needsVerification.phone}/ >}{options.hint && <small>{options.hint}</small>}</label>;
  const passwordField = (key, label, visible, setVisible) => <label className="auth-field" key={key}><span>{label} *</span><div className="auth-password"><input id={`auth-${key}`} required type={visible ? 'text' : 'password'} autoComplete="new-password" value={values[key]} onChange={(e) => setField(key, e.target.value)} placeholder={key === 'password' ? 'Tối thiểu 8 ký tự' : 'Nhập lại mật khẩu'}/><button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>;

  return <AuthFrame kind={tutor ? 'tutor' : 'learner'}><section className="auth-card auth-card--register" aria-labelledby="auth-register-title"><header className="auth-card__head"><span>ĐĂNG KÝ {tutor ? 'GIA SƯ' : 'NGƯỜI HỌC'}</span><h2 id="auth-register-title">Tạo tài khoản {tutor ? 'gia sư' : 'người học'}</h2><p>{tutor ? 'Thông tin chuyên môn giúp người học tìm thấy bạn.' : 'Thông tin tài khoản để bắt đầu tìm gia sư phù hợp.'}</p></header>
    {quickVisible && <><div className="auth-quick"><p>ĐĂNG KÝ NHANH</p><AuthProviderButtons onProvider={providerContinue} onPhone={() => setPhoneOpen(true)} compact/></div><div className="auth-divider auth-divider--manual"><span>Hoặc điền thủ công</span></div></>}
    {!quickVisible && <div className="auth-provider-state" role="status"><BadgeCheck size={18}/><span>{notice}</span></div>}
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="auth-form__grid">{field('fullName', 'Họ và tên', { autoComplete: 'name', placeholder: 'Họ và tên' })}{!tutor && field('accountType', 'Bạn là', { select: [['', 'Chọn'], ['learner', 'Người học'], ['parent', 'Phụ huynh']] })}{field('username', 'Username', { autoComplete: 'username', placeholder: '4–30 ký tự', hint: 'Không khoảng trắng; chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.' })}{field('phone', 'Số điện thoại', { autoComplete: 'tel', inputMode: 'tel', placeholder: '09xx xxx xxx' })}{field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'Email của bạn' })}
      {!tutor && field('address', 'Địa chỉ đang sinh sống', { autoComplete: 'street-address', placeholder: 'Nhập địa chỉ dạng văn bản' })}
      {tutor && <>{field('university', 'Trường đại học / Cơ sở đào tạo', { placeholder: 'Nhập tên cơ sở đào tạo' })}{field('area', 'Địa chỉ / Khu vực có thể dạy', { placeholder: 'Nhập khu vực có thể dạy' })}</>}
      {tutor && <div className="auth-field auth-field--full"><span>Môn học *</span><div className="auth-check-grid">{subjects.map((subject) => <label className="auth-check" key={subject}><input type="checkbox" checked={selectedSubjects.includes(subject)} onChange={() => toggle(selectedSubjects, setSubjects, subject)}/>{subject}</label>)}</div>{selectedSubjects.includes('Khác') && <div className="auth-field auth-field--nested"><label htmlFor="auth-otherSubject">Môn / kỹ năng khác *</label><input id="auth-otherSubject" value={values.otherSubject} onChange={(e) => setField('otherSubject', e.target.value)} placeholder="Nhập môn hoặc kỹ năng"/></div>}</div>}
      {tutor && <>{field('fee', 'Mức phí mong muốn / buổi', { type: 'number', inputMode: 'numeric', placeholder: 'Ví dụ: 200000' })}<label className="auth-field"><span>Thời lượng buổi học</span><select value={values.duration} onChange={(e) => setField('duration', e.target.value)}><option value="60">60 phút</option><option value="90">90 phút</option><option value="120">120 phút</option><option value="other">Khác / Thỏa thuận</option></select>{values.duration === 'other' && <input className="auth-nested-input" value={values.customDuration} onChange={(e) => setField('customDuration', e.target.value)} placeholder="Nhập thời lượng hoặc thỏa thuận"/>}</label><div className="auth-field auth-field--full"><span>Khung giờ thường rảnh *</span><div className="auth-check-grid">{availability.map((slot) => <label className="auth-check" key={slot}><input type="checkbox" checked={selectedAvailability.includes(slot)} onChange={() => toggle(selectedAvailability, setAvailability, slot)}/>{slot}</label>)}</div></div></>}
      {passwordField('password', 'Mật khẩu', showPassword, setShowPassword)}{passwordField('confirmPassword', 'Xác nhận mật khẩu', showConfirm, setShowConfirm)}</div>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}<button className="auth-button auth-button--primary" type="submit">Tạo tài khoản {tutor ? 'gia sư' : 'người học'}</button>
      <p className="auth-form__foot">Đã có tài khoản? <Link to={authPath('/login', redirect)}>Đăng nhập</Link></p>
    </form></section><PhoneAuthModal open={phoneOpen} onClose={() => setPhoneOpen(false)} onVerified={phoneVerified}/></AuthFrame>;
}

function VerificationState({ active, changed }) {
  if (!active && !changed) return null;
  return <small className={`auth-verification${active ? ' is-verified' : ''}`}>{active ? 'Đã xác minh' : 'Giá trị đã thay đổi — cần xác minh lại'}</small>;
}
