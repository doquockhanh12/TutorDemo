import { useTutorProfile, useTutorIncome } from '../domain/DemoDomainContext.jsx';
﻿import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  UserRound,
  Hand,
} from 'lucide-react';

import Button from '../../components/Button.jsx';
import { formatFee } from '../../data/tutorClassSearch.js';
import useTutorWorkspace from './TutorWorkspaceState.jsx';
import {
  weekDates,
  localDateKey,
} from '../../data/tutorSchedule.js';

import TutorWorkspaceLayout from './TutorWorkspaceLayout.jsx';
import TutorDashboardSupport from './TutorDashboardSupport.jsx';
import TutorScheduleChecks from './TutorScheduleChecks.jsx';


import './dashboard-reference.css';

function preferredDaysLabel(schedule = '') {
  /*
   * "Thứ 2, 4, 6 (19:00 - 21:00)"
   *                 ↓
   * "Thứ 2, 4, 6"
   */
  return (
    schedule
      .replace(/\s*\([^)]*\)\s*$/, '')
      .trim() || 'Chưa có'
  );
}

function DashboardRequests({
  requests,
  onDecision,
  pending,
}) {


  return (
    <section
      className="reference-panel reference-requests"
      aria-labelledby="requests-title"
    >
      <div className="reference-panel__heading">
        <h2 id="requests-title">
          Yêu cầu học mới ({pending})
        </h2>

        <Link to="/tutor/requests">
          Xem tất cả
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="reference-request-list">
        {requests.map((request) => (
          <article
            className="reference-request"
            key={request.id}
          >
            <div className="reference-request__top">
              <span
                className={`reference-subject reference-subject--${request.tone}`}
              >
                {request.subject}
              </span>

              <h3>{request.learner}</h3>

              <strong>
                {Number.isFinite(request.sessionFee) ? `${formatFee(request.sessionFee)} / buổi` : 'Chưa có mức phí'}
              </strong>
            </div>

            <p className="reference-request__location">
              <MapPin size={12} />

              {request.area}

              {request.distance && <><span>•</span>{'Cách ' + request.distance}</>}
            </p>

            <div className="reference-request__description">
              <p>
                Mong muốn: {request.note}
              </p>

              <p>
                Lịch mong muốn:{' '}
                <strong>
                  {preferredDaysLabel(
                    request.schedule
                  )}
                </strong>
              </p>
            </div>

            <p className="reference-request__sender">
              <UserRound size={12} />

              {request.parent && <>{request.parent}<span>•</span></>}

              {request.received}
            </p>

            <div className="reference-request__actions">
              {/*
                Không mở thẻ phụ bên dưới nữa.
                Đi thẳng tới trang detail.
              */}
              <Link
                className="button button--secondary button--sm"
                to={`/tutor/requests/${request.id}`}
              >
                Xem chi tiết
              </Link>

              {request.status === 'pending' ? (
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="reference-reject"
                    onClick={() =>
                      onDecision(
                        request.id,
                        'rejected'
                      )
                    }
                  >
                    Từ chối
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      onDecision(
                        request.id,
                        'accepted'
                      )
                    }
                  >
                    Chấp nhận
                  </Button>
                </div>
              ) : (
                <span
                  className={`reference-decision reference-decision--${request.status}`}
                  role="status"
                >
                  {request.status ===
                  'accepted'
                    ? 'Đã chấp nhận'
                    : 'Đã từ chối'}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function TutorDashboard() {
  const [profile] = useTutorProfile();
  const income = useTutorIncome();
  const {
    requests: allRequests,
    lessons,
    decide,
  } = useTutorWorkspace();

  const requests = allRequests.filter((item) => item.status === 'pending').slice(0, 3);

  const [error, setError] =
    useState('');

  const dates = weekDates().map(
    localDateKey
  );

  const pending =
    allRequests.filter(
      (item) =>
        item.status === 'pending'
    ).length;

  const stats = [
    {
      label: 'Yêu cầu học mới',
      value: pending,
      trend: `+${pending}`,
      to: '#requests-title',
    },
    {
      label: 'Lịch dạy tuần này',
      value: lessons.filter(
        (lesson) =>
          dates.includes(
            lesson.date
          )
      ).length,
      trend: '+2',
      to: '#teaching-calendar',
    },
    {
      label: 'Thu nhập tháng này',
      value:
        formatFee(income.currentMonth.total),

      to: '/tutor/income',
    },
    {
      label: 'Đánh giá trung bình',
      value: `${profile.rating || '—'}/5`,
      to: '#tutor-profile-summary',
    },
  ];

  return (
    <TutorWorkspaceLayout className="tutor-reference-workspace">
        <main className="reference-dashboard">
          <div className="reference-dashboard__primary">
            <div className="reference-greeting">
              <h1>
                Xin chào,{' '}
                {
                  profile.name
                }

                <Hand
                  size={28}
                  aria-hidden="true"
                />
              </h1>

              <p>
                Cùng tiếp tục tạo ra tác
                động tích cực qua từng
                buổi học.
              </p>
            </div>

            <div
              className="reference-stats"
              aria-label="Chỉ số tổng quan"
            >
              {stats.map(
                (item) => (
                  <section
                    className="reference-stat"
                    key={
                      item.label
                    }
                  >
                    <span>
                      {
                        item.label
                      }
                    </span>

                    <strong>
                      {
                        item.value
                      }
                    </strong>

                    {item.trend && (
                      <span className="reference-stat__trend">
                        ↑{' '}
                        {
                          item.trend
                        }
                      </span>
                    )}

                    {item.to.startsWith('/') ? <Link to={item.to}>Xem chi tiết <ArrowRight size={12}/></Link> : <a
                      href={
                        item.to
                      }
                    >
                      Xem chi tiết
                      <ArrowRight
                        size={
                          12
                        }
                      />
                    </a>}
                  </section>
                )
              )}
            </div>

            {error && (
              <p role="alert">
                {error}
              </p>
            )}

            <div className="reference-dashboard__work">
              <DashboardRequests
                pending={pending}
                requests={
                  requests
                }
                onDecision={(
                  id,
                  status
                ) =>
                  setError(
                    decide(
                      id,
                      status
                    )
                  )
                }
              />

              <TutorScheduleChecks />
            </div>
          </div>

          <TutorDashboardSupport />
        </main>
    </TutorWorkspaceLayout>
  );
}
