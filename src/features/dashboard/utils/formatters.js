/**
 * Formatting helpers for values returned by GET /api/v1/dashboard.
 * They are intentionally defensive: a missing aggregate is rendered as
 * "not available" instead of being replaced with sample data.
 */

const DASH = '–';

/**
 * Format a fractional-hours duration as "45m", "4h 05m", or "2d 3h".
 *
 * @param {number|null|undefined} hours
 * @returns {string}
 */
export function formatDuration(hours) {
  if (hours == null) return DASH;

  const numeric = Number(hours);
  if (!Number.isFinite(numeric) || numeric < 0) return DASH;

  const totalMinutes = Math.round(numeric * 60);
  if (totalMinutes === 0) return '0m';

  const days = Math.floor(totalMinutes / 1440);
  const remainder = totalMinutes % 1440;
  const wholeHours = Math.floor(remainder / 60);
  const minutes = remainder % 60;

  if (days > 0) {
    return wholeHours > 0 ? `${days}d ${wholeHours}h` : `${days}d`;
  }
  if (wholeHours > 0) {
    return minutes > 0
      ? `${wholeHours}h ${String(minutes).padStart(2, '0')}m`
      : `${wholeHours}h`;
  }
  return `${minutes}m`;
}

/**
 * Map the backend's seven UTC daily buckets onto chart rows with short
 * weekday labels. The API returns `{ days, total_created, total_resolved }`;
 * a bare array is also accepted for defensiveness. Dates are parsed as UTC
 * midnight so the label cannot shift by a day in western timezones.
 *
 * @param {{days?: Array<{date: string, created: number, resolved: number}>}
 *   | Array<{date: string, created: number, resolved: number}>} volume
 * @returns {Array<{label: string, created: number, resolved: number}>}
 */
export function formatVolumeRows(volume) {
  const days = Array.isArray(volume)
    ? volume
    : Array.isArray(volume?.days)
      ? volume.days
      : [];
  if (days.length === 0) return [];

  return days.map((day, index) => {
    const isoDate = typeof day?.date === 'string' ? day.date : '';
    const [year, month, date] = isoDate.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, date));
    const isValidDate =
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(date) &&
      !Number.isNaN(parsed.getTime());

    return {
      label: isValidDate
        ? parsed.toLocaleDateString('en-US', {
            weekday: 'short',
            timeZone: 'UTC',
          })
        : `Day ${index + 1}`,
      created: Number(day?.created) || 0,
      resolved: Number(day?.resolved) || 0,
    };
  });
}

/**
 * Human-readable ticket reference used by the recent-ticket list.
 *
 * @param {string|number|null|undefined} id
 * @returns {string}
 */
export function formatTicketId(id) {
  if (id === null || id === undefined || id === '') return `TCK-${DASH}`;
  return `TCK-${String(id).padStart(4, '0')}`;
}

export default { formatDuration, formatVolumeRows, formatTicketId };
