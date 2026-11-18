/**
 * Hook for fetching team workspace teams.
 */
import { useQuery } from '@tanstack/react-query';
import teamService from '../services/teamService';

export function useTeams({ enabled = true } = {}) {
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
    // The backend restricts GET /team/teams to AGENT/ADMIN; callers
    // gate the query with their own role check so unauthorized pages never
    // fire a forbidden request (same convention as useAgents).
    enabled,
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
