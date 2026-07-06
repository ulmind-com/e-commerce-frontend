import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

const PIPELINE_STATUSES = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export const OrdersTab = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/`, { headers: { Authorization: `Bearer ${token}` } });
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

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID & Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer / Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount & Payment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline Controller</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Delivery Partner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map(order => (
            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-xs font-mono font-bold text-slate-800">{order._id}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleString()}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-semibold text-slate-700">{order.delivery_location?.label || 'Address'}</div>
                <div className="text-xs text-slate-500 truncate max-w-[200px]">{order.delivery_location?.address || order.delivery_address || 'N/A'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-slate-800">₹{order.total_amount.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {order.payment_mode} • {order.payment_status}
                </div>
              </td>
              <td className="px-6 py-4">
                <select 
                  value={order.order_status} 
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className={`text-sm font-bold rounded-lg px-3 py-1.5 border focus:ring-2 focus:ring-primary/20 outline-none transition-colors ${
                    order.order_status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.order_status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {PIPELINE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
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
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No orders found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
