import React from 'react';
import { BarChart3, Target, MousePointerClick, TrendingUp, Smartphone, Monitor, Map } from 'lucide-react';

export const BannerAnalytics = ({ token }) => {
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Click Through Rate Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Engagement Metrics</h3>
              <p className="text-sm font-medium text-slate-500">Views vs Clicks over the last 7 days.</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-600 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="h-64 flex items-end gap-2 md:gap-4 justify-between pt-10 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {[4, 3, 2, 1, 0].map(i => (
                <div key={i} className="flex items-center gap-4 w-full">
                  <span className="text-xs font-bold text-slate-300 w-8 text-right">{i * 10}k</span>
                  <div className="flex-1 border-t border-slate-100 border-dashed"></div>
                </div>
              ))}
            </div>

            {/* Simulated Bars */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const views = 40 + Math.random() * 60;
              const clicks = views * (0.05 + Math.random() * 0.1); 
              return (
                <div key={day} className="flex-1 flex items-end gap-1 relative z-10 group cursor-pointer justify-center">
                   {/* Tooltip */}
                   <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                      Views: {(views*1000).toFixed(0)}<br/>
                      Clicks: {(clicks*1000).toFixed(0)}
                    </div>
                  
                  {/* Views Bar */}
                  <div className="w-full max-w-[20px] bg-slate-200 rounded-t-md hover:bg-slate-300 transition-colors" style={{ height: `${views}%` }}></div>
                  {/* Clicks Bar */}
                  <div className="w-full max-w-[20px] bg-gradient-to-t from-fuchsia-600 to-purple-500 rounded-t-md hover:brightness-110 transition-colors shadow-md" style={{ height: `${clicks*10}%` }}></div>
                  
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-6 mt-12">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div> Total Impressions (Views)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div> Total Engagements (Clicks)
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-1">Device Analytics</h3>
          <p className="text-sm font-medium text-slate-500 mb-8">Where are your clicks coming from?</p>

          <div className="flex-1 space-y-6 flex flex-col justify-center">
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Smartphone size={18} className="text-fuchsia-500" /> Mobile (App + Web)
                </div>
                <div className="font-black text-slate-800 text-lg">74%</div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Monitor size={18} className="text-blue-500" /> Desktop
                </div>
                <div className="font-black text-slate-800 text-lg">22%</div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Monitor size={18} className="text-emerald-500" /> Tablet
                </div>
                <div className="font-black text-slate-800 text-lg">4%</div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: '4%' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};
