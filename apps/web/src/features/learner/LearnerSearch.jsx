import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../../components/Brand.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import LearnerHero from '../public/LearnerHero.jsx';
import { CheckboxFilter, FeeRangeFilter, QuickFilter } from './SearchFilters.jsx';
import TutorMap from './TutorMap.jsx';
import './search.css';
import SearchInput from '../../components/SearchInput.jsx';
import { availabilityOptions } from '../../data/tutors.js';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import TutorCard from './TutorCard.jsx';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import useDemoDomain, { useSavedTutors } from '../domain/DemoDomainContext.jsx';
import { isFutureSession, isValidProposal, localDateKey, selectPublicTutorSchedule, weekDates } from '../../data/tutorSchedule.js';
import { bookableSessions } from './profileSelection.js';

export default function LearnerSearch() {
  const tutors = useScheduledTutors();
  const domain = useDemoDomain();
  const subjectOptions = ['Tất cả môn', ...new Set(tutors.flatMap((tutor) => tutor.subjects))];
  const levelOptions = ['Tất cả cấp độ', ...new Set(tutors.flatMap((tutor) => tutor.levels || []))];
  const locationOptions = ['Tất cả khu vực', ...new Set(tutors.map((tutor) => tutor.location).filter(Boolean))];
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState([]);
  const [level, setLevel] = useState([]);
  const [location, setLocation] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedIds, setSavedIds] = useSavedTutors();
  const filterRef = useDialogFocus(() => setFiltersOpen(false), filtersOpen);
  const today = localDateKey(new Date());

  const feeError = useMemo(() => {
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0))) return 'Nhập mức phí bằng số và không nhỏ hơn 0.';
    if (min !== null && max !== null && min > max) return 'Mức phí tối thiểu không được lớn hơn mức phí tối đa.';
    return '';
  }, [minPrice, maxPrice]);
  const scheduleError = targetTime && !targetDate
    ? 'Chọn ngày học trước khi chọn giờ bắt đầu.'
    : targetDate && targetDate < today
      ? 'Ngày học phải từ hôm nay trở đi.'
      : '';

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi-VN');
    if (feeError || scheduleError) return [];
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    const selectedDate = targetDate ? new Date(`${targetDate}T12:00:00`) : null;
    const filtered = tutors.filter((tutor) => (
      (!normalized || [tutor.name, tutor.university, tutor.location, ...tutor.subjects, ...(tutor.levels || [])].join(' ').toLocaleLowerCase('vi-VN').includes(normalized)) &&
      (!subject.length || subject.some((value) => tutor.subjects.includes(value))) &&
      (!level.length || level.some((value) => (tutor.levels || []).includes(value))) &&
      (!location.length || location.includes(tutor.location)) &&
      (!availability.length || availability.some((value) => tutor.availability.includes(value))) &&
      (min === null || tutor.price >= min) &&
      (max === null || tutor.price <= max) &&
      (!selectedDate || (() => {
        const schedule = selectPublicTutorSchedule(domain, tutor, weekDates(0, selectedDate), tutor.sessionMinutes);
        const ranges = schedule.ranges.filter((range) => range.date === targetDate);
        const sessions = bookableSessions(ranges, schedule.sessionMinutes);
        if (!targetTime) return sessions.some((session) => isFutureSession(session));
        const [hours, minutes] = targetTime.split(':').map(Number);
        const start = hours * 60 + minutes;
        const proposal = { date: targetDate, start, end: start + schedule.sessionMinutes };
        return isFutureSession(proposal) && isValidProposal(proposal, ranges, schedule.sessionMinutes);
      })())
    ));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [tutors, domain, query, subject, level, location, availability, targetDate, targetTime, minPrice, maxPrice, feeError, scheduleError, sortBy]);

  const activeFilterCount = subject.length + level.length + location.length + availability.length + Number(Boolean(targetDate || targetTime)) + Number(minPrice !== '') + Number(maxPrice !== '');
  const toggleSave = (id) => setSavedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const clearFilters = () => { setQuery(''); setSubject([]); setLevel([]); setLocation([]); setAvailability([]); setTargetDate(''); setTargetTime(''); setMinPrice(''); setMaxPrice(''); };

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader />
      <main>
        <LearnerHero searchTarget="#search-controls" howTarget="/learner#how" />
        <section className="learner-container search-controls" id="search-controls" aria-label="Tìm kiếm nhanh">
          <form className="search-quickbar" onSubmit={(event) => { event.preventDefault(); document.getElementById('ket-qua')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <label className="search-quickbar__query">Tên hoặc từ khóa<SearchInput id="tutor-search" value={query} onChange={setQuery} placeholder="Tên, môn học..." /></label>
            <QuickFilter title="Môn học" options={subjectOptions} selected={subject} onChange={setSubject} />
            <QuickFilter title="Cấp độ" options={levelOptions} selected={level} onChange={setLevel} />
            <QuickFilter title="Khu vực" options={locationOptions} selected={location} onChange={setLocation} />
            <QuickFilter title="Thời gian rảnh" options={availabilityOptions} selected={availability} onChange={setAvailability} />
            <FeeRangeFilter compact minValue={minPrice} maxValue={maxPrice} onMinChange={setMinPrice} onMaxChange={setMaxPrice} error={feeError} />
            <Button type="submit"><Search size={18} /> Tìm gia sư</Button>
          </form>
        </section>

        <div className="learner-container learner-content" id="ket-qua">
          <div className="learner-section-heading"><div><span className="eyebrow">KHÁM PHÁ GIA SƯ</span><h2>Một lựa chọn tốt bắt đầu từ sự phù hợp</h2></div><p>Lọc theo điều quan trọng với bạn, rồi so sánh trong một góc nhìn rõ ràng.</p></div>

          <div className="learner-layout">
            <aside ref={filterRef} tabIndex={-1} role={filtersOpen ? 'dialog' : undefined} aria-modal={filtersOpen ? true : undefined} className={`filter-panel ${filtersOpen ? 'is-open' : ''}`} aria-label="Bộ lọc gia sư">
              <div className="filter-panel__heading"><div><SlidersHorizontal size={18} aria-hidden="true" /><h3>Bộ lọc</h3>{activeFilterCount > 0 && <Badge tone="brand">{activeFilterCount}</Badge>}</div><button className="filter-panel__close icon-button" type="button" onClick={() => setFiltersOpen(false)} aria-label="Đóng bộ lọc"><X size={20} /></button></div>
              <CheckboxFilter title="Môn học" options={subjectOptions} selected={subject} onChange={setSubject} />
              <CheckboxFilter title="Cấp độ" options={levelOptions} selected={level} onChange={setLevel} />
              <CheckboxFilter title="Khu vực" options={locationOptions} selected={location} onChange={setLocation} />
              <CheckboxFilter title="Thời gian rảnh" options={availabilityOptions} selected={availability} onChange={setAvailability} />
              <div className="search-exact-time">
                <label htmlFor="search-availability-date">Ngày có thể học</label>
                <input id="search-availability-date" type="date" min={today} value={targetDate} onChange={(event) => { setTargetDate(event.target.value); if (!event.target.value) setTargetTime(''); }} />
                <label htmlFor="search-availability-time">Giờ bắt đầu (tùy chọn)</label>
                <input id="search-availability-time" type="time" step="300" value={targetTime} onChange={(event) => setTargetTime(event.target.value)} disabled={!targetDate} />
                {scheduleError && <small className="search-filter-error" role="alert">{scheduleError}</small>}
              </div>
              <button className="text-button filter-panel__clear" type="button" onClick={clearFilters}>Xóa bộ lọc</button>
              <Button className="filter-panel__apply" onClick={() => setFiltersOpen(false)}>Xem {results.length} gia sư</Button>
            </aside>

            <section className="learner-results" aria-label="Kết quả tìm gia sư">
              <div className="learner-results__toolbar"><div><strong>{results.length} gia sư phù hợp</strong><span> tại TP. Hồ Chí Minh</span></div><div className="learner-results__actions"><Button variant="secondary" size="sm" className="learner-results__filter" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} /> Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}</Button><label htmlFor="sort-tutors">Sắp xếp</label><select id="sort-tutors" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="recommended">Đề xuất</option><option value="rating">Đánh giá cao</option><option value="price">Học phí thấp</option></select></div></div>
              {feeError || scheduleError ? <div className="learner-empty"><h3>Kiểm tra lại bộ lọc</h3><p>{feeError || scheduleError}</p></div> : results.length ? <div className="tutor-results-grid">{results.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} saved={savedIds.includes(tutor.id)} onSave={toggleSave} />)}</div> : <div className="learner-empty"><Sparkles size={28} /><h3>Chưa tìm thấy gia sư phù hợp</h3><p>Thử mở rộng khu vực, lịch rảnh hoặc mức học phí để xem thêm lựa chọn.</p><Button variant="secondary" onClick={clearFilters}>Đặt lại bộ lọc</Button></div>}
            </section>

            <aside className="learner-support" id="vi-sao" aria-label="Thông tin hỗ trợ">
              <Link className="search-map-card" to="/learner/map"><span className="eyebrow">KHÁM PHÁ KHU VỰC</span><h3>Bản đồ gia sư gần bạn</h3><TutorMap compact /><p>Xem khu vực và khoảng cách giữa các gia sư.</p><span className="search-map-card__cta">Mở bản đồ <ArrowRight size={17} /></span></Link>
              <div className="learner-support__block learner-support__block--line"><span className="eyebrow">BẮT ĐẦU ĐƠN GIẢN</span><h3>Ba bước để bắt đầu</h3><ol><li><span>01</span>Chọn môn và khu vực</li><li><span>02</span>So sánh hồ sơ gia sư</li><li><span>03</span>Gửi yêu cầu học phù hợp</li></ol></div>
              <div className="learner-support__note"><BadgeCheck size={20} /><p><strong>Thông tin minh bạch</strong><br />Bạn luôn thấy mức phí và lịch rảnh trước khi quyết định.</p></div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="learner-footer"><div className="learner-container"><Brand compact /><p>Kết nối đúng người. Học theo cách của bạn.</p><span>Giao diện mẫu · TutorNearMe</span></div></footer>
      {filtersOpen && <button className="filter-scrim" type="button" onClick={() => setFiltersOpen(false)} aria-label="Đóng bộ lọc" />}
    </div>
  );
}
