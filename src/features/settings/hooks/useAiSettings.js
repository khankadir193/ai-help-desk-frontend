import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../services/settingsService';

export const AI_SETTINGS_KEY = ['settings', 'ai'];

export function useAiSettings() {
  const queryClient = useQueryClient();

  const {
    data: aiData,
    isLoading: isAiLoading,
    isError: isAiError,
    error: aiError,
    refetch: refetchAi,
  } = useQuery({
    queryKey: AI_SETTINGS_KEY,
    queryFn: settingsService.getAi,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateAi,
    onSuccess: (updated) => {
      queryClient.setQueryData(AI_SETTINGS_KEY, updated);
    },
  });

  return {
    aiData,
    isLoading: isAiLoading,
    isError: isAiError,
    error: aiError,
    refetchAi,
    updateAi: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Preview of the suggested reply for a given tone. Runs only while AI is
 * enabled and re-queries whenever the selected tone changes (e.g. editing the
 * form before saving). The request is aborted by React Query via the signal
 * when the tone changes again or the page unmounts.
 */
export function useAiPreview(tone, enabled = true) {
  const selectedTone = tone || 'FRIENDLY_PROFESSIONAL';

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    refetch: refetchPreview,
  } = useQuery({
    queryKey: ['settings', 'ai', 'preview', selectedTone],
    queryFn: ({ signal }) => settingsService.getAiPreview(selectedTone, signal),
    staleTime: 1000 * 60 * 10,
    enabled: Boolean(enabled),
  });

  return {
    previewData,
    isPreviewLoading,
    refetchPreview,
  };
}

export default useAiSettings;
