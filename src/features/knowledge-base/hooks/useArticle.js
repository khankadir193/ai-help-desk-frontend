import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import kbService from '../services/kbService';
import { KB_KEYS } from './useKbOverview';

export function useArticle(idOrSlug) {
  const queryClient = useQueryClient();

  const articleQuery = useQuery({
    queryKey: KB_KEYS.article(idOrSlug),
    queryFn: () => kbService.getArticle(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 60 * 1000,
  });

  const relatedQuery = useQuery({
    queryKey: KB_KEYS.related(idOrSlug),
    queryFn: () => kbService.getRelatedArticles(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 60 * 1000,
  });

  const voteMutation = useMutation({
    mutationFn: (helpful) => kbService.voteFeedback(idOrSlug, helpful),
    onSuccess: (updatedArticle) => {
      queryClient.setQueryData(KB_KEYS.article(idOrSlug), updatedArticle);
      queryClient.invalidateQueries({ queryKey: KB_KEYS.overview() });
    },
  });

  return {
    article: articleQuery.data,
    isLoading: articleQuery.isLoading,
    isError: articleQuery.isError,
    error: articleQuery.error,
    refetch: articleQuery.refetch,
    relatedArticles: relatedQuery.data || [],
    isLoadingRelated: relatedQuery.isLoading,
    voteHelpful: (helpful) => voteMutation.mutate(helpful),
    isVoting: voteMutation.isPending,
  };
}

export default useArticle;

