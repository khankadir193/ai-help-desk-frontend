import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { initialNotifications } from '../../data/notificationsData';
import './AppLayout.css';

// Route to title map
const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/categories': 'Categories',
  '/tickets': 'Tickets',
  '/ai-assistant': 'AI Assistant',
  '/knowledge-base': 'Knowledge Base',
  '/reports': 'Reports & Analytics',
  '/team': 'Team',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const location = useLocation();

  // Sidebar collapsed state persisted in localStorage
  const [persistedCollapsed, setPersistedCollapsed] = useLocalStorage(
    'helpdesk-sidebar-collapsed',
    false
  );
  const [collapsed, setCollapsed] = useState(persistedCollapsed);

  // Responsive mobile drawer state (<768px)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync persisted collapsed state
  const handleToggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    setPersistedCollapsed(nextState);
  };

  // Auto-collapse sidebar on tablet screens (768px - 1023px)
  // and reset stale mobile drawer state on desktop/tablet
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width <= 1023) {
        setCollapsed(true);
        setIsMobileOpen(false);
      } else if (width >= 1024) {
        setCollapsed(persistedCollapsed);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [persistedCollapsed]);

  // Mobile drawer: Escape to close + lock body scroll while open
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, unread: false }))
    );
  };

  const pageTitle =
    ROUTE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/tickets/')
      ? 'Ticket Details'
      : 'Dashboard');

  return (
    <div className="app-layout">
      {/* Sidebar Navigation (always expanded inside the mobile drawer) */}
      <Sidebar
        collapsed={collapsed && !isMobileOpen}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Sticky Topbar */}
        <Topbar
          title={pageTitle}
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
          notifications={notifications}
          isNotificationsOpen={isNotificationsOpen}
          onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onCloseNotifications={() => setIsNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* Dynamic Outlet / Page Content */}
        <Outlet />
      </div>
    </div>
  );
}

