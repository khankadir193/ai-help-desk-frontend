/**
 * Hook for submitting member invitations.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import teamService from '../services/teamService';

export function useInviteSubmit() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => teamService.createInvitation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'performance'] });
    },
  });

  return {
    submitInvitation: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export default useInviteSubmit;
