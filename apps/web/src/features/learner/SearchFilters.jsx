import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function CheckboxFilter({ title, options, selected, onChange }) {
  const baseId = useId();

  return (
    <fieldset className="search-checkbox-group">
      <legend>{title}</legend>
      {options.slice(1).map((option, index) => {
        const optionId = `${baseId}-${index}`;
        return (
          <label key={option} htmlFor={optionId}>
            <input
              id={optionId}
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(
                selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option]
              )}
            />
            <span>{option}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function QuickFilter({ title, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [placement, setPlacement] = useState({ above: false, height: 360 });
  const summary = selected.length > 1 ? `${selected.length} đã chọn` : selected[0] || options[0];

  useLayoutEffect(() => {
    if (!open) return undefined;
    const updatePlacement = () => {
      const root = rootRef.current.getBoundingClientRect();
      const headerBottom = document.querySelector('.learner-app-header')?.getBoundingClientRect().bottom || 0;
      const below = Math.max(0, window.innerHeight - root.bottom - 16);
      const above = Math.max(0, root.top - headerBottom - 16);
      const opensAbove = below < 200 && above > below;
      setPlacement({ above: opensAbove, height: Math.min(360, opensAbove ? above : below) });
    };
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement);
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

  return (
    <div
      ref={rootRef}
      className={`search-filter ${open ? 'is-open' : ''} ${placement.above ? 'opens-above' : ''}`}
      style={{ '--filter-available-height': `${placement.height}px` }}
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
      <div className="search-filter__options" id={`${id}-options`}>
        <CheckboxFilter title={title} options={options} selected={selected} onChange={onChange} />
      </div>
    </div>
  );
}
