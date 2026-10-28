import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../authValidation';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import styles from './LoginForm.module.css';

export default function LoginForm({ onSuccess }) {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear inline error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear global API error on user interaction
    if (loginError) {
      resetLoginError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
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
            tabIndex={-1}
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

      <div className={styles.footer}>
        Protected by session authentication. Access is role-restricted.
      </div>
    </form>
  );
}

