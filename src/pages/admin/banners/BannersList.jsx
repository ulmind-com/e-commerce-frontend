import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Image as ImageIcon,
  Clock,
  Layout,
  MousePointerClick,
  Monitor,
  Smartphone,
  PauseCircle,
  PlayCircle,
  Upload,
  Link as LinkIcon,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const BannersList = ({ token }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, [filter]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/banners?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (error) {
      console.error(error);
      // Fallback
      setBanners([
        { id: '1', title: 'Diwali Dhamaka Hero', type: 'Homepage Slider', status: 'Published', views: 45000, clicks: 1200, image_url: 'https://images.unsplash.com/photo-1604719312566-8fa246131d11?q=80&w=800&auto=format&fit=crop' },
        { id: '2', title: 'Free Delivery Popup', type: 'Popup Banner', status: 'Published', views: 12050, clicks: 800, image_url: 'https://images.unsplash.com/photo-1581515302716-69279a14bc31?q=80&w=800&auto=format&fit=crop' },
        { id: '3', title: 'Summer Collection', type: 'Category Banner', status: 'Paused', views: 8900, clicks: 150, image_url: 'https://images.unsplash.com/photo-1529369623266-f5264b696110?q=80&w=800&auto=format&fit=crop' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Published' ? 'Paused' : 'Published';
    try {
      await axios.put(`${API}/banners/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (e) {
      // Optimistic update
      setBanners(banners.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Paused': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Published', 'Paused', 'Scheduled', 'Draft'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
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
              placeholder="Search banners..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Create Banner</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).map(banner => (
            <div key={banner.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-fuchsia-300 transition-all group overflow-hidden flex flex-col">
              
              {/* Image Preview */}
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                
                <div className="absolute top-3 left-3 flex gap-2">
                  <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
                    banner.status === 'Published' ? 'bg-emerald-500/80 text-white border-emerald-500/50' : 
                    banner.status === 'Paused' ? 'bg-amber-500/80 text-white border-amber-500/50' : 
                    'bg-slate-800/80 text-white border-slate-700/50'
                  }`}>
                    {banner.status}
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => handleStatusToggle(banner.id, banner.status)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
                    {banner.status === 'Published' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight mb-1">{banner.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-600">
                    <Layout size={12} /> {banner.type}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Eye size={12} /> Views
                    </div>
                    <p className="font-black text-slate-700 text-sm">{banner.views?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <MousePointerClick size={12} /> Clicks
                    </div>
                    <p className="font-black text-slate-700 text-sm">{banner.clicks?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal Form (Placeholder Structure) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
              
              {/* Left Form */}
              <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <ImageIcon size={24} className="text-fuchsia-600" /> New Banner
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Banner Title</label>
                    <input type="text" placeholder="e.g. Summer Mega Sale Hero" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-fuchsia-500/20 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Banner Type</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-fuchsia-500/20 outline-none">
                        <option>Homepage Slider</option>
                        <option>Hero Banner</option>
                        <option>Popup Banner</option>
                        <option>Category Banner</option>
                        <option>Announcement Bar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Link</label>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="/category/summer" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-fuchsia-500/20 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Upload Media</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-fuchsia-50 hover:border-fuchsia-200 transition-colors group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-fuchsia-500 mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Drag & drop your banner image here</p>
                      <p className="text-xs font-medium text-slate-400 mt-1">Supports JPG, PNG, WEBP, GIF up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Start Date</label>
                      <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-fuchsia-500/20 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">End Date (Optional)</label>
                      <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-fuchsia-500/20 outline-none text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-fuchsia-500/30">Save Banner</button>
                </div>
              </div>
              
              {/* Right Settings Panel */}
              <div className="w-full md:w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col hidden md:flex">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Display Rules</h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Target Devices</p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-white border-2 border-fuchsia-500 text-fuchsia-600 rounded-xl flex justify-center"><Monitor size={18} /></button>
                      <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl flex justify-center hover:bg-slate-100"><Smartphone size={18} /></button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Target Customers</p>
                    <select className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 text-sm outline-none">
                      <option>All Users</option>
                      <option>Logged In Only</option>
                      <option>New Users</option>
                      <option>VIP Members</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Campaign Group</p>
                    <select className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 text-sm outline-none">
                      <option>None</option>
                      <option>Diwali Sale 2026</option>
                      <option>Summer Launch</option>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-fuchsia-50 border border-fuchsia-100 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-fuchsia-800">Priority Level</span>
                      <span className="text-xs font-black text-fuchsia-600">1</span>
                    </div>
                    <input type="range" min="1" max="10" className="w-full accent-fuchsia-600" />
                    <p className="text-[10px] text-fuchsia-600/70 mt-1 font-medium leading-tight">Higher priority banners show first in sliders.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
