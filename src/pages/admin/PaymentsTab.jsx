import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, Undo2, Settings2, Loader2 } from 'lucide-react';
import { PaymentsOverview } from './payments/PaymentsOverview';
import { PaymentsTransactions } from './payments/PaymentsTransactions';
import { PaymentsRefunds } from './payments/PaymentsRefunds';
import { PaymentsSettings } from './payments/PaymentsSettings';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const PaymentsTab = ({ token }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders to compute payment analytics and populate transactions
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // In a real production environment, you'd want pagination or date filtering.
      // We'll fetch the recent 100-500 for the dashboard computation.
      const res = await axios.get(`${API}/orders/`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to fetch orders for payments dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'refunds', label: 'Refunds', icon: Undo2 },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading Enterprise Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap ${
                isActive ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="payments-active-tab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <PaymentsOverview orders={orders} />}
          {activeTab === 'transactions' && <PaymentsTransactions orders={orders} token={token} />}
          {activeTab === 'refunds' && <PaymentsRefunds orders={orders} />}
          {activeTab === 'settings' && <PaymentsSettings />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};
