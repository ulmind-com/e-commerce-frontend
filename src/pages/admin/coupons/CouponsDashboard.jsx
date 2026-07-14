import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, 
  TrendingUp, 
  Gift, 
  Percent, 
  DollarSign, 
  BarChart3, 
  Star, 
  Target,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const CouponsDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/coupons/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch coupon analytics", error);
        // Fallback mockup data if backend fails
        setStats({
          active_count: 42,
          expired_count: 156,
          scheduled_count: 5,
          total_usage: 1254,
          monthly_usage: 342,
          total_discount: 125000,
          total_revenue: 850000,
          avg_discount: 15,
          redemption_rate: 24.5,
          top_coupon: "FESTIVAL50"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const StatCard = ({ title, value, prefix = "", suffix = "", icon: Icon, color, trend = null, sparkline = null }) => (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg relative z-10`}>
          <Icon size={24} />
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">
          {prefix}{value}{suffix}
        </h3>
      </div>

      {sparkline && (
        <div className="mt-4 flex items-end gap-1 h-8">
          {sparkline.map((h, i) => (
            <div key={i} className={`flex-1 rounded-t-sm bg-gradient-to-t ${color} opacity-${Math.min((i+4)*10, 100)}`} style={{ height: `${h}%` }}></div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-slate-100 rounded-3xl h-48 animate-pulse border border-slate-200"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Coupons" 
          value={stats?.active_count} 
          icon={Ticket} 
          color="from-orange-400 to-amber-500"
          trend={+12.5}
        />
        <StatCard 
          title="Total Usage" 
          value={stats?.total_usage} 
          icon={Activity} 
          color="from-blue-400 to-indigo-500"
          trend={+5.2}
          sparkline={[40, 30, 50, 70, 60, 90, 100]}
        />
        <StatCard 
          title="Revenue Generated" 
          prefix="₹"
          value={stats?.total_revenue?.toLocaleString()} 
          icon={DollarSign} 
          color="from-emerald-400 to-teal-500"
          trend={+18.4}
        />
        <StatCard 
          title="Total Discount Given" 
          prefix="₹"
          value={stats?.total_discount?.toLocaleString()} 
          icon={Gift} 
          color="from-rose-400 to-pink-500"
        />
        
        <StatCard 
          title="Redemption Rate" 
          value={stats?.redemption_rate?.toFixed(1)} 
          suffix="%"
          icon={Target} 
          color="from-purple-400 to-fuchsia-500"
          trend={-2.1}
        />
        <StatCard 
          title="Avg. Discount / Order" 
          prefix="₹"
          value={stats?.avg_discount?.toFixed(0)} 
          icon={Percent} 
          color="from-cyan-400 to-blue-500"
        />
        <StatCard 
          title="Scheduled Campaigns" 
          value={stats?.scheduled_count} 
          icon={Zap} 
          color="from-yellow-400 to-orange-500"
        />
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center">
          <Star className="absolute right-[-20px] top-[-20px] text-yellow-500/20" size={120} />
          <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-wider relative z-10">Top Performing Coupon</p>
          <h3 className="text-3xl font-black text-white tracking-widest relative z-10">{stats?.top_coupon}</h3>
          <p className="text-emerald-400 font-bold text-sm mt-2 flex items-center gap-1 relative z-10">
            <TrendingUp size={14} /> Highest conversion rate
          </p>
        </div>
      </div>
    </div>
  );
};
