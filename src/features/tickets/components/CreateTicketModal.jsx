import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal/Modal';
import TicketForm from './TicketForm';
import { useCreateTicket } from '../hooks/useTickets';

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const createMutation = useCreateTicket();

  if (!isOpen) return null;

  const handleSubmit = async (formData) => {
    const created = await createMutation.mutateAsync(formData);
    const newId = created?.id || created?.data?.id;
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
      onClose={onClose}
      title="Create ticket"
      description="Log a customer request and route it to the right team. Fields marked * are required."
      size="xl"
    >
      <TicketForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={createMutation.isPending}
      />
    </Modal>
  );
}
