import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, CreditCard, Banknote, AlertCircle, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export const PaymentsOverview = ({ orders }) => {

  const stats = useMemo(() => {
    let todayCollection = 0;
    let pendingPayments = 0;
    let successfulTransactions = 0;
    let codCollection = 0;
    let onlineCollection = 0;

    const today = new Date().toISOString().split('T')[0];

    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      
      if (order.payment_status === 'Completed' || order.order_status === 'Delivered') {
        successfulTransactions++;
        if (order.payment_mode === 'COD') {
          codCollection += order.total_amount;
          if (orderDate === today) todayCollection += order.total_amount;
        } else {
          onlineCollection += order.total_amount;
          if (orderDate === today) todayCollection += order.total_amount;
        }
      } else if (order.payment_status === 'Pending') {
        pendingPayments += order.total_amount;
      }
    });

    const totalRevenue = codCollection + onlineCollection;
    const avgOrderValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;
    const successRate = orders.length > 0 ? (successfulTransactions / orders.length) * 100 : 0;

    return {
      todayCollection,
      pendingPayments,
      successfulTransactions,
      codCollection,
      onlineCollection,
      avgOrderValue,
      successRate
    };
  }, [orders]);

  // Mock data for charts if orders are sparse
  const areaData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const pieData = [
    { name: 'Razorpay', value: stats.onlineCollection || 5000 },
    { name: 'COD', value: stats.codCollection || 3000 },
  ];

  const kpis = [
    { title: "Today's Collection", value: `₹${stats.todayCollection.toFixed(0)}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
    { title: 'Pending Payments', value: `₹${stats.pendingPayments.toFixed(0)}`, icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2.4%' },
    { title: 'Average Order Value', value: `₹${stats.avgOrderValue.toFixed(0)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.1%' },
    { title: 'Payment Success Rate', value: `${stats.successRate.toFixed(1)}%`, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+1.2%' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.trend}
              </span>
              <span className="text-xs text-slate-400 font-medium">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Revenue Trend (Last 7 Days)</h3>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <h3 className="font-bold text-slate-800 mb-6">Payment Methods</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Online (Razorpay)</p>
              <p className="text-lg font-black text-slate-800">₹{stats.onlineCollection.toFixed(0)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cash on Delivery</p>
              <p className="text-lg font-black text-slate-800">₹{stats.codCollection.toFixed(0)}</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
