import { useState } from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  SlidersHorizontal,
} from 'lucide-react';

import Badge from '../../components/Badge.jsx';
import { requestLabel, requestTone } from '../domain/statusMetadata.js';
import TutorHeader from './TutorHeader.jsx';
import { useTutorProfile } from '../domain/DemoDomainContext.jsx';
import { teachingLevels } from '../../data/tutorProfiles.js';



import TutorSidebar from './TutorSidebar.jsx';

import useTutorWorkspace from './TutorWorkspaceState.jsx';

import {
  proposedLessons,
  timeLabel,
} from '../../data/tutorSchedule.js';

function proposalDateLabel(
  dateString
) {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  const weekday =
    date.toLocaleDateString(
      'vi-VN',
      {
        weekday: 'long',
      }
    );

  const dateLabel =
    date.toLocaleDateString(
      'vi-VN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );

  return {
    weekday,
    date: dateLabel,
  };
}

export function TutorShell({
  title,
  subtitle,
  children,
}) {
  const [open, setOpen] =
    useState(false);

  const { requests } =
    useTutorWorkspace();

  return (
    <div className="workspace tutor-workspace density-standard">
      <TutorSidebar
        open={open}
        onClose={() =>
          setOpen(false)
        }
        pendingCount={
          requests.filter(
            (item) =>
              item.status ===
              'pending'
          ).length
        }
      />

      {open && (
        <button
          className="workspace-scrim"
          aria-label="Đóng điều hướng"
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      <div className="workspace__main">
        <TutorHeader
          onOpen={() =>
            setOpen(true)
          }
        />

        <main className="tutor-main tutor-flow">
          <div className="tutor-page-head">
            <div>
              <span className="eyebrow">
                KHÔNG GIAN GIA SƯ · DEMO
              </span>

              <h1>{title}</h1>

              <p>{subtitle}</p>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

export function TutorProfile() {
  const {
    sessionMinutes,
    setSessionMinutes,
  } = useTutorWorkspace();

  const [
    profile,
    setProfile,
  ] = useTutorProfile();

  const [draft, setDraft] =
    useState(() => ({
      ...profile,
      levels: Array.isArray(profile.levels) ? profile.levels : ['THCS', 'THPT'],
      sessionMinutes,
    }));

  const [saved, setSaved] =
    useState(false);

  const change = (
    key,
    value
  ) => {
    setDraft({
      ...draft,
      [key]: value,
    });

    setSaved(false);
  };

  return (
    <TutorShell
      title="Hồ sơ gia sư"
      subtitle="Xem và chỉnh thông tin hiển thị trong hồ sơ demo."
    >
      <div className="tutor-flow__grid">
        <form
          className="flow-form"
          onSubmit={(event) => {
            event.preventDefault();

            setProfile(draft);

            setSessionMinutes(
              draft.sessionMinutes
            );

            setSaved(true);
          }}
        >
          <h2>
            Thông tin chuyên môn
          </h2>

          <label>
            Họ và tên

            <input
              required
              value={draft.name}
              onChange={(event) =>
                change(
                  'name',
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Môn có thể dạy

            <input
              required
              value={
                draft.subjects
              }
              onChange={(event) =>
                change(
                  'subjects',
                  event.target.value
                )
              }
            />
          </label>

          <fieldset className="tutor-level-options">
            <legend>Cấp độ có thể dạy</legend>
            <p>Chọn một hoặc nhiều cấp độ phù hợp.</p>
            <div>{teachingLevels.map((level) => <label key={level}>
              <input type="checkbox" checked={draft.levels.includes(level)} onChange={() => change('levels', draft.levels.includes(level) ? draft.levels.filter((item) => item !== level) : [...draft.levels, level])}/>
              <span>{level}</span>
            </label>)}</div>
          </fieldset>

          <label>
            Khu vực dạy

            <input
              required
              value={draft.area}
              onChange={(event) =>
                change(
                  'area',
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Mức phí mỗi buổi

            <input
              required
              type="number"
              min="0"
              value={draft.fee}
              onChange={(event) =>
                change(
                  'fee',
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Thời gian dạy cho một buổi

            <select
              value={
                draft.sessionMinutes
              }
              onChange={(event) =>
                change(
                  'sessionMinutes',
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="45">
                45 phút
              </option>

              <option value="90">
                90 phút
              </option>
            </select>
          </label>

          <label>
            Giới thiệu cách dạy

            <textarea
              rows="4"
              value={draft.bio}
              onChange={(event) =>
                change(
                  'bio',
                  event.target.value
                )
              }
            />
          </label>

          <button
            className="button button--primary"
            type="submit"
          >
            Lưu hồ sơ demo
          </button>

          {saved && (
            <p
              className="flow-success"
              role="status"
            >
              Đã lưu hồ sơ trong trình
              duyệt.
            </p>
          )}
        </form>

        <aside className="flow-summary">
          <span className="eyebrow">
            XEM TRƯỚC HỒ SƠ
          </span>

          <h3>
            {draft.name}
          </h3>

          <p>
            {draft.subjects} ·{' '}
            {draft.area}
          </p>

          <strong>
            {new Intl.NumberFormat(
              'vi-VN'
            ).format(
              Number(
                draft.fee
              ) || 0
            )}
            đ / buổi
          </strong>

          <p>
            Thời lượng:{' '}
            {
              draft.sessionMinutes
            }{' '}
            phút / buổi
          </p>

          <p>
            {draft.bio}
          </p>
          <p>Cấp độ: {draft.levels.join(', ') || 'Chưa chọn cấp độ'}</p>

          <Link
            className="text-link"
            to="/tutor/timetable"
          >
            Tiếp tục: lịch dạy học
            <ArrowRight
              size={16}
            />
          </Link>
        </aside>
      </div>
    </TutorShell>
  );
}

export function TutorRequests() {
  const { requests } =
    useTutorWorkspace();

  const [
    status,
    setStatus,
  ] = useState('all');

  const [
    query,
    setQuery,
  ] = useState('');

  const visible =
    requests.filter(
      (item) =>
        (status === 'all' ||
          item.status ===
            status) &&
        `${item.learner} ${item.subject} ${item.area}`
          .toLocaleLowerCase(
            'vi-VN'
          )
          .includes(
            query.toLocaleLowerCase(
              'vi-VN'
            )
          )
    );

  return (
    <TutorShell
      title="Yêu cầu học"
      subtitle="Lọc và phản hồi những yêu cầu đang chờ trong bản demo."
    >
      <div className="tutor-flow__panel">
        <div className="flow-toolbar">
          <div className="flow-tabs">
            {[
              [
                'all',
                'Tất cả',
              ],
              [
                'pending',
                'Chờ phản hồi',
              ],
              [
                'accepted',
                'Đã nhận',
              ],
              [
                'rejected',
                'Đã từ chối',
              ],
            ].map(
              ([
                value,
                label,
              ]) => (
                <button
                  className={
                    status ===
                    value
                      ? 'is-active'
                      : ''
                  }
                  key={value}
                  onClick={() =>
                    setStatus(
                      value
                    )
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>

          <label className="flow-search">
            <SlidersHorizontal
              size={17}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Tìm yêu cầu..."
            />
          </label>
        </div>

        <div className="flow-list">
          {visible.map(
            (item) => (
              <Link
                className="flow-row"
                to={`/tutor/requests/${item.id}`}
                key={
                  item.id
                }
              >
                <span className="flow-row__icon">
                  <CalendarDays
                    size={20}
                  />
                </span>

                <span>
                  <strong>
                    {item.subject}
                    {' · '}
                    {item.learner}
                  </strong>

                  <small>
                    {item.area}
                    {' · '}
                    {item.schedule}
                    {' · '}
                    {
                      item.received
                    }
                  </small>
                </span>

                <Badge tone={requestTone(item)}>{requestLabel(item, 'tutor')}</Badge>

                <ArrowRight
                  size={17}
                />
              </Link>
            )
          )}

          {!visible.length && (
            <p className="empty-line">
              Không có yêu cầu khớp bộ
              lọc.
            </p>
          )}
        </div>
      </div>
    </TutorShell>
  );
}

export function TutorRequestDetail() {
  const { id } =
    useParams();

  const {
    requests,
    decide,
  } = useTutorWorkspace();

  const [error, setError] =
    useState('');

  const request =
    requests.find(
      (item) =>
        item.id === id
    );

  if (!request) {
    return (
      <TutorShell
        title="Không tìm thấy yêu cầu"
        subtitle="Yêu cầu này không có trong dữ liệu demo."
      >
        <Link to="/tutor/requests">
          Về danh sách
        </Link>
      </TutorShell>
    );
  }

  // Concrete proposals are resolved at creation/seed/migration, never at Accept.
  const proposals =
    proposedLessons(request);

  const areaLabel =
    request.distance
      ? `${request.area} · Cách ${request.distance}`
      : request.area;

  return (
    <TutorShell
      title="Chi tiết yêu cầu"
      subtitle={`Mã ${request.id}${
        request.received
          ? ` · ${request.received}`
          : ''
      }`}
    >
      <Link
        className="flow-back"
        to="/tutor/requests"
      >
        <ArrowLeft
          size={17}
        />
        Danh sách yêu cầu
      </Link>

      <div className="flow-detail-panel">
        <div>
          <Badge tone={requestTone(request)}>{requestLabel(request, 'tutor')}</Badge>

          <h2>
            {request.subject}
          </h2>

          <p>
            “{request.note}”
          </p>

          <dl>
            <div>
              <dt>
                Người học
              </dt>

              <dd>
                {
                  request.learner
                }
              </dd>
            </div>

            <div>
              <dt>
                Khu vực
              </dt>

              <dd>
                {areaLabel}
              </dd>
            </div>
          </dl>

          <section className="request-preferred-times">
            <h3>
              Thời gian mong muốn
            </h3>

            {proposals.length ? (
              <div className="request-preferred-times__table-wrap">
                <table className="request-preferred-times__table">
                  <thead>
                    <tr>
                      <th>
                        Ngày
                      </th>

                      <th>
                        Khung giờ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {proposals.map(
                      (
                        proposal
                      ) => {
                        const date =
                          proposalDateLabel(
                            proposal.date
                          );

                        return (
                          <tr
                            key={
                              proposal.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  date.weekday
                                }
                              </strong>

                              <span>
                                {
                                  date.date
                                }
                              </span>
                            </td>

                            <td>
                              {timeLabel(
                                proposal.start
                              )}
                              {' – '}
                              {timeLabel(
                                proposal.end
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                {request.schedule ||
                  'Chưa có khung giờ cụ thể.'}
              </p>
            )}
          </section>
        </div>

        <aside>
          {error && (
            <p
              className="flow-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <h3>
            Phản hồi yêu cầu
          </h3>

          <p>
            Nhận yêu cầu sẽ tự thêm các
            buổi dạy vào thời khoá biểu
            demo trong trình duyệt.
          </p>

          {request.status ===
          'pending' ? (
            <div className="flow-action-stack">
              <button
                className="button button--primary"
                onClick={() =>
                  setError(
                    decide(
                      id,
                      'accepted'
                    )
                  )
                }
              >
                Nhận yêu cầu
              </button>

              <button
                className="button button--secondary"
                onClick={() =>
                  setError(
                    decide(
                      id,
                      'rejected'
                    )
                  )
                }
              >
                Từ chối
              </button>
            </div>
          ) : (
            <p
              className={request.status === 'accepted' ? 'flow-success' : 'flow-error'}
              role="status"
            >
              Đã cập nhật trạng thái:{' '}
              {requestLabel(request, 'tutor')}
              .
            </p>
          )}
        </aside>
      </div>
    </TutorShell>
  );
}
