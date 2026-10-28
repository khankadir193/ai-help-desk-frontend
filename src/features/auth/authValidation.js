const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates login form inputs
 * @param {Object} values - { email, password }
 * @returns {Object} Object containing error messages per field (empty if valid)
 */
export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  } else if (trimmedEmail.length > 254) {
    errors.email = 'Email address must not exceed 254 characters.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length > 72) {
    errors.password = 'Password cannot exceed 72 characters.';
  }

  return errors;
};

