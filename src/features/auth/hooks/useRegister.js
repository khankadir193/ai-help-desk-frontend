import { useMutation } from '@tanstack/react-query';
import authService from '../services/authService';

/**
 * React Query mutation hook for user registration
 * @returns {Object} { register, isRegistering, registerError, resetRegisterError, isSuccess }
 */
export function useRegister() {
  const mutation = useMutation({
    mutationFn: authService.register,
  });

  return {
    register: mutation.mutateAsync,
    isRegistering: mutation.isPending,
    registerError: mutation.error?.userMessage || null,
    resetRegisterError: mutation.reset,
    isSuccess: mutation.isSuccess,
  };
}

export default useRegister;

