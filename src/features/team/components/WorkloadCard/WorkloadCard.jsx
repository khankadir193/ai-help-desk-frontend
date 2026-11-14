import './WorkloadCard.css';

export default function WorkloadCard({ workload, isLoading }) {
  if (isLoading) {
    return (
      <section className="workload-card" aria-label="Loading workload summary">
        <div className="workload-card__skeleton-title" />
        <div className="workload-card__rows">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="workload-card__skeleton-row" />
          ))}
        </div>
        <div className="workload-card__skeleton-note" />
      </section>
    );
  }

  const openTickets = workload?.open_tickets != null ? String(workload.open_tickets) : '–';
  const unassigned = workload?.unassigned != null ? String(workload.unassigned) : '–';
  const inProgress = workload?.in_progress != null ? String(workload.in_progress) : '–';

  return (
    <section className="workload-card" aria-label="Workload at a glance">
      <h2 className="workload-card__title">Workload at a glance</h2>

      <div className="workload-card__rows">
        <div className="workload-card__row">
          <span className="workload-card__label">Open tickets</span>
          <span className="workload-card__value tabular-nums">{openTickets}</span>
        </div>
        <div className="workload-card__row">
          <span className="workload-card__label">Unassigned</span>
          <span className="workload-card__value tabular-nums">{unassigned}</span>
        </div>
        <div className="workload-card__row">
          <span className="workload-card__label">In progress</span>
          <span className="workload-card__value tabular-nums">{inProgress}</span>
        </div>
      </div>

      <p className="workload-card__note">
        In progress is a subset of open tickets. Rebalance assignments from the members view.
      </p>
    </section>
  );
}
