import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Smartphone, 
  Monitor, 
  Settings,
  Image as ImageIcon,
  Type,
  LayoutTemplate,
  Plus,
  MoreVertical,
  ChevronDown,
  Trash2,
  Copy,
  Move
} from 'lucide-react';

export const VisualPageBuilder = ({ token, pageId }) => {
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [sidebarTab, setSidebarTab] = useState('blocks'); // 'blocks', 'settings'

  const blocks = [
    { id: 'hero', name: 'Hero Section', icon: LayoutTemplate, category: 'Layout' },
    { id: 'banner', name: 'Image Banner', icon: ImageIcon, category: 'Media' },
    { id: 'text', name: 'Rich Text', icon: Type, category: 'Typography' },
    { id: 'products', name: 'Product Grid', icon: LayoutTemplate, category: 'E-commerce' },
  ];

  return (
    <div className="absolute inset-0 bg-gray-100 flex flex-col z-50">
      
      {/* Top Navbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black text-gray-900 flex items-center gap-2">
              Homepage V2 <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600 border border-amber-200">Draft</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500">Last saved 2 mins ago</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button onClick={() => setDeviceMode('desktop')} className={`p-2 rounded-lg transition-colors ${deviceMode === 'desktop' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            <Monitor size={16} />
          </button>
          <button onClick={() => setDeviceMode('mobile')} className={`p-2 rounded-lg transition-colors ${deviceMode === 'mobile' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            <Smartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all border border-gray-200 flex items-center gap-2">
            <Eye size={16} /> Preview
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
            <Save size={16} /> Save & Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Blocks & Settings) */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setSidebarTab('blocks')}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${sidebarTab === 'blocks' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              Add Blocks
            </button>
            <button 
              onClick={() => setSidebarTab('settings')}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${sidebarTab === 'settings' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              Page Settings
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {sidebarTab === 'blocks' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Layout</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {blocks.filter(b => b.category === 'Layout').map(block => (
                      <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-indigo-300 hover:shadow-md transition-all group">
                        <block.icon size={24} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-xs font-bold text-gray-700 text-center">{block.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Media</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {blocks.filter(b => b.category === 'Media').map(block => (
                      <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-indigo-300 hover:shadow-md transition-all group">
                        <block.icon size={24} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-xs font-bold text-gray-700 text-center">{block.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Page Title</label>
                  <input type="text" defaultValue="Homepage V2" className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">URL Slug</label>
                  <input type="text" defaultValue="/" className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Visibility</label>
                  <select className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm">
                    <option>Public</option>
                    <option>Hidden</option>
                    <option>Password Protected</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 overflow-y-auto p-4 md:p-8 flex justify-center relative">
          
          <div className={`transition-all duration-500 ease-in-out ${deviceMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'}`}>
            
            <div className="bg-white min-h-[800px] rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden ring-1 ring-gray-900/5">
              
              {/* Fake Website Header */}
              <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
                <div className="text-xl font-black text-gray-900">One<span className="text-indigo-600">Basket</span></div>
                <div className="hidden md:flex gap-6 text-sm font-bold text-gray-600">
                  <span>Home</span>
                  <span>Shop</span>
                  <span>Categories</span>
                </div>
              </div>

              {/* Rendered Blocks */}
              <div className="p-4 space-y-4">
                
                {/* Hero Block Mockup */}
                <div className="relative group rounded-2xl border-2 border-dashed border-transparent hover:border-indigo-500 transition-all p-2">
                  {/* Block Controls */}
                  <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white rounded-lg shadow-lg flex items-center overflow-hidden z-20">
                    <button className="p-2 hover:bg-indigo-700"><Move size={14}/></button>
                    <button className="p-2 hover:bg-indigo-700"><Settings size={14}/></button>
                    <button className="p-2 hover:bg-indigo-700"><Copy size={14}/></button>
                    <button className="p-2 bg-rose-500 hover:bg-rose-600"><Trash2 size={14}/></button>
                  </div>

                  <div className="bg-gray-50 h-96 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
                    <div className="text-center relative z-10 p-6">
                      <h2 className="text-4xl font-black text-gray-900 mb-4">Fresh Groceries, <br/> Delivered in 10 mins</h2>
                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Shop Now</button>
                    </div>
                  </div>
                </div>

                {/* Products Block Mockup */}
                <div className="relative group rounded-2xl border-2 border-dashed border-transparent hover:border-indigo-500 transition-all p-2">
                   <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white rounded-lg shadow-lg flex items-center overflow-hidden z-20">
                    <button className="p-2 hover:bg-indigo-700"><Move size={14}/></button>
                    <button className="p-2 hover:bg-indigo-700"><Settings size={14}/></button>
                    <button className="p-2 hover:bg-indigo-700"><Copy size={14}/></button>
                    <button className="p-2 bg-rose-500 hover:bg-rose-600"><Trash2 size={14}/></button>
                  </div>
                  
                  <div className="py-8">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Trending Now</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                          <div className="bg-gray-100 h-32 rounded-lg mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Section Drop Zone */}
                <div className="h-24 border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all">
                  <Plus size={20} />
                  <span className="font-bold">Drag & Drop or Click to add section</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
