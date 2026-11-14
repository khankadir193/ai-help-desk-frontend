/**
 * Hook for managing Invite Member form state, validation, and dirty guard.
 */
import { useState, useCallback, useMemo } from 'react';
import { validateEmailFormat } from '../utils/emailValidation';

export function useInviteForm({ initialRole = 'AGENT', initialTeam = 'General support' } = {}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(initialRole);
  const [team, setTeam] = useState(initialTeam);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Dirty state: user entered an email or altered selections
  const isDirty = useMemo(() => {
    return email.trim().length > 0;
  }, [email]);

  // Validate email on blur
  const handleEmailBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, email: true }));
    const errorMsg = validateEmailFormat(email);
    setErrors((prev) => ({ ...prev, email: errorMsg }));
  }, [email]);

  // Handle email change
  const handleEmailChange = useCallback((val) => {
    setEmail(val);
    if (touched.email) {
      const errorMsg = validateEmailFormat(val);
      setErrors((prev) => ({ ...prev, email: errorMsg }));
    }
  }, [touched.email]);

  // Validate entire form before review dialog
  const validate = useCallback(() => {
    const emailError = validateEmailFormat(email);
    const newErrors = {};

    if (emailError) {
      newErrors.email = emailError;
    }
    if (!role) {
      newErrors.role = 'Please select a role for the invitation.';
    }
    if (!team) {
      newErrors.team = 'Please select a team.';
    }

    setErrors(newErrors);
    setTouched({ email: true, role: true, team: true });

    return Object.keys(newErrors).length === 0;
  }, [email, role, team]);

  // Set server error on email field
  const setFieldError = useCallback((field, msg) => {
    setErrors((prev) => ({ ...prev, [field]: msg }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setEmail('');
    setRole(initialRole);
    setTeam(initialTeam);
    setErrors({});
    setTouched({});
  }, [initialRole, initialTeam]);

  return {
    values: { email, role, team },
    errors,
    touched,
    isDirty,
    setEmail: handleEmailChange,
    setRole,
    setTeam,
    handleEmailBlur,
    validate,
    setFieldError,
    reset,
  };
}

export default useInviteForm;
