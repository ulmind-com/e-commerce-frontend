import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Shield, Plus, MoreVertical, Search, Zap, CheckCircle2, XCircle, Trash2, Edit2, X, Save } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const ZonesPincodesTab = () => {
  const [activeTab, setActiveTab] = useState('zones');
  
  const [zones, setZones] = useState([
    { id: 1, name: 'North Core', color: 'bg-blue-500', radius: '5km', minOrder: '₹99', charge: '₹0', status: 'Active', time: '10 Min' },
    { id: 2, name: 'South Expansion', color: 'bg-emerald-500', radius: '12km', minOrder: '₹299', charge: '₹29', status: 'Active', time: '30 Min' },
    { id: 3, name: 'East Suburbs', color: 'bg-amber-500', radius: '20km', minOrder: '₹499', charge: '₹49', status: 'Inactive', time: '60 Min' },
  ]);

  const [pincodes, setPincodes] = useState([
    { id: 1, pin: '110001', type: 'Express', status: 'Allowed', zones: 'North Core' },
    { id: 2, pin: '110002', type: 'Standard', status: 'Allowed', zones: 'North Core' },
    { id: 3, pin: '110003', type: 'Blocked', status: 'Blocked', zones: 'None' },
    { id: 4, pin: '110004', type: 'Express', status: 'Allowed', zones: 'South Expansion' },
  ]);

  // Modal States
  const [isZoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);

  // Handlers for Zones
  const openZoneModal = (zone = null) => {
    if (zone) {
      setEditingZone({ ...zone });
    } else {
      setEditingZone({ id: Date.now(), name: '', color: 'bg-purple-500', radius: '', minOrder: '', charge: '', status: 'Active', time: '' });
    }
    setZoneModalOpen(true);
  };

  const handleSaveZone = () => {
    if (!editingZone.name) return alert('Zone name is required');
    
    if (zones.find(z => z.id === editingZone.id)) {
      setZones(zones.map(z => z.id === editingZone.id ? editingZone : z));
    } else {
      setZones([...zones, editingZone]);
    }
    setZoneModalOpen(false);
  };

  const handleDeleteZone = (id) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      setZones(zones.filter(z => z.id !== id));
    }
  };

  // Handlers for Pincodes
  const openPinModal = (pin = null) => {
    if (pin) {
      setEditingPin({ ...pin });
    } else {
      setEditingPin({ id: Date.now(), pin: '', type: 'Standard', status: 'Allowed', zones: 'North Core' });
    }
    setPinModalOpen(true);
  };

  const handleSavePin = () => {
    if (!editingPin.pin) return alert('Pincode is required');
    
    if (pincodes.find(p => p.id === editingPin.id)) {
      setPincodes(pincodes.map(p => p.id === editingPin.id ? editingPin : p));
    } else {
      setPincodes([...pincodes, editingPin]);
    }
    setPinModalOpen(false);
  };

  const handleDeletePin = (id) => {
    if (confirm('Are you sure you want to delete this pincode?')) {
      setPincodes(pincodes.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Zone Modal */}
      <Modal 
        isOpen={isZoneModalOpen} 
        onClose={() => setZoneModalOpen(false)} 
        title={zones.find(z => z.id === editingZone?.id) ? 'Edit Zone' : 'Create Zone'}
      >
        {editingZone && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Zone Name</label>
              <input type="text" value={editingZone.name} onChange={e => setEditingZone({...editingZone, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Radius</label>
                <input type="text" value={editingZone.radius} onChange={e => setEditingZone({...editingZone, radius: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Est. Time</label>
                <input type="text" value={editingZone.time} onChange={e => setEditingZone({...editingZone, time: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Min Order</label>
                <input type="text" value={editingZone.minOrder} onChange={e => setEditingZone({...editingZone, minOrder: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Del. Charge</label>
                <input type="text" value={editingZone.charge} onChange={e => setEditingZone({...editingZone, charge: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
              <select value={editingZone.status} onChange={e => setEditingZone({...editingZone, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button onClick={handleSaveZone} className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20 hover:bg-primary-600 transition-colors">
              <Save size={18} /> Save Zone
            </button>
          </div>
        )}
      </Modal>

      {/* Pincode Modal */}
      <Modal 
        isOpen={isPinModalOpen} 
        onClose={() => setPinModalOpen(false)} 
        title={pincodes.find(p => p.id === editingPin?.id) ? 'Edit Pincode' : 'Add Pincode'}
      >
        {editingPin && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Pincode</label>
              <input type="text" value={editingPin.pin} onChange={e => setEditingPin({...editingPin, pin: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Assigned Zone</label>
              <select value={editingPin.zones} onChange={e => setEditingPin({...editingPin, zones: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold">
                <option value="None">None</option>
                {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Service Type</label>
                <select value={editingPin.type} onChange={e => setEditingPin({...editingPin, type: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold">
                  <option value="Express">Express</option>
                  <option value="Standard">Standard</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                <select value={editingPin.status} onChange={e => setEditingPin({...editingPin, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold">
                  <option value="Allowed">Allowed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
            <button onClick={handleSavePin} className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20 hover:bg-primary-600 transition-colors">
              <Save size={18} /> Save Pincode
            </button>
          </div>
        )}
      </Modal>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Zones & Pincodes</h2>
          <p className="text-slate-500 font-medium mt-1">Manage delivery areas, serviceability, and regional restrictions.</p>
        </div>
        <button 
          onClick={() => activeTab === 'zones' ? openZoneModal() : openPinModal()}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={18} />
          {activeTab === 'zones' ? 'Create Zone' : 'Add Pincodes'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-2 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('zones')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'zones' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Map size={18} /> Delivery Zones
          </button>
          <button 
            onClick={() => setActiveTab('pincodes')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pincodes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Shield size={18} /> Pincode Management
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'zones' && (
              <motion.div
                key="zones"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {zones.map(zone => (
                    <div key={zone.id} className="border border-slate-200 rounded-2xl p-5 hover:border-primary/30 transition-all hover:shadow-md group bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-4 h-4 rounded-full shadow-sm ${zone.color}`}></span>
                          <div>
                            <h3 className="font-extrabold text-slate-800">{zone.name}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${zone.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {zone.status}
                            </span>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-lg hover:bg-slate-50">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Radius</p>
                          <p className="font-bold text-slate-700">{zone.radius}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                          <p className="font-bold text-slate-700">{zone.time}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Order</p>
                          <p className="font-bold text-slate-700">{zone.minOrder}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Del. Charge</p>
                          <p className="font-bold text-slate-700">{zone.charge}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => openZoneModal(zone)}
                          className="flex-1 py-2 bg-slate-50 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteZone(zone.id)}
                          className="py-2 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'pincodes' && (
              <motion.div
                key="pincodes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search pincode..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
                      Bulk Import
                    </button>
                    <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="w-full overflow-x-auto">
<table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pincode</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Service Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Zone</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pincodes.map((pin) => (
                        <tr key={pin.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 font-mono font-bold text-slate-800">{pin.pin}</td>
                          <td className="px-6 py-4">
                            {pin.type === 'Express' && <span className="inline-flex items-center gap-1 text-xs font-bold bg-fuchsia-50 text-fuchsia-600 px-2 py-1 rounded-md border border-fuchsia-100"><Zap size={12} /> Express</span>}
                            {pin.type === 'Standard' && <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">Standard</span>}
                            {pin.type === 'Blocked' && <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">Blocked</span>}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">{pin.zones}</td>
                          <td className="px-6 py-4">
                            {pin.status === 'Allowed' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={14} /> Allowed</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600"><XCircle size={14} /> Blocked</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openPinModal(pin)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeletePin(pin.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
