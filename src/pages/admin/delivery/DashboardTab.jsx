import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  Clock, 
  Map, 
  Zap, 
  CalendarClock, 
  XCircle, 
  AlertTriangle, 
  IndianRupee,
  Navigation,
  Target
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const mockChartData = Array.from({ length: 7 }, (_, i) => ({ value: 40 + Math.random() * 60 }));
const MiniChart = ({ color }) => (
  <div className="h-10 w-20">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={mockChartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${color})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const KPICard = ({ title, value, trend, trendUp, icon: Icon, colorClass, chartColor, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${colorClass.split(' ')[0]}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} shadow-sm`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
          {trend}%
        </div>
      </div>
      
      <div className="relative z-10">
        <h4 className="text-slate-500 font-semibold text-sm mb-1">{title}</h4>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
          <MiniChart color={chartColor} />
        </div>
      </div>
    </motion.div>
  );
};

export const DashboardTab = () => {
  const kpis = [
    { title: "Today's Deliveries", value: "248", trend: "12.5", trendUp: true, icon: Package, colorClass: "bg-blue-500 text-white", chartColor: "#3b82f6" },
    { title: "Active Deliveries", value: "42", trend: "5.2", trendUp: true, icon: Navigation, colorClass: "bg-indigo-500 text-white", chartColor: "#6366f1" },
    { title: "Delivered Today", value: "186", trend: "18.1", trendUp: true, icon: CheckCircle2, colorClass: "bg-emerald-500 text-white", chartColor: "#10b981" },
    { title: "Pending Deliveries", value: "20", trend: "2.4", trendUp: false, icon: Clock, colorClass: "bg-amber-500 text-white", chartColor: "#f59e0b" },
    { title: "Avg. Delivery Time", value: "18m", trend: "14.2", trendUp: true, icon: Zap, colorClass: "bg-purple-500 text-white", chartColor: "#a855f7" },
    { title: "Avg. Distance", value: "3.2km", trend: "1.1", trendUp: false, icon: Map, colorClass: "bg-cyan-500 text-white", chartColor: "#06b6d4" },
    { title: "Success Rate", value: "98.2%", trend: "0.5", trendUp: true, icon: Target, colorClass: "bg-teal-500 text-white", chartColor: "#14b8a6" },
    { title: "Express Deliveries", value: "156", trend: "22.4", trendUp: true, icon: Zap, colorClass: "bg-fuchsia-500 text-white", chartColor: "#d946ef" },
    { title: "Scheduled Deliveries", value: "42", trend: "4.2", trendUp: true, icon: CalendarClock, colorClass: "bg-sky-500 text-white", chartColor: "#0ea5e9" },
    { title: "Failed Deliveries", value: "2", trend: "50.0", trendUp: false, icon: AlertTriangle, colorClass: "bg-rose-500 text-white", chartColor: "#f43f5e" },
    { title: "Cancelled Orders", value: "5", trend: "12.0", trendUp: false, icon: XCircle, colorClass: "bg-slate-500 text-white", chartColor: "#64748b" },
    { title: "Delivery Revenue", value: "₹4,250", trend: "15.8", trendUp: true, icon: IndianRupee, colorClass: "bg-emerald-600 text-white", chartColor: "#059669" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Operations Overview</h2>
        <p className="text-slate-500 font-medium mt-1">Real-time metrics and performance of your delivery network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} delay={index * 0.05} />
        ))}
      </div>
    </div>
  );
};
