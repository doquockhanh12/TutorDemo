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

export const BIRTH_DATE_MIN = '1900-01-01';
export const BIRTH_DATE_MAX = '2100-12-31';

export function clampBirthDateInput(value = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const normalized = raw.replace(/^\+/, '');
  const parts = normalized.split('-');
  if (parts[0] && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4);
    return parts.join('-');
  }
  return normalized;
}

export function validateBirthDate(value = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const match = /^(\d+)-(\d{2})-(\d{2})$/.exec(raw.replace(/^\+/, ''));
  if (!match || match[1].length !== 4) {
    return 'Ngày sinh không hợp lệ. Năm sinh phải có 4 chữ số và nằm trong khoảng 1900 – 2100.';
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) {
    return 'Ngày sinh không hợp lệ. Năm sinh phải nằm trong khoảng 1900 – 2100.';
  }
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return 'Ngày sinh không hợp lệ.';
  }
  return '';
}
