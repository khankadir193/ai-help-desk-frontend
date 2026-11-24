import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTicket, useCreateTicket, useUpdateTicket } from '../hooks/useTickets';
import { formatTicketId, formatShortDate } from '../utils/ticketFormatters';
import TicketForm from '../components/TicketForm';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import AccessDenied from '../../../components/AccessDenied/AccessDenied';
import styles from './TicketFormPage.module.css';

export default function TicketFormPage({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';

  const { data: ticket, isLoading, isError, error } = useTicket(isEditMode ? id : null);
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();

  if (isEditMode && isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" label="Loading ticket details..." />
      </div>
    );
  }

  if (isEditMode && isError) {
    if (error?.response?.status === 403) {
      return (
        <AccessDenied
          title="Access restricted"
          message="You do not have permission to edit this ticket."
          returnPath="/tickets"
        />
      );
    }
    return (
      <div className={styles.errorContainer}>
        <h3>Unable to load ticket</h3>
        <p>{error?.response?.data?.message || error?.message || 'Ticket not found.'}</p>
        <Link to="/tickets" className={styles.backLink}>← Return to tickets</Link>
      </div>
    );
  }

  const ticketCode = ticket ? formatTicketId(ticket.id) : '';
  const createdDate = ticket ? formatShortDate(ticket.created_at) : '';

  const handleSubmit = async (formData) => {
    if (isEditMode) {
      await updateMutation.mutateAsync({ id, data: formData });
      navigate(`/tickets/${id}`);
    } else {
      const created = await createMutation.mutateAsync(formData);
      const newId = created?.id || created?.data?.id;
      if (newId) {
        navigate(`/tickets/${newId}`);
      } else {
        navigate('/tickets');
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/tickets/${id}`);
    } else {
      navigate('/tickets');
    }
  };

  return (
    <div className={styles.pageContainer} aria-label={isEditMode ? 'Edit ticket' : 'Create ticket'}>
      {/* Top Header */}
      <div className={styles.header}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/tickets" className={styles.breadcrumbLink}>Tickets</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <span className={styles.breadcrumbCurrent}>
            {isEditMode ? ticketCode : 'Create ticket'}
          </span>
        </nav>

        <h1 className={styles.title}>
          {isEditMode ? 'Edit ticket' : 'Create ticket'}
        </h1>

        <p className={styles.subtext}>
          {isEditMode
            ? `${ticketCode} · Created ${createdDate} · Changes stay local until you save. * Required fields.`
            : 'Log a customer request and route it to the right team. Fields marked * are required.'}
        </p>
      </div>

      {/* Main Form */}
      <TicketForm
        mode={mode}
        initialData={isEditMode ? ticket : null}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
