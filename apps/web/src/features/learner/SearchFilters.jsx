export function CheckboxFilter({ title, options, selected, onChange }) {
  return <fieldset className="search-checkbox-group"><legend>{title}</legend>{options.slice(1).map((option) => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option])} /><span>{option}</span></label>)}</fieldset>;
}

export function QuickFilter({ title, options, selected, onChange }) {
  const multiple = selected.length > 1;
  return <label>{title}<select value={multiple ? 'multiple' : selected[0] || options[0]} onChange={(event) => onChange(event.target.value === options[0] ? [] : [event.target.value])}>{multiple && <option value="multiple" disabled>{selected.length} đã chọn</option>}{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export function FeeRangeFilter({ minValue, maxValue, onMinChange, onMaxChange, compact = false, error }) {
  return (
    <fieldset className={`search-fee-range${compact ? ' search-fee-range--compact' : ''}`}>
      <legend>Mức phí / buổi (đ)</legend>
      <label>
        <span>Từ</span>
        <input type="number" min="0" step="50000" inputMode="numeric" value={minValue} onChange={(event) => onMinChange(event.target.value)} placeholder="Không hạn" aria-label="Học phí tối thiểu mỗi buổi" />
      </label>
      <label>
        <span>Đến</span>
        <input type="number" min="100000" step="50000" inputMode="numeric" value={maxValue} onChange={(event) => onMaxChange(event.target.value)} placeholder="Không hạn" aria-label="Học phí tối đa mỗi buổi" />
      </label>
      {error && <small className="search-filter-error" role="alert">{error}</small>}
    </fieldset>
  );
}
