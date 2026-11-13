import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../services/settingsService';
import { AUTH_QUERY_KEY } from '../../auth/authContextInstance';

export const PROFILE_SETTINGS_KEY = ['settings', 'profile'];
export const SESSIONS_KEY = ['settings', 'sessions'];

export function useProfileSettings() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: PROFILE_SETTINGS_KEY,
    queryFn: settingsService.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: settingsService.getSessions,
    staleTime: 1000 * 60 * 2,
  });

  const updateProfileMutation = useMutation({
    mutationFn: settingsService.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_SETTINGS_KEY, updated);
      queryClient.setQueryData(AUTH_QUERY_KEY, (prev) =>
        prev ? { ...prev, name: updated.name, email: updated.email } : prev
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: settingsService.uploadAvatar,
    onSuccess: (result) => {
      queryClient.setQueryData(PROFILE_SETTINGS_KEY, (prev) =>
        prev ? { ...prev, avatar_url: result.avatar_url } : prev
      );
      queryClient.setQueryData(AUTH_QUERY_KEY, (prev) =>
        prev ? { ...prev, avatar_url: result.avatar_url } : prev
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: settingsService.changePassword,
    onSuccess: () => {
      refetchProfile();
    },
  });

  const update2faMutation = useMutation({
    mutationFn: settingsService.update2fa,
    onSuccess: (res) => {
      queryClient.setQueryData(PROFILE_SETTINGS_KEY, (prev) =>
        prev ? { ...prev, two_factor_enabled: res.enabled } : prev
      );
    },
  });

  const revokeSessionsMutation = useMutation({
    mutationFn: settingsService.revokeOtherSessions,
    onSuccess: () => {
      refetchSessions();
    },
  });

  return {
    profile,
    sessionsData,
    isLoading: isProfileLoading || isSessionsLoading,
    isError: isProfileError,
    error: profileError,
    refetchProfile,
    refetchSessions,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    update2fa: update2faMutation.mutateAsync,
    revokeOtherSessions: revokeSessionsMutation.mutateAsync,
    isUpdatingAvatar: uploadAvatarMutation.isPending,
  };
}

export default useProfileSettings;

