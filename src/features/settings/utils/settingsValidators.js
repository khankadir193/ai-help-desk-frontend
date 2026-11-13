export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validateRequired(value, fieldLabel = 'This field') {
  if (!value || !String(value).trim()) {
    return `${fieldLabel} is required.`;
  }
  return null;
}

export function validateWorkspaceUrl(url) {
  if (!url || !url.trim()) {
    return 'Workspace URL is required.';
  }
  const clean = url.trim().toLowerCase().replace(/\.helpdesk\.ai$/, '');
  const urlRegex = /^[a-z0-9-]+$/;
  if (!urlRegex.test(clean)) {
    return 'URL can only contain lowercase letters, numbers, and hyphens.';
  }
  if (clean.length < 3) {
    return 'URL must be at least 3 characters.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
}

export function validateAvatarFile(file) {
  if (!file) return 'No file selected.';
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Only JPG and PNG are supported.';
  }
  const maxSize = 2 * 1024 * 1024; // 2 MB
  if (file.size > maxSize) {
    return 'File size exceeds 2 MB limit.';
  }
  return null;
}

