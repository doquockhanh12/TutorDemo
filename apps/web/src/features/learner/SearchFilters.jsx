export function CheckboxFilter({ title, options, selected, onChange }) {
  return <fieldset className="search-checkbox-group"><legend>{title}</legend>{options.slice(1).map((option) => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option])} /><span>{option}</span></label>)}</fieldset>;
}

export function QuickFilter({ title, options, selected, onChange }) {
  const multiple = selected.length > 1;
  return <label>{title}<select value={multiple ? 'multiple' : selected[0] || options[0]} onChange={(event) => onChange(event.target.value === options[0] ? [] : [event.target.value])}>{multiple && <option value="multiple" disabled>{selected.length} đã chọn</option>}{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
