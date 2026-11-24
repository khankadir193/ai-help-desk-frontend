import { useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

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

    return {
      role: normalizedRole,
      isStaff,
      isAdmin,
      isAgent,
      isCustomer,

      // View & details access
      canViewAi: isStaff,
      canViewInternalNotes: isStaff,
      canViewStaffFields: isStaff,
      canViewHistory: isStaff,

      // Action permissions
      canReply: isStaff || (isCustomer && isOwner && !isClosed),
      canPostInternalNote: isStaff && !isClosed,
      canUpdateStatus: (isAdmin || (isAgent && isAssignee)) && !isClosed,
      canAssign: isAdmin || (isAgent && (!ticket?.assigned_agent || isAssignee)),
      canAssignAnywhere: isAdmin,
      canDelete: isAdmin,
      canExport: isStaff,

      // Edit permissions
      canEdit: !isClosed && (isAdmin || (isAgent && isAssignee) || (isCustomer && isOwner && isOpen)),
      canEditCustomerFields: !isCustomer,
    };
  }, [normalizedRole, user?.id, ticket]);
}
