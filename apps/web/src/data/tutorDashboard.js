import { demoReferenceData } from './demoReferenceData.js';
// Legacy display examples are retained below; functional seeds are projections.
export const tutorSummary = [
  { label: 'Yêu cầu cần phản hồi', value: '03', note: '2 yêu cầu mới hôm nay' },
  { label: 'Buổi học tuần này', value: '08', note: 'Buổi tiếp theo lúc 16:00' },
  { label: 'Giờ trống còn lại', value: '12', note: 'Trong 7 ngày tới' },
];

export const tutorIncome = {
  total: 3200000,
  items: [
    { id: 'income-1', date: '12/04', subject: 'Toán lớp 9', amount: 200000 },
    { id: 'income-2', date: '10/04', subject: 'Vật lý lớp 10', amount: 180000 },
    { id: 'income-3', date: '08/04', subject: 'Toán lớp 11', amount: 220000 },
  ],
};

const profile = demoReferenceData.tutorProfiles.find((t) => t.accountId === 'demo-tutor');
export const initialTutorProfile = { name: profile.name, subjects: profile.subjects.join(', '), area: profile.location, fee: String(profile.price), sessionMinutes: profile.sessionMinutes, bio: profile.intro, levels: profile.levels };

export const initialLessons = [
  { id: 'lesson-1', day: 'Hôm nay', date: 'Thứ tư', time: '16:00 – 17:30', subject: 'Toán lớp 9', learner: 'Minh Khang', place: 'Bình Thạnh · Tại nhà', status: 'confirmed' },
  { id: 'lesson-2', day: 'Ngày mai', date: 'Thứ năm', time: '18:30 – 20:00', subject: 'Vật lý lớp 10', learner: 'Ngọc Hà', place: 'Trực tuyến', status: 'confirmed' },
  { id: 'lesson-3', day: 'Thứ bảy', date: 'Cuối tuần', time: '09:00 – 10:30', subject: 'Toán lớp 11', learner: 'Gia Bảo', place: 'Phú Nhuận · Tại nhà', status: 'pending' },
];

export const initialRequests = demoReferenceData.requests.filter((r) => r.id.startsWith('req-'));

export const weeklyLessons = [
  { day: 'T2', date: '28', items: [{ time: '18:00', label: 'Toán · Khang', tone: 'blue' }] },
  { day: 'T3', date: '29', items: [{ time: '16:30', label: 'Lý · Ngọc Hà', tone: 'coral' }] },
  { day: 'T4', date: '30', items: [{ time: '16:00', label: 'Toán · Khang', tone: 'blue' }, { time: '19:00', label: 'Tư vấn mới', tone: 'yellow' }] },
  { day: 'T5', date: '01', items: [{ time: '18:30', label: 'Lý · Ngọc Hà', tone: 'coral' }] },
  { day: 'T6', date: '02', items: [] },
  { day: 'T7', date: '03', items: [{ time: '09:00', label: 'Toán · Gia Bảo', tone: 'yellow' }] },
  { day: 'CN', date: '04', items: [] },
];

export const initialAvailability = [
  { id: 'a1', label: 'Tối thứ 2', time: '18:00 – 21:00', active: true },
  { id: 'a2', label: 'Chiều thứ 6', time: '14:00 – 17:00', active: true },
  { id: 'a3', label: 'Sáng chủ nhật', time: '08:00 – 11:00', active: true },
];
