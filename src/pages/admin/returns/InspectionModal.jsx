import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InspectionModal({ isOpen, onClose, onSubmit }) {
  const [result, setResult] = useState('Pass');
  const [restock, setRestock] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              Quality Inspection
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Perform a quality check on the returned item. If it passes, you can approve it for restocking and proceed with the refund.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Inspection Result</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setResult('Pass')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${result === 'Pass' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className={`w-5 h-5 ${result === 'Pass' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={`font-semibold ${result === 'Pass' ? 'text-emerald-700' : 'text-slate-600'}`}>Pass</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-7">Product is in good condition.</p>
                </div>
                <div 
                  onClick={() => setResult('Fail')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${result === 'Fail' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-5 h-5 ${result === 'Fail' ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span className={`font-semibold ${result === 'Fail' ? 'text-rose-700' : 'text-slate-600'}`}>Fail</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-7">Product is damaged or unusable.</p>
                </div>
              </div>
            </div>

            {result === 'Pass' && (
              <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                <input 
                  type="checkbox" 
                  id="restock" 
                  checked={restock} 
                  onChange={(e) => setRestock(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="restock" className="text-sm font-medium text-slate-700">Auto-restock inventory</label>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Inspection Notes (Optional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                placeholder="E.g. Package was slightly dented but product is intact."
              ></textarea>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button 
              onClick={() => {
                onSubmit({ result, restock: result === 'Pass' ? restock : false, notes });
              }}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Submit Inspection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
