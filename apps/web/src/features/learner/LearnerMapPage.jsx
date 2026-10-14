import { useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { demoDistance, mapTutors } from '../../data/tutorMap.js';
import LearnerHeader from './LearnerHeader.jsx';
import TutorMap from './TutorMap.jsx';
import './search.css';

export default function LearnerMapPage() {
  const [firstId, setFirstId] = useState(mapTutors[0]?.id ?? '');
  const [secondId, setSecondId] = useState(mapTutors[1]?.id ?? mapTutors[0]?.id ?? '');
  const first = mapTutors.find((tutor) => tutor.id === firstId);
  const second = mapTutors.find((tutor) => tutor.id === secondId);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="public-page public-page--learner learner-search-page density-comfortable">
      <LearnerHeader />
      <main className="learner-container learner-map-page">
        <Link className="flow-back" to="/learner/search">
          <ArrowLeft size={17} aria-hidden="true" /> Trở về tìm gia sư
        </Link>
        <span className="eyebrow">KHÁM PHÁ KHU VỰC</span>
        <h1>Bản đồ gia sư gần bạn</h1>
        <p>Chọn hai gia sư để xem khoảng cách minh họa giữa các khu vực.</p>

        <div className="learner-map-layout">
          <section className="learner-map-canvas" aria-label="Bản đồ gia sư">
            {first && second ? (
              <TutorMap first={first} second={second} onSelect={(tutor) => setSecondId(tutor.id)} />
            ) : (
              <p>Chưa có dữ liệu gia sư để hiển thị trên bản đồ.</p>
            )}
            <p>Vị trí và khoảng cách là dữ liệu minh họa, không phải địa chỉ hoặc quãng đường thực tế.</p>
          </section>

          <aside className="learner-map-details" aria-label="So sánh gia sư">
            <label>
              Gia sư thứ nhất
              <select value={firstId} onChange={(event) => setFirstId(event.target.value)}>
                {mapTutors.map((tutor) => <option key={tutor.id} value={tutor.id}>{tutor.name}</option>)}
              </select>
            </label>
            <label>
              Gia sư thứ hai
              <select value={secondId} onChange={(event) => setSecondId(event.target.value)}>
                {mapTutors.map((tutor) => <option key={tutor.id} value={tutor.id}>{tutor.name}</option>)}
              </select>
            </label>
            {first && second && (
              <div className="learner-map-distance">
                <MapPin size={22} aria-hidden="true" />
                <strong>{demoDistance(first, second)} km</strong>
                <span>Khoảng cách minh họa</span>
              </div>
            )}
            {[first, second].filter((tutor, index, tutors) => tutor && tutors.findIndex((item) => item?.id === tutor.id) === index).map((tutor) => (
              <article key={tutor.id}>
                <h2>{tutor.name}</h2>
                <p>{tutor.location} · {tutor.subjects.join(', ')}</p>
                <Link to={`/tutors/${tutor.id}`}>Xem hồ sơ <ArrowRight size={16} aria-hidden="true" /></Link>
              </article>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}
