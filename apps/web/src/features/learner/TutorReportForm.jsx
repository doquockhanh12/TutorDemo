import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../../components/Button.jsx';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import useLearnerReportData from './hooks/useLearnerReportData.js';
import { tutorReportReasons, requestReportReasons } from '../domain/tutorReports.js';
import './tutor-report.css';

export default function TutorReportForm({ tutorId, tutorName, requestId, requestCode, onClose, onSuccess }) {
  const { createTutorReport, reportImagesInvalid, readReportImages } = useLearnerReportData();
  const dialogRef = useDialogFocus(onClose);
  const fileRef = useRef(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [reading, setReading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const reasons = { ...tutorReportReasons, ...(requestId ? requestReportReasons : {}) };
  const clearImages = () => { setImages([]); setImageError(''); if (fileRef.current) fileRef.current.value = ''; };
  const readImages = async (event) => {
    const files = [...event.target.files];
    setImageError(''); setError('');
    if (reportImagesInvalid(files)) {
      setImageError('Chọn tối đa 3 ảnh PNG/JPG/WebP, mỗi ảnh ≤ 500 KB, tổng ≤ 1 MB.');
      return;
    }
    setReading(true);
    try {
      const evidence = await readReportImages(files);
      setImages(evidence);
    } catch { setImageError('Không đọc được ảnh. Vui lòng chọn lại.'); }
    finally { setReading(false); }
  };
  const submit = (event) => {
    event.preventDefault();
    if (reading || imageError) return;
    const result = createTutorReport({ tutorId, requestId, reason, description, evidence: images });
    if (result.error) { setError(result.error); return; }
    onSuccess();
  };
  return createPortal(
    <div className="tutor-report-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="tutor-report-dialog" role="dialog" aria-modal="true" aria-labelledby="tutor-report-title" tabIndex={-1}>
        <div className="tutor-report-dialog__heading"><h2 id="tutor-report-title">Báo cáo gia sư</h2><button className="icon-button" type="button" aria-label="Đóng báo cáo" onClick={onClose}><X size={20} aria-hidden="true" /></button></div>
        <p className="tutor-report-dialog__context">Gia sư: <strong>{tutorName || `Gia sư (${tutorId})`}</strong>{requestId && <><br />Mã yêu cầu: <strong>{requestCode || requestId}</strong></>}</p>
        <form onSubmit={submit} noValidate>
          <label>Lý do báo cáo <span>(Bắt buộc)</span><select value={reason} onChange={(event) => { setReason(event.target.value); setError(''); }} required><option value="">Chọn lý do</option>{Object.entries(reasons).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
          <label>Mô tả sự việc {reason === 'other' && <span>(Bắt buộc)</span>}<textarea rows={4} maxLength={5000} required={reason === 'other'} value={description} onChange={(event) => { setDescription(event.target.value); setError(''); }} placeholder="Hãy ghi rõ chuyện gì đã xảy ra và vào thời điểm nào." /></label>
          <label>Ảnh minh chứng <span>(Không bắt buộc)</span><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={reading} onChange={readImages} /><small>Tối đa 3 ảnh PNG/JPG/WebP, mỗi ảnh 500 KB, tổng 1 MB.</small></label>
          {images.length > 0 && <ul className="tutor-report-files">{images.map((item, index) => <li key={`${item.name}-${index}`}>{item.name}</li>)}</ul>}
          {(images.length > 0 || imageError) && <button className="text-button" type="button" onClick={clearImages} disabled={reading}>Bỏ ảnh đã chọn</button>}
          {(error || imageError) && <p className="tutor-report-error" role="alert">{error || imageError}</p>}
          <div className="tutor-report-dialog__actions"><Button variant="secondary" onClick={onClose}>Hủy</Button><Button type="submit" disabled={reading || Boolean(imageError)}>{reading ? 'Đang đọc ảnh...' : 'Gửi báo cáo'}</Button></div>
        </form>
      </section>
    </div>, document.body,
  );
}
