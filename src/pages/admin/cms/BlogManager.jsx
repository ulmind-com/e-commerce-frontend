import React from 'react';
import { PenTool, Plus, FileText, Settings, Search } from 'lucide-react';

export const BlogManager = ({ token }) => {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900">Blogs & Articles</h2>
          <p className="text-sm font-medium text-gray-500">Manage your content marketing and news.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
          <PenTool size={18} /> Write Article
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
           <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Settings size={16} /> Categories & Tags
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">No articles yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">Start writing your first blog post to engage with your customers and improve your SEO.</p>
          <button className="px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
            <Plus size={18} /> Create First Post
          </button>
        </div>
      </div>
    </div>
  );
};
