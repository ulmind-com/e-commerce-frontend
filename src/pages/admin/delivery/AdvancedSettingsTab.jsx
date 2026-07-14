import React, { useState } from 'react';
import { ShieldAlert, CloudRain, Bell, CalendarOff, Settings, Save, Check } from 'lucide-react';

export const AdvancedSettingsTab = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Advanced Settings</h2>
        <p className="text-slate-500 font-medium mt-1">Configure emergency controls, notifications, and holiday schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Emergency Mode */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm shadow-rose-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Emergency Controls</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CloudRain size={16} className="text-blue-500" /> Weather Emergency Mode
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">Pauses Express Delivery and adds ₹20 surcharge</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800 text-sm">Pause All Deliveries</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Temporarily stop accepting any new orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
            
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Emergency Banner Text (Visible to Customers)</label>
              <textarea 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 outline-none bg-slate-50"
                rows="2"
                placeholder="e.g., Deliveries are currently delayed due to heavy rain..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <Bell size={20} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Automated Notifications</h3>
          </div>

          <div className="space-y-3 relative z-10">
            {[
              { title: 'Order Assigned to Partner', sms: true, email: false, push: true },
              { title: 'Out for Delivery', sms: true, email: true, push: true },
              { title: 'Driver Arriving (1km away)', sms: false, email: false, push: true },
              { title: 'Order Delivered', sms: true, email: true, push: true },
            ].map((notif, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="font-bold text-slate-700 text-sm mb-2">{notif.title}</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked={notif.sms} className="rounded text-primary focus:ring-primary/20" /> SMS
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked={notif.email} className="rounded text-primary focus:ring-primary/20" /> Email
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked={notif.push} className="rounded text-primary focus:ring-primary/20" /> Push
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holiday Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                <CalendarOff size={20} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">Holiday Management</h3>
            </div>
            <button className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors">
              Add Holiday
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
            {[
              { name: 'Independence Day', date: 'Aug 15, 2026', type: 'National Holiday' },
              { name: 'Diwali', date: 'Nov 12, 2026', type: 'Festival (No Delivery)' },
              { name: 'Annual Maintenance', date: 'Jan 01, 2027', type: 'Internal' },
            ].map((holiday, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="font-bold text-slate-800 text-sm">{holiday.name}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">{holiday.date}</p>
                <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  {holiday.type}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
