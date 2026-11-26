import { useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getPermissionScope, hasPermission, canCreateTickets } from '../../../lib/accessControl';

/**
 * Hook to compute granular ticket permissions based on the active role and ticket state.
 */
export function useTicketPermissions(ticket) {
  const { role, user } = useAuth();
  const normalizedRole = String(role || '').toUpperCase();

  return useMemo(() => {
    const isAdmin = normalizedRole === 'ADMIN';
    const isAgent = normalizedRole === 'AGENT';
    const isCustomer = normalizedRole === 'CUSTOMER';
    const isStaff = isAdmin || isAgent;

    const isClosed = ticket?.status === 'CLOSED';
    const isOpen = ticket?.status === 'OPEN';

    const isAssignee =
      Boolean(ticket?.assigned_agent?.id && user?.id) &&
      String(ticket.assigned_agent.id) === String(user.id);
    const isOwner =
      Boolean(ticket?.customer?.id && user?.id) &&
      String(ticket.customer.id) === String(user.id);

    // Live matrix scopes
    const replyScope = getPermissionScope(user, 'reply_tickets');
    const statusScope = getPermissionScope(user, 'update_status');
    const historyScope = getPermissionScope(user, 'ticket_history');
    const aiScope = getPermissionScope(user, 'ai_tools');
    const internalNotesAllowed = isStaff && !isCustomer && hasPermission(user, 'internal_notes');
    const canAssignAllowed = isAdmin || hasPermission(user, 'assign_reassign_tickets');

    return {
      role: normalizedRole,
      isStaff,
      isAdmin,
      isAgent,
      isCustomer,

      // View & details access
      canCreate: canCreateTickets(user),
      canViewAi: isAdmin || (aiScope !== 'NONE' && (aiScope === 'ALL' || (aiScope === 'ASSIGNED' && isAssignee) || (aiScope === 'OWN' && isOwner))),
      canViewInternalNotes: internalNotesAllowed,
      canViewStaffFields: isStaff,
      canViewHistory: isAdmin || (historyScope !== 'NONE' && (historyScope === 'ALL' || (historyScope === 'ASSIGNED' && isAssignee) || (historyScope === 'OWN' && isOwner))),

      // Action permissions
      canReply: !isClosed && (isAdmin || (replyScope !== 'NONE' && (replyScope === 'ALL' || (replyScope === 'ASSIGNED' && isAssignee) || (replyScope === 'OWN' && isOwner)))),
      canPostInternalNote: internalNotesAllowed && !isClosed,
      canUpdateStatus: !isClosed && (isAdmin || (statusScope !== 'NONE' && (statusScope === 'ALL' || (statusScope === 'ASSIGNED' && isAssignee) || (statusScope === 'OWN' && isOwner)))),
      canAssign: !isClosed && canAssignAllowed && (isAdmin || isAssignee || !ticket?.assigned_agent),
      canAssignAnywhere: isAdmin || (canAssignAllowed && isAgent),
      canDelete: isAdmin,
      canExport: isStaff,

      // Edit permissions
      canEdit: !isClosed && (isAdmin || (isAgent && isAssignee) || (isCustomer && isOwner && isOpen)),
      canEditCustomerFields: !isCustomer,
    };
  }, [normalizedRole, user, ticket]);
}
