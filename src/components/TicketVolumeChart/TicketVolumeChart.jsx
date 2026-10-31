import { useState } from 'react';
import { ticketVolumeData } from '../../data/dashboardData';
import './TicketVolumeChart.css';

export default function TicketVolumeChart() {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // SVG Chart Geometry Constants
  const svgWidth = 620;
  const svgHeight = 220;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 14;
  const paddingBottom = 28;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxY = 100;
  const yTicks = [100, 75, 50, 25, 0];

  const groupWidth = chartWidth / ticketVolumeData.length;
  const barWidth = 14;
  const barGap = 3;

  return (
    <div className="ticket-volume-card">
      <div className="ticket-volume-card__header">
        <h3 className="ticket-volume-card__title">Ticket volume</h3>
        <div className="ticket-volume-card__legend">
          <div className="ticket-volume-card__legend-item">
            <span className="ticket-volume-card__legend-color ticket-volume-card__legend-color--created" />
            <span className="ticket-volume-card__legend-label">Created</span>
          </div>
          <div className="ticket-volume-card__legend-item">
            <span className="ticket-volume-card__legend-color ticket-volume-card__legend-color--resolved" />
            <span className="ticket-volume-card__legend-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="ticket-volume-chart__container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="ticket-volume-chart__svg"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Ticket volume bar chart comparing created and resolved tickets per day"
        >
          {/* Y Axis Gridlines & Labels */}
          {yTicks.map((tick) => {
            const y = paddingTop + chartHeight - (tick / maxY) * chartHeight;
            return (
              <g key={tick} className="ticket-volume-chart__grid-row">
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="ticket-volume-chart__axis-text"
                >
                  {tick}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  className="ticket-volume-chart__grid-line"
                />
              </g>
            );
          })}

          {/* Grouped Bars */}
          {ticketVolumeData.map((d, index) => {
            const groupCenterX =
              paddingLeft + index * groupWidth + groupWidth / 2;
            const createdX = groupCenterX - barWidth - barGap / 2;
            const resolvedX = groupCenterX + barGap / 2;

            const createdHeight = (d.created / maxY) * chartHeight;
            const createdY = paddingTop + chartHeight - createdHeight;

            const resolvedHeight = (d.resolved / maxY) * chartHeight;
            const resolvedY = paddingTop + chartHeight - resolvedHeight;

            const isHovered = activeTooltip?.day === d.day;

            return (
              <g
                key={d.day}
                className="ticket-volume-chart__bar-group"
                onMouseEnter={() =>
                  setActiveTooltip({
                    day: d.day,
                    created: d.created,
                    resolved: d.resolved,
                    x: groupCenterX,
                    y: Math.min(createdY, resolvedY),
                  })
                }
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* Invisible hover capture rect covering the whole column */}
                <rect
                  x={paddingLeft + index * groupWidth}
                  y={paddingTop}
                  width={groupWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="ticket-volume-chart__hover-trigger"
                />

                {/* Optional hover background pillar */}
                {isHovered && (
                  <rect
                    x={paddingLeft + index * groupWidth + 6}
                    y={paddingTop}
                    width={groupWidth - 12}
                    height={chartHeight}
                    rx="4"
                    className="ticket-volume-chart__hover-bg"
                  />
                )}

                {/* Created Bar (Indigo) */}
                <rect
                  x={createdX}
                  y={createdY}
                  width={barWidth}
                  height={createdHeight}
                  rx="3"
                  className={`ticket-volume-chart__bar ticket-volume-chart__bar--created ${
                    isHovered ? 'ticket-volume-chart__bar--highlight' : ''
                  }`}
                />

                {/* Resolved Bar (Green) */}
                <rect
                  x={resolvedX}
                  y={resolvedY}
                  width={barWidth}
                  height={resolvedHeight}
                  rx="3"
                  className={`ticket-volume-chart__bar ticket-volume-chart__bar--resolved ${
                    isHovered ? 'ticket-volume-chart__bar--highlight' : ''
                  }`}
                />

                {/* Day Label (X-Axis) */}
                <text
                  x={groupCenterX}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`ticket-volume-chart__day-text ${
                    isHovered ? 'ticket-volume-chart__day-text--active' : ''
                  }`}
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* HTML Overlay Floating Tooltip */}
        {activeTooltip && (
          <div
            className="ticket-volume-chart__tooltip"
            style={{
              left: `${(activeTooltip.x / svgWidth) * 100}%`,
              top: `${(activeTooltip.y / svgHeight) * 100}%`,
            }}
          >
            <div className="ticket-volume-chart__tooltip-day">
              {activeTooltip.day}
            </div>
            <div className="ticket-volume-chart__tooltip-row">
              <span className="ticket-volume-chart__tooltip-dot ticket-volume-card__legend-color--created" />
              <span>Created:</span>
              <strong className="tabular-nums">{activeTooltip.created}</strong>
            </div>
            <div className="ticket-volume-chart__tooltip-row">
              <span className="ticket-volume-chart__tooltip-dot ticket-volume-card__legend-color--resolved" />
              <span>Resolved:</span>
              <strong className="tabular-nums">{activeTooltip.resolved}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

