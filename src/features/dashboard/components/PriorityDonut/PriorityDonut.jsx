import { useState } from 'react';
import './PriorityDonut.css';

export default function PriorityDonut({
  data = [],
  centerLabel = 'tickets',
  emptyText,
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // Zero-division guard: nothing to draw when the scope has no tickets
  if (!data || data.length === 0 || totalCount <= 0) {
    return (
      <div className="priority-donut-card">
        <div className="priority-donut-card__header">
          <h3 className="priority-donut-card__title">Priority distribution</h3>
        </div>
        <p className="priority-donut__empty">{emptyText || 'No tickets to chart yet.'}</p>
      </div>
    );
  }

  // SVG Geometry
  const size = 150;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Only draw non-empty priorities; the legend still lists every bucket.
  const visibleSlices = data.filter((item) => item.count > 0);

  // Gap between slices in pixels on circumference
  const gap = 2.5;
  const effectiveCircumference = circumference - visibleSlices.length * gap;

  // Pre-calculate pure slice offsets without mutating variables during render.
  // Each slice is separated by exactly `gap` pixels, regardless of how
  // uneven the individual percentages are.
  const slices = visibleSlices.map((slice, index) => {
    const priorPercent = visibleSlices
      .slice(0, index)
      .reduce((sum, item) => sum + item.count / totalCount, 0);
    const slicePercent = slice.count / totalCount;
    const dashLength = slicePercent * effectiveCircumference;
    const offset =
      circumference -
      (priorPercent * effectiveCircumference + index * gap);

    return {
      ...slice,
      dashLength,
      offset,
    };
  });

  return (
    <div className="priority-donut-card">
      <div className="priority-donut-card__header">
        <h3 className="priority-donut-card__title">Priority distribution</h3>
      </div>

      <div className="priority-donut-card__body">
        {/* Donut Chart SVG */}
        <div className="priority-donut__chart-wrapper">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="priority-donut__svg"
            role="img"
            aria-label={`Donut chart showing ${totalCount} tickets across priority levels`}
          >
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              {slices.map((slice) => {
                const isHovered = hoveredSlice?.id === slice.id;

                return (
                  <circle
                    key={slice.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 2.5 : strokeWidth}
                    strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                    strokeDashoffset={slice.offset}
                    className="priority-donut__slice"
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </g>

            {/* Center Text */}
            <text
              x={size / 2}
              y={size / 2 - 7}
              textAnchor="middle"
              dominantBaseline="central"
              className="priority-donut__center-num tabular-nums"
            >
              {totalCount}
            </text>
            <text
              x={size / 2}
              y={size / 2 + 13}
              textAnchor="middle"
              dominantBaseline="central"
              className="priority-donut__center-sub"
            >
              {centerLabel}
            </text>
          </svg>

          {/* Hover Tooltip */}
          {hoveredSlice && (
            <div className="priority-donut__tooltip">
              <span
                className="priority-donut__tooltip-dot"
                style={{ backgroundColor: hoveredSlice.color }}
              />
              <span className="priority-donut__tooltip-text">
                {hoveredSlice.label}: <strong>{hoveredSlice.count}</strong> ({hoveredSlice.percentage})
              </span>
            </div>
          )}
        </div>

        {/* Legend List */}
        <div className="priority-donut__legend">
          {data.map((item) => {
            const isHovered = hoveredSlice?.id === item.id;
            return (
              <div
                key={item.id}
                className={`priority-donut__legend-row ${
                  isHovered ? 'priority-donut__legend-row--active' : ''
                }`}
                onMouseEnter={() => setHoveredSlice(item)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <span
                  className="priority-donut__legend-dot"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="priority-donut__legend-name">
                  {item.label}
                </span>
                <span className="priority-donut__legend-stat tabular-nums">
                  <strong>{item.count}</strong> · {item.percentage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
