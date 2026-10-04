export const requestStatusMetadata = {
  pending: { learnerLabel: 'Chờ phản hồi', tutorLabel: 'Chờ phản hồi', tone: 'warning' },
  accepted: { learnerLabel: 'Đã xác nhận', tutorLabel: 'Đã nhận', tone: 'success' },
  rejected: { learnerLabel: 'Đã từ chối', tutorLabel: 'Đã từ chối', tone: 'danger' },
  cancelled: { learnerLabel: 'Đã hủy', tutorLabel: 'Đã hủy', tone: 'danger' },
};
export function requestLabel(request, role = 'learner') {
  if (role === 'learner' && request.completed) return 'Hoàn tất';
  return requestStatusMetadata[request.status]?.[role + 'Label'] || 'Không rõ trạng thái';
}
export function requestTone(request) { return request.completed ? 'info' : requestStatusMetadata[request.status]?.tone || 'neutral'; }
