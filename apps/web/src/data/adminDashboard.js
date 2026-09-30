export const initialApprovals = [
  { id: 'ap-1', name: 'Lê Thảo Vy', initials: 'TV', subject: 'Tiếng Anh', school: 'ĐH Sư phạm TP.HCM', submitted: 'Hôm nay, 09:20', status: 'pending' },
  { id: 'ap-2', name: 'Nguyễn Hoàng Phúc', initials: 'HP', subject: 'Toán · Vật lý', school: 'ĐH Bách khoa TP.HCM', submitted: 'Hôm nay, 08:45', status: 'pending' },
  { id: 'ap-3', name: 'Trần Minh Châu', initials: 'MC', subject: 'Ngữ văn', school: 'ĐH KHXH&NV', submitted: 'Hôm qua, 16:30', status: 'pending' },
];

export const liveClasses = [
  { id: 'lc-1', subject: 'Toán lớp 9', tutor: 'Mai Anh', learner: 'Minh Khang', time: '16:00 – 17:30', format: 'Tại nhà', status: 'live' },
  { id: 'lc-2', subject: 'Tiếng Anh', tutor: 'Quốc Bảo', learner: 'Thanh Mai', time: '16:30 – 18:00', format: 'Trực tuyến', status: 'live' },
  { id: 'lc-3', subject: 'Vật lý lớp 10', tutor: 'Đức Minh', learner: 'Ngọc Hà', time: '18:30 – 20:00', format: 'Tại nhà', status: 'upcoming' },
];

export const initialReviews = [
  { id: 'rv-1', learner: 'Phụ huynh Minh Khang', tutor: 'Mai Anh', rating: 5, excerpt: 'Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi.', status: 'pending' },
  { id: 'rv-2', learner: 'Ngọc Hà', tutor: 'Đức Minh', rating: 4, excerpt: 'Gia sư đúng giờ và chuẩn bị bài kỹ.', status: 'pending' },
];

export const issues = [
  { id: 'IS-2048', label: 'Yêu cầu tạm giữ', related: 'Trần Gia Huy', received: '32 phút trước', status: 'pending' },
  { id: 'RP-1172', label: 'Báo cáo hồ sơ', related: 'Nguyễn Thanh An', received: '1 giờ trước', status: 'reviewing' },
  { id: 'IS-2044', label: 'Tài khoản cần kiểm tra', related: 'Lê Quỳnh Như', received: 'Hôm qua', status: 'pending' },
];
