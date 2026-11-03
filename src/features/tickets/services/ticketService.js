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
 *  - POST   /:id/ai/classify (AGENT assigned | ADMIN) AI category suggestion,
 *           no request body; stored backend-side with status PENDING; the
 *           result is advisory only and never modifies the ticket
 *  - POST   /:id/ai/priority (AGENT assigned | ADMIN) AI priority suggestion,
 *           same contract as classify; ticket priority never auto-updated
 *  - POST   /:id/ai/reply-draft (AGENT assigned | ADMIN) AI reply draft,
 *           generated ONLY; never posted automatically
 *  - POST   /:id/ai/summary (AGENT assigned | ADMIN) AI conversation summary,
 *           generated ONLY; informational for staff, never modifies anything
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

  /**
   * Request an AI category suggestion for a ticket.
   *
   * Backend contract (ai.routes.js / ai.controller.js — the source of truth):
   *   POST /api/v1/tickets/:id/ai/classify
   *   - No request body: ticket content, active categories and the requesting
   *     user are all resolved server-side.
   *   - Roles: AGENT (must be the assigned agent) or ADMIN; enforced by the
   *     backend, ownership is re-scoped in the AI service.
   *   - 200 { status: "success", data: { suggestion } } where suggestion is
   *     stored with status PENDING and result:
   *       { suggestedCategory, suggestedCategoryId, confidence (0-1), reason }
   *   - Errors are { status: "error", message } (403/404/429/502/503/504…).
   *   - Advisory only: the suggestion is stored in ai_suggestions as PENDING
   *     and the ticket is never modified automatically. There is no GET
   *     endpoint for suggestions (review endpoints are not implemented yet).
   *
   * A dedicated 30s timeout is used for this call because the backend's own
   * AI provider timeout defaults to 15s (GROQ_TIMEOUT_MS); the shared 15s
   * Axios timeout could otherwise abort the request just as the backend
   * finishes storing the pending suggestion.
   *
   * @param {string|number} id
   * @returns {Promise<Object>} suggestion object (suggestion_type CLASSIFICATION)
   */
  classifyTicket: async (id) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.CLASSIFY(id),
      undefined,
      { timeout: 30000 },
    );
    return response?.data?.suggestion ?? response?.suggestion ?? null;
  },

  /**
   * Request an AI priority suggestion for a ticket.
   *
   * Backend contract (ai.routes.js / ai.controller.js — the source of truth):
   *   POST /api/v1/tickets/:id/ai/priority
   *   - No request body: ticket content and the requesting user are resolved
   *     server-side (same middleware chain as classification: AI rate limit,
   *     authorize AGENT/ADMIN, validate ticket id).
   *   - 422 if the ticket title or description is blank on the server.
   *   - 200 { status: "success", data: { suggestion } } where suggestion is
   *     stored with status PENDING and result:
   *       { suggestedPriority ('LOW'|'MEDIUM'|'HIGH'|'URGENT', normalized
   *        uppercase), currentPriority, confidence (0-1), reason }
   *   - Errors are { status: "error", message } (403/404/422/429/502/503/504…).
   *   - Advisory only: the ticket's actual priority is never modified
   *     automatically; there is no GET endpoint for suggestions.
   *
   * Same dedicated 30s timeout as classifyTicket (backend AI provider
   * timeout defaults to 15s).
   *
   * @param {string|number} id
   * @returns {Promise<Object>} suggestion object (suggestion_type PRIORITY)
   */
  suggestTicketPriority: async (id) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.PRIORITY(id),
      undefined,
      { timeout: 30000 },
    );
    return response?.data?.suggestion ?? response?.suggestion ?? null;
  },

  /**
   * Generate an AI customer-facing reply draft for a ticket.
   *
   * Backend contract (ai.routes.js / ai.controller.js — the source of truth):
   *   POST /api/v1/tickets/:id/ai/reply-draft
   *   - No request body: ticket content, the customer-visible comment thread
   *     (internal notes never leave the server) and the requesting user are
   *     resolved server-side; same middleware chain as the other AI actions.
   *   - 422 if the ticket title or description is blank on the server.
   *   - 200 { status: "success", data: { suggestion } } where suggestion is
   *     stored with status PENDING, suggestion_type REPLY_DRAFT and result:
   *       { draft } — a trimmed, non-empty plain-text reply (≤4000 chars).
   *   - Errors are { status: "error", message } (403/404/422/429/502/503/504…).
   *   - Generated ONLY: the draft is never posted, sent, or converted into a
   *     comment automatically, and nothing on the ticket is ever changed.
   *     Posting is an explicit agent action through the comment composer.
   *
   * Same dedicated 30s timeout as the other AI calls (backend AI provider
   * timeout defaults to 15s).
   *
   * @param {string|number} id
   * @returns {Promise<Object>} suggestion object (suggestion_type REPLY_DRAFT)
   */
  generateReplyDraft: async (id) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.REPLY_DRAFT(id),
      undefined,
      { timeout: 30000 },
    );
    return response?.data?.suggestion ?? response?.suggestion ?? null;
  },

  /**
   * Generate an internal AI conversation summary for a ticket.
   *
   * Backend contract (ai.routes.js / ai.controller.js — the source of truth):
   *   POST /api/v1/tickets/:id/ai/summary
   *   - No request body: ticket content, the customer-visible comment thread
   *     (internal notes never leave the server) and the requesting user are
   *     resolved server-side; same middleware chain as the other AI actions.
   *   - 422 if the ticket title or description is blank on the server.
   *   - 200 { status: "success", data: { suggestion } } where suggestion is
   *     stored with status PENDING, suggestion_type SUMMARY and result:
   *       { mainIssue, details: [], troubleshootingDone: [],
   *         currentStatus, nextSteps: [], ticketStatus }
   *     (ticketStatus is the ticket's actual status at request time — a
   *     server-side fact, not AI output.)
   *   - Errors are { status: "error", message } (403/404/422/429/502/503/504…).
   *   - Generated ONLY: the summary never modifies the ticket (status,
   *     priority, category, assignment) and creates no comment.
   *
   * Same dedicated 30s timeout as the other AI calls (backend AI provider
   * timeout defaults to 15s).
   *
   * @param {string|number} id
   * @returns {Promise<Object>} suggestion object (suggestion_type SUMMARY)
   */
  generateSummary: async (id) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI.SUMMARY(id),
      undefined,
      { timeout: 30000 },
    );
    return response?.data?.suggestion ?? response?.suggestion ?? null;
  },
};

export default ticketService;
