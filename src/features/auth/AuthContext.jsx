import { useEffect, useMemo, useCallback } from 'react';
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

  // Compute initials from name or fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Adapter methods for backward compatibility with components using signIn, signUp, signOut
  const signIn = useCallback(
    async (email, password) => {
      try {
        const loggedInUser = await loginMutation.mutateAsync({ email, password });
        return { ok: true, user: loggedInUser };
      } catch (err) {
        const errorMsg =
          err?.userMessage ||
          err?.response?.data?.message ||
          'Invalid email or password.';
        return { ok: false, error: errorMsg };
      }
    },
    [loginMutation]
  );

  const signUp = useCallback(
    async ({ name, email, password }) => {
      try {
        const registeredUser = await authService.register({ name, email, password });
        // Attempt immediate login after registration
        const loggedInUser = await loginMutation.mutateAsync({ email, password });
        return { ok: true, user: loggedInUser || registeredUser };
      } catch (err) {
        const errorMsg =
          err?.userMessage ||
          err?.response?.data?.message ||
          'Registration failed.';
        return { ok: false, error: errorMsg };
      }
    },
    [loginMutation]
  );

  const signOut = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Handled in mutation
    }
  }, [logoutMutation]);

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

  // Enhanced user object with initials
  const userWithInitials = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      initials: user.initials || getInitials(user.name),
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user: userWithInitials,
      role: userWithInitials?.role || null,
      isAuthenticated: Boolean(userWithInitials),
      isLoading,
      isFetching,
      sessionError,
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      loginError: loginMutation.error?.userMessage || null,
      resetLoginError: loginMutation.reset,
      signIn,
      signUp,
      signOut,
    }),
    [
      userWithInitials,
      isLoading,
      isFetching,
      sessionError,
      loginMutation.mutateAsync,
      loginMutation.isPending,
      loginMutation.error,
      loginMutation.reset,
      logoutMutation.mutateAsync,
      logoutMutation.isPending,
      signIn,
      signUp,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
