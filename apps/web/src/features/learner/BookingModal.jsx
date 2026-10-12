import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import ProfileCalendar from './ProfileCalendar.jsx';
import ProfileChoices from './ProfileChoices.jsx';
import TutorRequestForm from './TutorRequestForm.jsx';
import { removeSelectedProposal } from './profileSelection.js';

export default function BookingModal({ tutor, open, onClose }) {
  const dialogRef = useRef(null);
  const [params] = useSearchParams();
  const [validationErrors, setValidationErrors] = useState({});
  const [selection, setSelection] = useState(() => {
    const subjects = tutor.subjects || [];
    const subject = params
      .getAll('subject')
      .find((value) => subjects.includes(value)) || '';

    return {
      subjects: subject,
      levels: '',
      proposals: [],
      formats: [],
      areas: [],
    };
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  const selectSingleChoice = (key, value) => {
    setSelection((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleChoice = (key, value) => {
    setSelection((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const addProposal = (proposal) => {
    setSelection((current) => ({
      ...current,
      proposals: [...current.proposals, proposal],
    }));
  };

  const removeProposal = (proposal) => {
    setSelection((current) => ({
      ...current,
      proposals: removeSelectedProposal(current.proposals, proposal),
    }));
  };

  return (
    <dialog
      ref={dialogRef}
      className="booking-modal"
      aria-labelledby="booking-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="booking-modal__header">
        <div className="booking-modal__header-copy">
          <span className="eyebrow">ĐẶT LỊCH HỌC</span>
          <h2 id="booking-modal-title">Đặt lịch với {tutor.name}</h2>
          <p>Chọn thông tin buổi học phù hợp với bạn.</p>
        </div>

        <button
          className="booking-modal__close"
          type="button"
          aria-label="Đóng cửa sổ đặt lịch"
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="booking-modal__body">
        <section className="profile-section" id="profile-subjects">
          <h2>Môn học & cấp độ</h2>
          <div className="booking-modal__choice-grid">
            <ProfileChoices
              title="Môn học"
              options={tutor.subjects || []}
              selected={selection.subjects ? [selection.subjects] : []}
              invalid={validationErrors.subjects}
              errorMessage="Chọn một môn học."
              onToggle={(value) => selectSingleChoice('subjects', value)}
            />
            <ProfileChoices
              title="Cấp độ"
              options={tutor.levels || []}
              selected={selection.levels ? [selection.levels] : []}
              invalid={validationErrors.levels}
              errorMessage="Chọn một cấp độ."
              onToggle={(value) => selectSingleChoice('levels', value)}
            />
          </div>
        </section>

        <ProfileCalendar
          tutor={tutor}
          selected={selection.proposals}
          onAdd={addProposal}
          onRemove={removeProposal}
          invalid={validationErrors.proposals}
          stackOnMobile
          id="profile-calendar"
        />

        <section className="profile-section" id="profile-location">
          <h2>Hình thức & khu vực học</h2>
          <div className="booking-modal__choice-grid">
            <ProfileChoices
              title="Hình thức học"
              options={tutor.formats || []}
              selected={selection.formats}
              invalid={validationErrors.formats}
              errorMessage="Chọn hình thức học."
              onToggle={(value) => toggleChoice('formats', value)}
            />
            <ProfileChoices
              title={
                selection.formats.includes('Tại nhà')
                  ? 'Khu vực học'
                  : 'Khu vực học (tùy chọn)'
              }
              options={tutor.areas || []}
              selected={selection.areas}
              invalid={validationErrors.areas}
              errorMessage="Chọn khu vực nếu học tại nhà."
              onToggle={(value) => toggleChoice('areas', value)}
            />
          </div>
          <p>
            Học tại nhà cần chọn khu vực. Địa điểm cụ thể sẽ được trao đổi khi
            gia sư phản hồi.
          </p>
        </section>

        <TutorRequestForm
          tutor={tutor}
          selection={selection}
          onValidationErrors={setValidationErrors}
          hideSubmitButton
        />
      </div>

      <footer className="booking-modal__footer">
        <button
          className="button button--primary button--md"
          type="submit"
          form="profile-request"
        >
          Gửi yêu cầu học
        </button>
      </footer>
    </dialog>
  );
}
