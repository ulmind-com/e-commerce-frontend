import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, IndianRupee, AlertTriangle, Bike, Clock, Settings, Save, Loader2, CheckCircle2, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const DashboardTab = ({ token, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelWindow, setCancelWindow] = useState(5);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsAlert, setSettingsAlert] = useState(null);

  useEffect(() => {
    // Fetch stats and settings in parallel
    Promise.all([
      axios.get(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/settings`)
    ])
      .then(([statsRes, settingsRes]) => { 
        setStats(statsRes.data); 
        setCancelWindow(settingsRes.data.cancel_window_mins);
        setLoading(false); 
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [token]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await axios.put(`${API}/settings/cancel-window`, 
        { minutes: parseInt(cancelWindow, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettingsAlert({ type: 'success', message: 'Settings saved successfully!' });
    } catch (err) {
      setSettingsAlert({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load stats.</div>;

  const statCards = [
    { title: "Today's Orders", value: stats.orders_today, icon: ShoppingCart, color: 'bg-blue-500' },
    { title: "Today's Revenue", value: `₹${stats.revenue_today.toFixed(2)}`, icon: IndianRupee, color: 'bg-emerald-500' },
    { title: "Low Stock Items", value: stats.low_stock_count, icon: AlertTriangle, color: 'bg-amber-500' },
    { title: "Active Partners", value: stats.active_delivery_partners, icon: Bike, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const isTodayOrders = card.title === "Today's Orders";
          return (
            <div 
              key={idx} 
              onClick={() => isTodayOrders && onNavigate && onNavigate('today_orders')}
              className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 ${isTodayOrders ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-sm shrink-0 ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <h3 className="font-bold text-slate-800">Recent Activity (Last 10 Orders)</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recent_orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No recent orders</div>
          ) : (
            stats.recent_orders.map(order => (
              <div key={order._id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-mono text-xs text-slate-500">ID: {order._id}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">₹{order.total_amount.toFixed(2)} • {order.payment_mode}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.order_status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                  order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.order_status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <h3 className="font-bold text-slate-800">Platform Settings</h3>
          </div>
        </div>

        {settingsAlert && (
          <div className={`mx-6 mt-4 px-4 py-3 rounded-xl flex items-center justify-between ${
            settingsAlert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {settingsAlert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span className="text-sm font-semibold">{settingsAlert.message}</span>
            </div>
            <button onClick={() => setSettingsAlert(null)} className="opacity-70 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="p-6 flex items-end gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              User Cancellation Window (Minutes)
            </label>
            <input 
              type="number" 
              min="1"
              value={cancelWindow}
              onChange={(e) => setCancelWindow(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button 
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:bg-slate-300 shadow-sm"
          >
            {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        <div className="px-6 pb-6 text-xs text-slate-400">
          * This defines how long a customer has to cancel their order after placing it.
        </div>
      </div>

    </div>
  );
};
