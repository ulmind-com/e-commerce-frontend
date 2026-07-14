import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquareQuote, 
  Settings, 
  Star,
  ShieldAlert,
  Search,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Import sub-components
import { ReviewsDashboard } from './reviews/ReviewsDashboard';
import { ReviewsManager } from './reviews/ReviewsManager';
import { ReviewSettings } from './reviews/ReviewSettings';

export default function ReviewsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'moderation', label: 'Moderation Hub', icon: ShieldAlert },
    { id: 'all-reviews', label: 'All Reviews', icon: MessageSquareQuote },
    { id: 'qna', label: 'Product Q&A', icon: MessageSquare },
    { id: 'settings', label: 'Review Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans overflow-hidden flex flex-col md:flex-row rounded-tl-2xl border-t border-l border-gray-200 shadow-sm">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500" /> Reputation
          </h2>
          <p className="text-xs font-medium text-gray-500 mt-1">Enterprise Reviews System</p>
        </div>

        <div className="px-4 pb-6 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group overflow-hidden ${
                  isActive 
                    ? 'text-amber-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="reviews-sidebar-active"
                    className="absolute inset-0 bg-amber-50 border border-amber-100 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={18} className={`relative z-10 ${isActive ? 'text-amber-600' : 'group-hover:text-gray-700 transition-colors'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-gray-50/50 h-[calc(100vh-4rem)] min-w-0">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

        <div className="p-4 md:p-8 relative z-10 min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <ReviewsDashboard token={token} />}
              {activeTab === 'moderation' && <ReviewsManager token={token} filterDefault="Pending" />}
              {activeTab === 'all-reviews' && <ReviewsManager token={token} filterDefault="All" />}
              {activeTab === 'qna' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 bg-white border border-gray-200 rounded-3xl">
                    <MessageSquare size={32} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-black">Q&A Engine (Coming Soon)</h3>
                  </div>
                </div>
              )}
              {activeTab === 'settings' && <ReviewSettings token={token} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
