import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiSearch, FiChevronDown, FiHeart, FiTruck, FiShield, FiCheckCircle } from 'react-icons/fi';
import { FaListUl } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ onCartClick, onAuthClick, onLocationClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlist } = useWishlist();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="w-full transition-all duration-300 flex flex-col font-sans">
      {/* Tier 1: Top Bar */}
      <div className="bg-[#0b1b14] text-white text-xs py-2 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><FiTruck className="text-[#0c831f]" /> Free Delivery on Orders over PKR 2,000</div>
            <div className="flex items-center gap-2"><FiCheckCircle className="text-[#0c831f]" /> 7 Days Easy Return</div>
            <div className="flex items-center gap-2"><FiShield className="text-[#0c831f]" /> 100% Genuine Products</div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-emerald-400">Download App</Link>
            <Link to="/orders" className="hover:text-emerald-400">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Nav */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm">
                  <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-2xl tracking-tighter flex flex-col leading-none">
                  <span className="font-black text-[#0f5132]">One</span>
                  <span className="font-bold text-slate-800 text-sm">Basket</span>
                </span>
              </Link>
            </div>

            {/* Search Bar Section */}
            <div className="flex-1 max-w-3xl hidden lg:flex">
              <div className="relative flex items-center w-full h-12 rounded-full border-2 border-[#0c831f] overflow-hidden bg-white">
                <div className="flex items-center h-full px-4 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 cursor-pointer gap-2 shrink-0">
                  All Categories <FiChevronDown />
                </div>
                <input
                  className="flex-1 h-full px-4 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-500"
                  type="text"
                  placeholder='Search for products, brands and more...'
                />
                <button className="h-full px-6 bg-[#0c831f] text-white flex items-center justify-center hover:bg-[#0a6617] transition-colors">
                  <FiSearch className="text-lg" />
                </button>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center space-x-6 flex-shrink-0">
              
              <Link to="/profile/wishlist" className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#0c831f] transition-colors relative cursor-pointer">
                <FiHeart className="text-2xl" />
                <span className="text-[10px] font-medium uppercase">Wishlist</span>
                {wishlist?.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <button onClick={onCartClick} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#0c831f] transition-colors relative cursor-pointer">
                <FiShoppingCart className="text-2xl" />
                <span className="text-[10px] font-medium uppercase">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#0c831f] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative group flex items-center gap-2 cursor-pointer text-gray-600 hover:text-[#0c831f] transition-colors">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <FiUser className="text-2xl" />
                  )}
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-medium uppercase text-gray-500">Account</span>
                    <span className="text-xs font-bold">{user.full_name} <FiChevronDown className="inline" /></span>
                  </div>
                  <div className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-50 hidden group-hover:block border border-gray-100">
                    {user.role === 'admin' && (
                       <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                    )}
                    <Link to="/profile/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                  </div>
                </div>
              ) : (
                <button onClick={onAuthClick} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#0c831f] transition-colors">
                  <FiUser className="text-2xl" />
                  <span className="text-[10px] font-medium uppercase">Login / Sign up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Bottom Nav */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-12">
            
            <button className="bg-[#0b1b14] hover:bg-[#0f2c1f] text-white h-full px-6 flex items-center gap-3 font-semibold text-sm transition-colors rounded-t-sm">
              <FaListUl /> Shop by Categories <FiChevronDown className="ml-4" />
            </button>

            <ul className="flex items-center gap-8 text-sm font-semibold text-slate-700">
              <li><Link to="/" className="text-[#0c831f] border-b-2 border-[#0c831f] pb-3.5">Home</Link></li>
              <li><Link to="/deals" className="hover:text-[#0c831f] transition-colors">Deals</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-[#0c831f] transition-colors">New Arrivals</Link></li>
              <li><Link to="/best-sellers" className="hover:text-[#0c831f] transition-colors">Best Sellers</Link></li>
              <li><Link to="/flash-sale" className="hover:text-[#0c831f] transition-colors">Flash Sale</Link></li>
              <li><Link to="/store-locator" className="hover:text-[#0c831f] transition-colors">Store Locator</Link></li>
              <li><Link to="/blog" className="hover:text-[#0c831f] transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-[#0c831f] transition-colors">Contact Us</Link></li>
            </ul>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
