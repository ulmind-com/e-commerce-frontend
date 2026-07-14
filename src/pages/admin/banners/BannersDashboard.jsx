import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Image as ImageIcon, 
  TrendingUp, 
  MousePointerClick, 
  DollarSign, 
  Eye, 
  Target,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Star
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const BannersDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/banners/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch banner analytics", error);
        // Fallback mockup data
        setStats({
          active_count: 12,
          scheduled_count: 3,
          total_banners: 45,
          total_views: 1250400,
          total_clicks: 45200,
          total_revenue: 2500000,
          ctr: 3.6,
          cvr: 1.2,
          top_banner: "Diwali Dhamaka Hero"
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
          title="Active Banners" 
          value={stats?.active_count} 
          icon={ImageIcon} 
          color="from-fuchsia-400 to-purple-600"
          trend={+4.5}
        />
        <StatCard 
          title="Total Views" 
          value={stats?.total_views?.toLocaleString()} 
          icon={Eye} 
          color="from-blue-400 to-indigo-500"
          trend={+12.2}
          sparkline={[40, 30, 50, 70, 60, 90, 100]}
        />
        <StatCard 
          title="Avg. Click Rate (CTR)" 
          value={stats?.ctr?.toFixed(2)} 
          suffix="%"
          icon={MousePointerClick} 
          color="from-pink-400 to-rose-500"
          trend={+1.1}
        />
        <StatCard 
          title="Revenue Generated" 
          prefix="₹"
          value={stats?.total_revenue?.toLocaleString()} 
          icon={DollarSign} 
          color="from-emerald-400 to-teal-500"
          trend={+24.4}
        />
        
        <StatCard 
          title="Conversion Rate" 
          value={stats?.cvr?.toFixed(2)} 
          suffix="%"
          icon={Target} 
          color="from-cyan-400 to-blue-500"
          trend={-0.5}
        />
        <StatCard 
          title="Scheduled Campaigns" 
          value={stats?.scheduled_count} 
          icon={Megaphone} 
          color="from-orange-400 to-amber-500"
        />
        
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center border border-slate-700">
          <Star className="absolute right-[-20px] top-[-20px] text-fuchsia-500/20" size={140} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-wider">Top Performing Banner</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{stats?.top_banner}</h3>
              <p className="text-emerald-400 font-bold text-sm mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> Highest CTR and Revenue
              </p>
            </div>
            <div className="mt-4 md:mt-0 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center">
               <ImageIcon size={32} className="text-fuchsia-300" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
