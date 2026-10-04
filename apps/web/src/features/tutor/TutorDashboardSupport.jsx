import useDemoDomain, { useTutorIncome } from '../domain/DemoDomainContext.jsx';
﻿import { Link } from 'react-router-dom';
import { ArrowRight, UserRound, MapPin, BookOpen, Wallet, Star } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import { formatFee } from '../../data/tutorClassSearch.js';

export default function TutorDashboardSupport() {
  const { currentMonth: income } = useTutorIncome();
  const {profiles,tutorId} = useDemoDomain();
  const tutor = profiles.find((p) => p.id === tutorId);
  const profile = { name: tutor?.name || '', initials: tutor?.initials || '', city: tutor?.location || '',
    subjects: tutor?.subjects.join(', ') || '', area: tutor?.location || '', fee: new Intl.NumberFormat('vi-VN').format(tutor?.price || 0)+'đ / buổi',
    rating: tutor?.rating, reviewCount: tutor?.reviews, completion: 85 };

  return <aside className="reference-support" aria-label="Hồ sơ, thu nhập và cập nhật nhanh"><section className="reference-panel reference-profile" id="tutor-profile-summary"><div className="reference-panel__heading"><h2>Hồ sơ gia sư</h2><Link to="/tutor/profile">Chỉnh sửa <ArrowRight size={14}/></Link></div><div className="reference-profile__identity"><Avatar initials={profile.initials} name={profile.name}/><div><h3>{profile.name}</h3><p>Gia sư tại {profile.city}</p>{Number.isFinite(profile.rating) ? <div className="reference-profile__rating" aria-label={`${profile.rating} trên 5, ${profile.reviewCount} đánh giá`}>{Array.from({length:5},(_,index) => <Star key={index} size={12} fill="currentColor"/>)}<span>{profile.rating} ({profile.reviewCount} đánh giá)</span></div> : <p>Chưa có đánh giá</p>}</div></div><div className="reference-profile__progress"><div><span>Hồ sơ hoàn thiện</span><strong>{profile.completion}%</strong></div><progress max="100" value={profile.completion} aria-label="Độ hoàn thiện hồ sơ"/></div><dl className="reference-profile__facts"><div><dt>Môn dạy</dt><dd>{profile.subjects}</dd></div><div><dt>Khu vực</dt><dd>{profile.area}</dd></div><div><dt>Mức phí</dt><dd>{profile.fee}</dd></div></dl></section>
    <section className="reference-panel reference-income" id="tutor-income"><div className="reference-panel__heading"><h2>Thu nhập / buổi học gần đây</h2></div><strong className="reference-income__total">{formatFee(income.total)}</strong><p>Tháng {income.key.slice(5)}/{income.key.slice(0, 4)}</p><div className="reference-income__list">{income.lessons.slice(0, 3).map((lesson) => <div key={lesson.id}><span>{lesson.date.slice(8)}/{lesson.date.slice(5, 7)}</span><span>{lesson.subject || 'Chưa có môn học'}</span><strong>{formatFee(lesson.sessionFee)}</strong></div>)}{!income.lessonCount && <p>Chưa có buổi học tạo thu nhập trong tháng.</p>}</div><Link to="/tutor/income">Xem thêm <ArrowRight size={14}/></Link></section>
    <section className="reference-panel reference-quick"><div className="reference-panel__heading"><h2>Cập nhật nhanh</h2></div><div className="reference-quick__grid">{[[UserRound,'Chỉnh sửa hồ sơ'],[MapPin,'Quản lý khu vực'],[BookOpen,'Cập nhật môn dạy'],[Wallet,'Thiết lập mức phí']].map(([Icon,label]) => <Link to="/tutor/profile" key={label}><Icon size={17}/><span>{label}</span></Link>)}</div><p>Đã lưu 2 phút trước</p></section>
  </aside>;
}
