import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { CANONICAL_TUTOR_ID, getBookableRanges, localDateKey, rangesOverlapPeriod, timeLabel, weekDates } from '../../data/tutorSchedule.js';
import { scheduleDays } from '../../data/tutorDashboardReference.js';

const dashboardPeriods = [
  { id: 'morning', label: 'Sáng', time: '06:00–12:00' },
  { id: 'afternoon', label: 'Chiều', time: '12:00–17:00' },
  { id: 'evening', label: 'Tối', time: '17:00–24:00' },
];
const periodRanges = [[360, 720], [720, 1020], [1020, 1440]];

export default function TutorScheduleChecks() {
  const { availability, lessons } = useTutorWorkspace();
  const dates = weekDates();
  const tutorAvailability = getBookableRanges(availability, lessons, CANONICAL_TUTOR_ID);
  const tutorLessons = lessons.filter((lesson) => lesson.tutorId === CANONICAL_TUTOR_ID && lesson.status !== 'cancelled');
  const dateKeys = new Set(dates.map(localDateKey));
  const upcoming = tutorLessons.filter((lesson) => dateKeys.has(lesson.date));

  return <section className="reference-panel reference-calendar" id="teaching-calendar" aria-labelledby="teaching-title">
    <div className="reference-panel__heading"><h2 id="teaching-title">Lịch dạy học</h2><Link to="/tutor/timetable">Chỉnh sửa lịch <ArrowRight size={14}/></Link></div>
    <div className="reference-calendar__scroll"><table className="reference-check-table">
      <caption className="sr-only">Tổng quan lịch rảnh đã lưu và buổi dạy theo ngày và buổi trong tuần.</caption>
      <thead><tr><th scope="col"><span className="sr-only">Buổi</span></th>{scheduleDays.map((day) => <th scope="col" key={day}>{day}</th>)}</tr></thead>
      <tbody>{dashboardPeriods.map((period, periodIndex) => <tr key={period.id}><th scope="row">{period.label}<small>{period.time}</small></th>{dates.map((date, index) => {
        const dateKey = localDateKey(date);
        const [start, end] = periodRanges[periodIndex];
        const available = rangesOverlapPeriod(tutorAvailability, dateKey, start, end);
        const booked = rangesOverlapPeriod(tutorLessons, dateKey, start, end);
        return <td key={dateKey}><Link className="reference-check-target" to="/tutor/timetable" aria-label={`${period.label} ${scheduleDays[index]}, ${available ? 'có lịch rảnh' : 'chưa có lịch rảnh'}${booked ? ', có buổi dạy' : ''}`}><input type="checkbox" checked={available} disabled aria-hidden="true" tabIndex={-1}/>{booked && <span className="reference-check-booked" aria-hidden="true"/>}</Link></td>;
      })}</tr>)}</tbody>
    </table></div>
    <div className="reference-calendar__legend"><span><i className="reference-legend-check"/>Có lịch rảnh</span><span><i className="reference-legend-booked"/>Có buổi học</span></div>
    <p className="reference-calendar__help">Lịch rảnh đã lưu dùng ngày và khoảng giờ cụ thể. Mở thời khóa biểu để chỉnh sửa.</p>
    <div className="reference-calendar__lesson"><h3>Buổi dạy trong tuần ({upcoming.length})</h3>{upcoming.slice(0, 3).map((lesson) => <p key={lesson.id}><strong>{lesson.subject}</strong><br/>{lesson.date.split('-').reverse().join('/')} · {timeLabel(lesson.start)}–{timeLabel(lesson.end)}</p>)}{!upcoming.length && <p>Chưa có buổi dạy trong tuần.</p>}</div>
    <Link className="reference-calendar__all" to="/tutor/timetable">Xem toàn bộ thời khóa biểu <ArrowRight size={14}/></Link>
  </section>;
}
