import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal/Modal';
import TicketForm from './TicketForm';
import { useCreateTicket } from '../hooks/useTickets';
import ticketService from '../services/ticketService';

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const createMutation = useCreateTicket();
  const [isDirty, setIsDirty] = useState(false);

  if (!isOpen) return null;

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('Discard unsaved changes? Your changes will be lost.');
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleSubmit = async (formData, meta = {}) => {
    const created = await createMutation.mutateAsync(formData);
    const newId = created?.id || created?.data?.id || created?.data?.ticket?.id;
    if (newId && meta.assignedAgentId) {
      try {
        await ticketService.updateTicketAssignment(newId, meta.assignedAgentId);
      } catch (err) {
        console.error('Failed to assign agent on creation:', err);
      }
    }
    if (onSuccess) onSuccess('Ticket created successfully.');
    onClose();
    if (newId) {
      navigate(`/tickets/${newId}`);
    } else {
      navigate('/tickets');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleRequestClose}
      title="Create ticket"
      description="Log a customer request and route it to the right team. Fields marked * are required."
      size="xl"
    >
      <TicketForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleRequestClose}
        isSubmitting={createMutation.isPending}
        onDirtyChange={setIsDirty}
      />
    </Modal>
  );
}
