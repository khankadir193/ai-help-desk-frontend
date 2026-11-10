import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import kbService from '../services/kbService';
import { KB_KEYS } from './useKbOverview';

export function useKbCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: KB_KEYS.categories(),
    queryFn: () => kbService.listCategories(),
    staleTime: 60 * 1000,
  });

  const authorsQuery = useQuery({
    queryKey: KB_KEYS.authors(),
    queryFn: () => kbService.listAuthors(),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => kbService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.categories() });
      queryClient.invalidateQueries({ queryKey: KB_KEYS.overview() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => kbService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.categories() });
      queryClient.invalidateQueries({ queryKey: KB_KEYS.overview() });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds) => kbService.reorderCategories(orderedIds),
    onMutate: async (orderedIds) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: KB_KEYS.categories() });
      const previous = queryClient.getQueryData(KB_KEYS.categories());

      if (previous?.categories) {
        // Optimistically sort
        const idMap = new Map(orderedIds.map((id, idx) => [Number(id), idx + 1]));
        const sorted = [...previous.categories].sort((a, b) => {
          const orderA = idMap.get(Number(a.id)) ?? a.display_order;
          const orderB = idMap.get(Number(b.id)) ?? b.display_order;
          return orderA - orderB;
        });
        queryClient.setQueryData(KB_KEYS.categories(), {
          ...previous,
          categories: sorted,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(KB_KEYS.categories(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.categories() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => kbService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KB_KEYS.categories() });
      queryClient.invalidateQueries({ queryKey: KB_KEYS.overview() });
    },
  });

  return {
    categories: categoriesQuery.data?.categories || [],
    uncategorizedCount: categoriesQuery.data?.uncategorizedCount || 0,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
    authors: authorsQuery.data || [],
    isLoadingAuthors: authorsQuery.isLoading,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    reorderCategories: reorderMutation.mutate,
    isReordering: reorderMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

export default useKbCategories;

