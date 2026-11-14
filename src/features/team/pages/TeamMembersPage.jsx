import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import useTeamMembers from '../hooks/useTeamMembers';
import { useAuth } from '../../auth/hooks/useAuth';
import { canInvite, getRoleLabel } from '../utils/teamPermissions';
import Avatar from '../../../components/Avatar/Avatar';
import StatusPill from '../../../components/StatusPill/StatusPill';
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
    isLoading,
    isError,
    error,
    refetch,
    resendInvite,
    revokeInvite,
    isResending,
    isRevoking,
  } = useTeamMembers();

  const [toastMessage, setToastMessage] = useState(() => {
    if (location.state?.invitedEmail) {
      return `Invitation sent to ${location.state.invitedEmail}`;
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'members' | 'invitations'

  // Clear location state after picking up invitedEmail
  useEffect(() => {
    if (location.state?.invitedEmail) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  // Filter members by search query
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  });

  // Filter invitations by search query
  const filteredInvitations = invitations.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.email?.toLowerCase().includes(q) ||
      inv.role?.toLowerCase().includes(q) ||
      inv.team?.toLowerCase().includes(q)
    );
  });

  const handleResend = async (inv) => {
    try {
      await resendInvite(inv.id);
      setToastMessage(`Invitation resent to ${inv.email}`);
    } catch (err) {
      setToastMessage(err?.response?.data?.message || 'Failed to resend invitation.');
    }
  };

  const handleRevoke = async (inv) => {
    try {
      await revokeInvite(inv.id);
      setToastMessage(`Invitation to ${inv.email} revoked.`);
    } catch (err) {
      setToastMessage(err?.response?.data?.message || 'Failed to revoke invitation.');
    }
  };

  if (isError) {
    return (
      <div className="team-error-state" role="alert">
        <p className="team-error-message">
          Failed to load team members: {error?.message || 'Server error'}
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
      {toastMessage && (
        <div className="team-toast" role="status" aria-live="polite">
          <span className="team-toast__icon" aria-hidden="true">✓</span>
          <span>{toastMessage}</span>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search members and invitations"
          />
        </div>

        <div className="members-view-filters">
          <button
            type="button"
            className={`members-pill-filter ${activeTabFilter === 'all' ? 'members-pill-filter--active' : ''}`}
            onClick={() => setActiveTabFilter('all')}
          >
            All ({filteredMembers.length + filteredInvitations.length})
          </button>
          <button
            type="button"
            className={`members-pill-filter ${activeTabFilter === 'members' ? 'members-pill-filter--active' : ''}`}
            onClick={() => setActiveTabFilter('members')}
          >
            Active members ({filteredMembers.length})
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
              Active members ({filteredMembers.length})
            </h2>
          </div>

          <div className="members-table-wrapper" tabIndex={0} role="region" aria-label="Members table">
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
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="members-empty-cell">
                      No matching members found.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
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

          <div className="members-table-wrapper" tabIndex={0} role="region" aria-label="Pending invitations table">
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
                                disabled={isResending}
                              >
                                Resend
                              </button>
                              <span className="members-action-sep">·</span>
                              <button
                                type="button"
                                className="members-action-link members-action-link--danger"
                                onClick={() => handleRevoke(inv)}
                                disabled={isRevoking}
                              >
                                Revoke
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
    </div>
  );
}
