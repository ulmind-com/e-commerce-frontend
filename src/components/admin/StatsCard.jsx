import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_MAP = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-700',
    trend: 'text-primary-600',
  },
  accent: {
    bg: 'bg-accent-50',
    icon: 'bg-emerald-100 text-emerald-700',
    trend: 'text-emerald-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-700',
    trend: 'text-blue-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-700',
    trend: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-700',
    trend: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-700',
    trend: 'text-purple-600',
  },
  slate: {
    bg: 'bg-slate-50',
    icon: 'bg-slate-100 text-slate-700',
    trend: 'text-slate-600',
  },
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'primary',
  loading = false,
  subtitle,
  className = '',
}) => {
  const colorSet = COLOR_MAP[color] || COLOR_MAP.primary;

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${className}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-7 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-slate-900 tracking-tight"
          >
            {value}
          </motion.p>
          {(trend !== undefined || subtitle) && (
            <div className="flex items-center gap-1.5 mt-1">
              {trend !== undefined && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600' :
                  trendDirection === 'down' ? 'bg-red-50 text-red-600' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {trendDirection === 'up' ? <TrendingUp size={12} /> :
                   trendDirection === 'down' ? <TrendingDown size={12} /> :
                   <Minus size={12} />}
                  {trend}%
                </span>
              )}
              {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorSet.icon}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
