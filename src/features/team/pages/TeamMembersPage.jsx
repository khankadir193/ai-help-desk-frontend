import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import useTeamMembers from '../hooks/useTeamMembers';
import { useAuth } from '../../auth/hooks/useAuth';
import { canInvite, getRoleLabel } from '../utils/teamPermissions';
import Avatar from '../../../components/Avatar/Avatar';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Modal from '../../../components/ui/Modal/Modal';
import Pagination from '../../knowledge-base/components/Pagination/Pagination';
import getInitials from '../../dashboard/utils/initials';
import './TeamMembersPage.css';

export default function TeamMembersPage() {
  const { setHeaderProps } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: userRole } = useAuth();
  const isAuthorizedToInvite = canInvite(userRole);

  const {
    members,
    invitations,
    total,
    page,
    pageSize,
    totalPages,
    search,
    setSearch,
    setPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    resendInvite,
    revokeInvite,
  } = useTeamMembers();

  const [toast, setToast] = useState(() => {
    if (location.state?.invitedEmail) {
      return location.state.deliveryFailed
        ? {
            message: `Invitation created for ${location.state.invitedEmail}, but the email could not be sent. Use Resend to try again.`,
            isError: true,
          }
        : { message: `Invitation sent to ${location.state.invitedEmail}`, isError: false };
    }
    return null;
  });
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'members' | 'invitations'
  // Per-row in-flight action: { id, type: 'resend' | 'revoke' } | null
  const [busyAction, setBusyAction] = useState(null);
  // Invitation awaiting revoke confirmation (drives the confirm dialog)
  const [revokeTarget, setRevokeTarget] = useState(null);

  // Clear location state after picking up invitedEmail
  useEffect(() => {
    if (location.state?.invitedEmail) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Update header props in parent layout
  useEffect(() => {
    setHeaderProps({
      title: 'Team members',
      subtext: 'Manage teammates, view status, and send invitations.',
      actions: isAuthorizedToInvite ? (
        <button
          type="button"
          className="members-btn-invite"
          onClick={() => navigate('/team/members/invite')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </svg>
          Invite member
        </button>
      ) : null,
    });
  }, [setHeaderProps, navigate, isAuthorizedToInvite]);

  // Members arrive already filtered/paginated by the API (?q=&page=&pageSize=)
  const pagedMembers = members;

  // Pending invitations are few — filter them client-side with the same term
  const filteredInvitations = invitations.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.email?.toLowerCase().includes(q) ||
      inv.role?.toLowerCase().includes(q) ||
      inv.team?.toLowerCase().includes(q)
    );
  });

  // Keep previous rows visible (dimmed) while a new page loads
  const tableDimmedClass =
    isFetching && !isLoading ? ' members-table-wrapper--refreshing' : '';

  const getErrMessage = (err, fallback) =>
    err?.response?.data?.message || err?.userMessage || fallback;

  const handleResend = async (inv) => {
    setBusyAction({ id: inv.id, type: 'resend' });
    try {
      const updated = await resendInvite(inv.id);
      const delivery = updated?.email_delivery;
      if (delivery?.sent) {
        setToast({
          message:
            delivery.mode === 'console'
              ? `Invitation resent to ${inv.email} (link logged to the server console).`
              : `Invitation resent to ${inv.email}.`,
          isError: false,
        });
      } else {
        setToast({
          message: `Could not resend the email${delivery?.error ? `: ${delivery.error}` : '.'}`,
          isError: true,
        });
      }
    } catch (err) {
      setToast({
        message: getErrMessage(err, 'Failed to resend invitation.'),
        isError: true,
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    const target = revokeTarget;
    setBusyAction({ id: target.id, type: 'revoke' });
    try {
      await revokeInvite(target.id);
      setToast({ message: `Invitation to ${target.email} revoked.`, isError: false });
    } catch (err) {
      // 404 (already revoked / stale row): the hook refetches the list so the
      // stale row disappears instead of leaving a broken state.
      setToast({
        message: getErrMessage(err, 'Failed to revoke invitation.'),
        isError: true,
      });
    } finally {
      setBusyAction(null);
      setRevokeTarget(null);
    }
  };

  if (isError) {
    return (
      <div className="team-error-state" role="alert">
        <p className="team-error-message">
          Failed to load team members: {error?.userMessage || error?.message || 'Server error'}
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
    <div className="members-page-content">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`team-toast${toast.isError ? ' team-toast--error' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="team-toast__icon" aria-hidden="true">
            {toast.isError ? '✕' : '✓'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="members-filter-bar">
        <div className="members-search-wrap">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="members-search-icon"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            type="search"
            className="members-search-input"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search members and invitations"
          />
        </div>

        <div className="members-view-filters">
          <button
            type="button"
            className={`members-pill-filter ${activeTabFilter === 'all' ? 'members-pill-filter--active' : ''}`}
            onClick={() => setActiveTabFilter('all')}
          >
            All ({total + filteredInvitations.length})
          </button>
          <button
            type="button"
            className={`members-pill-filter ${activeTabFilter === 'members' ? 'members-pill-filter--active' : ''}`}
            onClick={() => setActiveTabFilter('members')}
          >
            Active members ({total})
          </button>
          <button
            type="button"
            className={`members-pill-filter ${activeTabFilter === 'invitations' ? 'members-pill-filter--active' : ''}`}
            onClick={() => setActiveTabFilter('invitations')}
          >
            Pending invites ({filteredInvitations.length})
          </button>
        </div>
      </div>

      {/* Active Members Table */}
      {(activeTabFilter === 'all' || activeTabFilter === 'members') && (
        <section className="members-card" aria-label="Active workspace members">
          <div className="members-card__header">
            <h2 className="members-card__title">
              Active members ({total})
            </h2>
          </div>

          <div
            className={`members-table-wrapper${tableDimmedClass}`}
            tabIndex={0}
            role="region"
            aria-label="Members table"
          >
            <table className="members-table">
              <thead>
                <tr>
                  <th scope="col" className="members-th members-th--name">Member</th>
                  <th scope="col" className="members-th">Role</th>
                  <th scope="col" className="members-th">Job title</th>
                  <th scope="col" className="members-th members-th--status">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="members-tr--skeleton">
                      <td colSpan={4}>
                        <div className="members-skeleton-row" />
                      </td>
                    </tr>
                  ))
                ) : pagedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="members-empty-cell">
                      No matching members found.
                    </td>
                  </tr>
                ) : (
                  pagedMembers.map((member) => {
                    const initials = getInitials(member.name);
                    const roleLabel = getRoleLabel(member.role);

                    return (
                      <tr key={member.id} className="members-tr">
                        <td className="members-td members-td--name">
                          <div className="members-user-info">
                            <Avatar
                              initials={initials}
                              type="text"
                              size="sm"
                              className="members-avatar"
                            />
                            <div className="members-name-group">
                              <span className="members-name" title={member.name}>
                                {member.name}
                              </span>
                              <span className="members-email">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="members-td">
                          <span className={`members-role-tag members-role-tag--${member.role.toLowerCase()}`}>
                            {roleLabel}
                          </span>
                        </td>

                        <td className="members-td members-td--job">
                          {member.job_title || 'Support Specialist'}
                        </td>

                        <td className="members-td members-td--status">
                          <StatusPill status="active" label="Active" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — hidden while loading and on single-page lists */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel="members"
              compact
            />
          )}
        </section>
      )}

      {/* Pending Invitations Table */}
      {(activeTabFilter === 'all' || activeTabFilter === 'invitations') && (
        <section className="members-card members-card--invitations" aria-label="Pending invitations">
          <div className="members-card__header">
            <h2 className="members-card__title">
              Pending invitations ({filteredInvitations.length})
            </h2>
            {isAuthorizedToInvite && (
              <button
                type="button"
                className="members-header-invite-btn"
                onClick={() => navigate('/team/members/invite')}
              >
                + New invite
              </button>
            )}
          </div>

          <div
            className={`members-table-wrapper${tableDimmedClass}`}
            tabIndex={0}
            role="region"
            aria-label="Pending invitations table"
          >
            <table className="members-table">
              <thead>
                <tr>
                  <th scope="col" className="members-th members-th--name">Invitee</th>
                  <th scope="col" className="members-th">Role</th>
                  <th scope="col" className="members-th">Team</th>
                  <th scope="col" className="members-th">Expires</th>
                  <th scope="col" className="members-th members-th--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <tr key={i} className="members-tr--skeleton">
                      <td colSpan={5}>
                        <div className="members-skeleton-row" />
                      </td>
                    </tr>
                  ))
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="members-empty-cell">
                      No pending invitations at this time.
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => {
                    const roleLabel = getRoleLabel(inv.role);
                    const expiresDate = new Date(inv.expires_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                    const isRowBusy = busyAction?.id === inv.id;

                    return (
                      <tr key={inv.id} className="members-tr">
                        <td className="members-td members-td--name">
                          <div className="members-invitee-info">
                            <span className="members-invitee-icon" aria-hidden="true">✉</span>
                            <span className="members-name">{inv.email}</span>
                          </div>
                        </td>

                        <td className="members-td">
                          <span className={`members-role-tag members-role-tag--${inv.role.toLowerCase()}`}>
                            {roleLabel}
                          </span>
                        </td>

                        <td className="members-td members-td--job">
                          {inv.team || 'General support'}
                        </td>

                        <td className="members-td members-td--expires">
                          Expires {expiresDate}
                        </td>

                        <td className="members-td members-td--actions">
                          {isAuthorizedToInvite ? (
                            <div className="members-actions-group">
                              <button
                                type="button"
                                className="members-action-link"
                                onClick={() => handleResend(inv)}
                                disabled={busyAction !== null}
                              >
                                {isRowBusy && busyAction.type === 'resend' ? 'Sending…' : 'Resend'}
                              </button>
                              <span className="members-action-sep">·</span>
                              <button
                                type="button"
                                className="members-action-link members-action-link--danger"
                                onClick={() => setRevokeTarget(inv)}
                                disabled={busyAction !== null}
                              >
                                {isRowBusy && busyAction.type === 'revoke' ? 'Revoking…' : 'Revoke'}
                              </button>
                            </div>
                          ) : (
                            <span className="members-readonly-action">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Revoke confirmation dialog */}
      <Modal
        isOpen={revokeTarget !== null}
        onClose={() => (busyAction ? null : setRevokeTarget(null))}
        title="Revoke this invitation?"
        description={
          revokeTarget
            ? `${revokeTarget.email} will no longer be able to accept the invite link.`
            : ''
        }
        size="sm"
      >
        <div className="members-revoke-actions">
          <button
            type="button"
            className="members-revoke-btn-cancel"
            onClick={() => setRevokeTarget(null)}
            disabled={busyAction !== null}
          >
            Cancel
          </button>
          <button
            type="button"
            className="members-revoke-btn-confirm"
            onClick={handleConfirmRevoke}
            disabled={busyAction !== null}
          >
            {busyAction?.type === 'revoke' ? 'Revoking…' : 'Revoke invitation'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
