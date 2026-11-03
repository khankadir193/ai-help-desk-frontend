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
