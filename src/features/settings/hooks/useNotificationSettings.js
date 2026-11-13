import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../services/settingsService';

export const NOTIFICATION_SETTINGS_KEY = ['settings', 'notifications'];

export function useNotificationSettings() {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: NOTIFICATION_SETTINGS_KEY,
    queryFn: settingsService.getNotifications,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateNotifications,
    onSuccess: (updated) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_KEY, updated);
    },
  });

  return {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    updateNotifications: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export default useNotificationSettings;

