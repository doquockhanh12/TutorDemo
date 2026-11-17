import { demoReferenceData } from './demoReferenceData.js';
import { CANONICAL_TUTOR_ID, containsRange, getBookableRanges, localDateKey, proposedLessons, isValidTimeRange, weekDates } from './tutorSchedule.js';

// Explicit metadata for existing mock requests; fees are VND per session.
// Compatibility for old callers lacking request metadata. No separate values.
export const classSearchMetadata = Object.fromEntries(
  demoReferenceData.requests
    .filter((r) => r.sessionFee != null)
    .map((r) => [
      r.id,
      {
        subject: r.catalogSubject || r.subjects?.[0] || r.subject,
        sessionFee: r.sessionFee,
      },
    ])
);

export const requestMetadata = (request) => ({
  subject:
    request.catalogSubject ||
    request.subjects?.[0] ||
    classSearchMetadata[request.id]?.subject ||
    request.subject,
  sessionFee: request.sessionFee ?? classSearchMetadata[request.id]?.sessionFee,
});

export const feeBounds = { min: 0, max: 500000, step: 10000 };
export const classSearchAreas = [
  'Thủ Đức',
  'Bình Thạnh',
  'Quận 3',
  'Phú Nhuận',
  'Quận 1',
  'TP.HCM',
  'Biên Hòa',
  'Long Thành',
  'Trảng Bom',
  'Nhơn Trạch',
];

// Dedicated public student posts (Open Requests) on the platform — completely separate from direct tutor requests in /tutor/requests.
export const publicOpenClassPostTemplates = [
  {
    id: 'pub-post-101',
    subject: 'Tiếng Anh',
    catalogSubject: 'Tiếng Anh',
    title: 'Tiếng Anh giao tiếp & Ngữ pháp lớp 8',
    level: 'Lớp 8 · THCS',
    learner: 'Lê Minh Khôi',
    parent: 'Phụ huynh chị Lan',
    phone: '0904 512 889',
    area: 'Thủ Đức',
    format: 'Tại nhà',
    sessionFee: 200000,
    schedule: 'Tối thứ 3, thứ 5 (18:15 – 19:45)',
    note: 'Cần gia sư kiên nhẫn rèn phát âm, hệ thống lại ngữ pháp học kỳ I và luyện phản xạ nói.',
    postedAt: '35 phút trước',
    status: 'pending',
    proposalTemplate: {
      days: [1, 3],
      start: 1095,
      end: 1185,
    },
  },
  {
    id: 'pub-post-102',
    subject: 'IELTS',
    catalogSubject: 'Tiếng Anh',
    title: 'Luyện thi IELTS Foundation (Mục tiêu 6.5)',
    level: 'Lớp 11 · THPT',
    learner: 'Trần Bảo Ngọc',
    parent: null,
    phone: '0938 761 234',
    area: 'Bình Thạnh',
    format: 'Online',
    sessionFee: 250000,
    schedule: 'Sáng thứ 7 (09:00 – 10:30)',
    note: 'Mình đang ở mức 5.0, cần gia sư sửa chi tiết Writing Task 1-2 và luyện Speaking theo chủ đề.',
    postedAt: '1 giờ trước',
    status: 'pending',
    proposalTemplate: {
      days: [5],
      start: 540,
      end: 630,
    },
  },
  {
    id: 'pub-post-103',
    subject: 'Toán',
    catalogSubject: 'Toán',
    title: 'Toán bồi dưỡng & Ôn thi vào lớp 10',
    level: 'Lớp 9 · THCS',
    learner: 'Phạm Hoàng Quân',
    parent: 'Phụ huynh anh Tuấn',
    phone: '0919 334 556',
    area: 'Thủ Đức',
    format: 'Tại nhà',
    sessionFee: 220000,
    schedule: 'Tối thứ 5 (19:30 – 21:00)',
    note: 'Cần ôn chắc phần hàm số bậc nhất và hình học đường tròn chuẩn bị cho kỳ thi tuyển sinh lớp 10.',
    postedAt: '3 giờ trước',
    status: 'pending',
    proposalTemplate: {
      days: [3],
      start: 1170,
      end: 1260,
    },
  },
  {
    id: 'pub-post-104',
    subject: 'Vật lý',
    catalogSubject: 'Vật lý',
    title: 'Vật lý lớp 10 chương Động lực học',
    level: 'Lớp 10 · THPT',
    learner: 'Nguyễn Thanh Trúc',
    parent: 'Phụ huynh cô Hạnh',
    phone: '0982 441 900',
    area: 'Quận 3',
    format: 'Online',
    sessionFee: 190000,
    schedule: 'Tối thứ 3 (19:30 – 21:00)',
    note: 'Học sinh cần hướng dẫn phương pháp phân tích lực và giải bài tập định luật Newton.',
    postedAt: '5 giờ trước',
    status: 'pending',
    proposalTemplate: {
      days: [1],
      start: 1170,
      end: 1260,
    },
  },
  {
    id: 'pub-post-105',
    subject: 'Tin học',
    catalogSubject: 'Lập trình Python',
    title: 'Lập trình Python cơ bản & Tư duy thuật toán',
    level: 'Lớp 10 · THPT',
    learner: 'Đỗ Gia Hưng',
    parent: null,
    phone: '0971 882 310',
    area: 'TP.HCM',
    format: 'Online',
    sessionFee: 240000,
    schedule: 'Sáng thứ 7 (10:30 – 12:00)',
    note: 'Muốn làm quen với Python, cấu trúc điều khiển, hàm và giải các bài toán cơ bản trên lớp chuyên Tin.',
    postedAt: 'Hôm qua',
    status: 'pending',
    proposalTemplate: {
      days: [5],
      start: 630,
      end: 720,
    },
  },
];

