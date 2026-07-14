import React, { useContext } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Heart, MapPin, Ticket, User, LogOut, ChevronRight, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileLayout = () => {
  const { user, logout, token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/" />;
  }

  const menuItems = [
    { name: 'My Orders', icon: ShoppingBag, path: '/profile/orders' },
    { name: 'Wishlist', icon: Heart, path: '/profile/wishlist' },
    { name: 'Coupons & Offers', icon: Ticket, path: '/profile/coupons' },
    { name: 'Saved Addresses', icon: MapPin, path: '/profile/addresses' },
    { name: 'Profile Settings', icon: Settings, path: '/profile/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0] sticky top-28">
            
            {/* User Profile Card */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#e2e8f0]">
              <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-2 border-[#10b981] flex items-center justify-center overflow-hidden shadow-inner">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-[#10b981]" />
                )}
              </div>
              <div>
                <p className="text-sm text-[#64748b] font-medium mb-0.5">Hello,</p>
                <h2 className="text-xl font-bold text-[#0f172a]">{user?.full_name || 'Premium User'}</h2>
              </div>
            </div>

            {/* Menu */}
            <div className="mt-6 flex flex-col gap-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-bold group ${
                      isActive 
                        ? 'bg-[#ecfdf5] text-[#047857]' 
                        : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              ))}

              <button
                onClick={logout}
                className="mt-4 flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-bold text-[#ef4444] hover:bg-[#fef2f2] group"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={20} className="shrink-0" />
                  <span>Log Out</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#e2e8f0] min-h-[500px] overflow-hidden relative">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default ProfileLayout;
