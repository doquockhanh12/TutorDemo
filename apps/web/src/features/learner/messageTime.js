// Never infer a calendar date from a time-only fixture or a message ID.
export function messageTimestamp(message) {
  const value = message.timestamp || message.sentAt || message.createdAt;
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? value : null;
}

export function messageDayKey(value) {
  if (!value) return null;
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function messageDayLabel(value, now = new Date()) {
  if (messageDayKey(value) === messageDayKey(now)) return 'Hôm nay';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDayKey(value) === messageDayKey(yesterday)) return 'Hôm qua';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function messageClock(message) {
  const timestamp = messageTimestamp(message);
  if (timestamp) {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(message.time || '');
  if (match && Number(match[1]) < 24 && Number(match[2]) < 60) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return ''; // A relative label alone supplies neither a date nor a clock time.
}
