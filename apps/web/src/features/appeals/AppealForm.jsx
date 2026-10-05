import { useState } from 'react';
import Button from '../../components/Button.jsx';
import { appealReasons, evidenceTypes, EVIDENCE_FILE_LIMIT, EVIDENCE_TOTAL_LIMIT } from '../domain/appeals.js';

export default function AppealForm({ issues, onSubmit }) {
  const [issueId, setIssueId] = useState('');
  const [reason, setReason] = useState('misunderstanding');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [truthful, setTruthful] = useState(false);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const readFiles = async event => {
    const selected = [...event.target.files];
    if (selected.length > 3 || selected.some(f => f.size > EVIDENCE_FILE_LIMIT || !evidenceTypes.includes(f.type)) || selected.reduce((sum, f) => sum + f.size, 0) > EVIDENCE_TOTAL_LIMIT) {
      setError('Chọn tối đa 3 ảnh/PDF, mỗi tệp ≤ 500 KB, tổng ≤ 1 MB.'); event.target.value = ''; return;
    }
    setReading(true); setError('');
    try {
      const payloads = await Promise.all(selected.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onerror = reject;
        reader.onload = () => resolve({ kind: 'file', name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      })));
      setFiles(payloads);
    } catch { setError('Không đọc được tệp. Vui lòng chọn lại.'); }
    finally { setReading(false); }
  };
  const submit = event => {
    event.preventDefault();
    const evidence = [...files.map(file => ({ ...file, description })), ...(url.trim() ? [{ kind: 'link', url: url.trim(), description }] : [])];
    const result = onSubmit({ issueId, reason, content, evidence, truthful });
    if (result.error) setError(result.error);
    else { setError(''); setContent(''); setUrl(''); setDescription(''); setFiles([]); setTruthful(false); event.target.reset(); }
  };
  return <form className="appeal-form" onSubmit={submit} noValidate>
    <h2>Gửi kháng cáo</h2><p>Giải thích rõ sự việc và cung cấp tài liệu có thể đối chiếu. Bằng chứng sẽ được Admin xem xét, chưa được xác thực tự động.</p>
    <label>Sự cố cần kháng cáo<select value={issueId} onChange={e => setIssueId(e.target.value)} required><option value="">Chọn sự cố liên quan tới bạn</option>{issues.map(i => <option value={i.id} key={i.id}>{i.id} · {i.title || i.label}</option>)}</select></label>
    {!issues.length && <p>Chưa có sự cố báo cáo bạn trong dữ liệu hiện có.</p>}
    <label>Lý do kháng cáo<select value={reason} onChange={e => setReason(e.target.value)}>{Object.entries(appealReasons).map(([code, label]) => <option value={code} key={code}>{label}</option>)}</select></label>
    <label>Nội dung giải trình<textarea value={content} onChange={e => setContent(e.target.value)} rows={5} required minLength={20} maxLength={10000} placeholder="Mốc thời gian, phần bị hiểu nhầm, diễn biến và đề nghị xem xét..." /></label>
    <fieldset><legend>Bằng chứng bắt buộc</legend><p>Cung cấp liên kết hoặc tải ảnh/PDF. Tối đa 3 bằng chứng; tệp ≤ 500 KB, tổng tệp ≤ 1 MB trong bản demo.</p>
      <label>Liên kết bằng chứng<input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></label>
      <label>Tệp bằng chứng<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={readFiles} /></label>
      {files.map(f => <span key={f.name}>{f.name}</span>)}
      <label>Mô tả và nguồn bằng chứng<textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} placeholder="Ai cung cấp, thời điểm ghi nhận và nội dung cần đối chiếu..." /></label>
    </fieldset>
    <label className="appeal-check"><input type="checkbox" checked={truthful} onChange={e => setTruthful(e.target.checked)} />Tôi cam kết nội dung và bằng chứng trung thực, không chỉnh sửa gây hiểu nhầm.</label>
    {error && <p className="appeal-error" role="alert">{error}</p>}
    <Button type="submit" disabled={reading || !issues.length}>{reading ? 'Đang đọc bằng chứng...' : 'Gửi kháng cáo'}</Button>
  </form>;
}
