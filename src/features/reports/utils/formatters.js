/**
 * Formatting utilities for the Reports feature.
 * All functions are pure and handle null / undefined / zero defensively.
 */

/**
 * Format a duration in fractional hours to a human-readable string.
 * Examples: 0.5 → "30m", 1.5 → "1h 30m", 25 → "1d 1h"
 *
 * @param {number|null} hours
 * @returns {string}
 */
export function formatDuration(hours) {
  if (hours == null || !Number.isFinite(hours) || hours < 0) return '–';
  if (hours === 0) return '0m';

  const totalMinutes = Math.round(hours * 60);
  const days    = Math.floor(totalMinutes / 1440);
  const remMins = totalMinutes % 1440;
  const hrs     = Math.floor(remMins / 60);
  const mins    = remMins % 60;

  if (days > 0) {
    return hrs > 0 ? `${days}d ${hrs}h` : `${days}d`;
  }
  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Format a number as a percentage string with one decimal place.
 * Returns '–' for null/undefined.
 *
 * @param {number|null} value  — already a percentage (e.g. 87.3)
 * @param {number} [digits=1]
 * @returns {string}
 */
export function formatPct(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return '–';
  return `${value.toFixed(digits)}%`;
}

/**
 * Format a CSAT average (0–5) with one decimal.
 *
 * @param {number|null} value
 * @returns {string}
 */
export function formatCsat(value) {
  if (value == null || !Number.isFinite(value)) return '–';
  return value.toFixed(1);
}

/**
 * Format an ISO date string as a short label (e.g. "Nov 7").
 *
 * @param {string} isoDate  — "2024-11-07"
 * @param {string} [locale='en-US']
 * @returns {string}
 */
export function formatShortDate(isoDate, locale = 'en-US') {
  if (!isoDate) return '';
  // Parse as local midnight to avoid UTC offset shifting the day
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/**
 * Format an ISO timestamp or date as "Nov 7, 2024".
 *
 * @param {string} iso
 * @returns {string}
 */
export function formatMediumDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Compute the ISO date string N days before today.
 *
 * @param {number} n
 * @returns {string}  "YYYY-MM-DD"
 */
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * Today as an ISO date string "YYYY-MM-DD".
 *
 * @returns {string}
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * First day of the current month as "YYYY-MM-DD".
 */
export function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

/**
 * First day of the previous month as "YYYY-MM-DD".
 */
export function startOfLastMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10);
}

/**
 * Last day of the previous month as "YYYY-MM-DD".
 */
export function endOfLastMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10);
}

/**
 * Truncate a string to max chars, adding "…" if needed.
 *
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export function truncate(str, max = 32) {
  if (!str) return '';
  const s = String(str).trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * Generate a CSV string from an array of objects.
 *
 * @param {string[]} headers  — column headers
 * @param {string[][]} rows   — data rows (each cell is a string)
 * @returns {string}
 */
export function toCsv(headers, rows) {
  const escape = (cell) => {
    const s = String(cell ?? '').replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ];
  return lines.join('\r\n');
}

/**
 * Trigger a browser download for a CSV string.
 *
 * @param {string} csvString
 * @param {string} filename
 */
export function downloadCsv(csvString, filename = 'report.csv') {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
