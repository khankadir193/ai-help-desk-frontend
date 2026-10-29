import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { ROUTES } from '../../../constants/routes';
import { ROLES } from '../../../constants/roles';

export default function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDefaultDestination = (currentUser) => {
    return currentUser?.role === ROLES.CUSTOMER ? ROUTES.TICKETS : ROUTES.DASHBOARD;
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      const destination = location.state?.from?.pathname || getDefaultDestination(user);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate, location.state]);

  if (isLoading) {
    return <Spinner size="lg" label="Checking session..." />;
  }

  return (
    <LoginForm
      onSuccess={(loggedInUser) => {
        const target = loggedInUser || user;
        const destination = location.state?.from?.pathname || getDefaultDestination(target);
        navigate(destination, { replace: true });
      }}
    />
  );
}

