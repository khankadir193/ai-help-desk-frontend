import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import useTeamPerformance, { DATE_PRESETS } from '../hooks/useTeamPerformance';
import TeamPerformanceKpis from '../components/TeamPerformanceKpis/TeamPerformanceKpis';
import ThroughputCard from '../components/ThroughputCard/ThroughputCard';
import WorkloadCard from '../components/WorkloadCard/WorkloadCard';
import AgentPerformanceTable from '../components/AgentPerformanceTable/AgentPerformanceTable';
import { formatDateRange, formatDateRangeCompact } from '../utils/teamFormatters';
import { useClickOutside } from '../../../hooks/useClickOutside';
import './TeamPerformancePage.css';

export default function TeamPerformancePage() {
  const { setHeaderProps } = useOutletContext();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    datePreset,
    setDatePreset,
    dateRange,
    exportCsv,
    isExporting,
  } = useTeamPerformance();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const kpis = data?.kpis;
  const throughput = data?.throughput;
  const workload = data?.workload;
  const agents = data?.agents;
  const meta = data?.meta;

  const dateRangeLabel = formatDateRange(dateRange.from, dateRange.to);
  const dateRangeCompactLabel = formatDateRangeCompact(dateRange.from, dateRange.to);
  const activePresetLabel = DATE_PRESETS.find((p) => p.id === datePreset)?.label || 'Date range';

  const dynamicSubtext = meta?.is_illustrative
    ? `Illustrative data · All ${kpis?.active_agents_count || 8} active agents · ${dateRangeCompactLabel}`
    : `All ${kpis?.active_agents_count || (agents?.length ?? 8)} active agents · ${dateRangeCompactLabel}`;

  // Update header props in parent layout
  useEffect(() => {
    setHeaderProps({
      title: 'Team performance',
      subtext: dynamicSubtext,
      actions: (
        <div className="perf-header-actions">
          {/* Date range dropdown */}
          <div className="perf-date-dropdown-wrap" ref={dropdownRef}>
            <button
              type="button"
              className="perf-btn-date"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <span>{dateRangeLabel || activePresetLabel}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`perf-chevron ${isDropdownOpen ? 'perf-chevron--open' : ''}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="perf-date-dropdown" role="listbox">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    role="option"
                    aria-selected={datePreset === preset.id}
                    className={`perf-date-dropdown-item ${
                      datePreset === preset.id ? 'perf-date-dropdown-item--active' : ''
                    }`}
                    onClick={() => {
                      setDatePreset(preset.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            className="perf-btn-export"
            onClick={exportCsv}
            disabled={isExporting || isLoading}
            aria-label="Export team performance CSV"
          >
            {isExporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      ),
    });
  }, [setHeaderProps, dynamicSubtext, dateRangeLabel, activePresetLabel, isDropdownOpen, datePreset, isExporting, isLoading, exportCsv, setDatePreset]);

  if (isError) {
    return (
      <div className="team-error-state" role="alert">
        <p className="team-error-message">
          Failed to load team performance: {error?.message || 'Server error'}
        </p>
        <button
          type="button"
          className="team-retry-btn"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`perf-content ${isFetching && !isLoading ? 'perf-content--fetching' : ''}`}>
      {/* Refetch progress bar */}
      {isFetching && !isLoading && (
        <div className="perf-progress-bar" role="progressbar" aria-label="Updating data" />
      )}

      {/* Row 1: KPI Cards */}
      <TeamPerformanceKpis kpis={kpis} isLoading={isLoading} />

      {/* Row 2: Throughput (2fr) & Workload (1fr) */}
      <div className="perf-grid-row2">
        <ThroughputCard throughput={throughput} isLoading={isLoading} />
        <WorkloadCard workload={workload} isLoading={isLoading} />
      </div>

      {/* Row 3: Agent Performance Table */}
      <AgentPerformanceTable
        agents={agents}
        metaText={meta?.meta_text}
        footnote={meta?.footnote}
        isLoading={isLoading}
      />
    </div>
  );
}
