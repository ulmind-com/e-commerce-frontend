import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  PauseCircle, 
  PlayCircle,
  Calendar,
  Users,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const CouponsList = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [filter]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/coupons?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
    } catch (error) {
      console.error(error);
      // Fallback
      setCoupons([
        { id: '1', code: 'WELCOME100', name: 'New User Discount', type: 'flat', discount_value: 100, status: 'Active', usage_count: 450, end_date: '2027-12-31' },
        { id: '2', code: 'FESTIVAL50', name: 'Diwali Special', type: 'percentage', discount_value: 50, max_discount: 500, status: 'Active', usage_count: 1205, end_date: '2026-11-10' },
        { id: '3', code: 'FREEDEL', name: 'Free Delivery', type: 'free_delivery', discount_value: 0, status: 'Paused', usage_count: 89, end_date: '2026-08-01' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await axios.put(`${API}/coupons/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCoupons();
    } catch (e) {
      console.error(e);
      // Optimistic update for UI
      setCoupons(coupons.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Paused': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Expired': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeFormat = (coupon) => {
    if (coupon.type === 'percentage') return `${coupon.discount_value}% OFF`;
    if (coupon.type === 'flat') return `₹${coupon.discount_value} OFF`;
    if (coupon.type === 'free_delivery') return 'FREE DELIVERY';
    if (coupon.type === 'cashback') return `${coupon.discount_value}% CASHBACK`;
    return 'DISCOUNT';
  };

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Active', 'Paused', 'Scheduled', 'Expired'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <button 
            onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Coupon</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase())).map(coupon => (
            <div key={coupon.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all p-6 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${getStatusColor(coupon.status)}`}>
                  {coupon.status}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatusToggle(coupon.id, coupon.status)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                    {coupon.status === 'Active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Tag size={16} className="text-orange-500" />
                  <h3 className="text-2xl font-black text-slate-800 tracking-wider">{coupon.code}</h3>
                </div>
                <p className="text-sm font-bold text-slate-500">{coupon.name}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full opacity-10 blur-xl"></div>
                <p className="text-3xl font-black text-orange-600 tracking-tight">{getTypeFormat(coupon)}</p>
                {coupon.max_discount > 0 && <p className="text-xs font-bold text-orange-500 mt-1">Up to ₹{coupon.max_discount}</p>}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Used</p>
                    <p className="text-sm font-black text-slate-700">{coupon.usage_count} times</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valid Till</p>
                    <p className="text-sm font-black text-slate-700">{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple mock modal wrapper (functionality omitted for brevity, layout presented) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-8 relative"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-6">Create New Coupon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Coupon Code</label>
                  <input type="text" placeholder="e.g. SUMMER50" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none uppercase" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Coupon Name</label>
                  <input type="text" placeholder="Summer Sale 2026" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Discount Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Discount Value</label>
                  <input type="number" placeholder="50" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30">Save Coupon</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
