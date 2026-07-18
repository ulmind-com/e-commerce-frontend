import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Settings, Store, ShoppingBag, Truck, CreditCard, Bot, Scale, Search, Save, Loader2, AlertTriangle, FileText, Sparkles
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const CATEGORIES = [
  { id: 'store', label: 'Store Details', icon: Store, desc: 'Name, contact, GST, & business info' },
  { id: 'orders', label: 'Orders & Checkout', icon: ShoppingBag, desc: 'Auto-confirm, limits, & workflows' },
  { id: 'delivery', label: 'Delivery & Logistics', icon: Truck, desc: 'Radius, charges, & express settings' },
  { id: 'payments', label: 'Payments & COD', icon: CreditCard, desc: 'Razorpay, COD timers, & limits' },
  { id: 'ai', label: 'AI & Automation', icon: Bot, desc: 'Copilot, models, & smart features' },
  { id: 'legal', label: 'Legal & Policies', icon: Scale, desc: 'Terms, Privacy, & Refund policy' },
  { id: 'seo', label: 'SEO & Meta', icon: Search, desc: 'Meta tags, description, & keywords' },
];

export default function SettingsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('store');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/settings/all`, { headers: { Authorization: `Bearer ${token}` } });
      setSettings(res.data);
      setOriginalSettings(JSON.parse(JSON.stringify(res.data)));
      setHasChanges(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = (category, field, value) => {
    setSettings(prev => {
      const updated = { ...prev, [category]: { ...prev[category], [field]: value } };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings));
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API}/settings/update`, settings, { headers: { Authorization: `Bearer ${token}` } });
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setHasChanges(false);
      // Optional: Show success toast
    } catch {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading Enterprise Configurations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <p className="text-rose-600 font-bold">{error}</p>
        <button onClick={fetchSettings} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/50 shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700"><Settings className="w-6 h-6" /></div>
            Settings & Configuration Center
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
             All modules synchronized. System healthy.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search settings (Ctrl+K)..." 
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm p-4 sticky top-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Configuration Hub</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeCategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${activeCategory === cat.id ? 'text-indigo-900' : 'text-slate-700'}`}>{cat.label}</p>
                    <p className={`text-[10px] ${activeCategory === cat.id ? 'text-indigo-600' : 'text-slate-400'} hidden lg:block truncate`}>{cat.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              
              {activeCategory === 'store' && (
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Store Details</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage your brand name, contact information, and business compliance numbers.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Store Name</label>
                        <input type="text" value={settings.store.name} onChange={(e) => handleUpdate('store', 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Support Email</label>
                        <input type="email" value={settings.store.email} onChange={(e) => handleUpdate('store', 'email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Support Phone</label>
                        <input type="text" value={settings.store.phone} onChange={(e) => handleUpdate('store', 'phone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Business Address</label>
                        <textarea rows="2" value={settings.store.address} onChange={(e) => handleUpdate('store', 'address', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"></textarea>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />
                  
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-4">Localization & Compliance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Currency</label>
                        <select value={settings.store.currency} onChange={(e) => handleUpdate('store', 'currency', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                          <option value="INR (₹)">INR (₹)</option>
                          <option value="USD ($)">USD ($)</option>
                          <option value="EUR (€)">EUR (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timezone</label>
                        <select value={settings.store.timezone} onChange={(e) => handleUpdate('store', 'timezone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GST Number</label>
                        <input type="text" value={settings.store.gst_number} onChange={(e) => handleUpdate('store', 'gst_number', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'orders' && (
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Order Workflow</h3>
                    <p className="text-sm text-slate-500 mb-6">Configure how orders are processed, limits, and automated actions.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">Auto-Confirm Orders</p>
                          <p className="text-xs text-slate-500">Automatically move paid orders to confirmed status without manual approval.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.orders.auto_confirm} onChange={(e) => handleUpdate('orders', 'auto_confirm', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Minimum Order Value (₹)</label>
                          <input type="number" value={settings.orders.min_order_value} onChange={(e) => handleUpdate('orders', 'min_order_value', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Maximum Order Value (₹)</label>
                          <input type="number" value={settings.orders.max_order_value} onChange={(e) => handleUpdate('orders', 'max_order_value', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="col-span-full">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Auto-Cancel Unpaid Orders After (Hours)</label>
                          <input type="number" value={settings.orders.auto_cancel_hours} onChange={(e) => handleUpdate('orders', 'auto_cancel_hours', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'delivery' && (
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Delivery Settings</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage delivery radiuses, charges, and free delivery thresholds.</p>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                      <div>
                        <p className="font-bold text-slate-800">Express Delivery</p>
                        <p className="text-xs text-slate-500">Enable 30-minute express delivery options for nearby areas.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.delivery.express_enabled} onChange={(e) => handleUpdate('delivery', 'express_enabled', e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Delivery Radius (km)</label>
                        <input type="number" value={settings.delivery.radius_km} onChange={(e) => handleUpdate('delivery', 'radius_km', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Base Delivery Charge (₹)</label>
                        <input type="number" value={settings.delivery.base_charge} onChange={(e) => handleUpdate('delivery', 'base_charge', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Free Delivery Threshold (₹)</label>
                        <input type="number" value={settings.delivery.free_delivery_threshold} onChange={(e) => handleUpdate('delivery', 'free_delivery_threshold', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                        <p className="text-[10px] text-slate-400 mt-1">Orders above this amount will not be charged delivery fees.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'payments' && (
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Payment Gateways & COD</h3>
                    <p className="text-sm text-slate-500 mb-6">Configure Razorpay and Cash on Delivery settings.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-6 h-6 rounded" onError={(e)=>e.target.style.display='none'}/>
                          <div>
                            <p className="font-bold text-slate-800">Razorpay Integration</p>
                            <p className="text-xs text-slate-500">Accept Credit Cards, NetBanking, Wallets</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.payments.razorpay_enabled} onChange={(e) => handleUpdate('payments', 'razorpay_enabled', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">UPI / QR Payments</p>
                          <p className="text-xs text-slate-500">Enable direct UPI collections</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.payments.upi_enabled} onChange={(e) => handleUpdate('payments', 'upi_enabled', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">Cash on Delivery (COD)</p>
                          <p className="text-xs text-slate-500">Allow customers to pay on arrival</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.payments.cod_enabled} onChange={(e) => handleUpdate('payments', 'cod_enabled', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      
                      {settings.payments.cod_enabled && (
                        <div className="pl-4 border-l-2 border-indigo-200 pt-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Maximum COD Limit (₹)</label>
                          <input type="number" value={settings.payments.cod_max_limit} onChange={(e) => handleUpdate('payments', 'cod_max_limit', Number(e.target.value))} className="w-64 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'ai' && (
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">AI Command Center Integration</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage automated insights and machine learning features.</p>
                    
                    <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 shadow-sm">
                      <div>
                        <p className="font-bold text-indigo-900 flex items-center gap-2">Enable AI Engine <Sparkles className="w-4 h-4" /></p>
                        <p className="text-xs text-indigo-700">Activates Copilot, Forecasting, and Content Generation globally.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.ai.enabled} onChange={(e) => handleUpdate('ai', 'enabled', e.target.checked)} />
                        <div className="w-11 h-6 bg-indigo-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="space-y-6 opacity-100 transition-opacity" style={{opacity: settings.ai.enabled ? 1 : 0.5, pointerEvents: settings.ai.enabled ? 'auto' : 'none'}}>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">AI Provider / Engine</label>
                        <select value={settings.ai.provider} onChange={(e) => handleUpdate('ai', 'provider', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                          <option value="Antigravity Statistical Engine">Antigravity Statistical Engine (Local/Free)</option>
                          <option value="OpenAI GPT-4">OpenAI GPT-4 (Requires API Key)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">Auto Smart Pricing</p>
                          <p className="text-xs text-slate-500">Allow AI to slightly adjust prices based on demand to maximize profit.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.ai.auto_pricing} onChange={(e) => handleUpdate('ai', 'auto_pricing', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">Auto Reorder Suggestions</p>
                          <p className="text-xs text-slate-500">AI will automatically create drafted Purchase Orders when stock is low.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings.ai.auto_reorder} onChange={(e) => handleUpdate('ai', 'auto_reorder', e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeCategory === 'legal' || activeCategory === 'seo') && (
                <div className="max-w-3xl space-y-8">
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">Content Management</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md">Use the new CMS Module to manage long-form content, terms and conditions, privacy policies, and meta tags.</p>
                    <button className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800">Go to CMS Manager</button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* STICKY SAVE BAR */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-slate-900 shadow-2xl rounded-2xl p-4 flex items-center justify-between border border-slate-700">
              <p className="text-slate-200 font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Unsaved changes detected.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDiscard} disabled={isSaving} className="px-5 py-2.5 text-slate-300 hover:text-white font-bold text-sm transition-colors">Discard</button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
