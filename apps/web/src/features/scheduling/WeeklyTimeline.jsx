import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';

import {
  localDateKey,
  timetableDays,
  timeLabel,
} from '../../data/tutorSchedule.js';

import {
  hourHeight,
  minuteToY,
  yToMinute,
  minuteSnap,
  layoutDayBlocks,
} from './timelineGeometry.js';

import './weekly-timeline.css';

export default function WeeklyTimeline({
  dates,
  blocks = [],
  editable = false,
  onDayAdd,
  onTimeClick,
  onMove,
  onDelete,
  onBlockClick,
  isRangeAllowed = () => true,
  label = 'Lịch tuần',
}) {
  const [expanded, setExpanded] = useState(null);
  const [drag, setDrag] = useState(null);
  const [preview, setPreview] = useState(null);

  const columns = useRef([]);
  const previewRef = useRef(null);
  const callbacks = useRef({});

  callbacks.current = {
    onMove,
    isRangeAllowed,
  };

  const total = minuteToY(1440, expanded);
  const layouts = dates.map((date) => layoutDayBlocks(blocks.filter((block) => block.date === localDateKey(date)), expanded));
  const dayWidths = layouts.map((day) => 128 * Math.max(1, ...day.map((block) => block.layout.laneCount)));

  useEffect(() => {
    if (!drag) return undefined;

    const move = (event) => {
      const index = columns.current.findIndex((column) => {
        const rect = column?.getBoundingClientRect();

        return (
          rect &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right
        );
      });

      if (index < 0) {
        previewRef.current = null;
        setPreview(null);
        return;
      }

      const rect =
        columns.current[index].getBoundingClientRect();

      const start = minuteSnap(
        yToMinute(
          event.clientY - rect.top,
          expanded
        ) - drag.offset,
        expanded
      );

      const next = {
        ...drag.block,
        date: localDateKey(dates[index]),
        start,
        end:
          start +
          drag.block.end -
          drag.block.start,
      };

      const candidate = {
        ...next,
        invalid:
          !callbacks.current.isRangeAllowed(
            next,
            drag.block.id
          ),
      };

      previewRef.current = candidate;
      setPreview(candidate);
    };

    const end = () => {
      if (previewRef.current) {
        callbacks.current.onMove?.(
          drag.block.id,
          previewRef.current
        );
      }

      previewRef.current = null;
      setPreview(null);
      setDrag(null);
    };

    const cancel = () => {
      previewRef.current = null;
      setPreview(null);
      setDrag(null);
    };

    window.addEventListener(
      'pointermove',
      move
    );

    window.addEventListener(
      'pointerup',
      end,
      { once: true }
    );

    window.addEventListener(
      'pointercancel',
      cancel,
      { once: true }
    );

    return () => {
      window.removeEventListener(
        'pointermove',
        move
      );

      window.removeEventListener(
        'pointerup',
        end
      );

      window.removeEventListener(
        'pointercancel',
        cancel
      );
    };
  }, [drag, expanded, dates]);

  const startDrag = (
    event,
    block,
    column
  ) => {
    if (
      !editable ||
      block.kind !== 'availability' ||
      event.target.closest(
        '.weekly-timeline-remove'
      )
    ) {
      return;
    }

    event.preventDefault();

    const rect =
      column.getBoundingClientRect();

    setDrag({
      block,
      offset:
        yToMinute(
          event.clientY - rect.top,
          expanded
        ) - block.start,
    });
  };

  return (
    <div
      className="weekly-timeline-scroll"
      role="region"
      tabIndex={0}
      aria-label={`${label}, cuộn ngang và dọc để xem đầy đủ`}
    >
      <div
        className="weekly-timeline"
        style={{
          '--timeline-height': `${total}px`,
          '--timeline-columns': `74px ${dayWidths.map((width) => `${width}px`).join(' ')}`,
          '--timeline-width': `${74 + dayWidths.reduce((sum, width) => sum + width, 0)}px`,
        }}
      >
        {/* Cột giờ */}
        <div className="weekly-timeline-corner">
          Giờ
        </div>

        {/* Header ngày */}
        {dates.map((date, index) => (
          <div
            className="weekly-timeline-day-head"
            key={localDateKey(date)}
          >
            <strong>
              {timetableDays[index]}
            </strong>

            <small>
              {date.toLocaleDateString(
                'vi-VN',
                {
                  day: '2-digit',
                  month: '2-digit',
                }
              )}
            </small>

            {editable && (
              <button
                type="button"
                onClick={() =>
                  onDayAdd?.(
                    localDateKey(date),
                    expanded === null
                      ? 480
                      : 360 +
                          expanded * 60
                  )
                }
                aria-label={`Thêm lịch rảnh ${timetableDays[index]}`}
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        ))}

        {/* Trục thời gian */}
        <div
          className="weekly-timeline-axis"
          style={{
            height: total,
          }}
        >
          {Array.from(
            { length: 18 },
            (_, hour) => (
              <div
                className="weekly-timeline-axis-band"
                key={hour}
                style={{
                  top: minuteToY(
                    360 +
                      hour * 60,
                    expanded
                  ),
                  height: hourHeight(
                    hour,
                    expanded
                  ),
                }}
              >
                <div
                  className={
                    'weekly-timeline-axis-main' +
                    (hour === 0
                      ? ' is-first'
                      : '')
                  }
                >
                  <span>
                    {timeLabel(
                      360 +
                        hour * 60
                    )}
                  </span>

                  <button
                    type="button"
                    aria-expanded={
                      expanded === hour
                    }
                    aria-label={
                      (expanded === hour
                        ? 'Thu gọn '
                        : 'Mở chi tiết ') +
                      timeLabel(
                        360 +
                          hour * 60
                      )
                    }
                    onClick={() =>
                      setExpanded(
                        expanded === hour
                          ? null
                          : hour
                      )
                    }
                  >
                    {expanded ===
                    hour ? (
                      <Minus
                        size={14}
                      />
                    ) : (
                      <Plus
                        size={14}
                      />
                    )}
                  </button>
                </div>

                {expanded ===
                  hour &&
                  Array.from(
                    { length: 11 },
                    (_, i) => (
                      <span
                        className="weekly-timeline-minor-label"
                        key={i}
                        style={{
                          top:
                            (i + 1) *
                            20,
                        }}
                      >
                        {timeLabel(
                          365 +
                            hour *
                              60 +
                            i * 5
                        )}
                      </span>
                    )
                  )}
              </div>
            )
          )}

          <span
            className="weekly-timeline-end"
            style={{
              top: total,
            }}
          >
            24:00
          </span>
        </div>

        {/* Các ngày */}
        {dates.map(
          (date, index) => {
            const key =
              localDateKey(date);

            const dayBlocks =
              layouts[index];

            return (
              <div
                className="weekly-timeline-column"
                key={key}
                ref={(node) => {
                  columns.current[
                    index
                  ] = node;
                }}
                style={{
                  height: total,
                }}
              >
                {/* Các hàng giờ */}
                {Array.from(
                  { length: 18 },
                  (_, hour) => (
                    <div
                      key={hour}
                      className={
                        'weekly-timeline-hour' +
                        (expanded ===
                        hour
                          ? ' is-expanded'
                          : '')
                      }
                      style={{
                        top: minuteToY(
                          360 +
                            hour *
                              60,
                          expanded
                        ),
                        height:
                          hourHeight(
                            hour,
                            expanded
                          ),
                      }}
                    >
                      {expanded ===
                        hour &&
                        Array.from(
                          {
                            length:
                              12,
                          },
                          (_, i) => {
                            const start =
                              360 +
                              hour *
                                60 +
                              i * 5;

                            return (
                              <button
                                className="weekly-timeline-time-target"
                                key={
                                  i
                                }
                                type="button"
                                style={{
                                  top:
                                    i *
                                    20,
                                }}
                                aria-label={`${
                                  editable
                                    ? 'Thêm lịch rảnh '
                                    : 'Chọn giờ '
                                }${key} ${timeLabel(
                                  start
                                )}`}
                                onClick={() =>
                                  onTimeClick?.(
                                    {
                                      date: key,
                                      start,
                                    }
                                  )
                                }
                              >
                                <span>
                                  {timeLabel(
                                    start
                                  )}
                                </span>
                              </button>
                            );
                          }
                        )}
                    </div>
                  )
                )}

                {/* Block lịch */}
                {dayBlocks.map(
                  (block) => {
                    const duration =
                      block.end -
                      block.start;

                    const isCompact =
                      duration <= 45;

                    const blockHeight =
                      Math.max(
                        28,
                        minuteToY(
                          block.end,
                          expanded
                        ) -
                          minuteToY(
                            block.start,
                            expanded
                          )
                      );

                    return (
                      <div
                        className={
                          'weekly-timeline-block ' +
                          (block.kind ||
                            'availability') +
                          (block.kind === 'lesson' && block.status === 'completed' ? ' is-completed' : '') +
                          (block.draft
                            ? ' is-draft'
                            : '') +
                          (drag?.block
                            .id ===
                          block.id
                            ? ' is-dragging'
                            : '') +
                          (!editable &&
                          block.kind ===
                            'availability'
                            ? ' is-public'
                            : '')
                        }
                        key={
                          block.id
                        }
                        style={{
                          left: `calc(${block.layout.lane * 100 / block.layout.laneCount}% + 4px)`,
                          right: 'auto',
                          width: `calc(${100 / block.layout.laneCount}% - 8px)`,
                          top: minuteToY(
                            block.start,
                            expanded
                          ),
                          height:
                            blockHeight,
                        }}
                        onPointerDown={(
                          event
                        ) =>
                          startDrag(
                            event,
                            block,
                            columns
                              .current[
                              index
                            ]
                          )
                        }
                      >
                        <button
                          type="button"
                          className="weekly-timeline-block-content"
                          onClick={() =>
                            onBlockClick?.(
                              block
                            )
                          }
                          disabled={
                            !editable &&
                            block.kind ===
                              'availability'
                          }
                          aria-label={[
                            block.title ||
                              'Lịch rảnh',
                            block.subtitle,
                            key,
                            `${timeLabel(
                              block.start
                            )}–${timeLabel(
                              block.end
                            )}`,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(' ')}
                        >
                          {isCompact ? (
                            <>
                              {/* Giờ bắt đầu */}
                              <span className="weekly-timeline-block-start">
                                {timeLabel(
                                  block.start
                                )}
                              </span>

                              {/* Chỉ môn học / loại lịch */}
                              <span className="weekly-timeline-block-middle">
                                <strong>
                                  {block.title ||
                                    'RẢNH'}
                                </strong>
                              </span>

                              {/* Giờ kết thúc */}
                              <small>
                                {timeLabel(
                                  block.end
                                )}
                              </small>
                            </>
                          ) : (
                            <>
                              {/* Giờ bắt đầu */}
                              <span className="weekly-timeline-block-start">
                                {timeLabel(
                                  block.start
                                )}
                              </span>

                              {/* Nội dung */}
                              <span className="weekly-timeline-block-middle">
                                <strong>
                                  {block.title ||
                                    'RẢNH'}
                                </strong>

                                {block.subtitle && (
                                  <span className="weekly-timeline-block-subtitle">
                                    {
                                      block.subtitle
                                    }
                                  </span>
                                )}
                              </span>

                              {/* Giờ kết thúc */}
                              <small>
                                {timeLabel(
                                  block.end
                                )}
                              </small>
                            </>
                          )}
                        </button>

                        {/* Nút xóa lịch rảnh */}
                        {editable &&
                          block.kind ===
                            'availability' && (
                            <button
                              type="button"
                              className="weekly-timeline-remove"
                              aria-label={`Xóa lịch rảnh ${key} ${timeLabel(
                                block.start
                              )}`}
                              onClick={() =>
                                onDelete?.(
                                  block.id
                                )
                              }
                            >
                              <X
                                size={
                                  14
                                }
                              />
                            </button>
                          )}
                      </div>
                    );
                  }
                )}

                {/* Preview khi kéo */}
                {preview?.date ===
                  key && (
                  <div
                    className={
                      'weekly-timeline-preview' +
                      (preview.invalid
                        ? ' is-invalid'
                        : '')
                    }
                    style={{
                      top: minuteToY(
                        preview.start,
                        expanded
                      ),
                      height:
                        Math.max(
                          28,
                          minuteToY(
                            preview.end,
                            expanded
                          ) -
                            minuteToY(
                              preview.start,
                              expanded
                            )
                        ),
                    }}
                  >
                    {preview.invalid
                      ? 'Không hợp lệ / trùng lịch'
                      : `${timeLabel(
                          preview.start
                        )}–${timeLabel(
                          preview.end
                        )}`}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
