import React, { useState } from 'react';
import { 
  Settings, 
  BrainCircuit, 
  ShieldAlert, 
  Mail, 
  Gift, 
  Save, 
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const ReviewSettings = ({ token }) => {
  const [settings, setSettings] = useState({
    autoApprove5Star: true,
    aiSpamDetection: true,
    profanityFilter: true,
    minChars: 20,
    rewardPoints: 50,
    sendReminderEmails: true
  });

  const Toggle = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`text-2xl transition-colors ${checked ? 'text-emerald-500' : 'text-gray-300'}`}
    >
      {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
    </button>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Review Policies & Automation</h2>
            <p className="text-xs font-medium text-gray-500">Configure how reviews are collected, moderated, and rewarded.</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-200 flex items-center gap-2">
          <Save size={18} /> Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI & Automation */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <BrainCircuit size={18} className="text-indigo-500" /> AI & Automation
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">Auto-Approve 5-Star Reviews</p>
              <p className="text-xs text-gray-500">Bypass moderation for verified 5-star reviews without images.</p>
            </div>
            <Toggle checked={settings.autoApprove5Star} onChange={() => setSettings({...settings, autoApprove5Star: !settings.autoApprove5Star})} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">AI Spam & Fake Detection</p>
              <p className="text-xs text-gray-500">Automatically flag suspicious patterns (repeated IPs, bot-like text).</p>
            </div>
            <Toggle checked={settings.aiSpamDetection} onChange={() => setSettings({...settings, aiSpamDetection: !settings.aiSpamDetection})} />
          </div>
        </div>

        {/* Moderation Policies */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShieldAlert size={18} className="text-rose-500" /> Moderation Rules
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">Strict Profanity Filter</p>
              <p className="text-xs text-gray-500">Automatically reject or mask reviews containing offensive words.</p>
            </div>
            <Toggle checked={settings.profanityFilter} onChange={() => setSettings({...settings, profanityFilter: !settings.profanityFilter})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 text-sm">Minimum Review Length (Characters)</label>
            <input 
              type="number" 
              value={settings.minChars}
              onChange={(e) => setSettings({...settings, minChars: e.target.value})}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-900 focus:outline-none focus:border-amber-500 shadow-sm" 
            />
          </div>
        </div>

        {/* Customer Engagement */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Mail size={18} className="text-blue-500" /> Collection & Reminders
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">Post-Purchase Email Reminders</p>
              <p className="text-xs text-gray-500">Send an automated review request 3 days after delivery.</p>
            </div>
            <Toggle checked={settings.sendReminderEmails} onChange={() => setSettings({...settings, sendReminderEmails: !settings.sendReminderEmails})} />
          </div>
        </div>

        {/* Reward System */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Gift size={18} className="text-emerald-500" /> Reward System
          </h3>
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 text-sm">Loyalty Points per Verified Review</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={settings.rewardPoints}
                onChange={(e) => setSettings({...settings, rewardPoints: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-900 focus:outline-none focus:border-emerald-500 shadow-sm w-32" 
              />
              <span className="text-sm font-bold text-gray-500">Points</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Incentivize customers to leave detailed, verified reviews.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
