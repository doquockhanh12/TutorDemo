import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Target,
  Trash2,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import { demoReferenceData } from '../../data/demoReferenceData.js';
import { timeLabel } from '../../data/tutorSchedule.js';
import { BIRTH_DATE_MAX, BIRTH_DATE_MIN, clampBirthDateInput, validateBirthDate } from '../auth/authUtils.js';
import useTutorMessagesState from './TutorMessagesState.jsx';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { TutorShell } from './TutorPages.jsx';
import './classes.css';

const money = (value) =>
  Number.isFinite(value)
    ? `${new Intl.NumberFormat('vi-VN').format(value)}đ / buổi`
    : 'Chưa có học phí';

const dateLabel = (value) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN') : 'Chưa có';

const fullDateLabel = (value) => {
  if (!value) return 'Chưa có ngày';
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  const weekday = parsed.toLocaleDateString('vi-VN', { weekday: 'short' });
  const formatted = parsed.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${weekday}, ${formatted}`;
};

const seedRequestsById = new Map(
  (demoReferenceData.requests || []).map((item) => [item.id, item])
);

const fallbackPhonesById = {
  'demo-02': '0900 000 001',
  'req-1': '0903 128 456',
  'req-2': '0908 234 567',
  'req-3': '0912 345 678',
  'ref-1': '0987 654 321',
  'ref-2': '0978 123 456',
  'ref-3': '0965 432 109',
};

const fallbackGradeById = {
  'demo-02': 'Lớp 9 · THCS',
  'req-1': 'Lớp 8 · THCS',
  'req-2': 'Lớp 10 · THPT',
  'req-3': 'Lớp 9 · THCS',
  'ref-1': 'Lớp 9 · THCS',
  'ref-2': 'Lớp 7 · THCS',
  'ref-3': 'Lớp 11 · THPT',
};

const fallbackAreaById = {
  'demo-02': 'Thủ Đức, TP.HCM',
};

function inferGradeLevel(subject = '', learner = '', request = {}) {
  if (request.level) return request.level;
  if (Array.isArray(request.levels) && request.levels.length) {
    return request.levels.join(', ');
  }
  const combined = `${subject} ${learner}`;
  const gradeMatch = /lớp\s*(\d+)/i.exec(combined);
  if (gradeMatch) {
    const grade = Number(gradeMatch[1]);
    const stage = grade <= 5 ? 'Tiểu học' : grade <= 9 ? 'THCS' : 'THPT';
    return `Lớp ${grade} · ${stage}`;
  }
  if (/ielts|toeic|sat/i.test(combined)) return 'Luyện thi chứng chỉ';
  return fallbackGradeById[request.id] || 'THCS / THPT';
}

export const classStatusMeta = {
  ongoing: ['Đang học', 'info'],
  upcoming: ['Sắp bắt đầu', 'warning'],
  completed: ['Hoàn thành', 'success'],
  cancelled: ['Đã hủy', 'danger'],
};

export const attendanceStatusMeta = {
  completed: ['Đã dạy', 'success'],
  upcoming: ['Sắp tới', 'info'],
  confirmed: ['Sắp tới', 'info'],
  cancelled: ['Nghỉ', 'danger'],
};

function parseTimeInput(value, fallbackMinutes) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim());
  if (!match) return fallbackMinutes;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function buildTutorClasses(classes = [], lessons = [], requests = [], users = []) {
  const userById = new Map((users || []).map((u) => [u.id, u]));
  const userByName = new Map(
    (users || [])
      .filter((u) => u.fullName)
      .map((u) => [u.fullName.toLocaleLowerCase('vi-VN'), u])
  );

  const acceptedRequests = (requests || []).filter((req) => req.status === 'accepted');
  const handledRequestIds = new Set();
  const rawRecords = [];

  for (const record of classes || []) {
    const linkedRequest = (requests || []).find(
      (req) => req.id === record.requestId || req.classId === record.id || req.id === record.id
    );
    if (linkedRequest && linkedRequest.status !== 'accepted') continue;
    if (linkedRequest) handledRequestIds.add(linkedRequest.id);
    rawRecords.push({ record, request: linkedRequest || seedRequestsById.get(record.requestId) || null });
  }

  for (const request of acceptedRequests) {
    if (handledRequestIds.has(request.id)) continue;
    const seed = seedRequestsById.get(request.id) || {};
    const classId = request.classId || request.id;
    rawRecords.push({
      record: {
        id: classId,
        requestId: request.id,
        tutorId: request.tutorId,
        learnerId: request.learnerId ?? seed.learnerId ?? null,
        learner: request.learner || seed.learner || 'Học viên',
        subject: request.subject || seed.subject || 'Môn học',
        format: request.format || request.formats?.join(', ') || seed.format || 'Online',
        sessionFee: request.sessionFee ?? seed.sessionFee ?? null,
        startDate: request.proposals?.[0]?.date || (request.createdAt ? String(request.createdAt).slice(0, 10) : null),
        classStatus: request.classStatus || null,
        tutorNotes: request.tutorNotes || '',
        tutorNotesUpdatedAt: request.tutorNotesUpdatedAt || null,
      },
      request: { ...seed, ...request },
    });
  }

  return rawRecords.map(({ record, request }) => {
    const seed = seedRequestsById.get(record.requestId || record.id) || {};
    const mergedRequest = { ...seed, ...(request || {}) };

    let matchedLessons = (lessons || []).filter(
      (lesson) =>
        lesson.classId === record.id ||
        lesson.requestId === record.requestId ||
        lesson.requestId === record.id
    );

    // If an accepted seed request like demo-02 has no lessons with requestId yet,
    // link matching tutor+learner+subject historical lessons so session logs are populated.
    if (!matchedLessons.length && (record.id === 'demo-02' || record.requestId === 'demo-02')) {
      matchedLessons = (lessons || []).filter(
        (lesson) =>
          !lesson.requestId &&
          !lesson.classId &&
          lesson.learnerId === 'demo-learner' &&
          lesson.subject === (record.subject || mergedRequest.subject)
      );
    }

    const ordered = [...matchedLessons].sort(
      (a, b) => (a.date || '').localeCompare(b.date || '') || (a.start || 0) - (b.start || 0)
    );
    const totalSessions = ordered.length;
    const completedCount = ordered.filter((lesson) => lesson.status === 'completed').length;
    const absentCount = ordered.filter((lesson) => lesson.status === 'cancelled').length;
    const upcomingCount = ordered.filter(
      (lesson) => lesson.status !== 'completed' && lesson.status !== 'cancelled'
    ).length;

    const explicitStatus = record.classStatus || mergedRequest.classStatus;
    const derivedStatus =
      explicitStatus === 'cancelled'
        ? 'cancelled'
        : explicitStatus === 'completed'
          ? 'completed'
          : 'ongoing';

    const learnerName = record.learner || mergedRequest.learner || 'Học viên';
    const learnerUser =
      (record.learnerId && userById.get(record.learnerId)) ||
      (mergedRequest.learnerId && userById.get(mergedRequest.learnerId)) ||
      userByName.get(learnerName.toLocaleLowerCase('vi-VN')) ||
      null;

    const subject = record.subject || mergedRequest.subject || 'Môn học';
    const gradeLevel = record.level || inferGradeLevel(subject, learnerName, mergedRequest);
    const format =
      record.format ||
      mergedRequest.format ||
      mergedRequest.formats?.join(', ') ||
      (mergedRequest.area ? 'Tại nhà' : 'Online');
    const area =
      record.area ||
      mergedRequest.area ||
      mergedRequest.areas?.join(', ') ||
      learnerUser?.address ||
      fallbackAreaById[record.requestId || record.id] ||
      (format === 'Online' ? 'Trực tuyến (Online)' : 'TP. Hồ Chí Minh');
    const phone =
      record.phone ||
      mergedRequest.phone ||
      learnerUser?.phone ||
      fallbackPhonesById[record.requestId || record.id] ||
      '0903 128 456';
    const parentName = record.parent || mergedRequest.parent || null;
    const schedule =
      record.schedule ||
      mergedRequest.schedule ||
      (ordered.length
        ? `${dateLabel(ordered[0].date)} · ${timeLabel(ordered[0].start)}–${timeLabel(ordered[0].end)}`
        : 'Theo lịch thỏa thuận');
    const goal =
      record.goal ||
      mergedRequest.goal ||
      mergedRequest.note ||
      'Củng cố kiến thức nền tảng, bám sát chương trình trên lớp và luyện giải bài tập nâng cao.';
    const tutorNotes =
      record.tutorNotes ??
      mergedRequest.tutorNotes ??
      '';
    const tutorNotesUpdatedAt =
      record.tutorNotesUpdatedAt ??
      mergedRequest.tutorNotesUpdatedAt ??
      null;

    return {
      id: record.id,
      requestId: record.requestId || record.id,
      record: {
        ...record,
        learner: learnerName,
        subject,
        format,
        sessionFee: record.sessionFee ?? mergedRequest.sessionFee ?? null,
        startDate: record.startDate || ordered[0]?.date || (mergedRequest.createdAt ? String(mergedRequest.createdAt).slice(0, 10) : null),
      },
      request: mergedRequest,
      learner: learnerName,
      parentName,
      phone,
      subject,
      gradeLevel,
      format,
      area,
      schedule,
      goal,
      tutorNotes,
      tutorNotesUpdatedAt,
      lessons: ordered,
      first: ordered[0] || record,
      status: derivedStatus,
      completed: completedCount,
      upcoming: upcomingCount,
      absent: absentCount,
      total: totalSessions,
    };
  });
}

export default function TutorClasses() {
  const { classes: classRecords, lessons, requests, users } = useTutorWorkspace();
  const classes = useMemo(
    () => buildTutorClasses(classRecords, lessons, requests, users),
    [classRecords, lessons, requests, users]
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const visible = classes.filter((item) => {
    const matchesStatus = status === 'all' || item.status === status;
    const haystack = `${item.learner} ${item.parentName || ''} ${item.subject} ${item.gradeLevel} ${item.area} ${item.format}`.toLocaleLowerCase('vi-VN');
    return matchesStatus && haystack.includes(query.trim().toLocaleLowerCase('vi-VN'));
  });

  return (
    <TutorShell
      title="Quản lý lớp học"
      subtitle="Các lớp học đã được gia sư chấp nhận. Nhấn vào từng lớp để xem chi tiết, điểm danh và ghi chú giảng dạy."
    >
      <div className="tutor-classes__toolbar">
        <input
          type="search"
          aria-label="Tìm lớp học"
          placeholder="Tìm theo học viên, môn học, khối lớp hoặc khu vực..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flow-tabs">
          {[
            ['all', 'Tất cả'],
            ['ongoing', 'Đang học'],
            ['completed', 'Hoàn thành'],
            ['cancelled', 'Đã hủy'],
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={status === key ? 'is-active' : ''}
              onClick={() => setStatus(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="tutor-classes__count" role="status">
        {visible.length} lớp trong nhóm đang xem
      </p>

      <div className="tutor-classes__grid flow-list">
        {visible.map((item) => {
          const [statusLabel, statusTone] = classStatusMeta[item.status] || classStatusMeta.ongoing;
          const timeSummary = item.lessons.length
            ? `${timeLabel(item.first.start)}–${timeLabel(item.first.end)}`
            : item.schedule;

          return (
            <Link
              className="flow-row tutor-class-item"
              key={item.id}
              to={`/tutor/classes/${encodeURIComponent(item.id)}`}
            >
              <div className="tutor-class-item__main">
                <div className="tutor-class-item__head">
                  <span className="tutor-class-item__subject-tag">
                    <BookOpen size={14} aria-hidden="true" />
                    {item.subject}
                  </span>
                  <span className="tutor-class-item__grade-tag">{item.gradeLevel}</span>
                  <Badge tone={statusTone}>{statusLabel}</Badge>
                </div>

                <strong className="tutor-class-item__title">
                  {item.record.subject} · {item.record.learner}
                </strong>

                <small className="tutor-class-item__meta">
                  <span>
                    <UserRound size={14} aria-hidden="true" />
                    {item.learner}
                    {item.parentName ? ` (PH: ${item.parentName})` : ''}
                  </span>
                  <span>
                    <CalendarDays size={14} aria-hidden="true" />
                    {item.schedule} · {timeSummary}
                  </span>
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                    {item.format} · {item.area}
                  </span>
                  <span>
                    <Wallet size={14} aria-hidden="true" />
                    {money(item.record.sessionFee)}
                  </span>
                </small>
              </div>

              <div className="tutor-class-item__right">
                <span className="tutor-class-item__sessions">
                  {item.completed} buổi đã dạy · {item.upcoming} buổi sắp tới
                </span>
                <span className="tutor-class-item__cta">
                  Chi tiết <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}

        {!visible.length && (
          <p className="empty-line">Chưa có lớp phù hợp với bộ lọc hiện tại.</p>
        )}
      </div>
    </TutorShell>
  );
}

export function TutorClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    classes,
    lessons,
    requests,
    profiles,
    users,
    updateClassStatus,
    saveClassTutorNotes,
    addClassSession,
    updateClassSession,
    deleteClassSession,
  } = useTutorWorkspace();
  const { openLearnerConversation } = useTutorMessagesState();

  const item = useMemo(
    () => buildTutorClasses(classes, lessons, requests, users).find((group) => group.id === id || group.requestId === id),
    [classes, lessons, requests, users, id]
  );

  const tutor = profiles.find((profile) => profile.id === item?.record.tutorId);

  const [notesDraft, setNotesDraft] = useState(() => item?.tutorNotes || '');
  const [feedback, setFeedback] = useState('');
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonNote, setEditingLessonNote] = useState('');
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '19:30',
    status: 'upcoming',
    notes: '',
  });
  const [sessionFormError, setSessionFormError] = useState('');

  useEffect(() => {
    setNotesDraft(item?.tutorNotes || '');
  }, [item?.id, item?.tutorNotes]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(() => setFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  if (!item) {
    return (
      <TutorShell title="Không tìm thấy lớp học" subtitle="Không có lớp phù hợp với mã này.">
        <Link className="flow-back" to="/tutor/classes">
          <ArrowLeft size={17} /> Quay lại Quản lý lớp học
        </Link>
      </TutorShell>
    );
  }

  const [statusLabel, statusTone] = classStatusMeta[item.status] || classStatusMeta.ongoing;
  const durations = [
    ...new Set(
      item.lessons
        .map((lesson) => lesson.end - lesson.start)
        .filter((duration) => Number.isFinite(duration) && duration > 0)
    ),
  ];
  const durationLabel =
    durations.length === 1
      ? `${durations[0]} phút / buổi`
      : durations.length
        ? 'Thay đổi theo từng buổi'
        : `${tutor?.sessionMinutes || 90} phút / buổi`;

  const handleMessageLearner = () => {
    const convId = openLearnerConversation({
      name: item.learner,
      subject: item.subject,
    });
    navigate('/tutor/messages', { state: { conversationId: convId } });
  };

  const handleCompleteClass = () => {
    if (item.status !== 'ongoing') return;
    updateClassStatus(item.id, 'completed');
    setFeedback('Đã đánh dấu lớp học hoàn thành.');
  };

  const handleSaveTutorNotes = (event) => {
    event.preventDefault();
    saveClassTutorNotes(item.id, notesDraft.trim());
    setFeedback('Đã lưu ghi chú gia sư cho lớp học này.');
  };

  const handleQuickAttendance = (lesson, nextStatus) => {
    updateClassSession(lesson.id, {
      status: nextStatus,
      classId: item.id,
      requestId: item.requestId,
    });
    const label = attendanceStatusMeta[nextStatus]?.[0] || nextStatus;
    setFeedback(`Đã cập nhật điểm danh buổi học ngày ${dateLabel(lesson.date)}: ${label}.`);
  };

  const handleSaveLessonNote = (lesson) => {
    updateClassSession(lesson.id, {
      notes: editingLessonNote.trim(),
      classId: item.id,
      requestId: item.requestId,
    });
    setEditingLessonId(null);
    setEditingLessonNote('');
    setFeedback(`Đã cập nhật nội dung bài học ngày ${dateLabel(lesson.date)}.`);
  };

  const handleConfirmDeleteLesson = () => {
    if (!deletingLesson) return;
    deleteClassSession(deletingLesson.id);
    const deletedDate = dateLabel(deletingLesson.date);
    setDeletingLesson(null);
    setFeedback(`Đã xóa buổi học ngày ${deletedDate} và cập nhật lại số thứ tự các buổi.`);
  };

  const handleAddSessionSubmit = (event) => {
    event.preventDefault();
    const dateErr = validateBirthDate(sessionForm.date);
    if (dateErr) {
      setSessionFormError('Ngày học không hợp lệ (năm phải gồm 4 chữ số từ 1900 đến 2100).');
      return;
    }
    const start = parseTimeInput(sessionForm.startTime, null);
    const end = parseTimeInput(sessionForm.endTime, null);
    if (start === null || end === null || end <= start) {
      setSessionFormError('Khung giờ không hợp lệ. Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    const result = addClassSession(item.id, {
      date: sessionForm.date,
      start,
      end,
      status: sessionForm.status,
      notes: sessionForm.notes.trim() || 'Đã giảng dạy theo lộ trình lớp học.',
    });
    if (result?.error) {
      setSessionFormError(result.error);
      return;
    }
    setSessionModalOpen(false);
    setSessionFormError('');
    setSessionForm({
      date: new Date().toISOString().slice(0, 10),
      startTime: '18:00',
      endTime: '19:30',
      status: 'upcoming',
      notes: '',
    });
    setFeedback('Đã thêm ghi nhận buổi học mới vào lớp.');
  };

  return (
    <TutorShell
      title="Chi tiết lớp học"
      subtitle={`Mã lớp ${id} · Quản lý thông tin học viên, điểm danh và ghi chú giảng dạy`}
    >
      {/* a) HEADER */}
      <header className="tutor-class-detail-header">
        <div className="tutor-class-detail-header__top">
          <Link className="flow-back" to="/tutor/classes">
            <ArrowLeft size={17} /> Quay lại Quản lý lớp học
          </Link>

          <div className="tutor-class-detail-header__actions">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={handleMessageLearner}
            >
              <MessageCircle size={16} />
              Nhắn tin học viên
            </button>
            {item.status === 'ongoing' && (
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={handleCompleteClass}
              >
                <CheckCircle2 size={16} />
                Đánh dấu hoàn thành
              </button>
            )}
          </div>
        </div>

        <div className="tutor-class-detail-header__banner">
          <div>
            <div className="tutor-class-detail-header__badges">
              <Badge tone={statusTone}>{statusLabel}</Badge>
              <span className="tutor-class-detail-header__grade">{item.gradeLevel}</span>
              <span className="tutor-class-detail-header__code">Mã lớp: #{item.id}</span>
            </div>
            <h2 className="tutor-class-detail-header__title">
              {item.subject} — {item.gradeLevel}
            </h2>
            <p className="tutor-class-detail-header__subtitle">
              Học viên: <strong>{item.learner}</strong> · Gia sư phụ trách: <strong>{tutor?.name || 'Trần Gia Bảo'}</strong>
            </p>
          </div>
        </div>
      </header>

      {feedback && (
        <p className="tutor-class-feedback" role="status">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>{feedback}</span>
        </p>
      )}

      <div className="tutor-class-detail-page">
        {/* b) CARD THÔNG TIN HỌC VIÊN & LỊCH HỌC */}
        <section
          className="tutor-class-card tutor-class-card--overview"
          aria-label="Thông tin học viên và lịch học"
        >
          <div className="tutor-class-card__head">
            <h3>
              <UserRound size={18} aria-hidden="true" />
              Thông tin học viên & Lịch học
            </h3>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>

          <dl className="tutor-class-facts">
            <div>
              <dt>Học viên / Phụ huynh</dt>
              <dd>
                {item.learner}
                {item.parentName ? ` (PH: ${item.parentName})` : ''}
              </dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd className="tutor-class-facts__inline">
                <Phone size={14} aria-hidden="true" />
                <span>{item.phone}</span>
              </dd>
            </div>
            <div>
              <dt>Hình thức & Địa điểm học</dt>
              <dd className="tutor-class-facts__inline">
                <MapPin size={14} aria-hidden="true" />
                <span>
                  {item.format} · {item.area}
                </span>
              </dd>
            </div>
            <div>
              <dt>Lịch dạy trong tuần</dt>
              <dd className="tutor-class-facts__inline">
                <CalendarDays size={14} aria-hidden="true" />
                <span>{item.schedule}</span>
              </dd>
            </div>
            <div>
              <dt>Học phí đã thống nhất</dt>
              <dd className="tutor-class-facts__price">{money(item.record.sessionFee)}</dd>
            </div>
            <div>
              <dt>Thời lượng</dt>
              <dd className="tutor-class-facts__inline">
                <Clock size={14} aria-hidden="true" />
                <span>{durationLabel}</span>
              </dd>
            </div>
            <div>
              <dt>Ngày bắt đầu</dt>
              <dd>{dateLabel(item.record.startDate)}</dd>
            </div>
            <div>
              <dt>Gia sư</dt>
              <dd>{tutor?.name || 'Trần Gia Bảo'}</dd>
            </div>
          </dl>

          <div className="tutor-class-goal">
            <h4>
              <Target size={16} aria-hidden="true" />
              Yêu cầu & Mục tiêu học tập ban đầu
            </h4>
            <p className="break-words">“{item.goal}”</p>
          </div>
        </section>

        {/* d) GHI CHÚ GIA SƯ (TUTOR NOTES) */}
        <section
          className="tutor-class-card tutor-class-card--notes"
          aria-label="Ghi chú gia sư"
        >
          <div className="tutor-class-card__head">
            <h3>
              <FileText size={18} aria-hidden="true" />
              Ghi chú gia sư (Tutor Notes)
            </h3>
          </div>
          <p className="tutor-class-notes__hint">
            Ghi chú riêng về mức độ tiếp thu, thái độ học tập và lộ trình cần lưu ý cho học viên qua từng buổi dạy.
          </p>
          <form className="tutor-class-notes__form" onSubmit={handleSaveTutorNotes}>
            <textarea
              rows={7}
              maxLength={1000}
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              placeholder="Nhập ghi chú riêng của gia sư về tình hình tiếp thu của học viên..."
              aria-label="Ghi chú riêng của gia sư"
            />
            <div className="tutor-class-notes__footer">
              <small>
                {notesDraft.length}/1000 ký tự
                {item.tutorNotesUpdatedAt
                  ? ` · Cập nhật: ${new Date(item.tutorNotesUpdatedAt).toLocaleString('vi-VN')}`
                  : ''}
              </small>
              <button type="submit" className="button button--primary button--sm">
                Lưu ghi chú
              </button>
            </div>
          </form>
        </section>

        {/* c) QUẢN LÝ BUỔI HỌC & ĐIỂM DANH (SESSION LOGS) */}
        <section
          className="tutor-class-card tutor-class-card--lessons"
          aria-label="Quản lý buổi học và điểm danh"
        >
          <div className="tutor-class-card__head tutor-class-card__head--wrap">
            <div>
              <h3>
                <CalendarDays size={18} aria-hidden="true" />
                Quản lý buổi học & Điểm danh
              </h3>
              <p className="tutor-class-lessons__sub">
                Tổng số buổi: <strong>{item.total}</strong> · Đã dạy: <strong>{item.completed}</strong> · Sắp tới: <strong>{item.upcoming}</strong> · Nghỉ: <strong>{item.absent}</strong>
              </p>
            </div>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => {
                setSessionFormError('');
                setSessionModalOpen(true);
              }}
            >
              <Plus size={16} />
              Thêm ghi nhận buổi học mới
            </button>
          </div>

          {item.lessons.length ? (
            <ul className="tutor-class-lessons">
              {item.lessons.map((lesson, index) => {
                const [attLabel, attTone] =
                  attendanceStatusMeta[lesson.status] || attendanceStatusMeta.upcoming;
                const isEditing = editingLessonId === lesson.id;

                return (
                  <li className="tutor-session-item" key={lesson.id}>
                    <div className="tutor-session-item__top">
                      <div className="tutor-session-item__title">
                        <span className="tutor-session-item__index">Buổi {index + 1}</span>
                        <strong>
                          {fullDateLabel(lesson.date)} · {timeLabel(lesson.start)}–{timeLabel(lesson.end)}
                        </strong>
                        <small>{lesson.end - lesson.start} phút</small>
                      </div>

                      <div className="tutor-session-item__badges">
                        <Badge tone={attTone}>{attLabel}</Badge>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="tutor-session-item__edit">
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={editingLessonNote}
                          onChange={(event) => setEditingLessonNote(event.target.value)}
                          placeholder="Nhập nội dung bài học, bài tập về nhà hoặc nhận xét buổi học..."
                          aria-label="Nội dung bài học"
                        />
                        <div className="tutor-session-item__edit-actions">
                          <small className="tutor-char-counter">{editingLessonNote.length}/500 ký tự</small>
                          <button
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => {
                              setEditingLessonId(null);
                              setEditingLessonNote('');
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            className="button button--primary button--sm"
                            onClick={() => handleSaveLessonNote(lesson)}
                          >
                            Lưu nội dung
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="tutor-session-item__notes break-words">
                        <strong>Nội dung bài học:</strong>{' '}
                        {lesson.notes || 'Chưa có ghi nhận nội dung bài học cho buổi này.'}
                      </p>
                    )}

                    <div className="tutor-session-item__actions">
                      <div className="tutor-session-item__attendance-btns" role="group" aria-label="Điểm danh nhanh">
                        <span>Điểm danh nhanh:</span>
                        {[
                          ['completed', 'Đã dạy'],
                          ['upcoming', 'Sắp tới'],
                          ['cancelled', 'Nghỉ'],
                        ].map(([statusKey, label]) => {
                          const activeStatus =
                            lesson.status === 'confirmed' ? 'upcoming' : lesson.status;
                          return (
                            <button
                              type="button"
                              key={statusKey}
                              className={`tutor-attendance-chip ${activeStatus === statusKey ? `is-active is-${statusKey}` : ''}`}
                              onClick={() => handleQuickAttendance(lesson, statusKey)}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {!isEditing && (
                        <div className="tutor-session-item__right-actions">
                          <button
                            type="button"
                            className="tutor-session-item__note-btn"
                            onClick={() => {
                              setEditingLessonId(lesson.id);
                              setEditingLessonNote(lesson.notes || '');
                            }}
                          >
                            <Pencil size={14} />
                            Cập nhật bài học
                          </button>

                          <button
                            type="button"
                            className="tutor-session-item__delete-btn"
                            aria-label={`Xóa Buổi ${index + 1}`}
                            onClick={() => setDeletingLesson({ ...lesson, sessionNumber: index + 1 })}
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="tutor-class-lessons__empty">
              <p>Chưa có buổi học nào được ghi nhận. Nhấn <strong>Thêm ghi nhận buổi học mới</strong> để bắt đầu theo dõi.</p>
            </div>
          )}

          <div className="tutor-class-lessons__footer">
            <Link className="text-link" to="/tutor/timetable">
              Xem trên Lịch dạy học tuần →
            </Link>
          </div>
        </section>
      </div>

      {/* MODAL THÊM GHI NHẬN BUỔI HỌC MỚI */}
      {sessionModalOpen && (
        <div
          className="tutor-class-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSessionModalOpen(false);
          }}
        >
          <div
            className="tutor-class-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-session-modal-title"
          >
            <div className="tutor-class-modal__head">
              <div>
                <span className="eyebrow">NHẬT KÝ GIẢNG DẠY</span>
                <h3 id="add-session-modal-title">Thêm ghi nhận buổi học mới</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Đóng cửa sổ"
                onClick={() => setSessionModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form className="tutor-class-modal__form" noValidate onSubmit={handleAddSessionSubmit}>
              <div className="tutor-class-modal__grid">
                <label className="settings-field">
                  <span>Ngày học *</span>
                  <input
                    type="date"
                    required
                    min={BIRTH_DATE_MIN}
                    max={BIRTH_DATE_MAX}
                    value={sessionForm.date}
                    onChange={(event) => {
                      setSessionForm({
                        ...sessionForm,
                        date: clampBirthDateInput(event.target.value),
                      });
                      setSessionFormError('');
                    }}
                  />
                </label>

                <label className="settings-field">
                  <span>Trạng thái điểm danh *</span>
                  <span className="select-control">
                    <select
                      className="appearance-none pr-10"
                      value={sessionForm.status}
                      onChange={(event) =>
                        setSessionForm({ ...sessionForm, status: event.target.value })
                      }
                    >
                      <option value="completed">Đã dạy</option>
                      <option value="upcoming">Sắp tới</option>
                      <option value="cancelled">Nghỉ</option>
                    </select>
                    <ChevronDown size={16} className="select-control__icon" aria-hidden="true" />
                  </span>
                </label>

                <label className="settings-field">
                  <span>Giờ bắt đầu *</span>
                  <input
                    type="time"
                    required
                    value={sessionForm.startTime}
                    onChange={(event) => {
                      setSessionForm({ ...sessionForm, startTime: event.target.value });
                      setSessionFormError('');
                    }}
                  />
                </label>

                <label className="settings-field">
                  <span>Giờ kết thúc *</span>
                  <input
                    type="time"
                    required
                    value={sessionForm.endTime}
                    onChange={(event) => {
                      setSessionForm({ ...sessionForm, endTime: event.target.value });
                      setSessionFormError('');
                    }}
                  />
                </label>
              </div>

              <label className="settings-field">
                <span>Nội dung bài học / Nhận xét buổi học</span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={sessionForm.notes}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, notes: event.target.value })
                  }
                  placeholder="Ví dụ: Ôn tập chuyên đề hàm số, chữa đề kiểm tra 45 phút..."
                />
                <small className="tutor-char-counter">{sessionForm.notes.length}/500 ký tự</small>
              </label>

              {sessionFormError && (
                <p className="settings-error" role="alert">
                  {sessionFormError}
                </p>
              )}

              <div className="tutor-class-modal__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setSessionModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="button button--primary">
                  Lưu buổi học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA BUỔI HỌC */}
      {deletingLesson && (
        <div
          className="tutor-class-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeletingLesson(null);
          }}
        >
          <div
            className="tutor-class-modal tutor-class-modal--confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-session-modal-title"
          >
            <div className="tutor-class-modal__head">
              <div>
                <span className="eyebrow">XÁC NHẬN XÓA</span>
                <h3 id="delete-session-modal-title">Xóa Buổi {deletingLesson.sessionNumber}?</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Đóng hộp thoại xác nhận xóa"
                onClick={() => setDeletingLesson(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="tutor-class-modal__confirm-text">
              Bạn có chắc chắn muốn xóa <strong>Buổi {deletingLesson.sessionNumber}</strong> ({fullDateLabel(deletingLesson.date)} · {timeLabel(deletingLesson.start)}–{timeLabel(deletingLesson.end)}) khỏi danh sách buổi học? Các buổi còn lại sẽ tự động được đánh số thứ tự lại.
            </p>
            <div className="tutor-class-modal__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setDeletingLesson(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="button settings-danger-button"
                onClick={handleConfirmDeleteLesson}
              >
                <Trash2 size={16} />
                Xóa buổi học
              </button>
            </div>
          </div>
        </div>
      )}
    </TutorShell>
  );
}
