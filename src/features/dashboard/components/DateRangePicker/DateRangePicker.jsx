import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../../../../components/Icon/Icon';
import './DateRangePicker.css';

/**
 * Predefined date range presets
 */
const PRESETS = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '14d', label: 'Last 14 days', days: 14 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'this_month', label: 'This month' },
  { id: 'all', label: 'All time' },
];

/**
 * Calculate ISO date string (YYYY-MM-DD UTC) from a preset
 */
function getPresetDates(presetId) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (presetId === 'all') {
    return { startDate: null, endDate: null };
  }

  if (presetId === 'this_month') {
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const startStr = `${year}-${month}-01`;
    return { startDate: startStr, endDate: todayStr };
  }

  const preset = PRESETS.find((p) => p.id === presetId);
  const days = preset?.days || 7;
  const past = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const startStr = past.toISOString().slice(0, 10);

  return { startDate: startStr, endDate: todayStr };
}

/**
 * DateRangePicker — Dropdown for filtering dashboard by predefined or custom date range.
 *
 * Props:
 *   startDate    {string|null}   controlled committed value (YYYY-MM-DD)
 *   endDate      {string|null}   controlled committed value (YYYY-MM-DD)
 *   onChange     {function}      called with { startDate, endDate }
 *   defaultDays  {Array}         optional volume days array to infer default label
 *   maxDate      {string}        optional max date cap (defaults to today UTC)
 */
export default function DateRangePicker({
  startDate = null,
  endDate = null,
  onChange,
  defaultDays,
  maxDate,
}) {
  const todayUTC = new Date().toISOString().slice(0, 10);
  const cap = maxDate || todayUTC;

  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const startRef = useRef(null);

  const openPanel = () => {
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

  const validate = useCallback(
    (s, e) => {
      if (s && e && s > e) return 'Start date must be before or equal to end date.';
      if (s && s > cap) return `Start date cannot be after today (${cap}).`;
      if (e && e > cap) return `End date cannot be after today (${cap}).`;
      return '';
    },
    [cap]
  );

  const handleApplyCustom = () => {
    const err = validate(draftStart || null, draftEnd || null);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setOpen(false);
    onChange?.({ startDate: draftStart || null, endDate: draftEnd || null });
  };

  const handleSelectPreset = (presetId) => {
    const { startDate: s, endDate: e } = getPresetDates(presetId);
    setError('');
    setOpen(false);
    onChange?.({ startDate: s, endDate: e });
  };

  const handleReset = () => {
    setError('');
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
  const triggerLabel = buildTriggerLabel(startDate, endDate, defaultDays);

  return (
    <div className="drp" ref={containerRef}>
      <button
        type="button"
        className={`btn-date-range${hasFilter ? ' btn-date-range--active' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Filter by date range: ${triggerLabel}`}
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
                onClick={handleReset}
                aria-label="Reset date filter"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="drp__presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="drp__preset-btn"
                onClick={() => handleSelectPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="drp__divider">
            <span>or custom range</span>
          </div>

          {/* Custom Date Inputs */}
          <div className="drp__fields">
            <div className="drp__field">
              <label className="drp__label" htmlFor="drp-start">
                From
              </label>
              <input
                id="drp-start"
                ref={startRef}
                type="date"
                className="drp__input"
                value={draftStart}
                max={draftEnd || cap}
                onChange={(e) => handleStartChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCustom();
                }}
              />
            </div>
            <div className="drp__field">
              <label className="drp__label" htmlFor="drp-end">
                To
              </label>
              <input
                id="drp-end"
                type="date"
                className="drp__input"
                value={draftEnd}
                min={draftStart || undefined}
                max={cap}
                onChange={(e) => handleEndChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCustom();
                }}
              />
            </div>
          </div>

          {error && (
            <p className="drp__error" role="alert">
              {error}
            </p>
          )}

          <div className="drp__footer">
            <button
              type="button"
              className="drp__cancel-btn"
              onClick={closePanel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="drp__apply-btn"
              disabled={!!error || (!draftStart && !draftEnd)}
              onClick={handleApplyCustom}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Build trigger button label.
 * Matches Screenshot 2's format: "Oct 23 – Oct 29, 2026"
 */
function buildTriggerLabel(startDate, endDate, defaultDays) {
  let s = startDate;
  let e = endDate;

  if (!s && !e) {
    if (Array.isArray(defaultDays) && defaultDays.length > 0) {
      s = defaultDays[0]?.date;
      e = defaultDays[defaultDays.length - 1]?.date;
    } else {
      const now = new Date();
      const past = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      s = past.toISOString().slice(0, 10);
      e = now.toISOString().slice(0, 10);
    }
  }

  if (s && e) {
    const [y1, m1, d1] = s.split('-').map(Number);
    const [y2, m2, d2] = e.split('-').map(Number);
    const date1 = new Date(Date.UTC(y1, m1 - 1, d1));
    const date2 = new Date(Date.UTC(y2, m2 - 1, d2));

    const month1 = date1.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day1 = date1.getUTCDate();
    const month2 = date2.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day2 = date2.getUTCDate();
    const year2 = date2.getUTCFullYear();

    if (s === e) {
      return `${month1} ${day1}, ${year2}`;
    }
    return `${month1} ${day1} – ${month2} ${day2}, ${year2}`;
  }

  if (s) {
    const [y, m, d] = s.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    return `From ${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }

  if (e) {
    const [y, m, d] = e.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    return `Until ${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }

  return 'All time';
}
