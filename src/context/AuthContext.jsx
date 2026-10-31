/* eslint-disable react-refresh/only-export-components */
import { useAuth } from '../features/auth/hooks/useAuth';

export { useAuth };
export { default as AuthProvider } from '../features/auth/AuthContext';
export default useAuth;
