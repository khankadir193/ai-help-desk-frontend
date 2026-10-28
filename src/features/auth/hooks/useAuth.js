import { useContext } from 'react';
import { AuthContext } from '../authContextInstance';

/**
 * Custom hook to access authentication context
 * @returns {Object} { user, role, isAuthenticated, isLoading, login, logout, ... }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
