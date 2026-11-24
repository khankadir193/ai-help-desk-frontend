import './TicketsSkeleton.css';

export default function TicketsSkeleton({ rowCount = 9 }) {
  const rows = Array.from({ length: rowCount });

  return (
    <div className="tickets-skeleton" aria-hidden="true">
      {rows.map((_, i) => (
        <div key={i} className="tickets-skeleton__row">
          <div className="tickets-skeleton__cell tickets-skeleton__cell--checkbox">
            <span className="tickets-skeleton__box tickets-skeleton__box--cb" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--id">
            <span className="tickets-skeleton__box tickets-skeleton__box--id" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--subject">
            <span className="tickets-skeleton__box tickets-skeleton__box--subject" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--customer">
            <span className="tickets-skeleton__circle" />
            <span className="tickets-skeleton__box tickets-skeleton__box--name" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--priority">
            <span className="tickets-skeleton__box tickets-skeleton__box--pill" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--status">
            <span className="tickets-skeleton__box tickets-skeleton__box--pill" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--agent">
            <span className="tickets-skeleton__circle" />
            <span className="tickets-skeleton__box tickets-skeleton__box--name" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--category">
            <span className="tickets-skeleton__box tickets-skeleton__box--category" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--date">
            <span className="tickets-skeleton__box tickets-skeleton__box--date" />
          </div>
          <div className="tickets-skeleton__cell tickets-skeleton__cell--updated">
            <span className="tickets-skeleton__box tickets-skeleton__box--updated" />
          </div>
        </div>
      ))}
    </div>
  );
}
