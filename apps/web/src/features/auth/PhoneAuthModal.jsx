import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Phone, X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import { normalizePhone } from './authUtils.js';

export default function PhoneAuthModal({ open, onClose, onVerified }) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);
  const dialogRef = useDialogFocus(() => { if (open) onClose(); }, open);
  useEffect(() => { if (!open || step !== 'otp' || seconds <= 0) return undefined; const timer = setTimeout(() => setSeconds((n) => n - 1), 1000); return () => clearTimeout(timer); }, [open, step, seconds]);
  useEffect(() => { if (open) { setStep('phone'); setOtp(''); setError(''); setSeconds(30); } }, [open]);
  if (!open) return null;
  const continuePhone = () => { const normalized = normalizePhone(phone); if (normalized.length < 10 || normalized.length > 11) { setError('Nhập số điện thoại Việt Nam hợp lệ.'); return; } setPhone(normalized); setError(''); setStep('otp'); };
  const verify = () => { if (otp !== '123456') { setError('Mã OTP chưa đúng. Mã demo là 123456.'); return; } onVerified({ phone: normalizePhone(phone), phoneVerified: true }); };
  return <div className="auth-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="auth-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-phone-title" tabIndex={-1}>
      <button className="auth-modal__close" type="button" onClick={onClose} aria-label="Đóng"><X size={20}/></button>
      {step === 'phone' ? <>
        <span className="auth-modal__icon"><Phone size={22}/></span><p className="auth-eyebrow">XÁC THỰC TUTORNEARME</p><h2 id="auth-phone-title">Tiếp tục bằng số điện thoại</h2><p>Nhập số điện thoại của bạn để nhận mã OTP demo.</p>
        <label className="auth-field"><span>Số điện thoại</span><input autoFocus inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx"/></label>
        {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}<button className="auth-button auth-button--primary" type="button" onClick={continuePhone}>Tiếp tục</button>
      </> : <>
        <span className="auth-modal__icon"><CheckCircle2 size={22}/></span><p className="auth-eyebrow">XÁC MINH SỐ ĐIỆN THOẠI</p><h2 id="auth-phone-title">Nhập mã OTP</h2><p>Mã demo đã gửi tới <strong>{phone}</strong>.</p>
        <label className="auth-field"><span>Mã OTP 6 chữ số</span><input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••"/></label>
        <small className="auth-demo-note">Dùng mã 123456 để hoàn tất xác minh.</small>
        {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}<button className="auth-button auth-button--primary" type="button" onClick={verify}>Xác minh</button>
        <div className="auth-modal__actions"><button type="button" onClick={() => { setStep('phone'); setError(''); }}><ArrowLeft size={16}/> Đổi số điện thoại</button><button type="button" disabled={seconds > 0} onClick={() => setSeconds(30)}>{seconds ? `Gửi lại mã sau ${seconds}s` : 'Gửi lại mã'}</button></div>
      </>}
    </section>
  </div>;
}
