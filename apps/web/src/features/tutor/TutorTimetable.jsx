import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import Button from '../../components/Button.jsx';
import { TutorShell } from './TutorPages.jsx';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { firstFreeStart, isValidAvailability, localDateKey, shortDate, timeLabel, overlaps, weekDates } from '../../data/tutorSchedule.js';
import WeeklyTimeline from '../scheduling/WeeklyTimeline.jsx';
import TimeConfirmation from '../scheduling/TimeConfirmation.jsx';
import LessonDetailModal from './LessonDetailModal.jsx';
import './timetable.css';

const rangeSignature = (range) => `${range.id}:${range.tutorId}:${range.date}:${range.start}:${range.end}`;

export function TimetableBoard() {
  const { tutorId, availability, lessons, sessionMinutes, saveAvailability, completeLesson, saveLessonNotes } = useTutorWorkspace();
  const [offset, setOffset] = useState(0);
  const [draftRanges, setDraftRanges] = useState(availability);
  const [draftDuration, setDraftDuration] = useState(sessionMinutes);
  const [candidate, setCandidate] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState({ kind: '', text: '' });
  const dates = weekDates(offset);
  const visibleDates = new Set(dates.map(localDateKey));
  const tutorRanges = availability.filter((range) => range.tutorId === tutorId);
  const draftTutorRanges = draftRanges.filter((range) => range.tutorId === tutorId);
  const tutorLessons = lessons.filter((lesson) => lesson.tutorId === tutorId && lesson.status !== 'cancelled');
  const visibleRanges = draftTutorRanges.filter((range) => visibleDates.has(range.date));
  const visibleLessons = tutorLessons.filter((lesson) => visibleDates.has(lesson.date));
  const conflicts = visibleLessons.flatMap((lesson, index) => visibleLessons.slice(index + 1)
    .filter((other) => overlaps(lesson, other)).map((other) => [lesson, other]));
  const selected = tutorLessons.find((lesson) => lesson.id === selectedId);
  const unchanged = (range) => tutorRanges.some((saved) => rangeSignature(saved) === rangeSignature(range));
  const blocks = [
    ...visibleRanges.map((range) => ({ ...range, kind: 'availability', title: 'Lịch rảnh', draft: !unchanged(range) })),
    ...visibleLessons.map((lesson) => ({ ...lesson, kind: 'lesson', title: lesson.subject, subtitle: lesson.learner + (lesson.status === 'completed' ? ' · Hoàn tất' : ''), draft: false })),
  ];
  const dirty = draftDuration !== sessionMinutes || draftTutorRanges.length !== tutorRanges.length || draftTutorRanges.some((range) => !unchanged(range));

  useEffect(() => {
    if (dirty) return;
    setDraftRanges(availability);
    setDraftDuration(sessionMinutes);
  }, [availability, sessionMinutes, dirty]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const validate = (range, excludeId) => isValidAvailability({ ...range, tutorId: tutorId }, draftTutorRanges, tutorLessons, excludeId);
  const openDayAdd = (date, preferred) => {
    const start = firstFreeStart(date, draftDuration, draftTutorRanges, tutorLessons, preferred, tutorId);
    if (start === null) {
      setFeedback({ kind: 'error', text: `Không còn khoảng trống ${draftDuration} phút vào ${shortDate(date)}.` });
      return;
    }
    setCandidate({ tutorId, date, start, end: start + draftDuration });
    setFeedback({ kind: '', text: '' });
  };
  const openTimeAdd = ({ date, start }) => {
    setCandidate({ tutorId, date, start, end: start + draftDuration });
    setFeedback({ kind: '', text: '' });
  };
  const confirmAdd = (range) => {
    const next = { ...range, tutorId, id: `availability-${Date.now()}-${Math.random().toString(16).slice(2)}` };
    if (!validate(next)) return 'Khung giờ này trùng lịch hoặc nằm ngoài giới hạn cho phép.';
    setDraftRanges((current) => [...current, next]);
    setFeedback({ kind: 'draft', text: 'Đã thêm vào lịch nháp. Bấm Lưu lịch để áp dụng.' });
    return '';
  };
  const moveRange = (id, candidateRange) => {
    const next = { id, tutorId, date: candidateRange.date, start: candidateRange.start, end: candidateRange.end };
    if (!validate(next, id)) {
      setFeedback({ kind: 'error', text: 'Không thể di chuyển vì khung giờ mới trùng lịch hoặc không hợp lệ.' });
      return;
    }
    setDraftRanges((current) => current.map((range) => range.id === id ? next : range));
    setFeedback({ kind: 'draft', text: 'Đã di chuyển khung giờ trong lịch nháp. Bấm Lưu lịch để áp dụng.' });
  };
  const save = () => {
    const error = saveAvailability(draftRanges, draftDuration);
    if (error) { setFeedback({ kind: 'error', text: error }); return; }
    setFeedback({ kind: 'saved', text: 'Đã lưu lịch rảnh và thời lượng buổi học trong trình duyệt.' });
  };
  const cancelChanges = () => {
    setDraftRanges(availability);
    setDraftDuration(sessionMinutes);
    setCandidate(null);
    setFeedback({ kind: '', text: '' });
  };

  return <section className="teaching-timetable" aria-label="Thời khóa biểu lịch dạy và lịch rảnh">
    <div className="teaching-timetable__toolbar">
      <div className="teaching-timetable__week">
        <Button variant="secondary" size="sm" aria-label="Tuần trước" onClick={() => setOffset((value) => value - 1)}><ChevronLeft size={18}/></Button>
        <strong>Tuần: {dates[0].toLocaleDateString('vi-VN')} – {dates[6].toLocaleDateString('vi-VN')}</strong>
        <Button variant="secondary" size="sm" aria-label="Tuần sau" onClick={() => setOffset((value) => value + 1)}><ChevronRight size={18}/></Button>
        {offset !== 0 && <Button variant="quiet" size="sm" onClick={() => setOffset(0)}>Trở về hiện tại</Button>}
      </div>
      <label className="teaching-timetable__duration">Thời lượng mỗi buổi
        <select value={draftDuration} onChange={(event) => { setDraftDuration(Number(event.target.value)); setCandidate(null); setFeedback({ kind: 'draft', text: 'Thời lượng mới sẽ được lưu cùng lịch.' }); }}>
          <option value={45}>45 phút</option><option value={90}>90 phút</option>
        </select>
      </label>
    </div>
    <div className="teaching-timetable__legend"><span><i className="legend-unselected"/>Chưa chọn</span><span><i className="legend-available"/>Lịch rảnh</span><span><i className="legend-lesson"/>Lịch dạy</span><p>Mở chi tiết một giờ bằng dấu + ở trục giờ; chọn giờ để thêm nhanh, hoặc kéo khung rảnh để đổi ngày và giờ.</p></div>
    {dirty && <div className="teaching-timetable__save"><p role="status">Bạn có thay đổi lịch rảnh hoặc thời lượng chưa lưu.</p><div><Button variant="secondary" onClick={cancelChanges}>Hủy thay đổi</Button><Button onClick={save}><Save size={18}/>Lưu lịch</Button></div></div>}
    {feedback.text && <p className={`teaching-timetable__feedback teaching-timetable__feedback--${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.kind === 'saved' && <Check size={16}/>} {feedback.text}</p>}
    {!!conflicts.length && <div className="teaching-timetable__feedback teaching-timetable__feedback--error teaching-timetable__conflicts" role="alert">
      <strong>Trùng lịch trong dữ liệu đã lưu</strong>
      <p>Các lớp dưới đây có giờ trùng nhau và được hiển thị ở cột riêng. Ngày giờ được giữ nguyên; cần xác nhận lại lịch trước khi dạy.</p>
      <ul>{conflicts.map(([first, second]) => <li key={`${first.id}:${second.id}`}>
        {shortDate(first.date)}: {first.subject} · {first.learner} ({timeLabel(first.start)}–{timeLabel(first.end)}) / {second.subject} · {second.learner} ({timeLabel(second.start)}–{timeLabel(second.end)})
      </li>)}</ul>
    </div>}
    <WeeklyTimeline
      dates={dates}
      blocks={blocks}
      editable
      label="Lịch dạy và lịch rảnh của gia sư"
      onDayAdd={openDayAdd}
      onTimeClick={openTimeAdd}
      onMove={moveRange}
      onDelete={(id) => { setDraftRanges((current) => current.filter((range) => range.id !== id)); setFeedback({ kind: 'draft', text: 'Đã xóa khỏi lịch nháp. Bấm Lưu lịch để áp dụng.' }); }}
      onBlockClick={(block) => { if (block.kind === 'lesson') setSelectedId(block.id); }}
      isRangeAllowed={validate}
    />
    {selected && <LessonDetailModal key={selected.id} lesson={selected} onClose={() => setSelectedId(null)} onSaveNotes={saveLessonNotes} onComplete={completeLesson}/>}
    <p className="teaching-timetable__note">Timeline hiển thị 06:00–24:00; lịch rảnh và buổi học dùng ngày cùng giờ bắt đầu và kết thúc. Dữ liệu được mô phỏng trong prototype.</p>
    {candidate && <TimeConfirmation candidate={candidate} duration={draftDuration} title="Thêm lịch rảnh" action="Thêm vào lịch nháp" onClose={() => setCandidate(null)} onConfirm={confirmAdd}/>}
  </section>;
}

export default function TutorTimetable() {
  return <TutorShell title="Lịch dạy học" subtitle="Xem buổi dạy và quản lý lịch rảnh từ 06:00 đến 24:00."><TimetableBoard/></TutorShell>;
}
