import { demoReferenceData } from '../../data/demoReferenceData.js';
import { createContext, useContext, useMemo, useState } from 'react';
import { identityKey, normalizePhone } from './authUtils.js';
import { normalizeSessionMinutes } from '../../data/tutorSchedule.js';

const STORAGE_KEY = 'tutornearme.demo-auth.v1';
const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';
export const SUSPENDED_ACCOUNT_ERROR = 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.';
export const INVALID_CREDENTIALS_ERROR = 'Thông tin đăng nhập chưa chính xác. Tài khoản demo: minhanh / demo1234, giabao / demo1234, admin / demo1234.';
const DEMO_USERS = demoReferenceData.accounts;
export const MOCK_PROVIDER_PAYLOADS = demoReferenceData.providerPayloads;

function restore() {
  const normalize = (account) => account?.role === 'tutor' ? { ...account, duration: String(normalizeSessionMinutes(account.duration)) } : account;
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)) || { user: null, accounts: [] }; return { ...saved, user: normalize(saved.user), accounts: (saved.accounts || []).map(normalize) }; }
  catch { return { user: null, accounts: [] }; }
}

const AuthContext = createContext(null);
export function DemoAuthProvider({ children }) {
  const [state, setState] = useState(restore);
  const persist = (next, remember = true) => { setState(next); try { const target = remember ? localStorage : sessionStorage; const other = remember ? sessionStorage : localStorage; target.setItem(STORAGE_KEY, JSON.stringify(next)); other.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ } };
  const allAccounts = () => {
    const baseAccounts = [
      ...DEMO_USERS.filter((seed) => !(state.accounts || []).some((account) => account.id === seed.id)),
      ...(state.accounts || [])
    ];
    try {
      const raw = localStorage.getItem(DOMAIN_STORAGE_KEY);
      if (raw) {
        const domain = JSON.parse(raw);
        if (Array.isArray(domain?.users)) {
          const domainUserMap = new Map();
          domain.users.forEach((u) => {
            if (u.id) domainUserMap.set(u.id, u);
            if (u.username) domainUserMap.set(u.username, u);
          });
          const baseIds = new Set(baseAccounts.map((a) => a.id));
          const mergedBase = baseAccounts.map((acc) => {
            const domainUser = domainUserMap.get(acc.id) || (acc.username ? domainUserMap.get(acc.username) : null);
            return domainUser ? { ...acc, status: domainUser.status || acc.status } : acc;
          });
          const extraDomainUsers = domain.users.filter((u) => !baseIds.has(u.id));
          return [...mergedBase, ...extraDomainUsers];
        }
      }
    } catch { /* storage may be unavailable */ }
    return baseAccounts;
  };
  const updateProfile = (changes) => {
    if (!state.user) return { error: 'Bạn cần đăng nhập để cập nhật hồ sơ.' };
    const allowed = ['fullName', 'email', 'phone', 'accountType', 'address'];
    const fields = Object.fromEntries(allowed.filter((key) => key in changes).map((key) => [key, String(changes[key]).trim()]));
    if ('phone' in fields) {
      const rawPhone = fields.phone;
      const digits = rawPhone.replace(/\D/g, '');
      const localDigits = digits.startsWith('84') ? `0${digits.slice(2)}` : digits;
      if (!/^[+\d\s().-]+$/.test(rawPhone) || !/^0\d{9,10}$/.test(localDigits)) return { error: 'Số điện thoại cần bắt đầu bằng 0 và có 10–11 chữ số (hoặc dùng mã +84).' };
      fields.phone = localDigits;
    }
    if ('fullName' in fields && !fields.fullName) return { error: 'Vui lòng nhập họ và tên.' };
    if ('email' in fields && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return { error: 'Email chưa đúng định dạng.' };
    if ('phone' in fields && !/^0\d{9,10}$/.test(fields.phone)) return { error: 'Số điện thoại cần bắt đầu bằng 0 và có 10–11 chữ số.' };
    if ('accountType' in fields && !['learner', 'parent'].includes(fields.accountType)) return { error: 'Vui lòng chọn người học hoặc phụ huynh.' };
    if ('address' in fields && !fields.address) return { error: 'Vui lòng nhập địa chỉ đang sinh sống.' };
    const duplicate = allAccounts().some((account) => account.id !== state.user.id && ((fields.email && identityKey(account.email) === identityKey(fields.email)) || (fields.phone && normalizePhone(account.phone) === fields.phone)));
    if (duplicate) return { error: 'Email hoặc số điện thoại đã được dùng bởi tài khoản demo khác.' };
    const user = { ...state.user, ...fields, verified: { ...state.user.verified } };
    if ('email' in fields && identityKey(fields.email) !== identityKey(state.user.email)) user.verified.email = false;
    if ('phone' in fields && normalizePhone(fields.phone) !== normalizePhone(state.user.phone)) user.verified.phone = false;
    let remember = true;
    try { remember = Boolean(localStorage.getItem(STORAGE_KEY)); } catch { /* storage unavailable */ }
    persist({ ...state, user, accounts: [...(state.accounts || []).filter((account) => account.id !== user.id), user] }, remember);
    return { user };
  };
  const login = (identity, password, remember = true) => {
    const key = identityKey(identity);
    const user = allAccounts().find((item) => [item.username, item.email, item.phone].some((v) => identityKey(v) === key));
    if (!user || user.password !== password) return { error: INVALID_CREDENTIALS_ERROR };
    if (user.status === 'suspended') return { error: SUSPENDED_ACCOUNT_ERROR };
    persist({ ...state, user }, remember); return { user };
  };
  const loginProvider = (provider, phone, remember = true) => {
    const account = allAccounts().find((item) => provider === 'phone' ? normalizePhone(item.phone) === normalizePhone(phone) : item.linkedProviders?.includes(provider));
    if (account) {
      if (account.status === 'suspended') return { error: SUSPENDED_ACCOUNT_ERROR };
      persist({ ...state, user: account }, remember); return { user: account };
    }
    return { registration: true, provider, payload: MOCK_PROVIDER_PAYLOADS[provider] };
  };
  // Restricted frontend session; suspended users may appeal without unlocking product routes.
  const loginForAppeal = (identity, password) => {
    const key = identityKey(identity);
    const account = allAccounts().find(item => [item.username, item.email, item.phone].some(v => identityKey(v) === key));
    if (!account || account.password !== password || !['learner', 'tutor'].includes(account.role)) return { error: 'Thông tin tài khoản chưa chính xác.' };
    const user = { ...account, appealOnly: true };
    persist({ ...state, user }, false);
    return { user };
  };
  const register = (role, values, provider) => {
    const key = identityKey(values.username);
    if (allAccounts().some((account) => identityKey(account.username) === key || identityKey(account.email) === identityKey(values.email) || (values.phone && normalizePhone(account.phone) === normalizePhone(values.phone)))) return { error: 'Username, email hoặc số điện thoại này đã có trong dữ liệu demo.' };
    const user = { id: `demo-${Date.now()}`, role, ...values, ...(role === 'tutor' ? { duration: String(normalizeSessionMinutes(values.duration)) } : {}), password: values.password, linkedProviders: provider ? [provider] : [], verified: { email: Boolean(values.emailVerified), phone: Boolean(values.phoneVerified) } };
    const accounts = [...(state.accounts || []), user]; persist({ accounts, user }); return { user };
  };
  const logout = () => persist({ ...state, user: null });
  const value = useMemo(() => ({ user: state.user, authenticated: Boolean(state.user), login, loginProvider, loginForAppeal, register, logout, updateProfile }), [state, state.user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default function useDemoAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useDemoAuth must be used inside DemoAuthProvider');
  return value;
}