export function buildPublicOpenClassPosts(dates = weekDates(), appliedIds = []) {
  const appliedSet = new Set(appliedIds || []);
  return publicOpenClassPostTemplates
    .filter((post) => !appliedSet.has(post.id))
    .map(({ proposalTemplate, ...post }) => ({
      ...post,
      tutorId: CANONICAL_TUTOR_ID,
      proposals: proposalTemplate
        ? proposalTemplate.days.map((day) => ({
            date: localDateKey(dates[day]),
            start: proposalTemplate.start,
            end: proposalTemplate.end,
          }))
        : [],
    }));
}

export const formatFee = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
export const savedFreeRanges = (availability, lessons) => getBookableRanges(availability, lessons);

export function fitsSavedAvailability(proposals, availability, lessons) {
  const free = savedFreeRanges(availability, lessons);
  return (
    proposals.length > 0 &&
    proposals.every(
      (proposal) =>
        isValidTimeRange(proposal) && free.some((range) => containsRange(range, proposal))
    )
  );
}

export function filterTutorClasses(
  requests,
  { subjects = [], areas = [], minFee = feeBounds.min, maxFee = feeBounds.max },
  availability,
  lessons,
  dates
) {
  if (!savedFreeRanges(availability, lessons).length) return [];
  return requests.flatMap((request) => {
    const metadata = requestMetadata(request);
    if (request.status !== 'pending' || !Number.isFinite(metadata.sessionFee)) return [];
    const candidateSubjects = [metadata.subject, request.subject, request.catalogSubject].filter(Boolean);
    if (subjects.length && !subjects.some((selected) => candidateSubjects.includes(selected))) return [];
    if (areas.length && !areas.includes(request.area)) return [];
    if (metadata.sessionFee < minFee || metadata.sessionFee > maxFee) return [];
    const proposals = proposedLessons(request, dates);
    return fitsSavedAvailability(proposals, availability, lessons)
      ? [{ ...request, ...metadata, title: request.title || request.subject, proposals }]
      : [];
  });
}
