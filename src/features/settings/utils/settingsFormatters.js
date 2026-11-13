/**
 * Formats an ISO date into readable format: "October 12, 2026"
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatSettingsDate(dateVal) {
  if (!dateVal) return '–';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '–';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '–';
  }
}

/**
 * Formats an ISO date into relative sync time: "today at 9:42 AM" or date string
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatSyncTime(dateVal) {
  if (!dateVal) return 'today at 9:42 AM';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'today at 9:42 AM';
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `today at ${timeStr}`;
    }
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
  } catch {
    return 'today at 9:42 AM';
  }
}

