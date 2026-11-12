import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Hourglass,
  MessageSquareQuote,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import useDemoDomain, { useLearnerRequests } from '../domain/DemoDomainContext.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import './search.css';
import './learnerSchedule.css';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);

const classMaterialsBySubject = {
  'Tiếng Anh': [
    {
      id: 'mat-en-1',
      title: 'Đề cương Ngữ pháp & Từ vựng trọng tâm (Unit 1 - Unit 4)',
      type: 'PDF',
      size: '2.4 MB',
      uploadedAt: '02/10/2026',
      description: 'Tổng hợp cấu trúc câu và 150 từ vựng giao tiếp & IELTS nền tảng theo từng chủ đề.',
      note: 'Học viên đọc trước trang 1–12 trước buổi học thứ Bảy.',
    },
    {
      id: 'mat-en-2',
      title: 'Bài tập luyện phản xạ Speaking & phát âm chuẩn IPA',
      type: 'PDF',
      size: '1.8 MB',
      uploadedAt: '04/10/2026',
      description: 'Danh sách câu hỏi thực hành phản xạ 2 phút và hướng dẫn nhấn trọng âm câu.',
      note: 'Chuẩn bị dàn ý cho 3 chủ đề đầu tiên để thực hành trực tiếp trên lớp.',
    },
  ],
  'Ngữ văn': [
    {
      id: 'mat-van-1',
      title: 'Sơ đồ tư duy Nghị luận xã hội & Phân tích tác phẩm',
      type: 'PDF',
      size: '3.1 MB',
      uploadedAt: '22/09/2026',
      description: 'Hệ thống luận điểm cốt lõi và cách mở bài, kết bài ấn tượng dành cho học sinh phổ thông.',
      note: 'Tài liệu tổng kết sau khi hoàn thành chuyên đề luyện viết.',
    },
  ],
  'Toán': [
    {
      id: 'mat-math-1',
      title: 'Chuyên đề Hàm số & Hình học phẳng trọng tâm',
      type: 'PDF',
      size: '2.9 MB',
      uploadedAt: '01/10/2026',
      description: 'Tóm tắt công thức và các dạng bài tập tự luyện có hướng dẫn giải chi tiết.',
      note: 'Làm bài tập từ câu 1 đến câu 8 trang 5.',
    },
  ],
};

