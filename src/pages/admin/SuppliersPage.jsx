import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import {
  Truck, Package, Users, Receipt, Building, FileText,
  Search, Filter, Plus, Download, ChevronRight, CheckCircle2,
  AlertTriangle, Sparkles, X, Mail, Phone, RefreshCw, Loader2,
  IndianRupee, Star, MapPin
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
          <span>{p.name.includes('Amount') ? fmt(p.value) : p.value}</span>
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
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
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
  { id: 'overview', label: 'Overview', icon: Building },
  { id: 'directory', label: 'Directory', icon: Users },
  { id: 'pos', label: 'Purchase Orders', icon: FileText },
  { id: 'grn', label: 'Goods Receipt', icon: Package },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'ai', label: 'AI Insights', icon: Sparkles },
];

export default function SuppliersPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Form States
  const [supForm, setSupForm] = useState({ company_name: '', owner_name: '', email: '', phone: '', gst_number: '', category: 'General', address: '' });
  const [poForm, setPoForm] = useState({ supplier_id: '', products: '', quantity: '', total_cost: '', expected_date: '' });
  const [grnForm, setGrnForm] = useState({ po_id: '', received_quantity: '', damaged_quantity: '' });
  const [payForm, setPayForm] = useState({ payment_id: '', mode: 'Bank Transfer' });

  // Data States
  const [dashboard, setDashboard] = useState(null);
  const [directory, setDirectory] = useState([]);
  const [pos, setPos] = useState([]);
  const [grns, setGrns] = useState([]);
  const [payments, setPayments] = useState([]);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, dirRes, poRes, grnRes, payRes] = await Promise.all([
        axios.get(`${API}/suppliers/dashboard`, { headers }),
        axios.get(`${API}/suppliers/directory`, { headers }),
        axios.get(`${API}/suppliers/pos`, { headers }),
        axios.get(`${API}/suppliers/grn`, { headers }),
        axios.get(`${API}/suppliers/payments`, { headers })
      ]);
      setDashboard(dashRes.data);
      setDirectory(dirRes.data);
      setPos(poRes.data);
      setGrns(grnRes.data);
      setPayments(payRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load SRM data');
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
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers/directory`, supForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddModal(false);
      fetchData(false);
      setSupForm({ company_name: '', owner_name: '', email: '', phone: '', gst_number: '', category: 'General', address: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding supplier');
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers/pos`, poForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowPOModal(false);
      fetchData(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating PO');
    }
  };

  const handlePOStatus = async (id, status) => {
    try {
      await axios.put(`${API}/suppliers/pos/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(false);
    } catch {
      alert('Error updating PO');
    }
  };

  const handleReceiveGoods = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers/grn`, grnForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowGRNModal(false);
      fetchData(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error receiving goods');
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers/payments/${payForm.payment_id}/pay`, { mode: payForm.mode }, { headers: { Authorization: `Bearer ${token}` } });
      setShowPaymentModal(false);
      fetchData(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error processing payment');
    }
  };

  const openPaymentModal = (pid) => {
    setPayForm({ payment_id: pid, mode: 'Bank Transfer' });
    setShowPaymentModal(true);
  };
  
  const openGRNModal = (poid) => {
    setGrnForm({ po_id: poid, received_quantity: '', damaged_quantity: '0' });
    setShowGRNModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading Enterprise Procurement...</p>
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
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Truck className="w-6 h-6" /></div>
            Enterprise Procurement & SRM
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" /></span>
             Real-time PO, GRN, Payments & Supplier Data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fetchData(false)} disabled={refreshing} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button onClick={() => setShowPOModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 text-slate-700 transition-colors">
            <FileText className="w-4 h-4" /> Raise PO
          </button>
          
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      {/* ─── KPI GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard title="Total Suppliers" value={k.total_suppliers} icon={Building} color="from-blue-100/50 to-indigo-50" subtitle={`${k.active_suppliers} Active`} />
        <KPICard title="Pending Deliveries" value={k.pending_deliveries} icon={Truck} color="from-amber-100/50 to-orange-50" subtitle="Awaiting GRN" />
        <KPICard title="Total POs" value={k.total_pos} icon={FileText} color="from-emerald-100/50 to-teal-50" subtitle="Issued to date" />
        <KPICard title="Pending Payments" value={k.pending_payments} icon={Receipt} color="from-rose-100/50 to-pink-50" subtitle="Invoices unpaid" />
        <KPICard title="Supplier Rating" value={`${k.supplier_rating}/5.0`} icon={Star} color="from-fuchsia-100/50 to-purple-50" subtitle="Overall average" />
        <KPICard title="Outstanding (AP)" value={fmt(k.outstanding_balance)} icon={IndianRupee} color="from-slate-100 to-gray-50" subtitle="To be paid" />
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
                  <ChartCard title="Procurement Trend (Last 7 Days)">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboard.purchase_trend}>
                          <defs>
                            <linearGradient id="colorPurch" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`₹${v/1000}K`} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="amount" name="PO Amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPurch)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                  <ChartCard title="Category Distribution">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ cat: 'Vegetables', val: 120 }, { cat: 'Dairy', val: 250 }, { cat: 'FMCG', val: 500 }, { cat: 'Meat', val: 90 }]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="cat" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="val" name="Volume" fill="#8b5cf6" radius={[4,4,0,0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </div>
              )}

              {activeTab === 'directory' && (
                <ChartCard title="Vendor & Supplier Directory" className="!p-0 overflow-hidden">
                  <div className="p-4 flex gap-4 bg-white border-b border-slate-100">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search by name, GST or ID..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 text-slate-700">
                      <Filter className="w-4 h-4" /> Filters
                    </button>
                  </div>
                  <DataTable
                    onRowClick={setSelectedSupplier}
                    columns={[
                      { label: 'Supplier', key: 'company_name', render: (r) => (
                        <div>
                          <p className="font-bold text-slate-800">{r.company_name}</p>
                          <p className="text-xs text-slate-500">{r.supplier_id}</p>
                        </div>
                      )},
                      { label: 'Category', key: 'category', render: (r) => <span className="font-medium text-slate-600">{r.category}</span>},
                      { label: 'GST Number', key: 'gst_number', render: (r) => <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{r.gst_number || 'N/A'}</span>},
                      { label: 'Contact Person', key: 'owner_name' },
                      { label: 'Status', key: 'status', render: (r) => <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">{r.status}</span>},
                      { label: '', key: 'action', align: 'right', render: () => <ChevronRight className="w-4 h-4 text-slate-400" /> }
                    ]}
                    data={directory}
                  />
                </ChartCard>
              )}

              {activeTab === 'pos' && (
                <ChartCard title="Purchase Orders">
                  <DataTable
                    columns={[
                      { label: 'PO Number', key: 'po_number', render: (r) => <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">{r.po_number}</span> },
                      { label: 'Supplier', key: 'supplier_name', bold: true },
                      { label: 'Products', key: 'products', render: (r) => <span className="text-slate-600">{r.products}</span> },
                      { label: 'Qty', key: 'quantity', align: 'right', render: (r) => <span className="font-bold">{r.quantity}</span> },
                      { label: 'Total Cost', key: 'total_cost', align: 'right', render: (r) => <span className="font-extrabold text-slate-800">{fmt(r.total_cost)}</span> },
                      { label: 'Expected By', key: 'expected_date', render: (r) => <span className="text-slate-500 text-sm">{r.expected_date}</span> },
                      { label: 'Status', key: 'status', render: (r) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          r.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>{r.status}</span>
                      )},
                      { label: 'Action', key: 'action', align: 'right', render: (r) => (
                        r.status === 'Pending' ? <button onClick={() => handlePOStatus(r.id, 'Sent')} className="text-xs font-bold text-primary hover:underline">Approve & Send</button> :
                        r.status === 'Sent' ? <button onClick={() => openGRNModal(r.id)} className="text-xs font-bold text-emerald-600 hover:underline">Receive Goods (GRN)</button> :
                        <span className="text-xs text-slate-400">Done</span>
                      )}
                    ]}
                    data={pos}
                  />
                </ChartCard>
              )}

              {activeTab === 'grn' && (
                <ChartCard title="Goods Receipt Notes (GRN)">
                  <DataTable
                    columns={[
                      { label: 'GRN Number', key: 'grn_number', render: (r) => <span className="text-xs font-mono font-bold text-slate-700">{r.grn_number}</span> },
                      { label: 'PO Ref', key: 'po_number', render: (r) => <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{r.po_number}</span> },
                      { label: 'Supplier', key: 'supplier_name', bold: true },
                      { label: 'Date', key: 'date', render: (r) => <span className="text-slate-500">{r.date}</span> },
                      { label: 'Received', key: 'received_quantity', align: 'right', render: (r) => <span className="font-bold text-blue-600">{r.received_quantity}</span> },
                      { label: 'Damaged', key: 'damaged_quantity', align: 'right', render: (r) => <span className="font-bold text-red-500">{r.damaged_quantity}</span> },
                      { label: 'Accepted', key: 'accepted_quantity', align: 'right', render: (r) => <span className="font-bold text-emerald-600">{r.accepted_quantity}</span> },
                      { label: '', key: 'action', align: 'right', render: () => <button className="p-1 text-slate-400 hover:text-slate-800"><Download className="w-4 h-4" /></button>}
                    ]}
                    data={grns}
                  />
                </ChartCard>
              )}

              {activeTab === 'payments' && (
                <ChartCard title="Supplier Payments (Accounts Payable)">
                  <DataTable
                    columns={[
                      { label: 'PO Ref', key: 'po_number', render: (r) => <span className="text-xs font-mono font-bold text-primary">{r.po_number}</span> },
                      { label: 'Supplier', key: 'supplier_name', bold: true },
                      { label: 'Amount', key: 'amount', align: 'right', render: (r) => <span className="font-extrabold text-slate-800 text-base">{fmt(r.amount)}</span> },
                      { label: 'Due Date', key: 'due_date', render: (r) => <span className="text-slate-500">{r.due_date}</span> },
                      { label: 'Status', key: 'status', render: (r) => (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>{r.status}</span>
                      )},
                      { label: 'Txn / Mode', key: 'payment_mode', render: (r) => (
                        r.status === 'Paid' ? <div><p className="font-bold text-slate-700 text-xs">{r.payment_mode}</p><p className="text-xs font-mono text-slate-400">{r.transaction_id}</p></div> : <span className="text-slate-400">-</span>
                      )},
                      { label: 'Action', align: 'right', render: (r) => (
                        r.status === 'Pending' ? <button onClick={() => openPaymentModal(r.id)} className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">Pay Now</button> : <span className="text-emerald-500 text-xs font-bold flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3"/> Settled</span>
                      )}
                    ]}
                    data={payments}
                  />
                </ChartCard>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                    <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-indigo-600" />Antigravity AI Procurement Engine</h3>
                    <p className="text-indigo-700 text-sm font-medium">Our AI analyzes historical purchase data, lead times, and seasonal trends to optimize your supply chain.</p>
                  </div>
                  {dashboard.ai_insights.map((insight, idx) => (
                    <div key={idx} className={`p-5 rounded-xl border flex items-start gap-4 ${insight.type === 'positive' ? 'bg-emerald-50 border-emerald-100' : insight.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                      <div className={`p-2 rounded-lg ${insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : insight.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {insight.type === 'positive' && <CheckCircle2 className="w-5 h-5" />}
                        {insight.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        {insight.type === 'neutral' && <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm mb-1 ${insight.type === 'positive' ? 'text-emerald-800' : insight.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>
                          {insight.type === 'positive' ? 'Optimization Achieved' : insight.type === 'warning' ? 'Supply Chain Risk' : 'Actionable Recommendation'}
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

      {/* ─── SUPPLIER PROFILE DRAWER ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSupplier && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSupplier(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200 flex flex-col">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-black text-slate-800">Supplier Profile</h3>
                <button onClick={() => setSelectedSupplier(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 flex-1">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-md mb-4 text-3xl font-black text-slate-300">
                    {selectedSupplier.company_name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 text-center">{selectedSupplier.company_name}</h2>
                  <p className="text-primary font-bold">{selectedSupplier.category}</p>
                  <span className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">{selectedSupplier.status}</span>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Business Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Supplier ID</span><span className="text-sm font-bold text-slate-800">{selectedSupplier.supplier_id}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Owner</span><span className="text-sm font-bold text-slate-800">{selectedSupplier.owner_name}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">GST Number</span><span className="text-sm font-mono font-bold text-slate-800">{selectedSupplier.gst_number || 'N/A'}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Onboarded</span><span className="text-sm font-bold text-slate-800">{selectedSupplier.created_at}</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{selectedSupplier.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{selectedSupplier.phone}</span></div>
                      <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" /><span className="text-sm font-medium text-slate-700">{selectedSupplier.address || 'Address not provided'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Onboard New Supplier">
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Company / Vendor Name</label><input type="text" required value={supForm.company_name} onChange={e=>setSupForm({...supForm, company_name:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Contact Person</label><input type="text" required value={supForm.owner_name} onChange={e=>setSupForm({...supForm, owner_name:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
              <select value={supForm.category} onChange={e=>setSupForm({...supForm, category:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                <option value="Vegetables">Vegetables</option><option value="Dairy">Dairy</option><option value="FMCG">FMCG</option><option value="Electronics">Electronics</option><option value="General">General</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Email</label><input type="email" required value={supForm.email} onChange={e=>setSupForm({...supForm, email:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Phone</label><input type="text" required value={supForm.phone} onChange={e=>setSupForm({...supForm, phone:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">GST Number (Optional)</label><input type="text" value={supForm.gst_number} onChange={e=>setSupForm({...supForm, gst_number:e.target.value})} className="w-full font-mono bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="e.g. 22AAAAA0000A1Z5" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Warehouse Address</label><textarea required value={supForm.address} onChange={e=>setSupForm({...supForm, address:e.target.value})} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"></textarea></div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-600">Register Supplier</button></div>
        </form>
      </Modal>

      <Modal isOpen={showPOModal} onClose={() => setShowPOModal(false)} title="Raise Purchase Order (PO)">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Select Supplier</label>
            <select required value={poForm.supplier_id} onChange={e=>setPoForm({...poForm, supplier_id:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
              <option value="">Choose...</option>
              {directory.map(s => <option key={s.id} value={s.id}>{s.company_name} ({s.supplier_id})</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Products Description</label><textarea required value={poForm.products} onChange={e=>setPoForm({...poForm, products:e.target.value})} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="e.g. 100x Apples, 50x Milk Cartons"></textarea></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Total Quantity (Units)</label><input type="number" required value={poForm.quantity} onChange={e=>setPoForm({...poForm, quantity:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Estimated Cost (₹)</label><input type="number" required value={poForm.total_cost} onChange={e=>setPoForm({...poForm, total_cost:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Expected Delivery Date</label><input type="date" required value={poForm.expected_date} onChange={e=>setPoForm({...poForm, expected_date:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-600">Generate PO</button></div>
        </form>
      </Modal>

      <Modal isOpen={showGRNModal} onClose={() => setShowGRNModal(false)} title="Goods Receipt Note (GRN)">
        <form onSubmit={handleReceiveGoods} className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
            <p className="text-amber-800 text-sm font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Confirm physical inventory count.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Total Received Qty</label><input type="number" required value={grnForm.received_quantity} onChange={e=>setGrnForm({...grnForm, received_quantity:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Damaged/Rejected Qty</label><input type="number" required value={grnForm.damaged_quantity} onChange={e=>setGrnForm({...grnForm, damaged_quantity:e.target.value})} className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 font-bold text-rose-600" /></div>
          </div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600">Log Receipt & Update Inventory</button></div>
        </form>
      </Modal>

      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Process Supplier Payment">
        <form onSubmit={handleMakePayment} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Payment Method</label>
            <select value={payForm.mode} onChange={e=>setPayForm({...payForm, mode:e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="pt-4"><button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800">Confirm Payment</button></div>
        </form>
      </Modal>

    </div>
  );
}
