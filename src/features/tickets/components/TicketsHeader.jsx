import Icon from '../../../components/Icon/Icon';
import './TicketsHeader.css';

const HEADINGS = {
  all: {
    title: 'All tickets',
    subtitle: 'Triage, assign and resolve customer requests.',
  },
  mine: {
    title: 'My tickets',
    subtitle: 'Tickets currently assigned to you.',
  },
  unassigned: {
    title: 'Unassigned tickets',
    subtitle: 'Pick up new requests before they breach SLA.',
  },
};

export default function TicketsHeader({
  activeTab = 'all',
  canExport = true,
  onExportCsv,
  isExporting = false,
}) {
  const heading = HEADINGS[activeTab] || HEADINGS.all;

  return (
    <div className="tickets-header">
      <div className="tickets-header__left">
        <h1 className="tickets-header__title">{heading.title}</h1>
        <p className="tickets-header__subtitle">{heading.subtitle}</p>
      </div>
      <div className="tickets-header__right">
        {canExport && (
          <button
            type="button"
            className="tickets-header__export-btn"
            onClick={onExportCsv}
            disabled={isExporting}
            aria-label="Export tickets to CSV"
          >
            <Icon name="download" size={15} strokeWidth={2} />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
