import { useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import Button from '../../components/Button.jsx';

import {
  usePublicTutorSchedule,
} from '../tutor/TutorWorkspaceState.jsx';

import {
  isValidProposal,
  isFutureSession,
  localDateKey,
  proposalLabel,
  timetableDays,
  timeLabel,
  weekDates,
} from '../../data/tutorSchedule.js';

import {
  bookableSessions,
} from './profileSelection.js';

const sameSession = (a, b) =>
  a.date === b.date &&
  a.start === b.start &&
  a.end === b.end;

export default function ProfileCalendar({
  tutor,
  selected,
  onAdd,
  onRemove,
  invalid = false,
}) {
  const [offset, setOffset] =
    useState(0);

  const dates = weekDates(offset);

  const {
    ranges,
    sessionMinutes,
  } = usePublicTutorSchedule(
    tutor,
    dates
  );

  const sessions =
    bookableSessions(
      ranges,
      sessionMinutes
    );

  const choose = (session) => {
    const existing =
      selected.find(
        (proposal) =>
          sameSession(
            proposal,
            session
          )
      );

    if (existing) {
      onRemove(existing);
      return;
    }

    if (
      isFutureSession(session) && isValidProposal(
        session,
        ranges,
        sessionMinutes,
        selected
      )
    ) {
      onAdd(session);
    }
  };

  return (
    <section
      className={
        'profile-section' +
        (invalid
          ? ' is-validation-error'
          : '')
      }
      id="profile-calendar"
      aria-invalid={
        invalid || undefined
      }
    >
      <div className="profile-section__heading">
        <h2>
          <CalendarDays size={21} />
          Lịch rảnh trong tuần
        </h2>

        <span className="profile-calendar-legend">
          {sessionMinutes} phút / buổi
        </span>
      </div>

      <p>
        Chọn buổi học có sẵn để thêm vào
        “Gửi yêu cầu học”. Có thể chọn
        nhiều buổi; nhấn lại để bỏ chọn.
      </p>

      <div className="schedule-week-nav">
        <Button
          variant="secondary"
          size="sm"
          aria-label="Tuần trước"
          onClick={() =>
            setOffset(
              offset - 1
            )
          }
        >
          <ChevronLeft size={16} />
        </Button>

        <strong>
          {dates[0].toLocaleDateString(
            'vi-VN'
          )}
          {' – '}
          {dates[6].toLocaleDateString(
            'vi-VN'
          )}
        </strong>

        <Button
          variant="secondary"
          size="sm"
          aria-label="Tuần sau"
          onClick={() =>
            setOffset(
              offset + 1
            )
          }
        >
          <ChevronRight size={16} />
        </Button>

        <Button
          variant="quiet"
          size="sm"
          onClick={() =>
            setOffset(0)
          }
        >
          Trở về hiện tại
        </Button>
      </div>

      {!sessions.length && (
        <p role="status">
          Gia sư chưa có buổi học khả
          dụng trong tuần này.
        </p>
      )}

      <div
        className="profile-session-scroll"
        role="region"
        aria-label={
          'Lịch rảnh của ' +
          tutor.name
        }
        tabIndex={0}
      >
        <table className="profile-session-table">
          <caption className="sr-only">
            Các buổi học có sẵn của{' '}
            {tutor.name}
          </caption>

          <thead>
            <tr>
              {dates.map(
                (
                  date,
                  index
                ) => (
                  <th
                    key={localDateKey(
                      date
                    )}
                    scope="col"
                  >
                    {
                      timetableDays[
                        index
                      ]
                    }

                    <span>
                      {date.toLocaleDateString(
                        'vi-VN',
                        {
                          day: '2-digit',
                          month:
                            '2-digit',
                        }
                      )}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            <tr>
              {dates.map(
                (date) => {
                  const key =
                    localDateKey(
                      date
                    );

                  const daily =
                    sessions.filter(
                      (
                        session
                      ) =>
                        session.date ===
                        key
                    );

                  return (
                    <td key={key}>
                      <div className="profile-session-list">
                        {daily.length ? (
                          daily.map(
                            (
                              session
                            ) => {
                              const active =
                                selected.some(
                                  (
                                    proposal
                                  ) =>
                                    sameSession(
                                      proposal,
                                      session
                                    )
                                );

                              const disabled =
                                !isFutureSession(session) || (!active &&
                                !isValidProposal(
                                  session,
                                  ranges,
                                  sessionMinutes,
                                  selected
                                ));

                              return (
                                <button
                                  key={
                                    session.start
                                  }
                                  type="button"
                                  aria-pressed={
                                    active
                                  }
                                  aria-label={proposalLabel(
                                    session
                                  )}
                                  disabled={
                                    disabled
                                  }
                                  onClick={() =>
                                    choose(
                                      session
                                    )
                                  }
                                >
                                  <span>
                                    {timeLabel(
                                      session.start
                                    )}
                                    –
                                    {timeLabel(
                                      session.end
                                    )}
                                  </span>

                                  <small>
                                    {active ? (
                                      <>
                                        <Check
                                          size={
                                            13
                                          }
                                          aria-hidden="true"
                                        />
                                        Đã chọn
                                      </>
                                    ) : (
                                      'Còn trống'
                                    )}
                                  </small>
                                </button>
                              );
                            }
                          )
                        ) : (
                          <span className="profile-session-empty">
                            Không có buổi
                            trống
                          </span>
                        )}
                      </div>
                    </td>
                  );
                }
              )}
            </tr>
          </tbody>
        </table>
      </div>

      <p
        className="profile-schedule-feedback"
        role="status"
      >
        {selected.length
          ? 'Đã chọn: ' +
            selected
              .map(
                proposalLabel
              )
              .join('; ')
          : 'Chưa chọn buổi học.'}
      </p>
    </section>
  );
}
