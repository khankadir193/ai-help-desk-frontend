/**
 * Hook for Roles & Permissions matrix, dirty state tracking, and update mutations.
 */
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teamService from '../services/teamService';

export function useRolesMatrix() {
  const queryClient = useQueryClient();

  // Fetch roles and permissions from backend
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team', 'roles'],
    queryFn: teamService.getRoles,
    staleTime: 1000 * 60 * 5,
  });

  const roles = useMemo(() => data?.roles || [], [data?.roles]);
  const serverPermissions = useMemo(() => data?.permissions || [], [data?.permissions]);
  const canEdit = Boolean(data?.can_edit);
  const adminContact = data?.admin_contact || { name: 'Alex Morgan', email: 'alex.morgan@example.com' };
  const currentUserRole = data?.current_user_role || 'AGENT';

  // Local overrides map: { [permId]: { [roleId]: newValue } }
  const [overrides, setOverrides] = useState({});

  // Compute effective draft permissions
  const permissions = useMemo(() => {
    return serverPermissions.map((perm) => {
      const permOverrides = overrides[perm.id];
      if (!permOverrides) return perm;
      return {
        ...perm,
        values: {
          ...perm.values,
          ...permOverrides,
        },
      };
    });
  }, [serverPermissions, overrides]);

  // Track modified permissions
  const modifiedPermissions = useMemo(() => {
    if (Object.keys(overrides).length === 0) return [];
    const changed = [];
    for (const draft of permissions) {
      const orig = serverPermissions.find((p) => p.id === draft.id);
      if (!orig) continue;
      const isAdminChanged = draft.values.ADMIN !== orig.values.ADMIN;
      const isManagerChanged = draft.values.MANAGER !== orig.values.MANAGER;
      const isAgentChanged = draft.values.AGENT !== orig.values.AGENT;
      if (isAdminChanged || isManagerChanged || isAgentChanged) {
        changed.push({
          id: draft.id,
          name: draft.name,
          values: { ...draft.values },
          oldValues: { ...orig.values },
        });
      }
    }
    return changed;
  }, [permissions, serverPermissions, overrides]);

  const isDirty = modifiedPermissions.length > 0;

  // Change a single permission cell
  const handleCellChange = useCallback((permId, roleId, newValue) => {
    setOverrides((prev) => ({
      ...prev,
      [permId]: {
        ...(prev[permId] || {}),
        [roleId]: newValue,
      },
    }));
  }, []);

  // Reset changes
  const handleReset = useCallback(() => {
    setOverrides({});
  }, []);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (updatedList) => teamService.patchRoles(updatedList),
    onSuccess: (updatedData) => {
      setOverrides({});
      queryClient.setQueryData(['team', 'roles'], updatedData);
      queryClient.invalidateQueries({ queryKey: ['team', 'roles'] });
    },
  });

  // Request access change mutation
  const requestMutation = useMutation({
    mutationFn: teamService.requestRoleChange,
  });

  const savePermissions = useCallback(async () => {
    return await saveMutation.mutateAsync(permissions);
  }, [saveMutation, permissions]);

  const requestRoleChange = useCallback(async (reason, requestedRole) => {
    return await requestMutation.mutateAsync({ reason, requested_role: requestedRole });
  }, [requestMutation]);

  return {
    roles,
    permissions,
    originalPermissions: serverPermissions,
    canEdit,
    currentUserRole,
    adminContact,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isDirty,
    modifiedPermissions,
    handleCellChange,
    handleReset,
    savePermissions,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    requestRoleChange,
    isRequesting: requestMutation.isPending,
  };
}

export default useRolesMatrix;
