// Pure projections/actions on the existing demo domain, never a second store.
export const appealLabels = { pending: 'Chờ xem xét', in_review: 'Đang xem xét', accepted: 'Chấp nhận', rejected: 'Không chấp nhận' };
export const appealTones = { pending: 'warning', in_review: 'info', accepted: 'success', rejected: 'danger' };
export const appealReasons = { wrongful: 'Bị tố cáo oan', misunderstanding: 'Hiểu nhầm', exceptional: 'Sự cố / hoàn cảnh cần thông cảm' };
export const EVIDENCE_FILE_LIMIT = 500 * 1024;
export const EVIDENCE_TOTAL_LIMIT = 1024 * 1024;
export const evidenceTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

export function issueReporterId(issue) {
  return issue.reportedBy?.id || issue.learnerId || issue.userId || issue.relatedUserId || null;
}
export function issueTargetId(state, issue) {
  const id = issue.targetUser?.id || issue.targetUserId || issue.relatedTutorId || issue.tutorId;
  return (state.users || []).find(u => u.id === id || u.tutorProfileId === id)?.id
    || (state.profiles || []).find(p => p.id === id)?.accountId || id || null;
}
export function accountHistory(state, accountId) {
  const user = (state.users || []).find(u => u.id === accountId);
  const warnings = [...(user?.warnings || [])].sort((a, b) => String(b.warnedAt || '').localeCompare(String(a.warnedAt || '')));
  return {
    accountId,
    reports: (state.issues || []).filter(i => accountId && issueReporterId(i) === accountId)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))),
    warnings,
    warningCount: Math.max(user?.warningCount || 0, warnings.length),
  };
}
export function safeEvidenceLink(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
export function validateEvidence(evidence) {
  if (!Array.isArray(evidence) || !evidence.length || evidence.length > 3) return 'Cần từ 1 đến 3 bằng chứng.';
  let totalBytes = 0;
  for (const item of evidence) {
    if (!item.description?.trim()) return 'Mô tả rõ nội dung và nguồn của từng bằng chứng.';
    if (item.kind === 'link') {
      if (!safeEvidenceLink(item.url)) return 'Liên kết bằng chứng phải là URL http/https hợp lệ.';
    } else if (item.kind === 'file') {
      if (!item.name?.trim() || !evidenceTypes.includes(item.type) || !item.data?.startsWith(`data:${item.type};base64,`)) return 'Chỉ hỗ trợ ảnh PNG/JPG/WebP hoặc PDF.';
      const payload = item.data.split(',')[1];
      if (!payload || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) return 'Tệp bằng chứng không hợp lệ.';
      const bytes = Math.floor(payload.length * 3 / 4);
      if (bytes > EVIDENCE_FILE_LIMIT) return 'Mỗi tệp tối đa 500 KB trong bản demo.';
      totalBytes += bytes;
    } else return 'Loại bằng chứng không hợp lệ.';
  }
  return totalBytes > EVIDENCE_TOTAL_LIMIT ? 'Tổng tệp tối đa 1 MB trong bản demo.' : '';
}
export function submitAppeal(state, actor, values, now = new Date()) {
  if (!actor?.id || !['learner', 'tutor'].includes(actor.role)) return { error: 'Cần xác thực tài khoản người học hoặc gia sư.' };
  const issue = (state.issues || []).find(i => i.id === values.issueId);
  if (!issue || issueTargetId(state, issue) !== actor.id) return { error: 'Chỉ bên bị báo cáo được gửi kháng cáo cho sự cố này.' };
  if (!appealReasons[values.reason] || !values.content?.trim() || values.content.trim().length < 20) return { error: 'Chọn lý do và giải trình ít nhất 20 ký tự.' };
  if (!values.truthful) return { error: 'Cần cam kết nội dung và bằng chứng trung thực.' };
  const evidenceError = validateEvidence(values.evidence);
  if (evidenceError) return { error: evidenceError };
  const appeals = state.appeals || [];
  if (appeals.some(a => a.issueId === issue.id && a.accountId === actor.id && ['pending', 'in_review'].includes(a.status))) return { error: 'Sự cố này đã có kháng cáo đang được xem xét.' };
  let number = state.nextAppealNumber || 1;
  while (appeals.some(a => a.id === `appeal-${number}`)) number++;
  const appeal = { id: `appeal-${number}`, issueId: issue.id, accountId: actor.id, reason: values.reason,
    content: values.content.trim(), evidence: structuredClone(values.evidence), truthful: true, status: 'pending', createdAt: now.toISOString() };
  return { id: appeal.id, state: { ...state, appeals: [...appeals, appeal], nextAppealNumber: number + 1 } };
}
export function reviewAppeal(state, actor, id, status, note, now = new Date()) {
  const target = (state.appeals || []).find(a => a.id === id);
  if (actor?.role !== 'admin' || actor.appealOnly || !target || !['pending', 'in_review'].includes(target.status)) return { error: 'Không thể xét duyệt hồ sơ này.' };
  if (!['in_review', 'accepted', 'rejected'].includes(status) || !note?.trim()) return { error: 'Chọn kết quả và ghi rõ căn cứ xem xét.' };
  return { state: { ...state, appeals: state.appeals.map(a => a.id === id ? { ...a, status, reviewNote: note.trim(), reviewedBy: actor.id, reviewedAt: now.toISOString() } : a) } };
}
export function selectAppeals(state, actor) {
  if (!actor?.id) return [];
  return (state.appeals || []).filter(a => actor.role === 'admin' || a.accountId === actor.id)
    .map(a => ({ ...a, accountName: (state.users || []).find(u => u.id === a.accountId)?.fullName || 'Chưa có tên tài khoản',
      issueTitle: (state.issues || []).find(i => i.id === a.issueId)?.title || a.issueId }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
