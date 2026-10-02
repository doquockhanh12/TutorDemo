import { useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { PublicFooter, PublicHeader } from '../public/PublicChrome.jsx';
import { authPath } from './authUtils.js';

export default function AuthFrame({ kind, children }) {
  const location = useLocation();
  useLayoutEffect(() => {
    // Reset before paint, including a link to the current Auth route.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.key]);
  const redirect = new URLSearchParams(location.search).get('redirect');
  const register = kind !== 'login';
  const tutor = kind === 'tutor';
  const title = kind === 'login' ? <>Chào mừng bạn trở lại <em>TutorNearMe.</em></> : tutor ? <>Chủ động xây hồ sơ và nhận lớp <em>phù hợp với bạn.</em></> : <>Bắt đầu hành trình học tập <em>đúng với bạn.</em></>;
  return <div className="public-page auth-page"><PublicHeader kind="home"/><main className="auth-main">
    <div className="auth-shell"><section className="auth-story"><span className="auth-story__mark"><Sparkles size={16}/> TUTORNEARME · {register ? 'BẮT ĐẦU' : 'MỘT TÀI KHOẢN'}</span><h1>{title}</h1><p>{kind === 'login' ? 'Không cần chọn vai trò. Tài khoản demo sẽ đưa bạn tới đúng không gian phù hợp.' : tutor ? 'Khai báo thông tin chuyên môn, khu vực và lịch dạy. Bạn có thể cập nhật hồ sơ sau.' : 'Tạo tài khoản để lưu lựa chọn gia sư và theo dõi yêu cầu học của bạn.'}</p>
      <div className="auth-trust"><div><span><ShieldCheck size={18}/></span><p><strong>{kind === 'login' ? 'Một cửa đăng nhập' : 'Thông tin do bạn kiểm soát'}</strong><small>{kind === 'login' ? 'Username, email hoặc số điện thoại đều dùng chung.' : 'Các trường provider gửi về vẫn có thể chỉnh sửa.'}</small></p></div><div><span>→</span><p><strong>{kind === 'login' ? 'Tự chuyển đúng không gian' : 'Mật khẩu TutorNearMe vẫn cần thiết'}</strong><small>{kind === 'login' ? 'Người học, gia sư và admin vào đúng khu vực.' : 'Provider chỉ hỗ trợ xác minh và điền thông tin có sẵn.'}</small></p></div></div>
      {register && <div className="auth-story__switch">{tutor ? 'Bạn đang tìm gia sư?' : 'Bạn muốn dạy học?'} <Link to={authPath(tutor ? '/register' : '/tutor/register', redirect)}>{tutor ? 'Đăng ký người học' : 'Đăng ký gia sư'}</Link></div>}
    </section>{children}</div></main><PublicFooter/></div>;
}
