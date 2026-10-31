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
  '/tickets': 'Tickets',
  '/ai-assistant': 'AI Assistant',
  '/knowledge-base': 'Knowledge Base',
  '/reports': 'Reports',
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
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width <= 1023) {
        setCollapsed(true);
      } else if (width >= 1024) {
        setCollapsed(persistedCollapsed);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [persistedCollapsed]);

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, unread: false }))
    );
  };

  const pageTitle = ROUTE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
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

