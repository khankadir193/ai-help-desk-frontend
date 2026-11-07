import { useState, useMemo, useCallback } from 'react';
import ReportsHeader from '../components/ReportsHeader/ReportsHeader';
import ReportsFilters from '../components/ReportsFilters/ReportsFilters';
import ReportsKpiRow from '../components/ReportsKpiRow/ReportsKpiRow';
import TicketVolumeCard from '../components/TicketVolumeCard/TicketVolumeCard';
import ResolutionSlaCard from '../components/ResolutionSlaCard/ResolutionSlaCard';
import AgentPerformanceTable from '../components/AgentPerformanceTable/AgentPerformanceTable';
import CustomerSatisfactionCard from '../components/CustomerSatisfactionCard/CustomerSatisfactionCard';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import { useReports } from '../hooks/useReports';
import {
  daysAgo,
  todayISO,
  startOfMonthISO,
  formatMediumDate,
  toCsv,
  downloadCsv,
} from '../utils/formatters';
import { getErrorMessage } from '../../../utils/errorHandler';
import './ReportsPage.css';

/**
 * Compute date boundaries for a selected preset
 */
function getPresetDates(preset) {
  const today = todayISO();
  switch (preset) {
    case '7d':
      return { from: daysAgo(6), to: today };
    case '14d':
      return { from: daysAgo(13), to: today };
    case '30d':
      return { from: daysAgo(29), to: today };
    case 'this_month':
      return { from: startOfMonthISO(), to: today };
    default:
      return { from: daysAgo(6), to: today };
  }
}

/**
 * Format date range for the filter button label (e.g. "Oct 23 – Oct 29, 2026")
 */
function formatDateRangeLabel(from, to) {
  if (!from || !to) return 'Oct 23 – Oct 29, 2026';
  const startStr = formatMediumDate(from);
  const endStr = formatMediumDate(to);
  if (!startStr || !endStr) return 'Oct 23 – Oct 29, 2026';

  // If same year, we can show "Oct 23 – Oct 29, 2026"
  const startParts = startStr.split(', ');
  const endParts = endStr.split(', ');
  if (startParts[1] === endParts[1]) {
    return `${startParts[0]} – ${endParts[0]}, ${endParts[1]}`;
  }
  return `${startStr} – ${endStr}`;
}

export default function ReportsPage() {
  const [selectedPreset, setSelectedPreset] = useState('7d');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Compute query dates based on filter preset
  const { from: dateFrom, to: dateTo } = useMemo(
    () => getPresetDates(selectedPreset),
    [selectedPreset]
  );

  const filterParams = useMemo(
    () => ({
      date_from: dateFrom,
      date_to: dateTo,
      team: selectedTeam !== 'all' ? selectedTeam : undefined,
      channel: selectedChannel !== 'all' ? selectedChannel : undefined,
    }),
    [dateFrom, dateTo, selectedTeam, selectedChannel]
  );

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useReports(filterParams);

  const dateRangeLabel = useMemo(
    () => formatDateRangeLabel(dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  // Export report to CSV
  const handleExport = useCallback(() => {
    if (!analytics) return;
    setIsExporting(true);

    try {
      const headers = ['Category', 'Metric', 'Value', 'Details'];
      const rows = [
        ['KPI', 'Open Tickets', analytics.kpis?.open_tickets ?? 0, 'Current backlog'],
        ['KPI', 'Resolved Tickets', analytics.kpis?.resolved_tickets ?? 0, 'Selected period'],
        ['KPI', 'Avg First Response (hrs)', analytics.kpis?.avg_first_response_hours ?? 0, 'First public reply'],
        ['KPI', 'Avg Resolution (hrs)', analytics.kpis?.avg_resolution_hours ?? 0, 'Created to resolved'],
        ['KPI', 'SLA Compliance (%)', `${analytics.kpis?.sla_compliance_pct ?? 0}%`, 'Within target'],
        ['KPI', 'CSAT / 5', analytics.kpis?.csat_avg ?? 0, `${analytics.kpis?.csat_responses ?? 0} responses`],
        ['Backlog', 'Unassigned', analytics.kpis?.backlog_summary?.unassigned ?? 0, 'Awaiting triage'],
        ['Backlog', 'In Progress', analytics.kpis?.backlog_summary?.in_progress ?? 0, 'Active tickets'],
        ['SLA', 'Within Target', analytics.sla?.within_target ?? 0, 'Within SLA'],
        ['SLA', 'Breached Target', analytics.sla?.breached_target ?? 0, 'Breached SLA'],
        ['SLA', 'Total Resolved', analytics.sla?.total_resolved ?? 0, 'Tickets evaluated'],
      ];

      // Add daily volume rows
      if (analytics.ticket_volume?.days) {
        analytics.ticket_volume.days.forEach((day) => {
          rows.push(['Ticket Volume', day.date, `Created: ${day.created}`, `Resolved: ${day.resolved}`]);
        });
      }

      // Add agent rows
      if (analytics.agent_performance?.agents) {
        analytics.agent_performance.agents.forEach((a) => {
          rows.push([
            'Agent Performance',
            a.agent_name,
            `Resolved: ${a.resolved}`,
            `First Response: ${a.avg_first_response_hours}h | SLA: ${a.sla_met_pct}% | CSAT: ${a.csat_avg}`,
          ]);
        });
      }

      const csv = toCsv(headers, rows);
      downloadCsv(csv, `reports-analytics-${dateFrom}-to-${dateTo}.csv`);
    } finally {
      setIsExporting(false);
    }
  }, [analytics, dateFrom, dateTo]);

  // Inline full-error screen if network completely breaks with no cached data
  if (isError && !analytics) {
    return (
      <main className="dashboard-content reports-page" aria-label="Reports & Analytics">
        <div className="reports-error-box">
          <Icon name="alert-circle" size={36} className="reports-error-icon" />
          <h2 className="reports-error-title">Unable to load reports</h2>
          <p className="reports-error-message">{getErrorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-content reports-page" aria-label="Reports & Analytics">
      {/* 1. Header Row */}
      <ReportsHeader
        onExport={handleExport}
        isExporting={isExporting}
        disabled={isLoading || isFetching}
      />

      {/* 2. Filters Row */}
      <ReportsFilters
        dateRangeLabel={dateRangeLabel}
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        backlogSummary={analytics?.kpis?.backlog_summary}
      />

      {/* 3. KPI Row (6 cards) */}
      <ReportsKpiRow
        kpis={analytics?.kpis}
        sla={analytics?.sla}
        isLoading={isLoading && !analytics}
      />

      {/* 4. Row 2 (grid 2fr 1fr): Ticket Volume + Resolution SLA */}
      <div className="reports-grid-row" aria-label="Volume and SLA Performance">
        <TicketVolumeCard
          data={analytics?.ticket_volume}
          isLoading={isLoading && !analytics}
        />
        <ResolutionSlaCard
          data={analytics?.sla}
          isLoading={isLoading && !analytics}
        />
      </div>

      {/* 5. Row 3 (grid 2fr 1fr): Agent Performance + Customer Satisfaction */}
      <div className="reports-grid-row" aria-label="Agent and Customer Outcomes">
        <AgentPerformanceTable
          data={analytics?.agent_performance}
          isLoading={isLoading && !analytics}
        />
        <CustomerSatisfactionCard
          data={analytics?.csat}
          isLoading={isLoading && !analytics}
        />
      </div>
    </main>
  );
}

