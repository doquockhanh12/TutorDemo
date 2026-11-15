// Explicit public projection: never return resolutionNote, evidence or admin metadata.
export function selectReportNotifications(issues = [], accountId) {
  if (!accountId) return [];
  const notifications = [];
  for (const issue of issues) {
    if (issue.reportedBy?.id !== accountId || issue.reportedBy?.role !== 'learner') continue;
    if (issue.targetUser?.role !== 'tutor' || !issue.id) continue;
    const tutorName = issue.targetUser.name || 'Gia sư chưa có tên';
    const add = (kind, timestamp, text) => {
      if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return;
      notifications.push({ id: JSON.stringify([issue.id, kind, timestamp, text]), reportId: issue.id,
        tutorName, timestamp, text, kind, from: 'them',
        time: new Date(timestamp).toLocaleString('vi-VN') });
    };
    add('received', issue.createdAt || issue.received, 'TutorNearMe đã tiếp nhận báo cáo của bạn và sẽ xem xét sự việc.');
    const publicNotice = typeof issue.reporterNotice === 'string' ? issue.reporterNotice.trim() : '';
    if (publicNotice) {
      add('response', issue.updatedAt || issue.dismissedAt || issue.resolvedAt, publicNotice);
    } else if (['resolved', 'dismissed'].includes(issue.status)) {
      add('result', issue.resolvedAt || issue.dismissedAt || issue.updatedAt,
        issue.status === 'dismissed' ? 'Báo cáo của bạn đã được xem xét và không được chấp nhận.' : 'TutorNearMe đã hoàn tất xem xét báo cáo của bạn.');
    }
  }
  return notifications.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp) || a.id.localeCompare(b.id));
}
