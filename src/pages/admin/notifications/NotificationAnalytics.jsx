import React from 'react';
import { 
  BarChart3, 
  Target, 
  MousePointerClick, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Map,
  Filter
} from 'lucide-react';

export const NotificationAnalytics = ({ token }) => {
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Delivery Funnel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Engagement Funnel</h3>
              <p className="text-sm font-medium text-slate-500">Sent vs Delivered vs Opened vs Clicked</p>
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
                  <span className="text-xs font-bold text-slate-300 w-8 text-right">{i * 25}%</span>
                  <div className="flex-1 border-t border-slate-100 border-dashed"></div>
                </div>
              ))}
            </div>

            {/* Simulated Bars */}
            {[
              { label: 'Sent', value: 100, color: 'bg-slate-200' },
              { label: 'Delivered', value: 98, color: 'bg-indigo-300' },
              { label: 'Opened', value: 65, color: 'bg-indigo-500' },
              { label: 'Clicked', value: 24, color: 'bg-indigo-700' },
              { label: 'Converted', value: 8, color: 'bg-emerald-500' }
            ].map((step, i) => {
              return (
                <div key={step.label} className="flex-1 flex items-end justify-center relative z-10 group cursor-pointer">
                   {/* Tooltip */}
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                      {step.label}: {step.value}%
                    </div>
                  
                  <div className={`w-full max-w-[60px] ${step.color} rounded-t-xl hover:brightness-110 transition-colors shadow-sm`} style={{ height: `${step.value}%` }}></div>
                  
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{step.label}</span>
                </div>
              );
            })}
          </div>
          
        </div>

        {/* Failed Reasons */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-1">Failure Reasons</h3>
          <p className="text-sm font-medium text-slate-500 mb-8">Why notifications fail to deliver.</p>

          <div className="flex-1 space-y-6 flex flex-col justify-center">
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-slate-700 font-bold text-sm">Hard Bounce (Invalid Email)</div>
                <div className="font-black text-slate-800 text-sm">45%</div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-slate-700 font-bold text-sm">Number Blocked (WhatsApp)</div>
                <div className="font-black text-slate-800 text-sm">30%</div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-slate-700 font-bold text-sm">DND Active (SMS)</div>
                <div className="font-black text-slate-800 text-sm">15%</div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-slate-700 font-bold text-sm">Spam Filter / Other</div>
                <div className="font-black text-slate-800 text-sm">10%</div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};
