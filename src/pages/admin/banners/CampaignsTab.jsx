import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Megaphone, 
  Calendar,
  IndianRupee,
  MoreVertical,
  Plus,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const CampaignsTab = ({ token }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/banners/campaigns/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data);
    } catch (error) {
      console.error(error);
      // Fallback
      setCampaigns([
        { id: '1', name: 'Diwali Mega Sale 2026', type: 'Festival', status: 'Active', start_date: '2026-10-15', end_date: '2026-11-05', budget: 500000, banners_count: 12 },
        { id: '2', name: 'Summer Launch', type: 'Seasonal', status: 'Scheduled', start_date: '2026-04-01', end_date: '2026-06-30', budget: 200000, banners_count: 5 },
        { id: '3', name: 'Clearance Q3', type: 'Clearance', status: 'Completed', start_date: '2025-09-01', end_date: '2025-09-30', budget: 50000, banners_count: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-slate-100 text-slate-700';
      case 'Draft': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-fuchsia-50 rounded-2xl flex items-center justify-center text-fuchsia-600">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Campaigns</h2>
            <p className="text-sm font-medium text-slate-500">Group multiple banners into unified marketing campaigns.</p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
          <Plus size={18} /> New Campaign
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div key={camp.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-fuchsia-300 transition-all p-6 relative overflow-hidden group">
              
              {/* Decorative blob */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-2xl group-hover:bg-fuchsia-500/10 transition-colors"></div>

              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${getStatusColor(camp.status)}`}>
                  {camp.status}
                </div>
                <button className="text-slate-400 hover:text-slate-800 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="mb-6 relative z-10">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2">{camp.name}</h3>
                <span className="inline-block px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold">
                  {camp.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <IndianRupee size={12} /> Budget
                  </p>
                  <p className="font-black text-slate-700">₹{camp.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FolderOpen size={12} /> Banners
                  </p>
                  <p className="font-black text-slate-700">{camp.banners_count} Assets</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                  <Calendar size={16} className="text-slate-400" />
                  {camp.start_date ? new Date(camp.start_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) : 'TBD'} - 
                  {camp.end_date ? new Date(camp.end_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) : 'TBD'}
                </div>
                
                {camp.status === 'Active' ? (
                   <button className="text-fuchsia-600 hover:text-fuchsia-700 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                     Manage <ArrowUpRight size={14} />
                   </button>
                ) : (
                   <button className="text-emerald-600 hover:text-emerald-700 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                     <PlayCircle size={16} /> Launch
                   </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
      
    </div>
  );
};
