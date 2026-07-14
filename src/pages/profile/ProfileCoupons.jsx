import React from 'react';
import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileCoupons = () => {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Coupons & Offers</h1>
      </div>
      
      <div className="p-8 flex-1 bg-slate-50/50 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Ticket size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-3">No active coupons</h2>
        <p className="text-slate-500 mb-8 font-medium">You don't have any active coupons at the moment. Keep shopping to unlock exciting offers!</p>
        <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default ProfileCoupons;
