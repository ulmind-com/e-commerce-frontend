import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Globe,
  FileText,
  Clock,
  Edit3,
  Trash2,
  Copy,
  FolderOpen
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const PagesManager = ({ token, onEditPage }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPages();
  }, [filter]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/cms/pages?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data);
    } catch (error) {
      console.error(error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(`${API}/cms/pages`, { title: 'New Untitled Page' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPages();
      onEditPage(res.data.id);
    } catch (error) {
      console.error(error);
      const fakeId = Date.now().toString();
      setPages([{ id: fakeId, title: 'New Untitled Page', slug: '/new', type: 'Custom', status: 'Draft', views: 0, updated_at: new Date().toISOString() }, ...pages]);
      onEditPage(fakeId);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Published': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Draft': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Archived': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Published', 'Draft', 'Archived'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border border-indigo-500' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search pages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
            />
          </div>
          <button onClick={handleCreate} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 shrink-0">
            <Plus size={18} /> <span className="hidden sm:inline">Create Page</span>
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100"></div>)
        ) : filteredPages.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-center">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-sm">
              <FolderOpen size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No pages found</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">You don't have any pages matching your current filters. Create a new page to get started.</p>
            <button onClick={handleCreate} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
              <Plus size={18} /> Create New Page
            </button>
          </div>
        ) : (
          filteredPages.map((page) => (
            <div key={page.id} className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-300 transition-all group relative overflow-hidden flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shadow-sm">
                    {page.type === 'Landing' ? <Globe size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-1">{page.title}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-gray-500">{page.slug || '/'}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(page.status)}`}>
                  {page.status}
                </div>
              </div>

              <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100">
                <div className="flex gap-2">
                  <button onClick={() => onEditPage(page.id)} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm">
                    <Edit3 size={16} />
                  </button>
                  <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
                    <Copy size={16} />
                  </button>
                  <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Clock size={12} />
                  {new Date(page.updated_at).toLocaleDateString()}
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};
