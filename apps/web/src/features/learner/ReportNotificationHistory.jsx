import { Fragment } from 'react';
import { CheckCheck } from 'lucide-react';
import { messageTimestamp, messageDayKey, messageDayLabel, messageClock } from './messageTime.js';

function notificationTitle(message) {
  if (message.kind === 'received') return 'Đã tiếp nhận báo cáo';
  if (message.kind === 'reviewing') return 'Đang xem xét';
  return 'Có kết quả xử lý';
}

export default function LearnerMessageHistory({ messages, notifications = false }) {
  return messages.map((message, index) => {
    const timestamp = messageTimestamp(message);
    const day = messageDayKey(timestamp);
    const previous = messages[index - 1];
    const previousDay = previous ? messageDayKey(messageTimestamp(previous)) : null;
    const startsDay = day && (index === 0 || day !== previousDay);
    const consecutive = previous && !startsDay && day === previousDay && previous.from === message.from;
    return (
    <Fragment key={message.id}>
      {startsDay && (
        <div className="learner-msg-date-divider learner-notification-day">
          <span>{messageDayLabel(timestamp)}</span>
        </div>
      )}
      <div className={`learner-msg-row learner-msg-row--${notifications ? 'them' : message.from} ${consecutive ? 'is-consecutive' : ''}`}>
        <article className={`learner-msg-bubble ${notifications ? 'learner-notification-bubble' : ''}`}>
          {notifications && <><h4>{notificationTitle(message)}</h4>
          <div className="learner-notification-meta">{message.reportId} · {message.tutorName}</div></>}
          {message.text && <p>{message.text}</p>}
          <time className="learner-msg-bubble__time" dateTime={timestamp || undefined} title={timestamp ? new Date(timestamp).toLocaleString('vi-VN') : undefined}>
            {messageClock(message)}
            {!notifications && message.from === 'me' && <CheckCheck size={13} aria-label="Đã gửi trong phiên mô phỏng" />}
          </time>
        </article>
      </div>
    </Fragment>
    );
  });
}
