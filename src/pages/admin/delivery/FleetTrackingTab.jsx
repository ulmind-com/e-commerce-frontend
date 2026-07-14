import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crosshair, Star, Phone, Activity, Search, Map, 
  Zap, Truck, MapPin, Clock, TrendingUp, ChevronRight,
  UserPlus, Settings, CircleDot, Navigation
} from 'lucide-react';

export const FleetTrackingTab = () => {
  const [activeTab, setActiveTab] = useState('partners');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [partners] = useState([
    { id: 'DP-001', name: 'Ramesh Patel', vehicle: 'Scooter (GJ-01-XX)', phone: '+91 9876543210', status: 'On Delivery', rating: 4.8, completed: 12, currentRoute: 'Zone: North Core', eta: '10 mins', avatar: 'R' },
    { id: 'DP-002', name: 'Suresh Kumar', vehicle: 'Bike (GJ-01-YY)', phone: '+91 8765432109', status: 'Idle', rating: 4.5, completed: 8, currentRoute: '-', eta: '-', avatar: 'S' },
    { id: 'DP-003', name: 'Amit Singh', vehicle: 'Scooter (GJ-01-ZZ)', phone: '+91 7654321098', status: 'Offline', rating: 4.9, completed: 0, currentRoute: '-', eta: '-', avatar: 'A' },
    { id: 'DP-004', name: 'Vikram Das', vehicle: 'Bike (WB-01-AB)', phone: '+91 6543210987', status: 'On Delivery', rating: 4.7, completed: 15, currentRoute: 'Zone: South Hub', eta: '7 mins', avatar: 'V' },
  ]);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status) => {
    switch(status) {
      case 'On Delivery': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' };
      case 'Idle': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' };
    }
  };

  const stats = [
    { label: 'Total Partners', value: partners.length, icon: Users, gradient: 'from-indigo-500 to-purple-600' },
    { label: 'Active Now', value: partners.filter(p => p.status === 'On Delivery').length, icon: Truck, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Idle', value: partners.filter(p => p.status === 'Idle').length, icon: Clock, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Avg Rating', value: (partners.reduce((a, b) => a + b.rating, 0) / partners.length).toFixed(1), icon: Star, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Navigation size={20} />
            </div>
            Fleet & Live Tracking
          </h2>
          <p className="text-slate-500 font-medium mt-1 ml-[52px] text-sm">Manage delivery personnel and monitor active routes.</p>
        </div>
        <div className="flex gap-2 ml-[52px] sm:ml-0">
          <button className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 text-xs">
            <Settings size={14} className="text-slate-400" /> Auto-Assign
          </button>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 text-xs">
            <UserPlus size={14} /> Add Partner
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                <stat.icon size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</p>
                <p className="font-extrabold text-slate-800 text-lg">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        
        {/* Sub-tabs */}
        <div className="flex border-b border-slate-100 px-5 bg-gradient-to-r from-slate-50/50 to-white">
          {[
            { id: 'partners', label: 'Delivery Partners', icon: Users },
            { id: 'tracking', label: 'Live Dashboard', icon: Crosshair },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === 'partners' && (
              <motion.div
                key="partners"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type="text" 
                    placeholder="Search partner name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                  />
                </div>

                {/* Partner Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPartners.map((partner, idx) => {
                    const sc = statusColor(partner.status);
                    return (
                      <motion.div 
                        key={partner.id} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-slate-300/80 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-full -mr-10 -mt-10 pointer-events-none group-hover:from-indigo-50 transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-lg relative`}>
                              {partner.avatar}
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${sc.dot} rounded-full border-2 border-white`}></div>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-800">{partner.name}</h3>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{partner.id}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {partner.status}
                          </span>
                        </div>

                        <div className="space-y-2.5 relative z-10">
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span className="flex items-center gap-2"><Phone size={13} className="text-slate-400" /> {partner.phone}</span>
                            <span className="flex items-center gap-1 font-bold text-amber-500"><Star size={13} fill="currentColor" /> {partner.rating}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span className="flex items-center gap-2"><Activity size={13} className="text-slate-400" /> {partner.vehicle}</span>
                            <span className="font-bold text-slate-800">{partner.completed} deliveries</span>
                          </div>
                          {partner.status === 'On Delivery' && (
                            <div className="bg-blue-50/70 rounded-xl p-2.5 border border-blue-100 mt-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-blue-600 font-medium flex items-center gap-1.5"><MapPin size={12} /> {partner.currentRoute}</span>
                                <span className="text-blue-700 font-bold flex items-center gap-1"><Clock size={12} /> ETA: {partner.eta}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex gap-2 relative z-10">
                          <button className="flex-1 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors border border-slate-200/60">
                            View Profile
                          </button>
                          {partner.status !== 'Offline' && (
                            <button className="flex-1 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors border border-indigo-200/60">
                              Assign Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Live Map Area */}
                <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative" style={{ height: '450px' }}>
                  <div className="absolute inset-0 bg-[#e8e6e0] flex items-center justify-center">
                    {/* Simulated map background */}
                    <div className="absolute inset-0 opacity-30" style={{ 
                      backgroundImage: 'radial-gradient(circle at 25% 25%, #d1d5db 1px, transparent 1px), radial-gradient(circle at 75% 75%, #d1d5db 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }}></div>
                    
                    <div className="text-center relative z-10">
                      <Map size={56} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold text-sm tracking-wider">LIVE MAP VIEW</p>
                      <p className="text-slate-400 text-xs mt-1">Real-time partner tracking</p>
                    </div>
                    
                    {/* Animated pins */}
                    <div className="absolute top-[30%] left-[25%] z-20">
                      <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50 animate-pulse"></div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">Ramesh P.</div>
                    </div>
                    <div className="absolute top-[55%] left-[60%] z-20">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-lg shadow-emerald-500/50"></div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">Vikram D.</div>
                    </div>
                    
                    {/* Floating Legend */}
                    <div className="absolute bottom-4 left-4 z-30 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold border border-slate-200/50 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm animate-pulse"></div>
                        <span className="text-slate-600">On Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></div>
                        <span className="text-slate-600">Idle</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Routes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partners.filter(p => p.status === 'On Delivery').map((partner, idx) => (
                    <motion.div 
                      key={partner.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                          {partner.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold text-slate-800">{partner.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">Order #8a9f2... → {partner.currentRoute}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-blue-600">ETA</p>
                          <p className="text-sm font-black text-slate-800">{partner.eta}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100">
                          Track Live
                        </button>
                        <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200">
                          Contact
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
