import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notificationService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNotificationSettings } from '../../settings/hooks/useNotificationSettings';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: notificationPreferences } = useNotificationSettings();
  const inAppEnabled = notificationPreferences?.channels?.in_app !== false;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user && inAppEnabled,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY);

      if (previous?.notifications) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, {
          ...previous,
          notifications: previous.notifications.map((item) =>
            String(item.id) === String(id)
              ? { ...item, is_read: true, unread: false }
              : item
          ),
          unread_count: Math.max(0, (previous.unread_count ?? 1) - 1),
        });
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY);

      if (previous?.notifications) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, {
          ...previous,
          notifications: previous.notifications.map((item) => ({
            ...item,
            is_read: true,
            unread: false,
          })),
          unread_count: 0,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  const notifications = inAppEnabled ? (data?.notifications ?? []) : [];
  const unreadCount = inAppEnabled
    ? (data?.unread_count ?? notifications.filter((n) => !n.is_read && n.unread !== false).length)
    : 0;

  return {
    notifications,
    unreadCount,
    isLoading: isLoading && !data,
    isFetching,
    isError,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllRead: markAllAsReadMutation.isPending,
  };
}

export default useNotifications;
