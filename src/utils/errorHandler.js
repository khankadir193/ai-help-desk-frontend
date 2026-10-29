/**
 * Extracts a human-readable error message from an API error response.
 * @param {Error|Object} error - The caught error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Network or CORS error (no response received)
  if (error.code === 'ERR_NETWORK' || (!error.response && error.request)) {
    return 'Unable to connect to the server. Please check your network connection.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }

  // Server returned an error response
  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') {
      return data;
    }

    // Handles validation error arrays (e.g., { message: 'Validation failed', errors: [{ message: '...' }] })
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((err) => err.message || err).join('; ');
    }

    if (data.message) {
      return data.message;
    }

    if (data.error) {
      return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
  }

  // HTTP status fallback messages
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid credentials or session expired. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource might already exist.';
      case 422:
        return 'Validation failed. Please check your inputs.';
      case 429:
        return 'Too many requests from this IP, please try again after 15 minutes.';
      case 500:
        return 'Internal server error. Our team has been notified.';
      default:
        return `Request failed with status code ${error.response.status}.`;
    }
  }

  return error.message || 'An unexpected error occurred.';
};

