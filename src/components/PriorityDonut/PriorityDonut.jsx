import { useState } from 'react';
import { priorityData } from '../../data/dashboardData';
import './PriorityDonut.css';

export default function PriorityDonut() {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const totalOpen = priorityData.reduce((sum, item) => sum + item.count, 0);

  // SVG Geometry
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Gap between slices in pixels on circumference
  const gap = 2.5;
  const effectiveCircumference = circumference - priorityData.length * gap;

  // Pre-calculate pure slice offsets without mutating variables during render
  const slices = priorityData.map((slice, index) => {
    const priorPercent = priorityData
      .slice(0, index)
      .reduce((sum, item) => sum + item.count / totalOpen, 0);
    const slicePercent = slice.count / totalOpen;
    const dashLength = slicePercent * effectiveCircumference;
    const offset =
      circumference -
      priorPercent * effectiveCircumference -
      priorPercent * gap * priorityData.length;

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
            aria-label={`Donut chart showing ${totalOpen} open tickets across priority levels`}
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
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                    strokeDashoffset={slice.offset}
                    className="priority-donut__slice"
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </g>

            {/* Center Text (128 open) */}
            <text
              x={size / 2}
              y={size / 2 - 2}
              textAnchor="middle"
              className="priority-donut__center-num tabular-nums"
            >
              {totalOpen}
            </text>
            <text
              x={size / 2}
              y={size / 2 + 16}
              textAnchor="middle"
              className="priority-donut__center-sub"
            >
              open
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
          {priorityData.map((item) => {
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
                <div className="priority-donut__legend-left">
                  <span
                    className="priority-donut__legend-dot"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="priority-donut__legend-name">
                    {item.label}
                  </span>
                </div>
                <div className="priority-donut__legend-stat tabular-nums">
                  <strong>{item.count}</strong> · {item.percentage}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
