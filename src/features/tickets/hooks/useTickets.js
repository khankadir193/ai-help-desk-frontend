import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketService from '../services/ticketService';

export const TICKET_QUERY_KEYS = {
  all: ['tickets'],
  lists: () => [...TICKET_QUERY_KEYS.all, 'list'],
  list: (filters = {}) => [...TICKET_QUERY_KEYS.lists(), filters],
  details: () => [...TICKET_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...TICKET_QUERY_KEYS.details(), String(id)],
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
      if (variables.id) {
        queryClient.setQueryData(TICKET_QUERY_KEYS.detail(variables.id), data);
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
      if (variables.id) {
        queryClient.setQueryData(TICKET_QUERY_KEYS.detail(variables.id), data);
      }
    },
  });
}
