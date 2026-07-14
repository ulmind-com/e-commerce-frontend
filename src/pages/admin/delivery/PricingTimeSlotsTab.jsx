import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Clock, Calendar, Zap, Save, Plus, Store, Check, X } from 'lucide-react';

export const PricingTimeSlotsTab = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pricing Engine & Schedules</h2>
        <p className="text-slate-500 font-medium mt-1">Configure complex delivery charges and operational timings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Pricing */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                <IndianRupee size={20} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">Delivery Pricing Engine</h3>
            </div>

            <div className="space-y-6 relative z-10">
              {/* Dynamic Rules */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Fixed Delivery Charge</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Base charge applied to all standard orders</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input type="number" defaultValue={29} className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Free Delivery Threshold</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Orders above this value get free standard delivery</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input type="number" defaultValue={499} className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-fuchsia-50/50 p-4 rounded-xl border border-fuchsia-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Zap size={14} className="text-fuchsia-600" /> Express Delivery Surcharge</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Additional fee for 10-minute delivery</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input type="number" defaultValue={15} className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">Peak Hour Surge</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">Automatically apply 1.5x multiplier during high demand</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">Rain / Weather Surcharge</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">Flat ₹20 extra during emergency mode</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timings */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                  <Store size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">Business Hours</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Store Opening</label>
                <input type="time" defaultValue="06:00" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Store Closing</label>
                <input type="time" defaultValue="23:00" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Delivery Start</label>
                <input type="time" defaultValue="06:30" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Last Order Time</label>
                <input type="time" defaultValue="22:30" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50" />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
              <div className="mt-0.5"><Check size={14} className="text-emerald-500" /></div>
              <p className="text-xs font-medium text-slate-600">If store is closed, customers will automatically see "Store is currently closed" banner and checkout will be disabled.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm">
                  <Clock size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">Delivery Time Slots</h3>
              </div>
              <button className="text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '06:00 AM - 08:00 AM', max: 50, active: true },
                { time: '08:00 AM - 10:00 AM', max: 120, active: true },
                { time: '10:00 AM - 12:00 PM', max: 100, active: true },
                { time: '12:00 PM - 02:00 PM', max: 80, active: true },
                { time: '02:00 PM - 04:00 PM', max: 80, active: true },
                { time: '04:00 PM - 06:00 PM', max: 60, active: false },
              ].map((slot, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${slot.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={slot.active} />
                      <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                    <span className="text-sm font-bold text-slate-700">{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase">Max Orders</span>
                    <input type="number" defaultValue={slot.max} className="w-16 px-2 py-1 border border-slate-200 rounded-md text-xs font-bold text-center outline-none focus:ring-1 focus:ring-teal-500/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
