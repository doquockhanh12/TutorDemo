import { useEffect, useRef, useState } from 'react';

const kinds = ['Bằng cấp học vấn', 'Chứng chỉ chuyên môn', 'Giấy chứng nhận', 'Bằng khen hoặc thành tích', 'Tài liệu năng lực giảng dạy'];
export default function TutorEvidence() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const urls = useRef(new Set());
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const add = () => setItems((current) => [...current, { id: crypto.randomUUID(), name: '', kind: kinds[0], issuer: '', date: '', description: '', url: '', fileName: '', status: 'self_declared' }]);
  const change = (id, patch) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const remove = (id) => setItems((current) => { const item = current.find((entry) => entry.id === id); if (item?.url) { URL.revokeObjectURL(item.url); urls.current.delete(item.url); } return current.filter((entry) => entry.id !== id); });
  const choose = (id, file) => {
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Chỉ nhận PDF, JPG, PNG, WebP tối đa 5 MB.'); return; }
    setError('');
    const previous = items.find((item) => item.id === id)?.url;
    if (previous) { URL.revokeObjectURL(previous); urls.current.delete(previous); }
    const url = URL.createObjectURL(file); urls.current.add(url);
    change(id, { url, fileName: file.name, mime: file.type });
  };
  return <section className="tutor-evidence"><h2>Minh chứng chuyên môn</h2><p>Tài liệu tự khai báo trong phiên hiện tại, chưa được hệ thống xác minh hoặc tải lên máy chủ.</p>{items.map((item) => <fieldset key={item.id}><legend>{item.name || 'Tài liệu mới'} · Tự khai báo</legend><label>Tên tài liệu<input value={item.name} onChange={(event) => change(item.id, { name: event.target.value })}/></label><label>Loại tài liệu<select value={item.kind} onChange={(event) => change(item.id, { kind: event.target.value })}>{kinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label><label>Đơn vị cấp<input value={item.issuer} onChange={(event) => change(item.id, { issuer: event.target.value })}/></label><label>Ngày cấp<input type="date" value={item.date} onChange={(event) => change(item.id, { date: event.target.value })}/></label><label>Mô tả<textarea rows="2" value={item.description} onChange={(event) => change(item.id, { description: event.target.value })}/></label><label>File đính kèm<input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => choose(item.id, event.target.files?.[0])}/></label>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Xem trước {item.fileName}</a>}<button type="button" className="text-link" onClick={() => remove(item.id)}>Xóa tài liệu</button></fieldset>)}{error && <p className="flow-error" role="alert">{error}</p>}<button type="button" className="button button--secondary" onClick={add}>+ Thêm tài liệu</button></section>;
}
