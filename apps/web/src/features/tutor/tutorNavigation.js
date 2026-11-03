export const tutorNavigation = [
  ['Tổng quan', '/tutor/dashboard'],
  ['Yêu cầu học', '/tutor/requests'],
  ['Lịch dạy học', '/tutor/timetable'],
  ['Quản lý lớp học', '/tutor/classes'],
  ['Lọc yêu cầu học', '/tutor/find-students'],
  ['Thu nhập', '/tutor/income'],
  ['Ví gia sư', '/tutor/wallet'],
  ['Hồ sơ gia sư', '/tutor/profile'],
  ['Kháng cáo', '/appeals'],
  ['Đánh giá', '/tutor/reviews'],
  ['Tin nhắn', '/tutor/messages'],
  ['Cài đặt', '/tutor/settings'],
];

export function tutorPageTitle(pathname) {
  if (pathname.startsWith('/tutor/classes/')) return 'Chi tiết lớp học';
  if (pathname.startsWith('/tutor/requests/')) return 'Chi tiết yêu cầu';
  if (pathname === '/tutor/dashboard' || pathname === '/tutor/map') return 'Tìm lớp gần tôi';
  return tutorNavigation.find(([, route]) => pathname === route || pathname.startsWith(`${route}/`))?.[0] || 'Tổng quan';
}
