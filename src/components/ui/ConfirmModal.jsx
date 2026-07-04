import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10"
        >
          <div className="p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 text-sm">{message}</p>
          </div>
          
          <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-sm ${
                isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
