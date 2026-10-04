import { Check } from 'lucide-react';

export default function ProfileChoices({ title, options, selected, onToggle }) {
  return <fieldset className="profile-choices"><legend>{title}</legend><div>{options.map((option) => <button key={option} type="button" aria-pressed={selected.includes(option)} onClick={() => onToggle(option)}>{selected.includes(option) && <Check size={16} aria-hidden="true" />}{option}</button>)}</div></fieldset>;
}
