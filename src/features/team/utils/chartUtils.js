/**
 * Chart calculations for bar heights, axes, and rounding.
 */

/**
 * Return a visually nice maximum value for the Y-axis.
 */
export function niceMax(rawMax) {
  if (rawMax <= 0) return 10;
  if (rawMax <= 10) return 10;
  if (rawMax <= 20) return 20;
  if (rawMax <= 40) return 40;
  if (rawMax <= 60) return 60;
  if (rawMax <= 80) return 80;
  if (rawMax <= 100) return 100;
  return Math.ceil(rawMax / 20) * 20;
}

/**
 * Generate 5 evenly-spaced tick values from 0 up to max.
 */
export function buildYSteps(max, count = 4) {
  const steps = [];
  const interval = max / count;
  for (let i = 0; i <= count; i++) {
    steps.push(Math.round(i * interval));
  }
  return steps;
}
