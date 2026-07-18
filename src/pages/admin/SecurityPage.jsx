import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Shield, ShieldAlert, Activity, AlertTriangle, Users, Smartphone, Globe, Lock, Key, Filter, MonitorX, ShieldCheck
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold flex justify-between gap-4" style={{ color: p.color || '#6366f1' }}>
          <span className="capitalize">{p.name}:</span>
          <span>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-800 mt-1 drop-shadow-sm">{value}</p>
      {subtitle && <p className="text-xs font-semibold text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500"/> {title}</h3>
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const TABS = [
  { id: 'overview', label: 'Security Overview', icon: Shield },
  { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
  { id: 'policies', label: 'Policies & Compliance', icon: Lock },
];

export default function SecurityPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const [dashboard, setDashboard] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [policies, setPolicies] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/security/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      setDashboard(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to SOC');
    }
  }, [token]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/security/sessions`, { headers: { Authorization: `Bearer ${token}` } });
      setSessions(res.data.sessions);
    } catch {
      // ignore error
    }
  }, [token]);

  const fetchPolicies = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/security/policies`, { headers: { Authorization: `Bearer ${token}` } });
      setPolicies(res.data);
    } catch {
      // ignore error
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([fetchDashboard(), fetchSessions(), fetchPolicies()]).then(() => {
      setLoading(false);
    });
  }, [fetchDashboard, fetchSessions, fetchPolicies]);

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to revoke this session? The user will be logged out immediately.")) return;
    try {
      await axios.delete(`${API}/security/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchSessions();
    } catch {
      alert("Failed to revoke session");
    }
  };

  const handleSavePolicies = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.put(`${API}/security/policies`, policies, { headers: { Authorization: `Bearer ${token}` } });
      alert("Security policies updated successfully!");
    } catch {
      alert("Failed to update policies");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Initializing Security Operations Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <p className="text-rose-600 font-bold text-xl">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Retry Connection</button>
      </div>
    );
  }

  const k = dashboard?.kpis || {};
  
  // Calculate health color
  let healthColor = 'text-emerald-500';
  let healthBg = 'bg-emerald-50';
  let healthBorder = 'border-emerald-200';
  if (k.security_score < 80) { healthColor = 'text-amber-500'; healthBg = 'bg-amber-50'; healthBorder = 'border-amber-200'; }
  if (k.security_score < 60) { healthColor = 'text-rose-500'; healthBg = 'bg-rose-50'; healthBorder = 'border-rose-200'; }

  return (
    <div className="max-w-[1600px] mx-auto pb-12 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/50 shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700"><ShieldCheck className="w-6 h-6" /></div>
            Security Operations Center
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
             Real-time Threat Monitoring Active
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <KPICard title="Threat Level" value={k.threat_level} icon={ShieldAlert} color={k.threat_level === 'Low' ? 'bg-emerald-500' : 'bg-rose-500'} subtitle="Current risk posture" />
        <KPICard title="Active Sessions" value={k.active_sessions} icon={Users} color="bg-indigo-500" subtitle="Connected globally" />
        <KPICard title="Trusted Devices" value={k.trusted_devices} icon={Smartphone} color="bg-blue-500" subtitle="Authorized hardware" />
        <KPICard title="Failed Logins (24h)" value={k.failed_logins_24h} icon={AlertTriangle} color="bg-orange-500" subtitle="Brute force attempts" />
        <KPICard title="2FA Adoption" value={`${k.two_factor_enabled_pct}%`} icon={Key} color="bg-teal-500" subtitle="Of admin accounts" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm p-4 sticky top-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">SOC Modules</h3>
            <div className="space-y-1">
              {TABS.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                      isActive 
                        ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                      <TabIcon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  <div className={`p-6 rounded-2xl border flex items-center justify-between ${healthBg} ${healthBorder}`}>
                    <div>
                      <h3 className={`text-xl font-black ${healthColor}`}>Security Health Score: {k.security_score}/100</h3>
                      <p className="text-sm font-medium text-slate-600 mt-1">Based on authentication patterns, password policies, and threat anomalies.</p>
                    </div>
                    <div className="hidden sm:block">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className={healthColor} strokeWidth="3" strokeDasharray={`${k.security_score}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className={`absolute text-xl font-black ${healthColor}`}>{k.security_score}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ChartCard title="Security Events (24h)">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboard.activity_chart}>
                            <defs>
                              <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorBlk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                            <Area type="monotone" dataKey="blocked" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorBlk)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>

                    <ChartCard title="Threat Intelligence Feed">
                      <div className="space-y-4 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {dashboard.recent_alerts.map((alert, idx) => (
                          <div key={idx} className="flex gap-4 p-4 border border-slate-100 bg-slate-50 rounded-xl relative group">
                            <div className="flex-shrink-0 mt-1">
                              {alert.severity === 'Critical' ? <ShieldAlert className="w-5 h-5 text-rose-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{alert.action}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {alert.user}</span>
                                <span className="flex items-center gap-1">⏱ {alert.time}</span>
                              </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 font-bold text-slate-700">Investigate</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ChartCard>
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Active Sessions</h3>
                      <p className="text-sm text-slate-500">Monitor and revoke devices connected to the enterprise platform.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">
                      <Filter className="w-4 h-4"/> Filter
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <div className="w-full overflow-x-auto">
<table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-xs font-black text-slate-500 uppercase">User</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase">Device / Browser</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase">Location / IP</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase">Last Active</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sessions.map((sess) => (
                            <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {sess.user_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{sess.user_name}</p>
                                    {sess.is_current && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Current Session</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-sm font-bold text-slate-700">{sess.device}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Globe className="w-3 h-3"/> {sess.browser}</p>
                              </td>
                              <td className="p-4">
                                <p className="text-sm font-medium text-slate-800">{sess.location}</p>
                                <p className="text-xs font-mono text-slate-500 mt-0.5">{sess.ip_address}</p>
                              </td>
                              <td className="p-4 text-sm text-slate-600 font-medium">
                                {sess.last_active}
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleRevokeSession(sess.id)}
                                  disabled={sess.is_current}
                                  className={`p-2 rounded-lg transition-colors ${sess.is_current ? 'text-slate-300 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-50'}`}
                                  title={sess.is_current ? "Cannot revoke current session" : "Revoke Session"}
                                >
                                  <MonitorX className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'policies' && policies && (
                <form onSubmit={handleSavePolicies} className="max-w-3xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Security Policies</h3>
                    <p className="text-sm text-slate-500 mb-6">Configure authentication, passwords, and access control rules globally.</p>

                    <div className="space-y-6">
                      
                      <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">Force Two-Factor Authentication (2FA)</p>
                          <p className="text-xs text-slate-500 mt-1">Require all admins and staff to use 2FA for login.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={policies.force_2fa} onChange={(e) => setPolicies({...policies, force_2fa: e.target.checked})} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Minimum Password Length</label>
                          <input type="number" min="8" value={policies.password_min_length} onChange={(e) => setPolicies({...policies, password_min_length: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password Expiry (Days)</label>
                          <input type="number" value={policies.password_expiry_days} onChange={(e) => setPolicies({...policies, password_expiry_days: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Login Attempts (Lockout)</label>
                          <input type="number" value={policies.max_login_attempts} onChange={(e) => setPolicies({...policies, max_login_attempts: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Idle Session Timeout (Mins)</label>
                          <input type="number" value={policies.session_timeout_mins} onChange={(e) => setPolicies({...policies, session_timeout_mins: Number(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2">
                      {isSaving ? 'Saving...' : <><ShieldCheck className="w-4 h-4"/> Apply Policies</>}
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
