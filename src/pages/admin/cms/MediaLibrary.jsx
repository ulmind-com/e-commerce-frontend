import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  Folder, 
  MoreVertical,
  Filter,
  Trash2,
  Download,
  Link
} from 'lucide-react';

export const MediaLibrary = ({ token }) => {
  const [activeTab, setActiveTab] = useState('all');

  const [media, setMedia] = useState([
    { id: 1, name: 'hero-banner-v2.webp', size: '1.2 MB', type: 'image/webp', url: 'https://placehold.co/600x400/6366f1/ffffff?text=Image', date: 'Oct 12, 2023' },
    { id: 2, name: 'summer-collection.jpg', size: '2.4 MB', type: 'image/jpeg', url: 'https://placehold.co/600x400/10b981/ffffff?text=Image', date: 'Oct 11, 2023' },
    { id: 3, name: 'logo-dark.svg', size: '45 KB', type: 'image/svg+xml', url: 'https://placehold.co/600x400/64748b/ffffff?text=Image', date: 'Oct 10, 2023' },
    { id: 4, name: 'product-placeholder.png', size: '500 KB', type: 'image/png', url: 'https://placehold.co/600x400/f59e0b/ffffff?text=Image', date: 'Oct 09, 2023' },
    { id: 5, name: 'promo-video-sm.mp4', size: '12 MB', type: 'video/mp4', url: 'https://placehold.co/600x400/f43f5e/ffffff?text=Video', date: 'Oct 08, 2023' },
  ]);

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'images', 'videos', 'documents'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
            />
          </div>
          <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
            <Upload size={18} /> Upload
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-3xl p-6 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          
          {/* Upload Dropzone */}
          <div className="aspect-square border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <Upload size={20} />
            </div>
            <span className="text-sm font-bold">Drag & Drop files</span>
          </div>

          {media.map(file => (
            <div key={file.id} className="group relative aspect-square bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-400 hover:shadow-lg transition-all">
              
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              <img 
                src={file.url} 
                alt={file.name} 
                className="absolute inset-0 w-full h-full object-cover z-10"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-between p-3">
                <div className="flex justify-end gap-1">
                  <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white hover:text-gray-900 transition-colors" title="Copy Link"><Link size={14}/></button>
                  <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white hover:text-gray-900 transition-colors" title="Download"><Download size={14}/></button>
                  <button className="p-1.5 bg-rose-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-rose-500 transition-colors" title="Delete"><Trash2 size={14}/></button>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-white truncate mb-0.5">{file.name}</p>
                  <div className="flex justify-between items-center text-[10px] font-medium text-gray-300">
                    <span>{file.size}</span>
                    <span>{file.type.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};
