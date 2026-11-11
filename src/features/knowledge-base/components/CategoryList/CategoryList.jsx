import { useState } from 'react';
import Icon from '../../../../components/Icon/Icon';
import './CategoryList.css';

const ROW_SKELETON_COUNT = 5;

function RowSkeleton() {
  return (
    <div className="kb-category-row" aria-hidden="true">
      <div className="kb-category-row__order">
        <span className="kb-skel" style={{ width: 24, height: 18 }} />
        <span className="kb-skel" style={{ width: 28, height: 18 }} />
        <div className="kb-category-row__info">
          <span className="kb-skel" style={{ width: '58%', height: 15, marginBottom: 4 }} />
          <span className="kb-skel" style={{ width: '72%', height: 13 }} />
        </div>
      </div>
      <div className="kb-category-row__status">
        <span className="kb-skel" style={{ width: 60, height: 14, marginBottom: 4 }} />
        <span className="kb-skel" style={{ width: 52, height: 12 }} />
      </div>
      <div className="kb-category-row__owner">
        <span className="kb-skel" style={{ width: 86, height: 14 }} />
      </div>
    </div>
  );
}

export default function CategoryList({
  categories = [],
  isLoading = false,
  selectedCategoryId,
  onSelectCategory,
  onReorder,
  isReordering = false,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...categories];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    setDragOverIndex(null);
    onReorder?.(reordered.map((c) => c.id));
  };

  return (
    <div className="kb-category-list-card">
      {/* Table Header */}
      <div className="kb-category-list__header">
        <span className="kb-category-list__th kb-category-list__th--order">Help center order</span>
        <span className="kb-category-list__th kb-category-list__th--status">Article status</span>
        <span className="kb-category-list__th kb-category-list__th--owner">Owner</span>
      </div>

      {/* Rows */}
      <div className="kb-category-list__body" role="list">
        {isLoading
          ? Array.from({ length: ROW_SKELETON_COUNT }, (_, i) => <RowSkeleton key={i} />)
          : categories.map((cat, index) => {
              const isSelected = String(cat.id) === String(selectedCategoryId);
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;
              const iconName = cat.icon || 'book-open';

              return (
                <div
                  key={cat.id}
                  className={`kb-category-row ${isSelected ? 'kb-category-row--selected' : ''} ${
                    isDragging ? 'kb-category-row--dragging' : ''
                  } ${isDragOver ? 'kb-category-row--dragover' : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  tabIndex={0}
                  role="listitem"
                  aria-selected={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectCategory(cat.id);
                    }
                  }}
                >
                  {/* Order Column with Handle, Icon, Title, Desc */}
                  <div className="kb-category-row__order">
                    <div
                      className="kb-category-row__handle"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      title="Drag to reorder category"
                      aria-label={`Drag handle for ${cat.name}`}
                    >
                      <Icon name="grip-vertical" size={16} />
                    </div>

                    <div className="kb-category-row__icon" aria-hidden="true">
                      <Icon name={iconName} size={18} strokeWidth={1.75} />
                    </div>

                    <div className="kb-category-row__info">
                      <h3 className="kb-category-row__name">{cat.name}</h3>
                      <p className="kb-category-row__desc">
                        {cat.description || 'Payments, invoices and refunds'}
                      </p>
                    </div>
                  </div>

                  {/* Article Status Column */}
                  <div className="kb-category-row__status">
                    <span className="kb-category-row__total">{cat.total_count ?? cat.total ?? 0} total</span>
                    <span className="kb-category-row__published">{cat.published_count ?? cat.published ?? 0} published</span>
                  </div>

                  {/* Owner Column */}
                  <div className="kb-category-row__owner">
                    <span className="kb-category-row__owner-name">{cat.owner_name || 'Support Team'}</span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Footer Hint */}
      <div className="kb-category-list__hint" aria-live="polite">
        {isReordering ? 'Saving order...' : 'Drag handles to reorder categories, or use Move up / Move down.'}
      </div>
    </div>
  );
}
