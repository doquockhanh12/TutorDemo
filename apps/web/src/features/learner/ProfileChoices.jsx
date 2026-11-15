export default function ProfileChoices({
  title,
  options,
  selected,
  onToggle,
  invalid = false,
  errorMessage = 'Vui lòng chọn ít nhất một mục.',
}) {
  return (
    <fieldset
      className="profile-choices"
      aria-invalid={invalid || undefined}
    >
      <legend>{title}</legend>
      <div>
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <button
              key={option}
              className="rounded-full"
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {invalid && (
        <small className="profile-field-error" role="alert">
          {errorMessage}
        </small>
      )}
    </fieldset>
  );
}
