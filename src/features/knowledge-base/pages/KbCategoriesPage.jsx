import { useState } from 'react';
import Icon from '../../../components/Icon/Icon';
import KbHeader from '../components/KbHeader/KbHeader';
import KbTabs from '../components/KbTabs/KbTabs';
import CategoryList from '../components/CategoryList/CategoryList';
import CategoryDetailsForm from '../components/CategoryDetailsForm/CategoryDetailsForm';
import UncategorizedCard from '../components/UncategorizedCard/UncategorizedCard';
import { useKbCategories } from '../hooks/useCategories';
import './KbCategoriesPage.css';

export default function KbCategoriesPage() {
  const {
    categories = [],
    uncategorizedCount = 0,
    authors = [],
    isLoading,
    isLoadingAuthors,
    isError,
    error,
    refetch,
    isFetching,
    createCategory,
    isCreating,
    createError,
    updateCategory,
    isUpdating,
    updateError,
    reorderCategories,
    isReordering,
  } = useKbCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formMode, setFormMode] = useState('edit'); // 'edit' | 'create'
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const effectiveCategoryId = selectedCategoryId || categories[0]?.id;
  const selectedCategory = categories.find((c) => String(c.id) === String(effectiveCategoryId)) || categories[0];
  const selectedIndex = categories.findIndex((c) => String(c.id) === String(effectiveCategoryId));

  const totalArticles = categories.reduce((acc, c) => acc + (Number(c.total_count || c.total || 0)), 0) + uncategorizedCount;

  const handleStartCreate = () => {
    setFormMode('create');
    setFeedbackMsg('');
  };

  const handleSelectCategory = (id) => {
    setSelectedCategoryId(id);
    setFormMode('edit');
    setFeedbackMsg('');
  };

  const handleSaveCategory = async (payload) => {
    try {
      setFeedbackMsg('');
      if (formMode === 'create') {
        const created = await createCategory(payload);
        setFeedbackMsg('Category created successfully.');
        setFormMode('edit');
        if (created?.id) setSelectedCategoryId(created.id);
      } else {
        await updateCategory(payload);
        setFeedbackMsg('Changes saved successfully.');
      }
      refetch();
    } catch (err) {
      console.error('Save category failed:', err);
    }
  };

  const handleMoveUp = () => {
    if (selectedIndex <= 0) return;
    const reordered = [...categories];
    const temp = reordered[selectedIndex - 1];
    reordered[selectedIndex - 1] = reordered[selectedIndex];
    reordered[selectedIndex] = temp;
    reorderCategories(reordered.map((c) => c.id));
  };

  const handleMoveDown = () => {
    if (selectedIndex < 0 || selectedIndex >= categories.length - 1) return;
    const reordered = [...categories];
    const temp = reordered[selectedIndex + 1];
    reordered[selectedIndex + 1] = reordered[selectedIndex];
    reordered[selectedIndex] = temp;
    reorderCategories(reordered.map((c) => c.id));
  };

  const isRefetching = isFetching && !isLoading && !isError && !isReordering;

  return (
    <main className="kb-page kb-categories-page" aria-label="Knowledge Base Categories Management">
      {isRefetching && <div className="kb-refetch-bar" aria-hidden="true" />}
      <div className={isRefetching ? 'kb-refetching' : undefined}>
        {/* Header */}
        <KbHeader
          title="Categories"
          subtitle={`Organize ${totalArticles || 60} articles into clear, discoverable topics.`}
          actions={
            <button
              type="button"
              className="kb-primary-btn"
              onClick={handleStartCreate}
            >
              Create category
            </button>
          }
        />

        {/* Tabs */}
        <KbTabs />

        {/* Feedback Toast Banner */}
        {feedbackMsg && (
          <div className="kb-feedback-banner" role="status">
            {feedbackMsg}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="kb-error-box" role="alert">
            <Icon name="alert-circle" size={20} className="kb-error-icon" />
            <div className="kb-error-text">
              <strong>Failed to load categories:</strong> {error?.message || 'Server error occurred'}
            </div>
            <button type="button" className="kb-retry-btn" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {/* 2-Column Grid (2fr / 1fr) */}
        <div className="kb-cat-grid">
          {/* Left Column: List + Uncategorized card */}
          <div className="kb-cat-grid__left">
            <CategoryList
              categories={categories}
              isLoading={isLoading}
              selectedCategoryId={selectedCategory?.id}
              onSelectCategory={handleSelectCategory}
              onReorder={reorderCategories}
              isReordering={isReordering}
            />
            <UncategorizedCard
              count={uncategorizedCount}
              totalArticles={totalArticles || 60}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Details Form */}
          <div className="kb-cat-grid__right">
            <CategoryDetailsForm
              key={formMode === 'create' ? 'create' : (selectedCategory?.id || 'none')}
              mode={formMode}
              category={formMode === 'create' ? null : selectedCategory}
              authors={authors}
              isLoading={isLoading}
              onSave={handleSaveCategory}
              onCancel={() => setFormMode('edit')}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={selectedIndex <= 0}
              isLast={selectedIndex >= categories.length - 1}
              isSaving={isCreating || isUpdating}
              isReordering={isReordering}
              serverError={createError?.message || updateError?.message}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
