import { useQuery } from '@tanstack/react-query';
import knowledgeBaseService from '../services/knowledgeBaseService';

export const KNOWLEDGE_BASE_QUERY_KEYS = {
  all: ['knowledgeBase'],
  categories: () => [...KNOWLEDGE_BASE_QUERY_KEYS.all, 'categories'],
  articles: () => [...KNOWLEDGE_BASE_QUERY_KEYS.all, 'articles'],
  detail: (slug) => [...KNOWLEDGE_BASE_QUERY_KEYS.all, 'detail', String(slug)],
};

/**
 * Hook to fetch Knowledge Base categories.
 */
export function useKnowledgeBaseCategories() {
  return useQuery({
    queryKey: KNOWLEDGE_BASE_QUERY_KEYS.categories(),
    queryFn: () => knowledgeBaseService.listCategories(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch all Knowledge Base articles.
 */
export function useKnowledgeBaseArticles() {
  return useQuery({
    queryKey: KNOWLEDGE_BASE_QUERY_KEYS.articles(),
    queryFn: () => knowledgeBaseService.listArticles(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch a single Knowledge Base article by slug.
 * @param {string} slug - Article slug
 */
export function useKnowledgeBaseArticle(slug) {
  return useQuery({
    queryKey: KNOWLEDGE_BASE_QUERY_KEYS.detail(slug),
    queryFn: () => knowledgeBaseService.getArticleBySlug(slug),
    enabled: Boolean(slug),
  });
}
