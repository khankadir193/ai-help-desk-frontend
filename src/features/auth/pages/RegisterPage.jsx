import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/RegisterForm';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { ROUTES } from '../../../constants/routes';

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already has an active session, redirect away from registration
    if (!isLoading && isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <Spinner size="lg" label="Checking session..." />;
  }

  return (
    <RegisterForm
      onSuccess={(_user, email) => {
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: {
            message: 'Account created successfully! Please sign in with your credentials.',
            email,
          },
        });
      }}
    />
  );
}

