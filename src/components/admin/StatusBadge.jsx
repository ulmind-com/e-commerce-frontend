import React from 'react';

const STATUS_COLORS = {
  // Order statuses
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  'in-transit': 'bg-amber-50 text-amber-700 border-amber-200',
  in_transit: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-amber-50 text-amber-700 border-amber-200',
  preparing: 'bg-amber-50 text-amber-700 border-amber-200',

  cancelled: 'bg-red-50 text-red-700 border-red-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  'out-of-stock': 'bg-red-50 text-red-700 border-red-200',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200',

  refunded: 'bg-blue-50 text-blue-700 border-blue-200',
  returned: 'bg-blue-50 text-blue-700 border-blue-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  inactive: 'bg-slate-50 text-slate-600 border-slate-200',
  disabled: 'bg-slate-50 text-slate-600 border-slate-200',

  // Stock statuses
  'in-stock': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'low-stock': 'bg-amber-50 text-amber-700 border-amber-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',

  // Default
  default: 'bg-slate-50 text-slate-600 border-slate-200',
};

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  const colorClass = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.default;

  const displayText = status
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${colorClass} ${className}`}
    >
      {displayText}
    </span>
  );
};
