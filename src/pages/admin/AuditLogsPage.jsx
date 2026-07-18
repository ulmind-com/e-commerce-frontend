import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, Activity, Users, AlertTriangle, Key, Filter, Search, ChevronRight, X, Loader2, RefreshCw, Monitor, MapPin, Database, Zap, Box, ShoppingCart
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold flex justify-between gap-4" style={{ color: p.color || '#6366f1' }}>
          <span>{p.name}:</span>
          <span>{p.value} Events</span>
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
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const DataTable = ({ columns, data, emptyMessage = 'No data', onRowClick }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <div className="w-full overflow-x-auto">
<table className="w-full text-left">
      <thead className="bg-slate-50">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className={`px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : ''}`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400 font-medium text-sm">{emptyMessage}</td></tr>
        ) : data.map((row, idx) => (
          <tr 
            key={idx} 
            onClick={() => onRowClick && onRowClick(row)}
            className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
          >
            {columns.map((col, ci) => (
              <td key={ci} className={`px-4 py-3.5 text-sm ${col.align === 'right' ? 'text-right' : ''} ${col.bold ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                {col.render ? col.render(row, idx) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
</div>
  </div>
);

const getSeverityStyles = (sev) => {
  switch (sev) {
    case 'Critical': return 'bg-rose-100 text-rose-700 border border-rose-200';
    case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200';
    case 'Warning': return 'bg-amber-100 text-amber-700 border border-amber-200';
    default: return 'bg-blue-100 text-blue-700 border border-blue-200';
  }
};

const getModuleIcon = (mod) => {
  switch(mod) {
    case 'Authentication': return <Key className="w-4 h-4" />;
    case 'Orders': return <ShoppingCart className="w-4 h-4" />;
    case 'Products': return <Box className="w-4 h-4" />;
    case 'Security': return <ShieldCheck className="w-4 h-4" />;
    default: return <Database className="w-4 h-4" />;
  }
};

// ─── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Live Dashboard', icon: Activity },
  { id: 'logs', label: 'Global Logs', icon: Database },
  { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert },
];

export default function AuditLogsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Filters
  const [filterModule, setFilterModule] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchUser, setSearchUser] = useState('');

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, logsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/audit/dashboard`, { headers }),
        axios.get(`${API}/audit/logs?module=${filterModule}&severity=${filterSeverity}&user_name=${searchUser}`, { headers }),
        axios.get(`${API}/audit/alerts`, { headers })
      ]);
      setDashboard(dashRes.data);
      setLogs(logsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load Audit Logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, filterModule, filterSeverity, searchUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(true);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Connecting to Security Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={() => fetchData(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">
          Retry Connection
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
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700"><ShieldCheck className="w-6 h-6" /></div>
            Enterprise Audit Logs & Security
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" /></span>
             Real-time compliance monitoring and activity tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fetchData(false)} disabled={refreshing} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── KPI GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Today's Activities" value={k.today_activities} icon={Activity} color="from-blue-100/50 to-indigo-50" subtitle="Events logged in 24h" />
        <KPICard title="Active Sessions" value={k.active_sessions} icon={Users} color="from-emerald-100/50 to-teal-50" subtitle="Currently online" />
        <KPICard title="Failed Logins" value={k.failed_logins} icon={Key} color="from-amber-100/50 to-orange-50" subtitle="In the last 24h" />
        <KPICard title="Security Alerts" value={k.security_alerts} icon={ShieldAlert} color="from-rose-100/50 to-pink-50" subtitle="High & Critical severity" />
        <KPICard title="Products Updated" value={k.products_updated} icon={Zap} color="from-fuchsia-100/50 to-purple-50" subtitle="Inventory & Pricing" />
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
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Activity Heatmap (Last 7 Days)">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.heatmap}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="events" name="Events" radius={[4,4,0,0]} barSize={40}>
                            {dashboard.heatmap.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.events > 50 ? '#ef4444' : entry.events > 20 ? '#f59e0b' : '#3b82f6'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                  
                  <div className="space-y-6">
                    <ChartCard title="Recent Security Alerts" className="h-[370px] overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {alerts.slice(0, 5).map((a, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${a.severity === 'Critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="mt-1"><AlertTriangle className={`w-5 h-5 ${a.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`}/></div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{a.action} ({a.module})</p>
                              <p className="text-xs text-slate-600 mt-1">Triggered by <span className="font-bold">{a.user_name}</span> at {a.time_str}</p>
                              <p className="text-xs text-slate-500 font-mono mt-1">IP: {a.ip_address}</p>
                            </div>
                          </div>
                        ))}
                        {alerts.length === 0 && <p className="text-slate-400 text-sm text-center py-10">No recent security alerts.</p>}
                      </div>
                    </ChartCard>
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <ChartCard title="Global Activity Logs" className="!p-0 overflow-hidden">
                  <div className="p-4 flex flex-wrap gap-4 bg-white border-b border-slate-100">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search by user..." value={searchUser} onChange={(e)=>setSearchUser(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                    <select value={filterModule} onChange={(e)=>setFilterModule(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none">
                      <option value="All">All Modules</option>
                      <option value="Authentication">Authentication</option>
                      <option value="Security">Security</option>
                      <option value="Orders">Orders</option>
                      <option value="Finance">Finance</option>
                      <option value="Products">Products</option>
                      <option value="Inventory">Inventory</option>
                    </select>
                    <select value={filterSeverity} onChange={(e)=>setFilterSeverity(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none">
                      <option value="All">All Severities</option>
                      <option value="Info">Info</option>
                      <option value="Warning">Warning</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <button onClick={() => fetchData(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100">
                      <Filter className="w-4 h-4" /> Apply Filter
                    </button>
                  </div>
                  <DataTable
                    onRowClick={setSelectedLog}
                    columns={[
                      { label: 'Timestamp', key: 'time_str', render: (r) => <span className="text-xs font-mono text-slate-500">{r.time_str}</span> },
                      { label: 'Severity', key: 'severity', render: (r) => <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityStyles(r.severity)}`}>{r.severity}</span> },
                      { label: 'Module', key: 'module', render: (r) => <div className="flex items-center gap-1.5 text-slate-600 font-medium">{getModuleIcon(r.module)} {r.module}</div> },
                      { label: 'Action', key: 'action', bold: true },
                      { label: 'User', key: 'user_name', render: (r) => (<div><p className="font-bold text-slate-800">{r.user_name}</p><p className="text-[10px] text-slate-400 uppercase tracking-wider">{r.role}</p></div>) },
                      { label: 'Status', key: 'status', render: (r) => <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${r.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{r.status}</span> },
                      { label: '', key: 'icon', align: 'right', render: () => <ChevronRight className="w-4 h-4 text-slate-400" /> }
                    ]}
                    data={logs}
                  />
                </ChartCard>
              )}
              
              {activeTab === 'alerts' && (
                <ChartCard title="Critical Security Alerts">
                  <DataTable
                    onRowClick={setSelectedLog}
                    columns={[
                      { label: 'Timestamp', key: 'time_str', render: (r) => <span className="text-xs font-mono text-slate-500">{r.time_str}</span> },
                      { label: 'Alert Type', key: 'action', bold: true },
                      { label: 'Severity', key: 'severity', render: (r) => <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityStyles(r.severity)}`}>{r.severity}</span> },
                      { label: 'User Context', key: 'user_name' },
                      { label: 'IP / Location', key: 'ip', render: (r) => (<div><p className="font-mono text-xs text-slate-600">{r.ip_address}</p><p className="text-xs text-slate-400">{r.location}</p></div>) },
                      { label: 'Device', key: 'device', render: (r) => <span className="text-xs text-slate-500">{r.device}</span> }
                    ]}
                    data={alerts}
                  />
                </ChartCard>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── LOG PROFILE DRAWER (RAW JSON VIEW) ──────────────────────────── */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-full max-w-xl h-full bg-slate-900 shadow-2xl z-50 overflow-y-auto border-l border-slate-700 flex flex-col text-slate-300">
              <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-black text-white flex items-center gap-2"><Database className="w-5 h-5 text-indigo-400" /> Event Details</h3>
                <button onClick={() => setSelectedLog(null)} className="p-2 bg-slate-700 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 flex-1 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Action</p>
                    <p className="text-sm font-bold text-white">{selectedLog.action}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Timestamp</p>
                    <p className="text-sm font-mono text-indigo-300">{selectedLog.time_str}</p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">User Context</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-slate-400">User</span><span className="text-sm font-bold text-white">{selectedLog.user_name}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-400">Role</span><span className="text-sm font-bold text-white">{selectedLog.role}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-400">User ID</span><span className="text-xs font-mono text-slate-500">{selectedLog.user_id}</span></div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Network & Device</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><Monitor className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-300">{selectedLog.device}</span></div>
                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-300">{selectedLog.location}</span></div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-700"><span className="text-sm text-slate-400">IP Address</span><span className="text-sm font-mono text-indigo-300">{selectedLog.ip_address}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Event Metadata (Raw JSON)</h4>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 shadow-inner">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
