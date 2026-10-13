import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import useDemoDomain, { useLearnerRequests } from '../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import './search.css';
import './learnerSchedule.css';

function scheduleDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = scheduleDate(value);
  return date ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date) : 'Chưa có ngày cụ thể';
}

function formatEndTime(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  return value || '';
}

export default function LearnerSchedulePage() {
  const [requests] = useLearnerRequests();
  const { user } = useDemoAuth();
  const { lessons: allLessons } = useDemoDomain();
  const tutors = useScheduledTutors();
  const requestsById = new Map(requests.map((request) => [request.id, request]));
  const ownedLessons = allLessons.filter((lesson) => (lesson.learnerId === user?.id || requestsById.has(lesson.requestId)) && lesson.status !== 'cancelled');
  const linkedRequestIds = new Set(ownedLessons.map((lesson) => lesson.requestId).filter(Boolean));
  const lessons = [
    ...ownedLessons.filter((lesson) => ['confirmed', 'completed'].includes(lesson.status)).map((lesson) => {
      const request = requestsById.get(lesson.requestId);
      return { ...lesson, subject: lesson.subject || request?.subject || 'Buổi học', displayDate: lesson.date, displayStart: formatEndTime(lesson.start), displayEnd: formatEndTime(lesson.end), completed: lesson.status === 'completed', requestId: request?.id || lesson.requestId };
    }),
    ...requests.filter((request) => request.completed && !linkedRequestIds.has(request.id)).map((request) => ({
      id: `legacy-${request.id}`, requestId: request.id, subject: request.subject, tutorId: request.tutorId,
      schedule: request.schedule, completed: true, displayDate: null, displayStart: '', displayEnd: '',
    })),
  ].map((lesson) => ({ ...lesson, dateObject: scheduleDate(lesson.displayDate) }))
    .sort((a, b) => {
      if (!a.dateObject) return b.dateObject ? 1 : 0;
      if (!b.dateObject) return -1;
      return a.dateObject - b.dateObject || a.displayStart.localeCompare(b.displayStart);
    });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = lessons.filter((lesson) => !lesson.completed && lesson.dateObject && lesson.dateObject >= today);
  const past = lessons.filter((lesson) => lesson.completed || (lesson.dateObject && lesson.dateObject < today) || !lesson.dateObject)
    .sort((a, b) => !a.dateObject ? 1 : !b.dateObject ? -1 : b.dateObject - a.dateObject);
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return <div className="public-page public-page--learner learner-search-page density-comfortable">
    <LearnerHeader />
    <main className="learner-container learner-schedule-page">
      <Link className="flow-back" to="/learner/dashboard"><ArrowLeft size={17} /> Trở về không gian người học</Link>
      <header className="learner-schedule-heading"><span className="eyebrow">KẾ HOẠCH HỌC TẬP</span><h1>Lịch học của bạn</h1><p>Các buổi đã chốt ngày và giờ sau khi bạn xác nhận với gia sư.</p></header>
      <ScheduleSection title="Sắp tới" count={upcoming.length} items={upcoming} tutors={tutors} empty="Chưa có buổi học sắp tới được xác nhận." />
      <ScheduleSection title="Lịch sử buổi học" count={past.length} items={past} tutors={tutors} empty="Buổi học đã hoàn tất sẽ xuất hiện tại đây." />
      <p className="learner-schedule-note">Lịch cụ thể lấy từ các buổi học đã lưu. Yêu cầu mẫu cũ chưa có ngày chính xác được ghi chú riêng, không tự suy ra ngày từ thứ trong tuần.</p>
    </main>
  </div>;
}

function ScheduleSection({ title, count, items, tutors, empty }) {
  return <section className="learner-schedule-section"><div className="learner-schedule-section__heading"><h2>{title}</h2><span>{count}</span></div>
    {items.length ? <div className="learner-schedule-list">{items.map((request) => {
      const tutor = tutors.find((item) => item.id === request.tutorId);
      return <article className="learner-schedule-item" key={request.id}>
        <div className="learner-schedule-item__date"><CalendarDays size={20} /><strong>{request.displayDate ? formatDate(request.displayDate) : 'Ngày cụ thể chưa được lưu'}</strong></div>
        <div className="learner-schedule-item__details"><h3>{request.subject}</h3><p>{tutor?.name || 'Gia sư'}</p><span><Clock3 size={15} />{request.displayDate ? `${request.displayStart}${request.displayEnd ? `–${request.displayEnd}` : ''}` : request.schedule || 'Chưa lưu giờ học'}</span></div>
        <Badge tone={request.completed ? 'success' : 'info'}>{request.completed ? 'Đã hoàn tất' : 'Đã xác nhận'}</Badge>
      </article>;
    })}</div> : <div className="learner-schedule-empty"><CalendarDays size={25} /><p>{empty}</p><Link to="/requests">Xem yêu cầu học</Link></div>}
  </section>;
}
