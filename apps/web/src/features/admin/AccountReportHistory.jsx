import Badge from '../../components/Badge.jsx';
import { issueStatusLabels, issueStatusTones } from '../domain/useAdminDomain.js';

function date(value) { return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có thời gian'; }

export default function AccountReportHistory({ account, history }) {
  return <div className="admin-account-history">
    <p><strong>{account.name}</strong> · @{account.username}</p>
    <div className="admin-history-summary"><strong>{history.reports.length} báo cáo đã gửi</strong><strong>{history.warningCount} cảnh cáo đã nhận</strong></div>
    <section aria-labelledby="history-reports"><h3 id="history-reports">Báo cáo đã gửi</h3>
      {!history.reports.length && <p>Chưa có báo cáo đã gửi trong dữ liệu hiện có.</p>}
      {history.reports.map(report => <details className="admin-history-record" key={report.id}>
        <summary><strong>{report.id}</strong> · {report.title || report.label || 'Báo cáo'}<Badge tone={issueStatusTones[report.status] || 'neutral'}>{issueStatusLabels[report.status] || report.status}</Badge></summary>
        <p>{report.description || 'Chưa có nội dung chi tiết.'}</p><small>Gửi lúc: {date(report.createdAt)}</small>
        {report.resolutionNote && <p>Kết quả: {report.resolutionNote}</p>}
      </details>)}
    </section>
    <section aria-labelledby="history-warnings"><h3 id="history-warnings">Cảnh cáo đã nhận</h3>
      {!history.warningCount && <p>Chưa nhận cảnh cáo.</p>}
      {history.warningCount > history.warnings.length && <p>Có {history.warningCount - history.warnings.length} cảnh cáo chưa có chi tiết trong dữ liệu hiện có.</p>}
      {history.warnings.map((warning, index) => <article className="admin-history-record" key={warning.id || index}>
        <Badge tone={warning.revoked ? 'neutral' : 'warning'}>{warning.revoked ? 'Đã thu hồi' : 'Cảnh cáo'}</Badge>
        <p>{warning.reason || 'Chưa có lý do cảnh cáo.'}</p>
        <small>{date(warning.warnedAt)} · {warning.warnedBy || 'Chưa có người xử lý'}</small>
        <p>Sự cố liên quan: {warning.issueId || 'Chưa có mã sự cố'}</p>
      </article>)}
    </section>
  </div>;
}
