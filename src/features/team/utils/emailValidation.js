/**
 * Client-side email validation for invitation flow.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailFormat(email) {
  if (!email || !email.trim()) {
    return 'Work email is required.';
  }
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid work email address.';
  }
  return null;
}
