import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';

export default function RoleSelectModal({ onClose }) {
  const navigate = useNavigate();
  const dialogRef = useDialogFocus(onClose);

  const chooseRole = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="public-dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="role-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
      >
        <button
          type="button"
          className="role-modal__close"
          onClick={onClose}
          aria-label="Đóng bảng chọn vai trò"
        >
          <X size={20} />
        </button>

        <div className="role-modal__header">
          <span className="public-kicker">TUTORNEARME · ĐĂNG KÝ TÀI KHOẢN</span>
          <h2 id="role-modal-title">Bạn muốn đăng ký với vai trò nào?</h2>
          <p>
            Vui lòng chọn đối tượng phù hợp để chuyển thẳng đến biểu mẫu đăng ký chuyên biệt dành cho bạn.
          </p>
        </div>

        <div className="role-modal__options">
          {/* Card Người học / Phụ huynh */}
          <div
            className="role-modal__card role-modal__card--learner"
            onClick={() => chooseRole('/register')}
          >
            <div className="role-modal__card-icon">
              <BookOpen size={28} />
            </div>
            <div className="role-modal__card-body">
              <span className="role-modal__badge">Dành cho học sinh & phụ huynh</span>
              <h3>Người học / Phụ huynh</h3>
              <p>
                Tìm kiếm gia sư theo môn học, khu vực, lịch rảnh và mức phí. Đặt lịch học thử và theo dõi tiến độ dễ dàng.
              </p>
            </div>
            <button
              type="button"
              className="public-btn public-btn--blue role-modal__btn"
              onClick={(e) => {
                e.stopPropagation();
                chooseRole('/register');
              }}
            >
              Đăng ký Người học <ArrowRight size={16} />
            </button>
          </div>

          {/* Card Gia sư */}
          <div
            className="role-modal__card role-modal__card--tutor"
            onClick={() => chooseRole('/tutor/register')}
          >
            <div className="role-modal__card-icon">
              <GraduationCap size={28} />
            </div>
            <div className="role-modal__card-body">
              <span className="role-modal__badge role-modal__badge--tutor">Dành cho sinh viên & giáo viên</span>
              <h3>Gia sư</h3>
              <p>
                Xây dựng hồ sơ năng lực uy tín, tiếp cận học viên tiềm năng quanh khu vực, chủ động quản lý lịch dạy và thu nhập.
              </p>
            </div>
            <button
              type="button"
              className="public-btn public-btn--yellow role-modal__btn"
              onClick={(e) => {
                e.stopPropagation();
                chooseRole('/tutor/register');
              }}
            >
              Đăng ký Gia sư <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="role-modal__footer">
          <span>Đã có tài khoản?</span>{' '}
          <Link to="/login" onClick={onClose}>
            Đăng nhập ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
