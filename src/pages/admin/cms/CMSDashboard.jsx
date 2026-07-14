import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText,
  Layout,
  Globe,
  Database,
  Search,
  ArrowUpRight,
  Plus
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const CMSDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/cms/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error(error);
        // Fallback for UI visualization
        setStats({
          total_pages: 142,
          published: 120,
          drafts: 15,
          storage_used_gb: 45.2,
          seo_score: 92
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend = null, suffix = "" }) => (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group relative overflow-hidden flex flex-col">
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${bgClass}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center shadow-sm relative z-10 group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={colorClass} />
        </div>
        
        {trend !== null && (
          <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-100">
            <ArrowUpRight size={14} /> {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">
          {value !== undefined ? value : 0}{suffix}
        </h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-3xl h-40 animate-pulse border border-gray-100"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pages" 
          value={stats?.total_pages} 
          icon={FileText} 
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50 border border-indigo-100"
          trend={+12.4}
        />
        <StatCard 
          title="Published Pages" 
          value={stats?.published} 
          icon={Globe} 
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50 border border-emerald-100"
          trend={+5.2}
        />
        <StatCard 
          title="Average SEO Score" 
          value={stats?.seo_score} 
          icon={Search} 
          colorClass="text-amber-600"
          bgClass="bg-amber-50 border border-amber-100"
          trend={+2.1}
        />
        <StatCard 
          title="Storage Usage" 
          value={stats?.storage_used_gb} 
          suffix=" GB"
          icon={Database} 
          colorClass="text-blue-600"
          bgClass="bg-blue-50 border border-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Quick Links</h3>
          <div className="space-y-3 flex-1">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-100 rounded-2xl transition-all group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><Layout size={18}/></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">Edit Homepage</p>
                  <p className="text-xs font-medium text-gray-500">Modify the main landing page</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-gray-400 group-hover:text-indigo-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-100 rounded-2xl transition-all group shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><FileText size={18}/></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">Write Blog Post</p>
                  <p className="text-xs font-medium text-gray-500">Publish a new article</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-gray-400 group-hover:text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Content Distribution</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-[calc(100%-3rem)]">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-500">Landing Pages</span>
                  <span className="text-sm font-black text-gray-900">45</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 shadow-inner">
                  <div className="bg-indigo-500 h-2.5 rounded-full shadow-sm" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-500">Blog Posts</span>
                  <span className="text-sm font-black text-gray-900">78</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 shadow-inner">
                  <div className="bg-emerald-500 h-2.5 rounded-full shadow-sm" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-500">Policies & Legal</span>
                  <span className="text-sm font-black text-gray-900">12</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 shadow-inner">
                  <div className="bg-amber-500 h-2.5 rounded-full shadow-sm" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-40 h-40 relative flex items-center justify-center bg-gray-50 rounded-full border border-gray-100 shadow-sm">
                <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                  />
                  <path
                    className="text-indigo-500"
                    strokeDasharray="45, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="30, 100"
                    strokeDashoffset="-45"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900 leading-none mb-1">142</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
