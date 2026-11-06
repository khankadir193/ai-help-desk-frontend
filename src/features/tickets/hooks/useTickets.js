import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketService from '../services/ticketService';

export const TICKET_QUERY_KEYS = {
  all: ['tickets'],
  lists: () => [...TICKET_QUERY_KEYS.all, 'list'],
  list: (filters = {}) => [...TICKET_QUERY_KEYS.lists(), filters],
  details: () => [...TICKET_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...TICKET_QUERY_KEYS.details(), String(id)],
  comments: () => [...TICKET_QUERY_KEYS.all, 'comments'],
  commentList: (id) => [...TICKET_QUERY_KEYS.comments(), String(id)],
  history: () => [...TICKET_QUERY_KEYS.all, 'history'],
  historyList: (id) => [...TICKET_QUERY_KEYS.history(), String(id)],
};

/**
 * Hook to fetch the role-scoped ticket list with backend filters/pagination.
 * Avoids unnecessary requests: results are cached per filter key and cached
 * data is kept while new queries load (placeholderData).
 *
 * @param {Object} filters - { status, priority, category_id, sort, order, page, limit }
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 */
export function useTickets(filters = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.list(filters),
    queryFn: () => ticketService.listTickets(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * Hook to fetch a single ticket
 * @param {string|number} id - Ticket ID
 */
export function useTicket(id) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.detail(id),
    queryFn: () => ticketService.getTicketById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a ticket (Customer only)
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      // New tickets change the dashboard totals and recent list
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook to update a ticket status (assigned Agent or Admin)
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => ticketService.updateTicketStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      // Dashboard aggregates include status counts
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (variables.id) {
        queryClient.setQueryData(TICKET_QUERY_KEYS.detail(variables.id), data);
        queryClient.invalidateQueries({
          queryKey: TICKET_QUERY_KEYS.historyList(variables.id),
        });
      }
    },
  });
}

/**
 * Hook to assign/reassign/unassign a ticket (Admin only)
 */
export function useUpdateTicketAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedAgentId }) =>
      ticketService.updateTicketAssignment(id, assignedAgentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      // Agent workload on the admin dashboard depends on assignments
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (variables.id) {
        queryClient.setQueryData(TICKET_QUERY_KEYS.detail(variables.id), data);
        queryClient.invalidateQueries({
          queryKey: TICKET_QUERY_KEYS.historyList(variables.id),
        });
      }
    },
  });
}

/**
 * Hook to fetch the comment thread of a ticket.
 * The backend scopes access and hides internal notes from CUSTOMER callers.
 * @param {string|number} id - Ticket ID
 */
export function useTicketComments(id) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.commentList(id),
    queryFn: () => ticketService.listComments(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch the audit-trail history of a ticket.
 * Backend allows only assigned AGENTs and ADMINs; a CUSTOMER caller
 * receives 403 ("Ticket history is only available to support staff.") and
 * this hook is consumed only from staff-visible surfaces.
 * @param {string|number} id - Ticket ID
 */
export function useTicketHistory(id) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.historyList(id),
    queryFn: () => ticketService.getTicketHistory(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to add a comment to a ticket (role rules enforced by the backend).
 * CUSTOMER: public comment only; submitting an internal note is a 403.
 * AGENT/ADMIN: public comment or internal note.
 * On success the comment thread is invalidated and refetched.
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message, isInternal }) =>
      ticketService.addComment(id, { message, is_internal: isInternal }),
    onSuccess: (data, variables) => {
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: TICKET_QUERY_KEYS.commentList(variables.id),
        });
      }
    },
  });
}

/**
 * Cache key family for AI classification results, deliberately OUTSIDE the
 * ['tickets'] family so ticket list/detail invalidations never touch it.
 * The backend exposes no GET endpoint for ai_suggestions (review endpoints
 * are not implemented yet), so the latest POST response is cached client-side
 * per ticket and simply survives navigation within the session.
 * @param {string|number} id - Ticket ID
 */
export const AI_CLASSIFICATION_KEY = (id) => ['ai-classification', String(id)];

/**
 * Hook to trigger AI ticket classification (AGENT assigned / ADMIN — the
 * backend is the source of truth and rejects everyone else).
 * Backend contract: POST /api/v1/tickets/:id/ai/classify with NO request
 * body → { status: "success", data: { suggestion } }, where the suggestion
 * is stored PENDING and the ticket is never modified automatically.
 * The returned suggestion is cached per ticket for the reviewable UI.
 */
export function useClassifyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => ticketService.classifyTicket(id),
    onSuccess: (suggestion, variables) => {
      if (variables?.id != null) {
        queryClient.setQueryData(AI_CLASSIFICATION_KEY(variables.id), suggestion);
      }
    },
  });
}

