import React, { useState } from 'react';
import { Mail, MessageSquare, Smartphone, Search, Plus, Edit3, Trash2, Eye } from 'lucide-react';

export const TemplatesTab = ({ token }) => {
  const [filter, setFilter] = useState('All');
  
  const templates = [
    { id: 1, name: 'Order Confirmation', channel: 'Email', type: 'Transactional', last_updated: '2 days ago' },
    { id: 2, name: 'Shipping Update', channel: 'SMS', type: 'Transactional', last_updated: '1 week ago' },
    { id: 3, name: 'Diwali Promo Offer', channel: 'WhatsApp', type: 'Marketing', last_updated: '1 month ago' },
    { id: 4, name: 'Abandoned Cart', channel: 'Email', type: 'Automated', last_updated: '3 days ago' },
    { id: 5, name: 'Birthday Coupon', channel: 'Email', type: 'Automated', last_updated: '2 weeks ago' },
    { id: 6, name: 'Payment Failed Retry', channel: 'WhatsApp', type: 'Transactional', last_updated: '5 days ago' },
  ];

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'Email': return <Mail size={16} className="text-indigo-500" />;
      case 'SMS': return <MessageSquare size={16} className="text-blue-500" />;
      case 'WhatsApp': return <Smartphone size={16} className="text-emerald-500" />;
      default: return <Mail size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Email', 'SMS', 'WhatsApp'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
            <Plus size={18} /> <span className="hidden sm:inline">New Template</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.filter(t => filter === 'All' || t.channel === filter).map(tpl => (
          <div key={tpl.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all p-6 group flex flex-col">
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {getChannelIcon(tpl.channel)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"><Eye size={14}/></button>
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"><Edit3 size={14}/></button>
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">{tpl.name}</h3>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-500">{tpl.channel} Template</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                 <span className="text-xs font-bold text-indigo-500">{tpl.type}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
              Last updated {tpl.last_updated}
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
};
