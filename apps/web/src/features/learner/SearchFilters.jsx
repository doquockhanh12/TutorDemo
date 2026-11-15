import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function QuickFilter({ title, options, selected, onChange, defaultValue = '', className = '' }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [availableHeight, setAvailableHeight] = useState(360);
  const items = options.map((option, index) => {
    if (typeof option === 'string') {
      return { label: option, value: index === 0 ? defaultValue : option };
    }

    return option;
  });
  const summary = items.find((option) => option.value === selected)?.label ?? items[0]?.label ?? '';

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updateAvailableHeight = () => {
      const root = rootRef.current?.getBoundingClientRect();
      if (!root) return;

      const below = Math.max(160, window.innerHeight - root.bottom - 16);
      setAvailableHeight(Math.min(360, below));
    };

    updateAvailableHeight();
    window.addEventListener('resize', updateAvailableHeight);
    window.addEventListener('scroll', updateAvailableHeight);
    return () => {
      window.removeEventListener('resize', updateAvailableHeight);
      window.removeEventListener('scroll', updateAvailableHeight);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const media = window.matchMedia('(max-width: 767px)');
    const close = () => setOpen(false);

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    media.addEventListener('change', close);

    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      media.removeEventListener('change', close);
    };
  }, [open]);

  const selectOption = (value) => {
    onChange(value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={`search-filter ${className} ${open ? 'is-open' : ''}`.trim()}
      style={{ '--filter-available-height': `${availableHeight}px` }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <span className="search-filter__label" id={`${id}-label`}>{title}</span>
      <button
        ref={triggerRef}
        className="search-filter__trigger"
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen(!open)}
      >
        <span id={`${id}-value`}>{summary}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      <div
        className="search-filter__options"
        id={`${id}-options`}
        role="group"
        aria-label={title}
      >
        {items.map(({ label, value, icon: Icon }) => {
          const isSelected = selected === value;

          return (
            <button
              key={value || label}
              className={`search-filter__option ${isSelected ? 'is-selected' : ''}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectOption(value)}
            >
              {Icon && <Icon size={17} strokeWidth={1.8} aria-hidden="true" />}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
