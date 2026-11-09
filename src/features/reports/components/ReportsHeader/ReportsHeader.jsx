import './ReportsHeader.css';

/**
 * ReportsHeader
 *
 * Page title, subtitle, and primary actions.
 *
 * Props:
 *  onExport: () => void
 *  isExporting: boolean
 *  disabled: boolean
 *  metaText?: string
 */
export default function ReportsHeader({ onExport, isExporting, disabled, metaText }) {
  return (
    <header className="reports-header" aria-label="Reports Header">
      <div className="reports-header__left">
        <h1 className="reports-header__title">Reports &amp; Analytics</h1>
        <p className="reports-header__subtext">
          Support volume, service quality and team outcomes{metaText ? ` · ${metaText}` : ''}
        </p>
      </div>

      <div className="reports-header__actions">
        <button
          type="button"
          className="reports-btn-export"
          onClick={onExport}
          disabled={disabled || isExporting}
          aria-label="Export report as CSV"
        >
          {isExporting ? 'Exporting…' : 'Export report'}
        </button>
      </div>
    </header>
  );
}
