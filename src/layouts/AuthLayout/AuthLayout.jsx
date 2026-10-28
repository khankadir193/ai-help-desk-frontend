import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.container}>
      <div className={styles.brand}>
        <Link to={ROUTES.HOME} className={styles.brandTitle}>
          HelpDesk AI
        </Link>
        <p className={styles.brandSubtitle}>Support Ticket & Resolution System</p>
      </div>

      <div className={styles.card}>
        <Outlet />
      </div>
    </div>
  );
}

