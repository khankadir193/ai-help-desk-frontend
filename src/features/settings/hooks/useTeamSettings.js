import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../services/settingsService';

export const TEAM_SETTINGS_KEY = ['settings', 'team'];

export function useTeamSettings() {
  const queryClient = useQueryClient();

  const {
    data: team,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: TEAM_SETTINGS_KEY,
    queryFn: settingsService.getTeam,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateTeam,
    onSuccess: (updated) => {
      queryClient.setQueryData(TEAM_SETTINGS_KEY, updated);
    },
  });

  return {
    team,
    isLoading,
    isError,
    error,
    refetch,
    updateTeam: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export default useTeamSettings;

