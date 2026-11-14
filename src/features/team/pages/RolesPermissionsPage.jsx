import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useRolesMatrix from '../hooks/useRolesMatrix';
import ReadOnlyBanner from '../components/ReadOnlyBanner/ReadOnlyBanner';
import RolesMatrix from '../components/RolesMatrix/RolesMatrix';
import ProtectWorkspaceCard from '../components/ProtectWorkspaceCard/ProtectWorkspaceCard';
import RequestAccessDialog from '../components/RequestAccessDialog/RequestAccessDialog';
import Modal from '../../../components/ui/Modal/Modal';
import './RolesPermissionsPage.css';

export default function RolesPermissionsPage() {
  const { setHeaderProps } = useOutletContext();
  const navigate = useNavigate();

  const {
    roles,
    permissions,
    canEdit,
    currentUserRole,
    adminContact,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    modifiedPermissions,
    handleCellChange,
    savePermissions,
    isSaving,
    requestRoleChange,
    isRequesting,
  } = useRolesMatrix();

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Set shared header
  useEffect(() => {
    setHeaderProps({
      title: 'Roles & permissions',
      subtext: 'Understand what each role can access across your workspace.',
      actions: (
        <button
          type="button"
          className="roles-btn-back"
          onClick={() => navigate('/team')}
        >
          Back to members
        </button>
      ),
    });
  }, [setHeaderProps, navigate]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleOpenConfirm = () => {
    if (!isDirty || !canEdit) return;
    setSaveErrorMessage(null);
    setIsConfirmSaveOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaveErrorMessage(null);
      await savePermissions();
      setIsConfirmSaveOpen(false);
      setToastMessage('Permissions saved successfully.');
    } catch (err) {
      setSaveErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to update permissions.'
      );
    }
  };

  const handleRequestSubmit = useCallback(
    async (reason, requestedRole) => {
      const res = await requestRoleChange(reason, requestedRole);
      setToastMessage(res?.message || 'Access change request sent to Admins.');
      return res;
    },
    [requestRoleChange]
  );

  if (isError) {
    return (
      <div className="team-error-state" role="alert">
        <p className="team-error-message">
          Failed to load roles and permissions: {error?.message || 'Server error'}
        </p>
        <button
          type="button"
          className="team-retry-btn"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="roles-page-content">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="team-toast" role="status" aria-live="polite">
          <span className="team-toast__icon" aria-hidden="true">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner */}
      <ReadOnlyBanner
        canEdit={canEdit}
        currentUserRole={currentUserRole}
        adminContact={adminContact}
        onRequestAccess={() => setIsRequestDialogOpen(true)}
      />

      {/* Matrix Table Card */}
      <RolesMatrix
        roles={roles}
        permissions={permissions}
        canEdit={canEdit}
        onCellChange={handleCellChange}
        isLoading={isLoading}
      />

      {/* Protect Workspace Footer Card */}
      <ProtectWorkspaceCard
        canEdit={canEdit}
        isDirty={isDirty}
        isSaving={isSaving}
        onRequestAccess={() => setIsRequestDialogOpen(true)}
        onSave={handleOpenConfirm}
      />

      {/* Request Access Change Dialog */}
      <RequestAccessDialog
        isOpen={isRequestDialogOpen}
        onClose={() => setIsRequestDialogOpen(false)}
        onSubmit={handleRequestSubmit}
        isSubmitting={isRequesting}
      />

      {/* Admin Confirm Save Dialog */}
      <Modal
        isOpen={isConfirmSaveOpen}
        onClose={() => !isSaving && setIsConfirmSaveOpen(false)}
        title="Confirm permission changes"
        description="The following permission modifications will take effect across the workspace."
        size="md"
      >
        <div className="roles-confirm-content">
          <ul className="roles-confirm-list">
            {modifiedPermissions.map((item) => (
              <li key={item.id} className="roles-confirm-item">
                <span className="roles-confirm-item-name">{item.name}</span>
                <div className="roles-confirm-item-changes">
                  {Object.entries(item.values).map(([roleId, newVal]) => {
                    const oldVal = item.oldValues[roleId];
                    if (oldVal === newVal) return null;
                    return (
                      <span key={roleId} className="roles-confirm-diff">
                        <strong>{roleId}:</strong> {oldVal} &rarr; <em>{newVal}</em>
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          {saveErrorMessage && (
            <div className="roles-confirm-error" role="alert">
              {saveErrorMessage}
            </div>
          )}

          <div className="roles-confirm-actions">
            <button
              type="button"
              className="roles-confirm-btn-cancel"
              onClick={() => setIsConfirmSaveOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="roles-confirm-btn-confirm"
              onClick={handleConfirmSave}
              disabled={isSaving}
            >
              {isSaving ? 'Applying changes…' : 'Apply changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
