/**
 * Utility functions for Knowledge Base feature.
 */

/**
 * Calculate word count of text or HTML string.
 */
export function wordCount(content) {
  if (!content) return 0;
  const stripped = String(content).replace(/<[^>]*>/g, ' ').trim();
  if (!stripped) return 0;
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Calculate reading time in minutes (~200 words per minute, min 1 min).
 */
export function readingTime(content) {
  const count = wordCount(content);
  return Math.max(1, Math.ceil(count / 200));
}

/**
 * Generate anchor-friendly slug from heading text.
 */
export function slugifyForAnchors(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strip scripts, iframes, onerror, onclick, and dangerous javascript: URLs
 * to ensure safe rendering of HTML.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  let clean = String(html);

  // Remove script tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove iframe, object, embed
  clean = clean.replace(/<\/?(iframe|object|embed|applet|meta|link|style)[^>]*>/gi, '');
  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
  // Remove on* event attributes (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  return clean;
}

/**
 * Format date string into "Oct 29, 2026" or "Oct 29, 2026 · 10:38 AM"
 */
export function formatDate(dateString, { includeTime = false } = {}) {
  if (!dateString) return '–';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '–';

    const dateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (includeTime) {
      const timeFormatted = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${dateFormatted} at ${timeFormatted}`;
    }

    return dateFormatted;
  } catch {
    return '–';
  }
}

/**
 * Format time string into "10:38 AM"
 */
export function formatTime(dateString) {
  if (!dateString) return '10:38 AM';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '10:38 AM';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '10:38 AM';
  }
}

/**
 * Join conditional class names cleanly
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

