import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Award } from 'lucide-react';

export const AnalyticsTab = ({ token }) => {
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Impact Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Coupon Revenue Impact</h3>
              <p className="text-sm font-medium text-slate-500">Revenue generated from orders using coupons.</p>
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
                  <span className="text-xs font-bold text-slate-300 w-8 text-right">₹{i * 25}k</span>
                  <div className="flex-1 border-t border-slate-100 border-dashed"></div>
                </div>
              ))}
            </div>

            {/* Simulated Bars */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const h1 = 30 + Math.random() * 50;
              const h2 = h1 * (0.1 + Math.random() * 0.2); // Discount part
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-3 relative z-10 group cursor-pointer">
                  <div className="w-full max-w-[40px] flex flex-col justify-end gap-1 h-56">
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                      Revenue: ₹{(h1*1000).toFixed(0)}<br/>
                      Discount: ₹{(h2*1000).toFixed(0)}
                    </div>
                    
                    <div className="w-full bg-orange-200 rounded-t-md hover:brightness-110 transition-all" style={{ height: `${h2}%` }}></div>
                    <div className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-b-md rounded-t-sm hover:brightness-110 transition-all shadow-md" style={{ height: `${h1}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div> Revenue Generated
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <div className="w-3 h-3 rounded-full bg-orange-200"></div> Discount Given
            </div>
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Top Performers</h3>
              <p className="text-sm font-medium text-slate-500">Best converting campaigns</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {[
              { code: 'WELCOME100', uses: 1205, rev: '1.2L' },
              { code: 'FESTIVAL50', uses: 856, rev: '85K' },
              { code: 'FREEDEL', uses: 432, rev: '21K' },
              { code: 'VIP10', uses: 215, rev: '50K' },
              { code: 'APPONLY', uses: 189, rev: '12K' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-slate-400 flex items-center justify-center font-black text-xs shadow-sm border border-slate-100">
                    #{i + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 tracking-wider text-sm">{item.code}</h4>
                    <p className="text-xs text-slate-500 font-bold">{item.uses} uses</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">₹{item.rev}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
    </div>
  );
};
