import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Check, X, ArrowRight, Package } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const TodayOrdersTab = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayOrders();
    fetchPartners();
  }, []);

  const fetchTodayOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders?date=today`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${API}/admin/delivery-partners`, { headers: { Authorization: `Bearer ${token}` } });
      setPartners(res.data);
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, order_status: newStatus } : o));
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { console.error("Status update failed"); }
  };

  const handlePartnerAssign = async (orderId, partnerId) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, delivery_partner_id: partnerId } : o));
    try {
      await axios.put(`${API}/orders/${orderId}/assign`, { delivery_partner_id: partnerId }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { console.error("Partner assignment failed"); }
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'Preparing') return 'Out for Delivery';
    if (currentStatus === 'Out for Delivery') return 'Delivered';
    return null;
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Orders placed today</h2>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{orders.length} Total</span>
        </div>
        
        <div className="w-full overflow-x-auto">
<table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID & Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer / Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Workflow Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Delivery Partner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {orders.map(order => {
              const isPending = order.order_status === 'Pending' || order.order_status === 'Order Placed';
              const nextStatus = getNextStatus(order.order_status);
              
              return (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono font-bold text-slate-800">{order._id}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">{order.delivery_location?.label || 'Address'}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{order.delivery_location?.address || order.delivery_address || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">₹{order.total_amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">{order.payment_mode}</div>
                  </td>
                  <td className="px-6 py-4">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(order._id, 'Preparing')}
                          className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button 
                          onClick={() => handleStatusChange(order._id, 'Cancelled')}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : order.order_status === 'Cancelled' ? (
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">
                        Rejected / Cancelled
                      </span>
                    ) : order.order_status === 'Delivered' ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                        Delivered
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-primary">{order.order_status}</span>
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusChange(order._id, nextStatus)}
                            className="flex items-center w-max gap-1 bg-primary hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            Mark as {nextStatus} <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {['Out for Delivery', 'Preparing'].includes(order.order_status) ? (
                      <select
                        value={order.delivery_partner_id || ''}
                        onChange={(e) => handlePartnerAssign(order._id, e.target.value)}
                        className="text-xs rounded-lg px-2 py-1.5 border border-slate-200 focus:border-primary outline-none"
                      >
                        <option value="">Assign Partner...</option>
                        {partners.map(p => (
                          <option key={p._id} value={p._id}>{p.full_name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {order.delivery_partner_id ? 'Partner Assigned' : 'N/A'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <Package size={32} className="mx-auto mb-3 opacity-50" />
                  <p>No orders placed today.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
};
