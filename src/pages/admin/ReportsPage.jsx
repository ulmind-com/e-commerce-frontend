import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  TrendingUp, IndianRupee, ShoppingCart, Users, Package,
  CreditCard, Banknote, RotateCcw, XCircle, Clock, CheckCircle2,
  Download, Printer, FileText, Calendar,
  Star, Ticket, BarChart3, Activity, AlertTriangle, PackageX,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// ─── Color Palette ──────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

// ─── Currency Formatter ─────────────────────────────────────────────────────
const fmt = (n) => {
  if (n === undefined || n === null) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const num = (n) => {
  if (n === undefined || n === null) return '0';
  return Number(n).toLocaleString('en-IN');
};

// ─── KPI Card ───────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => (
  <motion.div
    whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.08)' }}
    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition-all group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trendValue || trend)}%
        </div>
      )}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-extrabold text-slate-800 mt-1.5">{value}</p>
    {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
  </motion.div>
);

// ─── Chart Card Wrapper ─────────────────────────────────────────────────────
const ChartCard = ({ title, children, className = '', actions }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
    {children}
  </div>
);

// ─── Data Table ─────────────────────────────────────────────────────────────
const DataTable = ({ columns, data, emptyMessage = 'No data available' }) => (
  <div className="overflow-x-auto">
    <div className="w-full overflow-x-auto">
<table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-100">
          {columns.map((col, i) => (
            <th key={i} className={`px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : ''}`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400 text-sm">{emptyMessage}</td></tr>
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

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? fmt(p.value) : num(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── CSV Export ──────────────────────────────────────────────────────────────
const exportCSV = (data, filename) => {
  if (!data || !data.kpis) return;
  const rows = [
    ['Metric', 'Value'],
    ['Today Revenue', data.kpis.today_revenue],
    ['Today Orders', data.kpis.today_orders],
    ['Total Revenue', data.kpis.total_revenue],
    ['Total Orders', data.kpis.total_orders],
    ['Avg Order Value', data.kpis.avg_order_value],
    ['Pending Orders', data.kpis.pending_orders],
    ['Completed Orders', data.kpis.completed_orders],
    ['Cancelled Orders', data.kpis.cancelled_orders],
    ['Returned Orders', data.kpis.returned_orders],
    ['Refund Amount', data.kpis.refund_amount],
    ['Online Revenue', data.kpis.total_online_revenue],
    ['COD Revenue', data.kpis.total_cod_revenue],
    ['Total Customers', data.kpis.total_customers],
    ['New Customers (30d)', data.kpis.new_customers],
    ['Inventory Value', data.kpis.inventory_value],
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (showLoader) => {
    if (showLoader) setRefreshing(true);
    try {
      const res = await axios.get(`${API}/reports/comprehensive?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Reports fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, days]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`${API}/reports/comprehensive?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!cancelled) { setData(res.data); setError(null); }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || 'Failed to load reports');
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
        <p className="text-slate-500 font-medium">Loading Enterprise Reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={() => fetchReports()} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const k = data.kpis;
  const revGrowth = k.yesterday_revenue > 0
    ? ((k.today_revenue - k.yesterday_revenue) / k.yesterday_revenue * 100).toFixed(1)
    : k.today_revenue > 0 ? 100 : 0;
  const ordGrowth = k.yesterday_orders > 0
    ? ((k.today_orders - k.yesterday_orders) / k.yesterday_orders * 100).toFixed(1)
    : k.today_orders > 0 ? 100 : 0;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Enterprise Reports Center
          </h2>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live Data • Last updated just now
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="appearance-none bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchReports(false)}
            disabled={refreshing}
            className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <button
            onClick={() => exportCSV(data, `report_${new Date().toISOString().split('T')[0]}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* ─── KPI CARDS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        <KPICard title="Today's Revenue" value={fmt(k.today_revenue)} icon={IndianRupee} color="bg-emerald-50 text-emerald-600 border-emerald-100" trend={Number(revGrowth)} trendValue={Math.abs(revGrowth)} subtitle="vs yesterday" />
        <KPICard title="Today's Orders" value={num(k.today_orders)} icon={ShoppingCart} color="bg-blue-50 text-blue-600 border-blue-100" trend={Number(ordGrowth)} trendValue={Math.abs(ordGrowth)} subtitle="vs yesterday" />
        <KPICard title="Total Revenue" value={fmt(k.total_revenue)} icon={TrendingUp} color="bg-indigo-50 text-indigo-600 border-indigo-100" subtitle={`${num(k.total_orders)} total orders`} />
        <KPICard title="Avg Order Value" value={fmt(k.avg_order_value)} icon={Activity} color="bg-purple-50 text-purple-600 border-purple-100" />
        <KPICard title="Pending Orders" value={num(k.pending_orders)} icon={Clock} color="bg-amber-50 text-amber-600 border-amber-100" />
        <KPICard title="Completed" value={num(k.completed_orders)} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
        <KPICard title="Cancelled" value={num(k.cancelled_orders)} icon={XCircle} color="bg-red-50 text-red-600 border-red-100" />
        <KPICard title="Returns" value={num(k.returned_orders)} icon={RotateCcw} color="bg-orange-50 text-orange-600 border-orange-100" subtitle={`Refunds: ${fmt(k.refund_amount)}`} />
        <KPICard title="Online Revenue" value={fmt(k.total_online_revenue)} icon={CreditCard} color="bg-blue-50 text-blue-600 border-blue-100" subtitle={`${num(k.online_order_count)} orders`} />
        <KPICard title="COD Revenue" value={fmt(k.total_cod_revenue)} icon={Banknote} color="bg-teal-50 text-teal-600 border-teal-100" subtitle={`${num(k.cod_order_count)} orders`} />
        <KPICard title="Customers" value={num(k.total_customers)} icon={Users} color="bg-violet-50 text-violet-600 border-violet-100" subtitle={`${num(k.new_customers)} new (30d)`} />
        <KPICard title="Inventory Value" value={fmt(k.inventory_value)} icon={Package} color="bg-cyan-50 text-cyan-600 border-cyan-100" subtitle={`${num(k.out_of_stock)} out of stock`} />
        <KPICard title="Active Coupons" value={num(k.active_coupons)} icon={Ticket} color="bg-pink-50 text-pink-600 border-pink-100" subtitle={`${num(k.coupon_usage)} times used`} />
        <KPICard title="Discount Given" value={fmt(k.total_discount_given)} icon={Ticket} color="bg-rose-50 text-rose-600 border-rose-100" />
        <KPICard title="Low Stock" value={num(k.low_stock)} icon={AlertTriangle} color="bg-amber-50 text-amber-600 border-amber-100" subtitle={`${num(k.total_products)} total products`} />
        <KPICard title="Repeat Customers" value={num(k.repeat_customers)} icon={Users} color="bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100" subtitle={`${k.total_customers > 0 ? ((k.repeat_customers / k.total_customers) * 100).toFixed(1) : 0}% retention`} />
      </div>

      {/* ─── TABS ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-100 px-2 pt-2 gap-1 no-scrollbar">
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab data={data} />}
              {activeTab === 'sales' && <SalesTab data={data} />}
              {activeTab === 'orders' && <OrdersTab data={data} />}
              {activeTab === 'customers' && <CustomersTab data={data} />}
              {activeTab === 'products' && <ProductsTab data={data} />}
              {activeTab === 'payments' && <PaymentsTab data={data} />}
              {activeTab === 'coupons' && <CouponsTab data={data} />}
              {activeTab === 'reviews' && <ReviewsTab data={data} />}
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
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend" className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales_trend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Order Status Pie */}
        <ChartCard title="Order Status">
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={data.order_status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%" cy="50%"
                  outerRadius={90}
                  innerRadius={55}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.order_status_distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => num(val)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method */}
        <ChartCard title="Payment Methods">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.payment_distribution} layout="vertical" barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
                <YAxis type="category" dataKey="method" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Category Revenue */}
        <ChartCard title="Revenue by Category">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_revenue} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

// ─── SALES ──────────────────────────────────────────────────────────────────
function SalesTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-100">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-extrabold text-indigo-700 mt-2">{fmt(data.kpis.total_revenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Today's Revenue</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{fmt(data.kpis.today_revenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-100">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Avg Order Value</p>
          <p className="text-3xl font-extrabold text-purple-700 mt-2">{fmt(data.kpis.avg_order_value)}</p>
        </div>
      </div>

      <ChartCard title="Daily Revenue & Orders">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.sales_trend}>
              <defs>
                <linearGradient id="salRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="salOrdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#salRevGrad)" dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={2.5} fill="url(#salOrdGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── ORDERS ─────────────────────────────────────────────────────────────────
function OrdersTab({ data }) {
  const statusData = data.order_status_distribution;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statusData.map((s) => (
          <div key={s.status} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.status}</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{num(s.count)}</p>
            <p className="text-xs text-slate-400 mt-1">{fmt(s.amount)}</p>
          </div>
        ))}
      </div>

      <ChartCard title="Order Status Distribution">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Order Timeline">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.sales_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── CUSTOMERS ──────────────────────────────────────────────────────────────
function CustomersTab({ data }) {
  const k = data.kpis;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
          <p className="text-xs font-bold text-violet-400 uppercase">Total Customers</p>
          <p className="text-3xl font-extrabold text-violet-700 mt-1">{num(k.total_customers)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-400 uppercase">New (30d)</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{num(k.new_customers)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-400 uppercase">Repeat Buyers</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-1">{num(k.repeat_customers)}</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
          <p className="text-xs font-bold text-pink-400 uppercase">Retention Rate</p>
          <p className="text-3xl font-extrabold text-pink-700 mt-1">{k.total_customers > 0 ? ((k.repeat_customers / k.total_customers) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      <ChartCard title="Top VIP Customers">
        <DataTable
          columns={[
            { label: '#', key: 'rank', render: (_, i) => <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-xs font-bold">{i + 1}</span> },
            { label: 'Customer', key: 'name', bold: true },
            { label: 'Email', key: 'email' },
            { label: 'Orders', key: 'orders', align: 'right', render: (r) => <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">{r.orders}</span> },
            { label: 'Total Spent', key: 'total_spent', align: 'right', bold: true, render: (r) => <span className="text-emerald-600 font-extrabold">{fmt(r.total_spent)}</span> },
          ]}
          data={data.top_customers}
          emptyMessage="No customers found"
        />
      </ChartCard>
    </div>
  );
}

// ─── PRODUCTS ───────────────────────────────────────────────────────────────
function ProductsTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="🏆 Best Sellers">
          <DataTable
            columns={[
              { label: '#', render: (_, i) => <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center text-xs font-bold">{i + 1}</span> },
              { label: 'Product', key: 'title', bold: true, render: (r) => r.title || 'Unknown' },
              { label: 'Sold', key: 'total_sold', align: 'right', render: (r) => <span className="font-bold text-slate-700">{num(r.total_sold)}</span> },
              { label: 'Revenue', key: 'revenue', align: 'right', render: (r) => <span className="text-emerald-600 font-extrabold">{fmt(r.revenue)}</span> },
            ]}
            data={data.best_sellers}
            emptyMessage="No sales data yet"
          />
        </ChartCard>

        <ChartCard title="📉 Least Selling">
          <DataTable
            columns={[
              { label: '#', render: (_, i) => <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 inline-flex items-center justify-center text-xs font-bold">{i + 1}</span> },
              { label: 'Product', key: 'title', bold: true, render: (r) => r.title || 'Unknown' },
              { label: 'Sold', key: 'total_sold', align: 'right', render: (r) => <span className="font-bold text-red-500">{num(r.total_sold)}</span> },
              { label: 'Revenue', key: 'revenue', align: 'right', render: (r) => <span className="text-slate-500 font-bold">{fmt(r.revenue)}</span> },
            ]}
            data={data.worst_sellers}
            emptyMessage="No sales data yet"
          />
        </ChartCard>
      </div>

      <ChartCard title="Revenue by Category">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.category_revenue} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                {data.category_revenue.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Inventory Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 text-center">
          <Package className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-emerald-400 uppercase">Total Products</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{num(data.kpis.total_products)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-amber-400 uppercase">Low Stock</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-1">{num(data.kpis.low_stock)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-100 text-center">
          <PackageX className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-red-400 uppercase">Out of Stock</p>
          <p className="text-3xl font-extrabold text-red-700 mt-1">{num(data.kpis.out_of_stock)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENTS ───────────────────────────────────────────────────────────────
function PaymentsTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Payment Method">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.payment_distribution}
                  dataKey="revenue"
                  nameKey="method"
                  cx="50%" cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {data.payment_distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => fmt(val)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Payment Status">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.payment_status} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                  {data.payment_status.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Payment Breakdown">
        <DataTable
          columns={[
            { label: 'Method', key: 'method', bold: true },
            { label: 'Transactions', key: 'count', align: 'right', render: (r) => <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">{num(r.count)}</span> },
            { label: 'Revenue', key: 'revenue', align: 'right', render: (r) => <span className="text-emerald-600 font-extrabold">{fmt(r.revenue)}</span> },
          ]}
          data={data.payment_distribution}
          emptyMessage="No payment data"
        />
      </ChartCard>
    </div>
  );
}

// ─── COUPONS ────────────────────────────────────────────────────────────────
function CouponsTab({ data }) {
  const k = data.kpis;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
          <p className="text-xs font-bold text-pink-400 uppercase">Total Coupons</p>
          <p className="text-3xl font-extrabold text-pink-700 mt-1">{num(k.total_coupons)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-400 uppercase">Active</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{num(k.active_coupons)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-400 uppercase">Total Usage</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-1">{num(k.coupon_usage)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-xs font-bold text-amber-400 uppercase">Discount Given</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-1">{fmt(k.total_discount_given)}</p>
        </div>
      </div>

      <ChartCard title="Top Coupons by Usage">
        <DataTable
          columns={[
            { label: '#', render: (_, i) => <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 inline-flex items-center justify-center text-xs font-bold">{i + 1}</span> },
            { label: 'Coupon Code', key: '_id', bold: true, render: (r) => <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs font-bold">{r._id || 'N/A'}</span> },
            { label: 'Usage', key: 'usage', align: 'right', render: (r) => <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">{num(r.usage)}</span> },
            { label: 'Revenue', key: 'revenue', align: 'right', render: (r) => <span className="text-emerald-600 font-extrabold">{fmt(r.revenue)}</span> },
            { label: 'Discount', key: 'discount', align: 'right', render: (r) => <span className="text-amber-600 font-bold">{fmt(r.discount)}</span> },
          ]}
          data={data.coupon_details}
          emptyMessage="No coupon usage data"
        />
      </ChartCard>
    </div>
  );
}

// ─── REVIEWS ────────────────────────────────────────────────────────────────
function ReviewsTab({ data }) {
  const r = data.reviews;
  const ratingDist = [
    { stars: '5 Stars', count: r.star5, color: '#10b981' },
    { stars: '4 Stars', count: r.star4, color: '#6366f1' },
    { stars: '3 Stars', count: r.star3, color: '#f59e0b' },
    { stars: '2 Stars', count: r.star2, color: '#f97316' },
    { stars: '1 Star', count: r.star1, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 text-center">
          <Star className="w-10 h-10 text-amber-500 mx-auto mb-2 fill-amber-400" />
          <p className="text-xs font-bold text-amber-400 uppercase">Average Rating</p>
          <p className="text-4xl font-extrabold text-amber-700 mt-1">{r.avg_rating ? r.avg_rating.toFixed(1) : '0.0'}</p>
          <p className="text-xs text-amber-500 mt-1">out of 5.0</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-center">
          <FileText className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-blue-400 uppercase">Total Reviews</p>
          <p className="text-4xl font-extrabold text-blue-700 mt-1">{num(r.total)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-emerald-400 uppercase">5-Star Reviews</p>
          <p className="text-4xl font-extrabold text-emerald-700 mt-1">{num(r.star5)}</p>
          <p className="text-xs text-emerald-500 mt-1">{r.total > 0 ? ((r.star5 / r.total) * 100).toFixed(1) : 0}% of total</p>
        </div>
      </div>

      <ChartCard title="Rating Distribution">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDist} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="stars" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} tickLine={false} axisLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Reviews" radius={[0, 6, 6, 0]}>
                {ratingDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
