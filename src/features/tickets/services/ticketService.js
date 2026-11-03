import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Ticket API Service
 * Handles communication with /api/v1/tickets
 *
 * Backend contract:
 *  - POST   /            (CUSTOMER only) 201 { status, data: { ticket } }
 *  - GET    /            role-scoped list; returns { status, data: { tickets, pagination } }
 *  - GET    /:id         role-scoped detail; 403 if not owner/assignee/admin
 *  - GET    /:id/comments  comment thread (internal notes hidden for CUSTOMER)
 *  - POST   /:id/comments  append comment; is_internal=true is 403 for CUSTOMER
 *  - PATCH  /:id/status  (AGENT assigned | ADMIN) { status }
 *  - PATCH  /:id/assignment (ADMIN) { assigned_agent_id } | { assigned_agent_id: null }
 *  - GET    /:id/history  (AGENT assigned | ADMIN) audit trail, newest first
 */
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/** Mirror of the backend transition matrix, used only to pre-fill valid UI choices. */
export const ALLOWED_STATUS_TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
  CLOSED: [],
};

export const ticketService = {
  /**
   * List tickets scoped by role (customer: own, agent: assigned, admin: all)
   *
   * Supported backend query params:
   *  - status, priority, category_id  (all roles)
   *  - assigned_agent_id              (admin only)
   *  - sort ("created_at" | "updated_at"), order ("asc" | "desc")
   *  - page (>=1), limit (1-100)
   *
   * @param {Object} [params]
   * @returns {Promise<{ tickets: Array<Object>, pagination: Object }>}
   */
  listTickets: async (params = {}) => {
    const query = {};
    if (params.status) query.status = params.status;
    if (params.priority) query.priority = params.priority;
    if (params.category_id) query.category_id = params.category_id;
    if (params.assigned_agent_id) query.assigned_agent_id = params.assigned_agent_id;
    if (params.sort) query.sort = params.sort;
    if (params.order) query.order = params.order;
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);

    const response = await apiClient.get(API_ENDPOINTS.TICKETS.BASE, { params: query });
    return {
      tickets: response?.data?.tickets ?? response?.tickets ?? [],
      pagination:
        response?.data?.pagination ?? response?.pagination ?? {
          page: 1,
          limit: 20,
          total_items: 0,
          total_pages: 0,
        },
    };
  },

  /**
   * Get one ticket (ownership scoped by the backend)
   * @param {string|number} id
   * @returns {Promise<Object>} ticket object
   */
  getTicketById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.BY_ID(id));
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Create a ticket (CUSTOMER only)
   * Validation follows the backend rules: title required (max 200),
   * description required, optional active category_id, priority enum.
   *
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.description
   * @param {string|number|null} [data.category_id]
   * @param {string} [data.priority]
   * @returns {Promise<Object>} created ticket
   */
  createTicket: async ({ title, description, category_id, priority }) => {
    const payload = {
      title: (title || '').trim(),
      description: (description || '').trim(),
    };
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      payload.category_id = category_id;
    }
    if (priority) {
      payload.priority = priority;
    }

    const response = await apiClient.post(API_ENDPOINTS.TICKETS.BASE, payload);
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Update ticket status (assigned AGENT or ADMIN only)
   * The backend validates transitions; CLOSED is terminal.
   *
   * @param {string|number} id
   * @param {string} status - "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
   * @returns {Promise<Object>} updated ticket
   */
  updateTicketStatus: async (id, status) => {
    const response = await apiClient.patch(API_ENDPOINTS.TICKETS.STATUS(id), {
      status,
    });
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * Assign, reassign or unassign a ticket (ADMIN only)
   * Passing null unassigns; target must be an active AGENT (backend-validated).
   *
   * @param {string|number} id
   * @param {string|number|null} assignedAgentId - agent user ID or null to unassign
   * @returns {Promise<Object>} updated ticket
   */
  updateTicketAssignment: async (id, assignedAgentId) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.TICKETS.ASSIGNMENT(id),
      { assigned_agent_id: assignedAgentId === null ? null : assignedAgentId }
    );
    return response?.data?.ticket ?? response?.ticket ?? response;
  },

  /**
   * List the comment thread of a ticket (ownership scoped by the backend).
   * CUSTOMER callers receive public comments only — internal notes are
   * filtered out server-side and never reach the client.
   *
   * @param {string|number} id
   * @returns {Promise<Array<Object>>} comments, oldest first
   */
  listComments: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.COMMENTS(id));
    return response?.data?.comments ?? response?.comments ?? [];
  },

  /**
   * List the audit-trail history of a ticket (AGENT assigned | ADMIN).
   * The backend returns entries newest first, each shaped as:
   *   { id, action, field_name, old_value, new_value,
   *     changed_by: { id, name } | null, created_at }
   * CUSTOMER callers are rejected server-side (403) and never see history.
   *
   * @param {string|number} id
   * @returns {Promise<Array<Object>>} history entries, newest first
   */
  getTicketHistory: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.HISTORY(id));
    return response?.data?.history ?? response?.history ?? [];
  },

  /**
   * Append a comment to a ticket (role-scoped by the backend).
   * The author is always the authenticated session user; submitting
   * is_internal as a CUSTOMER is rejected by the backend (403).
   * Validation mirrors the backend: message required, trimmed, non-empty.
   *
   * @param {string|number} id
   * @param {Object} data
   * @param {string} data.message
   * @param {boolean} [data.is_internal=false] - AGENT/ADMIN only
   * @returns {Promise<Object>} created comment
   */
  addComment: async (id, { message, is_internal }) => {
    const payload = {
      message: (message || '').trim(),
      is_internal: is_internal === true,
    };

    const response = await apiClient.post(API_ENDPOINTS.TICKETS.COMMENTS(id), payload);
    return response?.data?.comment ?? response?.comment ?? response;
  },
};

export default ticketService;
