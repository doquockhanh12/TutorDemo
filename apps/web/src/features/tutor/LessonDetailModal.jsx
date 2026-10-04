import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import Button from '../../components/Button.jsx';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import { shortDate, timeLabel } from '../../data/tutorSchedule.js';
import { canCompleteLesson } from '../domain/demoDomain.js';

const statuses = { confirmed: 'Đã xác nhận', upcoming: 'Sắp diễn ra', pending: 'Chờ xác nhận', completed: 'Hoàn tất', cancelled: 'Đã hủy' };

export default function LessonDetailModal({ lesson, onClose, onSaveNotes, onComplete }) {
  const ref = useDialogFocus(onClose);
  const [notes, setNotes] = useState(lesson.notes || '');
  const [message, setMessage] = useState('');
  const saveNotes = () => {
    onSaveNotes(lesson.id, notes);
    setMessage('Đã lưu ghi chú.');
  };
  const complete = () => {
    if (!canCompleteLesson(lesson)) return;
    onSaveNotes(lesson.id, notes);
    onComplete(lesson.id);
    setMessage('Đã đánh dấu hoàn tất và lưu ghi chú.');
  };

  return createPortal(<div className="lesson-detail-overlay">
    <section ref={ref} className="lesson-detail-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-detail-title" tabIndex={-1}>
      <header><div><p>BUỔI DẠY</p><h2 id="lesson-detail-title">Chi tiết lớp học</h2></div><Button variant="quiet" size="sm" aria-label="Đóng chi tiết lớp học" onClick={onClose}><X size={20}/></Button></header>
      <dl>
        <div><dt>Môn học</dt><dd>{lesson.subject}</dd></div>
        <div><dt>Người học</dt><dd>{lesson.learner}</dd></div>
        <div><dt>Thời gian</dt><dd>{shortDate(lesson.date)}/{lesson.date.slice(0, 4)}<br/>{timeLabel(lesson.start)}–{timeLabel(lesson.end)}</dd></div>
        <div><dt>Địa điểm</dt><dd>{lesson.place || 'Chưa có địa điểm'}</dd></div>
        <div><dt>Học phí</dt><dd>{Number.isFinite(lesson.sessionFee) ? `${new Intl.NumberFormat('vi-VN').format(lesson.sessionFee)}đ / buổi` : 'Chưa có học phí của buổi học'}</dd></div>
        <div><dt>Trạng thái</dt><dd>{lesson.status === 'completed' && <Check size={16} aria-hidden="true"/>}{statuses[lesson.status] || lesson.status}</dd></div>
      </dl>
      {lesson.status === 'completed' && <p className="lesson-detail-feedback">{Number.isFinite(lesson.sessionFee)
        ? `Buổi học này được tính vào thu nhập tháng ${lesson.date.slice(5, 7)}/${lesson.date.slice(0, 4)} theo ngày học.`
        : 'Buổi học chưa được tính vào thu nhập vì chưa có học phí. Không lấy mức phí hiện tại của hồ sơ thay thế.'}</p>}
      <label className="lesson-detail-notes" htmlFor="lesson-notes">Ghi chú cho lớp học<textarea id="lesson-notes" rows={4} value={notes} onChange={(event) => { setNotes(event.target.value); setMessage(''); }} placeholder="Nội dung đã học, bài tập hoặc lưu ý cho buổi sau…"/></label>
      {message && <p className="lesson-detail-feedback" role="status">{message}</p>}
      <footer><Button variant="secondary" onClick={saveNotes} disabled={notes === (lesson.notes || '')}>Lưu ghi chú</Button>{canCompleteLesson(lesson) && <Button onClick={complete}><Check size={17}/>Đánh dấu hoàn tất</Button>}</footer>
    </section>
  </div>, document.body);
}
