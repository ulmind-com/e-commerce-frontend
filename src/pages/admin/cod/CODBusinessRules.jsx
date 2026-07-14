import React from 'react';
import { Settings2, Tag, IndianRupee, Users } from 'lucide-react';

export const CODBusinessRules = ({ config, updateConfig }) => {

  return (
    <div className="space-y-6">
      
      {/* Order Value Rules */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <IndianRupee size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Order Value Rules</h3>
            <p className="text-slate-500 text-sm font-medium">Configure cart value restrictions for COD.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" 
                value={config.order_value_rules.min_amount}
                onChange={(e) => updateConfig('order_value_rules', 'min_amount', parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" 
                value={config.order_value_rules.max_amount}
                onChange={(e) => updateConfig('order_value_rules', 'max_amount', parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Charge</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" 
                value={config.order_value_rules.base_charge}
                onChange={(e) => updateConfig('order_value_rules', 'base_charge', parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free COD Above</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" 
                value={config.order_value_rules.free_cod_above}
                onChange={(e) => updateConfig('order_value_rules', 'free_cod_above', parseInt(e.target.value))}
                className="w-full bg-emerald-50 border border-emerald-200 rounded-xl pl-8 pr-4 py-3 font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Rules */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Customer Rule Engine</h3>
              <p className="text-slate-500 text-sm font-medium">Control limits per customer profile.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">New Customer Limit</p>
                <p className="text-xs text-slate-500 font-medium">Max COD amount for first-time orders.</p>
              </div>
              <div className="w-32 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input 
                  type="number" 
                  value={config.customer_rules.new_customer_limit}
                  onChange={(e) => updateConfig('customer_rules', 'new_customer_limit', parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 font-bold text-sm text-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">Max Active Orders</p>
                <p className="text-xs text-slate-500 font-medium">Max concurrent COD orders per customer.</p>
              </div>
              <div className="w-24">
                <input 
                  type="number" 
                  value={config.customer_rules.max_orders_per_customer}
                  onChange={(e) => updateConfig('customer_rules', 'max_orders_per_customer', parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-sm text-slate-700 text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">High Return Threshold</p>
                <p className="text-xs text-slate-500 font-medium">Block COD if return rate exceeds %.</p>
              </div>
              <div className="w-24 relative">
                <input 
                  type="number" 
                  value={config.customer_rules.high_return_threshold_percent}
                  onChange={(e) => updateConfig('customer_rules', 'high_return_threshold_percent', parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg pr-7 pl-3 py-2 font-bold text-sm text-slate-700 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Rules */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Product Restrictions</h3>
              <p className="text-slate-500 text-sm font-medium">Disable COD for specific items.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Disabled Categories</label>
              <div className="flex flex-wrap gap-2">
                {config.product_rules.disabled_categories.map(cat => (
                  <span key={cat} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                    {cat} <button className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
                <button className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-purple-100 hover:bg-purple-100">+ Add Category</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Disabled Brands</label>
              <div className="flex flex-wrap gap-2">
                {config.product_rules.disabled_brands.map(brand => (
                  <span key={brand} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                    {brand} <button className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
                <button className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-purple-100 hover:bg-purple-100">+ Add Brand</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
