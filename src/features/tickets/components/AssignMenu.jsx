import { useRef } from 'react';
import Avatar from '../../../components/Avatar/Avatar';
import Icon from '../../../components/Icon/Icon';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { formatInitials } from '../utils/ticketFormatters';
import './AssignMenu.css';

export default function AssignMenu({
  isOpen = false,
  onClose,
  agents = [],
  onSelectAgent,
}) {
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose);

  if (!isOpen) return null;

  return (
    <div className="assign-menu" ref={menuRef} role="menu" aria-label="Assign tickets">
      <div className="assign-menu__header">ASSIGN TO</div>
      <div className="assign-menu__list">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            className="assign-menu__item"
            onClick={() => {
              onSelectAgent(String(agent.id));
              onClose();
            }}
          >
            <div className="assign-menu__item-left">
              <Avatar
                initials={formatInitials(agent.name)}
                size="sm"
                className="assign-menu__avatar"
              />
              <span className="assign-menu__agent-name">{agent.name}</span>
            </div>
            {typeof agent.open_tickets_count === 'number' && (
              <span className="assign-menu__open-count">{agent.open_tickets_count} open</span>
            )}
          </button>
        ))}
      </div>
      <div className="assign-menu__divider" />
      <button
        type="button"
        className="assign-menu__item assign-menu__item--unassign"
        onClick={() => {
          onSelectAgent(null);
          onClose();
        }}
      >
        <div className="assign-menu__item-left">
          <div className="assign-menu__unassign-icon">
            <Icon name="user" size={14} />
          </div>
          <span>Unassign</span>
        </div>
      </button>
    </div>
  );
}
