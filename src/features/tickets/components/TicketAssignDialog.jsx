import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import Icon from '../../../components/Icon/Icon';
import { useUpdateTicketAssignment } from '../hooks/useTickets';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './CreateTicketModal.module.css';

const AGENT_ID_PATTERN = /^[1-9]\d*$/;

/**
 * Assign / reassign / unassign a ticket to an agent (Admin only).
 * Uses the actual backend contract:
 *   PATCH /api/v1/tickets/:id/assignment  { assigned_agent_id } | { assigned_agent_id: null }
 *
 * The user module exposes no agent directory endpoint, so the target agent
 * must be referenced by numeric user ID; the backend validates that the ID
 * belongs to an existing, active AGENT.
 */
export default function TicketAssignDialog({ isOpen, onClose, ticket }) {
  const assignmentMutation = useUpdateTicketAssignment();

  const [agentId, setAgentId] = useState(ticket?.assigned_agent?.id ?? '');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    const trimmed = String(agentId).trim();
    if (!trimmed) {
      setFieldError('Enter an agent ID, or use Unassign to remove the assignment.');
      return false;
    }
    if (!AGENT_ID_PATTERN.test(trimmed)) {
      setFieldError('Agent ID must be a positive integer.');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    const trimmed = String(agentId).trim();
    try {
      await assignmentMutation.mutateAsync({
        id: ticket.id,
        assignedAgentId: trimmed ? trimmed : null,
      });

      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUnassign = async () => {
    setError('');
    try {
      await assignmentMutation.mutateAsync({
        id: ticket.id,
        assignedAgentId: null,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const isPending = assignmentMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Ticket"
      description="Assign this ticket to an active support agent by their user ID."
      size="sm"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
            <span>{error}</span>
          </div>
        )}

        <p className={styles.dialogInfo}>
          {ticket.assigned_agent ? (
            <>
              Currently assigned to{' '}
              <strong>{ticket.assigned_agent.name}</strong> (ID{' '}
              {ticket.assigned_agent.id}).
            </>
          ) : (
            <>This ticket is currently unassigned.</>
          )}
        </p>

        <Input
          id="ticket-agent-id"
          label="Agent User ID"
          type="number"
          min="1"
          value={agentId}
          onChange={(e) => {
            setAgentId(e.target.value);
            if (fieldError) setFieldError('');
            if (error) setError('');
          }}
          placeholder="e.g., 42"
          error={fieldError}
          disabled={isPending}
        />

        <p className={styles.dialogHint}>
          The backend verifies that the ID belongs to an existing, active agent.
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
          <Button variant="primary" type="submit" isLoading={isPending}>
            {ticket.assigned_agent ? 'Reassign' : 'Assign Agent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
