export const LEARNER_HOME_PATH = '/learner/search';

export function safeRedirect(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  if (/^[\w+.-]+:/.test(value) || /[\r\n\\]/.test(value)) return null;
  if (/^\/(login|register|tutor\/register)(?:[?#]|$)/.test(value)) return null;
  return value;
}

export function defaultDestination(role) {
  if (role === 'tutor') return '/tutor/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return LEARNER_HOME_PATH;
}

export function authPath(path, redirect) {
  const safe = safeRedirect(redirect);
  return safe ? `${path}?redirect=${encodeURIComponent(safe)}` : path;
}

export function registrationPathFor(redirect) {
  const safe = safeRedirect(redirect);
  return safe?.startsWith('/tutor/') ? '/tutor/register' : '/register';
}

export function identityKey(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('84')) digits = `0${digits.slice(2)}`;
  if (!digits.startsWith('0')) digits = `0${digits}`;
  return digits.slice(0, 11);
}
