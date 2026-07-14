import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, User, CreditCard, Clock, Truck, ShieldCheck, AlertCircle, ShoppingBag, XCircle, CheckCircle2 } from 'lucide-react';

export default function ReturnDetailsDrawer({ request, onClose, onUpdateStatus, onOpenInspection, onOpenRefund }) {
  if (!request) return null;

  const isCancelled = request.status === 'Cancelled';

  // Different timelines based on whether it's a Return or a Cancellation
  const returnTimeline = [
    { status: 'Return Requested', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-100', glow: 'shadow-amber-500/20' },
    { status: 'Return Approved', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100', glow: 'shadow-emerald-500/20' },
    { status: 'Pickup Completed', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100', glow: 'shadow-blue-500/20' },
    { status: 'Quality Inspection', icon: Package, color: 'text-purple-500', bg: 'bg-purple-100', glow: 'shadow-purple-500/20' },
    { status: 'Refunded', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-100', glow: 'shadow-green-500/20' }
  ];

  const cancelTimeline = [
    { status: 'Order Placed', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100', glow: 'shadow-blue-500/20' },
    { status: 'Cancelled', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100', glow: 'shadow-rose-500/20' },
    { status: 'Refund Processed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100', glow: 'shadow-emerald-500/20' }
  ];

  const timelineEvents = isCancelled ? cancelTimeline : returnTimeline;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Return Requested':
      case 'Return Under Review':
      case 'Refund Pending':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30';
      case 'Return Approved':
      case 'Refunded':
      case 'Replacement Sent':
      case 'Exchanged':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30';
      case 'Return Rejected':
      case 'Cancelled':
        return 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-500/30';
      default:
        return 'bg-slate-500 shadow-slate-500/30';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-slate-50 h-full shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Header - Glassmorphism */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-slate-900"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Request Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-primary-200 text-sm font-medium">Order #{request.order_id ? request.order_id.slice(-8).toUpperCase() : 'N/A'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                  <span className="text-white/60 text-xs">{new Date(request.requested_date).toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full opacity-50 blur-2xl"></div>
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Current Status</p>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-lg ${getStatusColor(request.status)}`}>
                  {request.status}
                </div>
              </div>
              <div className="relative z-10 text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Total Amount</p>
                <div className="text-2xl font-extrabold text-slate-800">₹{request.total_amount?.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Customer Info</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">Customer ID</p>
                    <p className="font-medium text-slate-700">{request.customer_id?.slice(0,10)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">{isCancelled ? 'Cancellation Reason' : 'Return Reason'}</p>
                    <p className="font-medium text-rose-700 bg-rose-50 inline-block px-2.5 py-1 rounded-md border border-rose-100">{request.reason}</p>
                  </div>
                  {request.customer_notes && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-slate-600 italic text-sm leading-relaxed">"{request.customer_notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Order Details</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">Payment Method</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wide">
                        {request.payment_mode}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">Requested On</p>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(request.requested_date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                Items Details
              </h3>
              <div className="space-y-3">
                {request.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-slate-100 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-medium">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate">{item.title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5 font-medium">Qty: <span className="text-slate-700">{item.quantity}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-500">₹{item.price_at_purchase?.toLocaleString()}</p>
                      <p className="font-bold text-slate-800 mt-0.5">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Timeline Workflow */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                Workflow Timeline
              </h3>
              <div className="relative pl-6 space-y-8 before:absolute before:inset-y-3 before:left-[11px] before:w-[2px] before:bg-slate-100">
                {timelineEvents.map((event, idx) => {
                  let isCompleted = false;
                  if (isCancelled) {
                    isCompleted = ['Refund Processed', 'Refunded'].includes(request.status) || 
                                  (request.status === 'Cancelled' && idx <= 1) ||
                                  (idx === 0);
                  } else {
                    isCompleted = ['Refunded', 'Refund Processed'].includes(request.status) || 
                                  (request.status === 'Return Approved' && idx <= 1) ||
                                  (idx === 0);
                  }
                  
                  // For refunds
                  if (request.status === 'Refunded' || request.status === 'Refund Processed') {
                      isCompleted = true; // all completed
                  }
                  
                  const isCurrent = (request.status === event.status) || 
                                    (isCancelled && request.status === 'Refunded' && event.status === 'Refund Processed');

                  return (
                    <div key={event.status} className="relative group">
                      <div className={`absolute -left-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all duration-300 ${isCompleted || isCurrent ? `${event.bg} ${event.color} shadow-lg ${event.glow}` : 'bg-slate-100 text-slate-300'}`}>
                        <event.icon className={`w-3.5 h-3.5 ${isCurrent ? 'scale-110' : ''}`} />
                      </div>
                      <div className="pt-1.5">
                        <h4 className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{event.status}</h4>
                        {isCurrent && <p className="text-xs font-medium text-primary-500 mt-1">Current Stage</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Spacer for sticky footer */}
            <div className="h-4"></div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="shrink-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3 justify-end">
              {request.status === 'Return Requested' && (
                <>
                  <button onClick={() => onUpdateStatus(request.id, 'Return Rejected')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
                    Reject Request
                  </button>
                  <button onClick={() => onUpdateStatus(request.id, 'Return Approved')} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-500/20">
                    Approve Return
                  </button>
                </>
              )}
              {request.status === 'Return Approved' && (
                <button onClick={() => onOpenInspection(request)} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Start Quality Inspection
                </button>
              )}
              {(request.status === 'Return Approved' || request.status === 'Refund Pending' || request.status === 'Cancelled') && (
                <button onClick={() => onOpenRefund(request)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Process Refund
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
