import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import { findSubjects, subjectById, subjectCategories, studentLevels } from '../../data/subjectCatalog.js';
import './profile-fields.css';

export function ImageUpload({ label, description, value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const select = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Chỉ chọn ảnh tối đa 5 MB.'); return;
    }
    setError(''); onChange(file);
  };
  return <div className="profile-upload"><strong>{label}</strong>{description && <p>{description}</p>}
    <button type="button" className="profile-upload__target" onClick={() => inputRef.current?.click()}>
      {value ? <img src={value.url} alt={`Xem trước ${label.toLowerCase()}`}/> : <><ImagePlus size={24}/><span>Chọn ảnh</span></>}
    </button>
    <input ref={inputRef} className="sr-only" type="file" accept="image/*" aria-label={`Chọn ${label.toLowerCase()}`} onChange={select}/>
    {value && <div className="profile-upload__actions"><button type="button" className="text-link" onClick={() => inputRef.current?.click()}>Thay ảnh</button><button type="button" className="text-link" onClick={() => onChange(null)}>Xóa ảnh</button></div>}
    {error && <small role="alert" className="flow-error">{error}</small>}
  </div>;
}

function SubjectRequestModal({ initialName, onClose, onSubmit }) {
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState('');
  const ref = useDialogFocus(onClose);
  return createPortal(<div className="profile-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="subject-request-title" className="profile-modal" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); onSubmit({ name: name.trim(), note: note.trim(), status: 'PENDING' }); }}><button type="button" className="profile-modal__close" aria-label="Đóng" onClick={onClose}><X size={20}/></button><h2 id="subject-request-title">Đề xuất môn học / kỹ năng mới</h2><label>Tên kỹ năng<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)}/></label><label>Ghi chú (tùy chọn)<textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)}/></label><div className="profile-modal__actions"><button type="button" className="button button--secondary" onClick={onClose}>Hủy</button><button type="submit" className="button button--primary" disabled={!name.trim()}>Gửi đề xuất</button></div></form></div>, document.body);
}

export function SubjectSelector({ selectedIds, onChange }) {
  const [query, setQuery] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const matches = findSubjects(query);
  const add = (id) => { if (!selectedIds.includes(id)) onChange([...selectedIds, id]); };
  return <section className="profile-subjects"><h3>Môn học / kỹ năng có thể dạy</h3><p>Chọn một hoặc nhiều môn học hoặc kỹ năng bạn có thể giảng dạy.</p>
    <input type="search" value={query} placeholder="Tìm môn học hoặc kỹ năng..." aria-label="Tìm môn học hoặc kỹ năng" onChange={(event) => setQuery(event.target.value)}/>
    <div className="profile-subjects__tags" aria-label="Môn học đã chọn">{selectedIds.map((id) => { const subject = subjectById(id); return subject && <span key={id}>{subject.name}<button type="button" aria-label={`Bỏ ${subject.name}`} onClick={() => onChange(selectedIds.filter((value) => value !== id))}><X size={15}/></button></span>; })}</div>
    <div className="profile-subjects__options">{matches.length ? subjectCategories.map((category) => { const options = matches.filter((subject) => subject.categoryId === category.id); return options.length > 0 && <div key={category.id}><strong>{category.name}</strong><div>{options.map((subject) => <button type="button" key={subject.id} className={selectedIds.includes(subject.id) ? 'is-selected' : ''} disabled={selectedIds.includes(subject.id)} onClick={() => add(subject.id)}>{subject.name}{selectedIds.includes(subject.id) ? ' ✓' : ''}</button>)}</div></div>; }) : <div className="profile-subjects__empty"><p>Không tìm thấy môn học hoặc kỹ năng này.</p><button type="button" className="text-link" onClick={() => setRequestOpen(true)}>+ Đề xuất thêm “{query.trim()}”</button></div>}</div>
    {notice && <p role="status" className="flow-success">{notice}</p>}
    {requestOpen && <SubjectRequestModal initialName={query.trim()} onClose={() => setRequestOpen(false)} onSubmit={(request) => { try { const key = 'tnm.subject.requests'; const current = JSON.parse(localStorage.getItem(key) || '[]'); localStorage.setItem(key, JSON.stringify([...current, request])); setNotice('Đề xuất của bạn đã được gửi và đang chờ xét duyệt.'); } catch { setNotice('Đề xuất của bạn đã được ghi nhận trong phiên này.'); } setRequestOpen(false); }}/>} 
  </section>;
}

export function StudentLevelSelector({ selected, onChange }) {
  const toggle = (level) => onChange(level === 'Mọi độ tuổi' ? (selected.includes(level) ? [] : [level]) : (selected.includes(level) ? selected.filter((item) => item !== level) : [...selected.filter((item) => item !== 'Mọi độ tuổi'), level]));
  return <fieldset className="tutor-level-options"><legend>Đối tượng học viên có thể dạy</legend><p>Chọn một hoặc nhiều nhóm học viên phù hợp.</p><div>{studentLevels.map((level) => <label key={level}><input type="checkbox" checked={selected.includes(level)} onChange={() => toggle(level)}/><span>{level}</span></label>)}</div></fieldset>;
}
