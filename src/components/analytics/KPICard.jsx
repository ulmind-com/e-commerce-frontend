import React from 'react';
import { motion } from 'framer-motion';

export default function KPICard({ title, value, icon: Icon, trend, trendValue, colorClass }) {
  // Map the previous bg- classes to lighter equivalents for light mode
  const bgMap = {
    'bg-emerald-500': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'bg-blue-500': 'bg-blue-50 text-blue-600 border-blue-100',
    'bg-purple-500': 'bg-purple-50 text-purple-600 border-purple-100',
    'bg-red-500': 'bg-red-50 text-red-600 border-red-100',
    'bg-indigo-500': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const styleClass = bgMap[colorClass] || 'bg-slate-50 text-slate-600 border-slate-100';
  const iconColorClass = styleClass.split(' ')[1]; // Extracts text-color

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${styleClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-4 text-sm font-medium">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}%
          </span>
          <span className="text-slate-400 text-xs">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
