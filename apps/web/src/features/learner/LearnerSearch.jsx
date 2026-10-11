import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../../components/Brand.jsx';
import Button from '../../components/Button.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import { QuickFilter } from './SearchFilters.jsx';
import './search.css';
import SearchInput from '../../components/SearchInput.jsx';
import { availabilityOptions } from '../../data/tutors.js';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import TutorCard from './TutorCard.jsx';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import { useSavedTutors } from '../domain/DemoDomainContext.jsx';

export default function LearnerSearch() {
  const tutors = useScheduledTutors();
  const subjectOptions = ['Tất cả môn', ...new Set(tutors.flatMap((tutor) => tutor.subjects))];
  const locationOptions = ['Tất cả khu vực', ...new Set(tutors.map((tutor) => tutor.location).filter(Boolean))];
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState([]);
  const [location, setLocation] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [maxPrice, setMaxPrice] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedIds, setSavedIds] = useSavedTutors();
  const filterRef = useDialogFocus(() => setFiltersOpen(false), filtersOpen);
  const resultsRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const closeFilters = () => setFiltersOpen(false);
    media.addEventListener('change', closeFilters);
    return () => media.removeEventListener('change', closeFilters);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi-VN');
    const filtered = tutors.filter((tutor) => (
      (!normalized || [tutor.name, tutor.university, tutor.location, ...tutor.subjects].join(' ').toLocaleLowerCase('vi-VN').includes(normalized)) &&
      (!subject.length || subject.some((value) => tutor.subjects.includes(value))) &&
      (!location.length || location.includes(tutor.location)) &&
      (!availability.length || availability.some((value) => tutor.availability.includes(value))) &&
      (maxPrice === 'all' || tutor.price <= Number(maxPrice))
    ));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [tutors, query, subject, location, availability, maxPrice, sortBy]);

  const activeFilterCount = subject.length + location.length + availability.length + Number(maxPrice !== 'all');
  const toggleSave = (id) => setSavedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const clearFilters = () => { setQuery(''); setSubject([]); setLocation([]); setAvailability([]); setMaxPrice('all'); };
  const filterGroups = [
    { title: 'Môn học', options: subjectOptions, selected: subject, onChange: setSubject },
    { title: 'Khu vực', options: locationOptions, selected: location, onChange: setLocation },
    { title: 'Thời gian rảnh', options: availabilityOptions, selected: availability, onChange: setAvailability },
  ];
  const priceLabel = `Đến ${Number(maxPrice).toLocaleString('vi-VN')}đ / buổi`;
  const showResults = (event) => {
    event.preventDefault();
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };

  return (
    <div className="public-page public-page--learner learner-page learner-search-page learner-search-view density-comfortable">
      <LearnerHeader compact />
      <main>
        <section className="learner-search-hero" aria-labelledby="learner-search-title">
          <div className="learner-container">
            <span className="eyebrow">GIA SƯ GẦN BẠN</span>
            <h1 id="learner-search-title">Tìm gia sư phù hợp với bạn</h1>
            <p>Khám phá gia sư theo môn học, khu vực, lịch rảnh và mức học phí mong muốn.</p>
            <form className="learner-search-form" role="search" aria-label="Tìm gia sư" onSubmit={showResults}>
              <label className="sr-only" htmlFor="tutor-search">Tên hoặc từ khóa</label>
              <SearchInput id="tutor-search" value={query} onChange={setQuery} placeholder="Tìm theo tên, môn học hoặc khu vực..." />
              <Button type="submit"><Search size={18} aria-hidden="true" /> Tìm gia sư</Button>
              <Button variant="secondary" className="learner-search-filter-toggle" aria-haspopup="dialog" aria-expanded={filtersOpen} aria-controls="search-filters" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={18} aria-hidden="true" /> Bộ lọc{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </Button>
            </form>
          </div>
        </section>

        <section className="learner-container learner-search-controls" aria-label="Lọc gia sư">
          <div ref={filterRef} id="search-filters" tabIndex={-1} role={filtersOpen ? 'dialog' : undefined} aria-modal={filtersOpen ? true : undefined} aria-label="Bộ lọc gia sư" className={`learner-search-filters ${filtersOpen ? 'is-open' : ''}`}>
            <div className="learner-search-filters__heading">
              <h2>Bộ lọc gia sư</h2>
              <button className="icon-button" type="button" onClick={() => setFiltersOpen(false)} aria-label="Đóng bộ lọc">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="learner-search-filter-grid">
              {filterGroups.map((group) => <QuickFilter key={group.title} {...group} />)}
              <label className="learner-search-price" htmlFor="filter-price">Học phí tối đa
                <select id="filter-price" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
                  <option value="all">Mọi mức phí</option>
                  <option value="160000">Đến 160.000đ / buổi</option>
                  <option value="180000">Đến 180.000đ / buổi</option>
                  <option value="200000">Đến 200.000đ / buổi</option>
                </select>
              </label>
              <button className="text-button learner-search-clear" type="button" disabled={!activeFilterCount && !query} onClick={clearFilters}>Xóa bộ lọc</button>
            </div>
            <Button className="learner-search-filters__apply" onClick={() => setFiltersOpen(false)}>Xem {results.length} gia sư</Button>
          </div>
          {activeFilterCount > 0 && (
            <div className="learner-search-chips" aria-label="Bộ lọc đang áp dụng">
              {filterGroups.flatMap(({ title, selected, onChange }) => selected.map((value) => (
                <button key={`${title}-${value}`} type="button" aria-label={`Bỏ ${title.toLocaleLowerCase('vi-VN')}: ${value}`} onClick={() => onChange(selected.filter((item) => item !== value))}>
                  {value}<X size={14} aria-hidden="true" />
                </button>
              )))}
              {maxPrice !== 'all' && (
                <button type="button" aria-label={`Bỏ học phí: ${priceLabel}`} onClick={() => setMaxPrice('all')}>
                  {priceLabel}<X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </section>

        <section ref={resultsRef} tabIndex={-1} className="learner-container learner-content learner-search-results" id="ket-qua" aria-label="Kết quả tìm gia sư">
          <div className="learner-results__toolbar">
            <div>
              <h2>Gia sư phù hợp</h2>
              <p role="status" aria-live="polite">{results.length} gia sư phù hợp tại TP. Hồ Chí Minh</p>
            </div>
            <div className="learner-results__actions">
              <Link className="learner-search-map-link" to="/learner/map"><MapPin size={17} aria-hidden="true" /> Xem bản đồ</Link>
              <label htmlFor="sort-tutors">Sắp xếp</label>
              <select id="sort-tutors" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="recommended">Đề xuất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price">Học phí thấp</option>
              </select>
            </div>
          </div>
          {results.length ? (
            <div className="tutor-results-grid">
              {results.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} saved={savedIds.includes(tutor.id)} onSave={toggleSave} />)}
            </div>
          ) : (
            <div className="learner-empty">
              <Sparkles size={28} aria-hidden="true" />
              <h3>Chưa tìm thấy gia sư phù hợp</h3>
              <p>Thử mở rộng khu vực, lịch rảnh hoặc mức học phí để xem thêm lựa chọn.</p>
              <Button variant="secondary" onClick={clearFilters}>Đặt lại bộ lọc</Button>
            </div>
          )}
        </section>
      </main>

      <footer className="learner-footer"><div className="learner-container"><Brand compact /><p>Kết nối đúng người. Học theo cách của bạn.</p><span>Giao diện mẫu · TutorNearMe</span></div></footer>
      {filtersOpen && <div className="learner-search-scrim" onClick={() => setFiltersOpen(false)} aria-hidden="true" />}
    </div>
  );
}
