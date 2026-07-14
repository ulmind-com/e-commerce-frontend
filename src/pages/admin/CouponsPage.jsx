import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Ticket, 
  Zap, 
  GitBranch, 
  BarChart3,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Import sub-components
import { CouponsDashboard } from './coupons/CouponsDashboard';
import { CouponsList } from './coupons/CouponsList';
import { PromotionsTab } from './coupons/PromotionsTab';
import { RulesTab } from './coupons/RulesTab';
import { AnalyticsTab } from './coupons/AnalyticsTab';

export default function CouponsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'promotions', label: 'Auto-Promotions', icon: Zap },
    { id: 'rules', label: 'Rule Builder', icon: GitBranch },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden p-4 md:p-6 lg:p-8">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Ticket size={22} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Promotions <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Engine</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium">Enterprise coupon and discount management system.</p>
          </div>

          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <Search size={18} /> Global Search
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2">
              <Plus size={18} /> Create Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Horizontal Navigation */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex p-1.5 bg-white border border-slate-200/60 shadow-sm rounded-2xl w-max min-w-full md:min-w-0 gap-1 relative z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap overflow-hidden ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="coupon-tab-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon size={18} className={isActive ? 'text-orange-100' : 'text-slate-400'} />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'dashboard' && <CouponsDashboard token={token} />}
              {activeTab === 'coupons' && <CouponsList token={token} />}
              {activeTab === 'promotions' && <PromotionsTab token={token} />}
              {activeTab === 'rules' && <RulesTab token={token} />}
              {activeTab === 'analytics' && <AnalyticsTab token={token} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
