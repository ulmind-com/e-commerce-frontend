import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import {
  Users, UserCheck, UserX, Clock, Calendar, Briefcase, FileText,
  Plus, Download, ChevronRight, CheckCircle2,
  AlertTriangle, Sparkles, X, Mail, Phone, Building,
  Award, RefreshCw, Loader2, LogIn, LogOut
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
          <span>{p.value}</span>
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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'directory', label: 'Directory', icon: Briefcase },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leaves', label: 'Leaves', icon: Calendar },
  { id: 'payroll', label: 'Payroll', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'ai', label: 'AI Insights', icon: Sparkles },
];

export default function StaffPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  // Forms
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '', department: 'Operations', designation: 'Staff', role: 'admin', salary: '' });
  const [taskForm, setTaskForm] = useState({ title: '', assignee_id: '', priority: 'Medium', deadline: '' });
  const [leaveForm, setLeaveForm] = useState({ type: 'Casual Leave', from: '', to: '', reason: '' });

  // Data States
  const [dashboard, setDashboard] = useState(null);
  const [directory, setDirectory] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, dirRes, attRes, levRes, payRes, taskRes] = await Promise.all([
        axios.get(`${API}/staff/dashboard`, { headers }),
        axios.get(`${API}/staff/directory`, { headers }),
        axios.get(`${API}/staff/attendance`, { headers }),
        axios.get(`${API}/staff/leaves`, { headers }),
        axios.get(`${API}/staff/payroll`, { headers }),
        axios.get(`${API}/staff/tasks`, { headers })
      ]);
      setDashboard(dashRes.data);
      setDirectory(dirRes.data);
      setAttendance(attRes.data);
      setLeaves(levRes.data);
      setPayroll(payRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load HRMS data');
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
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/staff/directory`, addForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddModal(false);
      fetchData(false);
      setAddForm({ name: '', email: '', password: '', phone: '', department: 'Operations', designation: 'Staff', role: 'admin', salary: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding staff');
    }
  };

  const handleClockIn = async () => {
    try {
      await axios.post(`${API}/staff/attendance/clock-in`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error clocking in');
    }
  };

  const handleClockOut = async () => {
    try {
      await axios.post(`${API}/staff/attendance/clock-out`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error clocking out');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/staff/leaves`, leaveForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowLeaveModal(false);
      fetchData(false);
    } catch {
      alert('Error applying leave');
    }
  };

  const handleLeaveStatus = async (id, status) => {
    try {
      await axios.put(`${API}/staff/leaves/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(false);
    } catch {
      alert('Error updating leave');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const assignee = directory.find(d => d.id === taskForm.assignee_id)?.name || 'Unknown';
    try {
      await axios.post(`${API}/staff/tasks`, { ...taskForm, assignee }, { headers: { Authorization: `Bearer ${token}` } });
      setShowTaskModal(false);
      fetchData(false);
    } catch {
      alert('Error adding task');
    }
  };

  const handleTaskStatus = async (id, status) => {
    try {
      await axios.put(`${API}/staff/tasks/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(false);
    } catch {
      alert('Error updating task');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading Enterprise HRMS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={() => fetchData(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">
          Retry
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
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Users className="w-6 h-6" /></div>
            Enterprise HRMS & Staff Management
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
             Real-time A-Z CRUD functionality connected to database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fetchData(false)} disabled={refreshing} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button onClick={handleClockIn} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-100 transition-colors">
            <LogIn className="w-4 h-4" /> Clock In
          </button>
          
          <button onClick={handleClockOut} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-100 transition-colors">
            <LogOut className="w-4 h-4" /> Clock Out
          </button>

          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* ─── KPI GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Total Staff" value={k.total_staff} icon={Users} color="from-blue-100/50 to-indigo-50" subtitle={`${k.total_departments} Departments`} />
        <KPICard title="Present Today" value={k.present_today} icon={UserCheck} color="from-emerald-100/50 to-teal-50" subtitle={`${((k.present_today/(k.total_staff||1))*100).toFixed(0)}% Attendance`} />
        <KPICard title="On Leave" value={k.on_leave} icon={UserX} color="from-amber-100/50 to-orange-50" subtitle="Approved leaves today" />
        <KPICard title="Late Arrivals" value={k.late_arrivals} icon={Clock} color="from-rose-100/50 to-pink-50" subtitle="Clocked in after 09:30 AM" />
        <KPICard title="Avg Performance" value={`${k.avg_performance}/5.0`} icon={Award} color="from-fuchsia-100/50 to-purple-50" subtitle="Organization wide" />
      </div>

      {/* ─── TABS NAV ────────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[500px]">
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
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
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
                  <ChartCard title="Attendance Trend (Last 7 Days)">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboard.attendance_trend}>
                          <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="present" name="Present Staff" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                  <ChartCard title="Department Distribution">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ dept: 'Ops', count: 12 }, { dept: 'Whse', count: 25 }, { dept: 'Mktg', count: 5 }, { dept: 'Fin', count: 3 }, { dept: 'Support', count: 8 }]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="dept" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="count" name="Staff Count" fill="#6366f1" radius={[4,4,0,0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </div>
              )}

              {activeTab === 'directory' && (
                <div className="space-y-4">
                  <ChartCard title="Employee Directory" className="!p-0 overflow-hidden">
                    <DataTable
                      onRowClick={setSelectedStaff}
                      columns={[
                        { label: 'Employee', key: 'name', render: (r) => (
                          <div className="flex items-center gap-3">
                            <img src={r.avatar} alt="avatar" className="w-8 h-8 rounded-full shadow-sm" />
                            <div><p className="font-bold text-slate-800">{r.name}</p><p className="text-xs text-slate-500">{r.employee_id}</p></div>
                          </div>
                        )},
                        { label: 'Department', key: 'department', render: (r) => <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Building className="w-3.5 h-3.5" /> {r.department}</span>},
                        { label: 'Designation', key: 'designation', render: (r) => (<div><p className="font-bold text-slate-700">{r.designation}</p><p className="text-xs text-slate-500 uppercase tracking-wider">{r.role}</p></div>)},
                        { label: 'Status', key: 'status', render: (r) => <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">{r.status}</span>},
                        { label: '', key: 'action', align: 'right', render: () => <ChevronRight className="w-4 h-4 text-slate-400" /> }
                      ]}
                      data={directory}
                    />
                  </ChartCard>
                </div>
              )}

              {activeTab === 'attendance' && (
                <ChartCard title="Recent Attendance Logs">
                  <DataTable
                    columns={[
                      { label: 'Employee', key: 'name', bold: true },
                      { label: 'Emp ID', key: 'employee_id', render: (r) => <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{r.employee_id}</span> },
                      { label: 'Date', key: 'date', render: (r) => <span className="text-slate-500">{r.date}</span> },
                      { label: 'Status', key: 'status', render: (r) => (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                        }`}>{r.status}</span>
                      )},
                      { label: 'Clock In', key: 'clock_in', render: (r) => <span className="font-semibold text-slate-700">{r.clock_in}</span> },
                      { label: 'Clock Out', key: 'clock_out', render: (r) => <span className="text-slate-500">{r.clock_out}</span> },
                      { label: 'Total Hours', key: 'working_hours', align: 'right', render: (r) => <span className="font-bold text-slate-800">{r.working_hours}</span> }
                    ]}
                    data={attendance}
                  />
                </ChartCard>
              )}

              {activeTab === 'leaves' && (
                <ChartCard title="Leave Requests" action={
                  <button onClick={() => setShowLeaveModal(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-primary-600">Apply Leave</button>
                }>
                  <DataTable
                    columns={[
                      { label: 'Employee', key: 'name', bold: true },
                      { label: 'Type', key: 'type', render: (r) => <span className="font-medium text-slate-700">{r.type}</span> },
                      { label: 'Duration', key: 'duration', render: (r) => <span className="text-sm text-slate-500">{r.from} to {r.to} ({r.days} days)</span> },
                      { label: 'Reason', key: 'reason', render: (r) => <span className="text-sm text-slate-500">{r.reason}</span> },
                      { label: 'Status', key: 'status', render: (r) => (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{r.status}</span>
                      )},
                      { label: 'Actions', key: 'action', align: 'right', render: (r) => (
                        r.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleLeaveStatus(r.id, 'Approved')} className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600">Approve</button>
                            <button onClick={() => handleLeaveStatus(r.id, 'Rejected')} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600">Reject</button>
                          </div>
                        ) : <span className="text-xs text-slate-400">Resolved</span>
                      )}
                    ]}
                    data={leaves}
                  />
                </ChartCard>
              )}

              {activeTab === 'tasks' && (
                <ChartCard title="Active HR & Staff Tasks" action={
                  <button onClick={() => setShowTaskModal(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-primary-600">Assign Task</button>
                }>
                  <DataTable
                    columns={[
                      { label: 'Title', key: 'title', bold: true },
                      { label: 'Assignee', key: 'assignee', render: (r) => <span className="font-medium text-slate-700">{r.assignee}</span> },
                      { label: 'Priority', key: 'priority', render: (r) => (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          r.priority === 'High' ? 'bg-red-100 text-red-700' :
                          r.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>{r.priority}</span>
                      )},
                      { label: 'Deadline', key: 'deadline', render: (r) => <span className="text-slate-500 text-sm">{r.deadline}</span> },
                      { label: 'Status', key: 'status', render: (r) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          r.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          r.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{r.status}</span>
                      )},
                      { label: 'Actions', key: 'action', align: 'right', render: (r) => (
                        r.status !== 'Done' && (
                          <div className="flex justify-end gap-2">
                            {r.status === 'Pending' && <button onClick={() => handleTaskStatus(r.id, 'In Progress')} className="text-xs text-blue-600 font-bold hover:underline">Start</button>}
                            {r.status === 'In Progress' && <button onClick={() => handleTaskStatus(r.id, 'Done')} className="text-xs text-emerald-600 font-bold hover:underline">Complete</button>}
                          </div>
                        )
                      )}
                    ]}
                    data={tasks}
                  />
                </ChartCard>
              )}
              
              {activeTab === 'payroll' && (
                <ChartCard title="Payroll Processing (Current Month)">
                  <DataTable
                    columns={[
                      { label: 'Employee', key: 'name', bold: true },
                      { label: 'Month', key: 'month', render: (r) => <span className="text-sm text-slate-500">{r.month}</span> },
                      { label: 'Basic Salary', key: 'basic_salary', align: 'right', render: (r) => <span className="text-slate-600">₹{r.basic_salary.toLocaleString()}</span> },
                      { label: 'Allowances', key: 'allowances', align: 'right', render: (r) => <span className="text-emerald-600">+ ₹{r.allowances.toLocaleString()}</span> },
                      { label: 'Deductions', key: 'deductions', align: 'right', render: (r) => <span className="text-red-500">- ₹{r.deductions.toLocaleString()}</span> },
                      { label: 'Net Salary', key: 'net_salary', align: 'right', render: (r) => <span className="font-extrabold text-slate-800 text-base">₹{r.net_salary.toLocaleString()}</span> },
                      { label: 'Action', align: 'right', render: () => (
                        <button className="flex items-center gap-1 ml-auto px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">
                          <Download className="w-3 h-3" /> Slip
                        </button>
                      )}
                    ]}
                    data={payroll}
                  />
                </ChartCard>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                    <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-indigo-600" />Antigravity AI HR Assistant</h3>
                    <p className="text-indigo-700 text-sm font-medium">Our AI analyzes attendance patterns, workload, and performance to provide actionable workforce insights.</p>
                  </div>
                  {dashboard.ai_insights.map((insight, idx) => (
                    <div key={idx} className={`p-5 rounded-xl border flex items-start gap-4 ${insight.type === 'positive' ? 'bg-emerald-50 border-emerald-100' : insight.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                      <div className={`p-2 rounded-lg ${insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : insight.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {insight.type === 'positive' && <CheckCircle2 className="w-5 h-5" />}
                        {insight.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        {insight.type === 'neutral' && <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm mb-1 ${insight.type === 'positive' ? 'text-emerald-800' : insight.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>
                          {insight.type === 'positive' ? 'Positive Trend' : insight.type === 'warning' ? 'Alert' : 'Observation'}
                        </p>
                        <p className="text-slate-600 text-sm">{insight.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── EMPLOYEE PROFILE DRAWER ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedStaff && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200 flex flex-col">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-black text-slate-800">Employee Profile</h3>
                <button onClick={() => setSelectedStaff(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 flex-1">
                <div className="flex flex-col items-center mb-8">
                  <img src={selectedStaff.avatar} alt="avatar" className="w-24 h-24 rounded-2xl shadow-md border-4 border-white mb-4" />
                  <h2 className="text-2xl font-black text-slate-800">{selectedStaff.name}</h2>
                  <p className="text-primary font-bold">{selectedStaff.designation}</p>
                  <span className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">{selectedStaff.status}</span>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Work Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Employee ID</span><span className="text-sm font-bold text-slate-800">{selectedStaff.employee_id}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Department</span><span className="text-sm font-bold text-slate-800">{selectedStaff.department}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Role</span><span className="text-sm font-bold text-slate-800">{selectedStaff.role}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Joining Date</span><span className="text-sm font-bold text-slate-800">{selectedStaff.joining_date}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Salary</span><span className="text-sm font-bold text-slate-800">₹{selectedStaff.salary?.toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{selectedStaff.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{selectedStaff.phone}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee">
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label><input type="text" required value={addForm.name} onChange={e=>setAddForm({...addForm, name:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Email</label><input type="email" required value={addForm.email} onChange={e=>setAddForm({...addForm, email:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Password</label><input type="password" required value={addForm.password} onChange={e=>setAddForm({...addForm, password:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Department</label><input type="text" value={addForm.department} onChange={e=>setAddForm({...addForm, department:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Designation</label><input type="text" value={addForm.designation} onChange={e=>setAddForm({...addForm, designation:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Salary (Monthly)</label><input type="number" value={addForm.salary} onChange={e=>setAddForm({...addForm, salary:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
              <select value={addForm.role} onChange={e=>setAddForm({...addForm, role:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-600">Register Employee</button></div>
        </form>
      </Modal>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Assign New Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Task Title</label><input type="text" required value={taskForm.title} onChange={e=>setTaskForm({...taskForm, title:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Assign To</label>
            <select required value={taskForm.assignee_id} onChange={e=>setTaskForm({...taskForm, assignee_id:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
              <option value="">Select Staff...</option>
              {directory.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
              <select value={taskForm.priority} onChange={e=>setTaskForm({...taskForm, priority:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
              </select>
            </div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Deadline</label><input type="date" required value={taskForm.deadline} onChange={e=>setTaskForm({...taskForm, deadline:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          </div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-600">Assign Task</button></div>
        </form>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Apply for Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Leave Type</label>
            <select value={leaveForm.type} onChange={e=>setLeaveForm({...leaveForm, type:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
              <option value="Casual Leave">Casual Leave</option><option value="Sick Leave">Sick Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">From Date</label><input type="date" required value={leaveForm.from} onChange={e=>setLeaveForm({...leaveForm, from:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">To Date</label><input type="date" required value={leaveForm.to} onChange={e=>setLeaveForm({...leaveForm, to:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Reason</label><textarea required value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason:e.target.value})} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"></textarea></div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-600">Submit Application</button></div>
        </form>
      </Modal>

    </div>
  );
}
