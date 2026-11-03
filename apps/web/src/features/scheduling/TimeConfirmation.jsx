import { useMemo, useState } from 'react';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import { shortDate, timeLabel } from '../../data/tutorSchedule.js';

const parse24HourTime = (value, allowEnd = false) => {
  if (allowEnd && value.trim() === '24:00') return 1440;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

export default function TimeConfirmation({ candidate, duration, title, action, onClose, onConfirm }) {
  const [startText, setStartText] = useState(() => timeLabel(candidate.start));
  const [endText, setEndText] = useState(() => timeLabel(candidate.end ?? candidate.start + duration));
  const [error, setError] = useState('');
  const ref = useDialogFocus(onClose);
  const start = useMemo(() => parse24HourTime(startText), [startText]);
  const end = useMemo(() => parse24HourTime(endText, true), [endText]);

  const confirm = () => {
    if (start === null || end === null || start >= end) {
      setError('Nhập giờ HH:mm hợp lệ, bắt đầu trước kết thúc (có thể kết thúc lúc 24:00).');
      return;
    }
    const failure = onConfirm({ ...candidate, start, end });
    if (failure) setError(failure);
    else onClose();
  };

  return <div className="schedule-confirm-overlay"><section ref={ref} className="schedule-confirm" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="schedule-confirm-title">
    <h3 id="schedule-confirm-title">{title}</h3><p>{shortDate(candidate.date)} · chọn khoảng giờ phù hợp</p>
    <label>Giờ bắt đầu<input className="schedule-confirm-time-input" type="text" inputMode="numeric" autoComplete="off" maxLength={5} placeholder="HH:mm" value={startText} onChange={(event) => { setStartText(event.target.value); setError(''); }} aria-label="Giờ bắt đầu theo định dạng 24 giờ" /></label>
    <label>Giờ kết thúc<input className="schedule-confirm-time-input" type="text" inputMode="numeric" autoComplete="off" maxLength={5} placeholder="HH:mm" value={endText} onChange={(event) => { setEndText(event.target.value); setError(''); }} aria-label="Giờ kết thúc theo định dạng 24 giờ" /></label>
    {error && <p className="schedule-error" role="alert">{error}</p>}
    <div><button className="button button--secondary button--sm" type="button" onClick={onClose}>Hủy</button><button className="button button--primary button--sm" type="button" onClick={confirm}>{action}</button></div>
  </section></div>;
}
