import { Link } from 'react-router-dom';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Avatar from '../../../components/Avatar/Avatar';
import {
  formatTicketId,
  formatShortDate,
  formatRelativeTime,
  formatFullDateTime,
  formatInitials,
} from '../utils/ticketFormatters';
import './TicketRow.css';

export default function TicketRow({
  ticket,
  isSelected = false,
  onToggleSelect,
}) {
  const customerName = ticket.customer?.name || ticket.customer_name || 'Customer';
  const customerInitials = formatInitials(customerName);

  const agentName = ticket.assigned_agent?.name || ticket.agent_name;
  const agentInitials = agentName ? formatInitials(agentName) : '';

  // Shorten name to "First L."
  const formatShortName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const displayCustomerName = formatShortName(customerName);
  const displayAgentName = agentName ? formatShortName(agentName) : 'Unassigned';

  const categoryName = ticket.category?.name || ticket.category_name || 'General';

  return (
    <tr
      className={`ticket-row ${isSelected ? 'ticket-row--selected' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' && e.target === e.currentTarget) {
          e.preventDefault();
          onToggleSelect(ticket.id);
        }
      }}
    >
      {/* Selection Checkbox */}
      <td className="ticket-row__cell ticket-row__cell--checkbox" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(ticket.id)}
          aria-label={`Select ticket ${formatTicketId(ticket.id)}`}
          className="ticket-row__checkbox"
        />
      </td>

      {/* Ticket ID */}
      <td className="ticket-row__cell ticket-row__cell--id">
        <span className="ticket-row__id-text">{formatTicketId(ticket.id)}</span>
      </td>

      {/* Subject */}
      <td className="ticket-row__cell ticket-row__cell--subject">
        <Link
          to={`/tickets/${ticket.id}`}
          className="ticket-row__subject-link"
          title={ticket.title}
        >
          {ticket.title}
        </Link>
      </td>

      {/* Customer */}
      <td className="ticket-row__cell ticket-row__cell--customer">
        <div className="ticket-row__person" title={ticket.customer?.email || customerName}>
          <Avatar
            initials={customerInitials}
            size="sm"
            className="ticket-row__avatar ticket-row__avatar--customer"
          />
          <span className="ticket-row__person-name">{displayCustomerName}</span>
        </div>
      </td>

      {/* Priority */}
      <td className="ticket-row__cell ticket-row__cell--priority">
        <StatusPill priority={ticket.priority} />
      </td>

      {/* Status */}
      <td className="ticket-row__cell ticket-row__cell--status">
        <StatusPill status={ticket.status} />
      </td>

      {/* Assigned Agent */}
      <td className="ticket-row__cell ticket-row__cell--agent">
        {agentName ? (
          <div className="ticket-row__person" title={ticket.assigned_agent?.email || agentName}>
            <Avatar
              initials={agentInitials}
              size="sm"
              className="ticket-row__avatar ticket-row__avatar--agent"
            />
            <span className="ticket-row__person-name">{displayAgentName}</span>
          </div>
        ) : (
          <div className="ticket-row__unassigned">
            <div className="ticket-row__unassigned-circle" aria-hidden="true" />
            <span className="ticket-row__unassigned-text">Unassigned</span>
          </div>
        )}
      </td>

      {/* Category */}
      <td className="ticket-row__cell ticket-row__cell--category">
        <span className="ticket-row__category-text">{categoryName}</span>
      </td>

      {/* Created */}
      <td className="ticket-row__cell ticket-row__cell--date">
        <span className="ticket-row__date-text" title={formatFullDateTime(ticket.created_at)}>
          {formatShortDate(ticket.created_at)}
        </span>
      </td>

      {/* Updated */}
      <td className="ticket-row__cell ticket-row__cell--updated">
        <span className="ticket-row__updated-text" title={formatFullDateTime(ticket.updated_at)}>
          {formatRelativeTime(ticket.updated_at)}
        </span>
      </td>
    </tr>
  );
}
