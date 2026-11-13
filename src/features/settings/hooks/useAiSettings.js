import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../services/settingsService';

export const AI_SETTINGS_KEY = ['settings', 'ai'];

export function useAiSettings(currentTone) {
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

  const selectedTone = currentTone || aiData?.default_tone || 'FRIENDLY_PROFESSIONAL';

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    refetch: refetchPreview,
  } = useQuery({
    queryKey: ['settings', 'ai', 'preview', selectedTone],
    queryFn: () => settingsService.getAiPreview(selectedTone),
    staleTime: 1000 * 60 * 10,
    enabled: Boolean(aiData?.ai_enabled !== false),
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateAi,
    onSuccess: (updated) => {
      queryClient.setQueryData(AI_SETTINGS_KEY, updated);
    },
  });

  return {
    aiData,
    previewData,
    isLoading: isAiLoading,
    isPreviewLoading,
    isError: isAiError,
    error: aiError,
    refetchAi,
    refetchPreview,
    updateAi: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export default useAiSettings;

