import { useCategories } from '../hooks/useCategories';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import inputStyles from '../../../components/ui/Input/Input.module.css';

/**
 * CategorySelect - Dropdown selector for active categories
 * Used during ticket creation and category-based ticket filtering.
 * Inactive categories are never selectable.
 */
export default function CategorySelect({
  id = 'ticket-category-select',
  label = 'Category',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select a category...',
  className = '',
}) {
  // Customers/Agents always receive only active categories from backend.
  // Admins fetching with isActive: true also receive only active categories.
  const { data: categories = [], isLoading, isError, refetch } = useCategories({
    isActive: true,
  });

  return (
    <div className={inputStyles.wrapper}>
      {label && (
        <div className={inputStyles.labelRow}>
          <label htmlFor={id} className={inputStyles.label}>
            {label}
            {required && <span className={inputStyles.requiredStar} aria-hidden="true">*</span>}
          </label>
        </div>
      )}

      <div className={inputStyles.inputContainer}>
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          required={required}
          className={`${inputStyles.input} ${error ? inputStyles.hasError : ''} ${className}`}
          aria-invalid={Boolean(error)}
        >
          <option value="" disabled>
            {isLoading ? 'Loading categories...' : placeholder}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {isLoading && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <Spinner size="sm" label="" />
          </div>
        )}
      </div>

      {error ? (
        <span className={inputStyles.errorMessage} role="alert">
          {error}
        </span>
      ) : isError ? (
        <span className={inputStyles.errorMessage} role="alert">
          Failed to load categories.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            Retry
          </button>
        </span>
      ) : null}
    </div>
  );
}

