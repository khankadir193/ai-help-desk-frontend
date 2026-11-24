import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketService from '../services/ticketService';

export const TICKET_QUERY_KEYS = {
  all: ['tickets'],
  lists: () => [...TICKET_QUERY_KEYS.all, 'list'],
  list: (filters = {}) => [...TICKET_QUERY_KEYS.lists(), filters],
  counts: () => [...TICKET_QUERY_KEYS.all, 'counts'],
  details: () => [...TICKET_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...TICKET_QUERY_KEYS.details(), String(id)],
  comments: () => [...TICKET_QUERY_KEYS.all, 'comments'],
  commentList: (id) => [...TICKET_QUERY_KEYS.comments(), String(id)],
  history: () => [...TICKET_QUERY_KEYS.all, 'history'],
  historyList: (id) => [...TICKET_QUERY_KEYS.history(), String(id)],
  agents: () => [...TICKET_QUERY_KEYS.all, 'agents-open'],
  categories: () => [...TICKET_QUERY_KEYS.all, 'categories'],
};

/**
 * Hook to fetch categories.
 */
export function useCategories({ enabled = true } = {}) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.categories(),
    queryFn: () => ticketService.getCategories(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch tickets with backend filters, abort signal cancellation, and cache placeholder.
 */
export function useTickets(filters = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.list(filters),
    queryFn: ({ signal }) => ticketService.listTickets(filters, { signal }),
    enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * Hook to fetch a single ticket.
 */
export function useTicket(id) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.detail(id),
    queryFn: ({ signal }) => ticketService.getTicketById(id, { signal }),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch active agents with open ticket counts.
 */
export function useAgentsWithCounts({ enabled = true } = {}) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.agents(),
    queryFn: () => ticketService.getAgentsWithCounts(),
    enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to create a ticket.
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.agents() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook to update ticket details.
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => ticketService.updateTicket(id, data),
    onSuccess: (updatedTicket, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      if (variables.id) {
        queryClient.setQueryData(TICKET_QUERY_KEYS.detail(variables.id), updatedTicket);
        queryClient.invalidateQueries({
          queryKey: TICKET_QUERY_KEYS.historyList(variables.id),
        });
      }
    },
  });
}

/**
 * Hook to update status.
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => ticketService.updateTicketStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
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
 * Hook to update ticket assignment.
 */
export function useUpdateTicketAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedAgentId }) =>
      ticketService.updateTicketAssignment(id, assignedAgentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.agents() });
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
 * Hook to delete a single ticket (Admin only).
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => ticketService.deleteTicket(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.agents() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.removeQueries({ queryKey: TICKET_QUERY_KEYS.detail(id) });
    },
  });
}

/**
 * Hook to bulk change status.
 */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketIds, status }) =>
      ticketService.bulkUpdateStatus(ticketIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook to bulk assign.
 */
export function useBulkUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketIds, assignedAgentId }) =>
      ticketService.bulkUpdateAssignment(ticketIds, assignedAgentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.agents() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook to bulk delete (Admin only).
 */
export function useBulkDeleteTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketIds) => ticketService.bulkDeleteTickets(ticketIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.agents() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook to list comments.
 */
export function useTicketComments(id) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.commentList(id),
    queryFn: () => ticketService.listComments(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to post reply or internal note.
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message, is_internal }) =>
      ticketService.addComment(ticketId, { message, is_internal }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TICKET_QUERY_KEYS.commentList(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: TICKET_QUERY_KEYS.detail(variables.ticketId),
      });
    },
  });
}

/**
 * Hook to get ticket history.
 */
export function useTicketHistory(id) {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.historyList(id),
    queryFn: () => ticketService.getTicketHistory(id),
    enabled: Boolean(id),
  });
}

export const AI_CLASSIFICATION_KEY = (id) => ['tickets', String(id), 'ai', 'classification'];
export const AI_PRIORITY_KEY = (id) => ['tickets', String(id), 'ai', 'priority'];
export const AI_REPLY_DRAFT_KEY = (id) => ['tickets', String(id), 'ai', 'reply-draft'];
export const AI_SUMMARY_KEY = (id) => ['tickets', String(id), 'ai', 'summary'];

export function useAiClassification(id) {
  return useQuery({
    queryKey: AI_CLASSIFICATION_KEY(id),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
}

export function useAiPrioritySuggestion(id) {
  return useQuery({
    queryKey: AI_PRIORITY_KEY(id),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
}

export function useAiReplyDraft(id) {
  return useQuery({
    queryKey: AI_REPLY_DRAFT_KEY(id),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
}

export function useAiSummary(id) {
  return useQuery({
    queryKey: AI_SUMMARY_KEY(id),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
}

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

export function useSuggestTicketPriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => ticketService.suggestPriority(id),
    onSuccess: (suggestion, variables) => {
      if (variables?.id != null) {
        queryClient.setQueryData(AI_PRIORITY_KEY(variables.id), suggestion);
      }
    },
  });
}

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

