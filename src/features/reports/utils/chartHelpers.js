/**
 * Chart helpers for the Reports feature.
 * All are pure functions — no DOM or React dependencies.
 */

/**
 * Compute a "nice" y-axis ceiling for a given raw maximum value.
 * Rounds up to multiples of 5 / 10 / 25 / 50 / 100 etc. so the
 * gridline labels are always clean integers.
 *
 * @param {number} rawMax
 * @returns {number}
 */
export function niceMax(rawMax) {
  if (!rawMax || rawMax <= 0) return 10;
  if (rawMax <= 5)   return 5;
  if (rawMax <= 10)  return 10;
  if (rawMax <= 25)  return 25;
  if (rawMax <= 50)  return 50;
  if (rawMax <= 75)  return 75;
  if (rawMax <= 100) return 100;
  // For larger values: round up to the nearest order-of-magnitude step
  const mag  = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const step = mag >= 100 ? mag / 2 : mag;
  return Math.ceil(rawMax / step) * step;
}

/**
 * Build evenly-spaced y-axis step values from 0 up to yMax.
 *
 * @param {number} yMax
 * @param {number} [stepCount=4]
 * @returns {number[]}
 */
export function buildYSteps(yMax, stepCount = 4) {
  if (yMax === 0) return [0];
  const step = yMax / stepCount;
  return Array.from({ length: stepCount + 1 }, (_, i) => Math.round(i * step));
}

/**
 * Decide how often to show x-axis labels so they don't crowd.
 * Returns the label step (show every Nth label).
 *
 * @param {number} totalBars
 * @param {number} [maxLabels=10]
 * @returns {number}
 */
export function xLabelStep(totalBars, maxLabels = 10) {
  if (totalBars <= maxLabels) return 1;
  return Math.ceil(totalBars / maxLabels);
}

/**
 * Compute adaptive bar geometry based on the number of data points.
 *
 * @param {number} count  — number of groups (days)
 * @returns {{ groupW: number, barW: number, barGap: number, groupGap: number }}
 */
export function barGeometry(count) {
  if (count <= 7)  return { groupW: 52, barW: 18, barGap: 6,  groupGap: 16 };
  if (count <= 14) return { groupW: 42, barW: 14, barGap: 5,  groupGap: 12 };
  if (count <= 31) return { groupW: 32, barW: 10, barGap: 4,  groupGap: 10 };
  return               { groupW: 24, barW: 7,  barGap: 3,  groupGap: 8  };
}

/**
 * Clamp a value between min and max.
 *
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Compute SVG strokeDasharray / strokeDashoffset for a progress ring.
 *
 * @param {number} pct    — 0–100
 * @param {number} radius — SVG circle radius
 * @returns {{ circumference: number, dashArray: string, dashOffset: number }}
 */
export function ringDash(pct, radius) {
  const circumference = 2 * Math.PI * radius;
  const safePct       = clamp(pct, 0, 100);
  const arcLen        = (safePct / 100) * circumference;
  return {
    circumference,
    dashArray:  `${arcLen} ${circumference}`,
    dashOffset: 0, // arc starts at top via transform="rotate(-90)"
  };
}

