import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import teamService from '../services/teamService';
import useInviteForm from '../hooks/useInviteForm';
import useInviteSubmit from '../hooks/useInviteSubmit';
import { useTeams } from '../hooks/useTeams';
import { useAuth } from '../../auth/hooks/useAuth';
import { canInvite } from '../utils/teamPermissions';
import InviteForm from '../components/InviteForm/InviteForm';
import InvitationReviewCard from '../components/InvitationReviewCard/InvitationReviewCard';
import WhatHappensNextCard from '../components/WhatHappensNextCard/WhatHappensNextCard';
import InviteConfirmDialog from '../components/InviteConfirmDialog/InviteConfirmDialog';
import Modal from '../../../components/ui/Modal/Modal';
import './InviteMemberPage.css';

export default function InviteMemberPage() {
  const { setHeaderProps } = useOutletContext();
  const navigate = useNavigate();
  const { role: userRole } = useAuth();
  const isAuthorized = canInvite(userRole);

  // Fetch invite options from API
  const { data: inviteOptionsData } = useQuery({
    queryKey: ['team', 'invite-options'],
    queryFn: teamService.getInviteOptions,
    enabled: isAuthorized,
    staleTime: 1000 * 60 * 10,
  });

  const { teams: teamsList } = useTeams();

  const rolesConfig = inviteOptionsData?.roles || [
    {
      id: 'AGENT',
      name: 'Support Agent',
      title: 'Support Agent',
      description: 'Work on assigned tickets and draft knowledge articles.',
      admin_only: false,
    },
    {
      id: 'MANAGER',
      name: 'Manager',
      title: 'Manager',
      description: 'Manage team workloads and view team reports.',
      admin_only: true,
    },
    {
      id: 'ADMIN',
      name: 'Admin',
      title: 'Admin',
      description: 'Full access, including billing and workspace security.',
      admin_only: true,
    },
  ];

  const assignableRoles = inviteOptionsData?.assignable_roles || (userRole === 'ADMIN' ? ['AGENT', 'MANAGER', 'ADMIN'] : ['AGENT']);
  const expiryDays = inviteOptionsData?.expiry_days || 7;

  // Form Hook
  const {
    values,
    errors,
    touched,
    isDirty,
    setEmail,
    setRole,
    setTeam,
    handleEmailBlur,
    validate,
    setFieldError,
    reset,
  } = useInviteForm({
    initialRole: 'AGENT',
    initialTeam: teamsList[0] || 'General support',
  });

  // Submission Hook
  const { submitInvitation, isSubmitting } = useInviteSubmit();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [statusLabel, setStatusLabel] = useState('Draft · Not sent');

  // Beforeunload listener for unsaved changes guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Set shared header
  const handleBackToMembers = useCallback(() => {
    if (isDirty) {
      setIsDiscardDialogOpen(true);
    } else {
      navigate('/team');
    }
  }, [isDirty, navigate]);

  useEffect(() => {
    setHeaderProps({
      title: 'Invite a team member',
      subtext: 'Give a teammate the right access to your support workspace.',
      actions: (
        <button
          type="button"
          className="invite-btn-back"
          onClick={handleBackToMembers}
        >
          Back to members
        </button>
      ),
    });
  }, [setHeaderProps, handleBackToMembers]);

  // Open review confirmation dialog
  const handleReviewClick = () => {
    setServerError(null);
    const isValid = validate();
    if (isValid) {
      setIsConfirmOpen(true);
    }
  };

  // Perform invitation submission
  const handleConfirmSend = async () => {
    try {
      setServerError(null);
      await submitInvitation({
        email: values.email.trim().toLowerCase(),
        role: values.role,
        team: values.team,
      });

      setStatusLabel('Sent');
      setIsConfirmOpen(false);

      // Redirect to /team (Members tab) where pending invite appears
      navigate('/team', {
        state: { invitedEmail: values.email.trim().toLowerCase() },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send invitation. Please try again.';

      setServerError(msg);

      // If duplicate or active member error, also set on email field inline
      if (err?.response?.status === 409) {
        setFieldError('email', msg);
      }
    }
  };

  // Handle Discard Confirmation
  const handleConfirmDiscard = () => {
    setIsDiscardDialogOpen(false);
    reset();
    navigate('/team');
  };

  // If Support Agent or Customer attempts to access Invite directly
  if (!isAuthorized) {
    return (
      <div className="invite-unauthorized-card" role="alert">
        <h2 className="invite-unauthorized-title">Access restricted</h2>
        <p className="invite-unauthorized-desc">
          You don't have permission to invite workspace members. Only Managers and Admins can send invitations.
        </p>
        <div className="invite-unauthorized-actions">
          <Link to="/team" className="invite-unauthorized-link">
            Return to Members
          </Link>
          <Link to="/team/roles" className="invite-unauthorized-link-roles">
            View roles &amp; permissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-page-grid">
      {/* Left Column: Form (2fr) */}
      <div className="invite-grid-left">
        <InviteForm
          email={values.email}
          role={values.role}
          team={values.team}
          rolesConfig={rolesConfig}
          teamsList={teamsList}
          assignableRoles={assignableRoles}
          errors={errors}
          touched={touched}
          isDirty={isDirty}
          statusLabel={statusLabel}
          onEmailChange={setEmail}
          onEmailBlur={handleEmailBlur}
          onRoleChange={setRole}
          onTeamChange={setTeam}
          onCancel={handleBackToMembers}
          onSubmit={handleReviewClick}
        />
      </div>

      {/* Right Column: Review & Next Steps (1fr) */}
      <div className="invite-grid-right">
        <InvitationReviewCard
          email={values.email}
          role={values.role}
          team={values.team}
        />

        <WhatHappensNextCard expiryDays={expiryDays} />
      </div>

      {/* Confirm and Send Modal Dialog */}
      <InviteConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSend}
        email={values.email}
        role={values.role}
        team={values.team}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />

      {/* Unsaved Changes Guard Dialog */}
      <Modal
        isOpen={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        title="Discard unsaved invitation?"
        description="You have unsaved details in your member invitation. If you leave now, your changes will be discarded."
        size="sm"
      >
        <div className="invite-discard-actions">
          <button
            type="button"
            className="invite-discard-btn-stay"
            onClick={() => setIsDiscardDialogOpen(false)}
          >
            Stay
          </button>
          <button
            type="button"
            className="invite-discard-btn-discard"
            onClick={handleConfirmDiscard}
          >
            Discard
          </button>
        </div>
      </Modal>
    </div>
  );
}
