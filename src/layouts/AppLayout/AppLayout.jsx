import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link to={ROUTES.HOME}>HelpDesk AI</Link>
          <span className={styles.badge}>v1.0 Foundation</span>
        </div>
        <nav className={styles.nav}>
          <Link to={ROUTES.HOME} className={styles.navLink}>
            Home
          </Link>
          <Link to={ROUTES.TICKETS} className={styles.navLink}>
            Tickets
          </Link>
          <Link to={ROUTES.LOGIN} className={styles.navLink}>
            Login
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

