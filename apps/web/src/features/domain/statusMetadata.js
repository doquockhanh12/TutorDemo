export const requestStatusMetadata = {
  pending: { learnerLabel: 'Chờ phản hồi', tutorLabel: 'Chờ phản hồi', tone: 'warning' },
  pending_learner_confirmation: { learnerLabel: 'Cần kiểm tra điều kiện', tutorLabel: 'Cần kiểm tra điều kiện', tone: 'warning' },
  needs_revision: { learnerLabel: 'Cần thống nhất lại', tutorLabel: 'Đang trao đổi', tone: 'info' },
  expired: { learnerLabel: 'Đã hết hạn', tutorLabel: 'Đã hết hạn', tone: 'neutral' },
  accepted: { learnerLabel: 'Đã xác nhận', tutorLabel: 'Đã nhận', tone: 'success' },
  rejected: { learnerLabel: 'Đã từ chối', tutorLabel: 'Đã từ chối', tone: 'danger' },
  cancelled: { learnerLabel: 'Đã hủy', tutorLabel: 'Đã hủy', tone: 'danger' },
};
export function requestLabel(request, role = 'learner') {
  if (role === 'learner' && request.completed) return 'Hoàn tất';
  if (request.reconciliationError) return 'Cần kiểm tra lớp';
  return requestStatusMetadata[request.status]?.[role + 'Label'] || 'Không rõ trạng thái';
}
export function requestTone(request) { return request.reconciliationError ? 'warning' : request.completed ? 'info' : requestStatusMetadata[request.status]?.tone || 'neutral'; }
