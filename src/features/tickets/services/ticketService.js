import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const ALLOWED_STATUS_TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
  CLOSED: [],
};

export const ticketService = {
  /**
   * List tickets with full server-side query filters, cancellation support, and tab counts.
   */
  listTickets: async (params = {}, options = {}) => {
    const query = {};
    if (params.tab) query.tab = params.tab;
    if (params.q) query.q = params.q;
    if (params.status) query.status = params.status;
    if (params.priority) query.priority = params.priority;
    if (params.category_id) query.category_id = params.category_id;
    if (params.assigned_agent_id) query.assigned_agent_id = params.assigned_agent_id;
    if (params.agent_id) query.agent_id = params.agent_id;
    if (params.date_range) query.date_range = params.date_range;
    if (params.from) query.from = params.from;
    if (params.to) query.to = params.to;
    if (params.sort) query.sort = params.sort;
    if (params.order) query.order = params.order;
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);

    const response = await apiClient.get(API_ENDPOINTS.TICKETS.BASE, {
      params: query,
      signal: options.signal,
    });

    const data = response?.data ?? response;
    return {
      tickets: data?.tickets ?? [],
      pagination: data?.pagination ?? {
        page: 1,
        limit: 20,
        total_items: 0,
        total_pages: 0,
      },
      counts: data?.counts ?? {
        all: 0,
        mine: 0,
        unassigned: 0,
      },
    };
  },

  /**
   * Get single ticket by ID.
   */
  getTicketById: async (id, options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.BY_ID(id), {
      signal: options.signal,
    });
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Create a ticket.
   */
  createTicket: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.BASE, data);
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Update editable ticket fields.
   */
  updateTicket: async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.TICKETS.BY_ID(id), data);
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Update status.
   */
  updateTicketStatus: async (id, status) => {
    const response = await apiClient.patch(API_ENDPOINTS.TICKETS.STATUS(id), { status });
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Update assignment.
   */
  updateTicketAssignment: async (id, assignedAgentId) => {
    const payload = {
      assigned_agent_id: assignedAgentId === null || assignedAgentId === '' ? null : assignedAgentId,
    };
    const response = await apiClient.patch(API_ENDPOINTS.TICKETS.ASSIGNMENT(id), payload);
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Delete single ticket (Admin only).
   */
  deleteTicket: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.TICKETS.BY_ID(id));
    return response?.data ?? response;
  },

  /**
   * Bulk change status.
   */
  bulkUpdateStatus: async (ticketIds, status) => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.BULK_STATUS, {
      ticket_ids: ticketIds,
      status,
    });
    return response?.data ?? response;
  },

  /**
   * Bulk assign/unassign.
   */
  bulkUpdateAssignment: async (ticketIds, assignedAgentId) => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.BULK_ASSIGN, {
      ticket_ids: ticketIds,
      assigned_agent_id: assignedAgentId === null || assignedAgentId === '' ? null : assignedAgentId,
    });
    return response?.data ?? response;
  },

  /**
   * Bulk delete tickets (Admin only).
   */
  bulkDeleteTickets: async (ticketIds) => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.BULK_DELETE, {
      ticket_ids: ticketIds,
    });
    return response?.data ?? response;
  },

  /**
   * Export CSV file stream.
   */
  exportCsv: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.EXPORT, {
      params,
      responseType: 'text',
    });
    return response?.data ?? response;
  },

  /**
   * Search active customers for autocomplete.
   */
  searchCustomers: async (query) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.CUSTOMERS, {
      params: { q: query },
    });
    const data = response?.data ?? response;
    return data?.customers ?? [];
  },

  /**
   * Fetch active support agents with their open ticket counts.
   */
  getAgentsWithCounts: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.AGENTS_OPEN);
    const data = response?.data ?? response;
    return data?.agents ?? [];
  },

  /**
   * Fetch categories from backend.
   */
  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE);
    const data = response?.data ?? response;
    return data?.categories ?? [];
  },

  /**
   * List ticket comments thread.
   */
  listComments: async (ticketId) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.COMMENTS(ticketId));
    const data = response?.data ?? response;
    return data?.comments ?? [];
  },

  /**
   * Append a reply or internal note.
   */
  addComment: async (ticketId, { message, is_internal = false }) => {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.COMMENTS(ticketId), {
      message: (message || '').trim(),
      is_internal: Boolean(is_internal),
    });
    return response?.data?.comment ?? response?.comment ?? response;
  },

  /**
   * Get ticket audit history.
   */
  getTicketHistory: async (ticketId) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.HISTORY(ticketId));
    const data = response?.data ?? response;
    return data?.history ?? [];
  },

  /**
   * AI endpoints (dedicated 30s timeout as per rule)
   */
  classifyTicket: async (ticketId) => {
    const response = await apiClient.post(API_ENDPOINTS.AI.CLASSIFY(ticketId), null, {
      timeout: 30000,
    });
    return response?.data?.suggestion ?? response?.suggestion ?? response;
  },

  suggestPriority: async (ticketId) => {
    const response = await apiClient.post(API_ENDPOINTS.AI.PRIORITY(ticketId), null, {
      timeout: 30000,
    });
    return response?.data?.suggestion ?? response?.suggestion ?? response;
  },

  generateReplyDraft: async (ticketId) => {
    const response = await apiClient.post(API_ENDPOINTS.AI.REPLY_DRAFT(ticketId), null, {
      timeout: 30000,
    });
    return response?.data?.suggestion ?? response?.suggestion ?? response;
  },

  generateSummary: async (ticketId) => {
    const response = await apiClient.post(API_ENDPOINTS.AI.SUMMARY(ticketId), null, {
      timeout: 30000,
    });
    return response?.data?.suggestion ?? response?.suggestion ?? response;
  },
};

export default ticketService;
