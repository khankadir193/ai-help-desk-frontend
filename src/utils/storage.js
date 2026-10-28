/**
 * Client storage utility for non-sensitive UI preferences only.
 * IMPORTANT: In accordance with security requirements, session tokens,
 * access tokens, and passwords must NEVER be stored here.
 * Authentication is strictly maintained via secure, HttpOnly session cookies.
 */
export const storage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/permission errors
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};
