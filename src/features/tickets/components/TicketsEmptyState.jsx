import Icon from '../../../components/Icon/Icon';
import './TicketsEmptyState.css';

export default function TicketsEmptyState({
  isFiltered = false,
  onClearFilters,
  onCreateTicket,
  canCreate = true,
}) {
  return (
    <div className="tickets-empty-state">
      <div className="tickets-empty-state__icon-circle" aria-hidden="true">
        <Icon name="inbox" size={24} strokeWidth={1.5} />
      </div>

      <h3 className="tickets-empty-state__title">
        {isFiltered ? 'No tickets match your filters' : 'No tickets yet'}
      </h3>

      <p className="tickets-empty-state__desc">
        {isFiltered
          ? 'Try removing a filter or searching for something else.'
          : 'When customer support requests arrive, they will appear here.'}
      </p>

      {isFiltered ? (
        <button
          type="button"
          className="tickets-empty-state__btn tickets-empty-state__btn--clear"
          onClick={onClearFilters}
        >
          Clear all filters
        </button>
      ) : (
        canCreate && (
          <button
            type="button"
            className="tickets-empty-state__btn tickets-empty-state__btn--create"
            onClick={onCreateTicket}
          >
            Create ticket
          </button>
        )
      )}
    </div>
  );
}
