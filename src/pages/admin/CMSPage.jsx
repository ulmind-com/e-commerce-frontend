import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Layout, 
  Palette, 
  Image as ImageIcon,
  PenTool,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Import sub-components
import { CMSDashboard } from './cms/CMSDashboard';
import { PagesManager } from './cms/PagesManager';
import { VisualPageBuilder } from './cms/VisualPageBuilder';
import { ThemeCustomizer } from './cms/ThemeCustomizer';
import { HeaderFooterBuilder } from './cms/HeaderFooterBuilder';
import { MediaLibrary } from './cms/MediaLibrary';
import { BlogManager } from './cms/BlogManager';
import { SEOManager } from './cms/SEOManager';

export default function CMSPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // States for builders
  const [editingPageId, setEditingPageId] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'builder', label: 'Visual Builder', icon: Layout },
    { id: 'theme', label: 'Theme Settings', icon: Palette },
    { id: 'navigation', label: 'Navigation', icon: PenTool },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'blogs', label: 'Blogs & Articles', icon: FileText },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
  ];

  const handleEditPage = (pageId) => {
    setEditingPageId(pageId);
    setActiveTab('builder');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans overflow-hidden flex flex-col md:flex-row rounded-tl-2xl border-t border-l border-gray-200 shadow-sm">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Layout className="text-indigo-600" /> Web Studio
          </h2>
          <p className="text-xs font-medium text-gray-500 mt-1">Enterprise CMS Platform</p>
        </div>

        <div className="px-4 pb-6 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'builder') setEditingPageId(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group overflow-hidden ${
                  isActive 
                    ? 'text-indigo-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="cms-sidebar-active"
                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={18} className={`relative z-10 ${isActive ? 'text-indigo-600' : 'group-hover:text-gray-700 transition-colors'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-gray-50/50 h-[calc(100vh-4rem)] min-w-0">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

        <div className="p-4 md:p-8 relative z-10 min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <CMSDashboard token={token} />}
              {activeTab === 'pages' && <PagesManager token={token} onEditPage={handleEditPage} />}
              {activeTab === 'builder' && <VisualPageBuilder token={token} pageId={editingPageId} />}
              {activeTab === 'theme' && <ThemeCustomizer token={token} />}
              {activeTab === 'navigation' && <HeaderFooterBuilder token={token} />}
              {activeTab === 'media' && <MediaLibrary token={token} />}
              {activeTab === 'blogs' && <BlogManager token={token} />}
              {activeTab === 'seo' && <SEOManager token={token} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
