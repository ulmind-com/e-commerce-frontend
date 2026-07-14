import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowRight, Loader2, ArrowLeft, CheckCircle2, XCircle, MapPin, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

// Return Modal Component
const ReturnModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('Damaged Product');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Request Return</h2>
          <p className="text-sm text-slate-500 mb-6">We're sorry the item didn't work out. Let us know why you're returning it.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Return</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none appearance-none bg-white">
                <option>Damaged Product</option>
                <option>Wrong Product</option>
                <option>Expired Product</option>
                <option>Missing Item</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Please provide more details..." className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none resize-none"></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => onSubmit(reason, notes)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30">Submit Request</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const MyOrders = () => {
  const { token, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchOrders();
    const interval = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(interval);
  }, [token, navigate]);

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
        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          <CheckCircle2 size={14} /> Delivered
        </span>
      );
    }
    if (order.order_status === 'Cancelled') {
      const byWhom = order.cancelled_by === 'user' ? 'you' : order.cancelled_by === 'admin' ? 'Admin' : 'System';
      return (
        <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
          <XCircle size={14} /> Cancelled by {byWhom}
        </span>
      );
    }
    if (['Return Requested', 'Return Under Review', 'Return Approved', 'Refund Pending', 'Refunded'].includes(order.order_status)) {
      return (
        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
          <AlertCircle size={14} /> {order.order_status}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
        <Package size={14} /> {order.order_status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 flex justify-center">
        <Loader2 className="animate-spin text-primary mt-20" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-primary shadow-sm transition-colors border border-slate-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <Package size={64} className="mx-auto text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Looks like you haven't placed any orders. Start shopping to see your history here!</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm text-slate-700">{order._id}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order)}
                    <Link to={`/tracking/${order._id}`} className="flex items-center gap-1 text-sm font-bold text-primary hover:text-emerald-700 transition-colors">
                      Track <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link to={`/products/${item.product_id}`} className="font-semibold text-slate-800 hover:text-primary transition-colors">{item.title}</Link>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="font-bold text-slate-800">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                          {order.order_status === 'Delivered' && (
                            <Link to={`/products/${item.product_id}`} className="text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              Rate & Review
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 h-fit flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Total Amount</span>
                        <span className="font-bold text-slate-800">₹{order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-600">Payment</span>
                        <span className="text-sm font-semibold text-slate-800">{order.payment_mode}</span>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4 mb-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery To</p>
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{order.delivery_location?.label || 'Home'}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{order.delivery_location?.address || order.delivery_address || 'Address hidden'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-slate-200 pt-4 flex flex-col gap-2">
                      {['Pending', 'Order Placed'].includes(order.order_status) && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={actionLoading === order._id}
                          className="w-full py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      
                      {order.order_status === 'Delivered' && (
                        <button 
                          onClick={() => { setSelectedOrderForReturn(order._id); setReturnModalOpen(true); }}
                          disabled={actionLoading === order._id}
                          className="w-full py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
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
