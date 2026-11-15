import { useEffect, useLayoutEffect, useState } from 'react';
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
import useLearnerSchedule from './hooks/useLearnerSchedule.js';
import { dateKey, shortDate, monday, formatDate } from '../../services/learner/scheduleService.js';
import LearnerHeader from './LearnerHeader.jsx';
import './search.css';
import './learnerSchedule.css';

const weekDayColumns = [
  { key: '2', label: 'Thứ 2' },
  { key: '3', label: 'Thứ 3' },
  { key: '4', label: 'Thứ 4' },
  { key: '5', label: 'Thứ 5' },
  { key: '6', label: 'Thứ 6' },
  { key: '7', label: 'Thứ 7' },
  { key: 'cn', label: 'Chủ nhật' },
];

export default function LearnerSchedulePage() {
  const [now, setNow] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => monday(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const weekDays = weekDayColumns.map((column, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return { ...column, date, iso: dateKey(date) };
  });
  const shiftWeek = (offset) => setWeekStart((current) => {
    const next = new Date(current);
    next.setDate(next.getDate() + offset * 7);
    return next;
  });
  const { requests, tutors, lessons, upcomingLessons, completedLessons, ongoingLessons, fixedSchedules, weeklyCount, weekItems, resolveLesson, classIdForLesson, tutorForLesson } = useLearnerSchedule(now, weekDays);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);


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

      <main className="learner-container learner-schedule-page learner-schedule-view">
        <section className="learner-schedule-section learner-weekly-board-section" aria-labelledby="weekly-board-heading">
          <div className="learner-schedule-section__heading">
            <div>
              <h2 id="weekly-board-heading">Thời khóa biểu trong tuần (Thứ 2 – Chủ nhật)</h2>
            </div>
            <span className="learner-schedule-count">{weeklyCount} buổi trong tuần</span>
          </div>

          <div className="learner-week-controls">
            <span aria-live="polite">{shortDate(weekDays[0].date)}{weekDays[0].date.getFullYear() !== weekDays[6].date.getFullYear() ? `/${weekDays[0].date.getFullYear()}` : ''} – {shortDate(weekDays[6].date)}/{weekDays[6].date.getFullYear()}</span>
            <div>
              <button className="button button--secondary button--sm" type="button" aria-label="Xem tuần trước" onClick={() => shiftWeek(-1)}><ArrowLeft size={16} aria-hidden="true" /></button>
              <button className="button button--secondary button--sm" type="button" onClick={() => { const current = new Date(); setNow(current); setWeekStart(monday(current)); }}>Tuần hiện tại</button>
              <button className="button button--secondary button--sm" type="button" aria-label="Xem tuần sau" onClick={() => shiftWeek(1)}><ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          </div>

          <div className="learner-week-scroll" role="region" aria-label="Lịch học 7 ngày" tabIndex={0}><div className="learner-weekly-grid">
            {weekDays.map((col) => {
              const dayItems = weekItems[col.iso];
              return (
                <div key={col.key} aria-current={col.iso === dateKey(now) ? 'date' : undefined} className={`learner-weekly-day ${dayItems.length ? 'has-classes' : ''}`}>
                  <div className="learner-weekly-day__head">
                    <strong>{col.label} · {shortDate(col.date)}</strong>
                    {dayItems.length > 0 && <span>{dayItems.length} ca</span>}
                  </div>
                  <div className="learner-weekly-day__body">
                    {dayItems.length ? (
                      dayItems.map((slot) => (
                        <Link
                          key={slot.id}
                          to={`/learner/classes/${classIdForLesson(slot)}`}
                          state={{ from: '/learner/schedule', fromLabel: 'Thời khóa biểu' }}
                          className={`learner-weekly-slot ${slot.completed ? 'is-completed' : ''}`}
                        >
                          <span className="learner-weekly-slot__time">{slot.displayStart || 'Chưa rõ giờ'}{slot.displayEnd ? ` – ${slot.displayEnd}` : ''}</span>
                          <strong>{slot.subject}</strong>
                          <small>GV: {tutorForLesson(slot)?.name || 'Gia sư'}</small>
                        </Link>
                      ))
                    ) : (
                      <span className="learner-weekly-day__empty">Trống</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div></div>
        </section>

        <div className="learner-schedule-single-stack">
          {ongoingLessons.length > 0 && <ScheduleSection title="Buổi học đang diễn ra" count={ongoingLessons.length} items={ongoingLessons} tutors={tutors} requests={requests} resolveLesson={resolveLesson} now={now} ongoing />}
          {fixedSchedules.length > 0 && <ScheduleSection title="Lịch cố định chưa có buổi học theo ngày" count={fixedSchedules.length} items={fixedSchedules} tutors={tutors} requests={requests} resolveLesson={resolveLesson} />}
          <ScheduleSection
            title="Danh sách buổi học sắp tới"
            count={upcomingLessons.length}
            items={upcomingLessons}
            tutors={tutors}
            requests={requests} resolveLesson={resolveLesson}
            empty="Chưa có buổi học sắp tới."
          />

          <ScheduleSection
            title="Lịch sử các buổi đã học"
            count={completedLessons.length}
            items={completedLessons}
            tutors={tutors}
            requests={requests} resolveLesson={resolveLesson}
            empty="Các buổi học đã hoàn tất sẽ hiển thị tại đây."
          />
        </div>
      </main>
    </div>
  );
}

function ScheduleSection({ title, count, items, tutors, requests = [], empty, ongoing = false, now, resolveLesson }) {
  return (
    <section className="learner-schedule-section">
      <div className="learner-schedule-section__heading">
        <div>
          <h2>{title}</h2>
        </div>
        <span className="learner-schedule-count">{count} {items[0]?.fixedSchedule ? 'lịch lớp' : 'buổi'}</span>
      </div>

      {items.length ? (
        <div className="learner-schedule-list">
          {items.map((lesson) => {
            const { tutor, targetClassId, progress, elapsedMinutes, durationMinutes, remainingMinutes, ariaProgress } = resolveLesson(lesson, ongoing);
            return (
              <article className={`learner-schedule-item ${lesson.completed ? 'is-completed' : !lesson.fixedSchedule ? 'is-upcoming' : ''}${ongoing ? ' is-ongoing' : ''}`} key={lesson.id}>
                <div className="learner-schedule-item__top">
                  <div className="learner-schedule-item__date">
                    <CalendarDays size={19} aria-hidden="true" />
                    <strong>{lesson.fixedSchedule ? 'Lịch cố định hằng tuần' : formatDate(lesson.displayDate)}</strong>
                    <span className="learner-session-time">
                      <Clock3 size={14} aria-hidden="true" />
                      {lesson.displayDate
                        ? <><b>{lesson.displayStart || 'Chưa rõ giờ'}</b>{lesson.displayEnd && <small>– {lesson.displayEnd}</small>}</>
                        : lesson.fixedSchedule ? lesson.schedule || 'Chưa rõ lịch cố định' : 'Chưa rõ giờ học'}
                    </span>
                  </div>
                  <Badge tone={lesson.completed ? 'success' : 'brand'}>
                    {ongoing ? 'Đang diễn ra' : lesson.fixedSchedule ? lesson.completed ? 'Lớp đã hoàn thành' : 'Chưa có ngày buổi học' : lesson.completed ? 'Đã hoàn tất' : 'Sắp diễn ra'}
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
                    <Link
                      className="button button--secondary button--xs"
                      to={`/learner/classes/${targetClassId}`}
                      state={{ from: '/learner/schedule', fromLabel: 'Thời khóa biểu' }}
                    >
                      Vào lớp học <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {ongoing && (
                  <div className="learner-session-progress">
                    <div className="learner-session-progress__labels">
                      <span>Tiến độ thời gian · {elapsedMinutes}/{durationMinutes} phút</span>
                      <strong>{Math.floor(progress)}% · Còn {remainingMinutes} phút</strong>
                    </div>
                    <div className="learner-progress-bar" role="progressbar" aria-label={`Tiến độ thời gian buổi học ${lesson.subject}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={ariaProgress}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

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
