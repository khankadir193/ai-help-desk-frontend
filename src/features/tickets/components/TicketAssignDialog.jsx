import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import { useAgents } from '../../users/hooks/useAgents';
import { useUpdateTicketAssignment } from '../hooks/useTickets';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './CreateTicketModal.module.css';

/**
 * Assign / reassign / unassign a ticket to an agent (Admin only).
 * Uses the actual backend contracts:
 *   GET   /api/v1/users/agents           — active-AGENT directory { id, name, email }
 *   PATCH /api/v1/tickets/:id/assignment { assigned_agent_id } | { assigned_agent_id: null }
 *
 * The Admin picks an agent from the fetched directory instead of typing a
 * numeric user ID; only the selected agent's database ID is submitted and
 * the backend re-validates it (exists, role AGENT, account active).
 *
 * `onSuccess(message)` is called after a successful update so the details
 * page can surface the result (same pattern as CreateTicketModal).
 */
export default function TicketAssignDialog({ isOpen, onClose, ticket, onSuccess }) {
  const assignmentMutation = useUpdateTicketAssignment();

  const [agentId, setAgentId] = useState(ticket?.assigned_agent?.id ?? '');
  const [fieldError, setFieldError] = useState('');
  const [mutationError, setMutationError] = useState('');

  // Agent directory: fetched once on the first open (an admin opens this
  // dialog, and the request is enabled only while the dialog is mounted).
  const {
    data: agents = [],
    isLoading: agentsLoading,
    isError: agentsError,
    refetch: refetchAgents,
  } = useAgents({ enabled: isOpen });

  const canSubmit = !agentsLoading && !agentsError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setMutationError('');

    if (!String(agentId).trim()) {
      setFieldError('Select an agent to assign, or use Unassign.');
      return;
    }

    try {
      const updated = await assignmentMutation.mutateAsync({
        id: ticket.id,
        assignedAgentId: agentId,
      });

      const agentName = updated?.assigned_agent?.name;
      if (onSuccess) {
        onSuccess(
          agentName
            ? `Ticket assigned to ${agentName}.`
            : 'Assignment updated.'
        );
      }
      onClose();
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleUnassign = async () => {
    setFieldError('');
    setMutationError('');
    try {
      await assignmentMutation.mutateAsync({
        id: ticket.id,
        assignedAgentId: null,
      });
      if (onSuccess) {
        onSuccess('Ticket unassigned.');
      }
      onClose();
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const isPending = assignmentMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Ticket"
      description="Choose an active support agent for this ticket."
      size="sm"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {mutationError && (
          <div className={styles.errorBanner} role="alert">
            <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
            <span>{mutationError}</span>
          </div>
        )}

        <p className={styles.dialogInfo}>
          {ticket.assigned_agent ? (
            <>
              Currently assigned to{' '}
              <strong>{ticket.assigned_agent.name}</strong>
              {ticket.assigned_agent.email && (
                <> ({ticket.assigned_agent.email})</>
              )}
              .
            </>
          ) : (
            <>This ticket is currently unassigned.</>
          )}
        </p>

        {/* Directory feedback */}
        {agentsError ? (
          <div className={`${styles.errorBanner} ${styles.errorBannerWrap}`}>
            <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
            <span>Could not load the agent list. Please try again.</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => refetchAgents()}
            >
              Retry
            </Button>
          </div>
        ) : !agentsLoading && agents.length === 0 ? (
          <div className={styles.dialogInfoEmpty}>
            <Icon name="users" size={20} className={styles.dialogInfoEmptyIcon} />
            <p className={styles.dialogInfo}>
              No active agents are available. Create or reactivate an agent
              account to assign this ticket.
            </p>
          </div>
        ) : null}

        {/* Agent dropdown (names + emails; DB id submitted internally) */}
        <div className={styles.fieldGroup}>
          <label htmlFor="ticket-agent-select" className={styles.label}>
            Agent
          </label>
          <select
            id="ticket-agent-select"
            className={`${styles.select} ${fieldError ? styles.selectError : ''}`}
            value={agentId ?? ''}
            onChange={(e) => {
              setAgentId(e.target.value);
              if (fieldError) setFieldError('');
              if (mutationError) setMutationError('');
            }}
            disabled={agentsLoading || isPending || !canSubmit}
          >
            <option value="">
              {agentsLoading ? 'Loading agents…' : 'Select an agent…'}
            </option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {`${agent.name} (${agent.email})`}
              </option>
            ))}
          </select>
          {fieldError && (
            <span className={styles.fieldError}>{fieldError}</span>
          )}
        </div>

        <p className={styles.dialogHint}>
          Only active agent accounts are listed; the backend re-verifies the
          selection before assigning.
        </p>

        <div className={styles.footerActions}>
          {ticket.assigned_agent && (
            <Button
              variant="secondary"
              onClick={handleUnassign}
              disabled={isPending}
            >
              Unassign
            </Button>
          )}
          <Button
            variant="primary"
            type="submit"
            isLoading={isPending}
            disabled={!canSubmit}
          >
            {ticket.assigned_agent ? 'Reassign' : 'Assign Agent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
