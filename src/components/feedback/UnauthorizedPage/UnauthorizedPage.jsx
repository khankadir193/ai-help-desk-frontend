import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { ROLE_LABELS } from '../../../constants/roles';
import { ROUTES } from '../../../constants/routes';
import Button from '../../ui/Button/Button';
import styles from './UnauthorizedPage.module.css';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRoleLabel = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Guest';

  return (
    <div className={styles.container}>
      <span className={styles.code}>403</span>
      <h1 className={styles.title}>Access Forbidden</h1>
      <p className={styles.description}>
        You do not have the required permissions to view this resource. Contact your administrator if
        you believe this is an error.
      </p>

      {user && (
        <div className={styles.userNotice}>
          Signed in as <strong>{user.email}</strong> ({userRoleLabel})
        </div>
      )}

      <Button
        variant="primary"
        onClick={() => navigate(ROUTES.DASHBOARD)}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}

