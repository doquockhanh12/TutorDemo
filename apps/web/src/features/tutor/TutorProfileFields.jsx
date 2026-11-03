import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ImagePlus, Search, X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';
import { findSubjects, normalizeSubjectSearch, popularTutorSubjectIds, subjectById, subjectCategories, subjects, studentLevels } from '../../data/subjectCatalog.js';
import './profile-fields.css';

export function ImageUpload({ label, description, value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const select = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Chỉ chọn JPG, PNG hoặc WebP tối đa 5 MB.'); return;
    }
    setError(''); onChange(file);
  };
  return <div className="profile-upload"><strong>{label}</strong>{description && <p>{description}</p>}
    <button type="button" className="profile-upload__target" onClick={() => inputRef.current?.click()}>
      {value ? <img src={value.url} alt={`Xem trước ${label.toLowerCase()}`}/> : <><ImagePlus size={24}/><span>Chọn ảnh</span></>}
    </button>
    <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Chọn ${label.toLowerCase()}`} onChange={select}/>
    {value && <div className="profile-upload__actions"><button type="button" className="text-link" onClick={() => inputRef.current?.click()}>Thay ảnh</button><button type="button" className="text-link" onClick={() => onChange(null)}>Xóa ảnh</button></div>}
    {error && <small role="alert" className="flow-error">{error}</small>}
  </div>;
}

function SubjectRequestModal({ initialName, onClose, onSubmit }) {
  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState('other');
  const [note, setNote] = useState('');
  const ref = useDialogFocus(onClose);
  return createPortal(<div className="profile-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="subject-request-title" className="profile-modal" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); onSubmit({ name: name.trim(), categoryId, note: note.trim(), status: 'PENDING' }); }}><button type="button" className="profile-modal__close" aria-label="Đóng" onClick={onClose}><X size={20}/></button><h2 id="subject-request-title">Đề xuất chuyên môn mới</h2><label>Tên chuyên môn<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)}/></label><label>Lĩnh vực đề xuất<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{subjectCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Mô tả hoặc ghi chú<textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)}/></label><div className="profile-modal__actions"><button type="button" className="button button--secondary" onClick={onClose}>Hủy</button><button type="submit" className="button button--primary" disabled={!name.trim()}>Gửi đề xuất</button></div></form></div>, document.body);
}

export function SubjectSelector({ selectedIds, onChange, onRequest }) {
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const term = normalizeSubjectSearch(query);
  const direct = term ? findSubjects(query).filter((subject) => term.length > 2 || [subject.name, ...subject.aliases, ...(subject.keywords || [])].some((label) => normalizeSubjectSearch(label).split(/[^a-z0-9]+/).includes(term))) : popularTutorSubjectIds.map(subjectById).filter(Boolean);
  const matches = [...new Map([...direct, ...(query.trim() ? direct.flatMap((subject) => subject.kind === 'parent' ? subjects.filter((child) => child.parentId === subject.id) : []) : [])].map((subject) => [subject.id, subject])).values()].slice(0, query.trim() ? 18 : 7);
  useEffect(() => { if (open) listRef.current?.querySelectorAll('[role="option"]')[active]?.scrollIntoView({ block: 'nearest' }); }, [active, open, query]);
  const add = (id) => { if (selectedIds.includes(id)) return; onChange([...selectedIds, id]); setQuery(''); setActive(0); setOpen(false); };
  const groupLabel = (subject) => subject.categoryId === 'certificate' ? 'Ngoại ngữ' : subject.parentId ? subjectById(subject.parentId)?.name : subjectCategories.find((category) => category.id === subject.categoryId)?.name;
  return <section className="profile-subjects"><h3>Chuyên môn có thể dạy</h3><p>Chọn những môn học hoặc kỹ năng bạn thực sự có thể dạy.</p>
    <div className="profile-subjects__search-wrap">
      <div className="profile-subjects__search"><Search size={18} aria-hidden="true"/><input type="text" role="combobox" aria-expanded={open} aria-controls="profile-subject-options" aria-autocomplete="list" aria-activedescendant={open && matches[active] ? `profile-subject-${matches[active].id}` : undefined} autoComplete="off" value={query} placeholder="Tìm môn học hoặc kỹ năng..." aria-label="Tìm chuyên môn" onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onBlur={() => setOpen(false)} onChange={(event) => { setQuery(event.target.value); setActive(0); setOpen(true); }} onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); return; } if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => open ? Math.min(value + 1, matches.length - 1) : 0); setOpen(true); } if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); setOpen(true); } if (event.key === 'Enter' && open && matches[active]) { event.preventDefault(); add(matches[active].id); } }}/>{query && <button type="button" className="profile-subjects__clear" aria-label="Xóa từ khóa" onMouseDown={(event) => event.preventDefault()} onClick={() => { setQuery(''); setActive(0); setOpen(true); }}><X size={16}/></button>}</div>
      {open && <div ref={listRef} className="profile-subjects__options" id="profile-subject-options" role="listbox" aria-label="Gợi ý chuyên môn">{matches.length ? matches.map((subject, index) => { const selected = selectedIds.includes(subject.id); return <button type="button" role="option" aria-label={subject.name} aria-describedby={`profile-subject-group-${subject.id}`} aria-selected={selected} id={`profile-subject-${subject.id}`} key={subject.id} className={`${index === active ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`} onMouseEnter={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => add(subject.id)}><span><strong>{subject.name}</strong><small id={`profile-subject-group-${subject.id}`}>{groupLabel(subject)}</small></span>{selected && <Check size={17} aria-hidden="true"/>}</button>; }) : <div className="profile-subjects__empty"><p>Không tìm thấy chuyên môn phù hợp.</p><button type="button" className="text-link" onMouseDown={(event) => event.preventDefault()} onClick={() => { setOpen(false); setRequestOpen(true); }}>+ Đề xuất chuyên môn mới</button></div>}</div>}
    </div>
    <div className="profile-subjects__tags" aria-label="Môn học đã chọn">{selectedIds.map((id) => { const subject = subjectById(id); return subject && <span key={id}>{subject.name}<button type="button" aria-label={`Bỏ ${subject.name}`} onClick={() => onChange(selectedIds.filter((value) => value !== id))}><X size={15}/></button></span>; })}</div>
    {notice && <p role="status" className="flow-success">{notice}</p>}
    {requestOpen && <SubjectRequestModal initialName={query.trim()} onClose={() => setRequestOpen(false)} onSubmit={(request) => { setNotice(onRequest?.(request) ? 'Đề xuất đã lưu với trạng thái PENDING trong trình duyệt; chưa gửi đến hệ thống.' : 'Không thể ghi nhận đề xuất trong phiên này.'); setRequestOpen(false); }}/>}
  </section>;
}

export function StudentLevelSelector({ selected, onChange }) {
  const toggle = (level) => onChange(level === 'Mọi độ tuổi' ? (selected.includes(level) ? [] : [level]) : (selected.includes(level) ? selected.filter((item) => item !== level) : [...selected.filter((item) => item !== 'Mọi độ tuổi'), level]));
  return <fieldset className="tutor-level-options"><legend>Đối tượng học viên có thể dạy</legend><p>Chọn một hoặc nhiều nhóm học viên phù hợp.</p><div>{studentLevels.map((level) => <label key={level}><input type="checkbox" checked={selected.includes(level)} onChange={() => toggle(level)}/><span>{level}</span></label>)}</div></fieldset>;
}
