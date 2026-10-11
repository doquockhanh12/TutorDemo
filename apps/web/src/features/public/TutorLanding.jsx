import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  DollarSign,
  GraduationCap,
  Home,
  Laptop,
  MapPin,
  Navigation,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { PublicFooter, PublicHeader, SectionHead } from './PublicChrome.jsx';
import { money, photo, publicRequests } from '../../data/public.js';

// Days and shifts for the weekly availability matrix
const DAYS_OF_WEEK = [
  { id: 'T2', name: 'Thứ 2' },
  { id: 'T3', name: 'Thứ 3' },
  { id: 'T4', name: 'Thứ 4' },
  { id: 'T5', name: 'Thứ 5' },
  { id: 'T6', name: 'Thứ 6' },
  { id: 'T7', name: 'Thứ 7' },
  { id: 'CN', name: 'Chủ Nhật' },
];

const SHIFTS = [
  { id: 'sang', name: 'Sáng', time: '08:00 – 11:30' },
  { id: 'chieu', name: 'Chiều', time: '14:00 – 17:30' },
  { id: 'toi', name: 'Tối', time: '18:30 – 21:00' },
];

const DEFAULT_SLOTS = [
  'T2-toi',
  'T3-toi',
  'T4-chieu',
  'T5-toi',
  'T6-toi',
  'T7-sang',
  'T7-chieu',
  'CN-sang',
];

