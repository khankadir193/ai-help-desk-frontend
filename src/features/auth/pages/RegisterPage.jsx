import { useNavigate, useLocation } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = () => {
    const destination = location.state?.from?.pathname || '/';
    navigate(destination, { replace: true });
  };

  return <RegisterForm onSuccess={handleSuccess} />;
}


