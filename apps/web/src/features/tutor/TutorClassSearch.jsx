import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BookOpen, CalendarDays, Check, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import { TutorShell } from './TutorPages.jsx';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { requestMetadata, feeBounds, filterTutorClasses, formatFee, savedFreeRanges } from '../../data/tutorClassSearch.js';
import { timeLabel, weekDates } from '../../data/tutorSchedule.js';
import './class-search.css';

const shortDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
const toggleChoice = (values, value) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function Choices({ title, options, selected, onChange }) {
  return <fieldset className="tutor-find__choices"><legend>{title}<small>Có thể chọn nhiều</small></legend>{options.map((option) => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(toggleChoice(selected, option))}/><span>{option}</span></label>)}</fieldset>;
}

function FeeRange({ min, max, onMinChange, onMaxChange }) {
  const percent = (value) => (value - feeBounds.min) / (feeBounds.max - feeBounds.min) * 100;
  return <fieldset className="tutor-find__fee"><legend>Khoảng học phí <small>VNĐ / buổi</small></legend><div className="tutor-find__fee-values"><output aria-label="Học phí từ">{formatFee(min)}</output><span>–</span><output aria-label="Học phí đến">{formatFee(max)}</output></div><div className="tutor-find__range" style={{ '--range-start': `${percent(min)}%`, '--range-end': `${percent(max)}%` }}><div className="tutor-find__range-track"/><input type="range" aria-label="Học phí tối thiểu" aria-valuetext={`${formatFee(min)} mỗi buổi`} min={feeBounds.min} max={feeBounds.max} step={feeBounds.step} value={min} onChange={(event) => onMinChange(Math.min(Number(event.target.value), max))} style={{ zIndex: min > feeBounds.max / 2 ? 3 : 2 }}/><input type="range" aria-label="Học phí tối đa" aria-valuetext={`${formatFee(max)} mỗi buổi`} min={feeBounds.min} max={feeBounds.max} step={feeBounds.step} value={max} onChange={(event) => onMaxChange(Math.max(Number(event.target.value), min))}/></div><div className="tutor-find__range-bounds"><span>{formatFee(feeBounds.min)}</span><span>{formatFee(feeBounds.max)}</span></div></fieldset>;
}

function ClassResult({ item }) {
  return <article className="tutor-find__class"><div className="tutor-find__class-heading"><div><span className="tutor-find__subject"><BookOpen size={16}/>{item.subject}</span><h3>{item.title} · {item.learner}</h3></div><strong className="tutor-find__price">{formatFee(item.sessionFee)}<small>/ buổi</small></strong></div><p>{item.note}</p><div className="tutor-find__class-meta"><span><MapPin size={16}/>{item.area}</span><Badge tone="success"><Check size={14}/>Khớp lịch rảnh</Badge></div><ul className="tutor-find__class-times">{item.proposals.map((proposal) => <li key={proposal.id}><CalendarDays size={15}/>{shortDate(proposal.date)} · {timeLabel(proposal.start)}–{timeLabel(proposal.end)}</li>)}</ul><Link className="text-link" to={`/tutor/requests/${item.id}`}>Xem chi tiết lớp →</Link></article>;
}

