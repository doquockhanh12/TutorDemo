import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpenCheck, ChevronDown, Menu, Search, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand.jsx';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import RoleSwitcher from '../../components/RoleSwitcher.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { availabilityOptions, locationOptions, subjectOptions, tutors } from '../../data/tutors.js';
import TutorCard from './TutorCard.jsx';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import useDemoStorage from '../../hooks/useDemoStorage.js';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value);

function TutorQuickView({ tutor, onClose }) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(tutor.subjects[0]);
  const [message, setMessage] = useState('');

  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} tabIndex={-1} className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <button className="icon-button quick-view__close" type="button" onClick={onClose} aria-label="Đóng hồ sơ"><X size={20} /></button>
        <div className="quick-view__heading">
          <Avatar initials={tutor.initials} name={tutor.name} tone={tutor.avatarTone} size="xl" />
          <div><span className="eyebrow">HỒ SƠ GIA SƯ</span><h2 id="quick-view-title">{tutor.name}</h2><p>{tutor.university} · {tutor.experience}</p></div>
        </div>
        <div className="quick-view__details">
          <span><Star size={17} fill="currentColor" /> {tutor.rating} / 5 · {tutor.reviews} đánh giá</span>
          <span>{tutor.location} · {tutor.availability.join(', ')}</span>
          <strong>{money(tutor.price)}đ / buổi</strong>
        </div>
        <p className="quick-view__intro">{tutor.intro}</p>
          <form className="quick-view__form" onSubmit={(event) => { event.preventDefault(); navigate(`/requests/new?tutor=${tutor.id}&subject=${encodeURIComponent(subject)}&goal=${encodeURIComponent(message)}`); }}>
            <h3>Gửi yêu cầu học</h3>
            <label htmlFor="quick-subject">Môn học</label>
            <select id="quick-subject" value={subject} onChange={(event) => setSubject(event.target.value)}>{tutor.subjects.map((item) => <option key={item}>{item}</option>)}</select>
            <label htmlFor="quick-message">Lời nhắn cho gia sư</label>
            <textarea id="quick-message" rows="3" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Chia sẻ mục tiêu học và thời gian phù hợp..." />
            <Button type="submit">Tiếp tục gửi yêu cầu <ArrowRight size={17} aria-hidden="true" /></Button>
          </form>
      </section>
    </div>
  );
}

