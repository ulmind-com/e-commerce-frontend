import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, Search, ShieldCheck } from 'lucide-react';

export const CODFraudAndApprovals = ({ config, updateConfig }) => {
  const [activeTab, setActiveTab] = useState('ai_fraud');

  // Mock data for review queue
  const [queue] = useState([
    { id: 'ORD-001', customer: 'Rahul Sharma', amount: 8500, risk: 'High', reason: 'High Value + New Customer', date: '2 mins ago' },
    { id: 'ORD-002', customer: 'Priya Singh', amount: 1200, risk: 'Medium', reason: 'Repeated Cancellation (History)', date: '15 mins ago' },
    { id: 'ORD-003', customer: 'Amit Patel', amount: 450, risk: 'High', reason: 'Suspicious IP Address', date: '1 hr ago' },
  ]);

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
          <button 
            onClick={() => setActiveTab('ai_fraud')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ai_fraud' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldAlert size={18} /> AI Fraud Detection
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'approvals' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck size={18} /> Manual Review Queue
            <span className="ml-1 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-md text-xs">3</span>
          </button>
        </div>

        <div className="p-6 md:p-8 flex-1">
          {activeTab === 'ai_fraud' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">AI Fraud Engine Configuration</h3>
                  <p className="text-slate-500 text-sm font-medium">Configure strictness and auto-block thresholds.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { id: 'block_high_return', title: 'High Return Customers', desc: 'Block users with > 30% return rate.' },
                  { id: 'block_repeated_cancel', title: 'Repeated Cancellation', desc: 'Flag 3+ cancels in last 30 days.' },
                  { id: 'block_duplicate_acc', title: 'Duplicate Accounts', desc: 'Device fingerprint & IP matching.' },
                  { id: 'block_suspicious_phone', title: 'Suspicious Phone', desc: 'Flag VOIP or inactive phone numbers.' },
                  { id: 'block_fake_address', title: 'Suspicious Address', desc: 'AI address validation & parsing.' },
                ].map((rule) => (
                  <div key={rule.id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all bg-slate-50 group">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-extrabold text-slate-800 text-sm">{rule.title}</p>
                      <button className="w-10 h-5 bg-indigo-500 rounded-full relative">
                        <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 left-6 transition-all"></div>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">{rule.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-rose-50 border border-rose-200 rounded-2xl p-6">
                <h4 className="font-black text-rose-800 mb-2 flex items-center gap-2">
                  <AlertTriangle size={18} /> High Risk Action
                </h4>
                <p className="text-sm text-rose-600 mb-4">What should happen when the AI Risk Score is High?</p>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white px-4 py-2 rounded-xl border border-rose-100 cursor-pointer">
                    <input type="radio" name="high_risk" className="text-rose-600 focus:ring-rose-500" />
                    Block COD Completely
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white px-4 py-2 rounded-xl border border-indigo-100 cursor-pointer border-2 border-indigo-500">
                    <input type="radio" name="high_risk" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                    Send to Manual Review
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Manual Review Queue</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>

              <div className="space-y-4">
                {queue.map(item => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 border border-rose-100 shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-extrabold text-slate-800">{item.id}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold">{item.date}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-600">{item.customer} • <span className="text-indigo-600">₹{item.amount}</span></p>
                        <p className="text-xs text-rose-500 font-bold mt-1">Reason: {item.reason}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 border border-emerald-200">
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button className="flex-1 md:flex-none px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-200">
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
