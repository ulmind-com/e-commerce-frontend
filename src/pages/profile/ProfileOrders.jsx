import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowRight, Loader2, CheckCircle2, XCircle, MapPin, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// Return Modal Component (Ultra Premium)
const ReturnModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('Damaged Product');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-100">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <Package size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Request Return</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">We're sorry the item didn't work out. Let us know why you're returning it so we can improve.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Return</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3.5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none bg-white text-slate-800 font-medium transition-all">
                <option>Damaged Product</option>
                <option>Wrong Product</option>
                <option>Expired Product</option>
                <option>Missing Item</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Please provide more details..." className="w-full border-2 border-slate-200 rounded-xl p-3.5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none text-slate-800 font-medium transition-all"></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => onSubmit(reason, notes)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30">Submit Request</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ProfileOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${API}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } });
      const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(orderId);
    try {
      await axios.put(`${API}/orders/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchOrders(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not cancel order");
    } finally {
      setActionLoading(null);
    }
  };

  const submitReturnRequest = async (reason, notes) => {
    if (!selectedOrderForReturn) return;
    setActionLoading(selectedOrderForReturn);
    try {
      await axios.put(`${API}/orders/${selectedOrderForReturn}/return`, { reason, notes }, { headers: { Authorization: `Bearer ${token}` } });
      setReturnModalOpen(false);
      setSelectedOrderForReturn(null);
      fetchOrders(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not request return");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (order) => {
    if (order.order_status === 'Delivered') {
      return (
        <span className="flex items-center gap-1.5 bg-[#ecfdf5] text-[#047857] px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#a7f3d0]">
          <CheckCircle2 size={14} /> Delivered
        </span>
      );
    }
    if (order.order_status === 'Cancelled') {
      return (
        <span className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200">
          <XCircle size={14} /> Cancelled
        </span>
      );
    }
    if (['Return Requested', 'Return Under Review', 'Return Approved', 'Refund Pending', 'Refunded'].includes(order.order_status)) {
      return (
        <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-purple-200">
          <AlertCircle size={14} /> {order.order_status}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-blue-200">
        <Package size={14} /> {order.order_status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Orders</h1>
        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg text-sm border border-emerald-100">{orders.length} Orders</span>
      </div>

      <div className="p-8 flex-1 bg-slate-50/50">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-20">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3">No orders yet</h2>
            <p className="text-slate-500 mb-8 font-medium">Looks like you haven't placed any orders. Start shopping to see your history here!</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all overflow-hidden group">
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 group-hover:bg-emerald-50/30 transition-colors">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="font-mono text-sm font-bold text-slate-700">{order._id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order)}
                    <Link to={`/orders/${order._id}/track`} className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors bg-emerald-50 px-4 py-2 rounded-xl">
                      Track <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-[#f8fafc] border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-2 group-hover:border-emerald-100 transition-colors">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <Package size={24} className="text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link to={`/products/${item.product_id}`} className="text-lg font-extrabold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1">{item.title}</Link>
                          <p className="text-sm text-slate-500 font-medium mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-xl font-black text-slate-800">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-100 h-fit flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-500">Total Amount</span>
                        <span className="text-xl font-black text-emerald-600">₹{order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold text-slate-500">Payment</span>
                        <span className="text-sm font-extrabold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">{order.payment_mode}</span>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-5 mb-2">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <MapPin size={16} className="text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-800 mb-0.5">{order.delivery_location?.label || 'Delivery Address'}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{order.delivery_location?.address || order.delivery_address || 'Address hidden'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-5 mt-5 flex flex-col gap-3">
                      {['Pending', 'Order Placed'].includes(order.order_status) && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={actionLoading === order._id}
                          className="w-full py-3 border-2 border-rose-200 text-rose-600 bg-transparent hover:bg-rose-50 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                          {actionLoading === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      
                      {order.order_status === 'Delivered' && (
                        <button 
                          onClick={() => { setSelectedOrderForReturn(order._id); setReturnModalOpen(true); }}
                          disabled={actionLoading === order._id}
                          className="w-full py-3 border-2 border-slate-200 text-slate-700 bg-white hover:border-emerald-500 hover:text-emerald-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ReturnModal 
          isOpen={returnModalOpen} 
          onClose={() => { setReturnModalOpen(false); setSelectedOrderForReturn(null); }} 
          onSubmit={submitReturnRequest}
        />
      </div>
    </div>
  );
};

export default ProfileOrders;
