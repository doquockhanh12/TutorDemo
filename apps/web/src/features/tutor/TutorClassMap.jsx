import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TutorShell } from './TutorPages.jsx';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import { classMapPositions } from '../../data/tutorClassMap.js';

export default function TutorClassMap() {
  const { requests } = useTutorWorkspace();
  const [selectedId, setSelectedId] = useState(null);
  const classes = requests.filter((item) => item.status === 'pending' && classMapPositions[item.id]);
  const selected = classes.find((item) => item.id === selectedId) || classes[0];
  return <TutorShell title="Tìm lớp gần tôi" subtitle="Khám phá vị trí lớp và xem yêu cầu học phù hợp.">
    <p className="tutor-map-notice">Bản đồ minh họa · vị trí và khoảng cách là dữ liệu demo, không dùng định vị thực tế.</p>
    <div className="tutor-class-map-layout"><section className="tutor-class-map" aria-label="Vị trí các lớp trên bản đồ minh họa">
      <svg viewBox="0 0 600 440" role="img" aria-label="Sơ đồ Bình Thạnh, Thủ Đức, Phú Nhuận và Quận 3"><rect width="600" height="440" fill="#f0f5ed"/><path d="M320 -20 C250 90 400 160 345 245 S365 360 320 460" fill="none" stroke="#b9e5f4" strokeWidth="55"/><path d="M-20 105 L620 235 M-20 345 L620 95 M90 -20 L180 460 M460 -20 L430 460 M-20 245 L620 365" fill="none" stroke="white" strokeWidth="18"/><g fill="#52617c" fontSize="14"><text x="45" y="85">PHÚ NHUẬN</text><text x="175" y="280">BÌNH THẠNH</text><text x="440" y="65">THỦ ĐỨC</text><text x="45" y="405">QUẬN 3</text></g></svg>
      {classes.map((item,index) => { const point = classMapPositions[item.id]; return <button key={item.id} className={`tutor-class-pin ${selected?.id === item.id ? 'is-selected' : ''}`} style={{ left: `${point.x / 6}%`, top: `${point.y / 4.4}%` }} onClick={() => setSelectedId(item.id)} aria-label={`Chọn ${item.subject}, ${item.area}`} aria-pressed={selected?.id === item.id}>{index + 1}</button>; })}
    </section><section className="tutor-section"><h2>{classes.length} lớp đang tìm gia sư</h2><div className="tutor-class-list">{classes.map((item,index) => <button key={item.id} className={selected?.id === item.id ? 'is-selected' : ''} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id}><strong>{index + 1}. {item.subject}</strong><span>{item.area} · khoảng {classMapPositions[item.id].distance}</span></button>)}</div>{selected ? <div className="tutor-class-detail"><h3>{selected.learner}</h3><p>{selected.note}</p><p>{selected.schedule}</p><Link className="button button--primary button--md" to={`/tutor/requests/${selected.id}`}>Xem chi tiết yêu cầu</Link></div> : <p className="empty-line">Chưa có lớp đang chờ. Các yêu cầu đã xử lý vẫn có trong danh sách yêu cầu học.</p>}</section></div>
  </TutorShell>;
}
