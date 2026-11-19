import { formatDuration, formatTicketId } from './formatters';

function escapeCsvCell(value) {
  // Prefix formula-looking cells so a ticket title cannot execute in a
  // spreadsheet application, then apply normal CSV quoting.
  const raw = String(value ?? '');
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  const text = safe.replace(/"/g, '""');
  return /[",\r\n]/.test(text) ? `"${text}"` : text;
}

/** Read the backend's volume payload (`{ days, ... }`) or a bare array. */
function getVolumeDays(volume) {
  if (Array.isArray(volume)) return volume;
  return Array.isArray(volume?.days) ? volume.days : [];
}

/**
 * Build a CSV from the dashboard payload that is currently on screen.
 * Every row comes from the API response — no sample or inferred values.
 *
 * @param {object} dashboard
 * @returns {string}
 */
export function buildDashboardCsv(dashboard) {
  if (!dashboard) return '';

  const dateRangeStr =
    dashboard.date_range?.startDate && dashboard.date_range?.endDate
      ? `${dashboard.date_range.startDate} to ${dashboard.date_range.endDate}`
      : dashboard.date_range?.startDate
        ? `From ${dashboard.date_range.startDate}`
        : dashboard.date_range?.endDate
          ? `Until ${dashboard.date_range.endDate}`
          : 'All time';

  const rows = [
    ['Overview', 'Role', dashboard.role ?? ''],
    ['Overview', 'Date range', dateRangeStr],
    ['Overview', 'Total tickets', dashboard.total_tickets ?? 0],
    ['Status', 'Open', dashboard.status_counts?.OPEN ?? 0],
    ['Status', 'In progress', dashboard.status_counts?.IN_PROGRESS ?? 0],
    ['Status', 'Resolved', dashboard.status_counts?.RESOLVED ?? 0],
    ['Status', 'Closed', dashboard.status_counts?.CLOSED ?? 0],
    ['Backlog', 'Unassigned (open or in progress)', dashboard.unassigned_count ?? 0],
    ['Performance', 'Average first response', formatDuration(dashboard.avg_first_response_hours)],
    ['Performance', 'Average resolution', formatDuration(dashboard.avg_resolution_hours)],
    ['Priority', 'Low', dashboard.priority_counts?.LOW ?? 0],
    ['Priority', 'Medium', dashboard.priority_counts?.MEDIUM ?? 0],
    ['Priority', 'High', dashboard.priority_counts?.HIGH ?? 0],
    ['Priority', 'Urgent', dashboard.priority_counts?.URGENT ?? 0],
  ];

  const volumeLabel =
    dashboard.date_range?.startDate || dashboard.date_range?.endDate
      ? `Ticket volume (${dateRangeStr})`
      : 'Ticket volume (last 7 days)';

  const volumeDays = getVolumeDays(dashboard.ticket_volume);
  for (const day of volumeDays) {
    rows.push([
      volumeLabel,
      day.date,
      `Created: ${day.created ?? 0}`,
      `Resolved: ${day.resolved ?? 0}`,
    ]);
  }
  if (volumeDays.length > 0) {
    const totalCreated = dashboard.ticket_volume?.total_created
      ?? volumeDays.reduce((sum, day) => sum + (Number(day.created) || 0), 0);
    const totalResolved = dashboard.ticket_volume?.total_resolved
      ?? volumeDays.reduce((sum, day) => sum + (Number(day.resolved) || 0), 0);
    rows.push([
      volumeLabel,
      'Total',
      `Created: ${totalCreated}`,
      `Resolved: ${totalResolved}`,
    ]);
  }

  for (const ticket of dashboard.recent_tickets ?? []) {
    rows.push([
      'Recent tickets',
      formatTicketId(ticket.id),
      ticket.status ?? '',
      `${ticket.title ?? ''} — ${ticket.customer?.name ?? 'Unknown customer'}`,
    ]);
  }

  for (const agent of dashboard.agent_workload ?? []) {
    const solved = (agent.resolved ?? 0) + (agent.closed ?? 0);
    const open = (agent.open ?? 0) + (agent.in_progress ?? 0);
    rows.push([
      'Agent workload',
      agent.agent_name ?? '',
      `Solved: ${solved}`,
      `Assigned: ${agent.total_assigned ?? 0} | Open: ${open} | Avg first response: ${formatDuration(agent.avg_first_response_hours)}`,
    ]);
  }

  const headers = ['Section', 'Metric', 'Value', 'Details'];
  return [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');
}

/**
 * Trigger a browser download for a CSV string.
 *
 * @param {string} csv
 * @param {string} filename
 */
export function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default { buildDashboardCsv, downloadCsv };
