import { useState } from 'react';
import { Wallet, CalendarCheck, BookOpen } from 'lucide-react';
import { TutorShell } from './TutorPages.jsx';
import { useTutorIncome } from '../domain/DemoDomainContext.jsx';
import { timeLabel } from '../../data/tutorSchedule.js';
import './income.css';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
const monthLabel = (key) => `${key.slice(5)}/${key.slice(0, 4)}`;
const dateLabel = (date) => date.split('-').reverse().join('/');

function IncomeChart({ months, selectedKey, onSelect }) {
  const totals = months.map((month) => month.total);
  const max = Math.max(...totals);
  const min = Math.min(...totals);
  const ceiling = Math.max(max, 1);
  const tone = (value) => max === min ? 'normal' : value === max ? 'maximum' : value === min ? 'minimum' : 'normal';
  const points = months.map((month, index) => ({ ...month, x: 55 + index * 110, y: 205 - month.total / ceiling * 155 }));
  const selectFromKeyboard = (event, key) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect(key);
  };

  return <section className="income-chart" aria-labelledby="income-chart-title">
    <div className="income-section-head">
      <div><h2 id="income-chart-title">Thu nhập theo tháng</h2><p>6 tháng gần nhất · VNĐ</p></div>
      <div className="income-legend"><span data-tone="maximum">Cao nhất</span><span data-tone="minimum">Thấp nhất</span></div>
    </div>

    <svg viewBox="0 0 660 250" className="income-chart__svg" aria-label="Biểu đồ thu nhập 6 tháng gần nhất">
      {[0, .5, 1].map((step) => <g key={step}>
        <line x1="55" x2="605" y1={205 - step * 155} y2={205 - step * 155} className="income-chart__grid"/>
        <text x="48" y={209 - step * 155} textAnchor="end">{new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(max * step)}</text>
      </g>)}
      <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} className="income-chart__line"/>
      {points.map((point) => (
        <text key={`label-${point.key}`} x={point.x} y="235" textAnchor="middle">{monthLabel(point.key)}</text>
      ))}
      {points.map((point) => {
        const state = tone(point.total);
        const selected = point.key === selectedKey;
        return <g
          key={point.key}
          className="income-chart__point-control"
          role="button"
          tabIndex="0"
          focusable="true"
          aria-pressed={selected}
          aria-label={`Xem chi tiết tháng ${monthLabel(point.key)}: ${money(point.total)}`}
          onClick={() => onSelect(point.key)}
          onKeyDown={(event) => selectFromKeyboard(event, point.key)}
        >
          <circle cx={point.x} cy={point.y} r="16" className="income-chart__hit"/>
          <circle cx={point.x} cy={point.y} r="10" className="income-chart__selection"/>
          <circle cx={point.x} cy={point.y} r="6" className="income-chart__point" data-tone={state}/>
        </g>;
      })}
    </svg>

    <ul className="income-chart__values" aria-label="Giá trị thu nhập theo tháng">{months.map((month) => {
      const state = tone(month.total);
      const stateLabel = state === 'maximum' ? 'Cao nhất' : state === 'minimum' ? 'Thấp nhất' : '';
      return <li
        key={month.key}
        data-tone={state}
        data-selected={month.key === selectedKey ? 'true' : undefined}
        aria-label={`${monthLabel(month.key)}: ${money(month.total)}${stateLabel ? ` · ${stateLabel}` : ''}`}
      >
        <span>{monthLabel(month.key)}</span>
        <strong>{money(month.total)}</strong>
        {stateLabel && <small>{stateLabel}</small>}
      </li>;
    })}</ul>
  </section>;
}

export default function TutorIncome() {
  const { currentMonth, months } = useTutorIncome();
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonth.key);
  const selectedMonth = months.find((month) => month.key === selectedMonthKey) || currentMonth;
  const top = currentMonth.topSubject;

  return <TutorShell title="Thu nhập" subtitle="Theo dõi thu nhập từ các buổi học đã hoàn tất.">
    <div className="tutor-income">
      <p className="income-period">Tháng {monthLabel(currentMonth.key)}</p>

      <div className="income-summary" aria-label="Tổng quan thu nhập tháng hiện tại">
        <section className="income-summary__total">
          <Wallet size={22} aria-hidden="true"/>
          <h2>Tổng thu nhập tháng hiện tại</h2>
          <strong>{money(currentMonth.total)}</strong>
          <p>Từ các buổi học đã hoàn tất</p>
        </section>
        <section>
          <CalendarCheck size={22} aria-hidden="true"/>
          <h2>Số buổi đã hoàn tất</h2>
          <strong>{currentMonth.lessonCount}</strong>
          <p>Buổi tạo thu nhập trong tháng</p>
        </section>
        <section>
          <BookOpen size={22} aria-hidden="true"/>
          <h2>Nguồn thu cao nhất</h2>
          {top ? <>
            <strong className="income-summary__subject">{top.subject || 'Chưa có môn học'}</strong>
            <p>{money(top.total)} · {top.lessonCount} buổi</p>
          </> : <>
            <strong className="income-summary__subject">Chưa có nguồn thu</strong>
            <p>Chưa có buổi học đủ dữ liệu học phí</p>
          </>}
        </section>
      </div>

      <IncomeChart months={months} selectedKey={selectedMonth.key} onSelect={setSelectedMonthKey}/>

      <section className="income-lessons" aria-labelledby="income-lessons-title">
        <div className="income-section-head">
          <div>
            <h2 id="income-lessons-title">Các buổi tạo thu nhập trong tháng</h2>
            <p>{selectedMonth.lessonCount} buổi · Tháng {monthLabel(selectedMonth.key)}</p>
          </div>
        </div>

        {selectedMonth.lessons.length ? <div className="income-table-wrap">
          <table className="income-table">
            <caption className="sr-only">Các buổi tạo thu nhập trong tháng {monthLabel(selectedMonth.key)}, mới nhất trước</caption>
            <thead><tr><th scope="col">Ngày học</th><th scope="col">Người học</th><th scope="col">Môn học</th><th scope="col">Thời gian</th><th scope="col">Thu nhập</th></tr></thead>
            <tbody>{selectedMonth.lessons.map((lesson) => <tr key={lesson.id} data-lesson-id={lesson.id}>
              <td data-label="Ngày học">{dateLabel(lesson.date)}</td>
              <td data-label="Người học">{lesson.learner || 'Chưa có tên người học'}</td>
              <td data-label="Môn học">{lesson.subject || 'Chưa có môn học'}</td>
              <td data-label="Thời gian">{Number.isFinite(lesson.start) && Number.isFinite(lesson.end) ? `${timeLabel(lesson.start)}–${timeLabel(lesson.end)}` : 'Chưa có giờ học'}</td>
              <td data-label="Thu nhập"><strong>{money(lesson.sessionFee)}</strong></td>
            </tr>)}</tbody>
          </table>
        </div> : <div className="income-empty">
          <Wallet size={28} aria-hidden="true"/>
          <h3>Chưa có thu nhập trong tháng này</h3>
          <p>Buổi học hoàn tất có học phí sẽ xuất hiện tại đây.</p>
        </div>}
      </section>

      <p className="income-note">Thu nhập tính theo học phí của từng buổi học, chưa thể hiện giao dịch hay thanh toán thực tế.</p>
    </div>
  </TutorShell>;
}
