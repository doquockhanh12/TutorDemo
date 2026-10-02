import { createContext, useContext, useMemo, useState } from 'react';
import { identityKey, normalizePhone } from './authUtils.js';

const STORAGE_KEY = 'tutornearme.demo-auth.v1';
const DEMO_USERS = [
  { id: 'demo-learner', fullName: 'Nguyễn Minh Anh', username: 'minhanh', email: 'learner@demo.tutornearme.vn', phone: '0900000001', role: 'learner', password: 'demo1234', linkedProviders: [], verified: { email: true, phone: true } },
  { id: 'demo-tutor', fullName: 'Trần Gia Bảo', username: 'giabao', email: 'tutor@demo.tutornearme.vn', phone: '0900000002', role: 'tutor', password: 'demo1234', linkedProviders: [], verified: { email: true, phone: true } },
  { id: 'demo-admin', fullName: 'Quản trị viên', username: 'admin', email: 'admin@demo.tutornearme.vn', phone: '0900000003', role: 'admin', password: 'demo1234', linkedProviders: [], verified: { email: true, phone: true } },
];
export const MOCK_PROVIDER_PAYLOADS = {
  google: { fullName: 'Nguyễn Minh Anh', email: 'minhanh.demo@gmail.com', phone: '', emailVerified: true },
  facebook: { fullName: 'Minh Anh Nguyễn', email: '', phone: '', emailVerified: false },
};

function restore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)) || { user: null, accounts: [] }; }
  catch { return { user: null, accounts: [] }; }
}

const AuthContext = createContext(null);
export function DemoAuthProvider({ children }) {
  const [state, setState] = useState(restore);
  const persist = (next, remember = true) => { setState(next); try { const target = remember ? localStorage : sessionStorage; const other = remember ? sessionStorage : localStorage; target.setItem(STORAGE_KEY, JSON.stringify(next)); other.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ } };
  const allAccounts = () => [...DEMO_USERS, ...(state.accounts || [])];
  const login = (identity, password, remember = true) => {
    const key = identityKey(identity);
    const user = allAccounts().find((item) => [item.username, item.email, item.phone].some((v) => identityKey(v) === key));
    if (!user || user.password !== password) return { error: 'Thông tin đăng nhập chưa chính xác. Tài khoản demo: minhanh / demo1234, giabao / demo1234, admin / demo1234.' };
    persist({ ...state, user }, remember); return { user };
  };
  const loginProvider = (provider, phone, remember = true) => {
    const account = allAccounts().find((item) => provider === 'phone' ? normalizePhone(item.phone) === normalizePhone(phone) : item.linkedProviders?.includes(provider));
    if (account) { persist({ ...state, user: account }, remember); return { user: account }; }
    return { registration: true, provider, payload: MOCK_PROVIDER_PAYLOADS[provider] };
  };
  const register = (role, values, provider) => {
    const key = identityKey(values.username);
    if (allAccounts().some((account) => identityKey(account.username) === key || identityKey(account.email) === identityKey(values.email) || (values.phone && normalizePhone(account.phone) === normalizePhone(values.phone)))) return { error: 'Username, email hoặc số điện thoại này đã có trong dữ liệu demo.' };
    const user = { id: `demo-${Date.now()}`, role, ...values, password: values.password, linkedProviders: provider ? [provider] : [], verified: { email: Boolean(values.emailVerified), phone: Boolean(values.phoneVerified) } };
    const accounts = [...(state.accounts || []), user]; persist({ accounts, user }); return { user };
  };
  const logout = () => persist({ ...state, user: null });
  const value = useMemo(() => ({ user: state.user, authenticated: Boolean(state.user), login, loginProvider, register, logout }), [state, state.user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default function useDemoAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useDemoAuth must be used inside DemoAuthProvider');
  return value;
}
