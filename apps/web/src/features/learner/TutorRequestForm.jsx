import { ArrowRight } from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import useDemoDomain from '../domain/DemoDomainContext.jsx';

import {
  concreteScheduleLabel,
} from './profileSelection.js';

import {
  useTutorProposalValidation,
} from '../tutor/TutorWorkspaceState.jsx';

export default function TutorRequestForm({
  tutor,
  selection,
  onValidationErrors,
  hideSubmitButton = false,
}) {
  const navigate = useNavigate();

  const { createRequest } = useDemoDomain();

  const [params] = useSearchParams();

  const [goal, setGoal] = useState(
    params.get('goal') || ''
  );
  const [submitError, setSubmitError] = useState('');

  const [validationAttempted, setValidationAttempted] =
    useState(false);

  const ranges = selection.proposals;
  const selectedSubjects = selection.subjects ? [selection.subjects] : [];
  const selectedLevels = selection.levels ? [selection.levels] : [];

  const { validProposal } =
    useTutorProposalValidation(tutor);

  const proposalsValid = ranges.every(
    (proposal, index) =>
      validProposal(
        proposal,
        ranges.slice(0, index)
      )
  );

  const areaRequired =
    selection.formats.includes('Tại nhà');

  const errors = {
    subjects: !selection.subjects,

    levels: !selection.levels,

    proposals:
      ranges.length === 0 ||
      !proposalsValid,

    formats:
      selection.formats.length === 0,

    areas:
      areaRequired &&
      selection.areas.length === 0,
  };

  const ready =
    !Object.values(errors).some(Boolean);

  /*
   * Sau lần submit đầu tiên:
   * lỗi được cập nhật liên tục.
   *
   * Người dùng điền xong mục nào thì
   * viền đỏ của mục đó tự biến mất.
   */
  useEffect(() => {
    if (!validationAttempted) return;

    onValidationErrors?.(errors);
  }, [
    validationAttempted,
    selection.subjects,
    selection.levels,
    ranges.length,
    proposalsValid,
    selection.formats.length,
    selection.areas.length,
    areaRequired,
    onValidationErrors,
  ]);

  const scrollToFirstError = (
    currentErrors
  ) => {
    const order = [
      'subjects',
      'levels',
      'proposals',
      'formats',
      'areas',
    ];

    const firstKey = order.find(
      (key) => currentErrors[key]
    );

    if (!firstKey) return;

    /*
     * Với các lựa chọn nằm bên trái,
     * scroll tới đúng section mà user
     * cần thao tác.
     */
    const sourceTargets = {
      subjects: 'profile-subjects',
      levels: 'profile-subjects',
      proposals: 'profile-calendar',
      formats: 'profile-location',
      areas: 'profile-location',
    };

    const target = document.getElementById(
      sourceTargets[firstKey]
    );

    if (!target) return;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    /*
     * Sau khi scroll, focus vào control
     * đầu tiên trong section nếu có.
     */
    window.setTimeout(() => {
      const firstControl =
        target.querySelector(
          'button:not(:disabled), a[href], input, select, textarea'
        );

      firstControl?.focus({
        preventScroll: true,
      });
    }, 350);
  };

  const submit = (event) => {
    event.preventDefault();

    setValidationAttempted(true);
    onValidationErrors?.(errors);

    if (!ready) {
      requestAnimationFrame(() => {
        scrollToFirstError(errors);
      });

      return;
    }

    const proposals = ranges.map(
      ({
        date,
        start,
        end,
      }) => ({
        date,
        start,
        end,
      })
    );

    const result = createRequest({
        tutorId: tutor.id,

        subjects:
          selectedSubjects,

        subject:
          selectedSubjects.join(', '),

        levels:
          selectedLevels,

        proposals,

        schedule:
          proposals
            .map(concreteScheduleLabel)
            .join('; '),

        formats:
          selection.formats,

        format:
          selection.formats.join(', '),

        areas:
          selection.areas,

        goal:
          goal.trim(),

        status: 'pending',
    });

    if (result.error) { setSubmitError(result.error); return; }
    navigate(`/requests/${result.id}`);
  };

  return (
    <form
      className="profile-request booking-modal__goal"
      id="profile-request"
      onSubmit={submit}
      noValidate
    >
      <div className="booking-modal__goal-heading">
        <h2>Mục tiêu học tập</h2>
        <p>Cho gia sư biết bạn muốn cải thiện điều gì trong buổi học.</p>
      </div>

      <label>
        <span>
          Mong muốn học tập{' '}
          <span className="profile-field-optional">(Không bắt buộc)</span>
        </span>
        <textarea
          className="profile-request__goal-input border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows="4"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="Mục tiêu học, phần cần hỗ trợ và lưu ý cho gia sư..."
        />
      </label>

      {!proposalsValid && (
        <small role="alert" className="schedule-error">
          Lịch rảnh hoặc thời lượng đã thay đổi. Bỏ khung giờ không còn phù hợp
          và chọn lại.
        </small>
      )}
      {submitError && (
        <small role="alert" className="schedule-error">
          {submitError}
        </small>
      )}

      {validationAttempted && !ready && (
        <small className="profile-validation-summary" role="alert">
          Vui lòng hoàn thành các mục được đánh dấu trước khi gửi yêu cầu.
        </small>
      )}

      {!hideSubmitButton && (
        <button className="button button--primary button--md" type="submit">
          Gửi yêu cầu học
          <ArrowRight size={17} />
        </button>
      )}

      <small>
        Các khung giờ bạn chọn là đề xuất, chưa phải lịch học được xác nhận.
      </small>
    </form>
  );
}
