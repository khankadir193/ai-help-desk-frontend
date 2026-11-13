import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../services/settingsService';

export const WORKSPACE_SETTINGS_KEY = ['settings', 'workspace'];

export function useGeneralSettings() {
  const queryClient = useQueryClient();

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: WORKSPACE_SETTINGS_KEY,
    queryFn: settingsService.getWorkspace,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateWorkspace,
    onSuccess: (updated) => {
      queryClient.setQueryData(WORKSPACE_SETTINGS_KEY, updated);
    },
  });

  return {
    workspace,
    isLoading,
    isError,
    error,
    refetch,
    updateWorkspace: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export default useGeneralSettings;