export default function LearnerSearch() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState(subjectOptions[0]);
  const [location, setLocation] = useState(locationOptions[0]);
  const [availability, setAvailability] = useState(availabilityOptions[0]);
  const [maxPrice, setMaxPrice] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedIds, setSavedIds] = useDemoStorage('tnm.savedTutors', []);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi-VN');
    const filtered = tutors.filter((tutor) => (
      (!normalized || [tutor.name, tutor.university, tutor.location, ...tutor.subjects].join(' ').toLocaleLowerCase('vi-VN').includes(normalized)) &&
      (subject === 'Tất cả môn' || tutor.subjects.includes(subject)) &&
      (location === 'Tất cả khu vực' || tutor.location === location) &&
      (availability === 'Mọi khung giờ' || tutor.availability.includes(availability)) &&
      (maxPrice === 'all' || tutor.price <= Number(maxPrice))
    ));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [query, subject, location, availability, maxPrice, sortBy]);

  const activeFilterCount = [subject !== subjectOptions[0], location !== locationOptions[0], availability !== availabilityOptions[0], maxPrice !== 'all'].filter(Boolean).length;
  const toggleSave = (id) => setSavedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const clearFilters = () => { setQuery(''); setSubject(subjectOptions[0]); setLocation(locationOptions[0]); setAvailability(availabilityOptions[0]); setMaxPrice('all'); };

  return (
    <div className="learner-page density-comfortable">
      <header className="learner-header">
        <div className="learner-container learner-header__inner">
          <Brand />
          <nav className={`learner-header__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Điều hướng người học">
            <a className="is-current" href="#ket-qua" onClick={() => setMenuOpen(false)}>Tìm gia sư</a>
            <a href="#vi-sao" onClick={() => setMenuOpen(false)}>Vì sao chọn chúng tôi</a>
            <Link to="/tutor">Dành cho gia sư</Link>
            <div className="learner-header__demo"><RoleSwitcher /></div>
          </nav>
          <div className="learner-header__right"><span className="learner-header__place">TP. Hồ Chí Minh <ChevronDown size={14} /></span><RoleSwitcher /></div>
          <button className="icon-button learner-header__menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      <main>
        <section className="learner-hero">
          <div className="learner-container learner-hero__grid">
            <div className="learner-hero__copy">
              <span className="eyebrow">HỌC GẦN HƠN · TIẾN XA HƠN</span>
              <h1>Tìm người đồng hành <em>đúng với cách học</em> của bạn.</h1>
              <p>Khám phá gia sư sinh viên phù hợp môn học, khu vực, lịch rảnh và ngân sách. Bắt đầu bằng điều bạn đang cần.</p>
              <div className="learner-hero__search"><label className="sr-only" htmlFor="tutor-search">Tìm gia sư theo tên hoặc môn học</label><SearchInput id="tutor-search" value={query} onChange={setQuery} placeholder="Tìm theo tên, môn học hoặc khu vực" /><a className="button button--primary button--md" href="#ket-qua"><Search size={18} aria-hidden="true" /> Tìm gia sư</a></div>
              <div className="learner-hero__trust"><BadgeCheck size={17} aria-hidden="true" /> Hồ sơ rõ ràng <span /> <BookOpenCheck size={17} aria-hidden="true" /> Lịch học linh hoạt</div>
            </div>
            <div className="learner-hero__editorial" aria-hidden="true">
              <div className="learner-hero__shape"><span className="learner-hero__circle">TN</span></div>
              <div className="learner-hero__quote"><span>“</span><p>Mỗi người học đều xứng đáng với một cách học phù hợp.</p><small>TUTORNEARME · KẾT NỐI ĐỂ CÙNG TIẾN BỘ</small></div>
            </div>
          </div>
        </section>

        <div className="learner-container learner-content" id="ket-qua">
          <div className="learner-section-heading"><div><span className="eyebrow">KHÁM PHÁ GIA SƯ</span><h2>Một lựa chọn tốt bắt đầu từ sự phù hợp</h2></div><p>Lọc theo điều quan trọng với bạn, rồi so sánh trong một góc nhìn rõ ràng.</p></div>

          <div className="learner-layout">
            <aside className={`filter-panel ${filtersOpen ? 'is-open' : ''}`} aria-label="Bộ lọc gia sư">
              <div className="filter-panel__heading"><div><SlidersHorizontal size={18} aria-hidden="true" /><h3>Bộ lọc</h3>{activeFilterCount > 0 && <Badge tone="brand">{activeFilterCount}</Badge>}</div><button className="filter-panel__close icon-button" type="button" onClick={() => setFiltersOpen(false)} aria-label="Đóng bộ lọc"><X size={20} /></button></div>
              <div className="filter-field"><label htmlFor="filter-subject">Môn học</label><select id="filter-subject" value={subject} onChange={(event) => setSubject(event.target.value)}>{subjectOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
              <div className="filter-field"><label htmlFor="filter-location">Khu vực</label><select id="filter-location" value={location} onChange={(event) => setLocation(event.target.value)}>{locationOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
              <div className="filter-field"><label htmlFor="filter-availability">Lịch rảnh</label><select id="filter-availability" value={availability} onChange={(event) => setAvailability(event.target.value)}>{availabilityOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
              <div className="filter-field"><label htmlFor="filter-price">Học phí tối đa</label><select id="filter-price" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="all">Không giới hạn</option><option value="160000">Tối đa 160.000đ / buổi</option><option value="180000">Tối đa 180.000đ / buổi</option><option value="200000">Tối đa 200.000đ / buổi</option></select></div>
              <button className="text-button filter-panel__clear" type="button" onClick={clearFilters}>Xóa bộ lọc</button>
              <Button className="filter-panel__apply" onClick={() => setFiltersOpen(false)}>Xem {results.length} gia sư</Button>
            </aside>

            <section className="learner-results" aria-label="Kết quả tìm gia sư">
              <div className="learner-results__toolbar"><div><strong>{results.length} gia sư phù hợp</strong><span> tại TP. Hồ Chí Minh</span></div><div className="learner-results__actions"><Button variant="secondary" size="sm" className="learner-results__filter" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} /> Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}</Button><label htmlFor="sort-tutors">Sắp xếp</label><select id="sort-tutors" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="recommended">Đề xuất</option><option value="rating">Đánh giá cao</option><option value="price">Học phí thấp</option></select></div></div>
              {results.length ? <div className="tutor-results-grid">{results.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} saved={savedIds.includes(tutor.id)} onSave={toggleSave} onOpen={setSelectedTutor} />)}</div> : <div className="learner-empty"><Sparkles size={28} /><h3>Chưa tìm thấy gia sư phù hợp</h3><p>Thử mở rộng khu vực, lịch rảnh hoặc mức học phí để xem thêm lựa chọn.</p><Button variant="secondary" onClick={clearFilters}>Đặt lại bộ lọc</Button></div>}
            </section>

            <aside className="learner-support" id="vi-sao" aria-label="Thông tin hỗ trợ">
              <div className="learner-support__block"><span className="eyebrow">CHỌN CÓ CƠ SỞ</span><h3>Hồ sơ đủ rõ để bạn yên tâm.</h3><p>Xem môn dạy, khu vực, lịch rảnh, học phí và đánh giá trước khi gửi yêu cầu.</p><div className="learner-support__avatars"><Avatar initials="MA" name="Mai Anh" tone="blue" size="sm" /><Avatar initials="QB" name="Quốc Bảo" tone="coral" size="sm" /><Avatar initials="HL" name="Hà Linh" tone="yellow" size="sm" /><span>Gia sư phù hợp đang ở gần bạn</span></div></div>
              <div className="learner-support__block learner-support__block--line"><span className="eyebrow">BẮT ĐẦU ĐƠN GIẢN</span><h3>Ba bước để bắt đầu</h3><ol><li><span>01</span>Chọn môn và khu vực</li><li><span>02</span>So sánh hồ sơ gia sư</li><li><span>03</span>Gửi yêu cầu học phù hợp</li></ol></div>
              <div className="learner-support__note"><BadgeCheck size={20} /><p><strong>Thông tin minh bạch</strong><br />Bạn luôn thấy mức phí và lịch rảnh trước khi quyết định.</p></div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="learner-footer"><div className="learner-container"><Brand compact /><p>Kết nối đúng người. Học theo cách của bạn.</p><span>Giao diện mẫu · TutorNearMe</span></div></footer>
      {filtersOpen && <button className="filter-scrim" type="button" onClick={() => setFiltersOpen(false)} aria-label="Đóng bộ lọc" />}
      {selectedTutor && <TutorQuickView key={selectedTutor.id} tutor={selectedTutor} onClose={() => setSelectedTutor(null)} />}
    </div>
  );
}
