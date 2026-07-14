import React, { useState } from 'react';
import { Map, MapPin, Search, Plus } from 'lucide-react';

export const CODGeoRules = ({ config, updateConfig }) => {
  const [activeTab, setActiveTab] = useState('zones');
  
  const handlePincodeRemove = (type, code) => {
    const updated = config.pincodes[type].filter(p => p !== code);
    updateConfig('pincodes', type, updated);
  };

  const handleZoneToggle = (zoneId) => {
    const updatedZones = config.zones.map(z => 
      z.id === zoneId ? { ...z, active: !z.active } : z
    );
    updateConfig('top', 'zones', updatedZones);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('zones')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'zones' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Map size={18} /> Zone Management
          </button>
          <button 
            onClick={() => setActiveTab('pincodes')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pincodes' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <MapPin size={18} /> Pincode Management
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'zones' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Serviceable Zones</h3>
                  <p className="text-slate-500 text-sm font-medium">Configure COD availability and charges per zone.</p>
                </div>
                <button className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-100 flex items-center gap-2">
                  <Plus size={16} /> Add Zone
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.zones.map((zone) => (
                  <div key={zone.id} className="border border-slate-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition-all bg-white relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">{zone.name}</h4>
                        <p className="text-sm text-slate-500">Radius: {zone.radius} km | ETA: {zone.eta}</p>
                      </div>
                      <button
                        onClick={() => handleZoneToggle(zone.id)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${zone.active ? 'bg-teal-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${zone.active ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase">COD Charge</p>
                        <p className="font-black text-slate-700">₹{zone.charge}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase">Max Limit</p>
                        <p className="font-black text-slate-700">₹{zone.max_order}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pincodes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Allowed */}
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5">
                <h4 className="font-black text-emerald-800 mb-2 flex items-center gap-2">
                  Allowed Pincodes
                </h4>
                <p className="text-xs text-emerald-600 mb-4">Normal COD operations.</p>
                <div className="flex flex-wrap gap-2">
                  {config.pincodes.allowed.map(pin => (
                    <span key={pin} className="bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                      {pin}
                      <button onClick={() => handlePincodeRemove('allowed', pin)} className="hover:text-red-500 ml-1">×</button>
                    </span>
                  ))}
                  <button className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">+</button>
                </div>
              </div>

              {/* Blocked */}
              <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-5">
                <h4 className="font-black text-rose-800 mb-2 flex items-center gap-2">
                  Blocked Pincodes
                </h4>
                <p className="text-xs text-rose-600 mb-4">COD strictly disabled.</p>
                <div className="flex flex-wrap gap-2">
                  {config.pincodes.blocked.map(pin => (
                    <span key={pin} className="bg-white border border-rose-200 text-rose-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                      {pin}
                      <button onClick={() => handlePincodeRemove('blocked', pin)} className="hover:text-red-500 ml-1">×</button>
                    </span>
                  ))}
                  <button className="bg-rose-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">+</button>
                </div>
              </div>

              {/* Premium */}
              <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-5">
                <h4 className="font-black text-purple-800 mb-2 flex items-center gap-2">
                  Premium Pincodes
                </h4>
                <p className="text-xs text-purple-600 mb-4">Express delivery + high value.</p>
                <div className="flex flex-wrap gap-2">
                  {config.pincodes.premium.map(pin => (
                    <span key={pin} className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                      {pin}
                      <button onClick={() => handlePincodeRemove('premium', pin)} className="hover:text-red-500 ml-1">×</button>
                    </span>
                  ))}
                  <button className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
