/**
 * Formats an ISO timestamp as a compact relative time string ("2m ago").
 * Returns null for missing/invalid values.
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  try {
    const timestamp = new Date(dateStr).getTime();
    if (!Number.isFinite(timestamp)) return dateStr;

    // Clamp future timestamps (clock skew) to "just now"
    const diffMs = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(diffMs / 60000);
    if (diffMs < 45000) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(diffMs / 3600000);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(diffMs / 86400000);
    if (days < 7) return `${days}d ago`;

    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default timeAgo;
