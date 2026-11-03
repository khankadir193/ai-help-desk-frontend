import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import Icon from '../../../components/Icon/Icon';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './CategoryFormModal.module.css';

const MAX_NAME_LENGTH = 80;
const MAX_DESC_LENGTH = 500;

function CategoryFormFields({
  categoryToEdit,
  onClose,
  onSuccess,
}) {
  const isEditMode = Boolean(categoryToEdit);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState(categoryToEdit?.name || '');
  const [description, setDescription] = useState(categoryToEdit?.description || '');
  const [isActive, setIsActive] = useState(categoryToEdit?.is_active ?? true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      errors.name = 'Category name is required and cannot be empty.';
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      errors.name = `Category name must be ${MAX_NAME_LENGTH} characters or less.`;
    }

    if (description && description.trim().length > MAX_DESC_LENGTH) {
      errors.description = `Description must be ${MAX_DESC_LENGTH} characters or less.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      is_active: isActive,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: categoryToEdit.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      if (onSuccess) {
        onSuccess(
          isEditMode
            ? 'Category updated successfully.'
            : 'Category created successfully.'
        );
      }
      onClose();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setServerError('A category with this name already exists.');
        setFieldErrors((prev) => ({
          ...prev,
          name: 'A category with this name already exists.',
        }));
      } else if (status === 422 && Array.isArray(err.response?.data?.errors)) {
        const errorsObj = {};
        err.response.data.errors.forEach((eItem) => {
          if (eItem.field) {
            errorsObj[eItem.field] = eItem.message;
          }
        });
        setFieldErrors(errorsObj);
        setServerError('Please correct the validation errors below.');
      } else {
        setServerError(getErrorMessage(err));
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {serverError && (
        <div className={styles.errorBanner} role="alert">
          <Icon
            name="alert-circle"
            size={18}
            className={styles.errorBannerIcon}
          />
          <span>{serverError}</span>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="category-name" className={styles.label}>
            Category Name
            <span className={styles.requiredStar} aria-hidden="true">
              *
            </span>
          </label>
          <span
            className={`${styles.charCount} ${
              name.length > MAX_NAME_LENGTH ? styles.charCountOver : ''
            }`}
          >
            {name.length} / {MAX_NAME_LENGTH}
          </span>
        </div>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) {
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }
            if (serverError) setServerError('');
          }}
          placeholder="e.g., Hardware Support, Billing, Bug Report"
          error={fieldErrors.name}
          disabled={isSubmitting}
          required
          maxLength={MAX_NAME_LENGTH + 10}
          autoFocus
        />
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="category-description" className={styles.label}>
            Description
          </label>
          <span
            className={`${styles.charCount} ${
              description.length > MAX_DESC_LENGTH ? styles.charCountOver : ''
            }`}
          >
            {description.length} / {MAX_DESC_LENGTH}
          </span>
        </div>
        <textarea
          id="category-description"
          className={`${styles.textarea} ${
            fieldErrors.description ? styles.textareaError : ''
          }`}
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) {
              setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          placeholder="Describe the scope of issues covered by this category (optional)"
          disabled={isSubmitting}
          maxLength={MAX_DESC_LENGTH + 20}
        />
        {fieldErrors.description && (
          <span className={styles.fieldError} role="alert">
            <Icon name="alert-circle" size={14} />
            {fieldErrors.description}
          </span>
        )}
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isSubmitting}
        />
        <div className={styles.checkboxContent}>
          <span className={styles.checkboxLabel}>Active Category</span>
          <span className={styles.checkboxHint}>
            When active, customers and agents can select this category when
            submitting new tickets.
          </span>
        </div>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
        >
          {isEditMode ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  categoryToEdit = null,
  onSuccess,
}) {
  const isEditMode = Boolean(categoryToEdit);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Category' : 'Create New Category'}
      description={
        isEditMode
          ? 'Update category details and ticket availability.'
          : 'Define a category for organizing tickets and routing customer issues.'
      }
    >
      <CategoryFormFields
        key={categoryToEdit ? `edit-${categoryToEdit.id}` : 'create-new'}
        categoryToEdit={categoryToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
