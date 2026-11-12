import { useLayoutEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import useDemoDomain, { useLearnerRequests } from '../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import './search.css';
import './learnerSchedule.css';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);

const weekDayColumns = [
  { key: '2', label: 'Thứ 2' },
  { key: '3', label: 'Thứ 3' },
  { key: '4', label: 'Thứ 4' },
  { key: '5', label: 'Thứ 5' },
  { key: '6', label: 'Thứ 6' },
  { key: '7', label: 'Thứ 7' },
  { key: 'cn', label: 'Chủ nhật' },
];

function scheduleDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = scheduleDate(value);
  return date
    ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : 'Lịch cố định hằng tuần';
}

function formatTime(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }
  return value || '';
}

function detectWeekdayKey(scheduleStr = '', dateStr = '') {
  if (dateStr) {
    const d = scheduleDate(dateStr);
    if (d) {
      const day = d.getDay();
      return day === 0 ? 'cn' : String(day + 1);
    }
  }
  const s = scheduleStr.toLocaleLowerCase('vi-VN');
  if (s.includes('chủ nhật') || s.includes('cn')) return 'cn';
  for (const num of ['2', '3', '4', '5', '6', '7']) {
    if (s.includes(`thứ ${num}`) || s.includes(`t${num}`)) return num;
  }
  return '7';
}

