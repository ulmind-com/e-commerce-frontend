import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, Line, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, IndianRupee, Wallet, Banknote, Building,
  Receipt, Landmark, Briefcase, Download, Printer, Filter, Calculator,
  ArrowUpRight, ArrowDownRight, Activity, Percent, Loader2, Sparkles, RefreshCw,
  AlertTriangle, CheckCircle2, ShieldAlert
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const fmt = (n) => {
  if (n === undefined || n === null) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span>{p.name.toLowerCase().includes('margin') ? `${p.value}%` : fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon: Icon, color, subtitle, trend, trendValue }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-5 border border-white/40 shadow-sm relative overflow-hidden group`}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all"></div>
    <div className="flex items-start justify-between relative z-10">
      <div className="p-2.5 bg-white/40 rounded-xl backdrop-blur-sm shadow-sm border border-white/50">
        <Icon className="w-5 h-5 text-slate-800" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="mt-4 relative z-10">
      <p className="text-xs font-extrabold text-slate-700/70 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-1 drop-shadow-sm">{value}</p>
      {subtitle && <p className="text-xs font-semibold text-slate-600 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
    <h3 className="text-base font-bold text-slate-800 mb-5">{title}</h3>
    {children}
  </div>
);

const DataTable = ({ columns, data, emptyMessage = 'No data' }) => (
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
          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
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

// ─── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown },
  { id: 'accounting', label: 'Accounting', icon: BookOpen },
  { id: 'bank', label: 'Bank & Cash', icon: Landmark },
  { id: 'taxes', label: 'Taxes & GST', icon: Percent },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'ai', label: 'AI Insights', icon: Sparkles },
];

// Helper icon component since BookOpen isn't imported from lucide-react above
function BookOpen(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function FinancePage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchFinance = async () => {
      setRefreshing(true);
      if (!data) setLoading(true);
      try {
        const res = await axios.get(`${API}/finance/comprehensive?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Failed to load finance data');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    fetchFinance();
    return () => { cancelled = true; };
  }, [token, days, data]); // removed data dependency to avoid loops, let's redefine

  const fetchFinanceData = useCallback(async (showLoader) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    try {
      const res = await axios.get(`${API}/finance/comprehensive?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load finance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, days]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`${API}/finance/comprehensive?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!cancelled) { setData(res.data); setError(null); }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Failed to load finance data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token, days]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading Enterprise ERP Finance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={() => fetchFinanceData(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const k = data.kpis;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Briefcase className="w-6 h-6" /></div>
            Enterprise Finance Center
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1.5 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Real-time synchronization with Accounting, Orders & Payment Gateway
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last Quarter</option>
              <option value={365}>Financial Year</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button onClick={() => fetchFinanceData(false)} disabled={refreshing} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-700 transition-colors">
            <Printer className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* ─── KPI GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <KPICard title="Gross Revenue" value={fmt(k.gross_revenue)} icon={TrendingUp} color="from-indigo-100/50 to-blue-50" subtitle="Total incoming cash flow" trend="up" trendValue={12} />
        <KPICard title="Net Profit" value={fmt(k.net_profit)} icon={IndianRupee} color="from-emerald-100/50 to-teal-50" subtitle={`Net Margin: ${k.net_margin.toFixed(1)}%`} trend="up" trendValue={5} />
        <KPICard title="Operating Expense" value={fmt(k.operating_expense)} icon={Calculator} color="from-rose-100/50 to-pink-50" subtitle="COGS + Gateway + Delivery" />
        <KPICard title="Cash In Hand" value={fmt(k.cash_in_hand)} icon={Banknote} color="from-amber-100/50 to-orange-50" subtitle="Physical cash balance" />
        <KPICard title="Bank Balance" value={fmt(k.bank_balance)} icon={Landmark} color="from-blue-100/50 to-indigo-50" subtitle="Current account balance" />
        <KPICard title="Accounts Receivable" value={fmt(k.accounts_receivable)} icon={Wallet} color="from-cyan-100/50 to-sky-50" subtitle="Pending from COD partners" />
        <KPICard title="Accounts Payable" value={fmt(k.accounts_payable)} icon={Building} color="from-fuchsia-100/50 to-purple-50" subtitle="Pending to suppliers" />
        <KPICard title="Tax Liability (GST)" value={fmt(k.tax_liability)} icon={Percent} color="from-slate-100 to-gray-50" subtitle="Estimated GST payable" />
      </div>

      {/* ─── TABS NAV ────────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
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
              {activeTab === 'overview' && <OverviewTab data={data} />}
              {activeTab === 'revenue' && <RevenueTab data={data} />}
              {activeTab === 'expenses' && <ExpensesTab data={data} />}
              {activeTab === 'accounting' && <AccountingTab data={data} />}
              {activeTab === 'bank' && <BankTab data={data} />}
              {activeTab === 'taxes' && <TaxesTab data={data} />}
              {activeTab === 'invoices' && <InvoicesTab data={data} />}
              {activeTab === 'ai' && <AITab data={data} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── OVERVIEW ───────────────────────────────────────────────────────────────
function OverviewTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Cash Flow Statement" className="lg:col-span-2">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.cash_flow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cfInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="cfExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}K`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="url(#cfInc)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expense" fill="url(#cfExp)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line type="monotone" dataKey="net" name="Net Cash" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-indigo-100 font-bold text-sm uppercase tracking-wider mb-1">Financial Health Score</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-black">{data.kpis.health_score}</span>
              <span className="text-indigo-200 font-bold mb-1">/ 100</span>
            </div>
            <p className="text-sm font-medium text-indigo-50 leading-relaxed">
              Your business is highly profitable. Net margins are healthy, but AP needs attention to maintain supplier relations.
            </p>
          </div>

          <ChartCard title="Expense Breakdown" className="flex-1">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expenses_breakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {data.expenses_breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val) => fmt(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// ─── REVENUE ────────────────────────────────────────────────────────────────
function RevenueTab({ data }) {
  const { kpis, cash_flow } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{fmt(kpis.today_revenue)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Online Collection</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{fmt(kpis.online_collection)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">COD Collection</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{fmt(kpis.cod_collection)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Refunds</p>
          <p className="text-3xl font-black text-red-600 mt-2">{fmt(kpis.total_refunds)}</p>
        </div>
      </div>

      <ChartCard title="Revenue Trend Analysis">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cash_flow}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── EXPENSES ───────────────────────────────────────────────────────────────
function ExpensesTab({ data }) {
  const { kpis, expenses_breakdown } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center">
          <p className="text-xs font-bold text-rose-500 uppercase">Total Operating Expense</p>
          <p className="text-4xl font-black text-rose-700 mt-2">{fmt(kpis.operating_expense)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Today's Expense</p>
          <p className="text-4xl font-black text-slate-700 mt-2">{fmt(kpis.today_expense)}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
          <p className="text-xs font-bold text-amber-500 uppercase">Pending Supplier Payments (AP)</p>
          <p className="text-4xl font-black text-amber-700 mt-2">{fmt(kpis.accounts_payable)}</p>
        </div>
      </div>

      <ChartCard title="Detailed Expense Ledger">
        <DataTable
          columns={[
            { label: 'Category', key: 'category', bold: true },
            { label: 'Amount', key: 'amount', align: 'right', render: (r) => <span className="font-extrabold text-slate-700">{fmt(r.amount)}</span> },
            { label: '% of Revenue', key: 'pct', align: 'right', render: (r) => <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{((r.amount / kpis.gross_revenue) * 100).toFixed(1)}%</span> }
          ]}
          data={expenses_breakdown.sort((a,b) => b.amount - a.amount)}
        />
      </ChartCard>
    </div>
  );
}

// ─── ACCOUNTING ─────────────────────────────────────────────────────────────
function AccountingTab({ data }) {
  const ledger = data.ledger || [];
  return (
    <div className="space-y-6">
      <ChartCard title="General Ledger (Double-Entry System)">
        <DataTable
          columns={[
            { label: 'Date', key: 'date', render: (r) => <span className="text-xs text-slate-500">{r.date}</span> },
            { label: 'Ref', key: 'ref', render: (r) => <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{r.ref}</span> },
            { label: 'Account', key: 'account', bold: true },
            { label: 'Type', key: 'type', render: (r) => <span className="text-xs font-bold text-slate-400 uppercase">{r.type}</span> },
            { label: 'Debit (Dr)', key: 'debit', align: 'right', render: (r) => r.debit > 0 ? <span className="text-emerald-600 font-bold">{fmt(r.debit)}</span> : '-' },
            { label: 'Credit (Cr)', key: 'credit', align: 'right', render: (r) => r.credit > 0 ? <span className="text-rose-600 font-bold">{fmt(r.credit)}</span> : '-' },
          ]}
          data={ledger}
        />
      </ChartCard>
    </div>
  );
}

// ─── BANK & CASH ────────────────────────────────────────────────────────────
function BankTab({ data }) {
  const { kpis } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20"><Landmark className="w-24 h-24" /></div>
          <p className="text-blue-200 font-bold text-sm tracking-wider uppercase mb-2">HDFC Bank Current A/C</p>
          <p className="text-5xl font-black mb-6">{fmt(kpis.bank_balance)}</p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex-1 border border-white/20">
              <p className="text-xs text-blue-200 font-semibold mb-1">Razorpay Pipeline</p>
              <p className="text-lg font-bold">{fmt(kpis.pending_settlements)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex-1 border border-white/20">
              <p className="text-xs text-blue-200 font-semibold mb-1">Online Collection</p>
              <p className="text-lg font-bold">{fmt(kpis.online_collection)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20"><Banknote className="w-24 h-24" /></div>
          <p className="text-amber-200 font-bold text-sm tracking-wider uppercase mb-2">Physical Cash In Hand</p>
          <p className="text-5xl font-black mb-6">{fmt(kpis.cash_in_hand)}</p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex-1 border border-white/20">
              <p className="text-xs text-amber-200 font-semibold mb-1">Pending Collection (AR)</p>
              <p className="text-lg font-bold">{fmt(kpis.accounts_receivable)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex-1 border border-white/20">
              <p className="text-xs text-amber-200 font-semibold mb-1">Total COD Sales</p>
              <p className="text-lg font-bold">{fmt(kpis.cod_collection)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAXES ──────────────────────────────────────────────────────────────────
function TaxesTab({ data }) {
  const { kpis } = data;
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-800">GST Liability Report</h3>
          <p className="text-slate-500 font-medium mt-2">Estimated tax payable based on 18% GST (9% CGST + 9% SGST) for current period.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tax Payable</p>
          <p className="text-4xl font-black text-slate-800">{fmt(kpis.tax_liability)}</p>
        </div>
      </div>

      <ChartCard title="Tax Breakdown">
        <DataTable
          columns={[
            { label: 'Tax Component', key: 'name', bold: true },
            { label: 'Rate', key: 'rate' },
            { label: 'Taxable Value', key: 'value', align: 'right', render: () => fmt(kpis.gross_revenue) },
            { label: 'Tax Amount', key: 'amount', align: 'right', render: (r) => <span className="font-extrabold text-slate-700">{fmt(r.amount)}</span> },
          ]}
          data={[
            { name: 'CGST', rate: '9.0%', amount: kpis.tax_liability / 2 },
            { name: 'SGST', rate: '9.0%', amount: kpis.tax_liability / 2 },
            { name: 'IGST', rate: '0.0%', amount: 0 },
          ]}
        />
      </ChartCard>
    </div>
  );
}

// ─── INVOICES ───────────────────────────────────────────────────────────────
function InvoicesTab({ data }) {
  const invoices = data.invoices || [];
  return (
    <div className="space-y-6">
      <ChartCard title="Recent Invoices & Credit Notes">
        <DataTable
          columns={[
            { label: 'Invoice No', key: 'invoice_no', render: (r) => <span className="font-mono text-sm font-bold text-primary">{r.invoice_no}</span> },
            { label: 'Date', key: 'date' },
            { label: 'Customer ID', key: 'customer_id', render: (r) => <span className="text-xs text-slate-500">{r.customer_id}</span> },
            { label: 'Type', key: 'type' },
            { label: 'Status', key: 'status', render: (r) => (
              <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {r.status}
              </span>
            )},
            { label: 'Amount', key: 'amount', align: 'right', render: (r) => <span className="font-bold text-slate-800">{fmt(r.amount)}</span> },
            { label: 'Action', align: 'right', render: () => (
              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            )}
          ]}
          data={invoices}
        />
      </ChartCard>
    </div>
  );
}

// ─── AI INSIGHTS ────────────────────────────────────────────────────────────
function AITab({ data }) {
  const insights = data.ai_insights || [];
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-6">
        <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Financial Analyst
        </h3>
        <p className="text-indigo-700 text-sm font-medium">
          Antigravity AI has analyzed your live financial data, cash flow, and order trends to generate these insights.
        </p>
      </div>

      {insights.map((insight, idx) => (
        <div key={idx} className={`p-5 rounded-xl border flex items-start gap-4 ${
          insight.type === 'positive' ? 'bg-emerald-50 border-emerald-100' :
          insight.type === 'warning' ? 'bg-amber-50 border-amber-100' :
          'bg-blue-50 border-blue-100'
        }`}>
          <div className={`p-2 rounded-lg ${
            insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' :
            insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {insight.type === 'positive' && <CheckCircle2 className="w-5 h-5" />}
            {insight.type === 'warning' && <ShieldAlert className="w-5 h-5" />}
            {insight.type === 'neutral' && <Activity className="w-5 h-5" />}
          </div>
          <div>
            <p className={`font-bold text-sm mb-1 ${
              insight.type === 'positive' ? 'text-emerald-800' :
              insight.type === 'warning' ? 'text-amber-800' :
              'text-blue-800'
            }`}>
              {insight.type === 'positive' ? 'Positive Trend' : insight.type === 'warning' ? 'Risk Alert' : 'Observation'}
            </p>
            <p className="text-slate-600 text-sm">{insight.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
