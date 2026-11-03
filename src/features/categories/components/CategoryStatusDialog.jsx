import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import { useUpdateCategoryStatus } from '../hooks/useCategories';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './CategoryFormModal.module.css';

export default function CategoryStatusDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
}) {
  const statusMutation = useUpdateCategoryStatus();
  const [error, setError] = useState('');

  if (!category) return null;

  const willDeactivate = category.is_active;

  const handleToggle = async () => {
    setError('');
    try {
      await statusMutation.mutateAsync({
        id: category.id,
        isActive: !willDeactivate,
      });

      if (onSuccess) {
        onSuccess(
          willDeactivate
            ? `Category "${category.name}" has been deactivated.`
            : `Category "${category.name}" has been activated.`
        );
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const isPending = statusMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      title={willDeactivate ? 'Deactivate Category' : 'Reactivate Category'}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={willDeactivate ? 'danger' : 'primary'}
            onClick={handleToggle}
            isLoading={isPending}
          >
            {willDeactivate ? 'Deactivate Category' : 'Activate Category'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
            <span>{error}</span>
          </div>
        )}

        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {willDeactivate ? (
            <>
              Are you sure you want to deactivate <strong>{category.name}</strong>?
              <br /><br />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                This category will no longer appear when creating new tickets. Existing tickets already linked to this category will retain their history and details.
              </span>
            </>
          ) : (
            <>
              Are you sure you want to reactivate <strong>{category.name}</strong>?
              <br /><br />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Once active, customers and agents will be able to select this category when opening new tickets.
              </span>
            </>
          )}
        </p>
      </div>
    </Modal>
  );
}