export default function LearnerSchedulePage() {
  const [rawRequests] = useLearnerRequests();
  const { user } = useDemoAuth();
  const { lessons: allLessons } = useDemoDomain();
  const tutors = useScheduledTutors();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const requests = useMemo(() => {
    const list = [...rawRequests];
    if (user?.id === 'demo-learner' && !list.some((r) => r.status === 'accepted' && !r.completed)) {
      list.unshift({
        id: 'demo-02',
        tutorId: 'quoc-bao',
        subject: 'Tiếng Anh',
        goal: 'Luyện giao tiếp & phát âm phản xạ',
        schedule: 'Thứ 7 · 09:00',
        format: 'Online / Tại nhà',
        sessionFee: 220000,
        status: 'accepted',
        completed: false,
      });
    }
    return list;
  }, [rawRequests, user]);

  const requestsById = useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests]);

  const ownedLessons = useMemo(() => {
    return allLessons.filter(
      (lesson) => (lesson.learnerId === user?.id || requestsById.has(lesson.requestId) || lesson.learner === user?.fullName)
        && lesson.status !== 'cancelled'
    );
  }, [allLessons, user, requestsById]);

  const linkedRequestIds = useMemo(
    () => new Set(ownedLessons.map((l) => l.requestId).filter(Boolean)),
    [ownedLessons]
  );

  const lessons = useMemo(() => {
    const mappedOwned = ownedLessons
      .filter((lesson) => ['confirmed', 'upcoming', 'completed'].includes(lesson.status))
      .map((lesson) => {
        const req = requestsById.get(lesson.requestId);
        return {
          ...lesson,
          subject: lesson.subject || req?.subject || 'Buổi học',
          displayDate: lesson.date,
          displayStart: formatTime(lesson.start),
          displayEnd: formatTime(lesson.end),
          completed: lesson.status === 'completed',
          requestId: req?.id || lesson.requestId,
          weekdayKey: detectWeekdayKey('', lesson.date),
          notes: lesson.notes || (lesson.status === 'completed'
            ? 'Hoàn thành nội dung cốt lõi, học viên nắm vững lý thuyết và làm tốt bài tập vận dụng.'
            : 'Chuẩn bị đề cương trước giờ học.'),
        };
      });

    const mappedAcceptedRequests = requests
      .filter((req) => req.status === 'accepted' && !linkedRequestIds.has(req.id))
      .map((req) => ({
        id: `class-${req.id}`,
        requestId: req.id,
        subject: req.subject,
        tutorId: req.tutorId,
        schedule: req.schedule,
        format: req.format || 'Online / Tại nhà',
        sessionFee: req.sessionFee,
        completed: Boolean(req.completed),
        displayDate: null,
        displayStart: '',
        displayEnd: '',
        weekdayKey: detectWeekdayKey(req.schedule, ''),
        notes: req.completed
          ? 'Đã hoàn thành đầy đủ nội dung chương trình học.'
          : `Lịch học cố định hằng tuần: ${req.schedule}.`,
      }));

    return [...mappedOwned, ...mappedAcceptedRequests];
  }, [ownedLessons, requests, linkedRequestIds, requestsById]);

  const upcomingLessons = useMemo(
    () => lessons.filter((l) => !l.completed),
    [lessons]
  );

  const completedLessons = useMemo(
    () => lessons.filter((l) => l.completed),
    [lessons]
  );

  const weeklySlots = useMemo(() => {
    const accepted = requests.filter((r) => r.status === 'accepted');
    return accepted.map((req) => {
      const tutor = tutors.find((t) => t.id === req.tutorId);
      return {
        id: req.id,
        subject: req.subject,
        tutorName: tutor?.name || 'Gia sư',
        schedule: req.schedule || 'Thứ 7 · 09:00',
        completed: Boolean(req.completed),
        weekdayKey: detectWeekdayKey(req.schedule, ''),
      };
    });
  }, [requests, tutors]);

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader compact />

      <section className="learner-page-banner">
        <div className="learner-container">
          <div className="learner-page-banner__row">
            <div>
              <h1>Thời khóa biểu của bạn</h1>
              <p>Theo dõi lịch học cố định các ngày trong tuần và lịch sử những buổi học đã hoàn thành.</p>
            </div>
            <div className="learner-request-quick-links">
              <Link className="button button--secondary button--sm" to="/learner/classes">
                <BookOpen size={16} aria-hidden="true" /> Lớp học của tôi
              </Link>
              <Link className="button button--primary button--sm" to="/learner/search">
                Tìm gia sư mới
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="learner-container learner-schedule-page">
        <section className="learner-schedule-section learner-weekly-board-section" aria-labelledby="weekly-board-heading">
          <div className="learner-schedule-section__heading">
            <div>
              <h2 id="weekly-board-heading">Thời khóa biểu trong tuần (Thứ 2 – Chủ nhật)</h2>
            </div>
            <span className="learner-schedule-count">{weeklySlots.length} ca học / tuần</span>
          </div>

          <div className="learner-weekly-grid">
            {weekDayColumns.map((col) => {
              const dayItems = weeklySlots.filter((slot) => slot.weekdayKey === col.key);
              return (
                <div key={col.key} className={`learner-weekly-day ${dayItems.length ? 'has-classes' : ''}`}>
                  <div className="learner-weekly-day__head">
                    <strong>{col.label}</strong>
                    {dayItems.length > 0 && <span>{dayItems.length} ca</span>}
                  </div>
                  <div className="learner-weekly-day__body">
                    {dayItems.length ? (
                      dayItems.map((slot) => (
                        <Link
                          key={slot.id}
                          to={`/learner/classes/${slot.id}`}
                          state={{ from: '/learner/schedule', fromLabel: 'Thời khóa biểu' }}
                          className={`learner-weekly-slot ${slot.completed ? 'is-completed' : ''}`}
                        >
                          <span className="learner-weekly-slot__time">{slot.schedule}</span>
                          <strong>{slot.subject}</strong>
                          <small>GV: {slot.tutorName}</small>
                        </Link>
                      ))
                    ) : (
                      <span className="learner-weekly-day__empty">Trống</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="learner-schedule-single-stack">
          <ScheduleSection
            title="Danh sách buổi học sắp tới"
            count={upcomingLessons.length}
            items={upcomingLessons}
            tutors={tutors}
            requests={requests}
            empty="Chưa có buổi học sắp tới."
          />

          <ScheduleSection
            title="Lịch sử các buổi đã học"
            count={completedLessons.length}
            items={completedLessons}
            tutors={tutors}
            requests={requests}
            empty="Các buổi học đã hoàn tất sẽ hiển thị tại đây."
          />
        </div>
      </main>
    </div>
  );
}

function ScheduleSection({ title, count, items, tutors, requests = [], empty }) {
  return (
    <section className="learner-schedule-section">
      <div className="learner-schedule-section__heading">
        <div>
          <h2>{title}</h2>
        </div>
        <span className="learner-schedule-count">{count} buổi</span>
      </div>

      {items.length ? (
        <div className="learner-schedule-list">
          {items.map((lesson) => {
            const tutor = tutors.find((item) => item.id === lesson.tutorId);
            const targetClassId = lesson.requestId || requests.find((r) => r.tutorId === lesson.tutorId)?.id || 'demo-02';
            return (
              <article className={`learner-schedule-item ${lesson.completed ? 'is-completed' : 'is-upcoming'}`} key={lesson.id}>
                <div className="learner-schedule-item__top">
                  <div className="learner-schedule-item__date">
                    <CalendarDays size={19} aria-hidden="true" />
                    <strong>{formatDate(lesson.displayDate)}</strong>
                    <span>
                      <Clock3 size={14} aria-hidden="true" />
                      {lesson.displayDate
                        ? `${lesson.displayStart}${lesson.displayEnd ? ` – ${lesson.displayEnd}` : ''}`
                        : lesson.schedule || 'Theo lịch tuần'}
                    </span>
                  </div>
                  <Badge tone={lesson.completed ? 'success' : 'brand'}>
                    {lesson.completed ? 'Đã hoàn tất' : 'Sắp diễn ra'}
                  </Badge>
                </div>

                <div className="learner-schedule-item__body">
                  <div>
                    <h3>{lesson.subject} {lesson.level ? `· ${lesson.level}` : ''}</h3>
                    <p className="learner-schedule-item__tutor">
                      Gia sư: <Link to={`/tutors/${lesson.tutorId}`}><strong>{tutor?.name || 'Trần Gia Bảo'}</strong></Link>
                      {lesson.format && <span> · Hình thức: <strong>{lesson.format}</strong></span>}
                    </p>
                  </div>
                  <div className="learner-schedule-item__right">
                    {lesson.sessionFee && (
                      <div className="learner-schedule-item__fee">
                        <strong>{money(lesson.sessionFee)}đ</strong>
                        <small>/ buổi</small>
                      </div>
                    )}
                    <Link
                      className="button button--secondary button--xs"
                      to={`/learner/classes/${targetClassId}`}
                      state={{ from: '/learner/schedule', fromLabel: 'Thời khóa biểu' }}
                    >
                      Vào bài học <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {lesson.notes && (
                  <div className="learner-schedule-item__notes">
                    <FileText size={15} aria-hidden="true" />
                    <p><strong>Ghi chú buổi học:</strong> {lesson.notes}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="learner-schedule-empty">
          <CalendarDays size={26} aria-hidden="true" />
          <p>{empty}</p>
          <Link className="button button--secondary button--sm" to="/learner/classes">Xem lớp học của tôi</Link>
        </div>
      )}
    </section>
  );
}