export default function TutorLanding() {
  // Filter states
  const [subject, setSubject] = useState('Tất cả môn');
  const [area, setArea] = useState('Tất cả khu vực');
  const [distance, setDistance] = useState('all'); // 'all', '3', '5', '10'
  const [format, setFormat] = useState('all'); // 'all', 'Tại nhà', 'Online'
  const [time, setTime] = useState('Mọi khung giờ');
  const [minFee, setMinFee] = useState('0');
  const [sort, setSort] = useState('fit');

  // Income calculator states
  const [fee, setFee] = useState(250000);
  const [sessions, setSessions] = useState(4);

  // Availability matrix state
  const [selectedSlots, setSelectedSlots] = useState(DEFAULT_SLOTS);

  // Modal dialog states
  const [selectedClass, setSelectedClass] = useState(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Filtered requests computation
  const filtered = useMemo(() => {
    return publicRequests
      .filter((r) => {
        const matchSubject = subject === 'Tất cả môn' || r.subject === subject;
        const matchArea = area === 'Tất cả khu vực' || r.area === area;
        const matchTime = time === 'Mọi khung giờ' || r.time === time;
        const matchFee = r.fee >= Number(minFee);
        const matchFormat = format === 'all' || r.format === format;
        const matchDistance =
          distance === 'all' || (r.distanceKm != null && r.distanceKm <= Number(distance));
        return matchSubject && matchArea && matchTime && matchFee && matchFormat && matchDistance;
      })
      .sort((a, b) => {
        if (sort === 'fee') return b.fee - a.fee;
        if (sort === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
        if (sort === 'recent') return publicRequests.indexOf(a) - publicRequests.indexOf(b);
        return b.fit - a.fit;
      });
  }, [subject, area, distance, format, time, minFee, sort]);

  const hasActiveFilters =
    subject !== 'Tất cả môn' ||
    area !== 'Tất cả khu vực' ||
    distance !== 'all' ||
    format !== 'all' ||
    time !== 'Mọi khung giờ' ||
    minFee !== '0';

  const resetFilters = () => {
    setSubject('Tất cả môn');
    setArea('Tất cả khu vực');
    setDistance('all');
    setFormat('all');
    setTime('Mọi khung giờ');
    setMinFee('0');
    setSort('fit');
  };

  // Toggle single slot
  const toggleSlot = (slotKey) => {
    setSelectedSlots((prev) =>
      prev.includes(slotKey) ? prev.filter((x) => x !== slotKey) : [...prev, slotKey]
    );
  };

  // Quick select matrix actions
  const selectAllEvenings = () => {
    const evenings = DAYS_OF_WEEK.map((d) => `${d.id}-toi`);
    setSelectedSlots((prev) => Array.from(new Set([...prev, ...evenings])));
  };

  const selectWeekends = () => {
    const weekendSlots = ['T7-sang', 'T7-chieu', 'T7-toi', 'CN-sang', 'CN-chieu', 'CN-toi'];
    setSelectedSlots((prev) => Array.from(new Set([...prev, ...weekendSlots])));
  };

  const selectAllSlots = () => {
    const all = [];
    DAYS_OF_WEEK.forEach((d) => {
      SHIFTS.forEach((s) => all.push(`${d.id}-${s.id}`));
    });
    setSelectedSlots(all);
  };

  const clearAllSlots = () => {
    setSelectedSlots([]);
  };

  return (
    <div className="public-page public-page--tutor">
      {/* 1. HEADER CỐ ĐỊNH (STICKY NAVBAR) */}
      <PublicHeader kind="tutor" />

      <main>
        {/* HERO SECTION */}
        <section className="public-hero public-hero--tutor">
          <div className="public-wrap public-hero__grid">
            <div className="public-hero__copy">
              <span className="public-hero__eyebrow">TUTORNEARME DÀNH CHO GIA SƯ</span>
              <h1>
                Biến kiến thức của bạn thành những <em>buổi học có giá trị.</em>
              </h1>
              <p>
                Tìm lớp dạy kèm theo môn, khu vực gần nhà, lịch rảnh và mức học phí mong muốn. Chủ động
                quyết định nhận lớp và xây dựng hồ sơ gia sư chuyên nghiệp.
              </p>
              <div className="public-hero__actions">
                <Link to="/tutor/register" className="public-btn public-btn--yellow">
                  Đăng ký làm Gia sư ngay <ArrowRight size={17} />
                </Link>
                <a className="public-hero__text-link" href="#profile">
                  Xem quy trình tạo hồ sơ ↘
                </a>
              </div>
              <div className="public-hero__proof">
                <span>
                  <BadgeCheck size={18} /> Lớp học xác thực
                </span>
                <span>
                  <CalendarDays size={18} /> Chủ động lịch dạy
                </span>
                <span>
                  <Zap size={18} /> Kết nối trực tiếp phụ huynh
                </span>
              </div>
            </div>
            <div className="public-hero__visual">
              <img
                className="public-hero__photo-main"
                src={photo.tutorHero}
                alt="Gia sư sinh viên đang hướng dẫn học tập"
              />
              <img
                className="public-hero__photo-side"
                src={photo.tutorSide}
                alt="Buổi học nhóm cùng gia sư nhiệt huyết"
              />
              <span className="public-float public-float--yellow">
                <b>Chủ động</b>
                <small>lớp học · lịch rảnh · học phí</small>
              </span>
              <span className="public-float public-float--location">
                <b>LỚP HỌC MỚI</b>
                <small>Toán 12 · TP. Thủ Đức</small>
              </span>
            </div>
          </div>
        </section>

        {/* 2. SECTION TÌM KIẾM LỚP HỌC (BỘ LỌC) */}
        <section className="public-section public-tutor-setup" id="setup">
          <div className="public-wrap">
            <div className="public-tutor-setup__title">
              <b>01</b>
              <div>
                <span className="public-kicker">TÌM KIẾM LỚP HỌC PHÙ HỢP</span>
                <h2>Bộ lọc lớp học theo tiêu chí của bạn</h2>
              </div>
            </div>

            <div className="public-tutor-setup__fields public-tutor-setup__fields--enhanced">
              <label>
                Môn học
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option>Tất cả môn</option>
                  <option>Toán</option>
                  <option>Tiếng Anh</option>
                  <option>Tin học</option>
                  <option>IELTS</option>
                  <option>Vật lý</option>
                  <option>Hóa học</option>
                  <option>Tiếng Nhật</option>
                </select>
              </label>

              <label>
                Khu vực
                <select value={area} onChange={(e) => setArea(e.target.value)}>
                  <option>Tất cả khu vực</option>
                  <option>Thủ Đức</option>
                  <option>Quận 1</option>
                  <option>Bình Thạnh</option>
                  <option>Quận 3</option>
                  <option>Phú Nhuận</option>
                </select>
              </label>

              <label>
                Khoảng cách địa lý
                <select value={distance} onChange={(e) => setDistance(e.target.value)}>
                  <option value="all">Tất cả khoảng cách</option>
                  <option value="3">&lt; 3 km (Rất gần nhà)</option>
                  <option value="5">&lt; 5 km (Thuận tiện di chuyển)</option>
                  <option value="10">&lt; 10 km (Bán kính mở rộng)</option>
                </select>
              </label>

              <label>
                Hình thức dạy
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="all">Tất cả hình thức</option>
                  <option value="Tại nhà">Dạy tại nhà</option>
                  <option value="Online">Học Online</option>
                </select>
              </label>

              <label>
                Khung giờ dạy
                <select value={time} onChange={(e) => setTime(e.target.value)}>
                  <option>Mọi khung giờ</option>
                  <option>Buổi sáng</option>
                  <option>Buổi chiều</option>
                  <option>Buổi tối</option>
                  <option>Cuối tuần</option>
                </select>
              </label>

              <label>
                Mức phí từ
                <select value={minFee} onChange={(e) => setMinFee(e.target.value)}>
                  <option value="0">Không giới hạn</option>
                  <option value="200000">Từ 200.000đ / buổi</option>
                  <option value="250000">Từ 250.000đ / buổi</option>
                  <option value="300000">Từ 300.000đ / buổi</option>
                </select>
              </label>

              <div className="public-tutor-setup__action-cell">
                <a href="#opportunities" className="public-btn public-btn--yellow public-btn--full">
                  <SlidersHorizontal size={17} /> Áp dụng bộ lọc
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION DANH SÁCH LỚP HỌC (CARD COMPONENT) */}
        <section className="public-section public-opportunities" id="opportunities">
          <div className="public-wrap">
            {/* Thanh công cụ danh sách lớp học (KHÔNG có header bị đặt nhầm) */}
            <div className="public-opportunities__header-bar">
              <div className="public-opportunities__headline">
                <span className="public-kicker">CƠ HỘI NHẬN LỚP MỚI NHẤT</span>
                <h2>Danh sách lớp học đang tìm Gia sư</h2>
                <p>
                  Các yêu cầu học kèm được kiểm duyệt thông tin và cập nhật liên tục từ phụ huynh &amp; học viên.
                </p>
              </div>

              <div className="public-results-head__tools">
                <span className="public-results-counter">
                  <strong>{filtered.length}</strong> lớp học phù hợp
                </span>

                <label>
                  Sắp xếp:
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="fit">Độ phù hợp cao nhất</option>
                    <option value="distance">Gần tôi nhất</option>
                    <option value="fee">Học phí cao nhất</option>
                    <option value="recent">Mới đăng gần đây</option>
                  </select>
                </label>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="public-filter-reset-btn"
                    onClick={resetFilters}
                    title="Đặt lại tất cả bộ lọc"
                  >
                    <RotateCcw size={14} /> Đặt lại
                  </button>
                )}
              </div>
            </div>

            {/* Grid các thẻ lớp học */}
            {filtered.length ? (
              <div className="public-request-grid">
                {filtered.map((request) => (
                  <article className="public-request-card public-request-card--enhanced" key={request.id}>
                    {/* Hàng badge trên cùng: Môn học + Khoảng cách + Hình thức */}
                    <div className="public-request-card__top">
                      <div className="public-request-card__badges">
                        <span className="public-card-badge public-card-badge--subject">
                          {request.subject}
                        </span>

                        <span className="public-card-badge public-card-badge--distance">
                          <Navigation size={13} /> Cách bạn {request.distanceKm} km
                        </span>

                        <span
                          className={`public-card-badge ${request.format === 'Online'
                              ? 'public-card-badge--online'
                              : 'public-card-badge--home'
                            }`}
                        >
                          {request.format === 'Online' ? (
                            <>
                              <Laptop size={13} /> Online
                            </>
                          ) : (
                            <>
                              <Home size={13} /> Tại nhà
                            </>
                          )}
                        </span>
                      </div>

                      <small className="public-request-card__age">{request.age}</small>
                    </div>

                    <h3 className="public-request-card__title">{request.title}</h3>

                    {/* Thông tin thực tế: Địa chỉ, Lịch học, Yêu cầu */}
                    <div className="public-request-card__facts">
                      <span>
                        <MapPin size={15} /> {request.location}
                      </span>
                      <span>
                        <Clock3 size={15} /> {request.schedule}
                      </span>
                      <span>
                        <GraduationCap size={15} /> {request.requirements}
                      </span>
                    </div>

                    {/* Hàng dưới cùng: Học phí + Nút nổi bật */}
                    <div className="public-request-card__bottom">
                      <div className="public-request-card__fee">
                        <small>Mức học phí</small>
                        <strong>
                          {money(request.fee)}đ <small>/ buổi</small>
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="public-btn public-btn--apply"
                        onClick={() => setSelectedClass(request)}
                      >
                        Xem chi tiết &amp; Nhận lớp <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="public-empty">
                <h3>Không tìm thấy lớp học nào khớp bộ lọc</h3>
                <p>Thử mở rộng bán kính khoảng cách, môn học hoặc mức học phí mong muốn.</p>
                <button className="public-btn public-btn--blue" onClick={resetFilters}>
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            <div className="public-section__end">
              <Link to="/tutor/register" className="public-btn public-btn--outline-blue">
                Đăng ký hồ sơ để nhận lớp tự động <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. SECTION CÔNG CỤ TÍNH THU NHẬP */}
        <section className="public-section public-tutor-income" id="income">
          <div className="public-wrap public-tutor-income__grid">
            <div className="public-tutor-income__left">
              <SectionHead
                kicker="CHỦ ĐỘNG MỨC THU NHẬP"
                title="Ước tính thu nhập hàng tháng theo lịch dạy của bạn."
                text="Tùy chỉnh mức học phí và số buổi dạy bạn có thể duy trì mỗi tuần. Gia sư nhận 100% học phí trực tiếp từ học viên hoặc phụ huynh sau từng buổi học hoặc theo tháng."
                light
              />

              <div className="public-tutor-income__features">
                <div className="public-tutor-income__feature-item">
                  <CheckCircle2 size={20} />
                  <span>Không thu phí hoa hồng định kỳ trên từng buổi dạy</span>
                </div>
                <div className="public-tutor-income__feature-item">
                  <CheckCircle2 size={20} />
                  <span>Chủ động đề xuất và thống nhất mức phí với phụ huynh</span>
                </div>
                <div className="public-tutor-income__feature-item">
                  <CheckCircle2 size={20} />
                  <span>Thanh toán minh bạch, trực tiếp qua chuyển khoản hoặc tiền mặt</span>
                </div>
              </div>

              {/* Các mốc ví dụ thu nhập */}
              <div className="public-income-presets">
                <span className="public-income-presets__title">Các mốc lịch dạy phổ biến:</span>
                <div className="public-income-presets__grid">
                  <button
                    type="button"
                    className="public-income-preset-card"
                    onClick={() => {
                      setFee(200000);
                      setSessions(3);
                    }}
                  >
                    <small>Lịch nhẹ nhàng</small>
                    <strong>{money(200000 * 3 * 4)}đ/tháng</strong>
                    <span>3 buổi/tuần · 200k/buổi</span>
                  </button>

                  <button
                    type="button"
                    className="public-income-preset-card is-popular"
                    onClick={() => {
                      setFee(250000);
                      setSessions(5);
                    }}
                  >
                    <span className="public-income-preset-tag">Phổ biến</span>
                    <small>Lịch tiêu chuẩn</small>
                    <strong>{money(250000 * 5 * 4)}đ/tháng</strong>
                    <span>5 buổi/tuần · 250k/buổi</span>
                  </button>

                  <button
                    type="button"
                    className="public-income-preset-card"
                    onClick={() => {
                      setFee(300000);
                      setSessions(8);
                    }}
                  >
                    <small>Lịch chuyên tâm</small>
                    <strong>{money(300000 * 8 * 4)}đ/tháng</strong>
                    <span>8 buổi/tuần · 300k/buổi</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="public-calculator public-calculator--highlighted">
              <label>
                Mức phí mong muốn mỗi buổi
                <strong className="public-calculator__val">{money(fee)}đ / buổi</strong>
                <input
                  type="range"
                  min="150000"
                  max="500000"
                  step="10000"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                />
              </label>

              <label>
                Số buổi có thể dạy mỗi tuần
                <strong className="public-calculator__val">{sessions} buổi / tuần</strong>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="1"
                  value={sessions}
                  onChange={(e) => setSessions(Number(e.target.value))}
                />
              </label>

              {/* Con số tổng thu nhập ước tính cực kỳ nổi bật */}
              <div className="public-calculator__result public-calculator__result--prominent">
                <div className="public-calculator__result-info">
                  <span className="public-calculator__result-label">Thu nhập dự tính hàng tháng</span>
                  <small className="public-calculator__result-formula">
                    {money(fee)}đ × {sessions} buổi/tuần × 4 tuần
                  </small>
                </div>

                <div className="public-calculator__big-number">
                  <strong>{money(fee * sessions * 4)}</strong>
                  <span className="public-calculator__currency">VNĐ / tháng</span>
                </div>
              </div>

              <div className="public-calculator__footer-note">
                <CircleDollarSign size={18} />
                <span>
                  Khoản thu nhập thực tế do bạn toàn quyền quản lý và nhận trực tiếp từ học viên.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECTION CHỌN LỊCH RẢNH (MA TRẬN LỊCH LÀM VIỆC SÁNG - CHIỀU - TỐI) */}
        <section className="public-section public-tutor-profile" id="profile">
          <div className="public-wrap">
            <SectionHead
              kicker="QUY TRÌNH &amp; LỊCH LÀM VIỆC"
              title="Thiết lập lịch rảnh và sẵn sàng nhận lớp trong 3 bước."
              text="Chủ động đánh dấu các khung giờ bạn có thể nhận lớp để hệ thống tự động kết nối những học sinh phù hợp nhất."
            />

            <div className="public-tutor-profile__steps">
              <div className="public-step-item">
                <span>01</span>
                <h3>Cập nhật chuyên môn</h3>
                <p>Chọn môn dạy, trình độ, trường đại học và phương pháp giảng dạy thế mạnh của bạn.</p>
              </div>
              <div className="public-step-item">
                <span>02</span>
                <h3>Chọn lịch rảnh &amp; khu vực</h3>
                <p>Đánh dấu các buổi rảnh trong tuần và bán kính di chuyển bạn sẵn sàng nhận dạy.</p>
              </div>
              <div className="public-step-item">
                <span>03</span>
                <h3>Xác thực &amp; Nhận lớp</h3>
                <p>Xác thực thẻ sinh viên/văn bằng để tăng độ uy tín và nhận ngay các đề nghị lớp dạy.</p>
              </div>
            </div>

            <div className="public-tutor-profile__lower">
              {/* MA TRẬN LỊCH LÀM VIỆC SÁNG - CHIỀU - TỐI CHO TỪNG THỨ TRONG TUẦN */}
              <div className="public-availability public-availability--matrix-card">
                <div className="public-availability__head">
                  <div>
                    <span className="public-kicker">MA TRẬN LỊCH DẠY TRONG TUẦN</span>
                    <h3>Chọn các khung giờ bạn có thể dạy</h3>
                    <p>Nhấp vào từng ô để bật/tắt lịch rảnh. Hệ thống sẽ lọc lớp phù hợp theo ma trận này.</p>
                  </div>

                  <div className="public-matrix-quick-actions">
                    <button type="button" onClick={selectAllEvenings}>
                      Chọn các buổi tối
                    </button>
                    <button type="button" onClick={selectWeekends}>
                      Chọn cuối tuần
                    </button>
                    <button type="button" onClick={selectAllSlots}>
                      Chọn tất cả
                    </button>
                    <button type="button" onClick={clearAllSlots}>
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Bảng ma trận */}
                <div className="public-matrix-wrapper">
                  <table className="public-matrix-table">
                    <thead>
                      <tr>
                        <th className="public-matrix-th-corner">Ca dạy</th>
                        {DAYS_OF_WEEK.map((day) => (
                          <th key={day.id} className="public-matrix-th-day">
                            <strong>{day.name}</strong>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SHIFTS.map((shift) => (
                        <tr key={shift.id}>
                          <td className="public-matrix-td-shift">
                            <strong>{shift.name}</strong>
                            <small>{shift.time}</small>
                          </td>
                          {DAYS_OF_WEEK.map((day) => {
                            const slotKey = `${day.id}-${shift.id}`;
                            const isSelected = selectedSlots.includes(slotKey);
                            return (
                              <td key={slotKey} className="public-matrix-td-cell">
                                <button
                                  type="button"
                                  className={`public-matrix-cell-btn ${isSelected ? 'is-active' : ''}`}
                                  aria-pressed={isSelected}
                                  onClick={() => toggleSlot(slotKey)}
                                  title={`${day.name} - ${shift.name} (${shift.time})`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check size={16} />
                                      <span>Rảnh</span>
                                    </>
                                  ) : (
                                    <span className="public-matrix-cell-empty">+</span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="public-availability__summary-bar">
                  <div className="public-availability__badge">
                    <Sparkles size={16} />
                    <span>
                      Đã chọn <strong>{selectedSlots.length} / 21</strong> khung giờ trong tuần
                    </span>
                  </div>
                  <small>
                    Lịch rảnh linh hoạt giúp bạn nhận được nhiều đề nghị lớp học phù hợp và thuận tiện nhất.
                  </small>
                </div>
              </div>

              {/* Thẻ quyền riêng tư và an toàn */}
              <div className="public-privacy-card">
                <ShieldCheck size={40} />
                <span className="public-kicker">AN TOÀN &amp; BẢO MẬT</span>
                <h3>Thông tin cá nhân được bảo vệ nghiêm ngặt.</h3>
                <p>
                  Số điện thoại, địa chỉ cụ thể và giấy tờ tùy thân của bạn chỉ được chia sẻ khi cả hai bên
                  thống nhất nhận lớp. Mọi thông tin đều được mã hóa theo tiêu chuẩn an toàn bảo mật.
                </p>
                <div className="public-privacy-card__points">
                  <div className="public-privacy-card__point">
                    <Check size={16} />
                    <span>Bảo vệ quyền riêng tư số điện thoại &amp; địa chỉ nhà</span>
                  </div>
                  <div className="public-privacy-card__point">
                    <Check size={16} />
                    <span>Hợp đồng và điều khoản nhận lớp rõ ràng, minh bạch</span>
                  </div>
                  <div className="public-privacy-card__point">
                    <Check size={16} />
                    <span>Đội ngũ hỗ trợ 24/7 trong suốt quá trình dạy</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="public-privacy-btn"
                  onClick={() => setPrivacyModalOpen(true)}
                >
                  Tìm hiểu chính sách bảo mật <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. BANNER ĐĂNG KÝ (CTA) CUỐI TRANG - ĐỔI SANG MÀU XANH DƯƠNG CHỦ ĐẠO MATCHING HERO */}
        <section className="public-final public-final--tutor">
          <div className="public-wrap public-final__row">
            <div className="public-final__copy">
              <span className="public-final__eyebrow">GIA NHẬP CỘNG ĐỒNG GIA SƯ UY TÍN</span>
              <h2>Sẵn sàng bắt đầu những buổi dạy có giá trị?</h2>
              <p>
                Tham gia cùng hơn 5.000+ sinh viên và giáo viên đang giảng dạy trên toàn quốc. Đăng ký hồ sơ
                hoàn toàn miễn phí chỉ trong 3 phút.
              </p>
              <div className="public-final__perks">
                <span>✓ Nhận lớp nhanh trong 24 giờ</span>
                <span>✓ 100% học phí không trừ hoa hồng định kỳ</span>
                <span>✓ Hỗ trợ kết nối chuyên nghiệp</span>
              </div>
            </div>
            <div className="public-final__cta-box">
              <Link to="/tutor/register" className="public-btn public-btn--yellow public-btn--cta-large">
                Đăng ký làm Gia sư ngay <ArrowRight size={20} />
              </Link>
              <small>Chưa có tài khoản? Đăng ký hoàn toàn miễn phí</small>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER ĐƯỢC CHUẨN HÓA VỚI THÔNG TIN THẬT */}
      <PublicFooter />

      {/* MODAL CHI TIẾT LỚP HỌC KHI BẤM "XEM CHI TIẾT & NHẬN LỚP" */}
      {selectedClass && (
        <div
          className="public-dialog-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedClass(null);
          }}
        >
          <div className="public-dialog public-dialog--class-detail" role="dialog" aria-modal="true">
            <button
              className="public-dialog__close"
              type="button"
              onClick={() => setSelectedClass(null)}
              aria-label="Đóng"
            >
              <X size={20} />
            </button>

            <div className="public-dialog__header-tags">
              <span className="public-card-badge public-card-badge--subject">
                {selectedClass.subject}
              </span>
              <span className="public-card-badge public-card-badge--distance">
                <Navigation size={13} /> Cách bạn {selectedClass.distanceKm} km
              </span>
              <span
                className={`public-card-badge ${selectedClass.format === 'Online'
                    ? 'public-card-badge--online'
                    : 'public-card-badge--home'
                  }`}
              >
                {selectedClass.format === 'Online' ? (
                  <>
                    <Laptop size={13} /> Dạy Online
                  </>
                ) : (
                  <>
                    <Home size={13} /> Dạy tại nhà
                  </>
                )}
              </span>
            </div>

            <h2 className="public-dialog__title">{selectedClass.title}</h2>

            <div className="public-dialog__info-grid">
              <div className="public-dialog__info-row">
                <MapPin size={18} className="public-dialog__icon" />
                <div>
                  <strong>Địa điểm học tập:</strong>
                  <p>{selectedClass.location}</p>
                </div>
              </div>

              <div className="public-dialog__info-row">
                <Clock3 size={18} className="public-dialog__icon" />
                <div>
                  <strong>Thời gian &amp; Lịch học:</strong>
                  <p>{selectedClass.schedule}</p>
                </div>
              </div>

              <div className="public-dialog__info-row">
                <DollarSign size={18} className="public-dialog__icon" />
                <div>
                  <strong>Mức học phí:</strong>
                  <p className="public-dialog__fee-highlight">
                    {money(selectedClass.fee)}đ / buổi (Được thanh toán trực tiếp)
                  </p>
                </div>
              </div>

              <div className="public-dialog__info-row">
                <GraduationCap size={18} className="public-dialog__icon" />
                <div>
                  <strong>Yêu cầu đối với gia sư:</strong>
                  <p>{selectedClass.requirements}</p>
                </div>
              </div>

              <div className="public-dialog__info-row">
                <Users size={18} className="public-dialog__icon" />
                <div>
                  <strong>Thông tin học viên &amp; Mục tiêu:</strong>
                  <p>{selectedClass.learner}</p>
                </div>
              </div>
            </div>

            <div className="public-dialog__actions">
              <Link to="/tutor/register" className="public-btn public-btn--yellow">
                Đăng ký nhận lớp này ngay <ArrowRight size={17} />
              </Link>
              <button
                type="button"
                className="public-btn public-btn--outline"
                style={{ color: '#1a233d', borderColor: '#d0d7e5' }}
                onClick={() => setSelectedClass(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHÍNH SÁCH BẢO MẬT & QUYỀN RIÊNG TƯ */}
      {privacyModalOpen && (
        <div
          className="public-dialog-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPrivacyModalOpen(false);
          }}
        >
          <div className="public-dialog" role="dialog" aria-modal="true">
            <button
              className="public-dialog__close"
              type="button"
              onClick={() => setPrivacyModalOpen(false)}
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
            <span className="public-kicker">CHÍNH SÁCH BẢO MẬT</span>
            <h2>Quyền riêng tư &amp; An toàn hồ sơ Gia sư</h2>
            <div style={{ marginTop: '16px', lineHeight: '1.65', color: '#4b5563' }}>
              <p>
                1. <strong>Bảo mật danh tính:</strong> Số điện thoại, căn cước công dân và địa chỉ nhà riêng
                của gia sư không bao giờ hiển thị công khai trên website.
              </p>
              <p>
                2. <strong>Kết nối có kiểm duyệt:</strong> Chỉ sau khi gia sư chấp nhận yêu cầu nhận lớp và
                hai bên đồng thuận, thông tin liên lạc chính thức mới được trao đổi.
              </p>
              <p>
                3. <strong>Hỗ trợ đảm bảo:</strong> Nền tảng có đội ngũ trực tiếp giám sát và hỗ trợ xử lý
                khi có bất kỳ vấn đề phát sinh nào giữa học viên và gia sư.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="public-btn public-btn--blue"
                onClick={() => setPrivacyModalOpen(false)}
              >
                Đã hiểu rõ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
