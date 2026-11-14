/**
 * Hook for managing Team Performance analytics, date ranges, and CSV export.
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import teamService from '../services/teamService';

export const DATE_PRESETS = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '14d', label: 'Last 14 days', days: 14 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'this_month', label: 'This month' },
];

export function useTeamPerformance() {
  const [datePreset, setDatePreset] = useState('7d');
  const [isExporting, setIsExporting] = useState(false);

  // Compute date range from preset
  const dateRange = useMemo(() => {
    const now = new Date();
    const to = new Date(now);
    let from = new Date(now);

    if (datePreset === 'this_month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      const preset = DATE_PRESETS.find((p) => p.id === datePreset) || DATE_PRESETS[0];
      from.setDate(from.getDate() - (preset.days - 1));
    }

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }, [datePreset]);

  // Query performance data
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team', 'performance', dateRange.from, dateRange.to],
    queryFn: ({ signal }) => teamService.getPerformance(dateRange, signal),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  // Export CSV handler
  const exportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      const blob = await teamService.exportPerformanceCsv(dateRange);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `team-performance-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setIsExporting(false);
    }
  }, [dateRange]);

  return {
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
  };
}

export default useTeamPerformance;
