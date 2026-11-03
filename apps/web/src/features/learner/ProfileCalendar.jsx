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
  isValidFlexibleProposal,
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
  selected = [],
  onAdd = () => {},
  onRemove = () => {},
  invalid = false,
  readOnly = false,
  stackOnMobile = false,
  id = 'profile-calendar',
  className = '',
}) {
  const [offset, setOffset] =
    useState(0);
  const [customDate, setCustomDate] = useState('');
  const [customStart, setCustomStart] = useState('08:00');
  const [customEnd, setCustomEnd] = useState('09:15');
  const [customError, setCustomError] = useState('');

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
  const addCustom = (event) => {
    event.preventDefault();
    const parse = (value) => value === '24:00' ? 1440 : /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : null;
    const proposal = { tutorId: tutor.id, date: customDate || localDateKey(dates[0]), start: parse(customStart), end: parse(customEnd) };
    if (!isFutureSession(proposal) || !isValidFlexibleProposal(proposal, ranges, selected)) {
      setCustomError('Khoảng giờ phải nằm trong lịch rảnh, chưa qua và không trùng buổi đã chọn.');
      return;
    }
    onAdd(proposal);
    setCustomError('');
  };

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
      className={[
        'profile-section profile-calendar',
        readOnly && 'profile-calendar--readonly',
        stackOnMobile && 'profile-calendar--stacked',
        invalid && 'is-validation-error',
        className,
      ].filter(Boolean).join(' ')}
      id={id}
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
          {sessionMinutes} phút gợi ý
        </span>
      </div>

      {!readOnly && <form className="profile-custom-time" onSubmit={addCustom}>
        <strong>Đề xuất giờ riêng</strong>
        <label>Ngày<select value={customDate || localDateKey(dates[0])} onChange={(event) => { setCustomDate(event.target.value); setCustomError(''); }}>{dates.map((date) => <option key={localDateKey(date)} value={localDateKey(date)}>{date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</option>)}</select></label>
        <label>Bắt đầu<input type="text" inputMode="numeric" maxLength={5} placeholder="HH:mm" value={customStart} onChange={(event) => { setCustomStart(event.target.value); setCustomError(''); }}/></label>
        <label>Kết thúc<input type="text" inputMode="numeric" maxLength={5} placeholder="HH:mm" value={customEnd} onChange={(event) => { setCustomEnd(event.target.value); setCustomError(''); }}/></label>
        <button type="submit" className="button button--secondary button--sm">Thêm giờ đề xuất</button>
        <small>Có thể nhập đến từng phút, kể cả giờ kết thúc 24:00.</small>
        {customError && <small role="alert" className="profile-field-error">{customError}</small>}
      </form>}

      <p>
        {readOnly
          ? 'Lịch này chỉ để tham khảo. Chọn “Đặt lịch học” để đề xuất các khung giờ.'
          : 'Chọn buổi học có sẵn để thêm vào yêu cầu. Có thể chọn nhiều buổi; nhấn lại để bỏ chọn.'}
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
                (date, index) => {
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
                    <td
                      key={key}
                      data-day={`${timetableDays[index]} ${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`}
                    >
                      <div className="profile-session-list">
                        {daily.length ? (
                          daily.map(
                            (
                              session
                            ) => {
                              if (readOnly) {
                                return (
                                  <div
                                    key={session.start}
                                    className="profile-session-view"
                                    role="group"
                                    aria-label={proposalLabel(session)}
                                  >
                                    <span>
                                      {timeLabel(session.start)}
                                      {' – '}
                                      {timeLabel(session.end)}
                                    </span>
                                    <small>Còn trống</small>
                                  </div>
                                );
                              }

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

      {invalid && (
        <small className="profile-field-error" role="alert">
          Chọn ít nhất một khung giờ phù hợp.
        </small>
      )}

      {!readOnly && (
        <p
          className="profile-schedule-feedback"
          role="status"
        >
          {selected.length
            ? 'Đã chọn: ' +
              selected
                .map(proposalLabel)
                .join('; ')
            : 'Chưa chọn buổi học.'}
        </p>
      )}
    </section>
  );
}
