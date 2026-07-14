import React, { useContext, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Building, X, Loader2 } from 'lucide-react';
import { LocationContext } from '../../context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';

const AddressModal = ({ isOpen, onClose, address, onSave }) => {
  const [formData, setFormData] = useState(address || {
    label: 'Home',
    flat: '',
    address: '',
    landmark: '',
    pincode: '',
    lat: 12.9716, // dummy coords for now
    lng: 77.5946
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      alert("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (label) => {
    if (label === 'Home') return <Home size={16} />;
    if (label === 'Work') return <Briefcase size={16} />;
    return <MapPin size={16} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-100"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-slate-800">{address ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Save address as</label>
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData(p => ({ ...p, label: type }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                        formData.label === type 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {getIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Complete Address *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter your complete address..."
                    value={formData.address}
                    onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-medium resize-none placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Flat / House No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 100A"
                      value={formData.flat}
                      onChange={e => setFormData(p => ({ ...p, flat: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Pincode *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 700001"
                      value={formData.pincode}
                      onChange={e => setFormData(p => ({ ...p, pincode: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near City Hospital"
                    value={formData.landmark}
                    onChange={e => setFormData(p => ({ ...p, landmark: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProfileAddresses = () => {
  const { savedAddresses, addSavedAddress, editSavedAddress, deleteSavedAddress } = useContext(LocationContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this address?")) {
      setDeletingId(id);
      try {
        await deleteSavedAddress(id);
      } catch (err) {
        alert("Failed to delete address");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSave = async (formData) => {
    if (editingAddress?.id) {
      await editSavedAddress(editingAddress.id, formData);
    } else {
      await addSavedAddress(formData);
    }
  };

  const getIcon = (label) => {
    if (label === 'Home') return <Home size={24} />;
    if (label === 'Work') return <Briefcase size={24} />;
    if (label === 'Other') return <Building size={24} />;
    return <MapPin size={24} />;
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Saved Addresses</h1>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={18} /> Add New
        </button>
      </div>
      
      <div className="p-8 flex-1 bg-slate-50/50">
        {savedAddresses && savedAddresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {savedAddresses.map((addr, index) => (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md p-6 relative group transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      {getIcon(addr.label)}
                    </div>
                    <div className="flex-1 pr-16">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-extrabold text-slate-800">{addr.label || 'Home'}</h3>
                        {addr.pincode && (
                          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full tracking-wider">
                            {addr.pincode}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {addr.flat && <span className="font-semibold text-slate-700 mr-1">{addr.flat},</span>} 
                        {addr.address}
                      </p>
                      {addr.landmark && (
                        <p className="text-sm text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                          <MapPin size={14} /> Landmark: {addr.landmark}
                        </p>
                      )}
                      <div className="flex items-center gap-5 mt-5">
                        <button 
                          onClick={() => handleEdit(addr)}
                          className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(addr.id)}
                          disabled={deletingId === addr.id}
                          className="text-sm font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {deletingId === addr.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                          {deletingId === addr.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-20">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <MapPin size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3">No saved addresses</h2>
            <p className="text-slate-500 mb-8 font-medium">Save your addresses to speed up checkout and easily manage deliveries.</p>
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus size={20} /> Add Your First Address
            </button>
          </div>
        )}
      </div>

      <AddressModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={editingAddress}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProfileAddresses;
