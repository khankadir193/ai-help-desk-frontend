import { useRef, useEffect } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import './NotificationsPanel.css';

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) {
  const panelRef = useRef(null);

  useClickOutside(panelRef, () => {
    if (isOpen) onClose();
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="notifications-panel"
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
    >
      <div className="notifications-panel__header">
        <h3 className="notifications-panel__title">Notifications</h3>
        <button
          type="button"
          className="notifications-panel__mark-read-btn"
          onClick={onMarkAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      <div className="notifications-panel__list">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`notifications-panel__item ${
              item.unread ? 'notifications-panel__item--unread' : ''
            }`}
          >
            <div className="notifications-panel__dot-col">
              <span
                className={`notifications-panel__dot ${
                  item.unread
                    ? 'notifications-panel__dot--unread'
                    : 'notifications-panel__dot--read'
                }`}
                aria-hidden="true"
              />
            </div>

            <div className="notifications-panel__content">
              <div className="notifications-panel__item-title">{item.title}</div>
              <div className="notifications-panel__item-subtitle">
                {item.subtitle}
              </div>
              <div className="notifications-panel__item-time">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

