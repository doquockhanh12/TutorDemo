import { Link } from 'react-router-dom';
import { eligibleIncomeLessons } from '../domain/incomeSelectors.js';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { TutorShell } from './TutorPages.jsx';
import './classes.css';

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
export default function TutorWallet() {
  const { lessons, tutorId } = useTutorWorkspace();
  const completed = eligibleIncomeLessons(lessons, tutorId).sort((a, b) => b.date.localeCompare(a.date));
  const total = completed.reduce((sum, lesson) => sum + lesson.sessionFee, 0);
  return <TutorShell title="Ví gia sư" subtitle="Minh họa giao diện ví; chưa tích hợp thanh toán hoặc số dư thật.">
    <div className="tutor-wallet__summary"><section><h2>Số dư khả dụng</h2><strong>Chưa có dữ liệu</strong></section><section><h2>Đang chờ xử lý</h2><strong>Chưa có dữ liệu</strong></section><section><h2>Tổng thu nhập ước tính</h2><strong>{money(total)}</strong><p>Tính từ các buổi đã hoàn tất, cùng nguồn với trang Thu nhập.</p></section></div>
    <section className="tutor-wallet__history"><h2>Lịch sử giao dịch</h2><p>Chưa có giao dịch thanh toán. Danh sách dưới đây là các buổi học hoàn tất để đối chiếu thu nhập ước tính.</p><div className="flow-list">{completed.map((lesson) => <div className="flow-row" key={lesson.id}><span><strong>{lesson.subject} · {lesson.learner}</strong><small>{lesson.date} · Buổi hoàn tất, chưa có trạng thái thanh toán</small></span><strong>{money(lesson.sessionFee)}</strong></div>)}{!completed.length && <p className="empty-line">Chưa có buổi học hoàn tất.</p>}</div><Link className="text-link" to="/tutor/income">Xem thống kê Thu nhập</Link></section>
    <section className="tutor-wallet__withdraw"><h2>Yêu cầu rút tiền</h2><p>Chưa khả dụng. Cần tích hợp backend thanh toán và đối soát trước khi nhận yêu cầu.</p><button type="button" className="button button--secondary" disabled>Yêu cầu rút tiền (chưa khả dụng)</button></section>
  </TutorShell>;
}

