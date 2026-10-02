import { AtSign, Phone, UsersRound } from 'lucide-react';

export default function AuthProviderButtons({ onProvider, onPhone, disabled = false, compact = false }) {
  return <div className={`auth-providers${compact ? ' auth-providers--compact' : ''}`} aria-label="Phương thức đăng ký nhanh">
    <button type="button" disabled={disabled} onClick={() => onProvider('google')}><AtSign size={18} aria-hidden="true"/><span>Tiếp tục với Google</span></button>
    <button type="button" disabled={disabled} onClick={() => onProvider('facebook')}><UsersRound size={18} aria-hidden="true"/><span>Tiếp tục với Facebook</span></button>
    <button type="button" disabled={disabled} onClick={onPhone}><Phone size={18} aria-hidden="true"/><span>Tiếp tục với số điện thoại</span></button>
  </div>;
}
