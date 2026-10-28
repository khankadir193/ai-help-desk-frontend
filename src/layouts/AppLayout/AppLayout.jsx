import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import Button from '../../components/ui/Button/Button';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { user, isAuthenticated, role, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      // Handled in auth mutation
    }
  };

  const getRoleBadgeClass = () => {
    if (role === ROLES.ADMIN) return styles.roleAdmin;
    if (role === ROLES.AGENT) return styles.roleAgent;
    return styles.roleCustomer;
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <div className={styles.brand}>
            <Link to={ROUTES.HOME}>HelpDesk AI</Link>
            <span className={styles.badge}>v1.0</span>
          </div>

          <nav className={styles.nav} aria-label="Main Navigation">
            <NavLink
              to={ROUTES.HOME}
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to={ROUTES.TICKETS}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                Tickets
              </NavLink>
            )}

            {/* Dashboard: visible to Agent & Admin */}
            {isAuthenticated && (role === ROLES.AGENT || role === ROLES.ADMIN) && (
              <NavLink
                to={ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                Dashboard
              </NavLink>
            )}

            {/* Categories & Users: Admin only */}
            {isAuthenticated && role === ROLES.ADMIN && (
              <>
                <NavLink
                  to={ROUTES.CATEGORIES}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                  }
                >
                  Categories
                </NavLink>
                <NavLink
                  to={ROUTES.USERS}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                  }
                >
                  Users
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className={styles.userSection}>
          {isAuthenticated ? (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || user?.email}</span>
                <span className={`${styles.userRole} ${getRoleBadgeClass()}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                disabled={isLoggingOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
