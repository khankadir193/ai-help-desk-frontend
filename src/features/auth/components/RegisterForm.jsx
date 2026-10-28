import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { validateRegisterForm } from '../authValidation';
import { ROUTES } from '../../../constants/routes';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import styles from './RegisterForm.module.css';

export default function RegisterForm({ onSuccess }) {
  const { register, isRegistering, registerError, resetRegisterError } = useRegister();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level validation message
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Dismiss server alert banner
    if (registerError) {
      resetRegisterError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateRegisterForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const user = await register(formData);
      setIsSuccessNotification(true);

      // Brief delay to allow the user to read the success confirmation before redirecting
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(user, formData.email);
        }
      }, 1200);
    } catch {
      // Error handled by mutation and exposed via registerError
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Get started with AI-powered help desk support</p>
      </div>

      {isSuccessNotification && (
        <div className={styles.alertSuccess} role="status" aria-live="polite">
          <span>Account created successfully! Redirecting you to sign in...</span>
        </div>
      )}

      {registerError && (
        <div className={styles.alertError} role="alert">
          <span>{registerError}</span>
        </div>
      )}

      <Input
        label="Full name"
        id="register-name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Jane Doe"
        value={formData.name}
        onChange={handleChange}
        error={validationErrors.name}
        disabled={isRegistering || isSuccessNotification}
        required
      />

      <Input
        label="Email address"
        id="register-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={formData.email}
        onChange={handleChange}
        error={validationErrors.email}
        disabled={isRegistering || isSuccessNotification}
        required
      />

      <Input
        label="Password"
        id="register-password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Create a secure password"
        helperText="Must be between 8 and 72 characters."
        value={formData.password}
        onChange={handleChange}
        error={validationErrors.password}
        disabled={isRegistering || isSuccessNotification}
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
        isLoading={isRegistering}
        disabled={isRegistering || isSuccessNotification}
      >
        Create account
      </Button>

      <p className={styles.switchPrompt}>
        Already have an account?
        <Link to={ROUTES.LOGIN} className={styles.switchLink}>
          Sign in
        </Link>
      </p>

      <div className={styles.footerNotice}>
        By registering, you agree to our standard support guidelines.
      </div>
    </form>
  );
}

