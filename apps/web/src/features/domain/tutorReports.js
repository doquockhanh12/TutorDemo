import { validateEvidence } from './appeals.js';

export const tutorReportReasons = {
  misleading: 'Thông tin giới thiệu có dấu hiệu sai lệch',
  inappropriate: 'Nội dung không phù hợp',
  harassment: 'Quấy rối, xúc phạm hoặc đe dọa',
  fraud: 'Nghi ngờ lừa đảo',
  other: 'Khác',
};
export const requestReportReasons = {
  absence: 'Không đến buổi học hoặc hủy sát giờ',
  fee_dispute: 'Thu phí sai thỏa thuận',
  teaching_content: 'Không dạy theo nội dung đã thống nhất',
};

export function submitTutorReport(state, actor, values, now = new Date()) {
  if (actor?.role !== 'learner' || !actor.id || actor.appealOnly) return { error: 'Bạn cần đăng nhập người học để gửi báo cáo.' };
  const request = values.requestId ? state.requests.find((item) => item.id === values.requestId && item.learnerId === actor.id) : null;
  if (values.requestId && (!request || request.tutorId !== values.tutorId)) return { error: 'Không xác định được gia sư thuộc yêu cầu này.' };
  const tutor = state.profiles.find((item) => item.id === values.tutorId);
  if (!values.tutorId || (!tutor && !request)) return { error: 'Không tìm thấy gia sư cần báo cáo.' };
  const reasons = { ...tutorReportReasons, ...(request ? requestReportReasons : {}) };
  if (!Object.hasOwn(reasons, values.reason)) return { error: 'Vui lòng chọn lý do báo cáo.' };
  const description = String(values.description || '').trim();
  if (values.reason === 'other' && !description) return { error: 'Vui lòng mô tả sự việc khi chọn Khác.' };
  if (description.length > 5000) return { error: 'Mô tả tối đa 5.000 ký tự.' };
  const evidence = values.evidence || [];
  if (!Array.isArray(evidence) || evidence.some((item) => item.kind !== 'file' || !['image/png', 'image/jpeg', 'image/webp'].includes(item.type))) return { error: 'Chỉ hỗ trợ ảnh PNG/JPG/WebP.' };
  const images = evidence.map((item) => ({ ...item, description: item.description?.trim() || 'Ảnh minh chứng báo cáo gia sư' }));
  const evidenceError = images.length ? validateEvidence(images) : '';
  if (evidenceError) return { error: evidenceError };
  const account = (state.users || []).find((item) => item.id === tutor?.accountId || item.tutorProfileId === values.tutorId || item.id === values.tutorId);
  const issues = state.issues || [];
  let number = 1;
  while (issues.some((item) => item.id === `ISSUE-${number}`)) number++;
  const issue = {
    id: `ISSUE-${number}`, title: reasons[values.reason], category: values.reason,
    reasonCode: values.reason, reasonLabel: reasons[values.reason], description,
    status: 'new', createdAt: now.toISOString(), received: now.toISOString(),
    learnerId: actor.id, relatedUserId: actor.id,
    reportedBy: { id: actor.id, name: actor.fullName || actor.username, username: actor.username, email: actor.email, phone: actor.phone, role: actor.role },
    tutorId: values.tutorId, relatedTutorId: values.tutorId,
    targetUser: { id: account?.id || tutor?.accountId || values.tutorId, name: tutor?.name || account?.fullName || `Gia sư (${values.tutorId})`, role: 'tutor' },
    requestId: request?.id || null, evidence: structuredClone(images),
  };
  return { id: issue.id, state: { ...state, issues: [issue, ...issues] } };
}