export default function TutorClassSearch() {
  const { requests, availability, lessons } = useTutorWorkspace();
  const [subjects, setSubjects] = useState([]);
  const [areas, setAreas] = useState([]);
  const [minFee, setMinFee] = useState(feeBounds.min);
  const [maxFee, setMaxFee] = useState(feeBounds.max);
  const choices = requests.filter((request) => request.status === 'pending' && Number.isFinite(requestMetadata(request).sessionFee));
  const subjectOptions = [...new Set(choices.map((request) => requestMetadata(request).subject).filter(Boolean))];
  const areaOptions = [...new Set(choices.map((request) => request.area).filter(Boolean))];
  const ranges = savedFreeRanges(availability, lessons);
  const hasAvailability = ranges.length > 0;
  const dates = weekDates();
  const results = filterTutorClasses(requests, { subjects, areas, minFee, maxFee }, availability, lessons, dates);
  const reset = () => { setSubjects([]); setAreas([]); setMinFee(feeBounds.min); setMaxFee(feeBounds.max); };
  return <TutorShell title="Tìm học viên mới" subtitle="Tìm lớp theo môn học, khu vực và học phí phù hợp với lịch rảnh của bạn.">
    <div className="tutor-find__layout"><aside className="tutor-find__filters" aria-label="Bộ lọc tìm lớp"><div className="tutor-find__filter-heading"><h2><SlidersHorizontal size={18}/>Bộ lọc tìm lớp</h2><Button variant="quiet" size="sm" onClick={reset}>Đặt lại</Button></div><fieldset className="tutor-find__filter-controls" disabled={!hasAvailability}><legend className="sr-only">Điều kiện tìm lớp</legend><Choices title="Môn học" options={subjectOptions} selected={subjects} onChange={setSubjects}/><Choices title="Khu vực" options={areaOptions} selected={areas} onChange={setAreas}/><FeeRange min={minFee} max={maxFee} onMinChange={setMinFee} onMaxChange={setMaxFee}/></fieldset><section className="tutor-find__saved-times" aria-label="Khung giờ từ lịch rảnh đã lưu"><h2><CalendarDays size={18}/>Khung giờ đã lưu</h2>{hasAvailability ? <><p>{ranges.length} khoảng thời gian</p><details><summary>Xem các khoảng thời gian</summary><ul>{ranges.map((range) => <li key={`${range.date}:${range.start}:${range.end}`}><strong>{shortDate(range.date)}</strong><span>{timeLabel(range.start)}–{timeLabel(range.end)}</span></li>)}</ul></details></> : <p>Chưa có lịch rảnh đã lưu.</p>}<Link className="text-link" to="/tutor/timetable">{hasAvailability ? 'Chỉnh sửa lịch rảnh' : 'Đăng ký lịch rảnh'} →</Link></section></aside>
      <section className="tutor-find__results" aria-label="Kết quả tìm lớp">{!hasAvailability ? <div className="tutor-find__blocked" role="alert"><AlertCircle size={32}/><h2>Bạn cần đăng ký lịch rảnh trước khi lọc lớp</h2><p>Vào Lịch dạy học, thêm các khoảng thời gian rảnh và bấm <strong>Lưu lịch</strong>. Khung giờ đã lưu sẽ tự động được dùng để tìm lớp phù hợp.</p><Link className="button button--primary button--md" to="/tutor/timetable">Đăng ký lịch rảnh</Link></div> : <><div className="tutor-find__result-heading"><div><span className="eyebrow">LỚP ĐANG TÌM GIA SƯ</span><h2 role="status" aria-live="polite">{results.length} lớp phù hợp</h2></div><span>Tuần {dates[0].toLocaleDateString('vi-VN')} – {dates[6].toLocaleDateString('vi-VN')}</span></div><p className="tutor-find__result-help">Chỉ hiển thị lớp có toàn bộ giờ dạy đề xuất nằm trong lịch rảnh đã lưu. Kết quả tự cập nhật khi thay đổi bộ lọc.</p>{results.length ? <div className="tutor-find__list">{results.map((item) => <ClassResult key={item.id} item={item}/>)}</div> : <div className="tutor-find__empty"><Search size={30}/><h3>Chưa có lớp phù hợp</h3><p>Thử chọn thêm môn, khu vực, mở rộng khoảng học phí hoặc cập nhật lịch rảnh của bạn.</p><Button variant="secondary" onClick={reset}>Đặt lại bộ lọc</Button><Link className="text-link" to="/tutor/timetable">Cập nhật lịch rảnh →</Link></div>}</>}<p className="tutor-find__note">Các lớp và học phí đang dùng dữ liệu minh họa trong bản demo.</p></section>
    </div>
  </TutorShell>;
}
