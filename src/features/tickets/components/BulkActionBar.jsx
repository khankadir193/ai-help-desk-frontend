import { useState, useRef } from 'react';
import Icon from '../../../components/Icon/Icon';
import AssignMenu from './AssignMenu';
import ChangeStatusMenu from './ChangeStatusMenu';
import './BulkActionBar.css';

export default function BulkActionBar({
  selectedCount = 0,
  onClearSelection,
  onAssignTo,
  onChangeStatus,
  onOpenDeleteDialog,
  canDelete = false,
  agents = [],
}) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const assignBtnRef = useRef(null);
  const statusBtnRef = useRef(null);

  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions">
      <div className="bulk-action-bar__left">
        <label className="bulk-action-bar__count-label">
          <input
            type="checkbox"
            checked={true}
            onChange={onClearSelection}
            className="bulk-action-bar__checkbox"
            aria-label="Deselect all"
          />
          <span className="bulk-action-bar__count-text">
            {selectedCount} selected
          </span>
        </label>

        {/* Assign to... */}
        <div className="bulk-action-bar__dropdown-wrapper">
          <button
            ref={assignBtnRef}
            type="button"
            className="bulk-action-bar__btn"
            onClick={() => {
              setIsAssignOpen((prev) => !prev);
              setIsStatusOpen(false);
            }}
            aria-expanded={isAssignOpen}
          >
            <Icon name="user" size={15} />
            <span>Assign to...</span>
            <Icon name="chevron-down" size={14} />
          </button>
          <AssignMenu
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            agents={agents}
            onSelectAgent={onAssignTo}
            triggerRef={assignBtnRef}
          />
        </div>

        {/* Change status */}
        <div className="bulk-action-bar__dropdown-wrapper">
          <button
            ref={statusBtnRef}
            type="button"
            className="bulk-action-bar__btn"
            onClick={() => {
              setIsStatusOpen((prev) => !prev);
              setIsAssignOpen(false);
            }}
            aria-expanded={isStatusOpen}
          >
            <Icon name="tag" size={15} />
            <span>Change status</span>
            <Icon name="chevron-down" size={14} />
          </button>
          <ChangeStatusMenu
            isOpen={isStatusOpen}
            onClose={() => setIsStatusOpen(false)}
            onSelectStatus={onChangeStatus}
          />
        </div>

        {/* Delete (Admin only) */}
        {canDelete && (
          <button
            type="button"
            className="bulk-action-bar__btn bulk-action-bar__btn--delete"
            onClick={onOpenDeleteDialog}
          >
            Delete
          </button>
        )}
      </div>

      <div className="bulk-action-bar__right">
        <button
          type="button"
          className="bulk-action-bar__clear-btn"
          onClick={onClearSelection}
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}
