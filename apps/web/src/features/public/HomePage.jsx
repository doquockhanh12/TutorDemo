import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { PublicFooter, PublicHeader, SectionHead } from './PublicChrome.jsx';
import { photo } from '../../data/public.js';

export default function HomePage() {
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultRole, setConsultRole] = useState('learner');
  const [consultTopic, setConsultTopic] = useState('find_tutor');
  const [consultNote, setConsultNote] = useState('');
  const [consulted, setConsulted] = useState(false);

  const handleConsultSubmit = (e) => {
    e.preventDefault();
    setConsulted(true);
  };

  const scrollToPortal = () => {
    document.getElementById('portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="public-page public-page--home">
      <PublicHeader kind="home" />

      <main>
        {/* SECTION 1: HERO NỀN TẢNG TỔNG QUAN */}
        <section className="public-hero public-hero--home">
          <div className="public-wrap public-hero__grid">
            <div className="public-hero__copy">
              <span className="public-hero__eyebrow">
                HỌC ĐÚNG NGƯỜI · HỌC ĐÚNG CÁCH
              </span>
              <h1>
                Tìm đúng gia sư.
                <br />
                Học đúng cách.
                <br />
                Tiến bộ rõ ràng.
              </h1>
              <p>
                Chọn gia sư theo môn học, khu vực, lịch rảnh và ngân sách. Xem hồ sơ rõ ràng trước khi kết nối.
              </p>
              <div className="public-hero__actions">
                <button
                  type="button"
                  className="public-btn public-btn--yellow"
                  onClick={scrollToPortal}
                >
                  Bắt đầu ngay <ArrowRight size={18} />
                </button>
                <Link to="/register" className="public-btn public-btn--outline">
                  Đăng ký thành viên
                </Link>
              </div>
              <div className="public-hero__proof">
                <span>
                  <strong>1.200+</strong> hồ sơ đã xác thực
                </span>
                <span>
                  <strong>15.000+</strong> buổi học kết nối
                </span>
                <span>
                  <strong>100%</strong> bảo vệ quyền lợi
                </span>
              </div>
            </div>

            <div className="public-hero__visual">
              <img
                className="public-hero__photo-main"
                src={photo.homeHero}
                alt="Gia sư và học viên đồng hành học tập"
              />
              <img
                className="public-hero__photo-side"
                src={photo.learnerHero}
                alt="Không gian học tập tích cực"
              />
              <span className="public-float public-float--rating">
                <Star size={20} fill="currentColor" /> <b>4.9/5</b>
                <small>đánh giá chất lượng</small>
              </span>
              <span className="public-float public-float--location">
                <ShieldCheck size={18} />
                <b>Xác thực 100%</b>
                <small>kiểm duyệt hồ sơ</small>
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 2: KHỐI CHIA ĐÔI MÀN HÌNH (DUAL CHOICE SPLIT PORTAL) */}
        <section className="public-portal-split" id="portal">
          <div className="public-wrap">
            <SectionHead
              kicker="LỰA CHỌN KHÔNG GIAN CỦA BẠN"
              title="Bạn tham gia TutorNearMe với vai trò nào?"
              text="Chọn đúng cổng trải nghiệm để tiếp cận tính năng và tiện ích được thiết kế chuyên biệt cho nhu cầu của bạn."
            />

            <div className="public-portal-split__grid">
              {/* NỬA TRÁI: DÀNH CHO NGƯỜI HỌC & PHỤ HUYNH */}
              <div className="public-portal-card public-portal-card--learner">
                <span className="public-portal-card__badge">DÀNH CHO NGƯỜI HỌC & PHỤ HUYNH</span>
                <h3>Bạn đang tìm gia sư chất lượng cao?</h3>
                <p className="public-portal-card__desc">
                  Tiếp cận mạng lưới sinh viên và gia sư giỏi, so sánh hồ sơ minh bạch trước khi kết nối
                  và nhận ưu đãi cho buổi học đầu tiên.
                </p>
                <img
                  className="public-portal-card__image"
                  src={photo.learnerHero}
                  alt="Người học tìm kiếm gia sư"
                />
                <ul className="public-portal-card__bullets">
                  <li>
                    <Check size={18} />
                    <span>Duyệt hồ sơ gia sư đã xác minh bằng cấp, chứng chỉ và trường đại học.</span>
                  </li>
                  <li>
                    <Check size={18} />
                    <span>Bộ lọc chuyên sâu theo môn học, khu vực gần bạn và mức học phí mong muốn.</span>
                  </li>
                  <li>
                    <Check size={18} />
                    <span>Trải nghiệm học thử buổi đầu, theo dõi lịch và tiến độ từng buổi học minh bạch.</span>
                  </li>
                </ul>
                <div className="public-portal-card__actions">
                  <Link to="/learner" className="public-btn public-btn--blue">
                    Khám phá Cổng Người học <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              {/* NỬA PHẢI: DÀNH CHO GIA SƯ & NGƯỜI DẠY KÈM */}
              <div className="public-portal-card public-portal-card--tutor">
                <span className="public-portal-card__badge">DÀNH CHO GIA SƯ & NGƯỜI DẠY KÈM</span>
                <h3>Bạn muốn kết nối lớp dạy phù hợp?</h3>
                <p className="public-portal-card__desc">
                  Biến kiến thức chuyên môn thành thu nhập xứng đáng với sự chủ động tối đa về lịch rảnh,
                  địa điểm dạy và mức thù lao.
                </p>
                <img
                  className="public-portal-card__image"
                  src={photo.tutorHero}
                  alt="Gia sư nhận lớp dạy kèm"
                />
                <ul className="public-portal-card__bullets">
                  <li>
                    <Check size={18} />
                    <span>Chủ động chọn lớp học theo khu vực địa lý thuận tiện và khung thời gian rảnh.</span>
                  </li>
                  <li>
                    <Check size={18} />
                    <span>Tự do đề xuất học phí phù hợp với năng lực chuyên môn và thâm niên giảng dạy.</span>
                  </li>
                  <li>
                    <Check size={18} />
                    <span>Đảm bảo thù lao minh bạch, có hệ thống hỗ trợ giải quyết tranh chấp công bằng.</span>
                  </li>
                </ul>
                <div className="public-portal-card__actions">
                  <Link to="/tutor" className="public-btn public-btn--red">
                    Khám phá Cổng Gia sư <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: 4 NĂNG LỰC NỀN TẢNG CỐT LÕI */}
        <section className="public-features" id="features">
          <div className="public-wrap">
            <SectionHead
              kicker="GIÁ TRỊ CỐT LÕI CỦA TUTORNEARME"
              title="Nền tảng kết nối dựa trên sự minh bạch & tin cậy."
              text="Chúng tôi xây dựng các giải pháp toàn diện giúp việc dạy và học trở nên thuận tiện, an toàn và đạt hiệu quả tối ưu."
            />

            <div className="public-features__grid">
              <div className="public-feature-card">
                <div className="public-feature-card__icon">
                  <ShieldCheck size={26} />
                </div>
                <h3>Xác thực hồ sơ đa tầng</h3>
                <p>
                  Kiểm duyệt thẻ sinh viên, văn bằng chứng chỉ và thông tin cá nhân kỹ lưỡng trước khi
                  công khai trên hệ thống.
                </p>
              </div>

              <div className="public-feature-card">
                <div className="public-feature-card__icon">
                  <CalendarDays size={26} />
                </div>
                <h3>Quản lý lịch học thông minh</h3>
                <p>
                  Khớp nối khung giờ rảnh tự động, linh hoạt thỏa thuận dời lịch khi bận và nhắc nhở
                  lịch học trước giờ hẹn.
                </p>
              </div>

              <div className="public-feature-card">
                <div className="public-feature-card__icon">
                  <Award size={26} />
                </div>
                <h3>Bảo vệ quyền lợi 2 chiều</h3>
                <p>
                  Chính sách đối soát minh bạch, cơ chế giải quyết sự cố công bằng với quy tắc cảnh cáo
                  và bảo vệ tài khoản nghiêm minh.
                </p>
              </div>

              <div className="public-feature-card">
                <div className="public-feature-card__icon">
                  <CheckCircle2 size={26} />
                </div>
                <h3>Theo dõi tiến độ & Học phí</h3>
                <p>
                  Rõ ràng mức phí từng buổi học, không phát sinh phụ phí ẩn, lưu trữ lịch sử học tập
                  và ghi nhận phản hồi đa chiều.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: KHỞI ĐẦU DỄ DÀNG & ĐẶC QUYỀN KHI ĐĂNG KÝ (ĐÃ GỘP) */}
        <section className="public-benefits" id="benefits">
          <div className="public-wrap">
            <SectionHead
              kicker="QUYỀN LỢI THÀNH VIÊN"
              title="Khởi đầu dễ dàng. Đặc quyền trọn vẹn khi có tài khoản."
              text="Quy trình 3 bước tinh gọn giúp bạn tiếp cận dịch vụ dạy & học ngay lập tức cùng những ưu đãi độc quyền dành cho thành viên."
            />

            <div className="public-benefits__grid">
              {/* CỘT TRÁI: 3 BƯỚC QUY TRÌNH */}
              <div className="public-benefits__steps">
                <div className="public-benefit-step">
                  <b>01</b>
                  <div>
                    <h4>Đăng ký tài khoản miễn phí</h4>
                    <p>
                      Chỉ mất 1 phút tạo tài khoản bằng email hoặc số điện thoại để mở khóa toàn bộ quyền
                      lợi trên nền tảng.
                    </p>
                  </div>
                </div>

                <div className="public-benefit-step">
                  <b>02</b>
                  <div>
                    <h4>Chọn cổng vai trò & Kết nối</h4>
                    <p>
                      Truy cập Cổng Người học để tìm kiếm gia sư đúng nhu cầu, hoặc Cổng Gia sư để thiết lập
                      hồ sơ nhận lớp.
                    </p>
                  </div>
                </div>

                <div className="public-benefit-step">
                  <b>03</b>
                  <div>
                    <h4>Bắt đầu buổi học an tâm</h4>
                    <p>
                      Thống nhất lịch học, trao đổi trực tiếp và được bảo đảm an toàn thù lao xuyên suốt
                      toàn bộ quá trình học tập.
                    </p>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: CARD ĐẶC QUYỀN */}
              <div className="public-benefits__card">
                <span className="public-kicker" style={{ color: '#ffde59' }}>
                  ĐẶC QUYỀN THÀNH VIÊN
                </span>
                <h3>Tạo tài khoản hôm nay, nhận trọn ưu đãi</h3>
                <p>
                  Trải nghiệm đầy đủ tính năng tương tác chuyên sâu mà khách vãng lai không có được:
                </p>

                <ul className="public-benefits__list">
                  <li>
                    <Sparkles size={18} />
                    <span>Ưu đãi giảm 20% học phí buổi học đầu tiên</span>
                  </li>
                  <li>
                    <Sparkles size={18} />
                    <span>Lưu không giới hạn hồ sơ & cơ hội yêu thích</span>
                  </li>
                  <li>
                    <Sparkles size={18} />
                    <span>Nhắn tin trao đổi bảo mật trước khi chốt lịch</span>
                  </li>
                  <li>
                    <Sparkles size={18} />
                    <span>Hỗ trợ khiếu nại & đối soát sự cố 24/7 từ Admin</span>
                  </li>
                </ul>

                <Link to="/register" className="public-btn public-btn--yellow">
                  Đăng ký tài khoản miễn phí <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: TƯ VẤN ĐỊNH HƯỚNG NỀN TẢNG */}
        <section className="public-section public-consult" id="consult">
          <div className="public-wrap public-consult__grid">
            <div className="public-consult__photo">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=82"
                alt="Đội ngũ cố vấn trao đổi định hướng"
              />
              <span>
                Cần hỗ trợ định hướng?
                <br />
                Đội ngũ TutorNearMe sẵn sàng đồng hành.
              </span>
            </div>

            <form className="public-consult__form" onSubmit={handleConsultSubmit}>
              <span className="public-kicker">TƯ VẤN ĐỊNH HƯỚNG NỀN TẢNG</span>
              <h2>Chia sẻ nhu cầu. Nhận hỗ trợ từ chuyên viên.</h2>
              <p>
                Dành cho cả phụ huynh, học sinh và gia sư cần tư vấn phương pháp, lộ trình hoặc cách sử
                dụng nền tảng.
              </p>

              <div>
                <label>
                  Họ và tên <span style={{ color: '#e11d48' }}>*</span>
                  <input
                    required
                    placeholder="Tên của bạn"
                    value={consultName}
                    onChange={(e) => setConsultName(e.target.value)}
                  />
                </label>
                <label>
                  Số điện thoại <span style={{ color: '#e11d48' }}>*</span>
                  <input
                    required
                    inputMode="tel"
                    placeholder="Số điện thoại liên hệ"
                    value={consultPhone}
                    onChange={(e) => setConsultPhone(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <label>
                  Bạn là
                  <select
                    value={consultRole}
                    onChange={(e) => setConsultRole(e.target.value)}
                  >
                    <option value="learner">Phụ huynh / Học sinh</option>
                    <option value="tutor">Gia sư / Người dạy kèm</option>
                  </select>
                </label>
                <label>
                  Nội dung cần tư vấn
                  <select
                    value={consultTopic}
                    onChange={(e) => setConsultTopic(e.target.value)}
                  >
                    <option value="find_tutor">Hỗ trợ tìm gia sư phù hợp</option>
                    <option value="become_tutor">Quy trình đăng ký hồ sơ gia sư</option>
                    <option value="platform_policy">Chính sách bảo vệ & Học phí</option>
                  </select>
                </label>
              </div>

              <label>
                Nội dung chi tiết (không bắt buộc)
                <textarea
                  rows={3}
                  placeholder="Môn học, khu vực, khung giờ hoặc thắc mắc của bạn..."
                  value={consultNote}
                  onChange={(e) => setConsultNote(e.target.value)}
                />
              </label>

              <button className="public-btn public-btn--blue" type="submit">
                Gửi yêu cầu tư vấn <ArrowRight size={17} />
              </button>

              {consulted && (
                <p role="status" className="public-form-success">
                  Đã ghi nhận yêu cầu tư vấn trong hệ thống demo. Chuyên viên sẽ liên hệ trong thời gian sớm nhất!
                </p>
              )}
            </form>
          </div>
        </section>

        {/* SECTION 6: CALL TO ACTION CUỐI TRANG */}
        <section className="public-final">
          <div className="public-wrap">
            <span>BẮT ĐẦU NGAY HÔM NAY</span>
            <h2>Sẵn sàng trải nghiệm nền tảng học tập thông minh?</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 24px', fontSize: '16px' }}>
              Tham gia cùng hàng ngàn học viên và gia sư đang kết nối mỗi ngày. Tạo tài khoản miễn phí để
              nhận trọn vẹn quyền lợi.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="public-btn public-btn--yellow">
                Tạo tài khoản ngay
              </Link>
              <button
                type="button"
                className="public-btn public-btn--outline"
                style={{ color: '#fff', borderColor: '#ffffff80' }}
                onClick={scrollToPortal}
              >
                Chọn vai trò
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
