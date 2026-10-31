import { useState, useRef, useEffect } from 'react';
import Icon from '../Icon/Icon';
import Avatar from '../Avatar/Avatar';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel';
import { useAuth } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import './Topbar.css';

export default function Topbar({
  title = 'Dashboard',
  isMobileOpen,
  onToggleMobile,
  notifications,
  isNotificationsOpen,
  onToggleNotifications,
  onCloseNotifications,
  onMarkAllAsRead,
}) {
  const { user, signOut } = useAuth();
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ⌘K on Mac or Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      if (e.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserMenuOpen]);

  const displayName = user?.name || 'Maya Chen';
  const displayEmail = user?.email || 'maya@helpdesk.ai';
  const displayRole = user?.role || 'Support Manager';
  const displayInitials = user?.initials || 'MC';

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    if (isNotificationsOpen && onCloseNotifications) {
      onCloseNotifications();
    }
    signOut();
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          className="topbar__menu-btn"
          onClick={onToggleMobile}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          <Icon name={isMobileOpen ? 'x' : 'menu'} size={20} strokeWidth={2} />
        </button>

        <h1 className="topbar__title">{title}</h1>
      </div>

      {/* Centered Search Bar */}
      <div className="topbar__center">
        <div className="topbar__search-box">
          <Icon name="search" size={16} className="topbar__search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="topbar__search-input"
            placeholder="Search tickets, customers, articles..."
            aria-label="Search tickets, customers, articles"
          />
          <kbd className="topbar__search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="topbar__right">
        <button type="button" className="topbar__btn-new-ticket">
          New ticket
        </button>

        {/* Notifications Trigger & Dropdown */}
        <div className="topbar__notif-wrapper">
          <button
            type="button"
            className={`topbar__btn-bell ${
              isNotificationsOpen ? 'topbar__btn-bell--active' : ''
            }`}
            onClick={onToggleNotifications}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
          >
            <Icon name="bell" size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="topbar__notif-badge" aria-hidden="true" />
            )}
          </button>

          <NotificationsPanel
            isOpen={isNotificationsOpen}
            onClose={onCloseNotifications}
            notifications={notifications}
            onMarkAllAsRead={onMarkAllAsRead}
          />
        </div>

        {/* User Profile Chip & Menu */}
        <div className="topbar__user-wrapper" ref={userMenuRef}>
          <div
            className="topbar__user-chip"
            tabIndex={0}
            role="button"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            aria-label={`User profile for ${displayName}`}
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsUserMenuOpen((prev) => !prev);
              }
            }}
          >
            <Avatar initials={displayInitials} size="sm" />
            <Icon name="chevron-down" size={14} className="topbar__chevron" />
          </div>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="topbar__user-menu" role="menu" aria-label="User account actions">
              <div className="topbar__user-menu-header">
                <span className="topbar__user-menu-name">{displayName}</span>
                <span className="topbar__user-menu-email">{displayEmail}</span>
                <span className="topbar__user-menu-role">{displayRole}</span>
              </div>
              <button
                type="button"
                role="menuitem"
                className="topbar__user-menu-item"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
