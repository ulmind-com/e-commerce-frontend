import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Settings2, ShieldCheck, Webhook, Clock, AlertTriangle, Save, Loader2, KeyRound, MapPin, Tag, Banknote } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const PaymentsSettings = () => {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    cod_enabled: true,
    cod_start_time: '09:00',
    cod_end_time: '22:30',
    cod_min_order: 200,
    cod_max_order: 5000,
    cod_surcharge: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings/payments`);
      setConfig(res.data);
    } catch (e) {
      console.error('Failed to fetch settings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings/payments`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Settings saved successfully!');
    } catch (e) {
      console.error('Failed to save settings', e);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payment Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">Manage Razorpay API and Cash on Delivery rules</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Razorpay Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <ShieldCheck size={16} />
                </div>
                Razorpay Integration
              </h3>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Connected</span>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Environment</label>
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                  <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-white text-slate-800 shadow-sm">Live Mode</button>
                  <button className="px-4 py-1.5 text-sm font-semibold rounded-md text-slate-500 hover:text-slate-700">Test Mode</button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Key ID</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value="rzp_live_*****************" readOnly className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Secret</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="password" value="************************" readOnly className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Webhook size={16} />
                </div>
                Webhook Configuration
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Webhook URL</label>
                <input type="text" value={`${API}/orders/verify-payment`} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Webhook Secret</label>
                <input type="password" value="****************" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none" />
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-sm text-emerald-800">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>Webhooks are active and receiving events. Last event received 12 minutes ago.</p>
              </div>
            </div>
          </div>
        </div>

        {/* COD Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Banknote size={16} />
                </div>
                Cash on Delivery Rules
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">Emergency Master Switch</span>
                <button 
                  onClick={() => setConfig(prev => ({ ...prev, cod_enabled: !prev.cod_enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${config.cod_enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.cod_enabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            <div className={`p-6 space-y-6 ${!config.cod_enabled ? 'opacity-50' : ''}`}>
              
              {/* Business Hours */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" /> Business Hours
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                    <input 
                      type="time" 
                      value={config.cod_start_time}
                      onChange={(e) => setConfig({ ...config, cod_start_time: e.target.value })}
                      disabled={!config.cod_enabled}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                    <input 
                      type="time" 
                      value={config.cod_end_time}
                      onChange={(e) => setConfig({ ...config, cod_end_time: e.target.value })}
                      disabled={!config.cod_enabled}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Outside these hours, COD will be automatically hidden from checkout.</p>
              </div>

              <hr className="border-slate-100" />

              {/* Order Limits */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-slate-400" /> Order Limits
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Min Order Value (₹)</label>
                    <input 
                      type="number" 
                      value={config.cod_min_order}
                      onChange={(e) => setConfig({ ...config, cod_min_order: e.target.value })}
                      disabled={!config.cod_enabled}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Max Order Value (₹)</label>
                    <input 
                      type="number" 
                      value={config.cod_max_order}
                      onChange={(e) => setConfig({ ...config, cod_max_order: e.target.value })}
                      disabled={!config.cod_enabled}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">COD Surcharge / Fee (₹)</label>
                  <input 
                    type="number" 
                    value={config.cod_surcharge}
                    onChange={(e) => setConfig({ ...config, cod_surcharge: e.target.value })}
                    disabled={!config.cod_enabled}
                    className="w-full sm:w-1/2 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Advanced Restrictions */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" /> Advanced Restrictions
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Restrict by Pincode</p>
                      <p className="text-xs text-slate-500">Only allow COD in selected delivery zones</p>
                    </div>
                    <button disabled={!config.cod_enabled} className="text-primary text-sm font-bold hover:underline">Configure</button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Restrict by Category</p>
                      <p className="text-xs text-slate-500">Disable COD for expensive/fragile items</p>
                    </div>
                    <button disabled={!config.cod_enabled} className="text-primary text-sm font-bold hover:underline">Configure</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
