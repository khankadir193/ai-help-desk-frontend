import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../../../../components/Icon/Icon';
import './DateRangePicker.css';

/**
 * DateRangePicker — compact dropdown for filtering the dashboard by a date
 * range (startDate / endDate, both YYYY-MM-DD strings, UTC).
 *
 * Props
 *   startDate  {string|null}   controlled committed value (YYYY-MM-DD)
 *   endDate    {string|null}   controlled committed value (YYYY-MM-DD)
 *   onChange   {function}      called with { startDate, endDate } after Apply
 *   maxDate    {string}        upper cap (defaults to today UTC)
 *
 * Draft state is initialised from committed props each time the popover opens.
 * Changes only propagate to the parent on Apply or Clear — the panel is a
 * staging area, not a live filter.
 */
export default function DateRangePicker({
  startDate = null,
  endDate = null,
  onChange,
  maxDate,
}) {
  const todayUTC = new Date().toISOString().slice(0, 10);
  const cap = maxDate || todayUTC;

  const [open, setOpen] = useState(false);
  // Draft state initialised on open — NOT synced via useEffect to avoid
  // triggering the react-hooks/set-state-in-effect lint rule.
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const startRef = useRef(null);

  const openPanel = () => {
    // Reinitialise drafts from committed props when the panel opens
    setDraftStart(startDate ?? '');
    setDraftEnd(endDate ?? '');
    setError('');
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return undefined;
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closePanel();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(e) {
      if (e.key === 'Escape') closePanel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Focus start date when popover opens
  useEffect(() => {
    if (open) startRef.current?.focus();
  }, [open]);

  const validate = useCallback((s, e) => {
    if (s && e && s > e) return 'Start date must be before or equal to end date.';
    if (s && s > cap) return `Start date cannot be after today (${cap}).`;
    if (e && e > cap) return `End date cannot be after today (${cap}).`;
    return '';
  }, [cap]);

  const handleApply = () => {
    const err = validate(draftStart || null, draftEnd || null);
    if (err) { setError(err); return; }
    setError('');
    setOpen(false);
    onChange?.({ startDate: draftStart || null, endDate: draftEnd || null });
  };

  const handleClear = () => {
    setOpen(false);
    onChange?.({ startDate: null, endDate: null });
  };

  const handleStartChange = (val) => {
    setDraftStart(val);
    setError(validate(val || null, draftEnd || null));
  };

  const handleEndChange = (val) => {
    setDraftEnd(val);
    setError(validate(draftStart || null, val || null));
  };

  const hasFilter = !!(startDate || endDate);
  const triggerLabel = buildLabel(startDate, endDate);

  return (
    <div className="drp" ref={containerRef}>
      <button
        type="button"
        className={`btn-date-range${hasFilter ? ' btn-date-range--active' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Filter by date range"
        onClick={open ? closePanel : openPanel}
      >
        <Icon name="calendar" size={15} className="btn-date-range__icon" />
        <span className="drp__trigger-label">{triggerLabel}</span>
        <Icon name="chevron-down" size={14} className="btn-date-range__chevron" />
      </button>

      {open && (
        <div className="drp__panel" role="dialog" aria-label="Select date range">
          <div className="drp__header">
            <span className="drp__header-title">Date range</span>
            {hasFilter && (
              <button
                type="button"
                className="drp__reset-btn"
                onClick={handleClear}
                aria-label="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>

          <div className="drp__fields">
            <div className="drp__field">
              <label className="drp__label" htmlFor="drp-start">From</label>
              <input
                id="drp-start"
                ref={startRef}
                type="date"
                className="drp__input"
                value={draftStart}
                max={draftEnd || cap}
                onChange={(e) => handleStartChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              />
            </div>
            <div className="drp__field">
              <label className="drp__label" htmlFor="drp-end">To</label>
              <input
                id="drp-end"
                type="date"
                className="drp__input"
                value={draftEnd}
                min={draftStart || undefined}
                max={cap}
                onChange={(e) => handleEndChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              />
            </div>
          </div>

          {error && <p className="drp__error" role="alert">{error}</p>}

          <div className="drp__footer">
            <button type="button" className="drp__cancel-btn" onClick={closePanel}>
              Cancel
            </button>
            <button
              type="button"
              className="drp__apply-btn"
              disabled={!!error}
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildLabel(startDate, endDate) {
  if (!startDate && !endDate) return 'All time';
  if (startDate && endDate) {
    if (startDate === endDate) return fmtDate(startDate);
    return `${fmtDate(startDate)} – ${fmtDate(endDate)}`;
  }
  if (startDate) return `From ${fmtDate(startDate)}`;
  return `Until ${fmtDate(endDate)}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
