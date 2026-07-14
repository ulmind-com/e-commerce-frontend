import React, { useState } from 'react';
import { Type, Image as ImageIcon, PaintBucket, LayoutTemplate, Layers, Link as LinkIcon, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export const VisualBuilderTab = ({ token }) => {
  const [device, setDevice] = useState('desktop');
  const [config, setConfig] = useState({
    title: 'Super Weekend Sale',
    subtitle: 'Up to 50% OFF on all electronics and home appliances',
    buttonText: 'Shop Now',
    bgColor: '#fdf4ff',
    textColor: '#4a044e',
    btnColor: '#c026d3',
    align: 'center'
  });

  const updateConfig = (key, val) => {
    setConfig({ ...config, [key]: val });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
      
      {/* Editor Sidebar */}
      <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <LayoutTemplate size={18} className="text-fuchsia-600" /> Banner Elements
          </h2>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Text Settings */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1"><Type size={14} /> Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Headline</label>
                <input 
                  type="text" 
                  value={config.title} 
                  onChange={(e) => updateConfig('title', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-fuchsia-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Subheadline</label>
                <textarea 
                  value={config.subtitle} 
                  onChange={(e) => updateConfig('subtitle', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-fuchsia-400 resize-none h-20"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Button Settings */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1"><LinkIcon size={14} /> Call To Action</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Button Text</label>
                <input 
                  type="text" 
                  value={config.buttonText} 
                  onChange={(e) => updateConfig('buttonText', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Style Settings */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1"><PaintBucket size={14} /> Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Background</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={config.bgColor} 
                    onChange={(e) => updateConfig('bgColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-medium text-slate-500 uppercase">{config.bgColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={config.textColor} 
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-medium text-slate-500 uppercase">{config.textColor}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-600 mb-1 block">Button Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={config.btnColor} 
                    onChange={(e) => updateConfig('btnColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-medium text-slate-500 uppercase">{config.btnColor}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-600 mb-2 block">Alignment</label>
              <div className="flex bg-slate-100 rounded-lg p-1">
                {['left', 'center', 'right'].map(al => (
                  <button 
                    key={al}
                    onClick={() => updateConfig('align', al)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize ${config.align === al ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    {al}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50">
           <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg">
             Export HTML / Save
           </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-200/50 rounded-3xl border border-slate-200 flex flex-col overflow-hidden relative">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Live Preview</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        {/* The actual preview canvas */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')]">
          
          <motion.div 
            layout
            initial={false}
            animate={{ 
              width: device === 'desktop' ? '100%' : '375px',
              height: device === 'desktop' ? '400px' : '667px'
            }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col justify-center border border-slate-200/60 relative"
            style={{ backgroundColor: config.bgColor, textAlign: config.align }}
          >
            {/* Mock Header for mobile */}
            {device === 'mobile' && (
              <div className="absolute top-0 w-full h-12 bg-white/50 backdrop-blur-md flex items-center px-4 border-b border-black/5">
                 <div className="w-20 h-4 bg-black/10 rounded-full"></div>
              </div>
            )}
            
            <div className={`p-8 md:p-12 ${device === 'mobile' ? 'mt-12' : ''} flex flex-col justify-center h-full`} style={{ alignItems: config.align === 'center' ? 'center' : config.align === 'right' ? 'flex-end' : 'flex-start' }}>
              <h1 className="font-black tracking-tight mb-4" style={{ color: config.textColor, fontSize: device === 'desktop' ? '48px' : '32px', lineHeight: 1.1 }}>
                {config.title || 'Your Headline Here'}
              </h1>
              
              <p className="font-medium mb-8 max-w-2xl" style={{ color: config.textColor, opacity: 0.8, fontSize: device === 'desktop' ? '18px' : '16px' }}>
                {config.subtitle || 'Add a compelling subheadline to describe your offer.'}
              </p>
              
              <button 
                className="px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: config.btnColor }}
              >
                {config.buttonText || 'Click Here'}
              </button>
            </div>
            
            {/* Decorative abstract shape */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-black opacity-5 rounded-tl-full pointer-events-none mix-blend-overlay"></div>
          </motion.div>

        </div>
      </div>
      
    </div>
  );
};
