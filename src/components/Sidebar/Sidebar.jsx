import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../Icon/Icon';
import Avatar from '../Avatar/Avatar';
import { navigationSections } from '../../data/navigationData';
import { useAuth } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import './Sidebar.css';

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleSignOut = () => {
    setIsMenuOpen(false);
    signOut();
  };

  const displayName = user?.name || 'Maya Chen';
  const displayRole = user?.role || 'Support Manager';
  const displayInitials = user?.initials || 'MC';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'} ${
          isMobileOpen ? 'sidebar--mobile-open' : ''
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header / Logo */}
        <div className="sidebar__header">
          <div className="sidebar__logo-group">
            <div className="sidebar__logo-tile" aria-hidden="true">
              <Icon name="sparkle" size={20} strokeWidth={2} />
            </div>
            {!collapsed && <span className="sidebar__brand-name">HelpDesk AI</span>}
          </div>

          {/* Collapse Toggle Button (Desktop/Tablet) */}
          <button
            type="button"
            className="sidebar__toggle-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              name={collapsed ? 'chevron-right' : 'chevron-left'}
              size={16}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar__nav" aria-label="Main Navigation">
          {navigationSections.map((section) => (
            <div key={section.title} className="sidebar__section">
              {!collapsed && (
                <div className="sidebar__section-title">{section.title}</div>
              )}
              {collapsed && (
                <div className="sidebar__section-divider" aria-hidden="true" />
              )}

              <ul className="sidebar__list">
                {section.items.map((item) => (
                  <li key={item.id} className="sidebar__item">
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                      }
                      onClick={() => {
                        if (isMobileOpen && onCloseMobile) onCloseMobile();
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="sidebar__link-icon">
                            <Icon
                              name={item.icon}
                              size={18}
                              strokeWidth={isActive ? 2 : 1.75}
                            />
                          </div>

                          {!collapsed && (
                            <span className="sidebar__link-label">{item.label}</span>
                          )}

                          {!collapsed && item.badge && (
                            <span className="sidebar__badge">{item.badge}</span>
                          )}

                          {/* Collapsed Tooltip */}
                          {collapsed && (
                            <span className="sidebar__tooltip" role="tooltip">
                              {item.label}
                              {item.badge && ` (${item.badge})`}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="sidebar__footer" ref={menuRef}>
          {collapsed ? (
            <div
              className="sidebar__collapsed-avatar"
              title={`${displayName} • ${displayRole}`}
            >
              <Avatar initials={displayInitials} size="md" />
            </div>
          ) : (
            <div className="sidebar__user-card-wrapper">
              <div className="sidebar__user-card">
                <Avatar initials={displayInitials} size="md" />
                <div className="sidebar__user-info">
                  <span className="sidebar__user-name">{displayName}</span>
                  <span className="sidebar__user-role">{displayRole}</span>
                </div>
                <button
                  type="button"
                  className="sidebar__user-menu-btn"
                  aria-label="User options menu"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  <Icon name="more-vertical" size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Kebab Sign Out Menu */}
              {isMenuOpen && (
                <div className="sidebar__kebab-menu" role="menu" aria-label="User actions">
                  <div className="sidebar__kebab-header">
                    <span className="sidebar__kebab-name">{displayName}</span>
                    <span className="sidebar__kebab-email">{user?.email}</span>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className="sidebar__kebab-item"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
