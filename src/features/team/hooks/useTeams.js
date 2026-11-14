/**
 * Hook for fetching team workspace teams.
 */
import { useQuery } from '@tanstack/react-query';
import teamService from '../services/teamService';

export function useTeams() {
  const {
    data: teams = [
      'General support',
      'Customer Support',
      'Technical Support',
      'Billing & Account',
      'VIP Triage',
    ],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['team', 'teams'],
    queryFn: teamService.getTeams,
    staleTime: 1000 * 60 * 15,
  });

  return {
    teams,
    isLoading,
    isError,
    error,
  };
}

export default useTeams;
