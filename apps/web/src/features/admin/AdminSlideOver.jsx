import { useId } from 'react';
import { X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus.js';

export default function AdminSlideOver({
  open,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
}) {
  const panelRef = useDialogFocus(onClose, open);
  const subtitleId = useId();

  if (!open) return null;

  return (
    <div className="admin-slideover" role="dialog" aria-modal="true" aria-labelledby="slideover-title" aria-describedby={subtitle ? subtitleId : undefined}>
      <div className="admin-slideover__scrim" onClick={onClose} aria-hidden="true" />
      <aside className="admin-slideover__panel" ref={panelRef} tabIndex={-1}>
        <header className="admin-slideover__header">
          <div className="admin-slideover__title-wrap">
            <div className="admin-slideover__heading">
              <h2 id="slideover-title">{title}</h2>
              {badge}
            </div>
            {subtitle && <p id={subtitleId} className="admin-slideover__subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-button admin-slideover__close"
            onClick={onClose}
            aria-label="Đóng bảng chi tiết"
          >
            <X size={20} />
          </button>
        </header>

        <div className="admin-slideover__body">
          {children}
        </div>

        {footer && (
          <footer className="admin-slideover__footer">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
