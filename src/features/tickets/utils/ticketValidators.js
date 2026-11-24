/**
 * Validation utilities for Ticket forms
 */

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateAttachment(file) {
  if (!file) return { valid: false, error: 'No file provided.' };

  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const isTypeAllowed =
    ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: 'Only PDF, JPG, or PNG files are supported.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds the 10 MB limit.',
    };
  }

  return { valid: true, error: null };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
