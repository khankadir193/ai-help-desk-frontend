/**
 * Hook for managing workspace members and pending invitations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teamService from '../services/teamService';

export function useTeamMembers() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team', 'members'],
    queryFn: teamService.listMembers,
    staleTime: 1000 * 60 * 3,
  });

  const members = data?.members || [];
  const invitations = data?.invitations || [];
  const meta = data?.meta || { total_members: members.length, pending_invitations: invitations.length };

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: (id) => teamService.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });

  // Revoke invitation mutation
  const revokeMutation = useMutation({
    mutationFn: (id) => teamService.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });

  return {
    members,
    invitations,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    resendInvite: resendMutation.mutateAsync,
    isResending: resendMutation.isPending,
    revokeInvite: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
  };
}

export default useTeamMembers;
