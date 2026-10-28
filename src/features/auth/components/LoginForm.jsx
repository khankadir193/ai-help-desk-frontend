import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../authValidation';
import { ROUTES } from '../../../constants/routes';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import styles from './LoginForm.module.css';

export default function LoginForm({ onSuccess }) {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();
  const location = useLocation();

  // Pick up flash message and pre-filled email from registration redirect if available
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || null
  );

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Dismiss server alert banner upon editing
    if (loginError) {
      resetLoginError();
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // Error handled by mutation and exposed via loginError
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Sign in to your account</h1>
        <p className={styles.subtitle}>Enter your credentials to access tickets</p>
      </div>

      {successMessage && (
        <div className={styles.alertSuccess} role="status" aria-live="polite">
          <span>{successMessage}</span>
        </div>
      )}

      {loginError && (
        <div className={styles.alertError} role="alert">
          <span>{loginError}</span>
        </div>
      )}

      <Input
        label="Email address"
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={formData.email}
        onChange={handleChange}
        error={validationErrors.email}
        disabled={isLoggingIn}
        required
      />

      <Input
        label="Password"
        id="login-password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={validationErrors.password}
        disabled={isLoggingIn}
        required
        rightElement={
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={isLoggingIn}
        disabled={isLoggingIn}
      >
        Sign in
      </Button>

      <p className={styles.switchPrompt}>
        Don&apos;t have an account?
        <Link to={ROUTES.REGISTER} className={styles.switchLink}>
          Sign up
        </Link>
      </p>

      <div className={styles.footerNotice}>
        Session secured with HttpOnly cookies. Access is role-protected.
      </div>
    </form>
  );
}
