import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, LayoutDashboard, Zap, Map, ShieldAlert, 
  Activity, Search, RotateCcw, Truck, Settings2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Sub-components (to be implemented)
import { CODDashboard } from './cod/CODDashboard';
import { CODAutomation } from './cod/CODAutomation';
import { CODGeoRules } from './cod/CODGeoRules';
import { CODBusinessRules } from './cod/CODBusinessRules';
import { CODFraudAndApprovals } from './cod/CODFraudAndApprovals';
import { CODLiveOps } from './cod/CODLiveOps';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export default function CODPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [token]);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API}/cod/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(res.data);
    } catch (err) {
      console.error("Failed to fetch COD config", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (newConfig) => {
    setSaving(true);
    try {
      await axios.put(`${API}/cod/config`, newConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(newConfig);
      return true;
    } catch (err) {
      console.error("Failed to save config", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateConfigField = (section, field, value) => {
    if (!config) return;
    const newConfig = { ...config };
    
    // If it's a top-level field
    if (section === 'top') {
      newConfig[field] = value;
    } else {
      // Nested field
      newConfig[section] = {
        ...newConfig[section],
        [field]: value
      };
    }
    setConfig(newConfig);
  };

  const navItems = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'automation', label: 'Smart Automation', icon: Zap },
    { id: 'geo', label: 'Geo & Zones', icon: Map },
    { id: 'business', label: 'Business Rules', icon: Settings2 },
    { id: 'fraud', label: 'Fraud & Approvals', icon: ShieldAlert },
    { id: 'live', label: 'Live Operations', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 animate-pulse">
            <Banknote className="text-white" size={28} />
          </div>
          <p className="text-slate-500 font-bold text-sm">Loading COD Enterprise Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 overflow-hidden h-full flex flex-col">
      {/* Horizontal Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-1.5 overflow-x-auto scrollbar-hide shrink-0">
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
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' 
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

      {/* Main Content Area */}
      <div className="overflow-hidden flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="overflow-y-auto h-full scrollbar-hide pb-20"
          >
            {activeTab === 'dashboard' && (
              <CODDashboard 
                config={config} 
                token={token} 
                onUpdate={(field, val) => updateConfigField('top', field, val)}
                onSave={() => handleSaveConfig(config)}
                saving={saving}
              />
            )}
            {activeTab === 'automation' && (
              <CODAutomation 
                config={config}
                updateConfig={updateConfigField}
                onSave={() => handleSaveConfig(config)}
                saving={saving}
              />
            )}
            {activeTab === 'geo' && (
              <CODGeoRules 
                config={config}
                updateConfig={updateConfigField}
                onSave={() => handleSaveConfig(config)}
                saving={saving}
              />
            )}
            {activeTab === 'business' && (
              <CODBusinessRules 
                config={config}
                updateConfig={updateConfigField}
                onSave={() => handleSaveConfig(config)}
                saving={saving}
              />
            )}
            {activeTab === 'fraud' && (
              <CODFraudAndApprovals 
                config={config}
                updateConfig={updateConfigField}
                onSave={() => handleSaveConfig(config)}
                saving={saving}
                token={token}
              />
            )}
            {activeTab === 'live' && (
              <CODLiveOps 
                config={config}
                token={token}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
