import React, { useState } from 'react';
import { GitBranch, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const RulesTab = ({ token }) => {
  const [rules, setRules] = useState([
    {
      id: 1,
      conditions: [{ field: 'Order Amount', operator: '>', value: '1000' }],
      action: { type: 'Discount', value: '10%' }
    }
  ]);

  const addRule = () => {
    setRules([...rules, {
      id: Date.now(),
      conditions: [{ field: 'Order Amount', operator: '>', value: '' }],
      action: { type: 'Discount', value: '' }
    }]);
  };

  const addCondition = (ruleId) => {
    setRules(rules.map(r => {
      if (r.id === ruleId) {
        return { ...r, conditions: [...r.conditions, { field: 'Category', operator: '=', value: '' }] };
      }
      return r;
    }));
  };

  const removeRule = (ruleId) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <GitBranch size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Visual Rule Builder</h2>
            <p className="text-sm font-medium text-slate-500">Build complex IF/THEN promotion logics without coding.</p>
          </div>
        </div>
        <button onClick={addRule} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all">
          <Plus size={18} /> Add Rule Block
        </button>
      </div>

      <div className="space-y-6">
        {rules.map((rule, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={rule.id} 
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rule Block #{index + 1}</span>
              <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* IF Conditions */}
                <div className="flex-1 space-y-4 relative">
                  <div className="absolute left-[20px] top-8 bottom-0 w-0.5 bg-slate-200 z-0 hidden md:block"></div>
                  
                  {rule.conditions.map((cond, cIdx) => (
                    <div key={cIdx} className="relative z-10 flex flex-col md:flex-row md:items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md shrink-0">
                        {cIdx === 0 ? 'IF' : 'AND'}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                          <option>Order Amount</option>
                          <option>Category</option>
                          <option>Brand</option>
                          <option>Customer Type</option>
                          <option>Delivery Zone</option>
                          <option>Time of Day</option>
                        </select>
                        
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                          <option>&gt; (Greater than)</option>
                          <option>&lt; (Less than)</option>
                          <option>= (Equals)</option>
                          <option>Contains</option>
                        </select>
                        
                        <input 
                          type="text" 
                          placeholder="Value..." 
                          defaultValue={cond.value}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => addCondition(rule.id)}
                    className="ml-14 px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Condition
                  </button>
                </div>

                {/* THEN Action */}
                <div className="w-full md:w-[350px] shrink-0 bg-amber-50 rounded-2xl border border-amber-200 p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md shrink-0">
                      THEN
                    </div>
                    <p className="text-amber-800 font-extrabold text-sm uppercase tracking-wider">Apply Action</p>
                  </div>
                  
                  <div className="space-y-3">
                    <select className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 shadow-sm">
                      <option>Percentage Discount</option>
                      <option>Flat Discount</option>
                      <option>Free Delivery</option>
                      <option>Free Product</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="E.g. 10%" 
                      defaultValue={rule.action.value}
                      className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 shadow-sm"
                    />
                  </div>
                </div>

              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md">
                Save Rule Block
              </button>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
