import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext, AUTH_QUERY_KEY } from './authContextInstance';
import authService from './services/authService';

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // Fetch session profile on app load & restore session
  const {
    data: user = null,
    isLoading,
    isFetching,
    error: sessionError,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authService.getMe();
      } catch (err) {
        // If unauthenticated (401), resolve cleanly to null without throwing
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (authenticatedUser) => {
      // Immediately hydrate query cache with returned user
      queryClient.setQueryData(AUTH_QUERY_KEY, authenticatedUser);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Clear server state cache and reset user to null
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  // Listen to session expiry event dispatched by Axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user),
      isLoading,
      isFetching,
      sessionError,
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      loginError: loginMutation.error?.userMessage || null,
      resetLoginError: loginMutation.reset,
    }),
    [
      user,
      isLoading,
      isFetching,
      sessionError,
      loginMutation.mutateAsync,
      loginMutation.isPending,
      loginMutation.error,
      loginMutation.reset,
      logoutMutation.mutateAsync,
      logoutMutation.isPending,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
