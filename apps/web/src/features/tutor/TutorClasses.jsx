import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import { timeLabel } from '../../data/tutorSchedule.js';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { TutorShell } from './TutorPages.jsx';
import './classes.css';

const money = (value) => Number.isFinite(value) ? `${new Intl.NumberFormat('vi-VN').format(value)}đ / buổi` : 'Chưa có học phí';
const dateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN') : 'Chưa có';
function classGroups(classes, lessons, requests) {
  return classes.filter((record) => requests.some((request) => request.id === record.requestId && request.status === 'accepted' && request.classId === record.id)).map((record) => {
    const ordered = lessons.filter((lesson) => lesson.classId === record.id || lesson.requestId === record.requestId)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
    const active = ordered.filter((lesson) => lesson.status !== 'cancelled');
    const status = ordered.length && !active.length ? 'cancelled' : active.length && active.every((lesson) => lesson.status === 'completed') ? 'completed' : active.some((lesson) => lesson.status === 'completed' || new Date(`${lesson.date}T23:59:59`) < new Date()) ? 'ongoing' : 'upcoming';
    return { id: record.id, requestId: record.requestId, record, lessons: ordered, first: ordered[0] || record, status, completed: active.filter((lesson) => lesson.status === 'completed').length, total: active.length };
  });
}
const statuses = { upcoming: ['Sắp bắt đầu', 'info'], ongoing: ['Đang diễn ra', 'warning'], completed: ['Đã hoàn thành', 'success'], cancelled: ['Đã hủy', 'danger'] };

export default function TutorClasses() {
  const { classes: classRecords, lessons, requests } = useTutorWorkspace();
  const classes = useMemo(() => classGroups(classRecords, lessons, requests), [classRecords, lessons, requests]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const visible = classes.filter((item) => (status === 'all' || item.status === status) && `${item.first.learner} ${item.first.subject}`.toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')));
  return <TutorShell title="Quản lý lớp học" subtitle="Các lớp hình thành sau khi gia sư và người học cùng xác nhận. Thông tin hiện được lưu trong trình duyệt.">
    <div className="tutor-classes__toolbar"><input type="search" aria-label="Tìm lớp học" placeholder="Tìm học viên hoặc chuyên môn" value={query} onChange={(event) => setQuery(event.target.value)}/><div className="flow-tabs">{[['all', 'Tất cả'], ...Object.entries(statuses).map(([key, [label]]) => [key, label])].map(([key, label]) => <button type="button" key={key} className={status === key ? 'is-active' : ''} onClick={() => setStatus(key)}>{label}</button>)}</div></div>
    <p role="status">{visible.length} lớp trong nhóm đang xem</p>
    <div className="flow-list">{visible.map((item) => <Link className="flow-row" key={item.id} to={`/tutor/classes/${encodeURIComponent(item.id)}`}><span><strong>{item.record.subject} · {item.record.learner}</strong><small>{dateLabel(item.first.date || item.record.startDate)} · {item.lessons.length ? `${timeLabel(item.first.start)}–${timeLabel(item.first.end)}` : 'Chưa có buổi học'} · {money(item.record.sessionFee)}</small></span><Badge tone={statuses[item.status][1]}>{statuses[item.status][0]}</Badge><ArrowRight size={17}/></Link>)}{!visible.length && <p className="empty-line">Chưa có lớp phù hợp.</p>}</div>
  </TutorShell>;
}

export function TutorClassDetail() {
  const { id } = useParams();
  const { classes, lessons, requests, profiles } = useTutorWorkspace();
  const item = classGroups(classes, lessons, requests).find((group) => group.id === id);
  const request = requests.find((entry) => entry.id === item?.requestId);
  const tutor = profiles.find((profile) => profile.id === item?.record.tutorId);
  if (!item) return <TutorShell title="Không tìm thấy lớp học" subtitle="Không có lớp phù hợp với mã này."><Link className="flow-back" to="/tutor/classes"><ArrowLeft size={17}/> Quay lại Quản lý lớp học</Link></TutorShell>;
  const progress = item.total ? Math.round(item.completed / item.total * 100) : 0;
  const durations = [...new Set(item.lessons.filter((lesson) => lesson.status !== 'cancelled').map((lesson) => lesson.end - lesson.start))];
  const durationLabel = durations.length === 1 ? `${durations[0]} phút / buổi` : durations.length ? 'Thay đổi theo từng buổi' : 'Chưa có buổi học';
  return <TutorShell title="Chi tiết lớp học" subtitle={`Mã lớp ${id} · thông tin lưu trong trình duyệt`}>
    <Link className="flow-back" to="/tutor/classes"><ArrowLeft size={17}/> Quay lại Quản lý lớp học</Link>
    <div className="tutor-class-detail-page">
      <section className="tutor-class-card tutor-class-card--overview" aria-label="Thông tin lớp">
        <Badge tone={statuses[item.status][1]}>{statuses[item.status][0]}</Badge><h2>{item.record.subject}</h2>
        <dl className="tutor-class-facts"><div><dt>Học viên</dt><dd>{item.record.learner || 'Chưa có tên'}</dd></div><div><dt>Gia sư</dt><dd>{tutor?.name || 'Chưa có tên'}</dd></div><div><dt>Hình thức học</dt><dd>{item.record.format || request?.format || request?.formats?.join(', ') || 'Chưa xác định'}</dd></div><div><dt>Ngày bắt đầu</dt><dd>{dateLabel(item.record.startDate)}</dd></div><div><dt>Học phí đã thống nhất</dt><dd>{money(item.record.sessionFee)}</dd></div><div><dt>Thời lượng</dt><dd>{durationLabel}</dd></div></dl>
      </section>
      <section className="tutor-class-card" aria-label="Tiến độ lớp"><h3>Tiến độ học</h3><div className="tutor-class-progress"><strong>{progress}%</strong><span>{item.completed} / {item.total} buổi hoàn thành</span></div><progress value={item.completed} max={item.total || 1} aria-label="Tiến độ buổi học"/><div className="tutor-class-totals"><span>Tổng số buổi <strong>{item.total}</strong></span><span>Đã hoàn thành <strong>{item.completed}</strong></span></div></section>
      <section className="tutor-class-card tutor-class-card--lessons"><h3>Lịch học và ghi chú giảng dạy</h3><ul className="tutor-class-lessons">{item.lessons.map((lesson) => <li key={lesson.id}><strong>{dateLabel(lesson.date)} · {timeLabel(lesson.start)}–{timeLabel(lesson.end)}</strong><span>{lesson.status === 'completed' ? 'Hoàn tất' : lesson.status === 'cancelled' ? 'Đã hủy' : 'Đã xác nhận'}</span><small>{lesson.end - lesson.start} phút</small><p>{lesson.notes || 'Chưa có ghi chú buổi học.'}</p></li>)}</ul></section>
      <aside className="tutor-class-card"><h3>Lịch sử hoạt động</h3><p>Chưa có lịch sử thay đổi chi tiết cho lớp này.</p><Link className="text-link" to="/tutor/timetable">Xem lịch dạy học</Link></aside>
    </div>
  </TutorShell>;
}
