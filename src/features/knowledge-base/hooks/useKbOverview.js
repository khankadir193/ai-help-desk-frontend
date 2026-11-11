import { useQuery } from '@tanstack/react-query';
import kbService from '../services/kbService';

export const KB_KEYS = {
  all: ['kb'],
  overview: () => [...KB_KEYS.all, 'overview'],
  articles: (filters) => [...KB_KEYS.all, 'articles', filters],
  article: (id) => [...KB_KEYS.all, 'article', String(id)],
  related: (id) => [...KB_KEYS.all, 'related', String(id)],
  categories: () => [...KB_KEYS.all, 'categories'],
  authors: () => [...KB_KEYS.all, 'authors'],
};

export function useKbOverview() {
  return useQuery({
    queryKey: KB_KEYS.overview(),
    queryFn: ({ signal }) => kbService.getOverview({ signal }),
    staleTime: 60 * 1000,
  });
}

export default useKbOverview;

