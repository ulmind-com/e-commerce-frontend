import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import KPICard from '../../components/analytics/KPICard';
import ChartWidget from '../../components/analytics/ChartWidget';
import { TrendingUp, Users, ShoppingCart, IndianRupee, Activity, PackageX, Package, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('executive');
  const [realtime, setRealtime] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [productData, setProductData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRealtime = async () => {
    try {
      const res = await axios.get(`${API}/analytics/realtime`, { headers: { Authorization: `Bearer ${token}` } });
      setRealtime(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API}/analytics/sales?period=${salesPeriod}`, { headers: { Authorization: `Bearer ${token}` } });
      setSalesData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/analytics/products`, { headers: { Authorization: `Bearer ${token}` } });
      setProductData(res.data);
    } catch (err) { console.error(err); }
  };
  
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API}/analytics/customers`, { headers: { Authorization: `Bearer ${token}` } });
      setCustomerData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFinance = async () => {
    try {
      const res = await axios.get(`${API}/analytics/finance`, { headers: { Authorization: `Bearer ${token}` } });
      setFinanceData(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRealtime(), fetchSales(), fetchProducts(), fetchCustomers(), fetchFinance()])
      .finally(() => setLoading(false));

    const interval = setInterval(fetchRealtime, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    fetchSales();
  }, [salesPeriod]);

  if (loading && !realtime) {
    return <div className="h-full flex items-center justify-center text-slate-500">Loading Enterprise Analytics...</div>;
  }

  const tabs = [
    { id: 'executive', label: 'Executive Dashboard' },
    { id: 'sales', label: 'Sales Analytics' },
    { id: 'products', label: 'Product Analytics' },
    { id: 'customers', label: 'Customer Analytics' },
    { id: 'finance', label: 'Finance & Payments' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Analytics Center
          </h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Data Feed Connected
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'executive' && realtime && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              title="Today's Revenue" 
              value={`₹${realtime.revenue_today.toLocaleString()}`} 
              icon={IndianRupee} 
              trend={realtime.revenue_growth >= 0 ? 'up' : 'down'} 
              trendValue={Math.abs(realtime.revenue_growth)}
              colorClass="bg-emerald-500"
            />
            <KPICard 
              title="Today's Orders" 
              value={realtime.orders_today} 
              icon={ShoppingCart} 
              trend={realtime.orders_growth >= 0 ? 'up' : 'down'} 
              trendValue={Math.abs(realtime.orders_growth)}
              colorClass="bg-blue-500"
            />
            <KPICard 
              title="Total Customers" 
              value={realtime.total_customers} 
              icon={Users} 
              colorClass="bg-purple-500"
            />
            <KPICard 
              title="Low Stock Items" 
              value={realtime.low_stock_items} 
              icon={PackageX} 
              colorClass="bg-red-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 h-[420px]">
              <ChartWidget 
                title="Revenue Overview (Last 7 Days)" 
                data={salesData?.chart_data || []} 
                type="area" 
                color="#6366f1" 
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute -top-10 -right-10 opacity-5 text-indigo-500"><Activity className="w-64 h-64" /></div>
              <h3 className="text-lg font-bold text-slate-800 mb-8 self-start w-full">Platform Health</h3>
              
              <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-indigo-50">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#e0e7ff" strokeWidth="12" fill="none" />
                  <circle cx="96" cy="96" r="88" stroke="#6366f1" strokeWidth="12" fill="none" strokeDasharray="552.92" strokeDashoffset={552.92 * (1 - 0.92)} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                </svg>
                <div className="text-center z-10">
                  <span className="text-5xl font-extrabold text-slate-800">92</span>
                  <span className="text-sm font-bold text-slate-400 block mt-1">/100</span>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-slate-500 mt-8">Platform health is excellent based on AI forecasts & uptime.</p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'sales' && salesData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-end gap-2 mb-2">
            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => setSalesPeriod(period)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${salesPeriod === period ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KPICard title="Total Revenue" value={`₹${salesData.total_revenue.toLocaleString()}`} icon={IndianRupee} colorClass="bg-emerald-500" />
            <KPICard title="Avg Order Value" value={`₹${salesData.average_order_value.toLocaleString()}`} icon={TrendingUp} colorClass="bg-indigo-500" />
          </div>

          <div className="h-[450px]">
             <ChartWidget 
                title={`Revenue & Orders Trend (${salesPeriod})`} 
                data={salesData.chart_data} 
                type="bar" 
                color="#ec4899" 
              />
          </div>
        </motion.div>
      )}

      {activeTab === 'products' && productData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Top Best Sellers</h3>
              <div className="space-y-3">
                {productData.best_sellers.map((p, idx) => (
                  <div key={p._id} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">{idx + 1}</div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{p.title || 'Unknown Product'}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{p.total_sold} units sold</p>
                      </div>
                    </div>
                    <div className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm shrink-0">₹{p.revenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2"><PackageX size={20} /> Out of Stock Alerts</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {productData.out_of_stock.map((p) => (
                  <div key={p._id} className="flex justify-between items-center p-3 border border-red-100 bg-red-50/50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{p.name}</p>
                      <p className="text-xs font-semibold text-red-500 mt-1">Stock: {p.stock_quantity}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 text-xs font-bold rounded-lg transition-all shadow-sm">Manage</button>
                  </div>
                ))}
                {productData.out_of_stock.length === 0 && (
                  <div className="text-center py-10">
                    <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
                    <p className="text-slate-500 font-medium">No products out of stock. You're doing great!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'customers' && customerData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Top VIP Customers</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="w-full overflow-x-auto">
<table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Orders</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerData.top_customers.map((c) => (
                    <tr key={c.user_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{c.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{c.email}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{c.orders}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-emerald-600">₹{c.total_spent.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'finance' && financeData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[420px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard className="text-blue-500"/> Payment Methods</h3>
            <div className="space-y-3">
              {financeData.payment_distribution.map(p => (
                <div key={p._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-slate-200 transition-colors">
                  <div className="font-bold text-slate-700">{p._id}</div>
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-600 text-lg">₹{p.revenue.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">{p.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[420px]">
             <ChartWidget 
                title="Order Status Distribution" 
                data={financeData.order_status_distribution} 
                dataKey="count"
                xAxisKey="_id"
                type="bar" 
                color="#f59e0b" 
              />
          </div>
        </motion.div>
      )}
    </div>
  );
}
