import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Sparkles, Brain, Bot, AlertTriangle, ChevronRight, Loader2, RefreshCw,
  TrendingUp, PackageSearch, Zap, Copy, FileText, Activity, Users
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold flex justify-between gap-4" style={{ color: p.color || '#6366f1' }}>
          <span>{p.name}:</span>
          <span>{p.name.includes('Predicted') ? fmt(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-5 border border-white/40 shadow-sm relative overflow-hidden group`}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all"></div>
    <div className="flex items-start justify-between relative z-10">
      <div className="p-2.5 bg-white/40 rounded-xl backdrop-blur-sm shadow-sm border border-white/50">
        <Icon className="w-5 h-5 text-slate-800" />
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <p className="text-xs font-extrabold text-slate-700/70 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-1 drop-shadow-sm">{value}</p>
      {subtitle && <p className="text-xs font-semibold text-slate-600 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, className = '', action }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500"/> {title}</h3>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

// ─── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Command Center', icon: Brain },
  { id: 'copilot', label: 'Copilot Chat', icon: Bot },
  { id: 'forecast', label: 'Sales & Inventory', icon: TrendingUp },
  { id: 'generate', label: 'Content Generator', icon: FileText },
];

export default function AIPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [dashboard, setDashboard] = useState(null);
  const [forecast, setForecast] = useState(null);
  
  // Copilot States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hello! I am your Enterprise AI Copilot. Ask me about revenue, stock levels, or users." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Generate States
  const [genInput, setGenInput] = useState({ product_name: '', category: 'General' });
  const [genOutput, setGenOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, forecastRes] = await Promise.all([
        axios.get(`${API}/ai/dashboard`, { headers }),
        axios.get(`${API}/ai/forecast`, { headers })
      ]);
      setDashboard(dashRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to AI Engine');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(true);
  }, [fetchData]);

  // Actions
  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const query = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setIsTyping(true);
    
    try {
      const res = await axios.post(`${API}/ai/copilot`, { query }, { headers: { Authorization: `Bearer ${token}` } });
      setChatHistory(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Connection error. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genInput.product_name) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API}/ai/generate`, genInput, { headers: { Authorization: `Bearer ${token}` } });
      setGenOutput(res.data);
    } catch {
      alert("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Initializing AI Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={() => fetchData(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
          Reconnect Engine
        </button>
      </div>
    );
  }

  const k = dashboard?.kpis || {};

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto relative">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
              <Brain className="w-6 h-6" />
            </div>
            Enterprise AI Command Center
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
             Model: {dashboard.overview.connected_model} | Latency: {dashboard.overview.latency}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fetchData(false)} disabled={refreshing} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors" title="Refresh Insights">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          
          <button onClick={() => setActiveTab('copilot')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">
            <Bot className="w-4 h-4" /> Ask Copilot
          </button>
        </div>
      </div>

      {/* ─── KPI GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="AI Health Score" value={`${k.ai_health}%`} icon={Activity} color="from-indigo-100/50 to-blue-50" subtitle="System operational" />
        <KPICard title="Predictions Today" value={k.today_predictions} icon={TrendingUp} color="from-emerald-100/50 to-teal-50" subtitle={`${k.ai_accuracy}% Accuracy`} />
        <KPICard title="Revenue Optimized" value={fmt(k.revenue_optimized)} icon={Zap} color="from-fuchsia-100/50 to-purple-50" subtitle="Via smart pricing" />
        <KPICard title="Recommendations" value={k.recommendations} icon={PackageSearch} color="from-blue-100/50 to-sky-50" subtitle="Served to customers" />
        <KPICard title="Automations" value={k.automations} icon={Bot} color="from-rose-100/50 to-pink-50" subtitle="Active background tasks" />
      </div>

      {/* ─── TABS NAV ────────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[600px]">
        <div className="flex overflow-x-auto border-b border-slate-100 px-3 pt-3 gap-2 no-scrollbar">
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-t-2xl text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 md:p-8 bg-slate-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <ChartCard title="Revenue Forecast (7 Days)">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast.sales_forecast}>
                          <defs>
                            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`₹${v/1000}K`} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="predicted" name="Predicted Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAI)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <div className="space-y-6">
                    <ChartCard title="Actionable AI Insights" className="h-[370px] overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        
                        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-100 flex gap-4">
                          <div className="mt-1"><TrendingUp className="w-5 h-5 text-emerald-600"/></div>
                          <div>
                            <p className="text-sm font-bold text-emerald-800">Revenue Opportunity</p>
                            <p className="text-xs text-emerald-600 mt-1">Bundling "Organic Milk" with "Whole Wheat Bread" has a 78% conversion probability based on past 30 days data.</p>
                          </div>
                        </div>

                        {forecast.inventory_alerts.slice(0,2).map((alert, idx) => (
                          <div key={idx} className="p-4 rounded-xl border bg-rose-50 border-rose-100 flex gap-4">
                            <div className="mt-1"><AlertTriangle className="w-5 h-5 text-rose-600"/></div>
                            <div>
                              <p className="text-sm font-bold text-rose-800">Stockout Risk: {alert.name}</p>
                              <p className="text-xs text-rose-600 mt-1">Current stock ({alert.current_stock}) will deplete in {alert.days_until_out} days at current burn rate ({alert.burn_rate}/day). {alert.suggestion}.</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="p-4 rounded-xl border bg-blue-50 border-blue-100 flex gap-4">
                          <div className="mt-1"><Users className="w-5 h-5 text-blue-600"/></div>
                          <div>
                            <p className="text-sm font-bold text-blue-800">Churn Prediction</p>
                            <p className="text-xs text-blue-600 mt-1">12 premium customers haven't ordered in 14 days. Recommend sending a 10% personalized discount code.</p>
                          </div>
                        </div>

                      </div>
                    </ChartCard>
                  </div>
                </div>
              )}

              {activeTab === 'copilot' && (
                <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Copilot Assistant</h3>
                        <p className="text-xs text-emerald-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Online & Ready</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                         <div className="max-w-[80%] p-4 rounded-2xl bg-white border border-slate-200 rounded-bl-sm flex gap-2 items-center shadow-sm">
                           <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                           <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                         </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleChat} className="relative">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e)=>setChatInput(e.target.value)}
                        placeholder="Ask Copilot (e.g. 'Show today's revenue' or 'What is out of stock?')..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <button type="submit" disabled={!chatInput.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'forecast' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="AI Inventory Intelligence">
                    <div className="space-y-4">
                      {forecast.inventory_alerts.map((alert, idx) => (
                        <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-800 text-base">{alert.name}</h4>
                            <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">Critical</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Stock</p>
                              <p className="text-lg font-black text-slate-800 mt-0.5">{alert.current_stock}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center">
                              <p className="text-[10px] text-orange-600 font-bold uppercase">Burn Rate</p>
                              <p className="text-lg font-black text-orange-600 mt-0.5">{alert.burn_rate}/day</p>
                            </div>
                            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                              <p className="text-[10px] text-rose-600 font-bold uppercase">Empty In</p>
                              <p className="text-lg font-black text-rose-600 mt-0.5">{alert.days_until_out} Days</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-4 gap-4">
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              <Bot className="w-4 h-4 text-indigo-500"/> <span className="font-bold text-slate-800">AI says:</span> {alert.suggestion}
                            </p>
                            <button className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold shadow-md whitespace-nowrap">Auto Reorder</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>
              )}

              {activeTab === 'generate' && (
                <div className="max-w-4xl mx-auto">
                  <ChartCard title="AI Content Generator (SEO & Marketing)">
                    <form onSubmit={handleGenerate} className="space-y-5 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Name</label>
                          <input type="text" required value={genInput.product_name} onChange={e=>setGenInput({...genInput, product_name: e.target.value})} placeholder="e.g. Organic Honey" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                          <select value={genInput.category} onChange={e=>setGenInput({...genInput, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                            <option value="General">General</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" disabled={isGenerating} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Generate SEO & Copy
                      </button>
                    </form>

                    {genOutput && (
                      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity:1, y:0}} className="space-y-5">
                        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl relative group shadow-sm">
                          <p className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider mb-2">Product Description</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed pr-8">{genOutput.description}</p>
                          <button onClick={() => copyToClipboard(genOutput.description)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-4 h-4"/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl relative group shadow-sm">
                            <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-2">Meta Title</p>
                            <p className="text-sm font-bold text-slate-800 pr-8">{genOutput.seo_title}</p>
                            <button onClick={() => copyToClipboard(genOutput.seo_title)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-emerald-600 bg-white shadow-sm border border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-4 h-4"/></button>
                          </div>
                           <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative group shadow-sm">
                            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {genOutput.keywords.map((kw, i) => (
                                <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded-md text-xs font-bold text-slate-600">{kw}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </ChartCard>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
