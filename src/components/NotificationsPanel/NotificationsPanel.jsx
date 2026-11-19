import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import Spinner from '../feedback/Spinner/Spinner';
import timeAgo from '../../utils/relativeTime';
import './NotificationsPanel.css';

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAllAsRead,
  onMarkAsRead,
  isLoading = false,
  isError = false,
  onRetry,
  isMarkingAllRead = false,
}) {
  const panelRef = useRef(null);
  const navigate = useNavigate();

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

  const handleItemClick = (item) => {
    const isUnread = item.unread ?? !item.is_read;
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    if (item.ticket_id) {
      onClose();
      navigate(`/tickets/${item.ticket_id}`);
    }
  };

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
          disabled={unreadCount === 0 || isMarkingAllRead}
        >
          {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>

      <div className="notifications-panel__list">
        {isLoading && (
          <div className="notifications-panel__loading">
            <Spinner size="sm" label="Loading notifications..." />
          </div>
        )}

        {!isLoading && isError && (
          <div className="notifications-panel__error">
            <p className="notifications-panel__error-text">Failed to load notifications.</p>
            {onRetry && (
              <button
                type="button"
                className="notifications-panel__retry-btn"
                onClick={onRetry}
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <p className="notifications-panel__empty">
            No notifications right now.
          </p>
        )}

        {!isLoading &&
          !isError &&
          notifications.map((item) => {
            const isUnread = item.unread ?? !item.is_read;
            const displayTime = item.time || timeAgo(item.created_at) || '';

            return (
              <div
                key={item.id}
                className={`notifications-panel__item ${
                  isUnread ? 'notifications-panel__item--unread' : ''
                }`}
                role="button"
                tabIndex={0}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item);
                  }
                }}
              >
                <div className="notifications-panel__dot-col">
                  <span
                    className={`notifications-panel__dot ${
                      isUnread
                        ? 'notifications-panel__dot--unread'
                        : 'notifications-panel__dot--read'
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <div className="notifications-panel__content">
                  <div className="notifications-panel__item-title">{item.title}</div>
                  {item.subtitle && (
                    <div className="notifications-panel__item-subtitle">
                      {item.subtitle}
                    </div>
                  )}
                  {displayTime && (
                    <div className="notifications-panel__item-time">{displayTime}</div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
