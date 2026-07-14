import React, { useState } from 'react';
import { 
  Menu,
  MoreVertical,
  Plus,
  Trash2,
  ChevronDown,
  LayoutTemplate,
  Monitor
} from 'lucide-react';

export const HeaderFooterBuilder = ({ token }) => {
  const [activeTab, setActiveTab] = useState('header');

  const [menuItems, setMenuItems] = useState([
    { id: 1, label: 'Home', url: '/' },
    { id: 2, label: 'Shop', url: '/shop' },
    { id: 3, label: 'Categories', url: '/categories', children: [
      { id: 31, label: 'Electronics', url: '/category/electronics' },
      { id: 32, label: 'Fashion', url: '/category/fashion' }
    ]},
    { id: 4, label: 'Offers', url: '/offers' },
  ]);

  const MenuItem = ({ item, depth = 0 }) => (
    <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-8 mt-2 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-xl p-3 group hover:border-indigo-300 transition-all">
        <Menu size={16} className="text-gray-400 cursor-grab hover:text-gray-600" />
        <div className="flex-1 grid grid-cols-2 gap-4">
          <input 
            type="text" 
            defaultValue={item.label} 
            className="bg-transparent border-none text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2"
          />
          <input 
            type="text" 
            defaultValue={item.url} 
            className="bg-transparent border-none text-sm font-mono text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2"
          />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
            <Plus size={14} />
          </button>
          <button className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {item.children && item.children.map(child => (
        <MenuItem key={child.id} item={child} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-max">
        <button 
          onClick={() => setActiveTab('header')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'header' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutTemplate size={18}/> Header Menu
        </button>
        <button 
          onClick={() => setActiveTab('footer')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'footer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutTemplate size={18} className="rotate-180"/> Footer Columns
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 md:p-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">
              {activeTab === 'header' ? 'Main Navigation' : 'Footer Links'}
            </h2>
            <p className="text-sm font-medium text-gray-500">Drag and drop to reorder menu items. Nested items create dropdowns.</p>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 px-10 mb-2">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Label</span>
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">URL / Link</span>
          </div>
          
          <div className="space-y-3">
            {menuItems.map(item => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Save Navigation
          </button>
        </div>

      </div>

    </div>
  );
};
