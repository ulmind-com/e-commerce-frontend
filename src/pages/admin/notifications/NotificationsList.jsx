import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  BellRing, 
  MoreVertical, 
  PauseCircle, 
  PlayCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Send,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const NotificationsList = ({ token, composeModalOpen, setComposeModalOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Form State
  const [newMsg, setNewMsg] = useState({
    title: '',
    channel: 'Email',
    audience: 'All Customers',
    content: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/notifications?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
      // Fallback data
      setNotifications([
        { id: '1', title: 'Welcome Series - Day 1', channel: 'Email', status: 'Sending', audience: 'New Users', sent_count: 1250, delivered_count: 1240, opened_count: 800 },
        { id: '2', title: 'Flash Sale Alert', channel: 'WhatsApp', status: 'Completed', audience: 'VIP Customers', sent_count: 5000, delivered_count: 4950, opened_count: 4000 },
        { id: '3', title: 'App Update Available', channel: 'Push', status: 'Scheduled', audience: 'All App Users', sent_count: 0, delivered_count: 0, opened_count: 0 },
        { id: '4', title: 'Cart Abandonment', channel: 'SMS', status: 'Draft', audience: 'Abandoned Carts', sent_count: 0, delivered_count: 0, opened_count: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/notifications`, newMsg, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      setComposeModalOpen(false);
    } catch (error) {
      console.error('Failed to create notification', error);
      // Optimistic fallback update
      setNotifications([{
        id: Date.now().toString(),
        ...newMsg,
        status: 'Sending',
        sent_count: 0, delivered_count: 0, opened_count: 0
      }, ...notifications]);
      setComposeModalOpen(false);
    }
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'Email': return <Mail size={16} className="text-indigo-500" />;
      case 'SMS': return <MessageSquare size={16} className="text-blue-500" />;
      case 'WhatsApp': return <Smartphone size={16} className="text-emerald-500" />;
      case 'Push': return <BellRing size={16} className="text-fuchsia-500" />;
      default: return <Mail size={16} />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Sending': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Scheduled': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Failed': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Completed', 'Sending', 'Scheduled', 'Draft'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
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
              placeholder="Search campaigns..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.filter(n => n.title.toLowerCase().includes(search.toLowerCase())).map(notif => (
            <div key={notif.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all p-6 group">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getChannelIcon(notif.channel)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight mb-1">{notif.title}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-500">{notif.channel}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span className="text-xs font-bold text-slate-500">{notif.audience}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(notif.status)}`}>
                    {notif.status}
                  </div>
                  <button className="text-slate-400 hover:text-slate-800 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Send size={12} /> Sent
                  </div>
                  <p className="font-black text-slate-700 text-base">{notif.sent_count?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <CheckCircle2 size={12} /> Delivered
                  </div>
                  <p className="font-black text-slate-700 text-base">{notif.delivered_count?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Eye size={12} /> Opened
                  </div>
                  <p className="font-black text-slate-700 text-base">{notif.opened_count?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      <AnimatePresence>
        {composeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col"
            >
              
              <div className="p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Send size={24} className="text-indigo-600" /> Compose Message
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Create a new notification campaign to send to your audience.</p>
              </div>
              
              <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Campaign Name</label>
                  <input 
                    type="text" 
                    value={newMsg.title}
                    onChange={(e) => setNewMsg({...newMsg, title: e.target.value})}
                    placeholder="e.g. Diwali Flash Sale Announcement" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Channel</label>
                    <select 
                      value={newMsg.channel}
                      onChange={(e) => setNewMsg({...newMsg, channel: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      <option>Email</option>
                      <option>SMS</option>
                      <option>WhatsApp</option>
                      <option>Push Notification</option>
                      <option>In-App Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Audience</label>
                    <select 
                      value={newMsg.audience}
                      onChange={(e) => setNewMsg({...newMsg, audience: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      <option>All Customers</option>
                      <option>VIP Members</option>
                      <option>Inactive Users (30+ Days)</option>
                      <option>Abandoned Cart Users</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    Message Content
                    <span className="text-indigo-600 cursor-pointer hover:underline">Use AI Writer</span>
                  </label>
                  <textarea 
                    value={newMsg.content}
                    onChange={(e) => setNewMsg({...newMsg, content: e.target.value})}
                    placeholder="Type your message here..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-40" 
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-2">Available Variables: {'{{customer_name}}, {{order_id}}, {{coupon_code}}'}</p>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={() => setComposeModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100">Cancel</button>
                <button onClick={handleCreate} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                  <Send size={18} /> Send Campaign
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
