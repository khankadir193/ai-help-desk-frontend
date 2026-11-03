import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '../services/categoryService';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'],
  list: (filters = {}) => [...CATEGORY_QUERY_KEYS.lists(), filters],
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...CATEGORY_QUERY_KEYS.details(), String(id)],
};

/**
 * Hook to fetch list of categories
 * @param {Object} [options]
 * @param {boolean} [options.isActive] - Admin only: filter by active status
 * @param {boolean} [options.enabled=true] - Query enable toggle
 */
export function useCategories({ isActive, enabled = true } = {}) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list({ isActive }),
    queryFn: () => categoryService.listCategories({ isActive }),
    enabled,
    staleTime: 1000 * 60 * 3, // 3 minutes fresh
  });
}

/**
 * Hook to fetch single category by ID
 * @param {string|number} id - Category ID
 */
export function useCategory(id) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a category (Admin only)
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing category (Admin only)
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => categoryService.updateCategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      if (variables.id) {
        queryClient.setQueryData(CATEGORY_QUERY_KEYS.detail(variables.id), data);
      }
    },
  });
}

/**
 * Hook to activate or deactivate a category (Admin only)
 */
export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => categoryService.updateCategoryStatus(id, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      if (variables.id) {
        queryClient.setQueryData(CATEGORY_QUERY_KEYS.detail(variables.id), data);
      }
    },
  });
}

