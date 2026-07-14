import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Clock, CheckCircle, XCircle, IndianRupee, RefreshCw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function ReturnKPICards({ kpis, trendData }) {
  const cards = [
    {
      title: 'Total Requests',
      value: kpis.total_requests || 0,
      icon: RotateCcw,
      color: 'blue',
      trend: '+12%',
      isPositive: false
    },
    {
      title: 'Pending Returns',
      value: kpis.pending || 0,
      icon: Clock,
      color: 'amber',
      trend: '-5%',
      isPositive: true
    },
    {
      title: 'Approved Returns',
      value: kpis.approved || 0,
      icon: CheckCircle,
      color: 'emerald',
      trend: '+18%',
      isPositive: true
    },
    {
      title: 'Refund Amount',
      value: `₹${(kpis.refund_amount || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'purple',
      trend: '+8%',
      isPositive: false
    },
    {
      title: 'Exchange Requests',
      value: kpis.exchange_requests || 0,
      icon: RefreshCw,
      color: 'indigo',
      trend: '+2%',
      isPositive: true
    },
    {
      title: 'Rejected Returns',
      value: kpis.rejected || 0,
      icon: XCircle,
      color: 'red',
      trend: '-1%',
      isPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          {/* Subtle gradient background effect on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
          
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-${card.color}-100/50 text-${card.color}-600`}>
              <card.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {card.trend}
            </span>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-1">{card.value}</h3>
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
          </div>

          {/* Mini trend line */}
          <div className="h-10 mt-4 -mx-2 -mb-2 relative z-10 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line 
                  type="monotone" 
                  dataKey="returns" 
                  stroke={card.isPositive ? '#10b981' : '#f43f5e'} 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
