import React from 'react';

export const ChartCard = ({
  title,
  subtitle,
  action,
  loading = false,
  children,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-48 bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};
