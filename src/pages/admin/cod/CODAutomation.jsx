import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Calendar, AlertCircle } from 'lucide-react';

export const CODAutomation = ({ config, updateConfig }) => {
  
  const handleToggle = (key) => {
    updateConfig('automation_rules', key, !config.automation_rules[key]);
  };

  const rules = [
    { id: 'disable_on_store_closed', title: 'Disable if Store Closed', desc: 'Automatically pause COD when store is outside business hours.' },
    { id: 'disable_on_low_inventory', title: 'Disable on Low Inventory', desc: 'Pause COD if high demand risks stockouts.' },
    { id: 'disable_in_weather_emergency', title: 'Weather Emergency Pause', desc: 'Auto-disable COD if local weather API reports storms/heavy rain.' },
    { id: 'pause_on_peak_orders', title: 'Peak Order Limit Pause', desc: 'Pause COD if active order queue exceeds 100 orders.' },
    { id: 'disable_on_holidays', title: 'Disable on Holidays', desc: 'Auto-pause COD on days marked as holidays in the Schedule.' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Smart Automation Engine */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Smart Automation Engine</h3>
              <p className="text-slate-500 text-sm font-medium">Auto-pilot rules for COD management.</p>
            </div>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div>
                  <p className="font-bold text-slate-800">{rule.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{rule.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(rule.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${config.automation_rules[rule.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${config.automation_rules[rule.id] ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours & Schedules */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Business Hours</h3>
                <p className="text-slate-500 text-sm font-medium">Define store and COD active windows.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Open</label>
                <input 
                  type="time" 
                  value={config.business_hours.store_open}
                  onChange={(e) => updateConfig('business_hours', 'store_open', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Close</label>
                <input 
                  type="time" 
                  value={config.business_hours.store_close}
                  onChange={(e) => updateConfig('business_hours', 'store_close', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5 mt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">COD Start</label>
                <input 
                  type="time" 
                  value={config.business_hours.cod_start}
                  onChange={(e) => updateConfig('business_hours', 'cod_start', e.target.value)}
                  className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5 mt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">COD End</label>
                <input 
                  type="time" 
                  value={config.business_hours.cod_end}
                  onChange={(e) => updateConfig('business_hours', 'cod_end', e.target.value)}
                  className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
              <AlertCircle size={14} /> Outside COD hours, option will hide at checkout.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Schedule Manager</h3>
                  <p className="text-slate-500 text-sm font-medium">Holiday & special schedules.</p>
                </div>
              </div>
              <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200">
                + Add Holiday
              </button>
            </div>

            <div className="space-y-3">
              {config.schedules.holidays.map((date, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="font-bold text-slate-700">{date}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-600 rounded-md">STORE CLOSED</span>
                </div>
              ))}
              <div className="mt-2 text-xs font-medium text-slate-400 text-center">
                Uses the "Disable on Holidays" automation rule.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
