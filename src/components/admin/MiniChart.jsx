import React from 'react';

// ─── SVG Line Chart ──────────────────────────────────────────────────────────
export const LineChart = ({
  data = [],
  width = 300,
  height = 120,
  color = '#0f766e',
  fillColor,
  strokeWidth = 2,
  showDots = true,
  showGrid = false,
  labels = [],
  className = '',
}) => {
  if (data.length === 0) return null;

  const padding = { top: 10, right: 10, bottom: labels.length ? 24 : 10, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1 || 1;
  const range = max - min || 1;

  const points = data.map((val, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * chartW,
    y: padding.top + chartH - ((val - min) / range) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {showGrid && Array.from({ length: 4 }).map((_, i) => {
        const y = padding.top + (i / 3) * chartH;
        return <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      {fillColor && <path d={areaPath} fill={fillColor} opacity={0.15} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={2} />
      ))}
      {labels.length > 0 && labels.map((label, i) => {
        const x = padding.left + (i / (labels.length - 1 || 1)) * chartW;
        return (
          <text key={i} x={x} y={height - 4} textAnchor="middle" className="text-[10px] fill-slate-400" fontFamily="inherit">
            {label}
          </text>
        );
      })}
    </svg>
  );
};

// ─── SVG Bar Chart ───────────────────────────────────────────────────────────
export const BarChart = ({
  data = [],
  labels = [],
  width = 300,
  height = 120,
  color = '#0f766e',
  barRadius = 4,
  className = '',
}) => {
  if (data.length === 0) return null;

  const padding = { top: 10, right: 10, bottom: labels.length ? 24 : 10, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data) * 1.1 || 1;
  const barW = Math.min(chartW / data.length * 0.6, 40);
  const gap = chartW / data.length;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {data.map((val, i) => {
        const barH = (val / max) * chartH;
        const x = padding.left + i * gap + (gap - barW) / 2;
        const y = padding.top + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={barRadius} ry={barRadius} opacity={0.85} />
            {labels[i] && (
              <text x={x + barW / 2} y={height - 4} textAnchor="middle" className="text-[10px] fill-slate-400" fontFamily="inherit">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
export const DonutChart = ({
  data = [],
  colors = ['#0f766e', '#10b981', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'],
  size = 120,
  strokeWidth = 20,
  centerLabel = '',
  centerValue = '',
  className = '',
}) => {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + (d.value || d), 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let accumulated = 0;

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item, i) => {
        const value = item.value || item;
        const pct = value / total;
        const offset = circumference * (1 - pct);
        const rotation = (accumulated / total) * 360 - 90;
        accumulated += value;

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        );
      })}
      {(centerLabel || centerValue) && (
        <g>
          {centerValue && (
            <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800" fontFamily="inherit">
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-400" fontFamily="inherit">
              {centerLabel}
            </text>
          )}
        </g>
      )}
    </svg>
  );
};

// ─── SVG Area Chart ──────────────────────────────────────────────────────────
export const AreaChart = ({
  data = [],
  width = 300,
  height = 120,
  color = '#0f766e',
  gradientId = 'areaGrad',
  labels = [],
  className = '',
}) => {
  if (data.length === 0) return null;

  const padding = { top: 10, right: 10, bottom: labels.length ? 24 : 10, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1 || 1;
  const range = max - min || 1;

  const points = data.map((val, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * chartW,
    y: padding.top + chartH - ((val - min) / range) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg width="100%" height={height} className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {labels.length > 0 && labels.map((label, i) => {
        const x = padding.left + (i / (labels.length - 1 || 1)) * chartW;
        return (
          <text key={i} x={x} y={height - 4} textAnchor="middle" className="text-[10px] fill-slate-400" fontFamily="inherit">
            {label}
          </text>
        );
      })}
    </svg>
  );
};
