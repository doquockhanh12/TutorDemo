import {
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Clock3,
  MapPin,
  Star,
} from 'lucide-react';

import Avatar from '../../components/Avatar.jsx';
import Brand from '../../components/Brand.jsx';

import useDemoDomain from '../domain/DemoDomainContext.jsx';

import ProfileCalendar from './ProfileCalendar.jsx';
import ProfileChoices from './ProfileChoices.jsx';

import {
  removeSelectedProposal,
} from './profileSelection.js';

import {
  usePublicTutorSchedule,
} from '../tutor/TutorWorkspaceState.jsx';

import { useSavedTutors } from '../domain/DemoDomainContext.jsx';
import LearnerHeader from './LearnerHeader.jsx';
import TutorRequestForm from './TutorRequestForm.jsx';

import './search.css';
import './profile.css';

export default function TutorProfilePage() {
  const { id } = useParams();
  const domain = useDemoDomain();
  const tutors = domain.profiles || [];
  const reviews = domain.reviews || [];

  const { hash } =
    useLocation();

  useLayoutEffect(() => {
    const target =
      hash &&
      document.getElementById(
        hash.slice(1)
      );

    if (target) {
      target.scrollIntoView({
        behavior: 'instant',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }
  }, [id, hash]);

  const rawTutor =
    tutors.find(
      (item) =>
        item.id === id
    );
  const tutor = (rawTutor && (rawTutor.moderationStatus || 'approved') === 'approved') ? rawTutor : null;

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable">
      <LearnerHeader />

      <main className="learner-container tutor-profile-page">
        <nav
          className="profile-breadcrumb"
          aria-label="Đường dẫn"
        >
          <Link to="/learner/search">
            <ArrowLeft size={17} />
            Tìm gia sư
          </Link>

          <span>/</span>

          <span>
            Hồ sơ gia sư
          </span>
        </nav>

        {tutor ? (
          <ProfileContent
            key={id}
            tutor={tutor}
            reviews={reviews}
          />
        ) : (
          <section className="learner-empty">
            <h1>
              Không tìm thấy gia sư
            </h1>

            <p>
              Hồ sơ này không có trong
              dữ liệu minh họa.
            </p>

            <Link
              className="button button--primary button--md"
              to="/learner/search"
            >
              Trở về tìm kiếm
            </Link>
          </section>
        )}
      </main>

      <footer className="learner-footer">
        <div className="learner-container">
          <Brand compact />

          <p>
            Kết nối đúng người. Học theo
            cách của bạn.
          </p>

          <span>
            Hồ sơ và đánh giá minh họa ·
            TutorNearMe
          </span>
        </div>
      </footer>
    </div>
  );
}

function ProfileContent({
  tutor,
  reviews: propReviews,
}) {
  const domain = useDemoDomain();
  const reviews = propReviews || domain.reviews || [];

  const visibleReviews = useMemo(() => {
    const tid = tutor?.id;
    return reviews.filter(
      (r) =>
        (r.tutorId === tid || r.tutorId === tutor?.id) &&
        (r.moderationStatus || 'approved') === 'approved' &&
        (r.visibility || 'public') === 'public'
    );
  }, [reviews, tutor?.id]);

  const ratingSummary = useMemo(() => {
    if (!visibleReviews.length) {
      return { averageRating: 0, reviewCount: 0, hasReviews: false };
    }
    const sum = visibleReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = Number((sum / visibleReviews.length).toFixed(1));
    return { averageRating: avg, reviewCount: visibleReviews.length, hasReviews: true };
  }, [visibleReviews]);

  const [saved, setSaved] =
    useSavedTutors();

  const [params] =
    useSearchParams();

  const [
    validationErrors,
    setValidationErrors,
  ] = useState({});

  const [
    selection,
    setSelection,
  ] = useState(() => ({
    subjects: [
      ...new Set(
        params
          .getAll('subject')
          .filter((subject) =>
            tutor.subjects.includes(
              subject
            )
          )
      ),
    ],

    levels: [],
    proposals: [],
    formats: [],
    areas: [],
  }));

  const toggleChoice = (
    key,
    value
  ) =>
    setSelection(
      (current) => ({
        ...current,

        [key]:
          current[
            key
          ].includes(value)
            ? current[key].filter(
                (item) =>
                  item !== value
              )
            : [
                ...current[key],
                value,
              ],
      })
    );

  const removeRange = (
    range
  ) =>
    setSelection(
      (current) => ({
        ...current,

        proposals:
          removeSelectedProposal(
            current.proposals,
            range
          ),
      })
    );

  const {
    sessionMinutes,
  } = usePublicTutorSchedule(
    tutor
  );

  const profile = tutor;

  const isSaved =
    saved.includes(tutor.id);

  const subjectInvalid =
    Boolean(
      validationErrors.subjects || validationErrors.levels
    );

  const calendarInvalid =
    Boolean(
      validationErrors.proposals
    );

  const locationInvalid =
    Boolean(
      validationErrors.formats ||
        validationErrors.areas
    );

  return (
    <div className="tutor-profile-layout">
      <div className="tutor-profile-main">
        <section className="profile-identity">
          <Avatar
            initials={
              tutor.initials
            }
            name={
              tutor.name
            }
            tone={
              tutor.avatarTone
            }
            size="xl"
          />

          <div className="profile-identity__info">
            <span className="eyebrow">
              HỒ SƠ GIA SƯ · DEMO
            </span>

            <h1>
              {tutor.name}
            </h1>

            <span
              className={`profile-verification ${
                tutor.verified
                  ? 'is-verified'
                  : ''
              }`}
            >
              <BadgeCheck
                size={16}
              />

              {tutor.verified
                ? 'Hồ sơ demo đã xác minh'
                : 'Hồ sơ demo chưa xác minh'}
            </span>

            <p>
              {tutor.university}
              {' · '}
              {
                tutor.experience
              }
            </p>

            {ratingSummary.hasReviews ? (
              <span className="profile-rating">
                <Star
                  size={17}
                  fill="currentColor"
                />

                <strong>
                  {ratingSummary.averageRating}/5
                </strong>

                {' · '}
                {ratingSummary.reviewCount}{' '}
                đánh giá
              </span>
            ) : (
              <span className="profile-rating">Chưa có đánh giá</span>
            )}
          </div>

          <div className="profile-identity__action">
            <strong>
              {new Intl.NumberFormat(
                'vi-VN'
              ).format(
                tutor.price
              )}
              đ{' '}

              <small>
                / buổi
              </small>
            </strong>

            <span>
              <Clock3
                size={15}
              />

              {sessionMinutes}{' '}
              phút / buổi
            </span>

            <button
              className="button button--secondary button--sm"
              aria-pressed={
                isSaved
              }
              onClick={() =>
                setSaved(
                  (ids) =>
                    isSaved
                      ? ids.filter(
                          (
                            value
                          ) =>
                            value !==
                            tutor.id
                        )
                      : [
                          ...ids,
                          tutor.id,
                        ]
                )
              }
            >
              <Bookmark
                size={17}
                fill={
                  isSaved
                    ? 'currentColor'
                    : 'none'
                }
              />

              {isSaved
                ? 'Đã lưu hồ sơ'
                : 'Lưu hồ sơ'}
            </button>
          </div>
        </section>

        <section className="profile-section">
          <h2>
            Giới thiệu
          </h2>

          <p>
            {tutor.intro}
          </p>

          <h3>
            Phương pháp đồng hành
          </h3>

          <p>
            {profile.approach}
          </p>
        </section>

        <section
          className={
            'profile-section' +
            (subjectInvalid
              ? ' is-validation-error'
              : '')
          }
          id="profile-subjects"
          aria-invalid={
            subjectInvalid ||
            undefined
          }
        >
          <h2>
            Môn dạy & cấp độ
          </h2>

          <p>
            Chọn ít nhất một môn và một cấp độ. Các
            lựa chọn tự thêm vào form gửi
            yêu cầu.
          </p>

          <ProfileChoices
            title="Môn học"
            options={
              tutor.subjects
            }
            selected={
              selection.subjects
            }
            onToggle={(
              value
            ) =>
              toggleChoice(
                'subjects',
                value
              )
            }
          />

          <ProfileChoices
            title="Cấp độ *"
            options={
              profile.levels
            }
            selected={
              selection.levels
            }
            onToggle={(
              value
            ) =>
              toggleChoice(
                'levels',
                value
              )
            }
          />
        </section>

        <ProfileCalendar
          tutor={tutor}
          selected={
            selection.proposals
          }
          invalid={
            calendarInvalid
          }
          onAdd={(
            proposal
          ) =>
            setSelection(
              (current) => ({
                ...current,

                proposals: [
                  ...current.proposals,
                  proposal,
                ],
              })
            )
          }
          onRemove={
            removeRange
          }
        />

        <section
          className={
            'profile-section' +
            (locationInvalid
              ? ' is-validation-error'
              : '')
          }
          id="profile-location"
          aria-invalid={
            locationInvalid ||
            undefined
          }
        >
          <h2>
            <MapPin
              size={21}
            />
            Khu vực & hình thức dạy
          </h2>

          <ProfileChoices
            title="Hình thức học"
            options={
              profile.formats
            }
            selected={
              selection.formats
            }
            onToggle={(
              value
            ) =>
              toggleChoice(
                'formats',
                value
              )
            }
          />

          <ProfileChoices
            title="Khu vực học"
            options={
              profile.areas
            }
            selected={
              selection.areas
            }
            onToggle={(
              value
            ) =>
              toggleChoice(
                'areas',
                value
              )
            }
          />

          <p>
            Có thể chọn nhiều phương án
            phù hợp. Địa điểm cụ thể sẽ
            được trao đổi khi gia sư phản
            hồi.
          </p>
        </section>
      </div>

      <aside className="tutor-profile-aside">
        <TutorRequestForm
          tutor={tutor}
          selection={
            selection
          }
          onToggle={
            toggleChoice
          }
          onRemoveRange={
            removeRange
          }
          onValidationErrors={
            setValidationErrors
          }
        />

        <section className="profile-reviews">
          <h2>
            Đánh giá gần đây
          </h2>

          <p className="profile-reviews__note">
            Nhận xét minh họa cho giao diện.
          </p>

          {visibleReviews.length === 0 ? (
            <p className="profile-reviews__note" style={{ fontStyle: 'italic', marginTop: 'var(--space-2)' }}>
              Chưa có đánh giá nào cho gia sư này.
            </p>
          ) : (
            visibleReviews.map((review) => {
              const reviewerName = review.name || review.author || review.learnerName || 'Học viên';
              const reviewerInitials =
                review.initials ||
                reviewerName
                  .trim()
                  .split(/\s+/)
                  .slice(-2)
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase() ||
                'HV';
              const reviewText = review.text || review.comment || review.excerpt || '';
              const reviewDate = review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '');

              return (
                <article key={review.id}>
                  <Avatar
                    initials={reviewerInitials}
                    name={reviewerName}
                    size="sm"
                  />

                  <div>
                    <div className="profile-review__meta">
                      <strong>{reviewerName}</strong>
                      {reviewDate && <time>{reviewDate}</time>}
                    </div>

                    <span className="profile-rating">
                      <Star size={14} fill="currentColor" />
                      {review.rating}/5
                    </span>

                    <p>{reviewText}</p>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </aside>
    </div>
  );
}
