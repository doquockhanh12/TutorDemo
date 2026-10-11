import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, CircleHelp, Eye, EyeOff, FileText, LifeBuoy, LockKeyhole, LogOut, Mail, MapPin, MessageCircle, Monitor, Moon, Shield, SlidersHorizontal, Sun, UserRound, X } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { useTutorProfile } from '../domain/DemoDomainContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { TutorShell } from './TutorPages.jsx';

const sections = [
  ['account', 'Tài khoản', UserRound], ['location', 'Vị trí & quyền riêng tư', MapPin],
  ['notifications', 'Thông báo', Bell], ['security', 'Bảo mật', Shield],
  ['appearance', 'Giao diện', Monitor], ['availability', 'Thiết lập nhận lớp', SlidersHorizontal],
  ['support', 'Hỗ trợ', LifeBuoy],
];
const notificationLabels = ['Tin nhắn mới', 'Yêu cầu học mới', 'Học viên xác nhận lịch', 'Học viên hủy lịch', 'Nhắc lịch dạy', 'Đánh giá mới', 'Khuyến mãi và ưu đãi', 'Thông báo hệ thống'];
const defaults = {
  radius: 5, allowLocation: false, nearby: true, locationVisibility: 'area',
  notifications: Object.fromEntries(notificationLabels.map((label) => [label, true])), reminder: '30 phút trước',
  accepting: true, directRequests: true, searchVisible: true,
};

function readSettings(accountId) {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(`tnm.tutor.settings.${accountId}`) || '{}') }; }
  catch { return defaults; }
}

function SettingToggle({ label, checked, onChange, description }) {
  return <label className="setting-toggle-row"><span><strong>{label}</strong>{description && <small>{description}</small>}</span><input type="checkbox" role="switch" aria-checked={checked} className="setting-switch" checked={checked} onChange={(event) => onChange(event.target.checked)}/></label>;
}

function SettingSection({ title, description, children }) {
  return <section className="settings-panel"><div className="settings-panel__heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</section>;
}

function PasswordField({ label, value, onChange, error }) {
  const [visible, setVisible] = useState(false);
  return <label className="settings-field"><span>{label}</span><span className="settings-password"><input type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} autoComplete={label === 'Mật khẩu hiện tại' ? 'current-password' : 'new-password'}/><button type="button" className="icon-button" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span>{error && <small className="settings-error">{error}</small>}</label>;
}

function DeleteDialog({ onClose, onConfirm }) {
  const [confirmation, setConfirmation] = useState('');
  const dialogRef = useDialogFocus(onClose);
  return <div className="settings-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="settings-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="delete-title" tabIndex={-1}><button type="button" className="icon-button settings-modal__close" onClick={onClose} aria-label="Đóng"><X size={20}/></button><h2 id="delete-title">Xóa tài khoản?</h2><p>Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn sẽ bị xóa.</p><p className="settings-note">Trong bản demo frontend, thao tác này chỉ mô phỏng yêu cầu xóa và không xóa dữ liệu tài khoản.</p><label className="settings-field"><span>Nhập XOA để xác nhận</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off"/></label><div className="settings-actions"><button type="button" className="button button--secondary" onClick={onClose}>Hủy</button><button type="button" className="button settings-danger-button" disabled={confirmation !== 'XOA'} onClick={onConfirm}>Xóa tài khoản</button></div></div></div>;
}

