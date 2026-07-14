import React from 'react';
import { Search, Globe, Layout, BarChart, Zap, ChevronRight, Play } from 'lucide-react';

export const SEOManager = ({ token }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Search className="text-indigo-600" /> SEO & Metadata
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage global search engine optimization and social sharing cards.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all shadow-sm">
          <Zap size={16} /> Run AI Audit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
            
            <div>
              <h3 className="text-sm font-black text-gray-900 mb-4 border-b border-gray-100 pb-2">Global Meta Defaults</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex justify-between">
                    <span>Site Title Format</span>
                    <span className="text-gray-400 font-mono">"{'{page_title}'} | OneBasket"</span>
                  </label>
                  <input type="text" defaultValue="{page_title} | OneBasket" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Global Meta Description</label>
                  <textarea rows="3" defaultValue="Shop the best groceries and daily essentials online at OneBasket. Fast 10-minute delivery." className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"></textarea>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-900 mb-4 border-b border-gray-100 pb-2 mt-8">Social Media (OpenGraph)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Default OG Image</label>
                  <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all">
                     <span className="text-sm font-bold">Upload Image (1200x630px)</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Twitter Handle</label>
                  <input type="text" defaultValue="@onebasket" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Previews & Score */}
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900">SEO Health Score</h3>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black">
                  92
                </div>
             </div>
             <div className="space-y-3">
               <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Robots.txt Valid
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sitemap.xml Generated
               </div>
               <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                 <div className="w-2 h-2 rounded-full bg-amber-500"></div> 3 Pages missing meta
               </div>
             </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
             <h3 className="text-sm font-black text-gray-900 mb-4">Google Preview</h3>
             <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
               <div className="text-[11px] text-gray-500 flex items-center gap-1 mb-1 font-medium">
                 <Globe size={12}/> https://onebasket.com <ChevronRight size={12}/>
               </div>
               <div className="text-[15px] text-blue-700 hover:underline cursor-pointer font-medium mb-1 truncate">
                 Home | OneBasket - 10 Min Grocery Delivery
               </div>
               <div className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed font-medium">
                 Shop the best groceries and daily essentials online at OneBasket. Fast 10-minute delivery straight to your doorstep.
               </div>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
};
