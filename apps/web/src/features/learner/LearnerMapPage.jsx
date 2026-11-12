import { useLayoutEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  GraduationCap,
  Heart,
  MapPin,
  Navigation,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import Badge from '../../components/Badge.jsx';
import { demoDistance, mapTutors } from '../../data/tutorMap.js';
import { useSavedTutors } from '../domain/DemoDomainContext.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import TutorMap from './TutorMap.jsx';
import './search.css';

const LEARNER_LOCATION = {
  name: 'Vị trí của bạn',
  location: 'Quận 1, TP. Hồ Chí Minh',
  x: 75,
  y: 360,
  initials: 'BẠN',
};

export default function LearnerMapPage() {
  const [selectedArea, setSelectedArea] = useState('Tất cả khu vực');
  const [selectedTutorId, setSelectedTutorId] = useState(mapTutors[0]?.id ?? '');
  const [savedIds, setSavedIds] = useSavedTutors();

  const areaOptions = useMemo(
    () => ['Tất cả khu vực', ...new Set(mapTutors.map((t) => t.location).filter(Boolean))],
    []
  );

  const selectedTutor = useMemo(
    () => mapTutors.find((t) => t.id === selectedTutorId) || mapTutors[0],
    [selectedTutorId]
  );

  const distanceToLearner = useMemo(
    () => (selectedTutor ? demoDistance(LEARNER_LOCATION, selectedTutor) : '0.0'),
    [selectedTutor]
  );

  const toggleSave = (id) => {
    setSavedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );
  };

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader compact />

      <section className="learner-page-banner">
        <div className="learner-container">
          <div className="learner-banner-top-nav">
            <Link className="flow-back" to="/learner/search">
              <ArrowLeft size={17} aria-hidden="true" /> Quay lại Tìm gia sư
            </Link>
          </div>
          <h1>Bản đồ gia sư gần bạn</h1>
          <p>
            Trực quan hóa vị trí của gia sư sinh viên và đo khoảng cách di chuyển thực tế từ vị trí của bạn.
          </p>
        </div>
      </section>

      <main className="learner-container learner-map-page">
        <div className="learner-map-area-pills" aria-label="Lọc nhanh khu vực trên bản đồ">
          <span>Khu vực:</span>
          {areaOptions.map((area) => (
            <button
              key={area}
              type="button"
              className={`learner-subject-chip ${selectedArea === area ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedArea(area);
                if (area !== 'Tất cả khu vực') {
                  const firstInArea = mapTutors.find((t) => t.location === area);
                  if (firstInArea) setSelectedTutorId(firstInArea.id);
                }
              }}
            >
              <MapPin size={14} aria-hidden="true" />
              {area}
            </button>
          ))}
        </div>

        <div className="learner-map-layout">
          <section className="learner-map-canvas" aria-label="Bản đồ gia sư">
            <div className="learner-map-canvas__frame">
              <div className="learner-map-canvas__topbar">
                <span className="learner-map-canvas__badge">
                  <Navigation size={15} aria-hidden="true" /> Bản đồ khu vực TP. Hồ Chí Minh
                </span>
                {selectedTutor && (
                  <span className="learner-map-canvas__distance-pill">
                    <Sparkles size={14} aria-hidden="true" />
                    Khoảng cách đến <strong>{selectedTutor.name}</strong>: <strong>{distanceToLearner} km</strong>
                  </span>
                )}
              </div>

              <TutorMap
                learner={LEARNER_LOCATION}
                tutor={selectedTutor}
                onSelect={(t) => setSelectedTutorId(t.id)}
              />

              <div className="learner-map-canvas__footer">
                <p>
                  Nhấn vào điểm ghim trên bản đồ hoặc chọn gia sư từ menu bên phải để đo khoảng cách di chuyển từ vị trí của bạn ({LEARNER_LOCATION.location}).
                </p>
              </div>
            </div>
          </section>

          <aside className="learner-map-details" aria-label="Thông tin gia sư được chọn và khoảng cách">
            <div className="learner-map-compare-box">
              <div className="learner-map-user-location">
                <span className="learner-map-user-location__label">Vị trí của bạn:</span>
                <strong>
                  <MapPin size={16} aria-hidden="true" /> {LEARNER_LOCATION.location}
                </strong>
              </div>

              <label className="learner-map-select-label">
                <span>Chọn gia sư muốn xem khoảng cách:</span>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  aria-label="Chọn gia sư để xem khoảng cách"
                >
                  {mapTutors
                    .filter((t) => selectedArea === 'Tất cả khu vực' || t.location === selectedArea)
                    .map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name} — {tutor.location} ({tutor.subjects?.join(', ')})
                      </option>
                    ))}
                </select>
              </label>

              {selectedTutor && (
                <div className="learner-map-distance-result">
                  <div className="learner-map-distance">
                    <div className="learner-map-distance__icon" aria-hidden="true">
                      <MapPin size={22} />
                    </div>
                    <div className="learner-map-distance__info">
                      <div className="learner-map-distance__head">
                        <span className="learner-map-distance__label">Khoảng cách:</span>
                        <strong className="learner-map-distance__value">~{distanceToLearner} km</strong>
                      </div>
                      <p className="learner-map-distance__sub">
                        Đến khu vực {selectedTutor.location}
                      </p>
                    </div>
                  </div>

                  <div className="learner-map-tutor-mini-card">
                    <div className="learner-map-tutor-mini-card__head">
                      <Avatar
                        initials={selectedTutor.initials}
                        name={selectedTutor.name}
                        tone={selectedTutor.avatarTone}
                        size="md"
                      />
                      <div className="learner-map-tutor-mini-card__info">
                        <div className="learner-map-tutor-mini-card__title">
                          <h4>{selectedTutor.name}</h4>
                          {selectedTutor.verified && (
                            <span className="tutor-card__verified" title="Đã xác minh thẻ SV">
                              <BadgeCheck size={14} aria-hidden="true" />
                            </span>
                          )}
                        </div>
                        <p className="learner-map-tutor-mini-card__meta">
                          <GraduationCap size={14} aria-hidden="true" /> {selectedTutor.university}
                        </p>
                        <p className="learner-map-tutor-mini-card__loc">
                          <MapPin size={13} aria-hidden="true" /> {selectedTutor.location}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`icon-button learner-heart-btn learner-heart-btn--sm ${
                          savedIds.includes(selectedTutor.id) ? 'is-saved' : ''
                        }`}
                        onClick={() => toggleSave(selectedTutor.id)}
                        aria-label={
                          savedIds.includes(selectedTutor.id)
                            ? `Bỏ lưu ${selectedTutor.name}`
                            : `Lưu ${selectedTutor.name}`
                        }
                        aria-pressed={savedIds.includes(selectedTutor.id)}
                      >
                        <Heart
                          size={17}
                          fill={savedIds.includes(selectedTutor.id) ? 'currentColor' : 'none'}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <div className="learner-map-tutor-mini-card__subjects">
                      {selectedTutor.subjects?.map((s) => (
                        <Badge key={s} tone="brand">{s}</Badge>
                      ))}
                    </div>

                    <div className="learner-map-tutor-mini-card__actions">
                      <Link
                        className="button button--primary button--sm"
                        to={`/tutors/${selectedTutor.id}`}
                        state={{ from: '/learner/map', fromLabel: 'Quay lại Bản đồ' }}
                      >
                        Xem hồ sơ gia sư <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
