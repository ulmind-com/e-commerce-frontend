import React, { useState } from 'react';
import { Search, Undo2, AlertCircle, FileText, CheckCircle2, XCircle, ArrowUpRight, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PaymentsRefunds = ({ orders = [] }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract orders that have a refund/return status
  const refundOrders = orders.filter(o => {
    const statuses = ['Refund Pending', 'Refunded', 'Return Requested', 'Return Under Review', 'Return Approved', 'Return Rejected', 'Cancelled'];
    // Only consider Cancelled if they actually paid online (needs refund)
    if (o.order_status === 'Cancelled' && o.payment_mode === 'COD') return false; 
    return statuses.includes(o.order_status) || o.payment_status === 'Refunded';
  });

  const pendingCount = refundOrders.filter(o => ['Refund Pending', 'Return Requested', 'Return Under Review'].includes(o.order_status)).length;

  const filteredOrders = refundOrders.filter(o => {
    if (activeFilter === 'Pending Review' && !['Refund Pending', 'Return Requested', 'Return Under Review'].includes(o.order_status)) return false;
    if (activeFilter === 'Processed' && !['Refunded', 'Return Approved'].includes(o.order_status) && o.payment_status !== 'Refunded') return false;
    if (activeFilter === 'Rejected' && !['Return Rejected'].includes(o.order_status)) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!o._id.toLowerCase().includes(search) && !o.user_id.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusBadge = (order) => {
    if (['Refunded', 'Return Approved'].includes(order.order_status) || order.payment_status === 'Refunded') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={12} /> Processed
        </span>
      );
    }
    if (['Return Rejected'].includes(order.order_status)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
        <AlertCircle size={12} /> Pending Review
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Undo2 className="text-primary" /> Refund Management
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Track, process, and analyze customer refunds</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary w-full sm:w-64 transition-all shadow-sm font-medium"
            />
          </div>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2">
            <FileText size={16} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 sm:px-6 border-b border-slate-100 overflow-x-auto hide-scrollbar">
        {['All', 'Pending Review', 'Processed', 'Rejected'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-3.5 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              activeFilter === tab 
                ? 'text-primary border-primary' 
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {tab === 'All' ? 'All Refunds' : tab}
            {tab === 'Pending Review' && <span className="ml-2 bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-[10px]">{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
              <Undo2 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800">No refunds found</h3>
            <p className="text-slate-500 mt-2 max-w-sm font-medium">
              You haven't processed any refunds matching this criteria yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <ArrowUpRight size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-slate-800">Order #{order._id.substring(0, 8)}...</span>
                          {getStatusBadge(order)}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{order.payment_mode}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Refund Amount</p>
                        <p className="font-extrabold text-slate-800 text-lg">₹{order.total_amount}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="ml-auto sm:ml-0 flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg text-sm font-bold transition-all border border-slate-200"
                      >
                        <Eye size={16} /> Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-100"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Refund Details</h3>
                  <p className="text-xs font-medium text-slate-500">Order #{selectedOrder._id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Status Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedOrder)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Refund Amount</p>
                    <p className="font-extrabold text-slate-800 text-xl">₹{selectedOrder.total_amount}</p>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Transaction Info</h4>
                  
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-slate-500 font-medium mb-0.5">Date Requested</p>
                      <p className="font-bold text-slate-800">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium mb-0.5">Payment Mode</p>
                      <p className="font-bold text-slate-800">{selectedOrder.payment_mode}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium mb-0.5">Customer ID</p>
                      <p className="font-bold text-slate-800">{selectedOrder?.user_id?.substring(0,8) || 'N/A'}...</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium mb-0.5">Delivery Status</p>
                      <p className="font-bold text-slate-800">{selectedOrder.order_status}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 mb-4">Affected Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-slate-200 rounded-md" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{item.title || item.product_id}</p>
                          <p className="text-xs font-medium text-slate-500">Qty: {item.quantity} × ₹{item.price_at_purchase}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-slate-800">₹{item.quantity * (item.price_at_purchase || 0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.return_details?.reason && (
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 mb-4">Return Reason</h4>
                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                      <p className="text-sm font-bold text-amber-800 mb-1">{selectedOrder.return_details.reason}</p>
                      {selectedOrder.return_details.customer_notes && (
                        <p className="text-sm font-medium text-amber-700/80 italic">"{selectedOrder.return_details.customer_notes}"</p>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
