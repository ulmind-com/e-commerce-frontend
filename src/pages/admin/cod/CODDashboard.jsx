import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Banknote, TrendingUp, TrendingDown, Package, XCircle, 
  AlertTriangle, ShieldCheck, CreditCard, Activity, Save, Loader2
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const CODDashboard = ({ config, token, onUpdate, onSave, saving }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/cod/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { id: 'enabled', label: 'Enabled (Normal Operations)', bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-700' },
    { id: 'disabled', label: 'Disabled (Globally Paused)', bg: 'bg-slate-500', border: 'border-slate-600', text: 'text-slate-700' },
    { id: 'maintenance', label: 'Maintenance Mode', bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-700' },
    { id: 'emergency', label: 'Emergency Stop (Weather/Riots)', bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-700' },
  ];

  const currentStatus = statusOptions.find(o => o.id === config.status) || statusOptions[0];

  const statCards = stats ? [
    { label: "Today's COD Orders", value: stats.today_orders, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+12%' },
    { label: "Today's COD Revenue", value: `₹${stats.today_revenue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+5%' },
    { label: "Pending Collections", value: `₹${stats.collection_pending.toLocaleString()}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', trend: '-2%' },
    { label: "COD Success Rate", value: `${stats.success_rate}%`, icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100', trend: '+1.5%' },
    { label: "COD Return Rate", value: `${stats.return_rate}%`, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', trend: '-0.5%' },
    { label: "Monthly COD Revenue", value: `₹${stats.monthly_revenue.toLocaleString()}`, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', trend: '+18%' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Master Control Panel */}
      <div className={`relative overflow-hidden rounded-3xl border-2 shadow-lg transition-colors duration-500 ${currentStatus.border} bg-white`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 ${currentStatus.bg}`}></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Master Control Center</h2>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${currentStatus.bg.replace('bg-', 'bg-').replace('500', '50')} ${currentStatus.border.replace('600', '200')} ${currentStatus.text}`}>
                {currentStatus.label}
              </span>
            </div>
            <p className="text-slate-500 font-medium max-w-2xl text-sm">
              Instantly toggle Cash on Delivery across the entire platform. When disabled, customers will immediately see "Cash on Delivery is currently unavailable."
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200/60 shrink-0">
            {statusOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => onUpdate('status', opt.id)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  config.status === opt.id
                    ? `${opt.bg} text-white shadow-md`
                    : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                }`}
              >
                {config.status === opt.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                {opt.id === 'enabled' ? 'Enable' : opt.id === 'disabled' ? 'Disable' : opt.id === 'maintenance' ? 'Maintenance' : 'Emergency Stop'}
              </button>
            ))}
          </div>
        </div>
        
        {config.status !== 'enabled' && (
          <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold ${currentStatus.bg.replace('500', '50')} ${currentStatus.text} border-t ${currentStatus.border.replace('600', '100')}`}>
            <AlertTriangle size={16} /> 
            WARNING: COD is currently restricted. Checkout will not show the COD payment option.
          </div>
        )}
      </div>

      {/* KPI Dashboard */}
      <div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
          <Activity className="text-emerald-500" size={20} />
          Top KPI Dashboard
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-10 -mt-10 transition-colors ${stat.bg} group-hover:scale-150 duration-500 opacity-50`}></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color} shadow-sm`}>
                    <stat.icon size={22} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {stat.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stat.trend}
                  </span>
                </div>
                
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                </div>
                
                {/* Mini Sparkline Simulation */}
                <div className="mt-4 flex items-end gap-1 h-8 opacity-20 group-hover:opacity-100 transition-opacity">
                  {[40, 60, 30, 80, 50, 90, 70].map((h, idx) => (
                    <div key={idx} className={`w-full rounded-t-sm ${stat.bg.replace('50', '200')}`} style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button Overlay */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={onSave}
          disabled={saving}
          className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Saving Rules...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};
