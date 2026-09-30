import { Search } from 'lucide-react';

export default function SearchInput({ id, value, onChange, placeholder, className = '' }) {
  return (
    <div className={`search-input ${className}`}>
      <Search size={18} strokeWidth={1.9} aria-hidden="true" />
      <input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}
