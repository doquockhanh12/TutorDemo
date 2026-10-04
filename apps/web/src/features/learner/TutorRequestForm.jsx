import { ArrowRight, X } from 'lucide-react';
import {
  useEffect,
  useRef,
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

function SelectedGroup({
  title,
  items,
  target,
  onRemove,
  optional = false,
  invalid = false,
  validationKey,
}) {
  return (
    <fieldset
      className={
        'profile-selection-summary' +
        (invalid ? ' is-validation-error' : '')
      }
      data-validation-key={validationKey}
      aria-invalid={invalid || undefined}
    >
      <legend>
        {title}
        {optional ? ' (tùy chọn)' : ' *'}
      </legend>

      {items.length ? (
        <div>
          {items.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => onRemove(item.key)}
              aria-label={`Bỏ ${item.label}`}
            >
              {item.label}

              <X
                size={14}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : (
        <a href={`#${target}`}>
          Chọn {title.toLocaleLowerCase('vi-VN')} trong hồ sơ
        </a>
      )}

      {invalid && (
        <small
          className="profile-field-error"
          role="alert"
        >
          Vui lòng hoàn thành mục này.
        </small>
      )}
    </fieldset>
  );
}

const choices = (items) =>
  items.map((item) => ({
    key: item,
    label: item,
  }));

export default function TutorRequestForm({
  tutor,
  selection,
  onToggle,
  onRemoveRange,
  onValidationErrors,
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

  const goalRef = useRef(null);

  const ranges = selection.proposals;

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
    subjects:
      selection.subjects.length === 0,

    levels: selection.levels.length === 0,

    proposals:
      ranges.length === 0 ||
      !proposalsValid,

    formats:
      selection.formats.length === 0,

    areas:
      areaRequired &&
      selection.areas.length === 0,

    goal:
      !goal.trim(),
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
    selection.subjects.length,
    selection.levels.length,
    ranges.length,
    proposalsValid,
    selection.formats.length,
    selection.areas.length,
    areaRequired,
    goal,
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
      'goal',
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

    if (firstKey === 'goal') {
      goalRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      window.setTimeout(() => {
        goalRef.current?.focus({
          preventScroll: true,
        });
      }, 350);

      return;
    }

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
          selection.subjects,

        subject:
          selection.subjects.join(', '),

        levels:
          selection.levels,

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

  const showError = (key) =>
    validationAttempted &&
    errors[key];

  return (
    <form
      className="profile-request"
      id="profile-request"
      onSubmit={submit}
      noValidate
    >
      <span className="eyebrow">
        BẮT ĐẦU KẾT NỐI
      </span>

      <h2>
        Gửi yêu cầu học
      </h2>

      <p>
        Các lựa chọn trong hồ sơ tự cập
        nhật ở đây. Bạn không cần nhập lại.
      </p>

      <SelectedGroup
        title="Môn học"
        items={choices(
          selection.subjects
        )}
        target="profile-subjects"
        validationKey="subjects"
        invalid={showError(
          'subjects'
        )}
        onRemove={(key) =>
          onToggle(
            'subjects',
            key
          )
        }
      />

      <SelectedGroup
        title="Cấp độ"
        items={choices(
          selection.levels
        )}
        target="profile-subjects"
        validationKey="levels"
        invalid={showError('levels')}
        onRemove={(key) =>
          onToggle(
            'levels',
            key
          )
        }
      />

      <SelectedGroup
        title="Khung giờ mong muốn"
        items={ranges.map(
          (range) => ({
            key:
              range.date +
              ':' +
              range.start +
              ':' +
              range.end,

            label:
              concreteScheduleLabel(
                range
              ),
          })
        )}
        target="profile-calendar"
        validationKey="proposals"
        invalid={showError(
          'proposals'
        )}
        onRemove={(key) =>
          onRemoveRange(
            ranges.find(
              (range) =>
                range.date +
                  ':' +
                  range.start +
                  ':' +
                  range.end ===
                key
            )
          )
        }
      />

      <SelectedGroup
        title="Hình thức học"
        items={choices(
          selection.formats
        )}
        target="profile-location"
        validationKey="formats"
        invalid={showError(
          'formats'
        )}
        onRemove={(key) =>
          onToggle(
            'formats',
            key
          )
        }
      />

      <SelectedGroup
        title="Khu vực học"
        optional={!areaRequired}
        items={choices(
          selection.areas
        )}
        target="profile-location"
        validationKey="areas"
        invalid={showError(
          'areas'
        )}
        onRemove={(key) =>
          onToggle(
            'areas',
            key
          )
        }
      />

      <label
        className={
          showError('goal')
            ? 'is-validation-error'
            : ''
        }
      >
        Mong muốn học tập *

        <textarea
          ref={goalRef}
          rows="4"
          value={goal}
          aria-required="true"
          aria-invalid={
            showError('goal') ||
            undefined
          }
          onChange={(event) =>
            setGoal(
              event.target.value
            )
          }
          placeholder="Mục tiêu học, phần cần hỗ trợ và lưu ý cho gia sư..."
        />

        {showError('goal') && (
          <small
            className="profile-field-error"
            role="alert"
          >
            Vui lòng nhập mong muốn học tập.
          </small>
        )}
      </label>

      {!ready &&
        !validationAttempted && (
          <small>
            Chọn ít nhất một môn, cấp độ, khung
            giờ, hình thức và nhập mục
            tiêu. Học tại nhà cần chọn
            khu vực.
          </small>
        )}

      {!proposalsValid && (
        <small
          role="alert"
          className="schedule-error"
        >
          Lịch rảnh hoặc thời lượng đã
          thay đổi. Bỏ khung giờ không
          còn phù hợp và chọn lại.
        </small>
      )}
      {submitError && <small role="alert" className="schedule-error">{submitError}</small>}

      {validationAttempted &&
        !ready && (
          <small
            className="profile-validation-summary"
            role="alert"
          >
            Vui lòng hoàn thành các mục
            được đánh dấu đỏ trước khi
            gửi yêu cầu.
          </small>
        )}

      {/*
        Không disabled nữa.

        User luôn bấm được và validation
        sẽ chạy trong submit().
      */}
      <button
        className="button button--primary button--md"
        type="submit"
      >
        Gửi yêu cầu học
        <ArrowRight size={17} />
      </button>

      <small>
        Yêu cầu demo được lưu trong trình
        duyệt. Các khung giờ là thời gian
        bạn đề xuất, chưa phải lịch học
        được xác nhận.
      </small>
    </form>
  );
}
