import { useRef } from 'react';
import StatusPill from '../../../components/StatusPill/StatusPill';
import { useClickOutside } from '../../../hooks/useClickOutside';
import './ChangeStatusMenu.css';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function ChangeStatusMenu({
  isOpen = false,
  onClose,
  onSelectStatus,
}) {
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose);

  if (!isOpen) return null;

  return (
    <div className="change-status-menu" ref={menuRef} role="menu" aria-label="Change ticket status">
      {STATUSES.map((st) => (
        <button
          key={st}
          type="button"
          className="change-status-menu__item"
          onClick={() => {
            onSelectStatus(st);
            onClose();
          }}
        >
          <StatusPill status={st} />
        </button>
      ))}
    </div>
  );
}
