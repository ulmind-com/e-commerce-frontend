import React, { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  Mail, 
  Smartphone, 
  Clock, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  Save,
  MessageSquare,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WorkflowBuilderTab = ({ token }) => {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'trigger', title: 'Order Delivered', icon: CheckCircle2, color: 'emerald' },
    { id: 2, type: 'action', title: 'Send Thank You Email', icon: Mail, color: 'indigo' },
    { id: 3, type: 'delay', title: 'Wait 24 Hours', icon: Clock, color: 'amber' },
    { id: 4, type: 'action', title: 'Send Review Request (Push)', icon: BellRing, color: 'fuchsia' }
  ]);

  const [isAdding, setIsAdding] = useState(false);

  const removeNode = (id) => {
    if(id === 1) return; // Cant remove trigger easily in this mockup
    setNodes(nodes.filter(n => n.id !== id));
  };

  const addNode = (type, title, icon, color) => {
    setNodes([...nodes, { id: Date.now(), type, title, icon, color }]);
    setIsAdding(false);
  };

  const ActionSelector = () => (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 p-2 grid grid-cols-1 gap-1">
      <button onClick={() => addNode('action', 'Send Email', Mail, 'indigo')} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><Mail size={16} /></div>
        <div><p className="text-sm font-bold text-slate-800">Send Email</p><p className="text-[10px] text-slate-500">Send HTML email template</p></div>
      </button>
      <button onClick={() => addNode('action', 'Send WhatsApp', Smartphone, 'emerald')} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><Smartphone size={16} /></div>
        <div><p className="text-sm font-bold text-slate-800">Send WhatsApp</p><p className="text-[10px] text-slate-500">Send WhatsApp template</p></div>
      </button>
      <button onClick={() => addNode('action', 'Send SMS', MessageSquare, 'blue')} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><MessageSquare size={16} /></div>
        <div><p className="text-sm font-bold text-slate-800">Send SMS</p><p className="text-[10px] text-slate-500">Send text message</p></div>
      </button>
      <button onClick={() => addNode('delay', 'Time Delay', Clock, 'amber')} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors border-t border-slate-100 mt-1">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600"><Clock size={16} /></div>
        <div><p className="text-sm font-bold text-slate-800">Time Delay</p><p className="text-[10px] text-slate-500">Wait before next action</p></div>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
      
      {/* Workflow Canvas */}
      <div className="flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] bg-slate-50 border border-slate-200 rounded-3xl shadow-inner relative overflow-hidden flex flex-col">
        
        {/* Canvas Header */}
        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <GitBranch size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">Post-Purchase Review Flow</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status: Active</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md">
            <Save size={16} /> Save Workflow
          </button>
        </div>

        {/* Nodes Area */}
        <div className="flex-1 overflow-auto p-8 relative flex flex-col items-center">
          
          <div className="w-full max-w-md relative flex flex-col items-center pb-32">
            
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <React.Fragment key={node.id}>
                  {/* The Node */}
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`w-full bg-white border-2 rounded-2xl p-4 flex items-center gap-4 relative group hover:shadow-lg transition-all ${
                      node.color === 'emerald' ? 'border-emerald-200 hover:border-emerald-400' :
                      node.color === 'indigo' ? 'border-indigo-200 hover:border-indigo-400' :
                      node.color === 'fuchsia' ? 'border-fuchsia-200 hover:border-fuchsia-400' :
                      node.color === 'blue' ? 'border-blue-200 hover:border-blue-400' :
                      'border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      node.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                      node.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                      node.color === 'fuchsia' ? 'bg-fuchsia-100 text-fuchsia-600' :
                      node.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                        node.type === 'trigger' ? 'text-emerald-500' : node.type === 'delay' ? 'text-amber-500' : 'text-indigo-500'
                      }`}>{node.type}</p>
                      <h3 className="text-base font-bold text-slate-800">{node.title}</h3>
                    </div>
                    {node.type !== 'trigger' && (
                      <button 
                        onClick={() => removeNode(node.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all absolute -right-3 -top-3 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </motion.div>

                  {/* The connector line to the next node (or add button) */}
                  <div className="w-1 h-12 bg-slate-200 relative">
                    <div className="absolute inset-0 bg-indigo-500 origin-top animate-[grow_1s_ease-out]"></div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Add Node Button */}
            <div className="relative">
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="w-12 h-12 bg-white border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all z-10 relative"
              >
                <Plus size={24} />
              </button>
              
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ActionSelector />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col shrink-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-800">Node Properties</h2>
          <MoreVertical size={18} className="text-slate-400" />
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <Play size={18} className="text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-xs font-bold text-indigo-900 leading-relaxed">Select a node on the canvas to configure its properties, templates, and target audiences.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Available Triggers</label>
            <div className="space-y-2">
              {['Order Created', 'Order Shipped', 'Payment Failed', 'Product Back In Stock', 'Customer Birthday'].map(t => (
                <div key={t} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:border-indigo-300 cursor-pointer transition-colors">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
