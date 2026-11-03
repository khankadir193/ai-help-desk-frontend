import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import CategorySelect from '../../categories/components/CategorySelect';
import Icon from '../../../components/Icon/Icon';
import { useCreateTicket } from '../hooks/useTickets';
import { TICKET_PRIORITIES } from '../services/ticketService';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './CreateTicketModal.module.css';

const MAX_TITLE_LENGTH = 200;

function CreateTicketForm({ onClose, onSuccess }) {
  const createMutation = useCreateTicket();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      errors.title = 'Ticket title is required and cannot be empty.';
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      errors.title = `Ticket title must be ${MAX_TITLE_LENGTH} characters or less.`;
    }

    if (!description.trim()) {
      errors.description = 'Ticket description is required.';
    }

    if (!categoryId) {
      errors.category_id = 'Please select a category for this ticket.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        priority,
      });

      if (onSuccess) onSuccess('Ticket created successfully.');
      onClose();
    } catch (err) {
      const status = err.response?.status;
      if (status === 422 && Array.isArray(err.response?.data?.errors)) {
        const errorsObj = {};
        err.response.data.errors.forEach((errorItem) => {
          if (errorItem?.field && errorItem.field !== '_body' && !errorsObj[errorItem.field]) {
            errorsObj[errorItem.field] = errorItem.message;
          }
        });
        setFieldErrors(errorsObj);
        setServerError('Please correct the validation errors below.');
      } else {
        setServerError(getErrorMessage(err));
      }
    }
  };

  const isSubmitting = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {serverError && (
        <div className={styles.errorBanner} role="alert">
          <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
          <span>{serverError}</span>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="ticket-title" className={styles.label}>
            Title
            <span className={styles.requiredStar} aria-hidden="true">*</span>
          </label>
          <span
            className={`${styles.charCount} ${
              title.length > MAX_TITLE_LENGTH ? styles.charCountOver : ''
            }`}
          >
            {title.length} / {MAX_TITLE_LENGTH}
          </span>
        </div>
        <Input
          id="ticket-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) {
              setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }
            if (serverError) setServerError('');
          }}
          placeholder="Summarize the issue, e.g., Invoice #1234 not downloading"
          error={fieldErrors.title}
          disabled={isSubmitting}
          required
          maxLength={MAX_TITLE_LENGTH + 10}
          autoFocus
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="ticket-description" className={styles.label}>
          Description
          <span className={styles.requiredStar} aria-hidden="true">*</span>
        </label>
        <textarea
          id="ticket-description"
          className={`${styles.textarea} ${
            fieldErrors.description ? styles.textareaError : ''
          }`}
          rows={5}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) {
              setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          placeholder="Describe the problem, steps to reproduce it, and any error messages."
          disabled={isSubmitting}
        />
        {fieldErrors.description && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.description}
          </span>
        )}
      </div>

      <CategorySelect
        id="ticket-category"
        label="Category"
        value={categoryId}
        onChange={(value) => {
          setCategoryId(value);
          if (fieldErrors.category_id) {
            setFieldErrors((prev) => ({ ...prev, category_id: undefined }));
          }
        }}
        error={fieldErrors.category_id}
        required
        disabled={isSubmitting}
      />

      <div className={styles.fieldGroup}>
        <label htmlFor="ticket-priority" className={styles.label}>
          Priority
        </label>
        <select
          id="ticket-priority"
          className={styles.select}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={isSubmitting}
        >
          {TICKET_PRIORITIES.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.footerActions}>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          Create Ticket
        </Button>
      </div>
    </form>
  );
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Ticket"
      description="Describe your issue so support can route it to the right team."
      size="lg"
    >
      <CreateTicketForm key="create-ticket" onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}
