/**
 * Formatters for durations, percentages, dates, and numbers in the Team feature.
 */

/**
 * Format hours into "Xm", "Xh Ym", or "Xm Ys" format.
 */
export function formatDuration(hours, options = {}) {
  if (hours == null || isNaN(hours)) return '–';

  const totalSeconds = Math.round(hours * 3600);
  if (totalSeconds < 0) return '–';

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (options.includeSeconds && h === 0) {
    if (m === 0) return `${s}s`;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }

  if (h === 0) {
    return `${m}m`;
  }

  if (options.padMinutes) {
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format percentage value.
 */
export function formatPct(val, digits = 0) {
  if (val == null || isNaN(val)) return '–';
  return `${Number(val).toFixed(digits)}%`;
}

/**
 * Format CSAT score out of 5.
 */
export function formatCsat(val) {
  if (val == null || isNaN(val)) return '–';
  return Number(val).toFixed(1);
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format ISO date string into "Oct 23"
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * Format ISO date range compact e.g. "Oct 23–29, 2026"
 */
export function formatDateRangeCompact(fromStr, toStr) {
  if (!fromStr || !toStr) return '';
  const d1 = new Date(fromStr);
  const d2 = new Date(toStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';

  // Local components: range bounds are built from local Date objects, so UTC
  // getters shift the label ±1 day on non-UTC timezones (e.g. "to" at local
  // 23:59 parses back past UTC midnight).
  const m1 = MONTH_NAMES[d1.getMonth()];
  const day1 = d1.getDate();
  const m2 = MONTH_NAMES[d2.getMonth()];
  const day2 = d2.getDate();
  const year2 = d2.getFullYear();

  if (m1 === m2) {
    return `${m1} ${day1}–${day2}, ${year2}`;
  }
  return `${m1} ${day1} – ${m2} ${day2}, ${year2}`;
}

/**
 * Format ISO date range full e.g. "Oct 23 – Oct 29, 2026"
 */
export function formatDateRange(fromStr, toStr) {
  if (!fromStr || !toStr) return '';
  const d1 = new Date(fromStr);
  const d2 = new Date(toStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';

  // Local components — see formatDateRangeCompact above.
  const m1 = MONTH_NAMES[d1.getMonth()];
  const day1 = d1.getDate();
  const m2 = MONTH_NAMES[d2.getMonth()];
  const day2 = d2.getDate();
  const year2 = d2.getFullYear();

  return `${m1} ${day1} – ${m2} ${day2}, ${year2}`;
}