export function useLearnerClassesData() {
  const [requests] = useLearnerRequests();
  const { user } = useDemoAuth();
  const { lessons: allLessons } = useDemoDomain();
  const tutors = useScheduledTutors();

  return useMemo(() => {
    const accepted = [...requests.filter((r) => r.status === 'accepted')];

    if (user?.id === 'demo-learner' && !accepted.some((r) => !r.completed)) {
      accepted.unshift({
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

    const classes = accepted.map((req) => {
      const tutor = tutors.find((t) => t.id === req.tutorId) || tutors[0];
      const classLessons = allLessons.filter(
        (l) => (l.requestId === req.id || (l.tutorId === req.tutorId && l.learnerId === user?.id))
          && l.status !== 'cancelled'
      );
      const isCompleted = Boolean(req.completed);
      const doneCount = isCompleted
        ? Math.max(classLessons.filter((l) => l.status === 'completed').length, 4)
        : 2;
      const totalCount = isCompleted ? doneCount : 6;
      const progress = Math.min(100, Math.round((doneCount / totalCount) * 100));
      const materials = classMaterialsBySubject[req.subject] || classMaterialsBySubject['Tiếng Anh'];

      return {
        id: req.id,
        subject: req.subject,
        goal: req.goal || 'Bám sát lộ trình cá nhân hóa',
        schedule: req.schedule || 'Thứ 7 · 09:00',
        format: req.format || 'Online / Tại nhà',
        sessionFee: req.sessionFee || tutor?.price || 180000,
        completed: isCompleted,
        tutor,
        doneCount,
        totalCount,
        progress,
        materials,
        lessons: classLessons,
      };
    });

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    return { classes, pendingCount, user };
  }, [requests, tutors, allLessons, user]);
}

export default function LearnerClassesPage() {
  const { classes, pendingCount, user } = useLearnerClassesData();
  const [filter, setFilter] = useState('all');

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const ongoingCount = classes.filter((c) => !c.completed).length;
  const completedCount = classes.filter((c) => c.completed).length;

  const visibleClasses = useMemo(() => {
    if (filter === 'ongoing') return classes.filter((c) => !c.completed);
    if (filter === 'completed') return classes.filter((c) => c.completed);
    return classes;
  }, [classes, filter]);

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader compact />

      <section className="learner-page-banner">
        <div className="learner-container">
          <div className="learner-page-banner__row">
            <div>
              <h1>Lớp học của tôi</h1>
              <p>
                Xin chào <strong>{user?.fullName || user?.username || 'Học viên'}</strong>, quản lý tiến độ các môn đang theo học, tải tài liệu bài giảng và nộp bài tập cho gia sư.
              </p>
            </div>

            <div className="learner-page-banner__actions">
              <Link className="button button--secondary button--sm" to="/learner/schedule">
                <CalendarDays size={16} aria-hidden="true" /> Xem thời khóa biểu
              </Link>
              <Link className="button button--primary button--sm" to="/learner/search">
                <Search size={16} aria-hidden="true" /> Tìm gia sư mới
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="learner-container learner-schedule-page">
        <section className="learner-stats-grid" aria-label="Tổng quan lớp học">
          <div className="learner-stat-card learner-stat-card--blue">
            <div className="learner-stat-card__icon" aria-hidden="true">
              <BookOpen size={22} />
            </div>
            <div className="learner-stat-card__body">
              <span>Đang theo học</span>
              <strong>{ongoingCount} lớp học</strong>
              <small>Lịch học cố định hằng tuần</small>
            </div>
          </div>

          <div className="learner-stat-card learner-stat-card--green">
            <div className="learner-stat-card__icon" aria-hidden="true">
              <CheckCircle2 size={22} />
            </div>
            <div className="learner-stat-card__body">
              <span>Đã hoàn thành</span>
              <strong>{completedCount} khóa học</strong>
              <small>Đã tổng kết lộ trình & đánh giá</small>
            </div>
          </div>

          <Link to="/requests" className="learner-stat-card learner-stat-card--indigo">
            <div className="learner-stat-card__icon" aria-hidden="true">
              <Hourglass size={22} />
            </div>
            <div className="learner-stat-card__body">
              <span>Yêu cầu chờ phản hồi</span>
              <strong>{pendingCount} yêu cầu</strong>
              <small>Xem trạng thái xác nhận từ gia sư →</small>
            </div>
          </Link>
        </section>

        <div className="learner-classes-bar">
          <div className="learner-segmented-tabs" role="tablist" aria-label="Lọc lớp học">
            {[
              ['all', 'Tất cả lớp học', classes.length],
              ['ongoing', 'Đang theo học', ongoingCount],
              ['completed', 'Đã hoàn thành', completedCount],
            ].map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={`learner-segmented-tab ${filter === key ? 'is-active' : ''}`}
                onClick={() => setFilter(key)}
              >
                <span>{label}</span>
                <em className="learner-segmented-tab__count">{count}</em>
              </button>
            ))}
          </div>

          <div className="learner-classes-bar__actions">
            <Link className="learner-action-link-btn" to="/requests">
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>Quản lý yêu cầu học</span>
              {pendingCount > 0 && <em className="learner-action-link-btn__badge">{pendingCount}</em>}
            </Link>
          </div>
        </div>

        {visibleClasses.length ? (
          <div className="learner-class-cards learner-class-cards--grid">
            {visibleClasses.map((cls) => (
              <article key={cls.id} className="learner-class-card">
                <div className="learner-class-card__top">
                  <div className="learner-class-card__tutor">
                    <Avatar
                      initials={cls.tutor?.initials || 'GS'}
                      name={cls.tutor?.name || 'Gia sư'}
                      tone={cls.tutor?.avatarTone || 'blue'}
                      size="lg"
                    />
                    <div>
                      <span className="learner-class-card__subject">Môn {cls.subject}</span>
                      <h3>
                        <Link to={`/learner/classes/${cls.id}`} className="tutor-card__name-link">
                          Lớp {cls.subject} — {cls.tutor?.name}
                        </Link>
                      </h3>
                      <p><GraduationCap size={14} aria-hidden="true" /> {cls.tutor?.university || 'Đại học xác minh'}</p>
                    </div>
                  </div>
                  <Badge tone={cls.completed ? 'success' : 'brand'}>
                    {cls.completed ? 'Đã hoàn thành' : 'Đang theo học'}
                  </Badge>
                </div>

                <div className="learner-class-card__progress">
                  <div className="learner-class-card__progress-labels">
                    <span>Tiến độ khóa học: <strong>{cls.doneCount}/{cls.totalCount} buổi</strong></span>
                    <strong>{cls.progress}%</strong>
                  </div>
                  <div className="learner-progress-bar" role="progressbar" aria-valuenow={cls.progress} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${cls.progress}%` }} />
                  </div>
                </div>

                <div className="learner-class-card__meta">
                  <span><Clock3 size={15} aria-hidden="true" /> Lịch học cố định: <strong>{cls.schedule}</strong></span>
                  <span><BookOpen size={15} aria-hidden="true" /> Mục tiêu: {cls.goal}</span>
                  <span><FolderOpen size={15} aria-hidden="true" /> Có <strong>{cls.materials.length} bài giảng & tài liệu</strong> từ gia sư</span>
                </div>

                <div className="learner-class-card__actions">
                  <Link
                    className="button button--secondary button--sm"
                    to={`/learner/classes/${cls.id}/assignments`}
                    state={{ from: '/learner/classes', fromLabel: 'Lớp học của tôi' }}
                  >
                    <Upload size={15} aria-hidden="true" /> Bài nộp & Đánh giá
                  </Link>
                  <Link
                    className="button button--primary button--sm"
                    to={`/learner/classes/${cls.id}`}
                    state={{ from: '/learner/classes', fromLabel: 'Lớp học của tôi' }}
                  >
                    Vào bài học <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="learner-empty">
            <BookOpen size={28} aria-hidden="true" />
            <h3>Chưa có lớp học nào trong mục này</h3>
            <p>Bạn có thể khám phá đội ngũ gia sư sinh viên và gửi yêu cầu học mới bất cứ lúc nào.</p>
            <Link className="button button--primary" to="/learner/search">
              <Search size={17} aria-hidden="true" /> Khám phá & Tìm gia sư
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export function LearnerClassDetailPage() {
  const { id, section } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { classes } = useLearnerClassesData();
  const cls = classes.find((item) => item.id === id) || classes[0];

  const fromPath = location.state?.from || '/learner/classes';
  const fromLabel = location.state?.fromLabel ? `Quay lại ${location.state.fromLabel}` : 'Quay lại danh sách Lớp học của tôi';

  const activeSection = section === 'assignments' ? 'assignments' : 'materials';

  const [previewDoc, setPreviewDoc] = useState(null);
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      title: 'Bai_tap_ve_nha_Buoi_1_MinhAnh.pdf',
      submittedAt: '03/10/2026 · 20:15',
      status: 'Gia sư đã chấm',
      score: '9.0 / 10',
      feedback: 'Làm bài đầy đủ, nắm vững kiến thức trọng tâm. Chú ý trình bày chi tiết hơn ở câu vận dụng nâng cao.',
    },
    {
      id: 'sub-2',
      title: 'De_cuong_thuc_hanh_Buoi_2_MinhAnh.pdf',
      submittedAt: '06/10/2026 · 19:40',
      status: 'Gia sư đã chấm',
      score: '9.5 / 10',
      feedback: 'Cấu trúc bài làm rất mạch lạc, sử dụng từ vựng và lập luận chính xác. Tiếp tục phát huy nhé!',
    },
  ]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState('');
  const fileInputRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, activeSection]);

  if (!cls) {
    return (
      <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
        <LearnerHeader compact />
        <main className="learner-container learner-schedule-page">
          <div className="learner-empty">
            <h3>Không tìm thấy lớp học</h3>
            <Link className="button button--primary" to="/learner/classes">Quay lại Lớp học của tôi</Link>
          </div>
        </main>
      </div>
    );
  }

  const handleUploadSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile && !uploadTitle.trim()) {
      setUploadFeedback('Vui lòng chọn file hoặc nhập tên bài tập.');
      return;
    }
    const fileName = selectedFile ? selectedFile.name : `${uploadTitle.trim()}.pdf`;
    setSubmissions((prev) => [
      {
        id: `sub-${Date.now()}`,
        title: fileName,
        submittedAt: 'Vừa nộp xong',
        status: 'Chờ gia sư nhận xét',
        score: 'Đang chấm',
        feedback: uploadNote.trim()
          ? `Lời nhắn của bạn: “${uploadNote.trim()}” — Gia sư sẽ xem và phản hồi trước buổi học tiếp theo.`
          : 'Đang chờ gia sư xem bài và gửi nhận xét chi tiết.',
      },
      ...prev,
    ]);
    setUploadTitle('');
    setUploadNote('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadFeedback('Đã nộp bài tập thành công lên lớp học!');
  };

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader compact />

      <section className="learner-page-banner">
        <div className="learner-container">
          <div className="learner-banner-top-nav">
            <Link className="flow-back" to={fromPath}>
              <ArrowLeft size={17} aria-hidden="true" /> {fromLabel}
            </Link>
          </div>
          <div className="learner-page-banner__row">
            <div>
              <h1>Lớp {cls.subject} — Gia sư {cls.tutor?.name}</h1>
              <p>Lịch học: <strong>{cls.schedule}</strong> · Mục tiêu: {cls.goal} · Học phí: {money(cls.sessionFee)}đ/buổi</p>
            </div>
            <div className="learner-request-quick-links">
              <Link className="button button--secondary button--sm" to="/learner/schedule">
                <CalendarDays size={16} aria-hidden="true" /> Xem trên Thời khóa biểu
              </Link>
              <Link className="button button--primary button--sm" to={`/requests/${cls.id}`}>
                Chi tiết yêu cầu & Đánh giá gia sư <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="learner-container learner-schedule-page">
        <div className="learner-classes-bar">
          <div className="learner-segmented-tabs" role="tablist" aria-label="Chọn khu vực trong lớp học">
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'materials'}
              className={`learner-segmented-tab ${activeSection === 'materials' ? 'is-active' : ''}`}
              onClick={() => navigate(`/learner/classes/${cls.id}`, { state: location.state })}
            >
              <BookOpen size={17} aria-hidden="true" />
              <span>Bài học</span>
              <em className="learner-segmented-tab__count">{cls.materials.length}</em>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'assignments'}
              className={`learner-segmented-tab ${activeSection === 'assignments' ? 'is-active' : ''}`}
              onClick={() => navigate(`/learner/classes/${cls.id}/assignments`, { state: location.state })}
            >
              <ClipboardCheck size={17} aria-hidden="true" />
              <span>Bài nộp & Đánh giá</span>
              <em className="learner-segmented-tab__count">{submissions.length}</em>
            </button>
          </div>

          <div className="learner-classes-bar__actions">
            {activeSection === 'materials' ? (
              <button
                type="button"
                className="learner-action-link-btn"
                onClick={() => navigate(`/learner/classes/${cls.id}/assignments`, { state: location.state })}
              >
                <Upload size={16} aria-hidden="true" />
                <span>Chuyển sang trang Nộp bài tập →</span>
              </button>
            ) : (
              <button
                type="button"
                className="learner-action-link-btn"
                onClick={() => navigate(`/learner/classes/${cls.id}`, { state: location.state })}
              >
                <FolderOpen size={16} aria-hidden="true" />
                <span>← Xem Bài học</span>
              </button>
            )}
          </div>
        </div>

        {activeSection === 'materials' ? (
          <div className="learner-materials-layout">
            <div className="learner-materials-main">
              <section className="learner-schedule-section" aria-labelledby="class-materials-heading">
                <div className="learner-schedule-section__heading">
                  <div>
                    <h2 id="class-materials-heading">Bài giảng & Đề cương do gia sư {cls.tutor?.name} đăng tải</h2>
                  </div>
                  <span className="learner-schedule-count">{cls.materials.length} tài liệu</span>
                </div>

                <div className="learner-materials-list">
                  {cls.materials.map((doc) => (
                    <article key={doc.id} className="learner-material-card">
                      <div className="learner-material-card__icon" aria-hidden="true">
                        <FileText size={24} />
                        <span>{doc.type}</span>
                      </div>
                      <div className="learner-material-card__body">
                        <div className="learner-material-card__tags">
                          <Badge tone="brand">{cls.subject}</Badge>
                          <span>Đăng ngày {doc.uploadedAt} · Dung lượng {doc.size}</span>
                        </div>
                        <h3>{doc.title}</h3>
                        <p>{doc.description}</p>
                        <div className="learner-material-card__note">
                          <Sparkles size={15} aria-hidden="true" />
                          <span><strong>Hướng dẫn học tập:</strong> {doc.note}</span>
                        </div>
                      </div>
                      <div className="learner-material-card__actions">
                        <button
                          type="button"
                          className="button button--secondary button--sm"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Download size={15} aria-hidden="true" /> Xem / Tải về
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="learner-materials-aside" aria-label="Thông tin lớp học">
              <div className="learner-schedule-widget">
                <h3>Thông tin lộ trình lớp học</h3>
                <p>Theo dõi tiến độ các buổi học và chuẩn bị bài theo hướng dẫn của gia sư.</p>

                <div className="learner-class-card__progress" style={{ marginBottom: '16px' }}>
                  <div className="learner-class-card__progress-labels">
                    <span>Tiến độ hoàn thành: <strong>{cls.doneCount}/{cls.totalCount} buổi</strong></span>
                    <strong>{cls.progress}%</strong>
                  </div>
                  <div className="learner-progress-bar" role="progressbar" aria-valuenow={cls.progress} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${cls.progress}%` }} />
                  </div>
                </div>

                <ul className="learner-schedule-checklist">
                  <li>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>Tải đề cương PDF và đọc trước nội dung trọng tâm trước giờ lên lớp.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>Sau khi làm xong bài tập về nhà, chuyển sang mục <strong>Bài nộp & Đánh giá của GV</strong> để gửi bài.</span>
                  </li>
                </ul>

                <button
                  type="button"
                  className="button button--primary button--sm learner-schedule-widget__btn"
                  onClick={() => navigate(`/learner/classes/${cls.id}/assignments`)}
                >
                  <Upload size={16} aria-hidden="true" /> Đi tới trang Nộp bài tập
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className="learner-materials-layout">
            <div className="learner-materials-main">
              <section className="learner-schedule-section" aria-labelledby="class-submissions-heading">
                <div className="learner-schedule-section__heading">
                  <div>
                    <h2 id="class-submissions-heading">Bài tập đã nộp & Nhận xét đánh giá từ gia sư {cls.tutor?.name}</h2>
                  </div>
                  <span className="learner-schedule-count">{submissions.length} bài nộp</span>
                </div>

                <div className="learner-submissions-list">
                  {submissions.map((sub) => (
                    <article key={sub.id} className="learner-submission-item">
                      <div className="learner-submission-item__head">
                        <div>
                          <strong><FileText size={17} aria-hidden="true" /> {sub.title}</strong>
                          <small>Thời gian nộp: {sub.submittedAt}</small>
                        </div>
                        <div className="learner-submission-item__badges">
                          {sub.score && <span className="learner-submission-score">Điểm: {sub.score}</span>}
                          <Badge tone={sub.status === 'Gia sư đã chấm' ? 'success' : 'brand'}>{sub.status}</Badge>
                        </div>
                      </div>
                      <div className="learner-submission-item__feedback-box">
                        <MessageSquareQuote size={18} aria-hidden="true" />
                        <div>
                          <strong>Đánh giá & Nhận xét của gia sư {cls.tutor?.name}:</strong>
                          <p>{sub.feedback}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="learner-materials-aside" aria-label="Nộp bài tập cho gia sư">
              <div className="learner-schedule-widget">
                <h3>Nộp bài tập mới</h3>
                <p>Đính kèm file bài giải (PDF, Word, Ảnh) để gia sư {cls.tutor?.name} chấm điểm và nhận xét.</p>

                <form className="learner-upload-form" onSubmit={handleUploadSubmit}>
                  <label>
                    Tên bài nộp
                    <input
                      type="text"
                      placeholder="VD: Bài tập về nhà buổi 3..."
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    File đính kèm
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <label>
                    Lời nhắn cho gia sư
                    <textarea
                      rows="3"
                      placeholder="Em gửi thầy/cô bài tập về nhà ạ..."
                      value={uploadNote}
                      onChange={(e) => setUploadNote(e.target.value)}
                    />
                  </label>
                  {uploadFeedback && (
                    <p className="learner-upload-feedback" role="status">{uploadFeedback}</p>
                  )}
                  <Button type="submit">
                    <Upload size={16} aria-hidden="true" /> Nộp bài cho gia sư
                  </Button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </main>

      {previewDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div
            className="quick-view learner-material-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="learner-material-modal__head">
              <Badge tone="brand">{cls.subject} · {previewDoc.type}</Badge>
              <h2>{previewDoc.title}</h2>
              <p>Giảng viên: <strong>{cls.tutor?.name}</strong> · Dung lượng {previewDoc.size}</p>
            </div>
            <div className="learner-material-modal__preview">
              <FileText size={40} aria-hidden="true" />
              <strong>Nội dung tóm tắt tài liệu</strong>
              <p>{previewDoc.description}</p>
              <div className="learner-material-card__note">
                <Sparkles size={15} aria-hidden="true" />
                <span><strong>Ghi chú:</strong> {previewDoc.note}</span>
              </div>
            </div>
            <div className="learner-material-modal__actions">
              <Button variant="secondary" onClick={() => setPreviewDoc(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
