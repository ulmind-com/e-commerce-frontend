import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Clock, Truck, Plus, CheckCircle, Package } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-s2r8.onrender.com/api';

export const PromotionsTab = ({ token }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API}/coupons/promotions/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(res.data);
    } catch (e) {
      // Mock data if no promotions exist
      setPromotions([
        { id: '1', name: 'Free Delivery on Orders > ₹499', condition: 'order_value > 499', action: 'free_delivery', status: 'Active', icon: Truck, color: 'emerald' },
        { id: '2', name: 'Midnight Sale (12AM - 4AM)', condition: 'time between 00:00 and 04:00', action: '10% discount', status: 'Paused', icon: Clock, color: 'indigo' },
        { id: '3', name: 'Buy 2 Get 1 Free (Snacks)', condition: 'category = Snacks AND qty >= 2', action: 'free_product', status: 'Active', icon: Package, color: 'orange' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateColor = (color) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'indigo': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'orange': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Templates Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800">Auto-Apply Promotion Templates</h2>
            <p className="text-sm font-medium text-slate-500">Quickly launch proven campaign models. No coupon code needed by customer.</p>
          </div>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
            <Plus size={18} /> Custom Promotion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-orange-300 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 mb-2">Flash Sale Engine</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Automatically drop prices across the store or specific categories for a limited time.</p>
            <div className="text-sm font-bold text-orange-600 flex items-center gap-1">Use Template →</div>
          </div>
          
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-300 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 mb-2">Buy X Get Y (BOGO)</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Set up bundle offers, combo deals, or free gifts when customers buy specific quantities.</p>
            <div className="text-sm font-bold text-indigo-600 flex items-center gap-1">Use Template →</div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-emerald-300 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 mb-2">Smart Free Delivery</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Waive delivery fees based on cart value, customer zone, or loyalty status automatically.</p>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">Use Template →</div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Active Rules List */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-6">Active Auto-Promotions</h2>
        
        <div className="space-y-4">
          {promotions.map((promo, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTemplateColor(promo.color || 'orange')}`}>
                  {promo.icon ? <promo.icon size={20} /> : <Zap size={20} />}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800">{promo.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">IF {promo.condition}</span>
                    <span>→</span>
                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded">THEN {promo.action}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase ${promo.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {promo.status}
                  </span>
                  <button className={`w-12 h-6 rounded-full relative transition-colors ${promo.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${promo.status === 'Active' ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
