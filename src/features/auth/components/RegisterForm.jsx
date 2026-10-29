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

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

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

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(user, formData.email);
        }
      }, 1200);
    } catch (err) {
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendFieldErrors = {};
        err.response.data.errors.forEach((e) => {
          if (e.field) {
            backendFieldErrors[e.field] = e.message;
          }
        });
        setValidationErrors((prev) => ({ ...prev, ...backendFieldErrors }));
      }
    }
  };

  return (
    <div className={styles.formWrapper}>
      <header className={styles.header}>
        <div className={styles.startBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Fast Setup</span>
        </div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Get started with AI-driven support ticket management</p>
      </header>

      {isSuccessNotification && (
        <div className={styles.alertSuccess} role="status" aria-live="polite">
          <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Account created successfully! Preparing sign in...</span>
        </div>
      )}

      {registerError && (
        <div className={styles.alertError} role="alert">
          <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{registerError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldsStack}>
          <Input
            label="Full Name"
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
            leftIcon={
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />

          <Input
            label="Work Email"
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            disabled={isRegistering || isSuccessNotification}
            required
            leftIcon={
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />

          <Input
            label="Password"
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create password (min. 8 characters)"
            helperText="Must be between 8 and 72 characters."
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            disabled={isRegistering || isSuccessNotification}
            required
            leftIcon={
              <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            rightElement={
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isRegistering}
          disabled={isRegistering || isSuccessNotification}
        >
          Create Customer Account
        </Button>
      </form>

      <p className={styles.switchPrompt}>
        Already registered?
        <Link to={ROUTES.LOGIN} className={styles.switchLink}>
          <span>Sign in to your account</span>
          <span className={styles.switchArrow} aria-hidden="true">&rarr;</span>
        </Link>
      </p>

      <div className={styles.policyNote}>
        By submitting, you agree to our Terms of Service & Privacy Policy.
      </div>
    </div>
  );
}
