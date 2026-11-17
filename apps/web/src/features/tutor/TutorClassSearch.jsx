import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import { TutorShell } from './TutorPages.jsx';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import {
  buildPublicOpenClassPosts,
  classSearchAreas,
  feeBounds,
  filterTutorClasses,
  formatFee,
  publicOpenClassPostTemplates,
  requestMetadata,
  savedFreeRanges,
} from '../../data/tutorClassSearch.js';
import { findSubjects, subjects as subjectCatalog } from '../../data/subjectCatalog.js';
import { timeLabel, weekDates } from '../../data/tutorSchedule.js';
import './class-search.css';

const shortDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

const toggleChoice = (values, value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function Choices({ title, options, selected, onChange, open, onToggle, searchable = false }) {
  const [query, setQuery] = useState('');
  const visible = searchable
    ? findSubjects(query)
        .map((subject) => subject.name)
        .filter((name) => options.includes(name))
    : options;
  return (
    <section className="tutor-find__choices">
      <button
        type="button"
        className="tutor-find__choices-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>
          <strong>{title}</strong>
          <small>
            {selected.length
              ? `${selected.length} ${title === 'Khu vực' ? 'khu vực' : 'môn học'} đã chọn`
              : 'Có thể chọn nhiều'}
          </small>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="tutor-find__choices-panel">
          {searchable && (
            <input
              type="search"
              aria-label="Tìm môn học"
              placeholder="Tìm môn học..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          )}
          <div className="tutor-find__choices-list">
            {visible.length ? (
              visible.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => onChange(toggleChoice(selected, option))}
                  />
                  <span>{option}</span>
                </label>
              ))
            ) : (
              <p>Không tìm thấy lựa chọn.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function FeeRange({ min, max, onMinChange, onMaxChange }) {
  const percent = (value) => ((value - feeBounds.min) / (feeBounds.max - feeBounds.min)) * 100;
  return (
    <fieldset className="tutor-find__fee">
      <legend>
        Khoảng học phí <small>VNĐ / buổi</small>
      </legend>
      <div className="tutor-find__fee-values">
        <output aria-label="Học phí từ">{formatFee(min)}</output>
        <span>–</span>
        <output aria-label="Học phí đến">{formatFee(max)}</output>
      </div>
      <div
        className="tutor-find__range"
        style={{ '--range-start': `${percent(min)}%`, '--range-end': `${percent(max)}%` }}
      >
        <div className="tutor-find__range-track" />
        <input
          type="range"
          aria-label="Học phí tối thiểu"
          aria-valuetext={`${formatFee(min)} mỗi buổi`}
          min={feeBounds.min}
          max={feeBounds.max}
          step={feeBounds.step}
          value={min}
          onChange={(event) => onMinChange(Math.min(Number(event.target.value), max))}
          style={{ zIndex: min > feeBounds.max / 2 ? 3 : 2 }}
        />
        <input
          type="range"
          aria-label="Học phí tối đa"
          aria-valuetext={`${formatFee(max)} mỗi buổi`}
          min={feeBounds.min}
          max={feeBounds.max}
          step={feeBounds.step}
          value={max}
          onChange={(event) => onMaxChange(Math.max(Number(event.target.value), min))}
        />
      </div>
      <div className="tutor-find__range-bounds">
        <span>{formatFee(feeBounds.min)}</span>
        <span>{formatFee(feeBounds.max)}</span>
      </div>
    </fieldset>
  );
}

function ClassResult({ item, isApplied, onApply }) {
  return (
    <article className="tutor-find__class">
      <div className="tutor-find__class-heading">
        <div>
          <div className="tutor-find__tags">
            <span className="tutor-find__subject">
              <BookOpen size={15} />
              {item.subject}
            </span>
            {item.level && <span className="tutor-find__level">{item.level}</span>}
            {item.format && <span className="tutor-find__format">{item.format}</span>}
          </div>
          <h3>
            {item.title} · {item.learner}
          </h3>
        </div>
        <strong className="tutor-find__price">
          {formatFee(item.sessionFee)}
          <small>/ buổi</small>
        </strong>
      </div>

      <p className="break-words">{item.note}</p>

      <div className="tutor-find__class-meta">
        <span>
          <MapPin size={16} />
          {item.area}
        </span>
        {item.parent && (
          <span>
            <UserRound size={15} />
            {item.parent}
          </span>
        )}
        <Badge tone="success">
          <Check size={14} />
          Khớp lịch rảnh
        </Badge>
      </div>

      <ul className="tutor-find__class-times">
        {item.proposals.map((proposal) => (
          <li key={proposal.id}>
            <CalendarDays size={15} />
            {shortDate(proposal.date)} · {timeLabel(proposal.start)}–{timeLabel(proposal.end)}
          </li>
        ))}
      </ul>

      <div className="tutor-find__class-actions">
        {isApplied ? (
          <div className="tutor-find__applied-row">
            <span className="tutor-find__applied-badge">
              <CheckCircle2 size={16} />
              Đã nhận dạy
            </span>
            <Link className="button button--secondary button--sm" to={`/tutor/classes/${encodeURIComponent(item.id)}`}>
              Xem trong Quản lý lớp học →
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => onApply(item)}
          >
            <Send size={15} />
            Ứng tuyển / Nhận dạy
          </button>
        )}
      </div>
    </article>
  );
}

export default function TutorClassSearch() {
  const { classes, availability, lessons, applyPublicClass } = useTutorWorkspace();
  const [subjects, setSubjects] = useState([]);
  const [areas, setAreas] = useState([]);
  const [minFee, setMinFee] = useState(feeBounds.min);
  const [maxFee, setMaxFee] = useState(feeBounds.max);
  const [openChoices, setOpenChoices] = useState({ subjects: false, areas: false });
  const [notice, setNotice] = useState('');
  const [recentlyAppliedIds, setRecentlyAppliedIds] = useState([]);

  const dates = weekDates();
  const appliedClassIds = new Set([
    ...(classes || []).map((c) => c.id),
    ...recentlyAppliedIds,
  ]);

  // Separate public student posts source (never mixed with /tutor/requests inbox)
  const publicPosts = buildPublicOpenClassPosts(dates, []);
  const subjectOptions = [
    ...new Set([
      ...subjectCatalog.map((subject) => subject.name),
      ...publicOpenClassPostTemplates.map((post) => requestMetadata(post).subject).filter(Boolean),
    ]),
  ];
  const areaOptions = [
    ...new Set([
      ...classSearchAreas,
      ...publicOpenClassPostTemplates.map((post) => post.area).filter(Boolean),
    ]),
  ];

  const ranges = savedFreeRanges(availability, lessons);
  const hasAvailability = ranges.length > 0;

  // Include both available public posts and ones just applied in this view so the tutor can click through
  const results = filterTutorClasses(
    publicPosts,
    { subjects, areas, minFee, maxFee },
    availability,
    lessons.filter((l) => !recentlyAppliedIds.includes(l.classId)),
    dates
  );

  const reset = () => {
    setSubjects([]);
    setAreas([]);
    setMinFee(feeBounds.min);
    setMaxFee(feeBounds.max);
    setOpenChoices({ subjects: false, areas: false });
  };

  const handleApplyClass = (post) => {
    const result = applyPublicClass(post);
    if (result?.error) {
      setNotice(result.error);
      return;
    }
    setRecentlyAppliedIds((prev) => (prev.includes(post.id) ? prev : [...prev, post.id]));
    setNotice(`Đã ứng tuyển và nhận dạy lớp “${post.title}”. Lớp học đã được thêm vào mục Quản lý lớp học.`);
  };

  return (
    <TutorShell
      title="Tìm lớp phù hợp"
      subtitle="Khám phá bảng tin nhu cầu tìm gia sư công khai từ học viên trên hệ thống theo môn dạy, khu vực, học phí và lịch rảnh."
    >
      <div className="tutor-find__layout">
        <aside className="tutor-find__filters" aria-label="Bộ lọc tìm lớp">
          <div className="tutor-find__filter-heading">
            <h2>
              <SlidersHorizontal size={18} />
              Bộ lọc tìm lớp
            </h2>
            <Button variant="quiet" size="sm" onClick={reset}>
              Đặt lại
            </Button>
          </div>

          <div className="tutor-find__filter-controls">
            <Choices
              title="Môn học"
              options={subjectOptions}
              selected={subjects}
              onChange={setSubjects}
              open={openChoices.subjects}
              onToggle={() =>
                setOpenChoices((current) => ({ ...current, subjects: !current.subjects }))
              }
              searchable
            />
            <Choices
              title="Khu vực"
              options={areaOptions}
              selected={areas}
              onChange={setAreas}
              open={openChoices.areas}
              onToggle={() =>
                setOpenChoices((current) => ({ ...current, areas: !current.areas }))
              }
            />
            <FeeRange min={minFee} max={maxFee} onMinChange={setMinFee} onMaxChange={setMaxFee} />
          </div>

          <section className="tutor-find__saved-times" aria-label="Khung giờ từ lịch rảnh đã lưu">
            <h2>
              <CalendarDays size={18} />
              Khung giờ đã lưu
            </h2>
            {hasAvailability ? (
              <>
                <p>{ranges.length} khoảng thời gian</p>
                <details>
                  <summary>Xem các khoảng thời gian</summary>
                  <ul>
                    {ranges.map((range) => (
                      <li key={`${range.date}:${range.start}:${range.end}`}>
                        <strong>{shortDate(range.date)}</strong>
                        <span>
                          {timeLabel(range.start)}–{timeLabel(range.end)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            ) : (
              <p>Chưa có lịch rảnh đã lưu.</p>
            )}
            <Link className="text-link" to="/tutor/timetable">
              {hasAvailability ? 'Chỉnh sửa lịch rảnh' : 'Đăng ký lịch rảnh'} →
            </Link>
          </section>
        </aside>

        <section className="tutor-find__results" aria-label="Danh sách lớp đang tìm gia sư">
          {notice && (
            <p className="tutor-find__notice" role="status">
              <CheckCircle2 size={17} aria-hidden="true" />
              <span>{notice}</span>
            </p>
          )}

          {!hasAvailability ? (
            <div className="tutor-find__blocked" role="alert">
              <AlertCircle size={32} />
              <h2>Bạn cần đăng ký lịch rảnh trước khi tìm lớp phù hợp</h2>
              <p>
                Vào Lịch dạy học, thêm các khoảng thời gian rảnh và bấm <strong>Lưu lịch</strong>.
                Khung giờ đã lưu sẽ tự động được dùng để đối chiếu các lớp đang tìm gia sư phù hợp.
              </p>
              <Link className="button button--primary button--md" to="/tutor/timetable">
                Đăng ký lịch rảnh
              </Link>
            </div>
          ) : (
            <>
              <div className="tutor-find__result-heading">
                <div>
                  <span className="eyebrow">DANH SÁCH LỚP ĐANG TÌM GIA SƯ</span>
                  <h2 role="status" aria-live="polite">
                    {results.length} lớp phù hợp
                  </h2>
                </div>
                <span>
                  Tuần {dates[0].toLocaleDateString('vi-VN')} –{' '}
                  {dates[6].toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="tutor-find__result-help">
                Bảng tin hiển thị các nhu cầu tìm gia sư công khai từ học viên trên hệ thống có lịch học khớp với khung giờ rảnh bạn đã lưu.
              </p>
              {results.length ? (
                <div className="tutor-find__list">
                  {results.map((item) => (
                    <ClassResult
                      key={item.id}
                      item={item}
                      isApplied={appliedClassIds.has(item.id)}
                      onApply={handleApplyClass}
                    />
                  ))}
                </div>
              ) : (
                <div className="tutor-find__empty">
                  <Search size={30} />
                  <h3>Chưa có lớp công khai phù hợp</h3>
                  <p>
                    Thử chọn thêm môn, khu vực, mở rộng khoảng học phí hoặc cập nhật lịch rảnh của
                    bạn.
                  </p>
                  <Button variant="secondary" onClick={reset}>
                    Đặt lại bộ lọc
                  </Button>
                  <Link className="text-link" to="/tutor/timetable">
                    Cập nhật lịch rảnh →
                  </Link>
                </div>
              )}
            </>
          )}
          <p className="tutor-find__note">
            Dữ liệu bảng tin lớp công khai hoàn toàn độc lập với hộp thư Yêu cầu học gửi trực tiếp.
          </p>
        </section>
      </div>
    </TutorShell>
  );
}
