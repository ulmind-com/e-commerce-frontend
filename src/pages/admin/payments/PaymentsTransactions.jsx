import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, ArrowUpDown, ChevronRight, X, Copy, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';

export const PaymentsTransactions = ({ orders, token }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);
  const [copied, setCopied] = useState('');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order._id.toLowerCase().includes(search.toLowerCase()) || 
        order.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase()) ||
        order.delivery_address?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.payment_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Completed</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pending</span>;
      case 'Failed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Failed</span>;
      case 'Refunded':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Refunded</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-full text-xs font-bold border border-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>{status}</span>;
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search TXN or Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-72 shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-medium text-slate-600"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <div className="w-full overflow-x-auto">
<table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="text-slate-300 mb-3" />
                      <p className="font-semibold text-slate-600">No transactions found</p>
                      <p className="text-sm">Adjust your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr 
                    key={order._id} 
                    onClick={() => setSelectedTx(order)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {order.razorpay_payment_id || order._id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                            {order.payment_mode}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 font-mono">Ord: {order._id.substring(order._id.length - 8)}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{order.delivery_location?.label || 'Direct Order'}</span>
                        <span className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]">{order.delivery_address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-800">₹{order.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 group-hover:text-primary transition-colors p-2 rounded-lg group-hover:bg-primary/10">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
</div>
        </div>
      </div>

      {/* Transaction Details Drawer */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0.1)' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-white z-[101] flex flex-col border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Transaction Details</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedTx._id}</p>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-100">
                  <div className="text-4xl font-black text-slate-800 mb-3">₹{selectedTx.total_amount.toFixed(2)}</div>
                  <StatusBadge status={selectedTx.payment_status} />
                  <div className="mt-4 text-sm text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Clock size={14} />
                    {new Date(selectedTx.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Method</span>
                      <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">{selectedTx.payment_mode}</span>
                    </div>
                    {selectedTx.razorpay_payment_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Razorpay Payment ID</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-slate-800">{selectedTx.razorpay_payment_id}</span>
                          <button onClick={() => handleCopy(selectedTx.razorpay_payment_id)} className="text-primary hover:text-primary-600 transition-colors">
                            {copied === selectedTx.razorpay_payment_id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedTx.razorpay_order_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Razorpay Order ID</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-slate-800">{selectedTx.razorpay_order_id}</span>
                          <button onClick={() => handleCopy(selectedTx.razorpay_order_id)} className="text-primary hover:text-primary-600 transition-colors">
                            {copied === selectedTx.razorpay_order_id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Details</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Delivery Address</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedTx.delivery_location?.label || 'Home'}</p>
                      <p className="text-sm text-slate-600 mt-1">{selectedTx.delivery_address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Breakdown</h3>
                  <div className="space-y-3">
                    {selectedTx.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                          <span className="font-medium text-slate-800">{item.quantity}x</span>
                          <span className="text-slate-600">{item.title || 'Product Name'}</span>
                        </div>
                        <span className="font-semibold text-slate-800">₹{((item.price_at_purchase || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm text-slate-500">Subtotal</span>
                      <span className="text-sm font-semibold text-slate-800">₹{(selectedTx.total_amount - 9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Handling Fee</span>
                      <span className="text-sm font-semibold text-slate-800">₹9.00</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-black text-slate-800 text-lg">₹{selectedTx.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline / Logs */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Timeline</h3>
                  <div className="relative pl-4 space-y-6 before:absolute before:inset-y-2 before:left-[7px] before:w-0.5 before:bg-slate-200">
                    <div className="relative">
                      <div className="absolute -left-[17.5px] top-1 w-3 h-3 bg-white border-2 border-primary rounded-full"></div>
                      <p className="text-sm font-bold text-slate-800">Order Created</p>
                      <p className="text-xs text-slate-500">{new Date(selectedTx.created_at).toLocaleString()}</p>
                    </div>
                    
                    {selectedTx.razorpay_order_id && (
                      <div className="relative">
                        <div className="absolute -left-[17.5px] top-1 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full"></div>
                        <p className="text-sm font-bold text-slate-800">Razorpay Order Generated</p>
                        <p className="text-xs text-slate-500">ID: {selectedTx.razorpay_order_id}</p>
                      </div>
                    )}
                    
                    {selectedTx.payment_status === 'Completed' && (
                      <div className="relative">
                        <div className="absolute -left-[17.5px] top-1 w-3 h-3 bg-emerald-500 border-2 border-white shadow-sm rounded-full"></div>
                        <p className="text-sm font-bold text-emerald-700">Payment Captured Successfully</p>
                        <p className="text-xs text-slate-500">Verified via Webhook / Signature</p>
                      </div>
                    )}

                    {selectedTx.payment_status === 'Failed' && (
                      <div className="relative">
                        <div className="absolute -left-[17.5px] top-1 w-3 h-3 bg-red-500 border-2 border-white shadow-sm rounded-full"></div>
                        <p className="text-sm font-bold text-red-700">Payment Failed</p>
                        <p className="text-xs text-slate-500">Customer cancelled or bank declined</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex gap-3">
                <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink size={16} /> View Invoice
                </button>
                {selectedTx.payment_status === 'Completed' && (
                  <button className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                    Issue Refund
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
