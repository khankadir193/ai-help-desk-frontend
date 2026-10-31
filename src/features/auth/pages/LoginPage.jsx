import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = () => {
    const destination = location.state?.from?.pathname || '/';
    navigate(destination, { replace: true });
  };

  return <LoginForm onSuccess={handleSuccess} />;
}


