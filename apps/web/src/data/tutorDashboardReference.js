import { demoReferenceData } from './demoReferenceData.js';
// Mock content transcribed from reference/figma/tutor/Dashboard.png.
const tutor = demoReferenceData.tutorProfiles.find((t) => t.accountId === 'demo-tutor');
export const dashboardProfile = { name: tutor.name, initials: tutor.initials, city: tutor.location, subjects: tutor.subjects.join(', '), area: tutor.location, fee: new Intl.NumberFormat('vi-VN').format(tutor.price)+'đ/buổi', rating: tutor.rating, reviewCount: tutor.reviews, completion: 85 };
export const dashboardRequests = demoReferenceData.requests.filter((r) => r.id.startsWith('ref-'));
export const dashboardIncome = { total: '3.200.000đ', month: 'Tháng 4/2025', items: [{ date: '12/04', subject: 'Toán - Lớp 9', amount: '200.000đ' }, { date: '10/04', subject: 'Tiếng Anh - Lớp 8', amount: '180.000đ' }, { date: '08/04', subject: 'Vật lý - Lớp 11', amount: '220.000đ' }] };
export const scheduleDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const schedulePeriods = [{ id: 'morning', label: 'Sáng', time: '7:00–12:00' }, { id: 'afternoon', label: 'Chiều', time: '12:00–17:00' }, { id: 'evening', label: 'Tối', time: '17:00–22:00' }];
export const initialScheduleChecks = ['morning-2', 'afternoon-0', 'afternoon-2', 'afternoon-6', 'evening-0', 'evening-1', 'evening-3', 'evening-5'];
export const scheduledCells = { 'evening-0': { subject: 'Toán - Lớp 9', time: '19:00–21:00', place: 'Cầu Giấy, Hà Nội' }, 'evening-1': { subject: 'Tiếng Anh - Lớp 7', time: '18:00–20:00', place: 'Online (Google Meet)' }, 'evening-3': { subject: 'Toán - Lớp 8', time: '19:00–20:30', place: 'Thanh Xuân, Hà Nội' } };