export default function TutorSettingsPage() {
  const { user, updateProfile, changePassword, logout } = useDemoAuth();
  const [profile, saveProfile] = useTutorProfile();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [active, setActive] = useState('account');
  const [preferences, setPreferences] = useState(() => readSettings(user?.id));
  const [account, setAccount] = useState(() => ({ fullName: user?.fullName || profile.name, email: user?.email || '', phone: user?.phone || '', birthDate: user?.birthDate || '' }));
  const [teachingFormats, setTeachingFormats] = useState(() => profile.formats.map((value) => value === 'Tại nhà' ? 'Dạy trực tiếp' : 'Dạy online'));
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileRef = useRef(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [otherDevice, setOtherDevice] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportDetail, setSupportDetail] = useState('');
  const initials = (account.fullName || 'Gia sư').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('');
  const accountChanged = ['fullName', 'email', 'phone', 'birthDate'].some((key) => account[key] !== (user?.[key] || (key === 'fullName' ? profile.name : '')));

  useEffect(() => { try { localStorage.setItem(`tnm.tutor.settings.${user?.id}`, JSON.stringify(preferences)); } catch { /* demo storage unavailable */ } }, [preferences, user?.id]);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => () => { if (avatarUrl) URL.revokeObjectURL(avatarUrl); }, [avatarUrl]);
  const updatePreference = (key, value) => setPreferences((current) => ({ ...current, [key]: value }));
  const flash = (message) => setToast(message);
  const saveAccount = (event) => {
    event.preventDefault();
    setBusy(true); setAccountError('');
    window.setTimeout(() => {
      const result = updateProfile(account);
      if (result.error) setAccountError(result.error);
      else { if (account.fullName !== profile.name) saveProfile({ ...profile, name: account.fullName }, { syncIdentity: false }); flash('Đã cập nhật thông tin thành công'); }
      setBusy(false);
    }, 350);
  };
  const saveTeaching = () => {
    saveProfile({ ...profile, formats: teachingFormats.map((value) => value === 'Dạy trực tiếp' ? 'Tại nhà' : 'Online') });
    flash('Đã lưu thiết lập nhận lớp');
  };
  const submitPassword = (event) => {
    event.preventDefault();
    if (passwords.next.length < 8) { setPasswordError('Mật khẩu mới cần ít nhất 8 ký tự.'); return; }
    if (passwords.next !== passwords.confirm) { setPasswordError('Xác nhận mật khẩu chưa khớp.'); return; }
    const result = changePassword(passwords.current, passwords.next);
    if (result.error) { setPasswordError(result.error); return; }
    setPasswordError(''); setPasswords({ current: '', next: '', confirm: '' }); flash('Đã đổi mật khẩu trong tài khoản demo');
  };
  const supportItems = [
    [CircleHelp, 'Trung tâm trợ giúp', 'Hướng dẫn sử dụng TutorNearMe.'],
    [MessageCircle, 'Câu hỏi thường gặp', 'Giải đáp những thắc mắc phổ biến.'],
    [FileText, 'Báo cáo vấn đề', 'Ghi nhận lỗi hoặc trải nghiệm chưa tốt.'],
    [Mail, 'Liên hệ hỗ trợ', 'Thông tin liên hệ đội ngũ hỗ trợ.'],
    [FileText, 'Điều khoản sử dụng', 'Xem thông tin điều khoản của bản demo.'],
    [LockKeyhole, 'Chính sách quyền riêng tư', 'Xem thông tin quyền riêng tư của bản demo.'],
  ];

  return <TutorShell title="Cài đặt" subtitle="Quản lý tài khoản, quyền riêng tư và tùy chọn sử dụng của bạn." eyebrow="KHÔNG GIAN GIA SƯ · CÀI ĐẶT">
    <div className="settings-layout">
      <nav className="settings-nav" aria-label="Các mục cài đặt">{sections.map(([id, label, Icon]) => <button key={id} type="button" className={active === id ? 'is-active' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => setActive(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="settings-content">
        {active === 'account' && <><SettingSection title="Tài khoản" description="Thông tin cá nhân và ảnh đại diện của bạn."><div className="settings-avatar-row">{avatarUrl ? <img src={avatarUrl} alt="Ảnh đại diện xem trước"/> : <Avatar initials={initials} name={account.fullName} size="xl"/>}<div><strong>Ảnh đại diện</strong><p>Ảnh mới chỉ được xem trước trong phiên hiện tại.</p><button type="button" className="button button--secondary button--sm" onClick={() => fileRef.current?.click()}>Thay đổi ảnh</button><input className="sr-only" ref={fileRef} type="file" accept="image/*" aria-label="Chọn ảnh đại diện" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAvatarUrl(URL.createObjectURL(file)); }}/></div></div><form className="settings-form" onSubmit={saveAccount}><h3>Thông tin cá nhân</h3><div className="settings-field-grid">{[['fullName', 'Họ và tên', 'text'], ['email', 'Email', 'email'], ['phone', 'Số điện thoại', 'tel'], ['birthDate', 'Ngày sinh', 'date']].map(([key, label, type]) => <label className="settings-field" key={key}><span>{label}</span><input type={type} required={key !== 'birthDate'} value={account[key]} onChange={(event) => setAccount({ ...account, [key]: event.target.value })}/></label>)}</div>{accountError && <p className="settings-error" role="alert">{accountError}</p>}<button type="submit" className="button button--primary" disabled={!accountChanged || busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></form></SettingSection><SettingSection title="Quản lý tài khoản"><div className="settings-actions"><button className="button button--secondary" type="button" onClick={() => { logout(); navigate('/login', { replace: true }); }}><LogOut size={17}/>Đăng xuất</button><button className="button settings-danger-button" type="button" onClick={() => setDeleteOpen(true)}>Xóa tài khoản</button></div></SettingSection></>}
        {active === 'location' && <SettingSection title="Vị trí & quyền riêng tư" description="Kiểm soát khu vực nhận lớp và cách thông tin vị trí được hiển thị."><div className="settings-form"><label className="settings-field"><span>Bán kính nhận lớp: <strong>{preferences.radius} km</strong></span><input type="range" min="0" max="4" step="1" value={[3, 5, 10, 15, 20].indexOf(preferences.radius)} onChange={(event) => updatePreference('radius', [3, 5, 10, 15, 20][Number(event.target.value)])}/><span className="settings-range-labels">{[3, 5, 10, 15, 20].map((value) => <small key={value}>{value} km</small>)}</span></label><div className="settings-divider"/><h3>Quyền riêng tư</h3><SettingToggle label="Cho phép sử dụng vị trí của tôi" checked={preferences.allowLocation} onChange={(value) => updatePreference('allowLocation', value)}/><SettingToggle label="Cho phép hệ thống đề xuất học viên gần tôi" checked={preferences.nearby} onChange={(value) => updatePreference('nearby', value)}/><h3>Hiển thị vị trí</h3>{[['area', 'Chỉ hiển thị khu vực'], ['exact', 'Hiển thị địa chỉ chính xác']].map(([value, label]) => <label className="settings-choice" key={value}><input type="radio" name="location-visibility" checked={preferences.locationVisibility === value} onChange={() => updatePreference('locationVisibility', value)}/>{label}</label>)}<p className="settings-note">Để bảo vệ quyền riêng tư, địa chỉ chính xác của bạn sẽ không được hiển thị công khai.</p></div></SettingSection>}
        {active === 'notifications' && <SettingSection title="Thông báo" description="Chọn các cập nhật bạn muốn nhận."><div className="settings-form">{notificationLabels.map((label) => <SettingToggle key={label} label={label} checked={preferences.notifications[label] ?? true} onChange={(value) => updatePreference('notifications', { ...preferences.notifications, [label]: value })}/>)}<label className="settings-field"><span>Thời điểm nhắc lịch dạy</span><select value={preferences.reminder} onChange={(event) => updatePreference('reminder', event.target.value)}>{['15 phút trước', '30 phút trước', '1 giờ trước', '2 giờ trước', '1 ngày trước'].map((value) => <option key={value}>{value}</option>)}</select></label><button type="button" className="button button--primary settings-align-start" onClick={() => flash('Đã lưu cài đặt thông báo')}>Lưu cài đặt thông báo</button></div></SettingSection>}
        {active === 'security' && <><SettingSection title="Đổi mật khẩu" description="Cập nhật mật khẩu cho tài khoản demo của bạn."><form className="settings-form" onSubmit={submitPassword}><PasswordField label="Mật khẩu hiện tại" value={passwords.current} onChange={(value) => { setPasswords({ ...passwords, current: value }); setPasswordError(''); }} error={passwordError.includes('hiện tại') ? passwordError : ''}/><PasswordField label="Mật khẩu mới" value={passwords.next} onChange={(value) => { setPasswords({ ...passwords, next: value }); setPasswordError(''); }} error={passwordError.includes('8 ký tự') ? passwordError : ''}/><PasswordField label="Xác nhận mật khẩu mới" value={passwords.confirm} onChange={(value) => { setPasswords({ ...passwords, confirm: value }); setPasswordError(''); }} error={passwordError.includes('khớp') ? passwordError : ''}/><button type="submit" className="button button--primary settings-align-start" disabled={!passwords.current || !passwords.next || !passwords.confirm}>Đổi mật khẩu</button></form></SettingSection><SettingSection title="Xác thực số điện thoại"><div className="settings-inline"><span>{user?.phone || 'Chưa có số điện thoại'}</span><strong className={user?.verified?.phone ? 'settings-verified' : 'settings-unverified'}>{user?.verified?.phone ? 'Đã xác thực' : 'Chưa xác thực'}</strong></div>{!user?.verified?.phone && <button type="button" className="button button--secondary" onClick={() => flash('Xác thực số điện thoại chưa có trong bản demo Settings.')}>Xác thực ngay</button>}</SettingSection><SettingSection title="Thiết bị đăng nhập" description="Danh sách phiên đăng nhập minh họa."><div className="settings-device"><Monitor size={20}/><span><strong>Chrome · Windows</strong><small>Thiết bị này</small></span></div>{otherDevice && <div className="settings-device"><Monitor size={20}/><span><strong>Safari · iPhone</strong><small>TP. Hồ Chí Minh</small></span><button type="button" className="button button--secondary button--sm" onClick={() => { setOtherDevice(false); flash('Đã mô phỏng đăng xuất thiết bị khác'); }}>Đăng xuất</button></div>}<button type="button" className="button button--secondary settings-device-all" disabled={!otherDevice} onClick={() => { setOtherDevice(false); flash('Đã mô phỏng đăng xuất khỏi tất cả thiết bị khác'); }}>Đăng xuất khỏi tất cả thiết bị khác</button></SettingSection></>}
        {active === 'appearance' && <SettingSection title="Giao diện" description="Chọn cách hiển thị phù hợp với bạn."><div className="settings-theme-grid">{[['light', 'Sáng', Sun, 'Giao diện sáng mặc định'], ['dark', 'Tối', Moon, 'Dễ nhìn trong môi trường thiếu sáng'], ['system', 'Theo hệ thống', Monitor, 'Theo cài đặt của thiết bị']].map(([value, label, Icon, description]) => <label className={`settings-theme-card ${theme === value ? 'is-selected' : ''}`} key={value}><input type="radio" name="theme" value={value} checked={theme === value} onChange={() => setTheme(value)}/><Icon size={24}/><strong>{label}</strong><small>{description}</small></label>)}</div></SettingSection>}
        {active === 'availability' && <SettingSection title="Thiết lập nhận lớp" description="Quản lý cách bạn xuất hiện và nhận yêu cầu học."><div className="settings-form"><SettingToggle label="Đang nhận học viên" checked={preferences.accepting} onChange={(value) => updatePreference('accepting', value)}/>{!preferences.accepting && <p className="settings-note">Hồ sơ của bạn sẽ tạm thời không xuất hiện trong kết quả tìm kiếm học viên mới.</p>}<h3>Hình thức dạy</h3>{['Dạy trực tiếp', 'Dạy online'].map((label) => <label className="settings-choice" key={label}><input type="checkbox" checked={teachingFormats.includes(label)} onChange={() => setTeachingFormats(teachingFormats.includes(label) ? teachingFormats.filter((item) => item !== label) : [...teachingFormats, label])}/>{label}</label>)}<SettingToggle label="Cho phép học viên gửi yêu cầu học trực tiếp" checked={preferences.directRequests} onChange={(value) => updatePreference('directRequests', value)}/><SettingToggle label="Hiển thị hồ sơ trong kết quả tìm kiếm" checked={preferences.searchVisible} onChange={(value) => updatePreference('searchVisible', value)}/><button type="button" className="button button--primary settings-align-start" onClick={saveTeaching}>Lưu thiết lập nhận lớp</button></div></SettingSection>}
        {active === 'support' && <SettingSection title="Hỗ trợ" description="Tìm hướng dẫn và thông tin hỗ trợ."><div className="settings-support-list">{supportItems.map(([Icon, title, description]) => <button type="button" key={title} onClick={() => setSupportDetail(title)}><Icon size={20}/><span><strong>{title}</strong><small>{description}</small></span><ChevronRight size={18}/></button>)}</div>{supportDetail && <div className="settings-support-detail" role="status"><strong>{supportDetail}</strong><p>Nội dung này chưa được kết nối trong bản demo frontend.</p><button type="button" className="text-button" onClick={() => setSupportDetail('')}>Đóng</button></div>}</SettingSection>}
      </div>
    </div>
    {toast && <div className="settings-toast" role="status"><span>{toast}</span><button type="button" onClick={() => setToast('')} aria-label="Đóng thông báo"><X size={16}/></button></div>}
    {deleteOpen && <DeleteDialog onClose={() => setDeleteOpen(false)} onConfirm={() => { setDeleteOpen(false); flash('Đã ghi nhận thao tác xóa tài khoản trong bản demo. Dữ liệu vẫn được giữ.'); }} />}
  </TutorShell>;
}


