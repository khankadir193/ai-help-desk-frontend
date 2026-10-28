import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { ROUTES } from '../../../constants/routes';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const intendedDestination = location.state?.from?.pathname || ROUTES.DASHBOARD;

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      navigate(intendedDestination, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, intendedDestination]);

  if (isLoading) {
    return <Spinner size="lg" label="Checking session..." />;
  }

  return (
    <LoginForm
      onSuccess={() => {
        navigate(intendedDestination, { replace: true });
      }}
    />
  );
}

