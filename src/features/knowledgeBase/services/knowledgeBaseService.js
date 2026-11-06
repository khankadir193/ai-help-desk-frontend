/**
 * Knowledge Base service layer.
 *
 * DATA SOURCE DISCLOSURE: The backend (backend/src/app.js) has NO Knowledge
 * Base endpoints yet — the available v1 routes are auth, categories, tickets,
 * comments, ai and dashboard. To avoid inventing/faking endpoint calls, this
 * service resolves LOCAL seed data (data/kbSeedData.js) behind the exact same
 * async + normalized-response interface the other services expose.
 *
 * When real KB routes land (e.g. GET /kb/articles, GET /kb/articles/:slug),
 * switch these bodies to `apiClient.get(...)` and nothing else changes:
 * hooks, components and query keys are already wired against this interface.
 */
import { KB_ARTICLES, KB_CATEGORIES } from '../data/kbSeedData';

export const knowledgeBaseService = {
  /**
   * List KB categories (seed content — see disclosure above).
   * @returns {Promise<Array<Object>>}
   */
  listCategories: async () => {
    return KB_CATEGORIES.map((category) => ({ ...category }));
  },

  /**
   * List all KB articles (seed content — see disclosure above).
   * @returns {Promise<Array<Object>>}
   */
  listArticles: async () => {
    return KB_ARTICLES.map((article) => ({ ...article }));
  },

  /**
   * Get a single KB article by slug (seed content — see disclosure above).
   * Throws an "Article not found" error for unknown slugs so error states
   * and query retry behavior exercise the same paths a 404 would.
   * @param {string} slug
   * @returns {Promise<Object>}
   */
  getArticleBySlug: async (slug) => {
    const article = KB_ARTICLES.find((entry) => entry.slug === slug);
    if (!article) {
      const error = new Error(`Article not found: ${slug}`);
      error.statusCode = 404;
      throw error;
    }
    return { ...article };
  },
};

export default knowledgeBaseService;
