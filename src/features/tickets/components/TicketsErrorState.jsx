import Icon from '../../../components/Icon/Icon';
import './TicketsErrorState.css';

export default function TicketsErrorState({ onRetry }) {
  return (
    <div className="tickets-error-state" role="alert">
      <div className="tickets-error-state__icon-circle" aria-hidden="true">
        <Icon name="wifi-off" size={24} strokeWidth={1.75} />
      </div>

      <h3 className="tickets-error-state__title">We couldn&apos;t load your tickets</h3>

      <p className="tickets-error-state__desc">
        Check your connection and try again. If this keeps happening, contact your admin.
      </p>

      <div className="tickets-error-state__actions">
        <button
          type="button"
          className="tickets-error-state__btn-retry"
          onClick={onRetry}
        >
          Try again
        </button>
        <a
          href="mailto:support@helpdesk.ai"
          className="tickets-error-state__link-support"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
