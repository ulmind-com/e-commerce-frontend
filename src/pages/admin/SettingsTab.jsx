import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MapPin, 
  Map, 
  IndianRupee, 
  Users, 
  ShieldAlert
} from 'lucide-react';

// Import sub-components
import { DashboardTab } from './delivery/DashboardTab';
import { WarehouseTab } from './delivery/WarehouseTab';
import { ZonesPincodesTab } from './delivery/ZonesPincodesTab';
import { PricingTimeSlotsTab } from './delivery/PricingTimeSlotsTab';
import { FleetTrackingTab } from './delivery/FleetTrackingTab';
import { AdvancedSettingsTab } from './delivery/AdvancedSettingsTab';

export const SettingsTab = ({ token }) => {
  const [activeTab, setActiveTab] = useState('warehouse');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'warehouse', label: 'Warehouse & Map', icon: MapPin },
    { id: 'zones', label: 'Zones', icon: Map },
    { id: 'pricing', label: 'Pricing', icon: IndianRupee },
    { id: 'fleet', label: 'Fleet', icon: Users },
    { id: 'advanced', label: 'Settings', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-5 overflow-hidden">
      {/* Horizontal Tab Navigation — scrollable, no overflow */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-1.5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap text-sm font-bold shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area — full width, overflow handled */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {activeTab === 'dashboard' && <DashboardTab token={token} />}
            {activeTab === 'warehouse' && <WarehouseTab token={token} />}
            {activeTab === 'zones' && <ZonesPincodesTab token={token} />}
            {activeTab === 'pricing' && <PricingTimeSlotsTab token={token} />}
            {activeTab === 'fleet' && <FleetTrackingTab token={token} />}
            {activeTab === 'advanced' && <AdvancedSettingsTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
