import { useState, useMemo } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../../auth/hooks/useAuth';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import CategoryFormModal from './CategoryFormModal';
import CategoryStatusDialog from './CategoryStatusDialog';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './CategoryList.module.css';

export default function CategoryList() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [statusCategory, setStatusCategory] = useState(null);

  // Success message toast
  const [successMessage, setSuccessMessage] = useState('');

  // Decide isActive parameter for React Query
  const isActiveParam = useMemo(() => {
    if (!isAdmin) return undefined; // backend handles role-based scoping automatically
    if (statusFilter === 'active') return true;
    if (statusFilter === 'inactive') return false;
    return undefined; // 'all'
  }, [isAdmin, statusFilter]);

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCategories({
    isActive: isActiveParam,
  });

  // Client-side search filtering across name and description
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const showToast = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === message ? '' : prev));
    }, 4500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {successMessage && (
        <div className={styles.successToast} role="status">
          <div className={styles.successToastLeft}>
            <Icon name="check-circle" size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss notification"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <div className={styles.card}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>
              <span>Help Desk Categories</span>
              {!isLoading && (
                <span className={styles.badgeCount}>
                  {categories.length}{' '}
                  {categories.length === 1 ? 'category' : 'categories'}
                </span>
              )}
            </h2>
            <p className={styles.subtext}>
              {isAdmin
                ? 'Manage ticket categories, descriptions, and activation status for support routing.'
                : 'Browse available support categories used to classify and route help requests.'}
            </p>
          </div>

          <div className={styles.actionsArea}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => refetch()}
              title="Refresh categories"
              aria-label="Refresh categories"
              disabled={isFetching}
            >
              <Icon
                name="rotate-cw"
                size={16}
                className={isFetching ? 'spin' : ''}
              />
            </button>

            {isAdmin && (
              <Button
                variant="primary"
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsFormModalOpen(true);
                }}
              >
                <Icon name="plus" size={16} strokeWidth={2.5} />
                <span>New Category</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by category name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search categories"
            />
          </div>

          {isAdmin && (
            <div className={styles.tabsGroup} role="tablist" aria-label="Category status filter">
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === 'all'}
                className={`${styles.tabBtn} ${
                  statusFilter === 'all' ? styles.tabBtnActive : ''
                }`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === 'active'}
                className={`${styles.tabBtn} ${
                  statusFilter === 'active' ? styles.tabBtnActive : ''
                }`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === 'inactive'}
                className={`${styles.tabBtn} ${
                  statusFilter === 'inactive' ? styles.tabBtnActive : ''
                }`}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </button>
            </div>
          )}
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className={styles.stateBox}>
            <Spinner size="lg" label="Loading categories..." />
          </div>
        ) : isError ? (
          <div className={styles.errorBanner} role="alert">
            <div className={styles.errorLeft}>
              <Icon name="alert-circle" size={20} />
              <span>{getErrorMessage(error)}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className={styles.stateBox}>
            <Icon name="tag" size={36} className={styles.stateIcon} />
            <h3 className={styles.stateTitle}>No categories found</h3>
            <p className={styles.stateText}>
              {searchQuery
                ? `No categories matched "${searchQuery}". Try a different keyword.`
                : statusFilter !== 'all'
                ? `No ${statusFilter} categories available right now.`
                : 'No support categories have been added yet.'}
            </p>
            {searchQuery ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            ) : isAdmin ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsFormModalOpen(true);
                }}
              >
                <Icon name="plus" size={16} />
                <span>Create First Category</span>
              </Button>
            ) : null}
          </div>
        ) : (
          /* Categories Data Table */
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: '45%' }}>
                    Category Name & Scope
                  </th>
                  <th className={styles.th} style={{ width: '15%' }}>
                    Status
                  </th>
                  <th className={styles.th} style={{ width: '18%' }}>
                    Created
                  </th>
                  <th className={styles.th} style={{ width: '18%' }}>
                    Last Updated
                  </th>
                  {isAdmin && (
                    <th
                      className={styles.th}
                      style={{ width: '4%', textAlign: 'right' }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.categoryMain}>
                        <span className={styles.categoryName}>{cat.name}</span>
                        {cat.description ? (
                          <span className={styles.categoryDesc}>
                            {cat.description}
                          </span>
                        ) : (
                          <span className={styles.categoryEmptyDesc}>
                            No description provided
                          </span>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <StatusPill
                        status={cat.is_active ? 'active' : 'inactive'}
                        label={cat.is_active ? 'Active' : 'Inactive'}
                      />
                    </td>

                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatDate(cat.created_at)}
                    </td>

                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatDate(cat.updated_at)}
                    </td>

                    {isAdmin && (
                      <td className={`${styles.td} ${styles.actionsCell}`}>
                        <div className={styles.actionBtns}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title="Edit Category"
                            aria-label={`Edit ${cat.name}`}
                            onClick={() => {
                              setCategoryToEdit(cat);
                              setIsFormModalOpen(true);
                            }}
                          >
                            <Icon name="edit" size={15} />
                          </button>

                          <button
                            type="button"
                            className={`${styles.iconBtn} ${
                              cat.is_active
                                ? styles.iconBtnDanger
                                : styles.iconBtnActivate
                            }`}
                            title={
                              cat.is_active
                                ? 'Deactivate Category'
                                : 'Activate Category'
                            }
                            aria-label={`${
                              cat.is_active ? 'Deactivate' : 'Activate'
                            } ${cat.name}`}
                            onClick={() => setStatusCategory(cat)}
                          >
                            <Icon name="power" size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onSuccess={showToast}
      />

      {/* Status Toggle Confirmation Dialog */}
      <CategoryStatusDialog
        isOpen={Boolean(statusCategory)}
        onClose={() => setStatusCategory(null)}
        category={statusCategory}
        onSuccess={showToast}
      />
    </div>
  );
}