/**
 * Read-only subscription to the latest classification suggestion for a
 * ticket (written by useClassifyTicket). It never fetches — the backend has
 * no read endpoint for suggestions — so every refetch trigger is disabled.
 * @param {string|number} id - Ticket ID
 */
export function useAiClassification(id) {
  return useQuery({
    queryKey: AI_CLASSIFICATION_KEY(id),
    // Cache-only reader: the backend has no GET endpoint for suggestions, so
    // the query only surfaces what the classify mutation wrote. React Query
    // still requires a queryFn (even enabled:false) to avoid a console error.
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Cache key family for AI priority suggestions (same read/api.model as
 * classification — no GET endpoint exists, so the latest POST response is
 * cached per ticket outside the ['tickets'] family).
 * @param {string|number} id - Ticket ID
 */
export const AI_PRIORITY_KEY = (id) => ['ai-priority', String(id)];

/**
 * Hook to trigger an AI priority suggestion (AGENT assigned / ADMIN — the
 * backend is the source of truth and rejects everyone else). Backend
 * contract: POST /api/v1/tickets/:id/ai/priority with NO request body
 * → { status: "success", data: { suggestion } }, where the suggestion is
 * stored PENDING and the ticket priority is never modified automatically.
 */
export function useSuggestTicketPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => ticketService.suggestTicketPriority(id),
    onSuccess: (suggestion, variables) => {
      if (variables?.id != null) {
        queryClient.setQueryData(AI_PRIORITY_KEY(variables.id), suggestion);
      }
    },
  });
}

/**
 * Read-only subscription to the latest AI priority suggestion for a ticket
 * (written by useSuggestTicketPriority). Never fetches — the backend has
 * no read endpoint for suggestions.
 * @param {string|number} id - Ticket ID
 */
export function useAiPrioritySuggestion(id) {
  return useQuery({
    queryKey: AI_PRIORITY_KEY(id),
    queryFn: () => null, // cache-only reader (see useAiClassification)
    enabled: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Cache key family for AI reply drafts (same read model as the other AI
 * suggestions — no GET endpoint exists, so the latest POST response is
 * cached per ticket outside the ['tickets'] family).
 * @param {string|number} id - Ticket ID
 */
export const AI_REPLY_DRAFT_KEY = (id) => ['ai-reply-draft', String(id)];

/**
 * Hook to generate an AI customer-facing reply draft (AGENT assigned /
 * ADMIN — the backend is the source of truth and rejects everyone else).
 * Backend contract: POST /api/v1/tickets/:id/ai/reply-draft with NO request
 * body → { status: "success", data: { suggestion } }, stored PENDING with
 * result { draft }. The draft is generated ONLY and is never posted or
 * published automatically — promoting it is an explicit agent action.
 */
export function useGenerateReplyDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => ticketService.generateReplyDraft(id),
    onSuccess: (suggestion, variables) => {
      if (variables?.id != null) {
        queryClient.setQueryData(AI_REPLY_DRAFT_KEY(variables.id), suggestion);
      }
    },
  });
}

/**
 * Read-only subscription to the latest AI reply draft for a ticket (written
 * by useGenerateReplyDraft). Never fetches — the backend has no read
 * endpoint for suggestions.
 * @param {string|number} id - Ticket ID
 */
export function useAiReplyDraft(id) {
  return useQuery({
    queryKey: AI_REPLY_DRAFT_KEY(id),
    queryFn: () => null, // cache-only reader (see useAiClassification)
    enabled: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Cache key family for AI conversation summaries (same read model as the
 * other AI suggestions — no GET endpoint exists, so the latest POST response
 * is cached per ticket outside the ['tickets'] family).
 * @param {string|number} id - Ticket ID
 */
export const AI_SUMMARY_KEY = (id) => ['ai-summary', String(id)];

/**
 * Hook to generate an AI conversation summary (AGENT assigned / ADMIN — the
 * backend is the source of truth and rejects everyone else). Backend
 * contract: POST /api/v1/tickets/:id/ai/summary with NO request body
 * → { status: "success", data: { suggestion } }, stored PENDING with
 * result { mainIssue, details, troubleshootingDone, currentStatus, nextSteps,
 * ticketStatus }. The summary is informational only and never modifies the
 * ticket or comments.
 */
export function useGenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => ticketService.generateSummary(id),
    onSuccess: (suggestion, variables) => {
      if (variables?.id != null) {
        queryClient.setQueryData(AI_SUMMARY_KEY(variables.id), suggestion);
      }
    },
  });
}

/**
 * Read-only subscription to the latest AI conversation summary for a ticket
 * (written by useGenerateSummary). Never fetches — the backend has no read
 * endpoint for suggestions.
 * @param {string|number} id - Ticket ID
 */
export function useAiSummary(id) {
  return useQuery({
    queryKey: AI_SUMMARY_KEY(id),
    queryFn: () => null, // cache-only reader (see useAiClassification)
    enabled: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
