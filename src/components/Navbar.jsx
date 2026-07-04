import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiSearch, FiChevronDown, FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ onCartClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlist } = useWishlist();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed w-full bg-white z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo Section */}
          <div className="flex items-center gap-8 flex-shrink-0">
            <Link to="/" className="flex items-center border-r border-gray-100 pr-8">
              <span className="text-3xl tracking-tighter flex items-center"><span className="font-extrabold text-[#172545]">One</span><span className="font-extrabold text-primary">Basket</span></span>
            </Link>
            
            {/* Location Section */}
            <div className="hidden md:flex flex-col cursor-pointer">
              <div className="font-bold text-sm text-gray-900">Delivery in 10 minutes</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                Durgapura, Jaipur, Rajasthan, In...
                <FiChevronDown className="text-gray-900" />
              </div>
            </div>
          </div>

          {/* Search Bar Section */}
          <div className="flex-1 max-w-3xl">
            <div className="relative group flex items-center w-full h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
              <div className="grid place-items-center h-full w-12 text-gray-400">
                <FiSearch className="text-lg" />
              </div>
              <input
                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent placeholder-gray-500"
                type="text"
                id="search"
                placeholder='Search "curd"'
              />
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-6 flex-shrink-0">

            <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-2 rounded-lg transition-colors">
              <FiHeart className="text-lg text-blue-500" fill="currentColor" />
              <span className="font-medium text-slate-700">Wishlist</span>
              {wishlist?.length > 0 && (
                <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-lg">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={onCartClick}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${
                cartItemCount > 0 
                  ? 'bg-[#0c831f] text-white' 
                  : 'bg-[#0c831f] text-white hover:bg-[#0b721b]'
              }`}
            >
              <FiShoppingCart className="text-lg" />
              {cartItemCount > 0 ? (
                <div className="flex flex-col text-left text-xs leading-tight">
                  <span>{cartItemCount} items</span>
                  <span>₹0</span>
                </div>
              ) : (
                <span>My Cart</span>
              )}
            </button>

            {user ? (
              <div className="relative group flex items-center space-x-2 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#10b981]/20 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <FiUser className="text-[#0f766e] text-lg" />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-800">{user.full_name}</span>
                <FiChevronDown className="text-slate-500" />
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-100">
                  {user.role === 'admin' && (
                     <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                  )}
                  <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                </div>
              </div>
            ) : (
              <button className="text-[15px] font-bold text-gray-700 hover:text-gray-900">Login</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
